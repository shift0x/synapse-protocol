import { OperationResult } from "../../types";
import { updateAccessKeyLifetimeUsage } from '../../db/updateAccessKeyLifetimeUsage'

export const chargeForApiKeyUsage = async (key: string, cost: number) : Promise<OperationResult<void>> => {
    const { error } = await updateAccessKeyLifetimeUsage(key, cost)

    if(error)
        return { error }

    return {}
}