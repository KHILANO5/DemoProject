import type { NextApiRequest, NextApiResponse } from 'next';
import { authMiddleware, AuthRequest } from '@/lib/authMiddleware';
import pool from '@/lib/db';
import { RowDataPacket } from 'mysql2';

async function handler(req: AuthRequest, res: NextApiResponse) {
    const { id } = req.query;

    if (req.method === 'GET') {
        return handleGet(req, res, id as string);
    } else if (req.method === 'PUT') {
        return handlePut(req, res, id as string);
    } else if (req.method === 'DELETE') {
        return handleDelete(req, res, id as string);
    } else {
        return res.status(405).json({ error: 'Method not allowed' });
    }
}

async function handleGet(req: AuthRequest, res: NextApiResponse, id: string) {
    try {
        const query = `
      SELECT i.*, 
             u.id as uploader_id, u.email as uploader_email, 
             u.full_name as uploader_name, u.avatar_url as uploader_avatar,
             u.created_at as uploader_created_at
      FROM items i
      JOIN users u ON i.user_id = u.id
      WHERE i.id = ?
    `;

        const [items] = await pool.query<RowDataPacket[]>(query, [id]);

        if (items.length === 0) {
            return res.status(404).json({ error: 'Item not found' });
        }

        const item = items[0] as any;
        const formattedItem = {
            ...item,
            images: JSON.parse(item.images || '[]'),
            uploader: {
                id: item.uploader_id,
                email: item.uploader_email,
                full_name: item.uploader_name,
                avatar_url: item.uploader_avatar,
                created_at: item.uploader_created_at,
            },
        };

        return res.status(200).json({ item: formattedItem });
    } catch (error) {
        console.error('Get item error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}

async function handlePut(req: AuthRequest, res: NextApiResponse, id: string) {
    try {
        const userId = req.user?.id;
        const { title, description, category, size, item_condition, images, points_value } = req.body;

        // Check ownership
        const [items] = await pool.query<RowDataPacket[]>('SELECT user_id FROM items WHERE id = ?', [id]);

        if (items.length === 0) {
            return res.status(404).json({ error: 'Item not found' });
        }

        if (items[0].user_id !== userId) {
            return res.status(403).json({ error: 'Not authorized to update this item' });
        }

        // Update item
        await pool.query(
            `UPDATE items SET title = ?, description = ?, category = ?, size = ?, 
       item_condition = ?, images = ?, points_value = ? WHERE id = ?`,
            [title, description, category, size, item_condition, JSON.stringify(images), points_value, id]
        );

        return res.status(200).json({ message: 'Item updated successfully' });
    } catch (error) {
        console.error('Update item error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}

async function handleDelete(req: AuthRequest, res: NextApiResponse, id: string) {
    try {
        const userId = req.user?.id;

        // Check ownership
        const [items] = await pool.query<RowDataPacket[]>('SELECT user_id FROM items WHERE id = ?', [id]);

        if (items.length === 0) {
            return res.status(404).json({ error: 'Item not found' });
        }

        if (items[0].user_id !== userId) {
            return res.status(403).json({ error: 'Not authorized to delete this item' });
        }

        // Delete item
        await pool.query('DELETE FROM items WHERE id = ?', [id]);

        return res.status(200).json({ message: 'Item deleted successfully' });
    } catch (error) {
        console.error('Delete item error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}

export default authMiddleware(handler);
