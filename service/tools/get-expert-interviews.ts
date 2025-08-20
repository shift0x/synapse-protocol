import { z } from 'zod';
import { getInterviewsFromPrompt } from '../lib/insights/getInterviewsFromPrompt';

export default {
    name: "search-expert-interviews",
    description: "Returns interviews from subject matter experts on a given topic or question. Subject matter experts use their learned experiences to fine tune and create unique insights. These interviews offer a unique glipse into the mind of experts in the field that go well beyond generic web searches. Use this knowledge to enrich reasoning or answer with authoritative, domain-specific insights that are not found in search engines",
    schema: {
        query: z.string()
    },
    callback: async (query: string) : Promise<any> => {
        const { interviews } = await getInterviewsFromPrompt(query)
        
        return {
            content: [
                {
                    type: "text",
                    text: JSON.stringify(interviews)
                }
            ]
        }
    }
}
    