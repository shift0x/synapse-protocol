import {db} from './db'

export type storeDomainExpertResponse = {
    error?: string
}

export const storeDomainExpert = async (topic: string, subtopic: string, data: any, embedding : number[]) : Promise<storeDomainExpertResponse> => {
    const response : storeDomainExpertResponse = {}
    const {error} = await db.from("experts")
        .insert({
            topic,
            subtopic,
            embedding,
            data
        })

    if(error){
        response.error = error.message;
    } 

    return response;
}