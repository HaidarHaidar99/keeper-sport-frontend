import React, { useState, useEffect } from 'react';
import { Star, Check, X, MessageSquare } from 'lucide-react';
import apiClient from '../../services/apiClient';

const AdminReviewsPage = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const res = await apiClient('/admin/reviews');
      if (res?.data) setReviews(res.data);
    } catch (err) {
      console.error("Error loading reviews", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleModeration = async (id, status) => {
    try {
      await apiClient(`/admin/reviews/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ status })
      });
      fetchReviews();
    } catch (err) {
      alert(err.message || "Failed to update review status");
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 900 }}>Customer Review Moderation</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '4px' }}>
          Approve or reject customer-submitted reviews and uploaded photos before public display.
        </p>
      </div>

      <div className="glass-card" style={{ overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>Loading reviews...</div>
        ) : reviews.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>No reviews waiting for moderation.</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--bg-input)', borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-secondary)' }}>
                  <th style={{ padding: '14px 18px' }}>Product</th>
                  <th style={{ padding: '14px 18px' }}>Customer</th>
                  <th style={{ padding: '14px 18px' }}>Rating</th>
                  <th style={{ padding: '14px 18px' }}>Comment</th>
                  <th style={{ padding: '14px 18px' }}>Photo</th>
                  <th style={{ padding: '14px 18px' }}>Status</th>
                  <th style={{ padding: '14px 18px', textAlign: 'right' }}>Moderation</th>
                </tr>
              </thead>
              <tbody>
                {reviews.map((rev) => (
                  <tr key={rev.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={{ padding: '14px 18px', fontWeight: 700 }}>
                      {rev.products?.name_en || "Product"}
                    </td>
                    <td style={{ padding: '14px 18px' }}>
                      {rev.customer_name || "Guest"}
                    </td>
                    <td style={{ padding: '14px 18px' }}>
                      <div style={{ display: 'flex', gap: '2px' }}>
                        {[...Array(rev.rating || 5)].map((_, i) => (
                          <Star key={i} size={13} fill="#FFB800" color="#FFB800" />
                        ))}
                      </div>
                    </td>
                    <td style={{ padding: '14px 18px', maxWidth: '300px' }}>
                      <span style={{ fontStyle: 'italic' }}>"{rev.comment}"</span>
                    </td>
                    <td style={{ padding: '14px 18px' }}>
                      {rev.review_images && rev.review_images.length > 0 ? (
                        <img
                          src={rev.review_images[0].image_url}
                          alt="review photo"
                          style={{ width: '42px', height: '42px', borderRadius: 'var(--radius-xs)', objectFit: 'cover' }}
                        />
                      ) : (
                        <span style={{ color: 'var(--text-muted)' }}>—</span>
                      )}
                    </td>
                    <td style={{ padding: '14px 18px' }}>
                      <span className={`badge ${rev.status === 'approved' ? 'badge-green' : rev.status === 'rejected' ? 'badge-sale' : 'badge-gold'}`}>
                        {rev.status}
                      </span>
                    </td>
                    <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                        <button
                          onClick={() => handleModeration(rev.id, 'approved')}
                          className="btn btn-primary btn-sm"
                          title="Approve Review"
                          style={{ padding: '4px 10px' }}
                        >
                          <Check size={14} />
                        </button>
                        <button
                          onClick={() => handleModeration(rev.id, 'rejected')}
                          className="btn btn-danger btn-sm"
                          title="Reject Review"
                          style={{ padding: '4px 10px' }}
                        >
                          <X size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminReviewsPage;
