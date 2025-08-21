import { MODEL_LIBRARY } from '../models/models';
import { OpenAIJsonFormatArgs } from '../models/openai';
import { Session } from '../models/session'
import { ChatTopic } from '../../types';

const system_prompt = `
    Imagine you work in a virtual switch board. On one side of the switch board are highly specialized ai agents that are 
    subject matter experts in a specific specialization. Specializations are very granular and agents are purpose built to
    answer one specific question. You are responsible for taking user queries and distilling them into their topic and 
    corresponding agent specialization.

    when users provide you queries you respond with a json object with the corresponding topic and specialization like this:

    {
        "topic": <topic of the query>,
        "specialization": <specialized sub topic>
    }
`

export type getPromptTopicResponse = {
    error?: string,
    chatTopic? : ChatTopic,
    cost?:number
}

export const getPromptTopic = async (prompt: string) : Promise<getPromptTopicResponse> => {
    const session = new Session(system_prompt);
    const key = 'getPromptTopic'
    const input = `${prompt}`

    await session.user(key, input, MODEL_LIBRARY.high, [],  OpenAIJsonFormatArgs)
    
    const response = (session.getLastResponse()) as string
    const data = JSON.parse(response);
    
    return {
        chatTopic: {
            topic: data.topic.toLowerCase(),
            specialization: data.specialization.toLowerCase()
        },
        cost: session.cost
    }
}