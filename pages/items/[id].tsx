import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Image from 'next/image';
import Navbar from '@/components/Navbar';
import { Item, User } from '@/types';
import styles from '@/styles/ItemDetail.module.css';

export default function ItemDetail() {
    const router = useRouter();
    const { id } = router.query;
    const [item, setItem] = useState<Item | null>(null);
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [showSwapModal, setShowSwapModal] = useState(false);
    const [swapType, setSwapType] = useState<'direct' | 'points'>('points');
    const [myItems, setMyItems] = useState<Item[]>([]);
    const [selectedItemId, setSelectedItemId] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            fetchCurrentUser(token);
        }
        if (id) {
            fetchItem();
        }
    }, [id]);

    const fetchCurrentUser = async (token: string) => {
        try {
            const response = await fetch('/api/auth/me', {
                headers: { 'Authorization': `Bearer ${token}` },
            });
            if (response.ok) {
                const data = await response.json();
                setCurrentUser(data.user);
                fetchMyItems(token);
            }
        } catch (error) {
            console.error('Failed to fetch user:', error);
        }
    };

    const fetchMyItems = async (token: string) => {
        try {
            const response = await fetch('/api/items?limit=100', {
                headers: { 'Authorization': `Bearer ${token}` },
            });
            if (response.ok) {
                const data = await response.json();
                setMyItems(data.items.filter((i: Item) => i.status === 'available'));
            }
        } catch (error) {
            console.error('Failed to fetch items:', error);
        }
    };

    const fetchItem = async () => {
        try {
            const response = await fetch(`/api/items/${id}`);
            if (response.ok) {
                const data = await response.json();
                setItem(data.item);
            }
        } catch (error) {
            console.error('Failed to fetch item:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSwapRequest = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            router.push('/login');
            return;
        }

        try {
            const response = await fetch('/api/swaps', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    owner_item_id: item?.id,
                    requester_item_id: swapType === 'direct' ? selectedItemId : null,
                    swap_type: swapType,
                }),
            });

            if (response.ok) {
                alert('Swap request sent successfully!');
                setShowSwapModal(false);
                router.push('/dashboard');
            } else {
                const data = await response.json();
                alert(data.error || 'Failed to send swap request');
            }
        } catch (error) {
            alert('An error occurred. Please try again.');
        }
    };

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

    if (!item) {
        return (
            <>
                <Navbar />
                <div className={styles.notFound}>
                    <h2>Item not found</h2>
                    <button onClick={() => router.push('/items')} className="btn btn-primary mt-md">
                        Browse Items
                    </button>
                </div>
            </>
        );
    }

    const images = item.images && item.images.length > 0 ? item.images : ['/placeholder-item.jpg'];
    const isOwner = currentUser?.id === item.user_id;

    return (
        <>
            <Navbar />
            <div className={styles.itemDetail}>
                <div className="container-wide">
                    <div className={styles.content}>
                        {/* Image Gallery */}
                        <div className={styles.gallery}>
                            <div className={styles.mainImage}>
                                <Image
                                    src={images[currentImageIndex]}
                                    alt={item.title}
                                    fill
                                    className={styles.image}
                                    sizes="(max-width: 768px) 100vw, 50vw"
                                />
                            </div>
                            {images.length > 1 && (
                                <div className={styles.thumbnails}>
                                    {images.map((img, index) => (
                                        <button
                                            key={index}
                                            className={`${styles.thumbnail} ${index === currentImageIndex ? styles.thumbnailActive : ''}`}
                                            onClick={() => setCurrentImageIndex(index)}
                                        >
                                            <Image src={img} alt={`${item.title} ${index + 1}`} fill className={styles.thumbnailImage} />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Item Info */}
                        <div className={styles.info}>
                            <div className={styles.header}>
                                <h1>{item.title}</h1>
                                <span className={`badge ${item.status === 'available' ? 'badge-success' : 'badge-warning'}`}>
                                    {item.status}
                                </span>
                            </div>

                            <div className={styles.meta}>
                                <div className={styles.metaItem}>
                                    <span className={styles.metaLabel}>Category:</span>
                                    <span className={styles.metaValue}>{item.category}</span>
                                </div>
                                <div className={styles.metaItem}>
                                    <span className={styles.metaLabel}>Size:</span>
                                    <span className={styles.metaValue}>{item.size}</span>
                                </div>
                                <div className={styles.metaItem}>
                                    <span className={styles.metaLabel}>Condition:</span>
                                    <span className={styles.metaValue}>{item.item_condition}</span>
                                </div>
                            </div>

                            <div className={styles.points}>
                                <span className={styles.pointsIcon}>⭐</span>
                                <span className={styles.pointsValue}>{item.points_value} points</span>
                            </div>

                            <div className={styles.description}>
                                <h3>Description</h3>
                                <p>{item.description}</p>
                            </div>

                            {item.uploader && (
                                <div className={styles.uploader}>
                                    <h3>Listed by</h3>
                                    <div className={styles.uploaderInfo}>
                                        <div className={styles.uploaderAvatar}>
                                            {item.uploader.full_name.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <div className={styles.uploaderName}>{item.uploader.full_name}</div>
                                            <div className={styles.uploaderDate}>
                                                Member since {new Date(item.uploader.created_at).getFullYear()}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {!isOwner && item.status === 'available' && (
                                <div className={styles.actions}>
                                    <button onClick={() => setShowSwapModal(true)} className="btn btn-primary" style={{ width: '100%' }}>
                                        Request Swap
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Swap Modal */}
            {showSwapModal && (
                <div className={styles.modal} onClick={() => setShowSwapModal(false)}>
                    <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                        <h2>Request Swap</h2>

                        <div className={styles.swapOptions}>
                            <button
                                className={`${styles.swapOption} ${swapType === 'points' ? styles.swapOptionActive : ''}`}
                                onClick={() => setSwapType('points')}
                            >
                                <span className={styles.swapOptionIcon}>⭐</span>
                                <div>
                                    <div className={styles.swapOptionTitle}>Redeem with Points</div>
                                    <div className={styles.swapOptionDesc}>Use {item.points_value} points</div>
                                </div>
                            </button>

                            <button
                                className={`${styles.swapOption} ${swapType === 'direct' ? styles.swapOptionActive : ''}`}
                                onClick={() => setSwapType('direct')}
                            >
                                <span className={styles.swapOptionIcon}>🔄</span>
                                <div>
                                    <div className={styles.swapOptionTitle}>Direct Swap</div>
                                    <div className={styles.swapOptionDesc}>Exchange with your item</div>
                                </div>
                            </button>
                        </div>

                        {swapType === 'direct' && (
                            <div className={styles.itemSelection}>
                                <h4>Select your item to swap:</h4>
                                {myItems.length > 0 ? (
                                    <div className={styles.myItemsList}>
                                        {myItems.map((myItem) => (
                                            <button
                                                key={myItem.id}
                                                className={`${styles.myItemCard} ${selectedItemId === myItem.id ? styles.myItemCardActive : ''}`}
                                                onClick={() => setSelectedItemId(myItem.id)}
                                            >
                                                <div className={styles.myItemImage}>
                                                    <Image
                                                        src={myItem.images?.[0] || '/placeholder-item.jpg'}
                                                        alt={myItem.title}
                                                        fill
                                                        className={styles.image}
                                                    />
                                                </div>
                                                <div className={styles.myItemInfo}>
                                                    <div className={styles.myItemTitle}>{myItem.title}</div>
                                                    <div className={styles.myItemMeta}>{myItem.size} • {myItem.item_condition}</div>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                ) : (
                                    <p className={styles.noItems}>You don't have any available items to swap.</p>
                                )}
                            </div>
                        )}

                        <div className={styles.modalActions}>
                            <button onClick={() => setShowSwapModal(false)} className="btn btn-ghost">
                                Cancel
                            </button>
                            <button
                                onClick={handleSwapRequest}
                                className="btn btn-primary"
                                disabled={swapType === 'direct' && !selectedItemId}
                            >
                                Send Request
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
