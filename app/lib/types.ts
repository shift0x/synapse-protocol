import { z } from 'zod';

export const ChatRequest = z.object({
    prompt: z.string()
}) 

export type ChatTopic = {
    topic: string,
    specialization: string
}


export type PromptResponse = {
    error: Error | undefined,
    output: string | undefined,
    reasoning?: string | undefined,
    tokens: number,
}

export type Completion = {
    key: string,
    prompt: string,
    model: string,
    response: PromptResponse
}