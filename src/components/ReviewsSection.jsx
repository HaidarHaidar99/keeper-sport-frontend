import React from 'react';
import { Star, ShieldCheck, Quote } from 'lucide-react';

export default function ReviewsSection({ reviews = [] }) {
  const validReviews = Array.isArray(reviews) ? reviews.filter(Boolean) : [];

  // If no real customer reviews exist, handle gracefully by omitting section without fake content
  if (validReviews.length === 0) {
    return null;
  }

  return (
    <section className="ks-reviews-section" aria-label="Customer Reviews">
      <div className="ks-reviews-container">
        <div className="ks-reviews-header">
          <span className="ks-section-eyebrow">ATHLETE EXPERIENCES</span>
          <h2 className="ks-section-title">VERIFIED REVIEWS</h2>
        </div>

        <div className="ks-reviews-grid">
          {validReviews.map((rev) => (
            <div key={rev.id} className="ks-review-card">
              <div className="ks-review-top">
                <div className="ks-review-stars" aria-label={`Rating: ${rev.rating} out of 5 stars`}>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      size={14}
                      className={i < rev.rating ? 'is-filled' : 'is-empty'}
                    />
                  ))}
                </div>
                <div className="ks-review-verified">
                  <ShieldCheck size={14} />
                  <span>Verified Purchase</span>
                </div>
              </div>

              {rev.review_text && (
                <p className="ks-review-text">"{rev.review_text}"</p>
              )}

              <div className="ks-review-footer">
                <span className="ks-review-author">{rev.author || 'Verified Customer'}</span>
                {rev.product_name && (
                  <span className="ks-review-product">{rev.product_name}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
