import { synapseApiEndpoint } from './api.ts';
import { AccessKey } from './types'

export interface CreateAgentKeyRequest {
  name: string;
}

export interface CreateAgentKeyResult {
  success: boolean;
  data?: AccessKey;
  error?: string;
}

export const createAgentKey = async (account: string, agentName: string): Promise<CreateAgentKeyResult> => {
    try {
        const endpoint = `${synapseApiEndpoint}/keys/${account}`
        
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                name: agentName
            })
        })

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            return {
                success: false,
                error: errorData.error || `HTTP error! status: ${response.status}`
            };
        }

        const result = await response.json()

        // The API returns { data: AccessKey, message: string }, so extract the full access key data
        return {
            success: true,
            data: result.data
        };
    } catch (error) {
        console.error('Error creating agent key:', error)
        return {
            success: false,
            error: 'Failed to create agent key'
        };
    }
}
