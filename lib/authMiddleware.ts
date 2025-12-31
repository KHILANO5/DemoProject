import { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends NextApiRequest {
    user?: {
        id: number;
        email: string;
    };
}

export const authMiddleware = (
    handler: (req: AuthRequest, res: NextApiResponse) => Promise<void>
) => {
    return async (req: AuthRequest, res: NextApiResponse) => {
        try {
            const token = req.headers.authorization?.replace('Bearer ', '');

            if (!token) {
                return res.status(401).json({ error: 'No token provided' });
            }

            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key-change-this-in-production') as {
                id: number;
                email: string;
            };

            req.user = decoded;
            return handler(req, res);
        } catch (error) {
            return res.status(401).json({ error: 'Invalid or expired token' });
        }
    };
};
