import { MODEL_LIBRARY } from "../models/models"
import { OpenAIJsonFormatArgs } from "../models/openai"
import { Session } from "../models/session"
import { InterviewQuestionResponse } from "../../types"

const system_message = `imagine you are interviewing for a new position. When the user prompts with a question, you will search for 
expert content related to the question then synthesize their thoughts to create your own response to the interview question.

you provide your responses in json format like this:

{
"question": <interview question>,
"response": <response to the interview question>
}

`

type getQuestionResponseOutput = {
    response: InterviewQuestionResponse,
    cost: number
}

const getQuestionResponse = async (question: string, retryOnError : boolean) : Promise<getQuestionResponseOutput> => {
    const prompt = `question: ${question}`
    const session = new Session(system_message)

    await session.user('getQuestionResponse', prompt, MODEL_LIBRARY.high, [], OpenAIJsonFormatArgs)

    try {
        const response = JSON.parse(session.getLastResponse() as string)

        return {
            response : response as InterviewQuestionResponse,
            cost: session.cost
        }
    } catch(err){
        console.log(`error getting question respone: ${err}`)

        if(retryOnError){
            return getQuestionResponse(question, false)
        }

        return {
            response: {
                question: question,
                error: `${err}`
            },
            cost: session.cost
        }
    }
    
}

export type createDefaultInterviewResponsesResponse = {
    responses: InterviewQuestionResponse[],
    cost: number   
}

export const createDefaultInterviewResponses = async (questions: string[]) : Promise<createDefaultInterviewResponsesResponse> => {
    const operations = questions.map(question => {
        return getQuestionResponse(question, true)
    })

    const responses =  await Promise.all(operations)
    
    const cost = responses
        .map(r => { return r.cost })
        .reduce((prev, curr) => { return prev + curr })

    const validResponses = responses.filter(r => {
        return !r.response.error
    }). map( r => { return r.response })

    return {
        responses: validResponses, 
        cost
    }
}