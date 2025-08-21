import { ethers, formatEther } from 'ethers';
import { OperationResult, UserAccount } from '../../types';
import { SynapseCoreContract } from './contracts';

const deadAddress = "0x0000000000000000000000000000000000000000";

export const getAPIAccount = async(account: string) : Promise<OperationResult<UserAccount>> => {
    try {
        const provider = new ethers.JsonRpcProvider(process.env.RPC_URL as string);
        
        const contract = new ethers.Contract(
            SynapseCoreContract.address,
            SynapseCoreContract.abi,
            provider
        );

        const result = await contract.getAPIAccount(account);

        const userAccount: UserAccount = {
            account: result[0],
            balance: Number(formatEther(result[1])),
            active: result[2],
            lifetimeUsage: Number(formatEther(result[3]))
        };

        if(userAccount.account == deadAddress){
            return { error: `api account not found: ${account}` }
        }

        return {
            data: userAccount
        };
    } catch (error) {
        return {
            error: error,
            message: `Failed to get API account for address ${account}`
        };
    }
}