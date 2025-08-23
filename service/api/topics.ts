import { VercelRequest, VercelResponse } from "@vercel/node";
import { getKnowledgeTopics } from '../db/getKnowledgeTopics';
import { getKnowledgeTopicQuestions } from '../db/getKnowledgeTopicQuestions';
import { storeInterviewResponses } from '../db/storeInterviewResponses';
import { storeNewExpertContribution } from '../lib/experts/storeNewExpertContribution'

const handleGet = async (req: VercelRequest, res: VercelResponse): Promise<VercelResponse> => {
    // Set CORS headers to allow requests from any origin
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    // Handle preflight requests
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    const { url } = req;
    const pathParts = url?.split('/') || [];
    const id = pathParts[3]; // /api/topics/id -> index 3

    // If ID is provided, get questions for that topic
    if (id) {
        const topicId = parseInt(id, 10);
        if (isNaN(topicId)) {
            return res.status(400).json({ 
                error: 'ID must be a valid number' 
            });
        }

        const { data, error } = await getKnowledgeTopicQuestions(topicId);

        if (error) {
            return res.status(500).json({ 
                error 
            });
        }

        return res.json({
            data: data || []
        });
    }

    // Otherwise, get all topics
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

const handlePost = async (req: VercelRequest, res: VercelResponse): Promise<VercelResponse> => {
    const { key, contributor, interview } = req.body;

    if (!key || !contributor || !interview) {
        return res.status(400).json({ 
            error: 'Missing required fields: id, contributor, interview' 
        });
    }

    const { error, data: txHash } = await storeNewExpertContribution(key, contributor, interview)

    if (error) {
        return res.status(500).json({ 
            error 
        });
    }

    return res.json({
        data: {
            txHash: txHash
        },
        message: 'Interview responses stored successfully'
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
            case 'POST':
                return await handlePost(req, res);
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
