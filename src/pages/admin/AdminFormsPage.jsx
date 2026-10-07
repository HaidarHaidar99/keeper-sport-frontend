import React, { useState, useEffect, useCallback } from 'react';
import {
  MessageSquare,
  Search,
  Eye,
  Check,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Mail,
  Phone,
  User,
  Filter,
  X,
  Inbox
} from 'lucide-react';
import { adminApi } from '../../api/adminApi';
import ConfirmModal from '../../components/admin/ConfirmModal';

export default function AdminFormsPage() {
  const [forms, setForms] = useState([]);
  const [stats, setStats] = useState({ total: 0, unread: 0, read: 0 });
  const [pagination, setPagination] = useState({ page: 1, limit: 15, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'unread' | 'read'

  // Modal: View Message Detail
  const [activeMessage, setActiveMessage] = useState(null);

  // Modal: Delete
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: null, name: '' });
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Toast
  const [toastMessage, setToastMessage] = useState(null);
  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const fetchForms = useCallback(async (targetPage = 1) => {
    setLoading(true);
    try {
      const res = await adminApi.getForms({
        page: targetPage,
        limit: 15,
        search: search.trim() || undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined
      });

      if (res && res.success) {
        setForms(res.forms || []);
        if (res.stats) setStats(res.stats);
        if (res.pagination) {
          setPagination(res.pagination);
        }
      }
    } catch (err) {
      console.error('Error fetching contact forms:', err);
      showToast('Error loading contact form submissions.');
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter]);

  useEffect(() => {
    fetchForms(1);
  }, [fetchForms]);

  const handleMarkAsRead = async (id) => {
    try {
      const res = await adminApi.markFormRead(id);
      if (res && res.success) {
        setForms((prev) =>
          prev.map((f) => (f.id === id ? { ...f, isRead: true, readAt: new Date().toISOString() } : f))
        );
        setStats((prev) => ({
          ...prev,
          unread: Math.max(0, prev.unread - 1),
          read: prev.read + 1
        }));
        if (activeMessage && activeMessage.id === id) {
          setActiveMessage((prev) => ({ ...prev, isRead: true, readAt: new Date().toISOString() }));
        }
        showToast('Message marked as read.');
      } else {
        showToast(res.message || 'Failed to mark as read.');
      }
    } catch {
      showToast('Network error marking message as read.');
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteModal.id) return;
    setDeleteLoading(true);
    try {
      const res = await adminApi.deleteForm(deleteModal.id);
      if (res && res.success) {
        showToast('Message deleted.');
        setDeleteModal({ isOpen: false, id: null, name: '' });
        if (activeMessage && activeMessage.id === deleteModal.id) {
          setActiveMessage(null);
        }
        fetchForms(pagination.page);
      } else {
        showToast(res.message || 'Failed to delete message.');
      }
    } catch {
      showToast('Network error during delete.');
    } finally {
      setDeleteLoading(false);
    }
  };

  const formatDate = (isoString) => {
    if (!isoString) return '—';
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return isoString;
    }
  };

  return (
    <div className="ks-admin-page-container">
      {toastMessage && (
        <div className="ks-admin-toast" role="status">
          <span>{toastMessage}</span>
        </div>
      )}

      {/* HEADER */}
      <div className="ks-admin-header-row">
        <div>
          <span className="ks-admin-header-eyebrow">CUSTOMER INQUIRIES</span>
          <h1 className="ks-admin-page-title">Contact Forms</h1>
        </div>
      </div>

      {/* STAT CARDS */}
      <div className="ks-admin-stats-grid">
        <div className="ks-admin-stat-card">
          <div className="ks-stat-card-icon-wrap is-neutral">
            <MessageSquare size={20} />
          </div>
          <div className="ks-stat-card-info">
            <span className="ks-stat-card-val">{stats.total}</span>
            <span className="ks-stat-card-label">Total Submissions</span>
          </div>
        </div>

        <div className="ks-admin-stat-card">
          <div className="ks-stat-card-icon-wrap is-warning">
            <Clock size={20} />
          </div>
          <div className="ks-stat-card-info">
            <span className="ks-stat-card-val">{stats.unread}</span>
            <span className="ks-stat-card-label">New / Unread</span>
          </div>
        </div>

        <div className="ks-admin-stat-card">
          <div className="ks-stat-card-icon-wrap is-success">
            <Check size={20} />
          </div>
          <div className="ks-stat-card-info">
            <span className="ks-stat-card-val">{stats.read}</span>
            <span className="ks-stat-card-label">Read / Resolved</span>
          </div>
        </div>
      </div>

      {/* CONTROLS: SEARCH & FILTER */}
      <div className="ks-admin-controls-card">
        <div className="ks-admin-search-wrap">
          <Search size={18} className="ks-admin-search-icon" />
          <input
            type="text"
            placeholder="Search by customer name, email, phone, or message..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="ks-admin-search-input"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch('')}
              className="ks-admin-search-clear"
              aria-label="Clear search"
            >
              <X size={16} />
            </button>
          )}
        </div>

        <div className="ks-admin-filter-group">
          <div className="ks-admin-filter-pills" role="tablist">
            <button
              type="button"
              className={`ks-admin-filter-pill ${statusFilter === 'all' ? 'is-active' : ''}`}
              onClick={() => setStatusFilter('all')}
            >
              All ({stats.total})
            </button>
            <button
              type="button"
              className={`ks-admin-filter-pill ${statusFilter === 'unread' ? 'is-active' : ''}`}
              onClick={() => setStatusFilter('unread')}
            >
              New ({stats.unread})
            </button>
            <button
              type="button"
              className={`ks-admin-filter-pill ${statusFilter === 'read' ? 'is-active' : ''}`}
              onClick={() => setStatusFilter('read')}
            >
              Read ({stats.read})
            </button>
          </div>
        </div>
      </div>

      {/* SUBMISSIONS TABLE */}
      <div className="ks-admin-table-card">
        {loading ? (
          <div className="ks-admin-loading-state">
            <div className="ks-admin-spinner" />
            <p>Loading contact form submissions...</p>
          </div>
        ) : forms.length === 0 ? (
          <div className="ks-admin-empty-state">
            <Inbox size={48} className="ks-admin-empty-icon" />
            <h3>No Contact Messages</h3>
            <p>
              {search || statusFilter !== 'all'
                ? 'No inquiries match the current search or filter criteria.'
                : 'Customer inquiries submitted through Contact Us will appear here.'}
            </p>
          </div>
        ) : (
          <div className="ks-admin-table-responsive">
            <table className="ks-admin-table">
              <thead>
                <tr>
                  <th>Status</th>
                  <th>Date &amp; Time</th>
                  <th>Customer</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Message Preview</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {forms.map((item) => (
                  <tr
                    key={item.id}
                    style={{
                      background: !item.isRead ? 'rgba(239, 68, 68, 0.04)' : undefined,
                      cursor: 'pointer'
                    }}
                    onClick={() => setActiveMessage(item)}
                  >
                    <td>
                      {!item.isRead ? (
                        <span
                          className="ks-admin-badge"
                          style={{
                            background: 'rgba(239, 68, 68, 0.15)',
                            color: '#ef4444',
                            fontWeight: 700,
                            padding: '4px 8px',
                            borderRadius: '4px',
                            fontSize: '11px',
                            letterSpacing: '0.5px'
                          }}
                        >
                          NEW
                        </span>
                      ) : (
                        <span
                          className="ks-admin-badge"
                          style={{
                            background: 'rgba(107, 114, 128, 0.15)',
                            color: 'var(--ks-text-muted, #9ca3af)',
                            padding: '4px 8px',
                            borderRadius: '4px',
                            fontSize: '11px'
                          }}
                        >
                          READ
                        </span>
                      )}
                    </td>
                    <td style={{ whiteSpace: 'nowrap', fontSize: '13px', color: 'var(--ks-text-muted)' }}>
                      {formatDate(item.createdAt)}
                    </td>
                    <td style={{ fontWeight: 600 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <User size={14} style={{ opacity: 0.6 }} />
                        <span>{item.fullName || 'Anonymous'}</span>
                      </div>
                    </td>
                    <td style={{ fontSize: '13px' }}>
                      <a
                        href={`mailto:${item.email}`}
                        onClick={(e) => e.stopPropagation()}
                        style={{ color: 'var(--ks-text-secondary)', textDecoration: 'none' }}
                      >
                        {item.email}
                      </a>
                    </td>
                    <td style={{ fontSize: '13px', whiteSpace: 'nowrap' }}>
                      {item.phone ? (
                        <a
                          href={`tel:${item.phone}`}
                          onClick={(e) => e.stopPropagation()}
                          style={{ color: 'var(--ks-text-secondary)', textDecoration: 'none' }}
                        >
                          {item.phone}
                        </a>
                      ) : (
                        <span style={{ opacity: 0.4 }}>—</span>
                      )}
                    </td>
                    <td style={{ maxWidth: '300px' }}>
                      <p
                        style={{
                          margin: 0,
                          fontSize: '13px',
                          color: 'var(--ks-text-secondary)',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}
                      >
                        {item.message}
                      </p>
                    </td>
                    <td style={{ textAlign: 'right' }} onClick={(e) => e.stopPropagation()}>
                      <div className="ks-admin-row-actions">
                        <button
                          type="button"
                          className="ks-admin-icon-btn"
                          title="View Full Message"
                          onClick={() => setActiveMessage(item)}
                        >
                          <Eye size={16} />
                        </button>
                        {!item.isRead && (
                          <button
                            type="button"
                            className="ks-admin-icon-btn"
                            title="Mark as Read"
                            style={{ color: '#10b981' }}
                            onClick={() => handleMarkAsRead(item.id)}
                          >
                            <Check size={16} />
                          </button>
                        )}
                        <button
                          type="button"
                          className="ks-admin-icon-btn is-danger"
                          title="Delete Message"
                          onClick={() =>
                            setDeleteModal({
                              isOpen: true,
                              id: item.id,
                              name: item.fullName || item.email
                            })
                          }
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* PAGINATION */}
        {pagination.totalPages > 1 && (
          <div className="ks-admin-pagination-row">
            <span className="ks-admin-pagination-info">
              Page {pagination.page} of {pagination.totalPages} ({pagination.total} submissions)
            </span>
            <div className="ks-admin-pagination-btns">
              <button
                type="button"
                disabled={pagination.page <= 1}
                onClick={() => fetchForms(pagination.page - 1)}
                className="ks-admin-btn-secondary"
              >
                <ChevronLeft size={16} />
                <span>Prev</span>
              </button>
              <button
                type="button"
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => fetchForms(pagination.page + 1)}
                className="ks-admin-btn-secondary"
              >
                <span>Next</span>
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* MESSAGE DETAILS MODAL */}
      {activeMessage && (
        <div
          className="ks-admin-modal-overlay"
          onClick={() => setActiveMessage(null)}
          role="dialog"
          aria-modal="true"
          style={{ zIndex: 1000000 }}
        >
          <div
            className="ks-admin-modal-card"
            style={{ maxWidth: '640px', width: '92%' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="ks-admin-modal-header">
              <div>
                <span className="ks-admin-header-eyebrow">CONTACT SUBMISSION</span>
                <h3 className="ks-admin-modal-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>From {activeMessage.fullName || 'Customer'}</span>
                  {!activeMessage.isRead && (
                    <span
                      style={{
                        background: '#ef4444',
                        color: '#fff',
                        fontSize: '11px',
                        padding: '2px 6px',
                        borderRadius: '3px',
                        fontWeight: 700
                      }}
                    >
                      NEW
                    </span>
                  )}
                </h3>
              </div>
              <button
                type="button"
                className="ks-admin-modal-close"
                onClick={() => setActiveMessage(null)}
                aria-label="Close modal"
              >
                <X size={18} />
              </button>
            </div>

            <div className="ks-admin-modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '12px',
                  padding: '14px',
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid var(--ks-border, #2d3748)',
                  borderRadius: '8px'
                }}
              >
                <div>
                  <span style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--ks-text-muted)', letterSpacing: '0.5px' }}>
                    Customer Name
                  </span>
                  <div style={{ fontWeight: 600, marginTop: '2px' }}>{activeMessage.fullName || '—'}</div>
                </div>

                <div>
                  <span style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--ks-text-muted)', letterSpacing: '0.5px' }}>
                    Email Address
                  </span>
                  <div style={{ marginTop: '2px' }}>
                    <a
                      href={`mailto:${activeMessage.email}`}
                      style={{ color: 'var(--ks-accent-red, #ef4444)', textDecoration: 'none' }}
                    >
                      {activeMessage.email}
                    </a>
                  </div>
                </div>

                <div>
                  <span style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--ks-text-muted)', letterSpacing: '0.5px' }}>
                    Phone Number
                  </span>
                  <div style={{ marginTop: '2px' }}>
                    {activeMessage.phone ? (
                      <a
                        href={`tel:${activeMessage.phone}`}
                        style={{ color: 'var(--ks-accent-red, #ef4444)', textDecoration: 'none' }}
                      >
                        {activeMessage.phone}
                      </a>
                    ) : (
                      '—'
                    )}
                  </div>
                </div>

                <div>
                  <span style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--ks-text-muted)', letterSpacing: '0.5px' }}>
                    Date Received
                  </span>
                  <div style={{ marginTop: '2px', color: 'var(--ks-text-secondary)' }}>
                    {formatDate(activeMessage.createdAt)}
                  </div>
                </div>
              </div>

              <div>
                <span
                  style={{
                    display: 'block',
                    fontSize: '12px',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    color: 'var(--ks-text-muted)',
                    marginBottom: '8px',
                    letterSpacing: '0.5px'
                  }}
                >
                  Message Content
                </span>
                <div
                  style={{
                    padding: '16px',
                    background: 'rgba(0, 0, 0, 0.25)',
                    border: '1px solid var(--ks-border, #374151)',
                    borderRadius: '8px',
                    fontSize: '14px',
                    lineHeight: '1.6',
                    color: 'var(--ks-text-primary, #f9fafb)',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                    maxHeight: '300px',
                    overflowY: 'auto'
                  }}
                >
                  {activeMessage.message}
                </div>
              </div>
            </div>

            <div className="ks-admin-modal-footer" style={{ display: 'flex', justifyContent: 'space-between' }}>
              <button
                type="button"
                className="ks-admin-btn-danger"
                onClick={() =>
                  setDeleteModal({
                    isOpen: true,
                    id: activeMessage.id,
                    name: activeMessage.fullName || activeMessage.email
                  })
                }
              >
                <Trash2 size={16} />
                <span>Delete</span>
              </button>

              <div style={{ display: 'flex', gap: '8px' }}>
                {!activeMessage.isRead && (
                  <button
                    type="button"
                    className="ks-admin-btn-primary"
                    onClick={() => handleMarkAsRead(activeMessage.id)}
                  >
                    <Check size={16} />
                    <span>Mark as Read</span>
                  </button>
                )}
                <button
                  type="button"
                  className="ks-admin-btn-secondary"
                  onClick={() => setActiveMessage(null)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE MODAL */}
      <ConfirmModal
        isOpen={deleteModal.isOpen}
        title="Delete Contact Inquiry"
        message={`Are you sure you want to permanently delete the inquiry from "${deleteModal.name}"? This action cannot be undone.`}
        confirmText="Delete Message"
        confirmVariant="danger"
        isLoading={deleteLoading}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteModal({ isOpen: false, id: null, name: '' })}
      />
    </div>
  );
}
