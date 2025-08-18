// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {IERC20Metadata} from "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";

interface IKnowledgeExpertPool is IERC20, IERC20Metadata {

    function isContributingToExpert(uint256 id) external view returns (bool);

    function storeExpertInformation(uint256 id, uint256 weight) external;

    function getExpertContributionWeight(uint256 id) external view returns (uint256);

    function payoutReceived(uint256 amount) external;

    function init(uint256 depositAmount) external;

    function marketCap() external view returns (uint256);

    function quote() external view returns (uint256);

    function CONTRIBUTOR() external view returns (address);

    function totalEarnings() external view returns (uint256);

    function swapFeesToken0() external view returns (uint256);

    function swapFeesToken1() external view returns (uint256);

    function getTokenHolderEarnings(address holder) external view returns (uint256);

    function buy(uint256 amountIn) external returns(uint256 amountOut, uint256 feeAmount);

    function sell(uint256 amountIn) external returns (uint256 amountOut, uint256 feeAmount);

    function getAmountOut(address tokenIn, address tokenOut,uint256 amountIn) external view returns (uint256 amountOut, uint256 feeAmount);

}