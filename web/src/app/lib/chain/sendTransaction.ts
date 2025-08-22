import { createPublicClient, http } from 'viem';
import { SynapseCoreContract } from './contracts.js';
import { config } from './chain.ts';

export const sendTransaction = async(
    writeContractAsync: any,
    functionName: string,
    args: any[]
): Promise<{ success: boolean; error?: string; txHash?: string; receipt?: any }> => {
  try {
    const txHash = await writeContractAsync({
        address: SynapseCoreContract.address,
        abi: SynapseCoreContract.abi,
        functionName: functionName,
        args: args,
    });

    // Create public client to wait for transaction using the existing config
    const publicClient = createPublicClient({
        chain: config.chains[0], // Use the first chain from the config (seiAtlantic)
        transport: http()
    });

    // Wait for transaction to be mined
    const receipt = await publicClient.waitForTransactionReceipt({
        hash: txHash,
    });

    return { success: receipt.status === 'success', txHash, receipt };
  } catch(error) {
    return { success: false, error }
  } 
}