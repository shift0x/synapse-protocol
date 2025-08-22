import { z } from 'zod';

export const ChatRequest = z.object({
    prompt: z.string()
}) 

export type ChatTopic = {
    category: string,
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

export type KnowledgeTopic = {
    key: string,
    topic: string,
    subtopic: string,
    created_at: Date,
    category: string,
    total_paid: number,
    contributors: number
}

export type DomainExpert = {
    id: number,
    key: string,
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

export type OperationResult<T> = {
    error?: any
    message?: string
    data? : T,
    cost? : number
}

export type AccessKey = {
    id: number,
    name: string,
    created_at: Date,
    owner_address: string,
    access_key: string,
    lifetime_spend: number,
    is_active: boolean
}

export type UserAccount = {
    account: string,
    balance: number,
    active: boolean,
    lifetimeUsage: number
}