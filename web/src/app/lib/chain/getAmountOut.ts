import { KnowledgeExpertPool } from "./contracts"
import { readContract } from "./readContract.ts"
import { parseEther, formatEther } from 'viem'

export const getAmountOut = async(pool: string, tokenIn: string, tokenOut: string, amountIn: number) : Promise<number> => {
    try {
        const contract = {
            ...KnowledgeExpertPool,
            address: pool,
        }

        const amountInBig = parseEther(amountIn.toString());
        const [amountOutBig] = await readContract(contract, "getAmountOut", [tokenIn, tokenOut, amountInBig]);

        return Number(formatEther(amountOutBig))
    } catch(error){
        console.error('Error getting swap output:', error);

        throw new Error('Failed to get swap output');
    }

}