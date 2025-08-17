// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

import {SynapseAPIUser} from '../Types.sol';

/// @notice library reponsible for handing user deposits
library UserLib {

    /// @notice The depositor does not have enough tokens for the requested withdrawl
    error InsufficentTokenBalanceForWithdrawl();


    /**
     * @notice increment the lifetime usage amount for the given API user
     * @param account the address of the user
     * @param amount the amount of credits used
     */
    function addAPIUsage(
        mapping(address => SynapseAPIUser) storage self,
        address account,
        uint256 amount
    ) internal {
        self[account].lifetimeUsage += amount;
    }

    /**
     * @notice gets the current balance of the given address used to pay network fees
     * @param account address of the account to query
     */
    function getBalance(
        mapping(address => SynapseAPIUser) storage self,
        address account
    ) internal view returns (uint256) {
        return self[account].balance;
    }

    /**
     * @notice gets the account of the given address used to pay network fees
     * @param account address of the account to query
     */
    function getAccount(
        mapping(address => SynapseAPIUser) storage self,
        address account
    ) internal view returns (SynapseAPIUser memory) {
        return self[account];
    }

    /**
     * @notice deposit usdc for future payments for API calls
     * @param self the mapping of addresses to deposited amounts
     * @param usdc the address of usdc
     * @param amount the amount to deposit into the contract
     */
    function deposit(
        mapping(address => SynapseAPIUser) storage self, 
        address usdc, 
        uint256 amount
    ) internal {
        // transfer the deposit amount into the contract
        IERC20(usdc).transferFrom(msg.sender, address(this), amount);

        // credit the user balance with the inputted amount
        self[msg.sender].balance += amount;

        if(self[msg.sender].account == address(0x0)){
            self[msg.sender].account = msg.sender;
            self[msg.sender].active = true;
        }
    }

    /**
     * @notice withdraw deposited USDC from contract
     * @param self the mapping of addresses to deposited amounts
     * @param usdc the address of usdc
     * @param from the sender of the funds
     * @param to the receiver of the token transfer
     * @param amount the amount to withdraw
     */
    function transfer(
        mapping(address => SynapseAPIUser) storage self, 
        address usdc,
        address from,
        address to,
        uint256 amount
    ) internal {
        // ensure the caller has enough deposited balance to withdraw
        uint256 availableBalance = self[from].balance;

        if(availableBalance < amount){
            revert InsufficentTokenBalanceForWithdrawl(); 
        }

        // decrement token balance
        self[from].balance -= amount;

        // sender funds to sender
        IERC20(usdc).transfer(to, amount);
    }

}