import { ethers } from "hardhat";

export const getTokenHolderEarnings = async(poolAddress: string,  address: any) : Promise<number> => {
   const pool = await ethers.getContractAt("IKnowledgeExpertPool", poolAddress)
   const earningsBig = await pool.getTokenHolderEarnings(address)

   return Number(ethers.formatEther(earningsBig))
}