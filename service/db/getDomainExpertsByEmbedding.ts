import { db } from "./db"

export type getDomainExpertsResponse = {
    error? : string,
    data? : any[]
}

export const getDomainExpertsByEmbedding = async (embedding : number[], match_count: number, match_threshold : number) : Promise<any> => {
    const { data, error } = await db.rpc('search_domain_experts', {
        embedding,
        match_threshold,
        match_count
    })

    return { error, data }
}