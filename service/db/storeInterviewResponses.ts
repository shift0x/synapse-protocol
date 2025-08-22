import { InterviewQuestionResponse, OperationResult } from "../types";
import { db } from "./db";

export const storeInterviewResponses = async(
    key: string, 
    contributor: string, 
    interview: InterviewQuestionResponse[]
) : Promise<OperationResult<void>> => {

    const { data : expertData, error } = await db
        .from("experts")
        .select("contributors, data")
        .eq("key", key)
        .single()

    if(error)
        return { error : error.message }
    else if(!expertData)
        return { error: `not found` }

    expertData.data.interviews.responses[contributor] = interview;

    const { error: updateError } = await db
        .from("experts")
        .update({ data: expertData.data, contributors: expertData.contributors + 1 })
        .eq("key", key)

    if(updateError){
        return { error: updateError.message }
    }

    return {}
}