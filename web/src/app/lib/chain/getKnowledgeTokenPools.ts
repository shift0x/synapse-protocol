import { formatEther } from 'viem'
import { readContract } from './readContract.ts';
import { KnowledgeTokenPool } from './types';
import { SynapseCoreContract } from './contracts.js';

export const getKnowledgeTokenPools = async (): Promise<KnowledgeTokenPool[]> => {
    try {
        const result = await readContract(SynapseCoreContract, 'getPoolInfos', []);
        
        const pools = (result as any[]).map(pool => {
            const model : any = {
                id: Number(pool.id),
                pool: pool.pool,
                contributor: pool.contributor,
                marketcap: Number(formatEther(pool.marketcap)),
                quote: Number(formatEther(pool.quote)),
                earnings: Number(formatEther(pool.earnings)), 
                swapFeesToken0: Number(formatEther(pool.swapFeesToken0)),
                swapFeesToken1: Number(formatEther(pool.swapFeesToken1)),
                totalSupply: Number(formatEther(pool.totalSupply)),
                name: pool.name
            }

            model.totalSwapFeesUsd = model.swapFeesToken0 + (model.quote * model.swapFeesToken1)
            
            return model
        })

        return pools;
    } catch (error) {
        console.error('Error fetching knowledge token pools:', error);
        throw error;
    }
};
