import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Star, MessageSquare, ShieldCheck, Loader2, Plus, X, Send, User } from 'lucide-react';
import { useSite } from '../context/SiteContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { contentApi } from '../api/contentApi';
import { productApi } from '../api/productApi';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function ReviewsPage() {
  const { siteSettings, categories } = useSite();
  const { user } = useAuth();
  const { showToast } = useToast();

  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  // Review Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [selectedProductId, setSelectedProductId] = useState('');
  const [productsList, setProductsList] = useState([]);

  useEffect(() => {
    let isMounted = true;
    contentApi.getReviews()
      .then((revRes) => {
        if (!isMounted) return;
        if (revRes?.success) setReviews(revRes.reviews || []);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    // Preload products for review modal dropdown
    productApi.getProducts({ limit: 50 })
      .then((res) => {
        if (isMounted && res?.success && Array.isArray(res.products)) {
          setProductsList(res.products);
        }
      })
      .catch(() => {});

    return () => {
      isMounted = false;
    };
  }, []);

  const handleOpenModal = () => {
    setRating(5);
    setHoverRating(0);
    setReviewText('');
    setSelectedProductId('');
    setModalOpen(true);
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!user) {
      showToast('Please sign in first to submit a review.');
      return;
    }

    if (!reviewText.trim()) {
      showToast('Please enter your review text.');
      return;
    }

    setSubmitting(true);
    try {
      const selectedProd = productsList.find((p) => p.id === selectedProductId);
      const res = await contentApi.submitReview({
        rating,
        review_text: reviewText.trim(),
        product_id: selectedProductId || null,
        product_name: selectedProd?.name || 'Keeper Sports Store Experience'
      });

      if (res?.success) {
        showToast(res.message || 'Review submitted successfully!');
        if (res.review) {
          setReviews((prev) => [res.review, ...prev]);
        }
        setModalOpen(false);
      } else {
        showToast(res?.message || 'Failed to submit review.');
      }
    } catch (err) {
      showToast(err.message || 'Error submitting review.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="ks-page-canvas">
      <Navbar siteSettings={siteSettings} categories={categories} />

      <main className="ks-catalog-page-container">
        {/* Header */}
        <header className="ks-catalog-header">
          <div className="ks-catalog-header-badge">
            <Star size={13} style={{ color: 'var(--ks-accent-red)' }} />
            <span>CUSTOMER EXPERIENCES</span>
          </div>
          <h1 className="ks-catalog-title">Customer Reviews</h1>
          <p className="ks-catalog-subtitle">
            Authentic feedback from players and athletes across Lebanon.
          </p>

          <div style={{ marginTop: '20px' }}>
            <button
              type="button"
              onClick={handleOpenModal}
              className="ks-btn-primary"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}
            >
              <Plus size={16} />
              <span>WRITE A REVIEW</span>
            </button>
          </div>
        </header>

        {loading ? (
          <div className="ks-catalog-loading" aria-live="polite">
            <Loader2 size={32} className="ks-spin-icon" style={{ color: 'var(--ks-accent-red)' }} />
            <p>Loading verified reviews...</p>
          </div>
        ) : reviews.length === 0 ? (
          <div className="ks-catalog-empty">
            <MessageSquare size={44} style={{ opacity: 0.3, marginBottom: '14px' }} />
            <h3>No reviews yet</h3>
            <p>Be the first to review your favorite gear after making a purchase.</p>
            <button
              type="button"
              onClick={handleOpenModal}
              className="ks-btn-primary"
              style={{ display: 'inline-flex', marginTop: '16px', cursor: 'pointer' }}
            >
              <Plus size={16} />
              <span>WRITE THE FIRST REVIEW</span>
            </button>
          </div>
        ) : (
          <div className="ks-reviews-grid">
            {reviews.map((rev, idx) => (
              <div
                key={rev.id || idx}
                className="ks-review-card"
                style={{ animationDelay: `${idx * 0.05}s` }}
              >
                <div className="ks-review-header">
                  <div className="ks-review-stars">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        size={15}
                        fill={s <= Math.round(rev.rating) ? '#E10600' : 'none'}
                        stroke={s <= Math.round(rev.rating) ? '#E10600' : 'currentColor'}
                      />
                    ))}
                    <span className="ks-review-rating-num">{Number(rev.rating).toFixed(1)}</span>
                  </div>
                  <span className="ks-review-date">
                    {rev.created_at ? new Date(rev.created_at).toLocaleDateString() : 'Recent'}
                  </span>
                </div>

                <p className="ks-review-body">"{rev.review_text}"</p>

                <div className="ks-review-footer">
                  <div className="ks-review-author-wrap">
                    <span className="ks-review-author">{rev.author || 'Verified Buyer'}</span>
                    <span className="ks-review-verified">
                      <ShieldCheck size={14} style={{ color: '#16a34a' }} />
                      <span>Verified Buyer</span>
                    </span>
                  </div>
                  {rev.product_name && (
                    <span className="ks-review-product-tag">{rev.product_name}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* WRITE A REVIEW MODAL */}
        {modalOpen && (
          <div
            className="ks-admin-modal-backdrop"
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(0,0,0,0.75)',
              zIndex: 9999,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '16px'
            }}
            onClick={() => setModalOpen(false)}
            role="dialog"
            aria-modal="true"
          >
            <div
              className="ks-admin-modal-box"
              style={{
                width: '100%',
                maxWidth: '520px',
                backgroundColor: 'var(--ks-bg-card, #121212)',
                border: '1px solid var(--ks-border-card, #2b2b2b)',
                borderRadius: '20px',
                padding: '28px',
                color: 'var(--ks-text-primary, #ffffff)',
                boxShadow: '0 20px 60px rgba(0,0,0,0.5)'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                <h3 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 900, fontFamily: 'Outfit, sans-serif' }}>
                  Write a Customer Review
                </h3>
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer', padding: 4 }}
                  aria-label="Close"
                >
                  <X size={20} />
                </button>
              </div>

              {!user ? (
                <div style={{ textAlign: 'center', padding: '24px 0' }}>
                  <User size={40} style={{ opacity: 0.4, marginBottom: '12px', color: '#E10600' }} />
                  <h4 style={{ margin: '0 0 8px', fontSize: '1.1rem' }}>Sign In Required</h4>
                  <p style={{ color: '#888', fontSize: '0.9rem', marginBottom: '20px' }}>
                    To ensure all reviews are authentic and verified, please log in to your account.
                  </p>
                  <Link
                    to="/login"
                    className="ks-btn-primary"
                    style={{ display: 'inline-flex', padding: '10px 24px' }}
                    onClick={() => setModalOpen(false)}
                  >
                    <span>SIGN IN TO REVIEW</span>
                  </Link>
                </div>
              ) : (
                <form onSubmit={handleSubmitReview}>
                  {/* Rating Selector */}
                  <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '8px', color: '#888' }}>
                      YOUR RATING *
                    </label>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      {[1, 2, 3, 4, 5].map((starVal) => {
                        const isFilled = starVal <= (hoverRating || rating);
                        return (
                          <button
                            key={starVal}
                            type="button"
                            onClick={() => setRating(starVal)}
                            onMouseEnter={() => setHoverRating(starVal)}
                            onMouseLeave={() => setHoverRating(0)}
                            style={{
                              background: 'none',
                              border: 'none',
                              cursor: 'pointer',
                              padding: '4px',
                              display: 'inline-flex'
                            }}
                          >
                            <Star
                              size={26}
                              fill={isFilled ? '#E10600' : 'none'}
                              stroke={isFilled ? '#E10600' : '#666'}
                            />
                          </button>
                        );
                      })}
                      <span style={{ marginLeft: '8px', fontWeight: 800, color: '#E10600' }}>
                        {hoverRating || rating} / 5
                      </span>
                    </div>
                  </div>

                  {/* Optional Product Selection */}
                  <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '8px', color: '#888' }}>
                      PRODUCT (OPTIONAL)
                    </label>
                    <select
                      value={selectedProductId}
                      onChange={(e) => setSelectedProductId(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '12px 14px',
                        backgroundColor: 'rgba(255,255,255,0.05)',
                        border: '1px solid var(--ks-border-card, #333)',
                        borderRadius: '10px',
                        color: 'inherit',
                        fontSize: '0.9rem'
                      }}
                    >
                      <option value="">General Store Experience</option>
                      {productsList.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Review Text */}
                  <div style={{ marginBottom: '24px' }}>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '8px', color: '#888' }}>
                      YOUR REVIEW *
                    </label>
                    <textarea
                      rows={4}
                      value={reviewText}
                      onChange={(e) => setReviewText(e.target.value)}
                      placeholder="Share your experience with the gear quality, delivery, and authenticity..."
                      required
                      style={{
                        width: '100%',
                        padding: '12px 14px',
                        backgroundColor: 'rgba(255,255,255,0.05)',
                        border: '1px solid var(--ks-border-card, #333)',
                        borderRadius: '10px',
                        color: 'inherit',
                        fontSize: '0.95rem',
                        resize: 'vertical',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>

                  {/* Footer */}
                  <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                    <button
                      type="button"
                      onClick={() => setModalOpen(false)}
                      style={{
                        padding: '12px 20px',
                        backgroundColor: 'transparent',
                        border: '1px solid var(--ks-border-card, #444)',
                        color: 'inherit',
                        borderRadius: '10px',
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="ks-btn-primary"
                      style={{
                        padding: '12px 24px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                        cursor: submitting ? 'not-allowed' : 'pointer'
                      }}
                    >
                      <Send size={15} />
                      <span>{submitting ? 'Submitting...' : 'Post Review'}</span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}
      </main>

      {!loading && <Footer siteSettings={siteSettings} categories={categories} />}
    </div>
  );
}
