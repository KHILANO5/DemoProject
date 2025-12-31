import { useEffect, useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import ItemCard from '@/components/ItemCard';
import { Item } from '@/types';
import styles from '@/styles/Home.module.css';

export default function Home() {
    const [featuredItems, setFeaturedItems] = useState<Item[]>([]);
    const [currentSlide, setCurrentSlide] = useState(0);

    useEffect(() => {
        fetchFeaturedItems();
    }, []);

    useEffect(() => {
        if (featuredItems.length > 0) {
            const interval = setInterval(() => {
                setCurrentSlide((prev) => (prev + 1) % Math.min(featuredItems.length, 6));
            }, 4000);
            return () => clearInterval(interval);
        }
    }, [featuredItems]);

    const fetchFeaturedItems = async () => {
        try {
            const response = await fetch('/api/items/featured');
            if (response.ok) {
                const data = await response.json();
                setFeaturedItems(data.items);
            }
        } catch (error) {
            console.error('Failed to fetch featured items:', error);
        }
    };

    return (
        <>
            <Navbar />

            <main>
                {/* Hero Section */}
                <section className={styles.hero}>
                    <div className={styles.heroContent}>
                        <h1 className={`${styles.heroTitle} fade-in`}>
                            Sustainable Fashion Starts Here
                        </h1>
                        <p className={`${styles.heroSubtitle} fade-in`}>
                            Exchange unused clothing through direct swaps or our points system.
                            Join a community committed to reducing textile waste and promoting sustainable fashion.
                        </p>
                        <div className={`${styles.heroCta} fade-in`}>
                            <Link href="/signup" className="btn btn-primary btn-lg">
                                Start Swapping
                            </Link>
                            <Link href="/items" className="btn btn-outline btn-lg">
                                Browse Items
                            </Link>
                        </div>
                    </div>

                    <div className={styles.heroStats}>
                        <div className={styles.statCard}>
                            <div className={styles.statValue}>10K+</div>
                            <div className={styles.statLabel}>Items Exchanged</div>
                        </div>
                        <div className={styles.statCard}>
                            <div className={styles.statValue}>5K+</div>
                            <div className={styles.statLabel}>Active Members</div>
                        </div>
                        <div className={styles.statCard}>
                            <div className={styles.statValue}>50T</div>
                            <div className={styles.statLabel}>CO₂ Saved (kg)</div>
                        </div>
                    </div>
                </section>

                {/* Featured Items Carousel */}
                {featuredItems.length > 0 && (
                    <section className={styles.featured}>
                        <div className="container-wide">
                            <h2 className={styles.sectionTitle}>Featured Items</h2>
                            <p className={styles.sectionSubtitle}>
                                Discover recently added items from our community
                            </p>

                            <div className={styles.carousel}>
                                <div
                                    className={styles.carouselTrack}
                                    style={{ transform: `translateX(-${currentSlide * (100 / 3)}%)` }}
                                >
                                    {featuredItems.slice(0, 6).map((item) => (
                                        <div key={item.id} className={styles.carouselSlide}>
                                            <ItemCard item={item} />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className={styles.carouselDots}>
                                {featuredItems.slice(0, 6).map((_, index) => (
                                    <button
                                        key={index}
                                        className={`${styles.dot} ${index === currentSlide ? styles.dotActive : ''}`}
                                        onClick={() => setCurrentSlide(index)}
                                        aria-label={`Go to slide ${index + 1}`}
                                    />
                                ))}
                            </div>

                            <div className={styles.viewAllContainer}>
                                <Link href="/items" className="btn btn-secondary">
                                    View All Items
                                </Link>
                            </div>
                        </div>
                    </section>
                )}

                {/* How It Works */}
                <section className={styles.howItWorks}>
                    <div className="container">
                        <h2 className={styles.sectionTitle}>How It Works</h2>
                        <p className={styles.sectionSubtitle}>
                            Three simple steps to start your sustainable fashion journey
                        </p>

                        <div className={styles.steps}>
                            <div className={styles.step}>
                                <div className={styles.stepNumber}>1</div>
                                <h3 className={styles.stepTitle}>List Your Items</h3>
                                <p className={styles.stepDescription}>
                                    Upload photos and details of clothing you no longer wear.
                                    Earn 20 points for each item listed!
                                </p>
                            </div>

                            <div className={styles.step}>
                                <div className={styles.stepNumber}>2</div>
                                <h3 className={styles.stepTitle}>Browse & Request</h3>
                                <p className={styles.stepDescription}>
                                    Explore items from other members. Request a direct swap or
                                    redeem items using your points.
                                </p>
                            </div>

                            <div className={styles.step}>
                                <div className={styles.stepNumber}>3</div>
                                <h3 className={styles.stepTitle}>Complete the Swap</h3>
                                <p className={styles.stepDescription}>
                                    Once accepted, coordinate the exchange. Earn 30 bonus points
                                    for successful swaps!
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Impact Section */}
                <section className={styles.impact}>
                    <div className="container">
                        <h2 className={styles.sectionTitle}>Our Environmental Impact</h2>
                        <p className={styles.sectionSubtitle}>
                            Together, we're making a difference
                        </p>

                        <div className={styles.impactGrid}>
                            <div className={styles.impactCard}>
                                <div className={styles.impactIcon}>🌍</div>
                                <h3>Reduce Waste</h3>
                                <p>
                                    The fashion industry is the 2nd largest polluter. By reusing clothes,
                                    we keep textiles out of landfills.
                                </p>
                            </div>

                            <div className={styles.impactCard}>
                                <div className={styles.impactIcon}>💧</div>
                                <h3>Save Water</h3>
                                <p>
                                    Producing one cotton shirt uses 2,700 liters of water.
                                    Swapping saves precious resources.
                                </p>
                            </div>

                            <div className={styles.impactCard}>
                                <div className={styles.impactIcon}>♻️</div>
                                <h3>Circular Economy</h3>
                                <p>
                                    Extend the life of garments and participate in a sustainable,
                                    circular fashion economy.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className={styles.cta}>
                    <div className="container text-center">
                        <h2 className={styles.ctaTitle}>Ready to Make a Difference?</h2>
                        <p className={styles.ctaSubtitle}>
                            Join thousands of members creating a more sustainable future
                        </p>
                        <Link href="/signup" className="btn btn-primary btn-lg">
                            Get Started Today
                        </Link>
                    </div>
                </section>
            </main>

            {/* Footer */}
            <footer className={styles.footer}>
                <div className="container">
                    <div className={styles.footerContent}>
                        <div className={styles.footerBrand}>
                            <div className={styles.footerLogo}>
                                <span className={styles.logoIcon}>♻️</span>
                                <span className={styles.logoText}>ReWear</span>
                            </div>
                            <p className={styles.footerTagline}>
                                Sustainable fashion through community exchange
                            </p>
                        </div>

                        <div className={styles.footerLinks}>
                            <div className={styles.footerColumn}>
                                <h4>Platform</h4>
                                <Link href="/items">Browse Items</Link>
                                <Link href="/items/new">List an Item</Link>
                                <Link href="/dashboard">Dashboard</Link>
                            </div>

                            <div className={styles.footerColumn}>
                                <h4>Company</h4>
                                <Link href="/about">About Us</Link>
                                <Link href="/contact">Contact</Link>
                                <Link href="/faq">FAQ</Link>
                            </div>
                        </div>
                    </div>

                    <div className={styles.footerBottom}>
                        <p>&copy; 2025 ReWear. All rights reserved.</p>
                    </div>
                </div>
            </footer>
        </>
    );
}
