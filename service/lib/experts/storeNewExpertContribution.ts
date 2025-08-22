import { InterviewQuestionResponse, OperationResult } from "../../types";
import { storeInterviewResponses } from '../../db/storeInterviewResponses'
import { contributeExpertKnowledge } from "../chain/contributeExpertKnowledge";

export const storeNewExpertContribution = async (
    expertKey: string, 
    contributorPool: string, 
    interview: InterviewQuestionResponse[]
) : Promise<OperationResult<string>> => {
    // store responses in database
    const { error: dbStorageError } = await storeInterviewResponses(expertKey, contributorPool, interview);

    if(dbStorageError)
        return { error : dbStorageError }

    // store contributor weights in smart contract
    const { error: contributeError, data: txHash } = await contributeExpertKnowledge(expertKey, contributorPool, 1)

    if(contributeError)
        return { error: contributeError }

    return {
        data: txHash
    }
}