import { VercelRequest, VercelResponse } from "@vercel/node";
import { getAccessKeysByAccount } from '../lib/keys/getAccessKeysByAccount';
import { generateAccessKey } from '../lib/keys/generateAccessKey';
import { deactivateAccessKey } from '../lib/keys/deactivateAccessKey';
 
const handleGet = async (req: VercelRequest, res: VercelResponse, account: string): Promise<VercelResponse> => {
    const { data, error, message } = await getAccessKeysByAccount(account);

    if (error) {
        return res.status(500).json({ 
            error 
        });
    }

    return res.json({
        data: data || [],
        message
    });
};

const handlePost = async (req: VercelRequest, res: VercelResponse, account: string): Promise<VercelResponse> => {
    const { name } = req.body;

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
        return res.status(400).json({
            error: 'Name is required and must be a non-empty string'
        });
    }

    const { data, error, message } = await generateAccessKey(account, name.trim());

    if (error || message) {
        return res.status(500).json({ 
            error: error || message
        });
    }

    return res.status(201).json({
        data,
        message: 'Access key created successfully'
    });
};


const handleDelete = async (req: VercelRequest, res: VercelResponse, account: string): Promise<VercelResponse> => {
    const { url } = req;
    const pathParts = url?.split('/') || [];
    const id = pathParts[4]; // /api/keys/account/id -> index 4

    if (!id) {
        return res.status(400).json({
            error: 'ID parameter is required in URL path: /api/keys/:account/:id'
        });
    }

    const keyId = parseInt(id, 10);
    if (isNaN(keyId)) {
        return res.status(400).json({
            error: 'ID must be a valid number'
        });
    }

    const { error, message } = await deactivateAccessKey(account, keyId);

    if (error) {
        return res.status(500).json({
            error
        });
    }

    return res.json({
        message: message || 'Access key deactivated successfully'
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
        const { method, url } = req;
        
        // Parse account from URL path: /api/keys/account -> account
        const pathParts = url?.split('/') || [];
        const account = pathParts[3]; // /api/keys/account -> index 3

        if (!account) {
            return res.status(400).json({ 
                error: 'Account parameter is required in URL path: /api/keys/:account' 
            });
        }

        switch (method) {
            case 'GET':
                return await handleGet(req, res, account);
            case 'POST':
                return await handlePost(req, res, account);
            case 'DELETE':
                return await handleDelete(req, res, account);
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
