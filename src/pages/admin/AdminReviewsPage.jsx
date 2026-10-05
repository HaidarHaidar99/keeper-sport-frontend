import React, { useState, useEffect, useCallback } from 'react';
import { Star, Eye, EyeOff, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { adminApi } from '../../api/adminApi';
import ConfirmModal from '../../components/admin/ConfirmModal';

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState({ total: 0, visible: 0, hidden: 0, averageRating: 0 });
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  // Delete Modal
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: null });
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Toast
  const [toastMessage, setToastMessage] = useState(null);
  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const fetchReviews = useCallback(async (targetPage = 1) => {
    setLoading(true);
    try {
      const res = await adminApi.getReviews({ page: targetPage, limit: 15 });
      if (res && res.success) {
        setReviews(res.reviews || []);
        setTotalCount(res.total || 0);
        setPage(res.page || targetPage);
        setTotalPages(res.totalPages || 1);
        if (res.stats) setStats(res.stats);
      }
    } catch (err) {
      console.error('Error fetching reviews:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReviews(1);
  }, [fetchReviews]);

  const handleToggleVisibility = async (rev) => {
    try {
      const res = await adminApi.toggleReviewVisibility(rev.id, !rev.is_visible);
      if (res && res.success) {
        setReviews((prev) =>
          prev.map((r) => (r.id === rev.id ? { ...r, is_visible: !rev.is_visible } : r))
        );
        showToast(`Review visibility set to ${!rev.is_visible ? 'Visible' : 'Hidden'}.`);
        fetchReviews(page);
      }
    } catch {
      showToast('Error updating review visibility.');
    }
  };

  const handleConfirmDelete = async () => {
    setDeleteLoading(true);
    try {
      const res = await adminApi.deleteReview(deleteModal.id);
      if (res && res.success) {
        showToast('Review deleted.');
        setDeleteModal({ isOpen: false, id: null });
        fetchReviews(page);
      } else {
        showToast('Failed to delete review.');
      }
    } catch {
      showToast('Network error during delete.');
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="ks-admin-page-container">
      {toastMessage && (
        <div className="ks-admin-toast" role="status">
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="ks-admin-header-row">
        <div>
          <span className="ks-admin-header-eyebrow">FEEDBACK &amp; RATINGS</span>
          <h1 className="ks-admin-page-title">Reviews Moderation</h1>
        </div>
      </div>

      {/* STAT CARDS */}
      <div className="ks-admin-stats-grid">
        <div className="ks-admin-stat-card">
          <div className="ks-stat-card-icon-wrap is-neutral">
            <Star size={20} />
          </div>
          <div className="ks-stat-card-content">
            <span className="ks-stat-card-label">TOTAL REVIEWS</span>
            <div className="ks-stat-card-value">{loading ? '—' : stats.total}</div>
          </div>
        </div>

        <div className="ks-admin-stat-card">
          <div className="ks-stat-card-icon-wrap is-neutral">
            <Star size={20} style={{ color: '#F59E0B' }} />
          </div>
          <div className="ks-stat-card-content">
            <span className="ks-stat-card-label">AVERAGE RATING</span>
            <div className="ks-stat-card-value">{loading ? '—' : `★ ${stats.averageRating}`}</div>
          </div>
        </div>

        <div className="ks-admin-stat-card">
          <div className="ks-stat-card-icon-wrap is-neutral">
            <Eye size={20} />
          </div>
          <div className="ks-stat-card-content">
            <span className="ks-stat-card-label">VISIBLE IN STORE</span>
            <div className="ks-stat-card-value">{loading ? '—' : stats.visible}</div>
          </div>
        </div>

        <div className="ks-admin-stat-card">
          <div className="ks-stat-card-icon-wrap is-neutral">
            <EyeOff size={20} />
          </div>
          <div className="ks-stat-card-content">
            <span className="ks-stat-card-label">HIDDEN</span>
            <div className="ks-stat-card-value">{loading ? '—' : stats.hidden}</div>
          </div>
        </div>
      </div>

      {/* REVIEWS TABLE */}
      <section className="ks-admin-panel" aria-label="Reviews Moderation Table">
        <div className="ks-admin-panel-body" style={{ padding: 0 }}>
          {loading ? (
            <div className="ks-admin-table-loading">Loading reviews...</div>
          ) : reviews.length === 0 ? (
            <div className="ks-admin-empty-notice" style={{ padding: '48px 24px' }}>
              <span>No product reviews submitted yet.</span>
            </div>
          ) : (
            <div className="ks-admin-table-responsive">
              <table className="ks-admin-table">
                <thead>
                  <tr>
                    <th>Customer</th>
                    <th>Product</th>
                    <th>Rating</th>
                    <th>Review Content</th>
                    <th>Date</th>
                    <th>Visible</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {reviews.map((rev) => (
                    <tr key={rev.id}>
                      <td>
                        <div className="ks-table-strong">{rev.users?.full_name || 'Customer'}</div>
                        <div className="ks-table-subtext">{rev.users?.email}</div>
                      </td>
                      <td>
                        <span className="ks-table-strong">{rev.product_name_snapshot}</span>
                      </td>
                      <td>
                        <span className="ks-rating-badge">★ {parseFloat(rev.rating).toFixed(1)}</span>
                      </td>
                      <td>
                        <p className="ks-review-snippet">{rev.review_text}</p>
                      </td>
                      <td>{new Date(rev.created_at).toLocaleDateString()}</td>
                      <td>
                        <button
                          type="button"
                          onClick={() => handleToggleVisibility(rev)}
                          className={`ks-toggle-switch ${rev.is_visible ? 'is-active' : ''}`}
                          aria-label={rev.is_visible ? 'Hide review' : 'Show review'}
                        >
                          <span className="ks-toggle-slider" />
                        </button>
                      </td>
                      <td>
                        <button
                          type="button"
                          onClick={() => setDeleteModal({ isOpen: true, id: rev.id })}
                          className="ks-table-icon-btn is-danger"
                          title="Delete Review"
                        >
                          <Trash2 size={15} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="ks-admin-table-pagination">
              <span className="ks-table-page-info">
                Page {page} of {totalPages} ({totalCount} total reviews)
              </span>

              <div className="ks-table-page-controls">
                <button
                  type="button"
                  onClick={() => fetchReviews(page - 1)}
                  disabled={page <= 1 || loading}
                  className="ks-table-page-btn"
                >
                  <ChevronLeft size={16} />
                  <span>Prev</span>
                </button>
                <button
                  type="button"
                  onClick={() => fetchReviews(page + 1)}
                  disabled={page >= totalPages || loading}
                  className="ks-table-page-btn"
                >
                  <span>Next</span>
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Delete Confirmation */}
      <ConfirmModal
        isOpen={deleteModal.isOpen}
        title="Delete Review"
        message="Are you sure you want to permanently delete this customer review? The product average rating will automatically update."
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteModal({ isOpen: false, id: null })}
        loading={deleteLoading}
      />
    </div>
  );
}
