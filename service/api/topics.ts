import { VercelRequest, VercelResponse } from "@vercel/node";
import { getKnowledgeTopics } from '../db/getKnowledgeTopics';

const handleGet = async (req: VercelRequest, res: VercelResponse): Promise<VercelResponse> => {
    const { data, error } = await getKnowledgeTopics({});

    if (error) {
        return res.status(500).json({ 
            error 
        });
    }

    return res.json({
        data: data || []
    });
};

export default async (req: VercelRequest, res: VercelResponse): Promise<VercelResponse> => {
    // Set CORS headers to allow requests from any origin
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    // Handle preflight requests
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    try {
        const { method } = req;

        switch (method) {
            case 'GET':
                return await handleGet(req, res);
            default:
                return res.status(405).json({ 
                    error: 'Method not allowed' 
                });
        }
    } catch (err) {
        return res.status(500).json({
            error: err
        });
    }
}
