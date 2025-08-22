import { OperationResult } from "../../types";
import { updateAccessKeyLifetimeUsage } from '../../db/updateAccessKeyLifetimeUsage'
import { useApiCreditBalance } from '../accounts/useApiCreditBalance'
import { updateDomainExpertEarnings } from '../../db/updateDomainExpertEarnings'

export const chargeForApiKeyUsage = async (expertId: number, account: string, key: string, cost: number) : Promise<OperationResult<void>> => {
    const { error : updateError } = await updateAccessKeyLifetimeUsage(key, cost)

    if(updateError)
        return { error: updateError }

    const { error: updateExpertEarningsError } = await updateDomainExpertEarnings(expertId, cost);

    if(updateExpertEarningsError)
        return { error: updateExpertEarningsError}

    return useApiCreditBalance(account, cost)
}