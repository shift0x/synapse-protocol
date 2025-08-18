// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import {Math} from "@openzeppelin/contracts/utils/math/Math.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

import {MintableToken} from './MintableToken.sol';
import {LiquidityPoolLib} from './lib/LiquidityPoolLib.sol';
import {TokenHolderInfo} from './Types.sol';

import {IMintableToken} from './interfaces/IMintableToken.sol';

import 'hardhat/console.sol';

/**
 * @notice contract representing the knowledge contributed by an expert into the system
 * @dev this contract will track all token holders with a stake in the given expert as well as facilitate trading
 * of the knowledge token
 */
contract KnowledgeExpertPool is MintableToken {
    using LiquidityPoolLib for mapping(address => uint256);

    /// @notice the USDC token
    address public immutable TOKEN0;

    /// @notice the pool token
    address public immutable TOKEN1;

    /// @notice the assigned id of the pool
    uint256 public immutable POOL_ID;

    /// @notice the address of the knowledge contributor for this token
    address public immutable CONTRIBUTOR;

    /// @notice address of the synapse core contract instance
    address public immutable SYNAPSE_CORE;

    /// @notice address of the USDC token
    address public immutable USDC;

    /// @notice the timestamp the contract was created at
    uint256 public immutable CREATED_AT;

    /// @notice the swap fee for the pool
    uint256 public immutable FEE;

    /// @notice liquidity pool balances
    mapping(address => uint256) pool;

    /// @notice weights assigned to this contributor by expert
    mapping(uint256 => uint256) expertWeights;

    /// @notice the experts the pool owner has contributed to
    uint256[] experts; 

    /// @notice total earnings of the knowledge expert
    uint256 public totalEarnings;

    /// @notice the total earnings by token holder
    mapping(address => uint256) tokenHolderEarnings;

    /// @notice the total amount of fees collected for token 0 (usdc)
    uint256 public swapFeesToken0;

    /// @notice the total amount of swap fees collected for token 1 (pool token)
    uint256 public swapFeesToken1;

    

    /// @notice the caller has insuffient permissions for the given operation
    error Unauthorized();

    /// @notice failed to mint initial pool tokens
    error FailedToMintInitialPoolTokens();

    /// @notice transfer failed
    error TransferFailed();

    /// @notice the expert weight passed cannot be 0
    error ExpertWeightCannotBeZero();

    /// @notice modify to restrict function calls to just the synapse core contract
    modifier onlySynapseCore() {
        if(msg.sender != SYNAPSE_CORE){
            revert Unauthorized();
        }

        _;
    }

    /**
     * @notice create a new instance of the contract
     * @param _contributor the address of the contributor this contract instance tracks
     * @param _synapseCore the address of the core contract instance of the synapse protocol
     */
    constructor(
        uint256 _poolId,
        string memory _displayName,
        address _contributor,
        address _synapseCore,
        address _usdc,
        uint256 _fee
    ) MintableToken(address(this), _displayName,"EXPERT")  {
        CONTRIBUTOR = _contributor;
        SYNAPSE_CORE = _synapseCore;
        USDC = _usdc;
        CREATED_AT = block.timestamp;
        FEE = _fee;
        POOL_ID = _poolId;
        TOKEN0 = _usdc;
        TOKEN1 = address(this);
    }


    /**
     * @notice setup the contract for trading
     * @param depositAmount the amount of USDC being deposited into the pool initalization
     */
    function init(
        uint256 depositAmount
    ) public onlySynapseCore {
        uint256 totalTokenSupply = 10**18 * 100000; //100K tokens

        // the contributor gets 5% of the total token supply
        uint256 contributorTokenBalance = totalTokenSupply / 20;
        
        // mint tokens to this contract
        IMintableToken(address(this)).mint(totalTokenSupply, address(this));

        // transfer tokens to the contributor
        IERC20(address(this)).transfer(CONTRIBUTOR, contributorTokenBalance);
        
        // deposit the initial pool USDC tokens into the liqudiity pool
        pool.deposit(USDC, SYNAPSE_CORE, depositAmount);

        // deposit the initial knowledge tokens into the liquidity pool
        pool.deposit(address(this), address(this), totalTokenSupply - contributorTokenBalance);
    }

    /// @notice get the current market cap of the contributor token
    function marketCap() public view returns (uint256){    
        return pool.getMarketCap(USDC);
    }

    /// @notice get the quote price for the pool token
    function quote() public view returns (uint256) {
        return pool.getQuote(USDC);
    }

    /**
     * @notice return the total earnings for the token holder specified
     * @param holder the token holder to get earnings for
     */
    function getTokenHolderEarnings(
        address holder
    ) external view returns (uint256){
        return tokenHolderEarnings[holder];
    }

    /**
     * @notice get the expected swap amounts for the given trade
     * @param tokenIn the input token
     * @param tokenOut the output token
     * @param amountIn the input amount
     */
    function getAmountOut(
        address tokenIn,
        address tokenOut,
        uint256 amountIn
    ) external view returns (uint256 amountOut, uint256 feeAmount) {
        (amountOut, feeAmount) = pool.getAmountOut(tokenIn, tokenOut, amountIn, FEE);
    }
    

    /**
     * @notice store the expert information when the creator contributes to an expert
     */
    function storeExpertInformation(
        uint256 id,
        uint256 weight
    ) public onlySynapseCore {
        if(weight == 0){
            revert ExpertWeightCannotBeZero();
        }
        
        // add the expert to the list of experts contributed to
        experts.push(id);

        // store the weight we have been given for the contribution
        expertWeights[id] = weight;
    }

    /**
     * @notice returns whether the expert is known
     * @param id the id of the expert to query
     */
    function isContributingToExpert(
        uint256 id
    ) public view returns (bool) {
        return expertWeights[id] != 0;
    }

    /**
     * @notice get the weight for this pools contribution to a given expert
     * @param id the id of the expert to fetch
     */
    function getExpertContributionWeight(
        uint256 id
    ) public view returns (uint256) {
        return expertWeights[id];
    }

    /**
     * @notice buy the pool token with USDC
     * @param amountIn the amount of USDC to swap   
     */ 
    function buy(
        uint256 amountIn
    ) public returns(uint256 amountOut, uint256 feeAmount) {
        // execute the swap and record the transaction amounts
        (amountOut, feeAmount) = pool.swap(USDC, address(this), amountIn, FEE, CONTRIBUTOR);

        // log the fee amount on the swap
        swapFeesToken0 += feeAmount;
    }

    /**
     * @notice swap the liquidity pool token for pooled USDC
     * @param amountIn the amount of the pool token to swap
     */
    function sell(
        uint256 amountIn
    ) public returns (uint256 amountOut, uint256 feeAmount) {
        // execute the swap and record the transaction amounts
        (amountOut, feeAmount) = pool.swap(address(this), USDC, amountIn, FEE, CONTRIBUTOR);

        // log the fee amount on the swap
        swapFeesToken1 += feeAmount;
    }

    /**
     * @notice process earnings for token holders
     * @param amount the amount of USDC that was earned that needs to be distributed
     * @dev this method can only be called by the synapse core instance
     */
    function payoutReceived(
        uint256 amount
    ) public onlySynapseCore {
        // increment total earnings of the pool
        totalEarnings += amount;

        // assign earnings amounts to token holders. They can claim the earnings when they wish
        uint256 outstandingTokenAmount = totalSupply() - balanceOf(address(this));
        TokenHolderInfo[] memory holders = getTokenHolderInfo();

        // for each token holder allocate the appropiate payout amount and send tokens
        for(uint256 i = 0; i < holders.length; i++){
            TokenHolderInfo memory holder = holders[i];

            // the pool address should not be allocated earnings
            if(holder.account == address(this)){
                continue;
            }

            // calculate the earnings amount and transfer tokens
            uint256 holdingPercentage = Math.mulDiv(holder.balance, 10**18, outstandingTokenAmount);
            uint256 payoutAmount = Math.mulDiv(holdingPercentage, amount, 10**18);

            IERC20(USDC).transfer(holder.account, payoutAmount);

            // keep track of the total earnings for accounts
            tokenHolderEarnings[holder.account] += payoutAmount;
        }
    }

}