// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import {KnowledgeExpertPool} from './KnowledgeExpertPool.sol';
import {IPoolFactory} from './interfaces/IPoolFactory.sol';

/// @notice contract responsible for creating new pool instances
contract PoolFactory is IPoolFactory {

 
    /**
     * @notice create a new knowledge expert pool instance
     * @param displayName the name of the contributor liquidity pool
     */
    function createPool(
        uint256 id,
        string memory displayName,
        address contributor,
        address usdc,
        uint256 swapFee,
        address synapseCore
    ) public returns (address) {
        KnowledgeExpertPool pool = new KnowledgeExpertPool(id, displayName, contributor, synapseCore, usdc, swapFee);

        return address(pool);
    }
}