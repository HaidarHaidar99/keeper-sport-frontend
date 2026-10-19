import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Star, MessageSquare, ShieldCheck, Loader2, Plus, X, Send, User, CheckCircle2 } from 'lucide-react';
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
  const [authorName, setAuthorName] = useState(user?.full_name || '');
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
        if (revRes?.success && Array.isArray(revRes.reviews)) {
          setReviews(revRes.reviews);
        }
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
    setAuthorName(user?.full_name || '');
    setSelectedProductId('');
    setModalOpen(true);
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();

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
        product_name: selectedProd?.name || 'Keeper Sport Store Experience',
        author_name: authorName.trim() || user?.full_name || 'Verified Customer'
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

  const getInitials = (name = '') => {
    if (!name) return 'KS';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  return (
    <div className="ks-page-canvas">
      <Navbar siteSettings={siteSettings} categories={categories} />

      <main className="ks-catalog-page-container">
        {/* Header */}
        <header className="ks-catalog-header">
          <div className="ks-catalog-header-badge">
            <Star size={13} style={{ color: 'var(--ks-accent-red)' }} />
            <span>AUTHENTIC EXPERIENCES</span>
          </div>
          <h1 className="ks-catalog-title">Customer Reviews</h1>
          <p className="ks-catalog-subtitle">
            Authentic feedback from athletes and football enthusiasts across Lebanon.
          </p>

          <div style={{ marginTop: '24px' }}>
            <button
              type="button"
              onClick={handleOpenModal}
              className="ks-btn-primary"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', cursor: 'pointer', padding: '12px 28px' }}
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
            <MessageSquare size={48} style={{ opacity: 0.3, marginBottom: '16px' }} />
            <h3>No reviews yet</h3>
            <p>Be the first to share your experience with Keeper Sport gear.</p>
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
          /* Redesigned Luxury Review Cards Grid */
          <div className="ks-reviews-grid">
            {reviews.map((rev, idx) => {
              const authorText = rev.author || 'Verified Customer';
              const initials = getInitials(authorText);
              const starCount = Math.round(Number(rev.rating) || 5);

              return (
                <div
                  key={rev.id || idx}
                  className="ks-review-card"
                  style={{ animationDelay: `${idx * 0.05}s` }}
                >
                  {/* Decorative background quote mark */}
                  <div className="ks-review-quote-watermark" aria-hidden="true">“</div>

                  {/* Top user row */}
                  <div className="ks-review-header">
                    <div className="ks-review-user-row">
                      <div className="ks-review-avatar">
                        {initials}
                      </div>
                      <div className="ks-review-user-meta">
                        <span className="ks-review-author">{authorText}</span>
                        <span className="ks-review-verified">
                          <CheckCircle2 size={13} style={{ color: '#10b981' }} />
                          <span>Verified Athlete</span>
                        </span>
                      </div>
                    </div>
                    <span className="ks-review-date">
                      {rev.created_at ? new Date(rev.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recent'}
                    </span>
                  </div>

                  {/* Rating Stars & Rating Number */}
                  <div className="ks-review-stars-wrap">
                    <div className="ks-review-stars">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          size={16}
                          fill={s <= starCount ? '#E10600' : 'none'}
                          stroke={s <= starCount ? '#E10600' : 'rgba(255, 255, 255, 0.2)'}
                        />
                      ))}
                    </div>
                    <span className="ks-review-rating-badge">
                      {Number(rev.rating || 5).toFixed(1)} ★
                    </span>
                  </div>

                  {/* Review Text Body */}
                  <p className="ks-review-body">"{rev.review_text}"</p>

                  {/* Footer with Product Tag */}
                  <div className="ks-review-footer">
                    <span className="ks-review-product-tag" title={rev.product_name || 'Keeper Sport Store Experience'}>
                      <span>⚽</span>
                      <span>{rev.product_name || 'Keeper Sport Store Experience'}</span>
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* WRITE A REVIEW MODAL (Open to All Customers & Athletes) */}
        {modalOpen && (
          <div
            className="ks-admin-modal-backdrop"
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(0,0,0,0.78)',
              backdropFilter: 'blur(4px)',
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
                backgroundColor: 'var(--ks-bg-card, #121317)',
                border: '1px solid var(--ks-border-card, #2b2b2b)',
                borderRadius: '24px',
                padding: '30px',
                color: 'var(--ks-text-primary, #ffffff)',
                boxShadow: '0 24px 64px rgba(0,0,0,0.6)'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '22px' }}>
                <h3 style={{ margin: 0, fontSize: '1.35rem', fontWeight: 900, fontFamily: 'Outfit, sans-serif' }}>
                  Write a Customer Review
                </h3>
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer', padding: 6 }}
                  aria-label="Close"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmitReview}>
                {/* Author Name */}
                <div style={{ marginBottom: '18px' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '8px', color: '#888' }}>
                    YOUR NAME / NICKNAME *
                  </label>
                  <input
                    type="text"
                    value={authorName}
                    onChange={(e) => setAuthorName(e.target.value)}
                    placeholder="e.g. Haidar H. or Football Fan"
                    required
                    style={{
                      width: '100%',
                      padding: '12px 14px',
                      backgroundColor: 'rgba(255,255,255,0.05)',
                      border: '1px solid var(--ks-border-card, #333)',
                      borderRadius: '12px',
                      color: 'inherit',
                      fontSize: '0.95rem',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

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
                            size={28}
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
                    SELECT PRODUCT (OPTIONAL)
                  </label>
                  <select
                    value={selectedProductId}
                    onChange={(e) => setSelectedProductId(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px 14px',
                      backgroundColor: 'rgba(255,255,255,0.05)',
                      border: '1px solid var(--ks-border-card, #333)',
                      borderRadius: '12px',
                      color: 'inherit',
                      fontSize: '0.9rem',
                      boxSizing: 'border-box'
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
                    placeholder="Share your experience regarding gear quality, authentic badges, fit, and fast delivery in Lebanon..."
                    required
                    style={{
                      width: '100%',
                      padding: '12px 14px',
                      backgroundColor: 'rgba(255,255,255,0.05)',
                      border: '1px solid var(--ks-border-card, #333)',
                      borderRadius: '12px',
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
            </div>
          </div>
        )}
      </main>

      {!loading && <Footer siteSettings={siteSettings} categories={categories} />}
    </div>
  );
}
