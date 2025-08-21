import { z } from 'zod';
import { getInterviewsFromPrompt } from '../lib/insights/getInterviewsFromPrompt';
import { chargeForApiKeyUsage } from '../lib/keys/chargeForApiKeyUsage';

export default {
    name: "search-expert-interviews",
    description: "Returns interviews from subject matter experts on a given topic or question. Subject matter experts use their learned experiences to fine tune and create unique insights. These interviews offer a unique glipse into the mind of experts in the field that go well beyond generic web searches. Use this knowledge to enrich reasoning or answer with authoritative, domain-specific insights that are not found in search engines",
    schema: {
        query: z.string()
    },
    callback: async (query: string, authInfo: any) : Promise<any> => {
        const { interviews, cost } = await getInterviewsFromPrompt(query)

        await chargeForApiKeyUsage(authInfo.token, cost)
        
        return {
            content: [
                {
                    type: "text",
                    text: JSON.stringify({
                        interviews
                    })
                }
            ]
        }
    }
}
    