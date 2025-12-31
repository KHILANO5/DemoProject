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

        // Only owner can accept
        if (swap.owner_id !== userId) {
            return res.status(403).json({ error: 'Not authorized' });
        }

        if (swap.status !== 'pending') {
            return res.status(400).json({ error: 'Swap is not pending' });
        }

        // Start transaction
        const connection = await pool.getConnection();
        await connection.beginTransaction();

        try {
            // Update swap status
            await connection.query(
                'UPDATE swaps SET status = "completed" WHERE id = ?',
                [id]
            );

            // Update item statuses
            await connection.query(
                'UPDATE items SET status = "swapped" WHERE id = ?',
                [swap.owner_item_id]
            );

            if (swap.requester_item_id) {
                await connection.query(
                    'UPDATE items SET status = "swapped" WHERE id = ?',
                    [swap.requester_item_id]
                );
            }

            // Handle points transfer
            if (swap.swap_type === 'points') {
                // Get item points value
                const [items] = await connection.query<RowDataPacket[]>(
                    'SELECT points_value FROM items WHERE id = ?',
                    [swap.owner_item_id]
                );

                const pointsValue = items[0].points_value;

                // Deduct points from requester
                await connection.query(
                    'UPDATE users SET points_balance = points_balance - ? WHERE id = ?',
                    [pointsValue, swap.requester_id]
                );

                // Add points to owner (item value + 30 bonus)
                await connection.query(
                    'UPDATE users SET points_balance = points_balance + ? WHERE id = ?',
                    [pointsValue + 30, swap.owner_id]
                );
            } else {
                // Direct swap - award 30 points to owner
                await connection.query(
                    'UPDATE users SET points_balance = points_balance + 30 WHERE id = ?',
                    [swap.owner_id]
                );
            }

            await connection.commit();
            connection.release();

            return res.status(200).json({ message: 'Swap accepted successfully' });
        } catch (error) {
            await connection.rollback();
            connection.release();
            throw error;
        }
    } catch (error) {
        console.error('Accept swap error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}

export default authMiddleware(handler);
