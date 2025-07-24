import { getInterviewQuestions } from "../interview/getInterviewQuestions"
import { DomainExpertData, DomainExpertInterviews } from "../types"
import { createDefaultInterviewResponses } from "./createDefaultInterviewResponses"

export type createExpertDataResponse = {
    error?: string,
    data?: DomainExpertData
}

export const createExpertData = async(subtopic: string) : Promise<createExpertDataResponse> => {
    const questions = await getInterviewQuestions(subtopic);
    const defaultResponses = await createDefaultInterviewResponses(questions);

    if(defaultResponses.length == 0){
        return {
            error: "unable to generate default interview responses"
        }
    }

    const interviews : DomainExpertInterviews = {
        questions,
        responses: {
            default: defaultResponses
        }
    }

    return { data : { interviews } }
}