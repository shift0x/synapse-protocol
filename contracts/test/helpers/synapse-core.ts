import { ethers } from "hardhat";
import { IMintableToken, MintableToken, SynapseCore } from "../../typechain-types"

export async function depositAPICredits(account: any , synapseCore: SynapseCore, amount: number, usdc : MintableToken) {
    const amountAsBig = ethers.parseEther(amount.toString());
    const bankAddress = await synapseCore.getAddress();

    await usdc.mint(amountAsBig, account);
    await usdc.approve(bankAddress, amountAsBig);
    await synapseCore.depositAPICredits(amountAsBig);
}

export async function withdrawAPICredits(synapseCore: SynapseCore, amount: number) {
    const amountAsBig = ethers.parseEther(amount.toString());

    await synapseCore.withdrawAPICredits(amountAsBig);
}

export async function getAccountTokenBalances(synapseCore: SynapseCore, account: any) {
    const data = await synapseCore.getAccountTokenBalances(account);

    return data.map(record => {
        return {
            account: record[0],
            balance: Number(ethers.formatEther(record[1])),
            quote: Number(ethers.formatEther(record[2])),
            valueUsd: Number(ethers.formatEther(record[3]))
        }
    });
}

export async function getAPIAccount(synapseCore: SynapseCore, account: any) {
    const data = await synapseCore.apiAccounts(account);

    return {
        account: data[0],
        balance: Number(ethers.formatEther(data[1])),
        active: data[2],
        lifetimeUsage: Number(ethers.formatEther(data[3]))

    }
}

export async function getPools(synapseCore: SynapseCore) {
    const pools = await synapseCore.getPoolInfos();

    return pools.map(pool => {
        return makeModelFromPoolInfo(pool);
    })
}

export async function getExperts(synapseCore: SynapseCore) {
    const experts = await synapseCore.getExpertInfos();

    return experts.map((expert: any) => {
        const contributors = [];

        for(var i = 0; i < expert.contributors.length; i++){
            contributors.push(expert.contributors[i]);
        }

        return {
            id: Number(expert[0]),
            contributors: contributors,
            lifetimeEarnings: Number(expert[2]),
            totalWeight: Number(toNumber(expert[3])),
            key: expert[4]
        }
    })
}

export async function getPoolById(synapseCore: SynapseCore, id: number) {
    const info = await synapseCore.getPoolInfoById(id);

    return makeModelFromPoolInfo(info);
}

export async function contributeExpertKnowledge(synapseCore: SynapseCore, uuid: string, poolAddress: string, weight: number) {
    const weightAsBig = ethers.parseEther(weight.toString())

    if(uuid.length == 0){
        uuid = `${Math.random()} -- ${new Date().getTime()}`
    }

    await synapseCore.contributeExpertKnowledge(uuid, poolAddress, weightAsBig)
}

export async function getPoolInfoByAddress(synapseCore: SynapseCore, address: any) {
    const poolInfo = await synapseCore.getPoolInfoForContributor(address);

    return makeModelFromPoolInfo(poolInfo)
}

export async function setupTestContributorAndExpert(address: any, synapseCore: SynapseCore, usdc: IMintableToken, config: any = {
    expertKey: "",
    weight: 1
}) {
    const depositAmount = ethers.parseEther("100000");
    const displayName = "testing"
                
    await usdc.mint(depositAmount, address);
    await usdc.connect(address).approve(synapseCore, depositAmount);
    await synapseCore.connect(address).createContributor(displayName, depositAmount);
    
    const allPools = await getPools(synapseCore);
    const contributorAddress = await address.getAddress();
    const contributor : any = allPools.find(pool => { 
        return pool.contributor == contributorAddress
    })

    await contributeExpertKnowledge(synapseCore, config.expertKey, contributor.pool, config.weight);

    const expert = (await getExperts(synapseCore))[0];

    return {
        contributor,
        expert
    }
}

export async function pay(synapseCore: SynapseCore, key: string, account: any, fee: number) {
    const feeAmount = ethers.parseEther(fee.toString())

    await synapseCore.pay(key, feeAmount, account);
}

function makeModelFromPoolInfo(info: any) {
    return {
        id: info[0],
        pool: info[1],
        contributor: info[2],
        marketcap: toNumber(info[3]),
        quote: toNumber(info[4]),
        earnings: toNumber(info[5]),
        swapFeesToken0: toNumber(info[6]),
        swapFeesToken1: toNumber(info[7]),
        totalSupply: toNumber(info[8]),
        name: info[9]
    }
}

function toNumber(value: any){
    return Number(ethers.formatEther(value))
}