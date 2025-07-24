import { MODEL_LIBRARY } from "../models/models"
import { OpenAIJsonFormatArgs } from "../models/openai"
import { Session } from "../models/session"
import { InterviewQuestionResponse } from "../types"

const system_message = `imagine you are interviewing for a new position. When the user prompts with a question, you will search for 
expert content related to the question then synthesize their thoughts to create your own response to the interview question.

you provide your responses in json format like this:

{
"question": <interview question>,
"response": <response to the interview question>
}

`

const getQuestionResponse = async (question: string, retryOnError : boolean) : Promise<InterviewQuestionResponse> => {
    const prompt = `question: ${question}`
    const session = new Session(system_message)

    await session.user('getQuestionResponse', prompt, MODEL_LIBRARY.high, [], OpenAIJsonFormatArgs)

    try {
        const response = JSON.parse(session.getLastResponse() as string)

        return response as InterviewQuestionResponse
    } catch(err){
        console.log(`error getting question respone: ${err}`)

        if(retryOnError){
            return getQuestionResponse(question, false)
        }

        return {
            question: question,
            error: `${err}`
        }
    }
    
}

export const createDefaultInterviewResponses = async (questions: string[]) : Promise<InterviewQuestionResponse[]> => {
    const operations = questions.map(question => {
        return getQuestionResponse(question, true)
    })

    const responses =  await Promise.all(operations)

    return responses.filter(r => {
        return !r.error
    })
}