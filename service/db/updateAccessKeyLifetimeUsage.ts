import { AccessKey, OperationResult } from "../types";
import { db } from "./db";
import { getAccessKeys } from "./getAccessKeys";

export const updateAccessKeyLifetimeUsage = async(accessKey: string, cost: number) : Promise<OperationResult<void>> => {
    const { error: getAccessKeyError, data } = await getAccessKeys({ key: accessKey })

    if(getAccessKeyError)
        return { error: getAccessKeyError }
    if(!data || data.length == 0)
        return { message: "key not found"}

    const key = (data as AccessKey[])[0]

    const { error } = await db
        .from("access_keys")
        .update({
            lifetime_spend: key.lifetime_spend + cost
        })
        .eq('access_key', accessKey)

    return { error }
}