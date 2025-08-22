import { readContract } from "./readContract";
import { OperationResult } from '../../types'
import { SynapseCoreContract, USDC } from "./contracts";
import { ethers, formatEther } from "ethers";

export const SYSTEM_ACCOUNT_ADDRESS = process.env.SYSTEM_ACCOUNT_WALLET_ADDRESS as string

const mintUSDC = async(amount: number) : Promise<OperationResult<void>> => {
    try {
        const provider = new ethers.JsonRpcProvider(process.env.RPC_URL as string);
        const wallet = new ethers.Wallet(process.env.SYSTEM_ACCOUNT_PRIVATE_KEY as string, provider);
        
        const contract = new ethers.Contract(
            USDC.address,
            USDC.abi,
            wallet
        );

        const tx = await contract.mint(ethers.parseEther(amount.toString()), SYSTEM_ACCOUNT_ADDRESS)
        const receipt = await tx.wait();
        
        if (receipt.status === 0) {
            return {
                error: `Transaction failed: ${tx.hash}`,
                message: `Failed to contribute expert knowledge - transaction reverted`
            };
        }

        return {}
    } catch(error){
        return { error }
    }
}

const approveSynapseCoreSpend = async(amount: number) : Promise<OperationResult<void>> => {
    try {
        const provider = new ethers.JsonRpcProvider(process.env.RPC_URL as string);
        const wallet = new ethers.Wallet(process.env.SYSTEM_ACCOUNT_PRIVATE_KEY as string, provider);
        
        const contract = new ethers.Contract(
            USDC.address,
            USDC.abi,
            wallet
        );

        const tx = await contract.approve(SynapseCoreContract.address, ethers.parseEther(amount.toString()))
        const receipt = await tx.wait();

        if (receipt.status === 0) {
            return {
                error: `Transaction failed: ${tx.hash}`,
                message: `Failed to contribute expert knowledge - transaction reverted`
            };
        }

        return {}

    } catch(error){
        return { error }
    }
    
}

const createContributorPool = async(amount : number) : Promise<OperationResult<void>> => {
    try {
        const provider = new ethers.JsonRpcProvider(process.env.RPC_URL as string);
        const wallet = new ethers.Wallet(process.env.SYSTEM_ACCOUNT_PRIVATE_KEY as string, provider);
        
        const contract = new ethers.Contract(
            SynapseCoreContract.address,
            SynapseCoreContract.abi,
            wallet
        );

        const displayName = "Synapse Core - Agent Contributor"
        const tx = await contract.createContributor(displayName, ethers.parseEther(amount.toString()))
        const receipt = await tx.wait();

        if (receipt.status === 0) {
            return {
                error: `Transaction failed: ${tx.hash}`,
                message: `Failed to contribute expert knowledge - transaction reverted`
            };
        }

        return {}

    } catch(error){
        return { error }
    }
}

const ensureSystemAccountIsRegisteredUser = async() : Promise<OperationResult<void>> => {
    try {
        const isRegisteredContributor = await readContract("isRegisteredContributor", [SYSTEM_ACCOUNT_ADDRESS])

        if(isRegisteredContributor)
            return {};

        const mintAmount = 1000000;

        await mintUSDC(mintAmount);
        await approveSynapseCoreSpend(mintAmount);
        await createContributorPool(mintAmount)
    } catch (error){
        return { error }
    }

    return {}
}

export const getSystemAccountPoolInfo = async () : Promise<OperationResult<any>> => {
    try {
        
        const { error } = await ensureSystemAccountIsRegisteredUser();

        if(error)
            return { error }

        const poolInfo = await readContract("getPoolInfoForContributor", [SYSTEM_ACCOUNT_ADDRESS])

        poolInfo.id = Number(poolInfo.id);
        poolInfo.marketcap = Number(formatEther(poolInfo.marketcap));
        poolInfo.quote = Number(formatEther(poolInfo.quote));
        poolInfo.earnings = Number(formatEther(poolInfo.earnings));
        poolInfo.swapFeesToken0 = Number(formatEther(poolInfo.swapFeesToken0));
        poolInfo.swapFeesToken1 = Number(formatEther(poolInfo.swapFeesToken1));
        poolInfo.totalSupply = Number(formatEther(poolInfo.totalSupply));
        poolInfo.isRegistered = true;
        poolInfo.swapFeesInUSDC = (poolInfo.swapFeesToken1 * poolInfo.quote) + poolInfo.swapFeesToken0

        return {
            data: poolInfo
        };
    } catch (error) {
        console.log({error})
        console.error('Error getting Synapse API user:', error);
        
        return { error }
    }
}