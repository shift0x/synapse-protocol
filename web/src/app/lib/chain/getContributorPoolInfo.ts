import { formatEther } from 'viem';
import { readContract } from './readContract.ts'
import { ContributorPoolInfo } from './types'

export const getContributorPoolInfo = async (account: string) : Promise<ContributorPoolInfo> => {
    try {
        const isRegisteredContributor = await readContract("isRegisteredContributor", [account])
        const poolInfo = await readContract("getPoolInfoForContributor", [account])

        poolInfo.id = Number(poolInfo.id);
        poolInfo.marketcap = Number(formatEther(poolInfo.marketcap));
        poolInfo.quote = Number(formatEther(poolInfo.quote));
        poolInfo.earnings = Number(formatEther(poolInfo.earnings));
        poolInfo.swapFeesToken0 = Number(formatEther(poolInfo.swapFeesToken0));
        poolInfo.swapFeesToken1 = Number(formatEther(poolInfo.swapFeesToken1));
        poolInfo.totalSupply = Number(formatEther(poolInfo.totalSupply));
        poolInfo.isRegistered = isRegisteredContributor;
        poolInfo.swapFeesInUSDC = (poolInfo.swapFeesToken1 * poolInfo.quote) + poolInfo.swapFeesToken0

        return poolInfo;
    } catch (error) {
        console.log({error})
        console.error('Error getting Synapse API user:', error);
        throw new Error('Failed to retrieve Synapse API user data');
    }
}