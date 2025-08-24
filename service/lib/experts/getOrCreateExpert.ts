import { getDomainExpertsByEmbedding } from '../../db/getDomainExpertsByEmbedding'
import { storeDomainExpert } from '../../db/storeDomainExpert'
import { MODEL_LIBRARY } from "../models/models"
import { DomainExpert, DomainExpertData } from '../../types'
import { createExpertData } from './createExpertData'
import { contributeExpertKnowledge } from '../chain/contributeExpertKnowledge'
import { getSystemAccountPoolInfo } from '../chain/getSystemAccountPoolInfo'

export type getOrCreateExpertResponse = {
    error?: string,
    expert?: DomainExpert
    cost : number
}


export const getOrCreateExpert = async (category: string, topic: string, subtopic: string) : Promise<getOrCreateExpertResponse> => {
    const response : getOrCreateExpertResponse = { cost: 0 }
    const embeddings = await MODEL_LIBRARY.embeddings.embed(subtopic)

    if(!embeddings){ 
        response.error =  "unable to create embeddings";

        return response;
    }

    const { error: getDomainExpertsError, data } = await getDomainExpertsByEmbedding(embeddings, 1, .875)

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

        const {error: storeDomainExpertError, data: newDomainExpert} = await storeDomainExpert(category, topic, subtopic, data, embeddings)

        if(storeDomainExpertError){
            response.error = storeDomainExpertError

            return response;
        }

        const expert = newDomainExpert as DomainExpert

        // we still need to store the domain expert contribution on chain
        const { error: getSystemPoolInfoError, data: systemPool } = await getSystemAccountPoolInfo();

        if(getSystemPoolInfoError){
            response.error = getSystemPoolInfoError

            return response;
        }

       const { error: contributeKnowledgeError } =  await contributeExpertKnowledge(expert.key, systemPool.pool, 1)

       if(contributeKnowledgeError) {
            response.error = contributeKnowledgeError
            
            return response;
       }

        
        response.expert = {
            id: expert.id,
            key: expert.key,
            topic,
            subtopic,
            data: data as DomainExpertData
        }

    } else {
        response.expert = data[0];
    }

    return response;
}