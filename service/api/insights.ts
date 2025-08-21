import { VercelRequest, VercelResponse } from "@vercel/node";
import { ChatRequest } from '../types';
import { getInterviewsFromPrompt } from '../lib/insights/getInterviewsFromPrompt';
import { authenticate } from '../lib/auth/authenticate';
import { chargeForApiKeyUsage } from "../lib/keys/chargeForApiKeyUsage";

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
        // Authenticate request
        const { error: authError, account = "", accessKey = "" } = await authenticate(req);
        
        if (authError) {
            return res.status(401).json({
                error: authError
            });
        }

        const request = ChatRequest.parse(req.body);
        const { interviews, error, cost } = await getInterviewsFromPrompt(request.prompt)
        
        if(error){ throw error; }

        await chargeForApiKeyUsage(account, accessKey, cost )

        return res.json({
            price: cost,
            insights: interviews,
            account
        })

    } catch(err){
        return res.status(500).json({
            error: err
        });
    }
}