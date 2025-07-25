import { getExpertFromPrompt } from '../experts/getExpertFromPrompt'
import { MODEL_LIBRARY } from '../models/models'
import { OpenAIReasoningArgs } from '../models/openai'
import { Session } from '../models/session'
import { DomainExpert } from '../types'

export type chatResponse = {
    error?: string,
    response? : string,
    experts?: string[],
    price? : number
}

const getSystemMessage = (expert : DomainExpert) : string => {
    return `
        You are a distinguished speaker at a conference on ${expert.topic}. You were invited to the conference because of your
        specific expertise on ${expert.subtopic}. 

        As preperation for this honor, you interviewed eteeemed collegues and subject matter experts on ${expert.subtopic}. You've studied 
        their responses to your questions and you embody their deep knowledge and persona into your own knowledge. 
        
        Now that your speech has ended, the question and answer session has begun. Members of the audience ask questions and you respond drawing
        from the deep knowledge of the subject matter experts you interviewed to answer the questions.
        
        You carefully review their responses and your own background knowledge to offer give responses that reflect deep expert knowledge on 
        the topic that only come from years of experience in the field.

        Here is a json representation of their interviews and responses:

        ${JSON.stringify(expert.data.interviews)}
    `
} 

export const getChatResponse = async(prompt: string) : Promise<chatResponse> => {
    const {error, expert, cost: getExpertCost = 0} = await getExpertFromPrompt(prompt)

    if(error || !expert){
        return { error }
    }

    const systemMessage = getSystemMessage(expert as DomainExpert);

    const session = new Session(systemMessage);

    await session.user("getChatResponse", prompt, MODEL_LIBRARY.reasoning, [], OpenAIReasoningArgs("high"))

    const response = session.getLastResponse()
    const experts = Object.keys(expert.data.interviews.responses)

    const price = session.cost + getExpertCost;

    return {response, experts, price}
}