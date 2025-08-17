// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import {ExpertInfo} from '../Types.sol';

/// @notice library responsible for managing and returning information about experts and their contributors
library ExpertLib {


    /**
     * @notice gets an expert based on the id. creates a new expert if the id is 0
     * @param self the list of all experts
     * @param id the identifier of the expert to get
     * @param weight the weight that should be associated with the contributor
     */
    function addExpertContributor(
        ExpertInfo[] storage self,
        uint256 id,
        address contributor,
        uint256 weight
    ) internal returns (uint256) {
        // if the expert already exists we just need to add the contributor to the 
        // list maitained by the expert
        if(id != 0){
            self[id].contributors.push(contributor);
            self[id].totalWeight += weight;

            return id;
        }

        // create a new expert
        address[] memory contributors = new address[](1);

        contributors[0] = contributor;

        ExpertInfo memory info = ExpertInfo({
            id: self.length,
            contributors: contributors,
            lifetimeEarnings: 0,
            totalWeight: weight
        });

        self.push(info);

        return info.id;
    }

    /**
     * @notice record the fee collected for an api call that used an expert
     * @param id the id of the expert used
     * @param amount the fee amount collected
     */
    function feeCollected(
        ExpertInfo[] storage self,
        uint256 id,
        uint256 amount
    ) internal {
        self[id].lifetimeEarnings += amount;
    }

    /**
     * @notice get the expert at the given index
     * @param id the index of the expert to get
     */
    function getExpert(
        ExpertInfo[] storage self,
        uint256 id
    ) internal view returns (ExpertInfo memory) {
        return self[id];
    }
}
