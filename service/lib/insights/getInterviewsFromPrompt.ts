import { DomainExpertInterview } from "../../types";
import { getExpertFromPrompt } from "../experts/getExpertFromPrompt";
import { getInterviewsFromExpert } from './getInterviewsFromExpert';

export type getInsightsFromPromptResponse = {
    error?: string,
    expertId? : number,
    interviews?: DomainExpertInterview[] ,
    cost: number
}

export const getInterviewsFromPrompt = async(prompt: string) : Promise<getInsightsFromPromptResponse> => {
    const { expert, error, cost = 0 } = await getExpertFromPrompt(prompt);
        
    if(error || !expert ){ 
        return {
            error: `${error || "expert not found"} `,
            cost
        }
     }

    const interviews = await getInterviewsFromExpert(expert);

    return {
        expertId: expert.id,
        interviews,
        cost
    };
}