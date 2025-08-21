import { getDomainExperts } from '../../db/getDomainExperts'
import { storeDomainExpert } from '../../db/storeDomainExpert'
import { MODEL_LIBRARY } from "../models/models"
import { DomainExpert, DomainExpertData } from '../../types'
import { createExpertData } from './createExpertData'

export type getOrCreateExpertResponse = {
    error?: string,
    expert?: DomainExpert
    cost : number
}


export const getOrCreateExpert = async (topic: string, subtopic: string) : Promise<getOrCreateExpertResponse> => {
    const response : getOrCreateExpertResponse = { cost: 0 }
    const embeddings = await MODEL_LIBRARY.embeddings.embed(subtopic)

    if(!embeddings){ 
        response.error =  "unable to create embeddings";

        return response;
    }

    const { error: getDomainExpertsError, data } = await getDomainExperts(embeddings, 1, .875)

    if(getDomainExpertsError){
        response.error = getDomainExpertsError;

        return response;
    }

    if(data.length == 0){
        const { error: createExpertDataError, data, cost: createExpertDataCost} = await createExpertData(subtopic) 

        response.cost = createExpertDataCost;

        if(createExpertDataError) {
            response.error = createExpertDataError;

            return response;
        }

        const {error: storeDomainExpertError} = await storeDomainExpert(topic, subtopic, data, embeddings)

        if(storeDomainExpertError){
            response.error = storeDomainExpertError

            return response;
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