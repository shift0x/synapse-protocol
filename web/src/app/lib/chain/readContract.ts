import { createPublicClient, http } from 'viem';
import { SynapseCoreContract } from './contracts.js';
import { config } from './chain.ts';

export const readContract = async(method: string, args: any[]) : Promise<any> => {
    // Create public client using the existing config
    const publicClient = createPublicClient({
        chain: config.chains[0], // Use the first chain from the config (seiAtlantic)
        transport: http()
    });

    // Call the getAPIAccount function on the SynapseCore contract
    const result = await publicClient.readContract({
        address: SynapseCoreContract.address as `0x${string}`,
        abi: SynapseCoreContract.abi,
        functionName: method,
        args: args
    }) 

    return result;
}
