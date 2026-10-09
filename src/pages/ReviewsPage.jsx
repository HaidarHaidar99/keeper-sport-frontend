import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Star, MessageSquare, ShieldCheck, Loader2 } from 'lucide-react';
import { useSite } from '../context/SiteContext';
import { contentApi } from '../api/contentApi';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function ReviewsPage() {
  const { siteSettings, categories } = useSite();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

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

    return () => {
      isMounted = false;
    };
  }, []);

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
            <Link to="/products" className="ks-btn-primary" style={{ display: 'inline-flex', marginTop: '16px' }}>
              <span>EXPLORE GEAR</span>
            </Link>
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
                    <span className="ks-review-rating-num">{rev.rating.toFixed(1)}</span>
                  </div>
                  <span className="ks-review-date">
                    {new Date(rev.created_at).toLocaleDateString()}
                  </span>
                </div>

                <p className="ks-review-body">"{rev.review_text}"</p>

                <div className="ks-review-footer">
                  <div className="ks-review-author-wrap">
                    <span className="ks-review-author">{rev.author}</span>
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
      </main>

      {!loading && <Footer siteSettings={siteSettings} categories={categories} />}
    </div>
  );
}
