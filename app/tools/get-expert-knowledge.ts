import { z } from 'zod';

export default {
    name: "search-expert-knowledge",
    description: "Searches for expert knowledge related to the given topic / question. Expert knowledge is used to enrich reasoning or answer with authoritative, domain-specific insights that are not found in search engines",
    schema: {
        query: z.string()
    },
    callback: async (query: string) : Promise<any> => {
       return {
            content: [
                { 
                    type: 'text', 
                    text:  query 
                }
            ],
        }
    }
}
    