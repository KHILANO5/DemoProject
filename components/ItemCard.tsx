import Link from 'next/link';
import Image from 'next/image';
import { Item } from '@/types';
import styles from './ItemCard.module.css';

interface ItemCardProps {
    item: Item;
}

export default function ItemCard({ item }: ItemCardProps) {
    const firstImage = item.images && item.images.length > 0 ? item.images[0] : '/placeholder-item.jpg';

    return (
        <Link href={`/items/${item.id}`} className={styles.card}>
            <div className={styles.imageContainer}>
                <Image
                    src={firstImage}
                    alt={item.title}
                    fill
                    className={styles.image}
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
                <div className={styles.statusBadge}>
                    <span className={`badge ${item.status === 'available' ? 'badge-success' : 'badge-warning'}`}>
                        {item.status}
                    </span>
                </div>
            </div>

            <div className={styles.content}>
                <h3 className={styles.title}>{item.title}</h3>

                <div className={styles.details}>
                    <span className={styles.category}>{item.category}</span>
                    <span className={styles.size}>Size: {item.size}</span>
                </div>

                <div className={styles.condition}>
                    <span className={styles.conditionLabel}>Condition:</span>
                    <span className={styles.conditionValue}>{item.item_condition}</span>
                </div>

                <div className={styles.footer}>
                    <div className={styles.points}>
                        <span className={styles.pointsIcon}>⭐</span>
                        <span className={styles.pointsValue}>{item.points_value} points</span>
                    </div>
                    {item.uploader && (
                        <span className={styles.uploader}>by {item.uploader.full_name}</span>
                    )}
                </div>
            </div>
        </Link>
    );
}
