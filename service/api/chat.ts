import { VercelRequest, VercelResponse } from "@vercel/node";
import { ChatRequest } from '../types';
import { getChatResponse } from '../lib/chat/getChatResponse'

export default async(req: VercelRequest, res: VercelResponse) : Promise<VercelResponse> => {
    // Set CORS headers to allow requests from any origin
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    // Handle preflight requests
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

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