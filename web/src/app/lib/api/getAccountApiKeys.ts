import { synapseApiEndpoint } from './api.ts'
import { AccessKey } from './types'

export const getAccountApiKeys = async(account: string) : Promise<AccessKey[]> => {
    try {
        const endpoint = `${synapseApiEndpoint}/keys/${account}`

        const response = await fetch(endpoint, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        })

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`)
        }

        const result = await response.json()
        
        // The API returns { data: AccessKey[], message? }, so extract the data array
        return result.data || []
    } catch (error) {
        console.error('Error fetching account API keys:', error)
        throw new Error('Failed to retrieve account API keys')
    }
}