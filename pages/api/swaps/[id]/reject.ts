import type { NextApiResponse } from 'next';
import { authMiddleware, AuthRequest } from '@/lib/authMiddleware';
import pool from '@/lib/db';
import { RowDataPacket } from 'mysql2';

async function handler(req: AuthRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const userId = req.user?.id;
        const { id } = req.query;

        // Get swap details
        const [swaps] = await pool.query<RowDataPacket[]>(
            'SELECT * FROM swaps WHERE id = ?',
            [id]
        );

        if (swaps.length === 0) {
            return res.status(404).json({ error: 'Swap not found' });
        }

        const swap = swaps[0];

        // Only owner can reject
        if (swap.owner_id !== userId) {
            return res.status(403).json({ error: 'Not authorized' });
        }

        if (swap.status !== 'pending') {
            return res.status(400).json({ error: 'Swap is not pending' });
        }

        // Update swap status
        await pool.query(
            'UPDATE swaps SET status = "rejected" WHERE id = ?',
            [id]
        );

        // Restore item statuses to available
        await pool.query(
            'UPDATE items SET status = "available" WHERE id = ?',
            [swap.owner_item_id]
        );

        if (swap.requester_item_id) {
            await pool.query(
                'UPDATE items SET status = "available" WHERE id = ?',
                [swap.requester_item_id]
            );
        }

        return res.status(200).json({ message: 'Swap rejected successfully' });
    } catch (error) {
        console.error('Reject swap error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}

export default authMiddleware(handler);
