// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

struct TokenHolderInfo {
    address account;
    uint256 balance;
}

struct KnowledgeTokenBalanceInfo {
    address account;
    uint256 balance;
    uint256 quote;
    uint256 valueUsd;
}

struct PoolInfo {
    uint256 id;
    address pool;
    address contributor;
    uint256 marketcap;
    uint256 quote;
    uint256 earnings;
    uint256 swapFeesToken0;
    uint256 swapFeesToken1;
    uint256 totalSupply;
    string name;
}

struct ExpertInfo {
    uint256 id;
    address[] contributors;
    uint256 lifetimeEarnings;
    uint256 totalWeight;
    string key;
}

struct SynapseAPIUser {
    address account;
    uint256 balance;
    bool active;
    uint256 lifetimeUsage;
}