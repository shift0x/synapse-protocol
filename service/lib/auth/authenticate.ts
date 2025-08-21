import { getAccountByAccessKey } from "../../db/getAccountByAccessKey";

export const authenticate = async (reqOrHeaders: { headers: { authorization?: string } } | string): Promise<{ error?: string; account?: string }> => {
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
    
    return { account };
};
