import { storeAccessKey } from "../../db/storeAccessKey";
import { OperationResult } from "../../types";
import { generateApiKey } from 'generate-api-key';

export const generateAccessKey = async(account: string, name: string) : Promise<OperationResult<any>> => {
    const keyGenerationResult = generateApiKey({ method: 'uuidv4' });
    const key = keyGenerationResult.toString();

    const { error: storeError } = await storeAccessKey(account, key, name);

    if(storeError) {
        return { error: storeError}
    }

    return {
        data: key
    }
}