import { OperationResult, KnowledgeTopic } from '../types'
import { db } from './db'

export const getKnowledgeTopics = async(query: {
    id?: number
}) : Promise<OperationResult<KnowledgeTopic[]>> => {

    let filter = db
        .from("experts")
        .select("id, key, topic, subtopic, created_at, category, contributors, total_paid")

    if(query.id)
        filter = filter.eq("id", query.id)

    const { error, data } = await filter

    return {
        error,
        data: data as KnowledgeTopic[]
    }

}