import { parseEther } from 'viem';
import { USDC, SynapseCoreContract } from './contracts.js';
import { ensureTokenApproval } from '../utils/token.js';
import { sendTransaction } from './sendTransaction.ts';

export const createContributorPool = async(
    address: string,
    writeContractAsync: any,
    displayName: string,
    initialPoolLiquidity: number
): Promise<{ success: boolean; error?: string; txHash?: string; receipt?: any }> => {
    try {
        // Validate inputs
        if (!writeContractAsync) {
            throw new Error('Write contract function not available');
        }
        
        if (!displayName || displayName.trim().length === 0) {
            throw new Error('Display name is required');
        }
        
        if (!initialPoolLiquidity || initialPoolLiquidity <= 0) {
            throw new Error('Initial pool liquidity must be greater than 0');
        }

        if (!address) {
            throw new Error('Wallet address is required');
        }

        const amountInWei = parseEther(initialPoolLiquidity.toString());

        // Ensure token approval for the SynapseCore contract
        const approvalError = await ensureTokenApproval({
            tokenAddress: USDC.address,
            ownerAddress: address,
            spenderAddress: SynapseCoreContract.address,
            amount: initialPoolLiquidity,
            writeContractAsync: writeContractAsync
        });

        if (approvalError) {
            throw new Error(`Token approval failed: ${approvalError.message}`);
        }

        // Execute the create contributor transaction using sendTransaction
        const result = await sendTransaction(
            writeContractAsync,
            'createContributor',
            [displayName, amountInWei]
        );

        if (!result.success) {
            throw new Error(result.error || 'Failed to create contributor pool');
        }

        return result;
    } catch (error) {
        console.error('Error creating contributor pool:', error);
        
        // Handle specific error types
        let errorMessage = 'Failed to create contributor pool';
        
        if (error.message.includes('User rejected')) {
            errorMessage = 'Transaction rejected by user';
        } else if (error.message.includes('insufficient funds')) {
            errorMessage = 'Insufficient funds for transaction';
        } else if (error.message.includes('AlreadyKnown')) {
            errorMessage = 'You already have a contributor pool created';
        } else if (error.message.includes('Transaction reverted')) {
            errorMessage = 'Transaction failed - contract execution reverted';
        } else if (error.message) {
            errorMessage = error.message;
        }

        return { success: false, error: errorMessage };
    }
}
