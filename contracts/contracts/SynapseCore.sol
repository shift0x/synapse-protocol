// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {Math} from "@openzeppelin/contracts/utils/math/Math.sol";

import {ExpertInfo, SynapseAPIUser, PoolInfo} from "./Types.sol";

import {ExpertLib} from "./lib/ExpertLib.sol";
import {UserLib} from "./lib/UserLib.sol";
import {LiquidityPoolLib} from "./lib/LiquidityPoolLib.sol";

import {IPoolFactory} from './interfaces/IPoolFactory.sol';
import {IKnowledgeExpertPool} from './interfaces/IKnowledgeExpertPool.sol';


/// @notice core contract for the synapse protocol. Responsible for handing deposits and 
/// maintaining contribution tracking to the knowledge base
contract SynapseCore {
    using UserLib for mapping(address => SynapseAPIUser);
    using ExpertLib for ExpertInfo[];
    using LiquidityPoolLib for address[];

    /// @notice the address of the native USDC implementation on-chain
    address immutable public USDC;

    /// @notice the wallet responsible for administering payouts to knowledge contributors
    address immutable public PAY_MASTER;

    /// @notice the wallet responsible for managing expert knowledge
    address immutable public KNOWLEDGE_MASTER;

    /// @notice the liquidity pool swap fee default amount
    uint256 immutable public SWAP_FEE;

    /// @notice the address of the liquidity pool factory
    IPoolFactory immutable public POOL_FACTORY;

    /// @notice tracks the deposit amounts available to pay for query requests by address
    /// @dev query requests come from API or MCP calls from models into the knowledge base. 
    /// once a call is requested the calculated fees are transferd to the knowledge contributors
    mapping(address => SynapseAPIUser) public apiAccounts;

    /// @notice collection of all experts
    ExpertInfo[] public experts;

    /// @notice list of all pools for knowledge expert contributors
    address[] public pools;

    /// @notice mapping of registered contributors
    mapping(address => bool) public isRegisteredContributor;

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

    /// @notice the contributor attempting to add knowledge is not registered
    error ContributorNotRegistered();

    /// @notice pool is already contributing to expert
    error PoolIsAlreadyContributingToExpert();

    /// @notice event for when a payout is sent to a contributor
    /// @param expert the id of the expert
    /// @param contributor the receiver of the payout
    /// @param caller the caller of the API or  MCP
    /// @param amount the amount of the payout
    event Payout(uint256 indexed expert, address indexed caller, address indexed contributor, uint256 amount);

    /// @notice event for when a new pool is created for a contributor
    /// @param pool the new pool contract address
    /// @param contributor the knowledge contributor address
    event PoolCreated(address pool, address contributor);

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
        uint256 _fee,
        address _poolFactory
    ){
        USDC = _usdc;
        PAY_MASTER = _payMaster;
        KNOWLEDGE_MASTER = _knowledgeMaster;
        SWAP_FEE = _fee;
        POOL_FACTORY = IPoolFactory(_poolFactory); 

        experts.push(ExpertInfo(0, new address[](0), 0, 0));
        pools.push(address(0x0));
    }

    /******************************************************************
     * Public Views
     *******************************************************************/
    
    /**
     * @notice get the pool information for the given id
     * @param id the unique identifier of the pool
     */ 
    function getPoolInfoById(
        uint256 id
    ) public view returns (PoolInfo memory) {
        return pools.getPoolInfoById(id);
    }

    /// @notice get pool information for all created pools
    function getPoolInfos(

    ) public view returns (PoolInfo[] memory infos){
        return pools.getPoolInfos();
    }

    /**
     * @notice gets contributor info and lifetime earnings of the given expert
     * @param id the id of the expert to get
     */
    function getExpertInfo(
        uint256 id
    ) public view returns (ExpertInfo memory) {
        return experts[id];
    }

    /// @notice get all experts
    function getExpertInfos(

    ) public view returns (ExpertInfo[] memory) {
        // return all the experts in the system omitting the first
        // entry which is a system record to ensure the ids start at 1 and line up with indexes
        ExpertInfo[] memory _experts = new ExpertInfo[](experts.length-1);

        for(uint256 i = 1; i < experts.length; i++){
            _experts[i-1] = experts[i];
        }

        return _experts;
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
        apiAccounts.deposit(USDC, amount);
    }

    /**
     * @notice withdraw deposited USDC from contract
     * @param amount the amount to withdraw
     */
    function withdrawAPICredits(
        uint256 amount
    ) public {
        apiAccounts.transfer(USDC, msg.sender, msg.sender, amount);
    }

    /**
     * @notice get the credit balance of the requested account
     * @param owner the account to get the balance for
     */
    function getAPIAccount(
        address owner
    ) public view returns (SynapseAPIUser memory) {
        return apiAccounts.getAccount(owner);
    }


    /******************************************************************
     * Knowledge Contributor Methods
     *******************************************************************/

    /**
     * @notice create a new contributor that is eligible for payouts when surveys are used in AI responses
     * @param displayName the name of the contributor liquidity pool
     * @param initialPoolLiquidity the amount to be deposited by the contributor
     * @dev the user will always get 5% of the tokens regardless of the contribution amount. The contribution amount
     * dictates the initial token marketcap and dictates potential earnings. Lower market cap creates more slippage and lower 
     * trade volumes when users trade tokens and thus less potential fee revenue for the contributor. This mechanism should 
     * incentivize the creator to balance input amount with their conviction as a way to reduce spam
     */
    function createContributor(
        string memory displayName,
        uint256 initialPoolLiquidity
    ) public {
        // ensure the contributor has not already been initialized
        bool isRegistered = isRegisteredContributor[msg.sender];

        if(isRegistered){
            revert AlreadyKnown();
        }

        // mark the contributor as registered
        isRegisteredContributor[msg.sender] = true;

        // transfer funds to this contract
        IERC20(USDC).transferFrom(msg.sender, address(this), initialPoolLiquidity);

        // create the new liquidity pool
        uint256 id = pools.length;

        IKnowledgeExpertPool newPool = IKnowledgeExpertPool(POOL_FACTORY.createPool(id, displayName, msg.sender, USDC, SWAP_FEE, address(this)));

        // allow the spend allowance for the pool on USDC tokens
        IERC20(USDC).approve(address(newPool), initialPoolLiquidity);

        // initialize the pool
        newPool.init(initialPoolLiquidity);

        // remove token spend approval
        IERC20(USDC).approve(address(newPool), 0);

         // create a liquidity pool info
        pools.push(address(newPool));

        emit PoolCreated(address(newPool), msg.sender);
    }

    /**
     * @notice register a given contribution to an expert model
     * @param expertId the expert
     * @param poolAddress the address of the contributor to the model
     * @param weight the assigned weight of the contributions
     * @dev the weight assigned will detemine the payout amount for the contributor. 
     * Higher weight = higher value responses and higher payouts.This weighting system is a way to reduce potential spam
     */
    function contributeExpertKnowledge(
        uint256 expertId,
        address poolAddress,
        uint256 weight
    ) public onlyKnowledgeMaster {
        // ensure that the contributor has not already been associated with the expert
        bool isPoolContributingToExpert = IKnowledgeExpertPool(poolAddress).isContributingToExpert(expertId);

        if(isPoolContributingToExpert){
            revert PoolIsAlreadyContributingToExpert();
        }

        // add the contributor to the expert 
        uint256 storedExpertId = experts.addExpertContributor(expertId, poolAddress, weight);

        // register the expert and weight with the liquidity pool
        IKnowledgeExpertPool(poolAddress).storeExpertInformation(storedExpertId, weight);
    }


    /******************************************************************
     * Payment Methods
     *******************************************************************/
    
    /**
     * @notice pay knowledge contributors when knowledge is used via API or MCP endpoints
     * @param expertId the expert used by the caller
     * @param fee the fee to be charged for access to expert knowledge
     * @param caller the caller who used the knoweldge
     */
    function pay(
        uint256 expertId, 
        uint256 fee, 
        address caller
    ) public onlyPayMaster {
        // ensure the caller has a sufficent balance to pay the fee
        uint256 balance = apiAccounts.getBalance(caller);

        if(balance < fee){
            revert InsufficentBalanceToPayFees();
        }

        // log the revenue for the expert
        experts.feeCollected(expertId, fee);

        // get the information for the expert
        ExpertInfo memory expert = experts.getExpert(expertId);

        // for each contributor determine the percentage of their payout
        // and send funds directly to the contributor
        for(uint256 i = 0; i < expert.contributors.length; i++){
            IKnowledgeExpertPool pool = IKnowledgeExpertPool(expert.contributors[i]);

            // calculate the payout amount
            uint256 weight = pool.getExpertContributionWeight(expertId);
            uint256 payoutPercentage = Math.mulDiv(weight, 10**18, expert.totalWeight);
            uint256 payoutAmount = Math.mulDiv(fee, payoutPercentage, 10**18);

            // send payout to the contributor pool
            apiAccounts.transfer(USDC, caller, address(pool), payoutAmount);

            // process the payout
            pool.payoutReceived(payoutAmount);

            // log the payout event
            emit Payout(expertId, caller, address(pool), payoutAmount);
        }

        apiAccounts.addAPIUsage(caller, fee);
    }
}