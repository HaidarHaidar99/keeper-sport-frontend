import React, { useState, useEffect } from 'react';
import { Star, MessageSquare, Image, ShieldCheck } from 'lucide-react';
import apiClient from '../services/apiClient';
import { useLanguage } from '../context/LanguageContext';

const ReviewsPage = () => {
  const { t, isRtl } = useLanguage();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient('/reviews')
      .then((res) => {
        if (res?.data) setReviews(res.data);
      })
      .catch((e) => console.error("Error loading reviews", e))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ padding: '50px 0 80px' }}>
      <div className="container">
        <div style={{ textAlign: 'center', maxWidth: '640px', margin: '0 auto 48px' }}>
          <span className="badge badge-gold" style={{ marginBottom: '10px' }}>⭐ {t('reviews')}</span>
          <h1 style={{ fontSize: '36px', fontWeight: 900, marginBottom: '12px' }}>
            {isRtl ? "تقييمات وصور المشترين الحقيقية" : "Player & Fan Community Reviews"}
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '15px' }}>
            {isRtl 
              ? "آراء حقيقية وصور ملتقطة من زبائننا بعد استلام قمصانهم ومعداتهم الأصلية."
              : "Genuine verified feedback and unboxing photos shared by football fans across the country."}
          </p>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
            Loading verified reviews...
          </div>
        ) : reviews.length === 0 ? (
          <div className="glass-card" style={{ padding: '60px 20px', textAlign: 'center', maxWidth: '500px', margin: '0 auto' }}>
            <MessageSquare size={48} color="var(--border-medium)" style={{ margin: '0 auto 16px' }} />
            <h3 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '8px' }}>No Reviews Yet</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Be the first customer to leave a review after your delivery!</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
            {reviews.map((rev) => (
              <div key={rev.id} className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', gap: '3px' }}>
                    {[...Array(rev.rating || 5)].map((_, i) => (
                      <Star key={i} size={15} fill="#FFB800" color="#FFB800" />
                    ))}
                  </div>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    {new Date(rev.created_at).toLocaleDateString()}
                  </span>
                </div>

                <p style={{ fontSize: '14px', color: 'var(--text-primary)', lineHeight: 1.6, fontStyle: 'italic' }}>
                  "{rev.comment}"
                </p>

                {rev.images && rev.images.length > 0 && (
                  <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
                    {rev.images.map((img, idx) => (
                      <img
                        key={idx}
                        src={img.image_url || img}
                        alt="customer photo"
                        style={{
                          width: '80px',
                          height: '80px',
                          borderRadius: 'var(--radius-sm)',
                          objectFit: 'cover',
                          border: '1px solid var(--border-subtle)'
                        }}
                      />
                    ))}
                  </div>
                )}

                <div style={{
                  marginTop: 'auto',
                  paddingTop: '12px',
                  borderTop: '1px solid var(--border-subtle)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '13px',
                  color: 'var(--accent-cyan)',
                  fontWeight: 700
                }}>
                  <ShieldCheck size={16} />
                  <span>{rev.customer_name || "Verified Customer"}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ReviewsPage;
