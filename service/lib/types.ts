import { z } from 'zod';

export const ChatRequest = z.object({
    prompt: z.string()
}) 

export type ChatTopic = {
    topic: string,
    specialization: string
}

export type InterviewQuestionResponse = {
    question: string,
    response?: string,
    error?: string
}

export type DomainExpertInterview = {
    expert: string,
    interview: DomainExpertInsight[]
}

export type DomainExpertInsight = {
    question: string,
    response: string
}

export type DomainExpert = {
    topic: string,
    subtopic: string,
    data: DomainExpertData
}

export type DomainExpertData = {
    interviews: DomainExpertInterviews
}

export type DomainExpertInterviews = {
    questions: string[],
    responses: { [key: string] : InterviewQuestionResponse[] }
}

export type PromptResponse = {
    error: Error | undefined,
    output?: string | undefined,
    reasoning?: string | undefined,
    tokens?: number,
    cost?: number
}

export type Completion = {
    key: string,
    prompt: string,
    model: string,
    response: PromptResponse
}