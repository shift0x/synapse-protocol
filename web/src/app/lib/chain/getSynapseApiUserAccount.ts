import { createPublicClient, formatEther, http } from 'viem';
import { config } from './chain.ts';
import { SynapseCoreContract } from './contracts.js';
import { SynapseAPIUser } from './types.js'

export const getSynapseApiUserAccount = async (account: string) : Promise<SynapseAPIUser> => {
    try {
        // Create public client using the existing config
        const publicClient = createPublicClient({
            chain: config.chains[0], // Use the first chain from the config (seiAtlantic)
            transport: http()
        });

        // Call the getAPIAccount function on the SynapseCore contract
        const result = await publicClient.readContract({
            address: SynapseCoreContract.address as `0x${string}`,
            abi: SynapseCoreContract.abi,
            functionName: 'getAPIAccount',
            args: [account as `0x${string}`]
        }) as {
            account: `0x${string}`;
            balance: bigint;
            active: boolean;
            lifetimeUsage: bigint;
        };

        // Format the returned data with 18 decimals
        return {
            account: result.account,
            balance: Number(formatEther(result.balance)),
            active: result.active,
            lifetimeUsage: Number(formatEther(result.lifetimeUsage))
        };
    } catch (error) {
        console.error('Error getting Synapse API user:', error);
        throw new Error('Failed to retrieve Synapse API user data');
    }
}