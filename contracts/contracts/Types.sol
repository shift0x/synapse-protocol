// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

struct TokenHolderInfo {
    address account;
    uint256 balance;
}

struct PoolInfo {
    address pool;
    address contributor;
    uint256 marketcap;
    uint256 quote;
    uint256 earnings;
    uint256 swapFeesCollected;
}

struct ExpertInfo {
    bytes32 id;
    PoolInfo[] contributors;
    uint256 lifetimeEarnings;
}