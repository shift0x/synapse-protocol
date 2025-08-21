import { getAccountByAccessKey } from "../../db/getAccountByAccessKey";
import { getApiCreditBalance } from "../accounts/getApiCreditBalance";

export const authenticate = async (reqOrHeaders: { headers: { authorization?: string } } | string): Promise<{ error?: string; account?: string; accessKey?: string }> => {
    let accessKey: string;
    
    if (typeof reqOrHeaders === 'string') {
        // Direct bearer token
        accessKey = reqOrHeaders;
    } else {
        // Request object with headers
        const authHeader = reqOrHeaders.headers.authorization;
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return { error: 'Authorization header with Bearer token required' };
        }
        
        accessKey = authHeader.substring(7); // Remove 'Bearer ' prefix
    }
    
    if (!accessKey) {
        return { error: 'Access key is required' };
    }
    
    const { data: account, error, message } = await getAccountByAccessKey(accessKey);
    
    if (error) {
        return { error };
    }
    
    if (message) {
        return { error: message };
    }
    
    if (!account) {
        return { error: 'Invalid access key' };
    }

    // check the account balance to ensure it is not zero. If it's not zero then return undefined
    const { error : apiCreditBalanceError, message : apiCreditBalanceMessage, data: balance } = await getApiCreditBalance(account)

    if(apiCreditBalanceError || apiCreditBalanceMessage){
        return { error: apiCreditBalanceError || apiCreditBalanceMessage }
    } 
    
    if (balance && balance == 0){
        return { error: 'account has zero balance' }
    }
    
    return { account, accessKey };
};
