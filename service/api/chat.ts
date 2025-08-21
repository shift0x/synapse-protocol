import { VercelRequest, VercelResponse } from "@vercel/node";
import { ChatRequest } from '../types';
import { getChatResponse } from '../lib/chat/getChatResponse'

export default async(req: VercelRequest, res: VercelResponse) : Promise<VercelResponse> => {
    try {
        const request = ChatRequest.parse(req.body);
        const response = await getChatResponse(request.prompt);
        
        return res.json({
            data: response
        })

    } catch(err){
        return res.status(500).json({
            error: err
        });
    }
}