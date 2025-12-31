import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import styles from './Navbar.module.css';

interface User {
    id: number;
    email: string;
    full_name: string;
    points_balance: number;
}

export default function Navbar() {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            fetchUser(token);
        }
    }, []);

    const fetchUser = async (token: string) => {
        try {
            const response = await fetch('/api/auth/me', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (response.ok) {
                const data = await response.json();
                setUser(data.user);
            } else {
                localStorage.removeItem('token');
            }
        } catch (error) {
            console.error('Failed to fetch user:', error);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        setUser(null);
        router.push('/');
    };

    return (
        <nav className={styles.navbar}>
            <div className={styles.container}>
                <Link href="/" className={styles.logo}>
                    <span className={styles.logoIcon}>♻️</span>
                    <span className={styles.logoText}>ReWear</span>
                </Link>

                <button
                    className={styles.menuToggle}
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    aria-label="Toggle menu"
                >
                    <span></span>
                    <span></span>
                    <span></span>
                </button>

                <div className={`${styles.navLinks} ${isMenuOpen ? styles.navLinksOpen : ''}`}>
                    <Link href="/items" className={styles.navLink}>
                        Browse Items
                    </Link>

                    {user ? (
                        <>
                            <Link href="/items/new" className={styles.navLink}>
                                List Item
                            </Link>
                            <Link href="/dashboard" className={styles.navLink}>
                                Dashboard
                            </Link>
                            <div className={styles.userMenu}>
                                <div className={styles.pointsBadge}>
                                    <span className={styles.pointsIcon}>⭐</span>
                                    <span className={styles.pointsValue}>{user.points_balance}</span>
                                </div>
                                <button onClick={handleLogout} className={styles.logoutBtn}>
                                    Logout
                                </button>
                            </div>
                        </>
                    ) : (
                        <>
                            <Link href="/login" className={styles.navLink}>
                                Login
                            </Link>
                            <Link href="/signup" className="btn btn-primary btn-sm">
                                Sign Up
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
}
