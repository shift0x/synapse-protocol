import { ethers } from "hardhat";
import { MintableToken } from "../../typechain-types";
import { approve, balanceOf } from "./erc20";

export const getTokenHolderEarnings = async(poolAddress: string,  address: any) : Promise<number> => {
   const pool = await ethers.getContractAt("IKnowledgeExpertPool", poolAddress)
   const earningsBig = await pool.getTokenHolderEarnings(address)

   return Number(ethers.formatEther(earningsBig))
}

export const buy = async(account: any, usdc: MintableToken, poolAddress: string, amount: number) => {
   const buyAmountBig = ethers.parseEther(amount.toString());
   const usdcAddress = await usdc.getAddress()

   await usdc.mint(buyAmountBig, account)
   await approve(account, usdcAddress, poolAddress);

   const pool = await ethers.getContractAt("IKnowledgeExpertPool", poolAddress)

   await pool.connect(account).buy(buyAmountBig);
}

export const sell = async(account: any, poolAddress: string, amount: number) => {
   const sellAmountBig = ethers.parseEther(amount.toString());

   await approve(account, poolAddress, poolAddress);

   const pool = await ethers.getContractAt("IKnowledgeExpertPool", poolAddress)

   await pool.connect(account).sell(sellAmountBig);
}

export const getAmountOut = async(poolAddress: string, tokenIn: string, tokenOut: string, amountIn: number) => {
   const buyAmountBig = ethers.parseEther(amountIn.toString());
   const pool = await ethers.getContractAt("IKnowledgeExpertPool", poolAddress)

   const response = await pool.getAmountOut(tokenIn, tokenOut, buyAmountBig);

   const amountOut = Number(ethers.formatEther(response[0]));
   const feeAmount = Number(ethers.formatEther(response[1]));

   return {
      amountOut,
      feeAmount
   }

}