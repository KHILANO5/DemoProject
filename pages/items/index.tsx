import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Navbar from '@/components/Navbar';
import ItemCard from '@/components/ItemCard';
import { Item } from '@/types';
import styles from '@/styles/Items.module.css';

const categories = ['all', 'tops', 'bottoms', 'dresses', 'outerwear', 'accessories', 'shoes'];

export default function ItemsPage() {
    const router = useRouter();
    const [items, setItems] = useState<Item[]>([]);
    const [loading, setLoading] = useState(true);
    const [category, setCategory] = useState('all');
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        fetchItems();
    }, [category, search, page]);

    const fetchItems = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page: page.toString(),
                limit: '12',
            });

            if (category !== 'all') params.append('category', category);
            if (search) params.append('search', search);

            const token = localStorage.getItem('token');
            const headers: HeadersInit = {};
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            const response = await fetch(`/api/items?${params}`, { headers });
            if (response.ok) {
                const data = await response.json();
                setItems(data.items);
                setTotalPages(data.totalPages);
            }
        } catch (error) {
            console.error('Failed to fetch items:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setPage(1);
        fetchItems();
    };

    return (
        <>
            <Navbar />
            <div className={styles.itemsPage}>
                <div className="container-wide">
                    <div className={styles.header}>
                        <h1>Browse Items</h1>
                        <p>Discover sustainable fashion from our community</p>
                    </div>

                    {/* Search and Filters */}
                    <div className={styles.filters}>
                        <form onSubmit={handleSearch} className={styles.searchForm}>
                            <input
                                type="text"
                                className="form-input"
                                placeholder="Search items..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                            <button type="submit" className="btn btn-primary">
                                Search
                            </button>
                        </form>

                        <div className={styles.categories}>
                            {categories.map((cat) => (
                                <button
                                    key={cat}
                                    className={`${styles.categoryBtn} ${category === cat ? styles.categoryBtnActive : ''}`}
                                    onClick={() => {
                                        setCategory(cat);
                                        setPage(1);
                                    }}
                                >
                                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Items Grid */}
                    {loading ? (
                        <div className={styles.loading}>
                            <div className="spinner"></div>
                        </div>
                    ) : items.length > 0 ? (
                        <>
                            <div className="grid grid-3">
                                {items.map((item) => (
                                    <ItemCard key={item.id} item={item} />
                                ))}
                            </div>

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className={styles.pagination}>
                                    <button
                                        className="btn btn-ghost"
                                        onClick={() => setPage(p => Math.max(1, p - 1))}
                                        disabled={page === 1}
                                    >
                                        Previous
                                    </button>
                                    <span className={styles.pageInfo}>
                                        Page {page} of {totalPages}
                                    </span>
                                    <button
                                        className="btn btn-ghost"
                                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                        disabled={page === totalPages}
                                    >
                                        Next
                                    </button>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className={styles.emptyState}>
                            <p>No items found. Try adjusting your filters.</p>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
