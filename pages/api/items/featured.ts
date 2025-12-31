import type { NextApiRequest, NextApiResponse } from 'next';
import pool from '@/lib/db';
import { RowDataPacket } from 'mysql2';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const query = `
      SELECT i.*, 
             u.id as uploader_id, u.email as uploader_email, 
             u.full_name as uploader_name, u.avatar_url as uploader_avatar
      FROM items i
      JOIN users u ON i.user_id = u.id
      WHERE i.status = 'available'
      ORDER BY i.created_at DESC
      LIMIT 8
    `;

        const [items] = await pool.query<RowDataPacket[]>(query);

        const formattedItems = items.map((item: any) => ({
            ...item,
            images: JSON.parse(item.images || '[]'),
            uploader: {
                id: item.uploader_id,
                email: item.uploader_email,
                full_name: item.uploader_name,
                avatar_url: item.uploader_avatar,
            },
        }));

        return res.status(200).json({ items: formattedItems });
    } catch (error) {
        console.error('Get featured items error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
