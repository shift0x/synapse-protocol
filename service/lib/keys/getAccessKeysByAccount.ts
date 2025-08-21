import { getAccessKeys } from "../../db/getAccessKeys";
import { AccessKey, OperationResult } from "../../types";
import { getObfuscatedAccessKey } from './getObfuscatedAccessKey';

export const getAccessKeysByAccount = async(account: string) : Promise<OperationResult<AccessKey[]>> => {
    const { error, message, data: keys } = await getAccessKeys({
        account
    })

    if(error || message){
        return { error, message }
    } 

    if(!keys){
        return { message: "error getting keys"}
    }

    const obfuscatedKeys = keys.map(key => { return getObfuscatedAccessKey(key) })

    return {
        data: obfuscatedKeys
    }
}