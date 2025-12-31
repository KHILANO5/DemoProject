import { useState, FormEvent } from 'react';
import { useRouter } from 'next/router';
import Navbar from '@/components/Navbar';
import styles from '@/styles/NewItem.module.css';

const categories = ['tops', 'bottoms', 'dresses', 'outerwear', 'accessories', 'shoes'];
const conditions = ['like-new', 'good', 'fair'];

export default function NewItem() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: 'tops',
        size: '',
        item_condition: 'good',
        points_value: 50,
    });
    const [imageUrls, setImageUrls] = useState<string[]>([]);
    const [imageInput, setImageInput] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleAddImage = () => {
        if (imageInput.trim() && imageUrls.length < 5) {
            setImageUrls([...imageUrls, imageInput.trim()]);
            setImageInput('');
        }
    };

    const handleRemoveImage = (index: number) => {
        setImageUrls(imageUrls.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError('');

        if (imageUrls.length === 0) {
            setError('Please add at least one image URL');
            return;
        }

        const token = localStorage.getItem('token');
        if (!token) {
            router.push('/login');
            return;
        }

        setLoading(true);

        try {
            const response = await fetch('/api/items', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    ...formData,
                    images: imageUrls,
                }),
            });

            const data = await response.json();

            if (response.ok) {
                alert(`Item listed successfully! You earned ${data.pointsAwarded} points!`);
                router.push('/dashboard');
            } else {
                setError(data.error || 'Failed to create item');
            }
        } catch (err) {
            setError('An error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Navbar />
            <div className={styles.newItemPage}>
                <div className="container">
                    <div className={styles.header}>
                        <h1>List a New Item</h1>
                        <p>Share your unused clothing and earn 20 points!</p>
                    </div>

                    <form onSubmit={handleSubmit} className={styles.form}>
                        <div className={styles.formGrid}>
                            <div className="form-group">
                                <label className="form-label">Title *</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    required
                                    placeholder="e.g., Vintage Denim Jacket"
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Category *</label>
                                <select
                                    className="form-select"
                                    value={formData.category}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                                    required
                                >
                                    {categories.map((cat) => (
                                        <option key={cat} value={cat}>
                                            {cat.charAt(0).toUpperCase() + cat.slice(1)}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Size *</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    value={formData.size}
                                    onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                                    required
                                    placeholder="e.g., M, L, 32, 10"
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Condition *</label>
                                <select
                                    className="form-select"
                                    value={formData.item_condition}
                                    onChange={(e) => setFormData({ ...formData, item_condition: e.target.value as any })}
                                    required
                                >
                                    {conditions.map((cond) => (
                                        <option key={cond} value={cond}>
                                            {cond.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Points Value</label>
                                <input
                                    type="number"
                                    className="form-input"
                                    value={formData.points_value}
                                    onChange={(e) => setFormData({ ...formData, points_value: parseInt(e.target.value) })}
                                    min="10"
                                    max="200"
                                />
                                <small style={{ color: 'var(--text-muted)' }}>
                                    Suggested: 50 points
                                </small>
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Description *</label>
                            <textarea
                                className="form-textarea"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                required
                                placeholder="Describe the item, its features, and why you're listing it..."
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Images *</label>
                            <div className={styles.imageInput}>
                                <input
                                    type="url"
                                    className="form-input"
                                    value={imageInput}
                                    onChange={(e) => setImageInput(e.target.value)}
                                    placeholder="Enter image URL (e.g., https://example.com/image.jpg)"
                                />
                                <button
                                    type="button"
                                    onClick={handleAddImage}
                                    className="btn btn-secondary"
                                    disabled={imageUrls.length >= 5}
                                >
                                    Add Image
                                </button>
                            </div>
                            <small style={{ color: 'var(--text-muted)' }}>
                                Add up to 5 image URLs. You can use free image hosting services like Imgur or Cloudinary.
                            </small>

                            {imageUrls.length > 0 && (
                                <div className={styles.imagePreview}>
                                    {imageUrls.map((url, index) => (
                                        <div key={index} className={styles.imageCard}>
                                            <img src={url} alt={`Preview ${index + 1}`} className={styles.previewImage} />
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveImage(index)}
                                                className={styles.removeBtn}
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {error && <div className="form-error">{error}</div>}

                        <div className={styles.actions}>
                            <button type="button" onClick={() => router.back()} className="btn btn-ghost">
                                Cancel
                            </button>
                            <button type="submit" className="btn btn-primary" disabled={loading}>
                                {loading ? 'Listing Item...' : 'List Item'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
}
