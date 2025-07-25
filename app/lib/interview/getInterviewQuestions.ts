import {Session} from '../models/session'
import {MODEL_LIBRARY} from '../models/models'
import { OpenAIJsonFormatArgs } from '../models/openai';

const system_message = `
    Imagine you are an interviewer and are currently crafting the questions for a new role at your company. 
    You specficially want to craft questions that give the candidate an opportunity to show their expert knowledge on a topic. 
    
    You define expert knowledge as learnings that come from experience in the field, the things that arn't found in text books but 
    come from experience and observation and reflection. When the user prompts with a topic, you will privde 10 interview questions 
    that meet the above criteria.

    The questions you ask the candidate should be laser focused on the given topic such that the candidate must demonstrate expert level
    knowledge on the topic to pass the interview.

    Format your output as a json array of strings, with each entry being the interview question
`

export type getInterviewQuestionsResponse = {
    questions : string[],
    cost: number
}

export const getInterviewQuestions = async (topic: string) : Promise<getInterviewQuestionsResponse> => {
    const prompt = `topic: ${topic}`
    const session = new Session(system_message)
    
    await session.user('getInterviewQuestions', prompt, MODEL_LIBRARY.high, [], OpenAIJsonFormatArgs)

    const questions = JSON.parse(session.getLastResponse() as string)

    return {
        questions: questions as string[],
        cost: session.cost
    } 
}