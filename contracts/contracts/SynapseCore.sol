// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {Math} from "@openzeppelin/contracts/utils/math/Math.sol";

import {PoolInfo, ExpertInfo} from "./Types.sol";

import {ExpertLib} from "./lib/ExpertLib.sol";
import {DepositLib} from "./lib/DepositLib.sol";
import {KnowledgeExpertPool} from './KnowledgeExpertPool.sol';

/// @notice core contract for the synapse protocol. Responsible for handing deposits and 
/// maintaining contribution tracking to the knowledge base
contract SynapseCore {
    using DepositLib for mapping(address => uint256);

    /// @notice the address of the native USDC implementation on-chain
    address immutable public USDC;

    /// @notice the wallet responsible for administering payouts to knowledge contributors
    address immutable public PAY_MASTER;

    /// @notice the wallet responsible for managing expert knowledge
    address immutable public KNOWLEDGE_MASTER;

    /// @notice the liquidity pool swap fee default amount
    uint256 immutable public SWAP_FEE;

    /// @notice tracks the deposit amounts available to pay for query requests by address
    /// @dev query requests come from API or MCP calls from models into the knowledge base. 
    /// once a call is requested the calculated fees are transferd to the knowledge contributors
    mapping(address => uint256) public apiCredits;

    /// @notice lookup contributors weights by expert
    mapping(bytes32 => mapping(address => uint256)) public expertContributorWeights;

    /// @notice lookup contributors by expert
    mapping(bytes32 => address[]) public expertKnowledgeContributors;

    /// @notice lookup total expert contribution weight by expert
    mapping(bytes32 => uint256) public expertKnowledgeTopicTotalWeight;

    /// @notice lookup of expert to total expert earnings
    mapping(bytes32 => uint256) public expertEarnings;

    /// @notice collection of all experts
    bytes32[] public experts;

    /// @notice lookup of knowledge contributors to pool index
    mapping(address => uint256) public expertPoolLookup;

    /// @notice list of all pools for knowledge expert contributors
    address[] public expertContributorPools;

    /// @notice Only the pay master is able to manage payments to contributors
    modifier onlyPayMaster(){
        require(msg.sender == PAY_MASTER, "unauthorized");
        
        _;
    }

    /// @notice Only the knowledge master can create new experts and add contributors
    modifier onlyKnowledgeMaster(){
        require(msg.sender == KNOWLEDGE_MASTER, "unauthorized");
        
        _;
    }

    /// @notice the requestor does not have enough balance to pay the fee
    error InsufficentBalanceToPayFees();

    /// @notice the given creator already has a liquidity pool instance
    error AlreadyKnown();

    /// @notice event for when a payout is sent to a contributor
    /// @param expert the id of the expert
    /// @param contributor the receiver of the payout
    /// @param caller the caller of the API or  MCP
    /// @param amount the amount of the payout
    event Payout(bytes32 indexed expert, address indexed caller, address indexed contributor, uint256 amount);

    /**
     * @notice contract constructor
     * @param _usdc address of the native USDC contract on the chain
     * @param _payMaster the wallet responsible for paying out knowledge contributors
     * @param _knowledgeMaster the wallet responsible for managing expert knowledge
     * @param _fee the default swap fee for new liquidity pools
     */
    constructor(
        address _usdc,
        address _payMaster,
        address _knowledgeMaster,
        uint256 _fee
    ){
        USDC = _usdc;
        PAY_MASTER = _payMaster;
        KNOWLEDGE_MASTER = _knowledgeMaster;
        SWAP_FEE = _fee;

        expertContributorPools.push(address(0x0));
    }

    /******************************************************************
     * Public Views
     *******************************************************************/
    
    /// @notice get pool information for all created pools
    function getPoolInfos(

    ) public view returns (PoolInfo[] memory infos){
        address[] memory _pools = expertContributorPools;

        infos = new PoolInfo[](_pools.length);

        for(uint256 i = 0; i < _pools.length; i++){
            infos[i] = getPoolInfo(_pools[i]);
        }

        return infos;
    }

    /**
     * @notice get pool information for the given pool
     * @param pool the address of the pool information to get
     */
    function getPoolInfo(
        address pool
    ) public view returns (PoolInfo memory info) {
        KnowledgeExpertPool _pool = KnowledgeExpertPool(pool);

        uint256 marketCap = _pool.marketCap();
        uint256 earnings = _pool.totalEarnings();
        uint256 quote = _pool.quote(); 
        address contributor = _pool.CONTRIBUTOR();
        uint256 swapFeesCollected = _pool.swapFeesCollected();  

        info = PoolInfo(
            pool,
            contributor,
            marketCap,
            quote,
            earnings,
            swapFeesCollected
        );
    }

    /**
     * @notice gets contributor info and lifetime earnings of the given expert
     * @param id the id of the expert to get
     */
    function getExpertInfo(
        bytes32 id
    ) public view returns (ExpertInfo memory info) {
        // store lifetime earnings amount for the expert
        uint256 lifetimeEarnings = expertEarnings[id];

        // get the collection of liquidity pools contributing to the
        // knowledge base of the given expert
        address[] memory contributors = ExpertLib.getExpertContributors(expertKnowledgeContributors, id);
        PoolInfo[] memory pools = new PoolInfo[](contributors.length);

        for(uint256 i = 0; i < contributors.length; i++){
            pools[i] = getPoolInfo(contributors[i]);
        }

        // create and return the expert info
        info = ExpertInfo({
            id: id,
            lifetimeEarnings: lifetimeEarnings,
            contributors: pools
        });
    }


    /******************************************************************
     * API Account Management Methods
     *******************************************************************/

    /**
     * @notice deposit usdc for future payments for API calls
     * @param amount the amount to deposit into the contract
     */
    function depositAPICredits(
        uint256 amount
    ) public {
        apiCredits.deposit(USDC, amount);
    }

    /**
     * @notice withdraw deposited USDC from contract
     * @param amount the amount to withdraw
     */
    function withdrawAPICredits(
        uint256 amount
    ) public {
        apiCredits.transfer(USDC, msg.sender, msg.sender, amount);
    }


    /******************************************************************
     * Knowledge Contributor Methods
     *******************************************************************/

    /**
     * @notice create a new contributor that is eligible for payouts when surveys are used in AI responses
     * @param initialPoolLiquidity the amount to be deposited by the contributor
     * @dev the user will always get 5% of the tokens regardless of the contribution amount. The contribution amount
     * dictates the initial token marketcap and dictates potential earnings. Lower market cap creates more slippage and lower 
     * trade volumes when users trade tokens and thus less potential fee revenue for the contributor. This mechanism should 
     * incentivize the creator to balance input amount with their conviction as a way to reduce spam
     */
    function createContributor(
        uint256 initialPoolLiquidity
    ) public {
        // ensure the contributor has not already been initialized
        uint256 poolId = expertPoolLookup[msg.sender];

        if(poolId != 0){
            revert AlreadyKnown();
        }

        // transfer funds to this contract
        IERC20(USDC).transferFrom(msg.sender, address(this), initialPoolLiquidity);

        // create the new liquidity pool
        KnowledgeExpertPool newPool = new KnowledgeExpertPool(msg.sender, address(this), USDC, SWAP_FEE);

        // update pool lookups
        expertPoolLookup[msg.sender] = expertContributorPools.length;

        expertContributorPools.push(address(newPool));

        // allow the spend allowance for the pool on USDC tokens
        IERC20(USDC).approve(address(newPool), initialPoolLiquidity);

        // initialize the pool
        newPool.init(initialPoolLiquidity);

        // remove token spend approval
        IERC20(USDC).approve(address(newPool), 0);
    }

    /**
     * @notice register a given contribution to an expert model
     * @param id the expert
     * @param contributor the address of the contributor to the model
     * @param weight the assigned weight of the contributions
     * @dev the weight assigned will detemine the payout amount for the contributor. Higher weight = higher value responses and higher payouts.
     * This weighting system is a way to reduce potential spam
     */
    function contributeExpertKnowledge(
        bytes32 id,
        address contributor,
        uint256 weight
    ) public onlyKnowledgeMaster {
        // get the pool for the given contributor
        uint256 poolId = expertPoolLookup[contributor];
        address pool = expertContributorPools[poolId];

        // add the expert to the list of experts if it's new
        if(expertKnowledgeContributors[id].length == 0){
            experts.push(id);
        }

        ExpertLib.contributeExpertKnowledge(expertContributorWeights, expertKnowledgeContributors, expertKnowledgeTopicTotalWeight, id, pool, weight);
    }


    /******************************************************************
     * Payment Methods
     *******************************************************************/
    
    /**
     * @notice pay knowledge contributors when knowledge is used via API or MCP endpoints
     * @param id the expert used by the caller
     * @param fee the fee to be charged for access to expert knowledge
     * @param caller the caller who used the knoweldge
     */
    function pay(
        bytes32 id, 
        uint256 fee, 
        address caller
    ) public onlyPayMaster {
        // ensure the caller has a sufficent balance to pay the fee
        uint256 balance = apiCredits.getBalance(caller);

        if(balance < fee){
            revert InsufficentBalanceToPayFees();
        }

        // log the revenue for the expert
        expertEarnings[id] += fee;

        // for each contributor determine the percentage of their payout
        // and send funds directly to the contributor
        uint256 totalContributionWeight = ExpertLib.getTotalContributionWeight(expertKnowledgeTopicTotalWeight, id);
        address[] memory expertContributors =  ExpertLib.getExpertContributors(expertKnowledgeContributors, id);

        for(uint256 i = 0; i < expertContributors.length; i++){
            address contributorPool = expertContributors[i];

            // calculate the payout amount
            uint256 amount = ExpertLib.getExpertContributionWeight(expertContributorWeights, id, contributorPool); 
            uint256 payoutPercentage = Math.mulDiv(amount, 10**18, totalContributionWeight);
            uint256 payoutAmount = Math.mulDiv(fee, payoutPercentage, 10**18);

            // send payout to the contributor pool
            apiCredits.transfer(USDC, caller, contributorPool, payoutAmount);

            // process the payout
            KnowledgeExpertPool(contributorPool).payoutReceived(payoutAmount);

            // log the payout event
            emit Payout(id, caller, contributorPool, payoutAmount);
        }
    }
}