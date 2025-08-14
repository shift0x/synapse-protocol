// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

/// @notice library responsible for managing and returning information about experts and their contributors
library ExpertLib {

    /**
     * @notice get the total contribution weight for a given expert
     * @param self the mapping from expert to contribution weights
     * @param id the id of the expert to lookup
     */ 
    function getTotalContributionWeight(
        mapping(bytes32 => uint256) storage self,
        bytes32 id
    ) internal view returns (uint256) {
        return self[id];
    }

    /**
     * @notice get the contributors to an expert
     * @param self the mapping from expert to it's contributors
     * @param id the id of the expert to lookup
     */
    function getExpertContributors(
        mapping(bytes32 => address[]) storage self,
        bytes32 id
    ) internal view returns (address[] memory) {
        return self[id];
    } 

    /**
     * @notice get contribution amount for an address
     * @param self the mapping of expert to contributors and their weights
     * @param id the id of the expert
     * @param contributor the address of the contributor
     */
    function getExpertContributionWeight(
        mapping(bytes32 => mapping(address => uint256)) storage self,
        bytes32 id,
        address contributor
    ) internal view returns (uint256) {
        return self[id][contributor];
    }

    /**
     * @notice add the give contributor to the list of contributors for an expert topic
     * @param experts the mapping of expert to contributors and their weights
     * @param contributors the mapping from expert to it's contributors
     * @param weights the mapping from expert to it's total weight
     * @param id the id of the expert
     * @param contributor the address of the contributor
     */
    function contributeExpertKnowledge(
        mapping(bytes32 => mapping(address => uint256)) storage experts,
        mapping(bytes32 => address[]) storage contributors,
        mapping(bytes32 => uint256) storage weights,
        bytes32 id,
        address contributor,
        uint256 weight
    ) internal {
        uint256 currentExpertWeight = experts[id][contributor];

        // if the contributor already exists for the expert topic, then we need to ensure the weights are properly adjusted.
        // otherwise, the contributor is new and should be added to the list of contributors for the expert topic
        if(currentExpertWeight != 0){
            weights[id] -= currentExpertWeight;
        } else {
            contributors[id].push(contributor);
        }

        // assign contributor weights and increment the total weight for the expert topic
        experts[id][contributor] = weight;
        weights[id] += weight;
    }

}
