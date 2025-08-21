import { parseEther, createPublicClient, http } from 'viem';
import { config } from './chain.js';
import { USDC, SynapseCoreContract } from './contracts.js';
import { ensureTokenApproval } from '../utils/token.js';

export const depositApiCredits = async(
    address: string,
    writeContractAsync: any,
    amount: number
): Promise<{ success: boolean; error?: string; txHash?: string; receipt?: any }> => {
    try {
        // Validate inputs
        if (!writeContractAsync) {
            throw new Error('Write contract function not available');
        }
        
        if (!amount || amount <= 0) {
            throw new Error('Amount must be greater than 0');
        }

        const amountInWei = parseEther(amount.toString());

        // Ensure token approval for the SynapseCore contract
        const approvalError = await ensureTokenApproval({
            tokenAddress: USDC.address,
            ownerAddress: address,
            spenderAddress: SynapseCoreContract.address,
            amount: amount,
            writeContractAsync: writeContractAsync
        });

        if (approvalError) {
            throw new Error(`Token approval failed: ${approvalError.message}`);
        }

        // Execute the deposit transaction
        const txHash = await writeContractAsync({
            address: SynapseCoreContract.address,
            abi: SynapseCoreContract.abi,
            functionName: 'depositAPICredits',
            args: [amountInWei],
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
    } catch (error) {
        console.error('Error depositing API credits:', error);
        
        // Handle specific error types
        let errorMessage = 'Failed to deposit API credits';
        
        if (error.message.includes('User rejected')) {
            errorMessage = 'Transaction rejected by user';
        } else if (error.message.includes('insufficient funds')) {
            errorMessage = 'Insufficient funds for transaction';
        } else if (error.message.includes('Transaction reverted')) {
            errorMessage = 'Transaction failed - contract execution reverted';
        } else if (error.message) {
            errorMessage = error.message;
        }

        return { success: false, error: errorMessage };
    }
}