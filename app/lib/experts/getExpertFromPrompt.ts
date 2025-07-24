import {getPromptTopic} from './getPromptTopic'
import {getOrCreateExpert} from './getOrCreateExpert'
import { DomainExpert } from '../types'

export type getExpertFromPromptResponse = {
    error? : string,
    expert?: DomainExpert
}

export const getExpertFromPrompt = async (prompt: string) : Promise<getExpertFromPromptResponse> => {
    const topic = await getPromptTopic(prompt)
    
    return await getOrCreateExpert(topic.topic, topic.specialization)
}