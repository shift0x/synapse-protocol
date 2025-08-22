import { ethers } from "ethers";
import { OperationResult } from "../../types";
import { SynapseCoreContract } from "./contracts";

export const contributeExpertKnowledge = async(key: string, poolAddress: string, weight: number) : Promise<OperationResult<string>> => {
    try {
        const provider = new ethers.JsonRpcProvider(process.env.RPC_URL as string);
        const wallet = new ethers.Wallet(process.env.SYSTEM_ACCOUNT_PRIVATE_KEY as string, provider);
        
        const contract = new ethers.Contract(
            SynapseCoreContract.address,
            SynapseCoreContract.abi,
            wallet
        );

        const tx = await contract.contributeExpertKnowledge(key, poolAddress, weight);
        const receipt = await tx.wait();
        
        if (receipt.status === 0) {
            return {
                error: `Transaction failed: ${tx.hash}`,
                message: `Failed to contribute expert knowledge - transaction reverted`
            };
        }

        return {
            data: tx.hash
        };
        
    } catch (error) {
        return {
            error: error,
            message: `Failed to contribute expert knowledge`
        };
    }
}