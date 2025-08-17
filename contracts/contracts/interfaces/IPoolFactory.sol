// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;


interface IPoolFactory {

    function createPool(
        uint256 id,
        string memory displayName,
        address contributor,
        address usdc,
        uint256 swapFee,
        address synapseCore
    ) external returns (address);

}