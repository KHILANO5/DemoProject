import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Navbar from '@/components/Navbar';
import ItemCard from '@/components/ItemCard';
import { Item, Swap, User } from '@/types';
import styles from '@/styles/Dashboard.module.css';

export default function Dashboard() {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [myItems, setMyItems] = useState<Item[]>([]);
    const [swaps, setSwaps] = useState<Swap[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'received' | 'sent'>('received');

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            router.push('/login');
            return;
        }
        fetchDashboardData(token);
    }, []);

    const fetchDashboardData = async (token: string) => {
        try {
            const [userRes, itemsRes, swapsRes] = await Promise.all([
                fetch('/api/auth/me', { headers: { 'Authorization': `Bearer ${token}` } }),
                fetch('/api/items?limit=100', { headers: { 'Authorization': `Bearer ${token}` } }),
                fetch('/api/swaps', { headers: { 'Authorization': `Bearer ${token}` } }),
            ]);

            let currentUserId: number | undefined;

            if (userRes.ok) {
                const userData = await userRes.json();
                setUser(userData.user);
                currentUserId = userData.user.id;
            }

            if (itemsRes.ok && currentUserId) {
                const itemsData = await itemsRes.json();
                const userItems = itemsData.items.filter((item: Item) => item.user_id === currentUserId);
                setMyItems(userItems);
            }

            if (swapsRes.ok) {
                const swapsData = await swapsRes.json();
                setSwaps(swapsData.swaps);
            }
        } catch (error) {
            console.error('Failed to fetch dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAcceptSwap = async (swapId: number) => {
        const token = localStorage.getItem('token');
        try {
            const response = await fetch(`/api/swaps/${swapId}/accept`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
            });

            if (response.ok) {
                fetchDashboardData(token!);
            }
        } catch (error) {
            console.error('Failed to accept swap:', error);
        }
    };

    const handleRejectSwap = async (swapId: number) => {
        const token = localStorage.getItem('token');
        try {
            const response = await fetch(`/api/swaps/${swapId}/reject`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
            });

            if (response.ok) {
                fetchDashboardData(token!);
            }
        } catch (error) {
            console.error('Failed to reject swap:', error);
        }
    };

    const receivedSwaps = swaps.filter(s => s.owner_id === user?.id && s.status === 'pending');
    const sentSwaps = swaps.filter(s => s.requester_id === user?.id);

    if (loading) {
        return (
            <>
                <Navbar />
                <div className={styles.loading}>
                    <div className="spinner"></div>
                </div>
            </>
        );
    }

    return (
        <>
            <Navbar />
            <div className={styles.dashboard}>
                <div className="container-wide">
                    {/* Profile Section */}
                    <div className={styles.profileSection}>
                        <div className={styles.profileCard}>
                            <div className={styles.profileAvatar}>
                                {user?.full_name.charAt(0).toUpperCase()}
                            </div>
                            <div className={styles.profileInfo}>
                                <h2>{user?.full_name}</h2>
                                <p>{user?.email}</p>
                            </div>
                            <div className={styles.pointsDisplay}>
                                <span className={styles.pointsIcon}>⭐</span>
                                <div>
                                    <div className={styles.pointsValue}>{user?.points_balance}</div>
                                    <div className={styles.pointsLabel}>Points</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className={styles.quickActions}>
                        <button onClick={() => router.push('/items/new')} className="btn btn-primary">
                            📤 List New Item
                        </button>
                        <button onClick={() => router.push('/items')} className="btn btn-outline">
                            🔍 Browse Items
                        </button>
                    </div>

                    {/* My Items */}
                    <section className={styles.section}>
                        <h2 className={styles.sectionTitle}>My Items</h2>
                        {myItems.length > 0 ? (
                            <div className="grid grid-3">
                                {myItems.map(item => (
                                    <ItemCard key={item.id} item={item} />
                                ))}
                            </div>
                        ) : (
                            <div className={styles.emptyState}>
                                <p>You haven't listed any items yet.</p>
                                <button onClick={() => router.push('/items/new')} className="btn btn-primary mt-md">
                                    List Your First Item
                                </button>
                            </div>
                        )}
                    </section>

                    {/* Swap Requests */}
                    <section className={styles.section}>
                        <h2 className={styles.sectionTitle}>Swap Requests</h2>

                        <div className={styles.tabs}>
                            <button
                                className={`${styles.tab} ${activeTab === 'received' ? styles.tabActive : ''}`}
                                onClick={() => setActiveTab('received')}
                            >
                                Received ({receivedSwaps.length})
                            </button>
                            <button
                                className={`${styles.tab} ${activeTab === 'sent' ? styles.tabActive : ''}`}
                                onClick={() => setActiveTab('sent')}
                            >
                                Sent ({sentSwaps.length})
                            </button>
                        </div>

                        <div className={styles.swapsList}>
                            {activeTab === 'received' && receivedSwaps.length === 0 && (
                                <div className={styles.emptyState}>
                                    <p>No pending swap requests</p>
                                </div>
                            )}

                            {activeTab === 'received' && receivedSwaps.map(swap => (
                                <div key={swap.id} className={styles.swapCard}>
                                    <div className={styles.swapInfo}>
                                        <h4>{swap.requester?.full_name} wants to swap</h4>
                                        <p className={styles.swapType}>
                                            {swap.swap_type === 'points' ? '⭐ Points Redemption' : '🔄 Direct Swap'}
                                        </p>
                                        <div className={styles.swapItems}>
                                            <div>
                                                <strong>Your item:</strong> {swap.owner_item?.title}
                                            </div>
                                            {swap.requester_item && (
                                                <div>
                                                    <strong>Their item:</strong> {swap.requester_item.title}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className={styles.swapActions}>
                                        <button onClick={() => handleAcceptSwap(swap.id)} className="btn btn-primary btn-sm">
                                            Accept
                                        </button>
                                        <button onClick={() => handleRejectSwap(swap.id)} className="btn btn-ghost btn-sm">
                                            Reject
                                        </button>
                                    </div>
                                </div>
                            ))}

                            {activeTab === 'sent' && sentSwaps.length === 0 && (
                                <div className={styles.emptyState}>
                                    <p>No sent swap requests</p>
                                </div>
                            )}

                            {activeTab === 'sent' && sentSwaps.map(swap => (
                                <div key={swap.id} className={styles.swapCard}>
                                    <div className={styles.swapInfo}>
                                        <h4>Swap request to {swap.owner?.full_name}</h4>
                                        <p className={styles.swapType}>
                                            {swap.swap_type === 'points' ? '⭐ Points Redemption' : '🔄 Direct Swap'}
                                        </p>
                                        <div className={styles.swapItems}>
                                            <div>
                                                <strong>Item:</strong> {swap.owner_item?.title}
                                            </div>
                                            {swap.requester_item && (
                                                <div>
                                                    <strong>Your offer:</strong> {swap.requester_item.title}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className={styles.swapStatus}>
                                        <span className={`badge ${swap.status === 'completed' ? 'badge-success' :
                                            swap.status === 'rejected' ? 'badge-danger' :
                                                'badge-warning'
                                            }`}>
                                            {swap.status}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>
            </div>
        </>
    );
}
