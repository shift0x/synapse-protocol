// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/// @notice library reponsible for handing user deposits
library DepositLib {

    /// @notice The depositor does not have enough tokens for the requested withdrawl
    error InsufficentTokenBalanceForWithdrawl();

    /**
     * @notice gets the current balance of the given address used to pay network fees
     * @param payer address of the payer
     */
    function getBalance(
        mapping(address => uint256) storage self,
        address payer
    ) public view returns (uint256) {
        return self[payer];
    }

    /**
     * @notice deposit usdc for future payments for API calls
     * @param self the mapping of addresses to deposited amounts
     * @param usdc the address of usdc
     * @param amount the amount to deposit into the contract
     */
    function deposit(
        mapping(address => uint256) storage self, 
        address usdc, 
        uint256 amount
    ) public {
        // transfer the deposit amount into the contract
        IERC20(usdc).transferFrom(msg.sender, address(this), amount);

        // credit the user balance with the inputted amount
        self[msg.sender] += amount;
    }

    /**
     * @notice withdraw deposited USDC from contract
     * @param self the mapping of addresses to deposited amounts
     * @param usdc the address of usdc
     * @param to the receiver of the token transfer
     * @param amount the amount to withdraw
     */
    function transfer(
        mapping(address => uint256) storage self, 
        address usdc,
        address to,
        uint256 amount
    ) public {
        // ensure the caller has enough deposited balance to withdraw
        uint256 availableBalance = self[msg.sender];

        if(availableBalance < amount){
            revert InsufficentTokenBalanceForWithdrawl(); 
        }

        // decrement token balance
        self[msg.sender] -= amount;

        // sender funds to sender
        IERC20(usdc).transfer(to, amount);
    }

}