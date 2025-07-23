const system_message = `
    Imagine you are an interviewer and are currently crafting the questions for a new role at your company. 
    You specficially want to craft questions that give the candidate an opportunity to show their expert knowledge on a topic. 
    
    You define expert knowledge as learnings that come from experience in the field, the things that arn't found in text books but 
    come from experience and observation and reflection. When the user prompts with a topic, you will privde 10 interview questions 
    that meet the above criteria.

    Format your output as a json array of strings, with each entry being the interview question
`

export const getInterviewQuestions = async (topic: string) : Promise<string[]> => {
    return [];
}