import { getInterviewQuestions } from "../interview/getInterviewQuestions"
import { DomainExpertData, DomainExpertInterviews } from "../types"
import { createDefaultInterviewResponses } from "./createDefaultInterviewResponses"

export type createExpertDataResponse = {
    error?: string,
    data?: DomainExpertData,
    cost: number
}

export const createExpertData = async(subtopic: string) : Promise<createExpertDataResponse> => {
    const { questions, cost: interviewQuestionsCost } = await getInterviewQuestions(subtopic);
    const { responses: defaultResponses, cost: interviewResponsesCost } = await createDefaultInterviewResponses(questions);

    const cost = interviewQuestionsCost+interviewResponsesCost
    
    if(defaultResponses.length == 0){
        return {
            error: "unable to generate default interview responses",
            cost
        }
    }

    const interviews : DomainExpertInterviews = {
        questions,
        responses: {
            default: defaultResponses
        }
    }

    return { data : { interviews }, cost }
}