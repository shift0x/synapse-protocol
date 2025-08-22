import { DomainExpert } from '../types'
import {db} from './db'

export type storeDomainExpertResponse = {
    data?: DomainExpert,
    error?: string
}

export const storeDomainExpert = async (category: string, topic: string, subtopic: string, extradata: any, embedding : number[]) : Promise<storeDomainExpertResponse> => {
    const response : storeDomainExpertResponse = {}
    const {error, data} = await db.from("experts")
        .insert({
            category,
            topic,
            subtopic,
            embedding,
            data: extradata
        })
        .select()
        .single()

    response.data = data;

    if(error){
        response.error = error.message;
    }  

    return response;
}