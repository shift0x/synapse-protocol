import { getDomainExperts } from '../../db/getDomainExperts'
import { storeDomainExpert } from '../../db/storeDomainExpert'
import { MODEL_LIBRARY } from "../models/models"
import { DomainExpert, DomainExpertData } from '../types'
import { createExpertData } from './createExpertData'

export type getOrCreateExpertResponse = {
    error?: string,
    expert?: DomainExpert
}


export const getOrCreateExpert = async (topic: string, subtopic: string) : Promise<getOrCreateExpertResponse> => {
    const response : getOrCreateExpertResponse = {}
    const embeddings = await MODEL_LIBRARY.embeddings.embed(subtopic)

    if(!embeddings){ 
        return { error:  "unable to create embeddings" }
    }

    const { error: getDomainExpertsError, data } = await getDomainExperts(embeddings, 1, .95)

    if(getDomainExpertsError){
        return {error : getDomainExpertsError}
    }

    if(data.length == 0){
        const { error: createExpertDataError, data} = await createExpertData(subtopic) 

        if(createExpertDataError) {
            return { error: createExpertDataError }
        }

        const {error: storeDomainExpertError} = await storeDomainExpert(topic, subtopic, data, embeddings)

        if(storeDomainExpertError){
            return { error: storeDomainExpertError }
        }
        
        response.expert = {
            topic,
            subtopic,
            data: data as DomainExpertData
        }

    } else {
        response.expert = data[0];
    }

    return response;
}