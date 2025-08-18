// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {Math} from "@openzeppelin/contracts/utils/math/Math.sol";
import {SafeMath} from './SafeMath.sol';

import {PoolInfo} from "../Types.sol";
import {IKnowledgeExpertPool} from "../interfaces/IKnowledgeExpertPool.sol";

/// @notice library reponsible for handing knowledge token liquidity pools
/// @dev once tokens are deposited into the pool, users cannot withdraw the deposits -- they will need to swap. This is by design
library LiquidityPoolLib {
    using SafeMath for uint256;

    /// @notice the input amount provided for the given swap is invalid
    error InsufficentInputAmount();

    /// @notice the pool does not have enough liquidity for the given swap params
    error InsufficentLiquidity();

    /**
     * @notice get pool information for the given pool id
     * @param id the unique pool id to get
     */
    function getPoolInfoById(
        address[] storage self,
        uint256 id
    ) internal view returns (PoolInfo memory){
        IKnowledgeExpertPool pool = IKnowledgeExpertPool(self[id]);

        return PoolInfo({
                id: id, 
                pool: address(pool),
                contributor: pool.CONTRIBUTOR(),
                marketcap: pool.marketCap(),
                quote: pool.quote(),
                earnings: pool.totalEarnings(),
                swapFeesToken0: pool.swapFeesToken0(),
                swapFeesToken1: pool.swapFeesToken1(),
                totalSupply: pool.totalSupply(),
                name: pool.name()
            }
        );
    }

    /**
     * @notice get pool information for all created pools
     */
    function getPoolInfos(
        address[] storage self
    ) internal view returns (PoolInfo[] memory){
        PoolInfo[] memory infos = new PoolInfo[](self.length -1);
        
        for(uint256 i = 1; i < self.length; i++){
            infos[i-1] = getPoolInfoById(self, i);
        }

        return infos;
    }

    /**
     * @notice deposit the specified token into the liquidity pool
     * @param token the token to deposit
     * @param from the depositor
     * @param amount the amount to deposit
     */
    function deposit(
        mapping(address => uint256) storage self,
        address token,
        address from,
        uint256 amount
    ) internal {
        // transfer tokens if needed
        if(from != address(this)){
            IERC20(token).transferFrom(from, address(this), amount);
        }

        // increment reserves
        self[token] += amount;
    }

    /**
     * @notice get the output amount for the given swap between the given tokens
     * @param tokenIn the input token
     * @param tokenOut the output token
     * @param amountIn the input amount
     * @param fee the fee amount for the swap
     * @return amountOut the output amount
     * @return feeAmount the charged fee amount on the output token
     */
    function getAmountOut(
        mapping(address => uint256) storage self,
        address tokenIn,
        address tokenOut,
        uint256 amountIn,
        uint256 fee
    ) internal view returns(uint256 amountOut, uint256 feeAmount) {
        uint256 reserveIn = self[tokenIn];
        uint256 reserveOut = self[tokenOut];

        // ensure the input amount and liquidity reserves are valid
        if(amountIn == 0){
            revert InsufficentInputAmount();
        } else if(reserveIn * reserveOut == 0){
            revert InsufficentLiquidity();
        }

        feeAmount = Math.mulDiv(amountIn, fee, 10**18);

        uint256 amountInWithFee = amountIn - feeAmount;

        uint numerator = amountInWithFee.mul(reserveOut);
        uint denominator = reserveIn.add(amountInWithFee);

        amountOut = numerator / denominator;
    }

    /**
     * @notice perform a swap between the given input token to the desired output token in the specified input amount
     * @param tokenIn the input token
     * @param tokenOut the output token
     * @param amountIn the input amount
     * @param fee the swap fee for the pool
     * @param feeTo the receiver of the fee proceeds
     */
    function swap(
        mapping(address => uint256) storage self,
        address tokenIn,
        address tokenOut,
        uint256 amountIn,
        uint256 fee,
        address feeTo
    ) internal returns (uint256 amountOut, uint256 feeAmount) {
        // compute the output token amount
        (amountOut, feeAmount) = getAmountOut(self, tokenIn, tokenOut, amountIn, fee);

        // transfer the input tokens into the contract
        IERC20(tokenIn).transferFrom(msg.sender, address(this), amountIn);

        // transfer swap fees to the swap receiver
        IERC20(tokenIn).transfer(feeTo, feeAmount);

        // transfer the output tokens to the swapper
        IERC20(tokenOut).transfer(msg.sender, amountOut);

        // update reserve balances
        self[tokenIn] += amountIn - feeAmount;
        self[tokenOut] -= amountOut;
    }

    /**
     * @notice get the current market cap for the pool
     * @param usdc address of the usdc token
     */
    function getMarketCap(
        mapping(address => uint256) storage self,
        address usdc
    ) internal view returns (uint256 marketCap){
        uint256 quote = getQuote(self, usdc);
        uint256 supply = IERC20(address(this)).totalSupply();

        return Math.mulDiv(quote, supply, 10**18);
    }

    /**
     * @notice get the quote price for the pool token
     * @param usdc address of the usdc token
     */
    function getQuote(
        mapping(address => uint256) storage self,
        address usdc
    ) internal view returns (uint256 quote) {
        uint256 usdcBalance = self[usdc];
        uint256 poolTokenBalance = self[address(this)];

        quote = Math.mulDiv(usdcBalance, 10**18, poolTokenBalance);
    }
}