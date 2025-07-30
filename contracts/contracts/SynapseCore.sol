// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {Math} from "@openzeppelin/contracts/utils/math/Math.sol";

import {SubjectMatterExpert} from "./Types.sol";

import {ExpertLib} from "./lib/ExpertLib.sol";
import {DepositLib} from "./lib/DepositLib.sol";

/// @notice core contract for the synapse protocol. Responsible for handing deposits and 
/// maintaining contribution tracking to the knowledge base
contract SynapseCore {
    using ExpertLib for mapping(bytes32 => mapping(address => uint256));
    using ExpertLib for mapping(bytes32 => address[]);
    using ExpertLib for mapping(bytes32 => uint256);
    using DepositLib for mapping(address => uint256);

    /// @notice the address of the native USDC implementation on-chain
    address immutable public USDC;

    /// @notice the wallet responsible for administering payouts to knowledge contributors
    address immutable public PayMaster;

    /// @notice the wallet responsible for managing expert knowledge
    address immutable public KnowledgeMaster;

    /// @notice tracks the deposit amounts available to pay for query requests by address
    /// @dev query requests come from API or MCP calls from models into the knowledge base. 
    /// once a call is requested the calculated fees are transferd to the knowledge contributors
    mapping(address => uint256) public deposits;

    /// @notice lookup contributors weights by expert
    mapping(bytes32 => mapping(address => uint256)) public experts;

    /// @notice lookup contributors by expert
    mapping(bytes32 => address[]) public contributors;

    /// @notice lookup total expert contribution weight by expert
    mapping(bytes32 => uint256) public weights;

    /// @notice Only the pay master is able to manage payments to contributors
    modifier onlyPayMaster(){
        require(msg.sender == PayMaster, "unauthorized");
        
        _;
    }

    /// @notice Only the knowledge master can create new experts and add contributors
    modifier onlyKnowledgeMaster(){
        require(msg.sender == KnowledgeMaster, "unauthorized");
        
        _;
    }

    /// @notice the requestor does not have enough balance to pay the fee
    error InsufficentBalanceToPayFees();

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
     */
    constructor(
        address _usdc,
        address _payMaster,
        address _knowledgeMaster
    ){
        USDC = _usdc;
        PayMaster = _payMaster;
        KnowledgeMaster = _knowledgeMaster;
    }

    /**
     * @notice deposit usdc for future payments for API calls
     * @param amount the amount to deposit into the contract
     */
    function deposit(
        uint256 amount
    ) public {
        deposits.deposit(USDC, amount);
    }

    /**
     * @notice withdraw deposited USDC from contract
     * @param amount the amount to withdraw
     */
    function withdraw(
        uint256 amount
    ) public {
        deposits.transfer(USDC, msg.sender, amount);
    }

    /**
     * @notice register a given contribution to an expert model
     * @param id the expert
     * @param contributor the address of the contributor to the model
     * @param weight the assigned weight of the contributions
     * @dev the weight assigned will detemine the payout amount for the contributor. Higher weight = higher payout
     */
    function addContributor(
        bytes32 id,
        address contributor,
        uint256 weight
    ) public onlyKnowledgeMaster {
        ExpertLib.addExpertContributor(experts, contributors, weights, id, contributor, weight);
    }

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
        uint256 balance = deposits.getBalance(caller);

        if(balance < fee){
            revert InsufficentBalanceToPayFees();
        }

        // for each contributor determine the percentage of their payout
        // and send funds directly to the contributor
        uint256 totalContributionWeight = weights.getTotalContributionWeight(id);
        address[] memory expertContributors = contributors.getExpertContributors(id);

        for(uint256 i = 0; i < expertContributors.length; i++){
            address contributor = expertContributors[i];

            // calculate the payout amount
            uint256 amount = experts.getExpertContributionWeight(id, contributor);
            uint256 payoutPercentage = Math.mulDiv(amount, 10**18, totalContributionWeight);
            uint256 payoutAmount = Math.mulDiv(fee, payoutPercentage, 10**18);

            // send payout to the contributor
            deposits.transfer(USDC, contributor, payoutAmount);

            // log the payout event
            emit Payout(id, caller, contributor, payoutAmount);
        }
    }
}