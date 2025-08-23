import { ensureTokenApproval } from "../utils/token";
import { parseEther } from 'viem'
import { sendTransaction } from "./sendTransaction.ts";
import { KnowledgeExpertPool, USDC } from "./contracts";

export const swap = async(
    address: string,
    writeContractAsync: any,
    pool: string, 
    tokenIn: string, 
    amountIn: number
) : Promise<{ success: boolean; error?: string; txHash?: string; receipt?: any }> => {
    try {
        const error = await ensureTokenApproval({
            tokenAddress: tokenIn,
            ownerAddress: address,
            spenderAddress: pool, 
            amount: amountIn,
            writeContractAsync
        });

        if(error){
            return {
                success: false,
                error: error
            }
        }

        const contract = {
            address: pool,
            ...KnowledgeExpertPool
        }

        const amountInBig = parseEther(amountIn.toString())
        const method = tokenIn == USDC.address ? "buy" : "sell"

        return sendTransaction(contract, writeContractAsync, method, [amountInBig])
    } catch (error){
        return {
            success: false,
            error: error
        }
    }
}