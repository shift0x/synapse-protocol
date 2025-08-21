import { OperationResult } from "../../types";
import { updateAccessKeyLifetimeUsage } from '../../db/updateAccessKeyLifetimeUsage'
import { useApiCreditBalance } from '../accounts/useApiCreditBalance'

export const chargeForApiKeyUsage = async (account: string, key: string, cost: number) : Promise<OperationResult<void>> => {
    const { error : updateError } = await updateAccessKeyLifetimeUsage(key, cost)

    if(updateError)
        return { error: updateError }

    return useApiCreditBalance(account, cost)
}