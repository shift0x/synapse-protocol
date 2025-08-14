// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

struct SubjectMatterExpert {
    bytes32 id;
    address[] contributors;
}

struct TokenHolderInfo {
    address account;
    uint256 balance;
}

struct AccountEarnings {
    address account;
    uint256 earnings;
}

struct PoolInfo {
    address pool;
    address contributor;
    uint256 marketcap;
    uint256 quote;
    uint256 earnings;
}