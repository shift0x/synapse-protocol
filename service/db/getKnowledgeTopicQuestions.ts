import { OperationResult } from '../types'
import { db } from './db'

export const getKnowledgeTopicQuestions = async(id: number) : Promise<OperationResult<string[]>> => {
    const { data, error } = await db
                                .from("experts")
                                .select("data")
                                .eq("id", id)
                                .single()

    
    if(error)
        return { error }
    else if(!data)
        return { error: "not found" }

    const questions = (data as any).data.interviews.questions

    return {
        data: questions
    }
}