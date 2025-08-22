import { synapseApiEndpoint } from "./api.ts";

export interface DeactivateApiKeyResult {
  success: boolean;
  message?: string;
  error?: string;
}

export const deactivateApiKey = async (account: string, keyId: number): Promise<DeactivateApiKeyResult> => {
    try {
        const endpoint = `${synapseApiEndpoint}/keys/${account}/${keyId}`

        const response = await fetch(endpoint, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
        })

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            return {
                success: false,
                error: errorData.error || `HTTP error! status: ${response.status}`
            };
        }

        const result = await response.json()

        return {
            success: true,
            message: result.message || 'Access key deactivated successfully'
        };
    } catch (error) {
        console.error('Error deactivating API key:', error)
        return {
            success: false,
            error: 'Failed to deactivate API key'
        };
    }
}
