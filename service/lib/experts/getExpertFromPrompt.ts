import {getPromptTopic} from './getPromptTopic'
import {getOrCreateExpert} from './getOrCreateExpert'
import { DomainExpert } from '../types'

export type getExpertFromPromptResponse = {
    error? : string,
    expert?: DomainExpert,
    cost?: number
}

export const getExpertFromPrompt = async (prompt: string) : Promise<getExpertFromPromptResponse> => {
    const { error: getPromptTopicError, chatTopic, cost: getPromptTopicCost = 0 } = await getPromptTopic(prompt)

    if(getPromptTopicError || !chatTopic){
        return {
            error: getPromptTopicError || "chat topic is undefined"
        }
    }

    const { error: getOrCreateExpertError, expert, cost: getOrCreateExpertCost = 0} = await getOrCreateExpert(chatTopic.topic, chatTopic.specialization)
    
    if(getOrCreateExpertError) {
        return {
            error: getOrCreateExpertError
        }
    } 

    return {
        expert,
        cost: getOrCreateExpertCost + getPromptTopicCost
    }
}