export type AccessKey = {
    id: number,
    name: string,
    created_at: Date,
    owner_address: string,
    access_key: string,
    lifetime_spend: number,
    is_active: boolean
}

export type KnowledgeTopic = {
    id: number,
    key: string,
    topic: string,
    subtopic: string,
    created_at: Date,
    category: string,
    total_paid: number,
    contributors: number
}

export interface InterviewResponse {
    question: string;
    answer: string;
}

export interface StoreInterviewRequest {
    key: string;
    contributor: string;
    interview: InterviewResponse[];
}