import React, { useState, useEffect, useCallback } from 'react';
import {
  ShoppingBag,
  Search,
  ChevronLeft,
  ChevronRight,
  Eye,
  CheckCircle,
  Clock,
  Truck,
  XCircle,
  X,
  AlertTriangle,
  Loader2,
  Check,
  Ban
} from 'lucide-react';
import { adminApi } from '../../api/adminApi';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState({ total: 0, pending: 0, preparing: 0, onDelivery: 0, delivered: 0, cancelled: 0 });
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  // Selected Order for Modal
  const [viewingOrder, setViewingOrder] = useState(null);

  // Rejection modal
  const [rejectingOrder, setRejectingOrder] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [rejectError, setRejectError] = useState(null);
  const [isSubmittingReject, setIsSubmittingReject] = useState(false);

  // Action loading per order
  const [actionLoadingId, setActionLoadingId] = useState(null);

  // Toast
  const [toastMessage, setToastMessage] = useState(null);
  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const fetchOrders = useCallback(async (targetPage = 1) => {
    setLoading(true);
    try {
      const res = await adminApi.getOrders({
        page: targetPage,
        limit: 15,
        status: selectedStatus || undefined,
        search: searchTerm || undefined
      });

      if (res && res.success) {
        setOrders(res.orders || []);
        setTotalCount(res.total || 0);
        setPage(res.page || targetPage);
        setTotalPages(res.totalPages || 1);
        if (res.stats) setStats(res.stats);
      }
    } catch (err) {
      console.error('Error fetching orders:', err);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, selectedStatus]);

  useEffect(() => {
    fetchOrders(1);
  }, [fetchOrders]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchOrders(1);
  };

  const handleStatusChange = async (orderId, newStatus, message = null) => {
    if (actionLoadingId === orderId) return;
    setActionLoadingId(orderId);

    try {
      const res = await adminApi.updateOrderStatus(orderId, newStatus, message);
      if (res && res.success) {
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, ...res.order, status: newStatus, rejection_message: message || o.rejection_message } : o))
        );
        showToast(`Order status updated to ${newStatus.replace(/_/g, ' ')}.`);
        fetchOrders(page);
      } else {
        showToast(res.message || 'Failed to update order status.');
      }
    } catch {
      showToast('Network error updating status.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const openRejectModal = (ord) => {
    setRejectingOrder(ord);
    setRejectionReason('');
    setRejectError(null);
  };

  const handleConfirmReject = async () => {
    if (!rejectingOrder || isSubmittingReject) return;
    if (!rejectionReason.trim()) {
      setRejectError('Please enter a rejection reason.');
      return;
    }

    setIsSubmittingReject(true);
    setRejectError(null);

    try {
      const res = await adminApi.updateOrderStatus(rejectingOrder.id, 'rejected', rejectionReason.trim());
      if (res && res.success) {
        setOrders((prev) =>
          prev.map((o) =>
            o.id === rejectingOrder.id
              ? { ...o, ...res.order, status: 'rejected', rejection_message: rejectionReason.trim() }
              : o
          )
        );
        showToast(`Order #${rejectingOrder.order_number} has been rejected.`);
        setRejectingOrder(null);
        fetchOrders(page);
      } else {
        setRejectError(res.message || 'Failed to reject order.');
      }
    } catch {
      setRejectError('Network error rejecting order.');
    } finally {
      setIsSubmittingReject(false);
    }
  };

  return (
    <div className="ks-admin-page-container">
      {/* Toast */}
      {toastMessage && (
        <div className="ks-admin-toast" role="status">
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="ks-admin-header-row">
        <div>
          <span className="ks-admin-header-eyebrow">COMMERCE &amp; FULFILLMENT</span>
          <h1 className="ks-admin-page-title">Orders Management</h1>
        </div>
      </div>

      {/* STAT CARDS */}
      <div className="ks-admin-stats-grid">
        <div className="ks-admin-stat-card">
          <div className="ks-stat-card-icon-wrap is-neutral">
            <ShoppingBag size={20} />
          </div>
          <div className="ks-stat-card-content">
            <span className="ks-stat-card-label">TOTAL ORDERS</span>
            <div className="ks-stat-card-value">{loading ? '—' : stats.total}</div>
          </div>
        </div>

        <div className={`ks-admin-stat-card ${stats.pending > 0 ? 'is-warning' : ''}`}>
          <div className="ks-stat-card-icon-wrap is-danger">
            <Clock size={20} />
          </div>
          <div className="ks-stat-card-content">
            <span className="ks-stat-card-label">PENDING</span>
            <div className="ks-stat-card-value is-red">{loading ? '—' : stats.pending}</div>
            <div className="ks-stat-card-subtext">Needs Review</div>
          </div>
        </div>

        <div className="ks-admin-stat-card">
          <div className="ks-stat-card-icon-wrap is-neutral">
            <Truck size={20} />
          </div>
          <div className="ks-stat-card-content">
            <span className="ks-stat-card-label">ON DELIVERY</span>
            <div className="ks-stat-card-value">{loading ? '—' : stats.onDelivery}</div>
          </div>
        </div>

        <div className="ks-admin-stat-card">
          <div className="ks-stat-card-icon-wrap is-neutral">
            <CheckCircle size={20} />
          </div>
          <div className="ks-stat-card-content">
            <span className="ks-stat-card-label">DELIVERED</span>
            <div className="ks-stat-card-value">{loading ? '—' : stats.delivered}</div>
          </div>
        </div>
      </div>

      {/* FILTER & SEARCH BAR */}
      <div className="ks-admin-filter-bar">
        <form onSubmit={handleSearchSubmit} className="ks-admin-search-form">
          <Search size={16} className="ks-search-icon" />
          <input
            type="search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by customer name, phone, email..."
            className="ks-admin-search-input"
          />
        </form>

        <div className="ks-admin-filter-group">
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="ks-admin-filter-select"
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="accepted">Accepted</option>
            <option value="preparing">Preparing</option>
            <option value="on_delivery">On Delivery</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* ORDERS TABLE */}
      <section className="ks-admin-panel" aria-label="Orders Table">
        <div className="ks-admin-panel-body" style={{ padding: 0 }}>
          {loading ? (
            <div className="ks-admin-table-loading">Loading orders...</div>
          ) : orders.length === 0 ? (
            <div className="ks-admin-empty-notice" style={{ padding: '48px 24px' }}>
              <span>No orders found matching the selected criteria.</span>
            </div>
          ) : (
            <div className="ks-admin-table-responsive">
              <table className="ks-admin-table">
                <thead>
                  <tr>
                    <th>Order #</th>
                    <th>Customer</th>
                    <th>Contact</th>
                    <th>Area</th>
                    <th>Total</th>
                    <th>Payment</th>
                    <th>Status</th>
                    <th>Workflow Action</th>
                    <th>Date</th>
                    <th>Details</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((ord) => {
                    const isBusy = actionLoadingId === ord.id;
                    return (
                      <tr key={ord.id}>
                        <td>
                          <span className="ks-table-strong">#{ord.order_number}</span>
                        </td>
                        <td>
                          <div className="ks-table-strong">{ord.customer_full_name}</div>
                          {ord.customer_email && <div className="ks-table-subtext">{ord.customer_email}</div>}
                        </td>
                        <td>{ord.customer_phone}</td>
                        <td>{ord.area}</td>
                        <td>
                          <span className="ks-table-strong">${parseFloat(ord.total).toFixed(2)}</span>
                        </td>
                        <td>
                          <span className="ks-table-subtext">{ord.payment_method?.replace(/_/g, ' ').toUpperCase()}</span>
                        </td>
                        <td>
                          <span className={`ks-status-badge is-${ord.status}`}>
                            {ord.status.replace(/_/g, ' ')}
                          </span>
                        </td>
                        <td>
                          {/* STRICT CONTEXTUAL ACTIONS */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                            {ord.status === 'pending' && (
                              <>
                                <button
                                  type="button"
                                  onClick={() => handleStatusChange(ord.id, 'accepted')}
                                  disabled={isBusy}
                                  title="Accept order"
                                  style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '4px',
                                    padding: '4px 8px',
                                    fontSize: '11px',
                                    fontWeight: 700,
                                    borderRadius: '4px',
                                    border: 'none',
                                    background: '#16a34a',
                                    color: '#fff',
                                    cursor: isBusy ? 'not-allowed' : 'pointer',
                                    opacity: isBusy ? 0.6 : 1
                                  }}
                                >
                                  {isBusy ? <Loader2 size={11} className="ks-spin-icon" /> : <Check size={11} />}
                                  <span>Accept</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => openRejectModal(ord)}
                                  disabled={isBusy}
                                  title="Reject order"
                                  style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '4px',
                                    padding: '4px 8px',
                                    fontSize: '11px',
                                    fontWeight: 700,
                                    borderRadius: '4px',
                                    border: '1px solid rgba(220, 38, 38, 0.4)',
                                    background: 'rgba(220, 38, 38, 0.08)',
                                    color: '#dc2626',
                                    cursor: isBusy ? 'not-allowed' : 'pointer',
                                    opacity: isBusy ? 0.6 : 1
                                  }}
                                >
                                  <Ban size={11} />
                                  <span>Reject</span>
                                </button>
                              </>
                            )}

                            {ord.status === 'accepted' && (
                              <button
                                type="button"
                                onClick={() => handleStatusChange(ord.id, 'preparing')}
                                disabled={isBusy}
                                title="Advance to preparing"
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                  padding: '4px 10px',
                                  fontSize: '11px',
                                  fontWeight: 700,
                                  borderRadius: '4px',
                                  border: 'none',
                                  background: '#7c3aed',
                                  color: '#fff',
                                  cursor: isBusy ? 'not-allowed' : 'pointer'
                                }}
                              >
                                {isBusy ? <Loader2 size={11} className="ks-spin-icon" /> : null}
                                <span>Advance to Preparing</span>
                              </button>
                            )}

                            {ord.status === 'preparing' && (
                              <button
                                type="button"
                                onClick={() => handleStatusChange(ord.id, 'on_delivery')}
                                disabled={isBusy}
                                title="Advance to on delivery"
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                  padding: '4px 10px',
                                  fontSize: '11px',
                                  fontWeight: 700,
                                  borderRadius: '4px',
                                  border: 'none',
                                  background: '#0284c7',
                                  color: '#fff',
                                  cursor: isBusy ? 'not-allowed' : 'pointer'
                                }}
                              >
                                {isBusy ? <Loader2 size={11} className="ks-spin-icon" /> : <Truck size={11} />}
                                <span>Dispatch (On Delivery)</span>
                              </button>
                            )}

                            {ord.status === 'on_delivery' && (
                              <button
                                type="button"
                                onClick={() => handleStatusChange(ord.id, 'delivered')}
                                disabled={isBusy}
                                title="Mark as delivered"
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                  padding: '4px 10px',
                                  fontSize: '11px',
                                  fontWeight: 700,
                                  borderRadius: '4px',
                                  border: 'none',
                                  background: '#16a34a',
                                  color: '#fff',
                                  cursor: isBusy ? 'not-allowed' : 'pointer'
                                }}
                              >
                                {isBusy ? <Loader2 size={11} className="ks-spin-icon" /> : <CheckCircle size={11} />}
                                <span>Mark Delivered</span>
                              </button>
                            )}

                            {(ord.status === 'delivered' || ord.status === 'rejected' || ord.status === 'cancelled') && (
                              <span style={{ fontSize: '11px', color: 'var(--ks-text-muted)', fontStyle: 'italic' }}>
                                Final Stage
                              </span>
                            )}
                          </div>
                        </td>
                        <td>{new Date(ord.created_at).toLocaleDateString()}</td>
                        <td>
                          <button
                            type="button"
                            onClick={() => setViewingOrder(ord)}
                            className="ks-table-icon-btn"
                            title="View Order Details"
                          >
                            <Eye size={15} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination Footer */}
          {totalPages > 1 && (
            <div className="ks-admin-table-pagination">
              <span className="ks-table-page-info">
                Page {page} of {totalPages} ({totalCount} total orders)
              </span>

              <div className="ks-table-page-controls">
                <button
                  type="button"
                  onClick={() => fetchOrders(page - 1)}
                  disabled={page <= 1 || loading}
                  className="ks-table-page-btn"
                >
                  <ChevronLeft size={16} />
                  <span>Prev</span>
                </button>
                <button
                  type="button"
                  onClick={() => fetchOrders(page + 1)}
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

      {/* VIEW ORDER DETAILS MODAL */}
      {viewingOrder && (
        <div className="ks-admin-modal-backdrop" onClick={() => setViewingOrder(null)} role="dialog" aria-modal="true">
          <div className="ks-admin-modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="ks-admin-modal-header">
              <h3 className="ks-admin-modal-title">
                Order #{viewingOrder.order_number} Details
              </h3>
              <button type="button" onClick={() => setViewingOrder(null)} className="ks-admin-modal-close-btn" aria-label="Close">
                <X size={18} />
              </button>
            </div>

            <div className="ks-admin-modal-body">
              <div className="ks-detail-list">
                <div className="ks-detail-row">
                  <span className="ks-detail-label">Status</span>
                  <span className="ks-detail-value">
                    <span className={`ks-status-badge is-${viewingOrder.status}`}>
                      {viewingOrder.status.replace(/_/g, ' ')}
                    </span>
                  </span>
                </div>
                {viewingOrder.rejection_message && (
                  <div className="ks-detail-row" style={{ background: 'rgba(220, 38, 38, 0.08)', borderRadius: '6px', padding: '8px 12px' }}>
                    <span className="ks-detail-label" style={{ color: 'var(--ks-error-red)' }}>Rejection Reason</span>
                    <span className="ks-detail-value" style={{ color: 'var(--ks-error-red)', fontWeight: 600 }}>
                      {viewingOrder.rejection_message}
                    </span>
                  </div>
                )}
                <div className="ks-detail-row">
                  <span className="ks-detail-label">Customer Name</span>
                  <span className="ks-detail-value">{viewingOrder.customer_full_name}</span>
                </div>
                <div className="ks-detail-row">
                  <span className="ks-detail-label">Phone</span>
                  <span className="ks-detail-value">{viewingOrder.customer_phone}</span>
                </div>
                <div className="ks-detail-row">
                  <span className="ks-detail-label">Email</span>
                  <span className="ks-detail-value">{viewingOrder.customer_email || '—'}</span>
                </div>
                <div className="ks-detail-row">
                  <span className="ks-detail-label">Area / Location</span>
                  <span className="ks-detail-value">{viewingOrder.area}</span>
                </div>
                <div className="ks-detail-row">
                  <span className="ks-detail-label">Address</span>
                  <span className="ks-detail-value">{viewingOrder.address || '—'}</span>
                </div>
                {viewingOrder.location_url && (
                  <div className="ks-detail-row">
                    <span className="ks-detail-label">Map / Location URL</span>
                    <a href={viewingOrder.location_url} target="_blank" rel="noreferrer" className="ks-detail-value" style={{ color: 'var(--ks-accent-red)' }}>
                      Open Location Pin
                    </a>
                  </div>
                )}
                <div className="ks-detail-row">
                  <span className="ks-detail-label">Subtotal</span>
                  <span className="ks-detail-value">${parseFloat(viewingOrder.subtotal).toFixed(2)}</span>
                </div>
                <div className="ks-detail-row">
                  <span className="ks-detail-label">Delivery Fee</span>
                  <span className="ks-detail-value">${parseFloat(viewingOrder.delivery_fee).toFixed(2)}</span>
                </div>
                <div className="ks-detail-row">
                  <span className="ks-detail-label">Grand Total</span>
                  <span className="ks-detail-value" style={{ fontWeight: 800, color: 'var(--ks-accent-red)' }}>
                    ${parseFloat(viewingOrder.total).toFixed(2)}
                  </span>
                </div>
              </div>

              {Array.isArray(viewingOrder.order_items) && viewingOrder.order_items.length > 0 && (
                <div style={{ marginTop: '20px', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '16px' }}>
                  <h4 style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '0.05em', color: 'var(--ks-text-muted)', textTransform: 'uppercase', marginBottom: '12px' }}>
                    Ordered Products ({viewingOrder.order_items.length})
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {viewingOrder.order_items.map((item) => (
                      <div key={item.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', background: 'rgba(255,255,255,0.03)', borderRadius: '6px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          {item.cover_image_path_snapshot ? (
                            <img src={item.cover_image_path_snapshot} alt={item.product_name_snapshot} style={{ width: '36px', height: '36px', objectFit: 'cover', borderRadius: '4px' }} />
                          ) : null}
                          <div>
                            <div style={{ fontWeight: 600, fontSize: '13px' }}>{item.product_name_snapshot}</div>
                            <div style={{ fontSize: '11px', color: 'var(--ks-text-muted)' }}>
                              Qty: {item.quantity} · ${Number(item.final_unit_price).toFixed(2)} each
                              {item.size_value_snapshot && ` · Size: ${item.size_value_snapshot}`}
                              {item.color_value_snapshot && ` · Color: ${item.color_value_snapshot}`}
                              {item.printed_name && ` · Print: ${item.printed_name} #${item.printed_number}`}
                              {item.badge && ` · Badge: ${item.badge}`}
                            </div>
                          </div>
                        </div>
                        <div style={{ fontWeight: 700, fontSize: '13px' }}>
                          ${Number(item.line_total || item.final_unit_price * item.quantity).toFixed(2)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="ks-admin-modal-footer">
              <button
                type="button"
                onClick={() => setViewingOrder(null)}
                className="ks-admin-btn-secondary"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* REJECTION REASON MODAL */}
      {rejectingOrder && (
        <div
          className="ks-admin-modal-backdrop"
          onClick={() => {
            if (!isSubmittingReject) setRejectingOrder(null);
          }}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="ks-admin-modal-box"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '440px' }}
          >
            <div className="ks-admin-modal-header">
              <h3 className="ks-admin-modal-title" style={{ color: 'var(--ks-error-red, #dc2626)' }}>
                Reject Order #{rejectingOrder.order_number}
              </h3>
              <button
                type="button"
                onClick={() => setRejectingOrder(null)}
                disabled={isSubmittingReject}
                className="ks-admin-modal-close-btn"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            <div className="ks-admin-modal-body">
              <p style={{ fontSize: '13px', color: 'var(--ks-text-subtitle)', marginBottom: '16px' }}>
                Please provide the reason why this order is being rejected. The customer will see this message in their order tracking.
              </p>

              {rejectError && (
                <div style={{ background: 'rgba(220, 38, 38, 0.1)', color: 'var(--ks-error-red)', padding: '8px 12px', borderRadius: '6px', fontSize: '13px', marginBottom: '14px' }}>
                  {rejectError}
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--ks-text-label)' }}>
                  Rejection Reason <span style={{ color: 'var(--ks-accent-red)' }}>*</span>
                </label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="e.g. Out of stock, Address outside delivery area, Unreachable phone number..."
                  rows={4}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    border: '1px solid var(--ks-border-input)',
                    background: 'var(--ks-bg-input)',
                    color: 'var(--ks-text-input)',
                    fontSize: '13px',
                    fontFamily: 'inherit',
                    resize: 'vertical'
                  }}
                  autoFocus
                />
              </div>
            </div>

            <div className="ks-admin-modal-footer">
              <button
                type="button"
                onClick={() => setRejectingOrder(null)}
                disabled={isSubmittingReject}
                className="ks-admin-btn-secondary"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmReject}
                disabled={isSubmittingReject || !rejectionReason.trim()}
                style={{
                  background: 'var(--ks-error-red, #dc2626)',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '8px 18px',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: isSubmittingReject || !rejectionReason.trim() ? 'not-allowed' : 'pointer',
                  opacity: isSubmittingReject || !rejectionReason.trim() ? 0.6 : 1,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                {isSubmittingReject ? <Loader2 size={14} className="ks-spin-icon" /> : <Ban size={14} />}
                <span>Reject Order</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
