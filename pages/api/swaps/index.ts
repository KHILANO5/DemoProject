import type { NextApiResponse } from 'next';
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
        const userId = req.user?.id;

        // Get swaps where user is requester or owner
        const query = `
      SELECT s.*,
             req.id as requester_id, req.full_name as requester_name, req.email as requester_email,
             own.id as owner_id, own.full_name as owner_name, own.email as owner_email,
             req_item.id as req_item_id, req_item.title as req_item_title, req_item.images as req_item_images,
             own_item.id as own_item_id, own_item.title as own_item_title, own_item.images as own_item_images
      FROM swaps s
      JOIN users req ON s.requester_id = req.id
      JOIN users own ON s.owner_id = own.id
      LEFT JOIN items req_item ON s.requester_item_id = req_item.id
      JOIN items own_item ON s.owner_item_id = own_item.id
      WHERE s.requester_id = ? OR s.owner_id = ?
      ORDER BY s.created_at DESC
    `;

        const [swaps] = await pool.query<RowDataPacket[]>(query, [userId, userId]);

        const formattedSwaps = swaps.map((swap: any) => ({
            id: swap.id,
            swap_type: swap.swap_type,
            status: swap.status,
            created_at: swap.created_at,
            requester: {
                id: swap.requester_id,
                full_name: swap.requester_name,
                email: swap.requester_email,
            },
            owner: {
                id: swap.owner_id,
                full_name: swap.owner_name,
                email: swap.owner_email,
            },
            requester_item: swap.req_item_id ? {
                id: swap.req_item_id,
                title: swap.req_item_title,
                images: JSON.parse(swap.req_item_images || '[]'),
            } : null,
            owner_item: {
                id: swap.own_item_id,
                title: swap.own_item_title,
                images: JSON.parse(swap.own_item_images || '[]'),
            },
        }));

        return res.status(200).json({ swaps: formattedSwaps });
    } catch (error) {
        console.error('Get swaps error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}

async function handlePost(req: AuthRequest, res: NextApiResponse) {
    try {
        const userId = req.user?.id;
        const { owner_item_id, requester_item_id, swap_type } = req.body;

        // Validation
        if (!owner_item_id || !swap_type) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        if (swap_type !== 'direct' && swap_type !== 'points') {
            return res.status(400).json({ error: 'Invalid swap type' });
        }

        // Get item details
        const [items] = await pool.query<RowDataPacket[]>(
            'SELECT user_id, status, points_value FROM items WHERE id = ?',
            [owner_item_id]
        );

        if (items.length === 0) {
            return res.status(404).json({ error: 'Item not found' });
        }

        const item = items[0];

        if (item.status !== 'available') {
            return res.status(400).json({ error: 'Item is not available' });
        }

        if (item.user_id === userId) {
            return res.status(400).json({ error: 'Cannot swap your own item' });
        }

        // For points-based swap, check user has enough points
        if (swap_type === 'points') {
            const [users] = await pool.query<RowDataPacket[]>(
                'SELECT points_balance FROM users WHERE id = ?',
                [userId]
            );

            if (users[0].points_balance < item.points_value) {
                return res.status(400).json({ error: 'Insufficient points' });
            }
        }

        // For direct swap, validate requester item
        if (swap_type === 'direct') {
            if (!requester_item_id) {
                return res.status(400).json({ error: 'Requester item required for direct swap' });
            }

            const [reqItems] = await pool.query<RowDataPacket[]>(
                'SELECT user_id, status FROM items WHERE id = ?',
                [requester_item_id]
            );

            if (reqItems.length === 0 || reqItems[0].user_id !== userId) {
                return res.status(400).json({ error: 'Invalid requester item' });
            }

            if (reqItems[0].status !== 'available') {
                return res.status(400).json({ error: 'Your item is not available for swap' });
            }
        }

        // Create swap request
        const [result] = await pool.query(
            `INSERT INTO swaps (requester_id, requester_item_id, owner_id, owner_item_id, swap_type, status)
       VALUES (?, ?, ?, ?, ?, 'pending')`,
            [userId, requester_item_id || null, item.user_id, owner_item_id, swap_type]
        );

        // Update item status to pending
        await pool.query(
            'UPDATE items SET status = "pending" WHERE id = ?',
            [owner_item_id]
        );

        if (swap_type === 'direct' && requester_item_id) {
            await pool.query(
                'UPDATE items SET status = "pending" WHERE id = ?',
                [requester_item_id]
            );
        }

        return res.status(201).json({
            message: 'Swap request created successfully',
            swapId: (result as any).insertId,
        });
    } catch (error) {
        console.error('Create swap error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}

export default authMiddleware(handler);
