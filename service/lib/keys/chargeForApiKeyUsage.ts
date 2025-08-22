import { OperationResult } from "../../types";
import { updateAccessKeyLifetimeUsage } from '../../db/updateAccessKeyLifetimeUsage'
import { useApiCreditBalance } from '../accounts/useApiCreditBalance'
import { updateDomainExpertEarnings } from '../../db/updateDomainExpertEarnings'

export const chargeForApiKeyUsage = async (expertKey: string, expertId: number, account: string, accessKey: string, cost: number) : Promise<OperationResult<string>> => {
    const { error : updateError } = await updateAccessKeyLifetimeUsage(accessKey, cost)

    if(updateError)
        return { error: updateError }

    const { error: updateExpertEarningsError } = await updateDomainExpertEarnings(expertId, cost);

    if(updateExpertEarningsError)
        return { error: updateExpertEarningsError}

    const { error: useCreditBalanceError, data: txHash } = await useApiCreditBalance(expertKey, account, cost)

    if(useCreditBalanceError)
        return { error: useCreditBalanceError }

    return {
        data: txHash
    }
}