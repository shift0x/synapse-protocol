import { synapseApiEndpoint } from './api.ts'

export const getKnowledgeTopicQuestions = async(id: number): Promise<string[]> => {
    try {
        const endpoint = `${synapseApiEndpoint}/topics/${id}`

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
        
        // The API returns { data: KnowledgeTopic[] }, so extract the data array
        return result.data || []
    } catch (error) {
        console.error('Error fetching knowledge topics:', error)
        throw new Error('Failed to retrieve knowledge topics')
    }
}
