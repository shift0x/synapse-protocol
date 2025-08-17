import { ethers } from "hardhat";
import { MintableToken, SynapseCore } from "../../typechain-types"

export async function depositAPICredits(account: any , synapseCore: SynapseCore, amount: string, usdc : MintableToken) {
    const amountAsBig = ethers.parseEther(amount);
    const bankAddress = await synapseCore.getAddress();

    await usdc.mint(amountAsBig, account);
    await usdc.approve(bankAddress, amountAsBig);
    await synapseCore.depositAPICredits(amountAsBig);
}

export async function withdrawAPICredits(synapseCore: SynapseCore, amount: string) {
    const amountAsBig = ethers.parseEther(amount);

    await synapseCore.withdrawAPICredits(amountAsBig);
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

export async function getContributors(synapseCore: SynapseCore) {
    const pools = await synapseCore.getContributorInfos();

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
            totalWeight: Number(toNumber(expert[3]))
        }
    })
}

export async function contributeExpertKnowledge(synapseCore: SynapseCore, id: number, poolId: number, weight: number) {
    const weightAsBig = ethers.parseEther(weight.toString())

    await synapseCore.contributeExpertKnowledge(id, poolId, weightAsBig)
}

function makeModelFromPoolInfo(info: any) {
    return {
        id: info[0],
        pool: info[1],
        contributor: info[2],
        marketcap: toNumber(info[3]),
        quote: toNumber(info[4]),
        earnings: toNumber(info[5]),
        swapFeesCollected: toNumber(info[6]),
        totalSupply: toNumber(info[7]),
        name: info[8]
    }
}

function toNumber(value: any){
    return Number(ethers.formatEther(value))
}