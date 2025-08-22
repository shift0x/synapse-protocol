export type SynapseAPIUser = {
    account: string,
    balance: number,
    active: boolean
    lifetimeUsage: number
}

export type ContributorPoolInfo = {
    id: number,
    pool: string,
    contributor: string,
    marketcap: number,
    quote: number,
    earnings: number,
    swapFeesToken0: number,
    swapFeesToken1: number,
    totalSupply: number,
    name: string,
    isRegistered: boolean,
    swapFeesInUSDC: number
}