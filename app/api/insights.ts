import { VercelRequest, VercelResponse } from "@vercel/node";
import { ChatRequest } from '../lib/types';
import { getInterviewsFromPrompt } from '../lib/insights/getInterviewsFromPrompt'

export default async(req: VercelRequest, res: VercelResponse) : Promise<VercelResponse> => {
    try {
        const request = ChatRequest.parse(req.body);
        const { interviews, error, cost } = await getInterviewsFromPrompt(request.prompt)
        
        if(error){ throw error; }

        return res.json({
            price: cost,
            insights: interviews
        })

    } catch(err){
        return res.status(500).json({
            error: err
        });
    }
}