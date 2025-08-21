import {DomainExpert, DomainExpertInterview} from '../../types'

export const getInterviewsFromExpert = async (expert: DomainExpert) : Promise<DomainExpertInterview[]> => {

    const interviews = Object.keys(expert.data.interviews.responses).map(id => {
        const interview : DomainExpertInterview = {
            expert: id,
            interview: []
        }

        const responses = expert.data.interviews.responses[id].map(response => {
            return {
                question: response.question,
                response: response.response as string
            }
        })

        interview.interview = responses

        return interview;
    });

    return interviews
}