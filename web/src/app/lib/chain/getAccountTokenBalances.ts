import { createPublicClient, formatEther, http } from 'viem';
import { config } from './chain.js';
import { SynapseCoreContract } from './contracts.js';

export const getAccountTokenBalances = async(account: string): Promise<Record<string, number>> => {
    try {
        // Create public client using the existing config
        const publicClient = createPublicClient({
            chain: config.chains[0], // Use the first chain from the config (seiAtlantic)
            transport: http()
        });

        // Call the getAccountTokenBalances function on the SynapseCore contract
        const result = await publicClient.readContract({
            address: SynapseCoreContract.address as `0x${string}`,
            abi: SynapseCoreContract.abi,
            functionName: 'getAccountTokenBalances',
            args: [account as `0x${string}`]
        });

        // Transform the result into a map of token address -> balance
        const balanceMap: Record<string, number> = {};
        
        if (result && Array.isArray(result)) {
            for (const tokenInfo of result) {
                // tokenInfo is a struct with { account: address, balance: uint256 }
                // We use the account field as the token address and balance as numeric value
                balanceMap[tokenInfo.account] = Number(formatEther(tokenInfo.balance));
            }
        }

        return balanceMap;
    } catch (error) {
        console.error('Error getting account token balances:', error);
        throw new Error('Failed to retrieve account token balances');
    }
}