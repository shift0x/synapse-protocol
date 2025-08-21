import { OperationResult } from "../types";
import { getAccessKeys } from "./getAccessKeys";

export const getAccountByAccessKey = async(key: string) : Promise<OperationResult<string>> => {
    const { error, message, data : accessKeys } = await getAccessKeys({ key })

    if(error){
        return { error }
    } else if(!accessKeys || message){
        return { message }
    } else if (accessKeys.length == 0){
        return {
            error: "account not found for access key"
        }
    } 

    const accessKey = accessKeys[0];

    if(!accessKey.is_active) {
        return {
            message: "key is inactive"
        }
    }

    return {
        data: accessKey.owner_address
    } 
}