// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

interface IKnowledgeExpertPool is IERC20 {

    function isContributingToExpert(uint256 id) external view returns (bool);

    function storeExpertInformation(uint256 id, uint256 weight) external;

    function getExpertContributionWeight(uint256 id) external view returns (uint256);

    function payoutReceived(uint256 amount) external;

    function init(uint256 depositAmount) external;

    function marketCap() external view returns (uint256);

    function quote() external view returns (uint256);

}