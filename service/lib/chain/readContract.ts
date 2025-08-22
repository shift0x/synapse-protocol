import { createPublicClient, http } from 'viem';
import { SynapseCoreContract } from './contracts';
import { SEI_ATLANTIC } from './chain'

export const readContract = async(method: string, args: any[]) : Promise<any> => {
    // Create public client using the existing config
    const publicClient = createPublicClient({
        chain: SEI_ATLANTIC, 
        transport: http()
    });

    // Call the getAPIAccount function on the SynapseCore contract
    const result = await publicClient.readContract({
        address: SynapseCoreContract.address as `0x${string}`,
        abi: SynapseCoreContract.abi,
        functionName: method as any,
        args: args
    }) 

    return result;
}
