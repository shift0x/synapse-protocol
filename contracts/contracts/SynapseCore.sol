// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SubjectMatterExpert} from "./Types.sol";

/// @notice core contract for the synapse protocol. Responsible for handing deposits and 
/// maintaining contribution tracking to the knowledge base
contract SynapseCore {

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

    /// @notice lookup for experts by hash
    mapping(bytes32 => SubjectMatterExpert) public experts;

    /// @notice The depositor does not have enough tokens for the requested withdrawl
    error InsufficentTokenBalanceForWithdrawl();

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
    function deposit(uint256 amount) public {
        // transfer the deposit amount into the contract
        IERC20(USDC).transferFrom(msg.sender, address(this), amount);

        // credit the user balance with the inputted amount
        deposits[msg.sender] += amount;
    }

    /**
     * @notice withdraw deposited USDC from contract
     * @param amount the amount to withdraw
     */
    function withdraw(
        uint256 amount
    ) public {
        // ensure the caller has enough deposited balance to withdraw
        uint256 availableBalance = deposits[msg.sender];

        if(availableBalance < amount){
            revert InsufficentTokenBalanceForWithdrawl(); 
        }

        // decrement token balance
        deposits[msg.sender] -= amount;

        // sender funds to sender
        IERC20(USDC).transfer(msg.sender, amount);
    }

    /**
     * @notice pay knowledge contributors when knowledge is used via API or MCP endpoints
     * @param ids the experts used by the caller
     * @param fee the fee to be charged for access to expert knowledge
     * @param caller the caller who used the knoweldge
     */
    function pay(
        bytes32[] memory ids, 
        uint256 fee, 
        address caller
    ) public onlyPayMaster {

    }

    /**
     * @notice create a new expert -- available for contributions
     * @param id the id of the expert
     */
    function createExpert(
        bytes32 id
    ) public onlyKnowledgeMaster {

    }





}