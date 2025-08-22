import { synapseApiEndpoint } from './api.ts';
import { StoreInterviewRequest, InterviewResponse } from './types'

export interface StoreInterviewResult {
    success: boolean;
    data?: {
        txHash: string;
    };
    error?: string;
}

export const storeInterviewResponses = async (
    key: string, 
    contributorPool: string, 
    interview: InterviewResponse[]
): Promise<StoreInterviewResult> => {
    try {
        const endpoint = `${synapseApiEndpoint}/topics`
        
        const requestBody: StoreInterviewRequest = {
            key,
            contributor: contributorPool,
            interview
        };
        
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody)
        })

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            return {
                success: false,
                error: errorData.error || `HTTP error! status: ${response.status}`
            };
        }

        const result = await response.json()

        // The API returns { data: { txHash }, message: string }
        return {
            success: true,
            data: result.data
        };
    } catch (error) {
        console.error('Error storing interview responses:', error)
        return {
            success: false,
            error: 'Failed to store interview responses'
        };
    }
}
