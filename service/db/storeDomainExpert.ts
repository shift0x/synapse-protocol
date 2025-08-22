import { keccak256 } from 'ethers'
import { DomainExpert } from '../types'
import {db} from './db'
import { generateApiKey } from 'generate-api-key';

export type storeDomainExpertResponse = {
    data?: DomainExpert,
    error?: string
}

export const storeDomainExpert = async (category: string, topic: string, subtopic: string, extradata: any, embedding : number[]) : Promise<storeDomainExpertResponse> => {
    const response : storeDomainExpertResponse = {}
    const key = generateApiKey({ method: "base32", dashes: false})

    const {error, data} = await db.from("experts")
        .insert({
            category,
            key,
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