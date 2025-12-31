import type { NextApiRequest, NextApiResponse } from 'next';
import { authMiddleware, AuthRequest } from '@/lib/authMiddleware';
import pool from '@/lib/db';
import { RowDataPacket } from 'mysql2';

async function handler(req: AuthRequest, res: NextApiResponse) {
    if (req.method === 'GET') {
        return handleGet(req, res);
    } else if (req.method === 'POST') {
        return handlePost(req, res);
    } else {
        return res.status(405).json({ error: 'Method not allowed' });
    }
}

async function handleGet(req: AuthRequest, res: NextApiResponse) {
    try {
        const { category, search, page = '1', limit = '12' } = req.query;
        const offset = (parseInt(page as string) - 1) * parseInt(limit as string);

        let query = `
      SELECT i.*, 
             u.id as uploader_id, u.email as uploader_email, 
             u.full_name as uploader_name
      FROM items i
      JOIN users u ON i.user_id = u.id
      WHERE i.status = 'available'
    `;
        const params: any[] = [];

        if (category) {
            query += ' AND i.category = ?';
            params.push(category);
        }

        if (search) {
            query += ' AND (i.title LIKE ? OR i.description LIKE ?)';
            params.push(`%${search}%`, `%${search}%`);
        }

        query += ' ORDER BY i.created_at DESC LIMIT ? OFFSET ?';
        params.push(parseInt(limit as string), offset);

        const [items] = await pool.query<RowDataPacket[]>(query, params);

        // Get total count
        let countQuery = 'SELECT COUNT(*) as total FROM items WHERE status = "available"';
        const countParams: any[] = [];

        if (category) {
            countQuery += ' AND category = ?';
            countParams.push(category);
        }

        if (search) {
            countQuery += ' AND (title LIKE ? OR description LIKE ?)';
            countParams.push(`%${search}%`, `%${search}%`);
        }

        const [countResult] = await pool.query<RowDataPacket[]>(countQuery, countParams);
        const total = countResult[0].total;

        // Format items with uploader info
        const formattedItems = items.map((item: any) => ({
            ...item,
            user: {
                id: item.uploader_id,
                email: item.uploader_email,
                full_name: item.uploader_name,
            },
        }));

        return res.status(200).json({
            items: formattedItems,
            total,
            page: parseInt(page as string),
            totalPages: Math.ceil(total / parseInt(limit as string)),
        });
    } catch (error) {
        console.error('Get items error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}

async function handlePost(req: AuthRequest, res: NextApiResponse) {
    try {
        const userId = req.user?.id;
        const { title, description, category, size, condition, image_url, points_value = 50 } = req.body;

        // Validation
        if (!title || !description || !category || !size || !condition) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        // Insert item
        const [result] = await pool.query(
            `INSERT INTO items (user_id, title, description, category, size, \`condition\`, image_url, points_value, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'available')`,
            [userId, title, description, category, size, condition, image_url || null, points_value]
        );

        // Award points to user
        await pool.query(
            'UPDATE users SET points_balance = points_balance + 20 WHERE id = ?',
            [userId]
        );

        return res.status(201).json({
            message: 'Item created successfully',
            itemId: (result as any).insertId,
            pointsAwarded: 20,
        });
    } catch (error) {
        console.error('Create item error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}

export default authMiddleware(handler);
