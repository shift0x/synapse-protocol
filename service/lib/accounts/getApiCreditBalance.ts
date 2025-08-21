import { OperationResult } from "../../types";
import { getAPIAccount } from '../chain/getAPIAccount';

export const getApiCreditBalance = async(account: string) : Promise<OperationResult<number>> => {
    const { error, message, data } = await getAPIAccount(account);

    if(error || message){
        return { error, message }
    }

    return {
        data: data?.balance
    };
}