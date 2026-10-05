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
  X
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

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const res = await adminApi.updateOrderStatus(orderId, newStatus);
      if (res && res.success) {
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
        );
        showToast(`Order status updated to ${newStatus}.`);
        fetchOrders(page);
      } else {
        showToast(res.message || 'Failed to update order status.');
      }
    } catch {
      showToast('Network error updating status.');
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

      {/* ORDERS TOOLBAR */}
      <div className="ks-admin-filter-toolbar">
        <form onSubmit={handleSearchSubmit} className="ks-admin-search-wrap">
          <Search size={15} className="ks-admin-search-icon" />
          <input
            type="search"
            placeholder="Search by customer name, phone, or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="ks-admin-input is-search"
          />
        </form>

        <div className="ks-admin-filter-actions">
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="ks-admin-select"
            aria-label="Filter by order status"
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
                    <th>Date</th>
                    <th>Details</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((ord) => (
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
                        <select
                          value={ord.status}
                          onChange={(e) => handleStatusChange(ord.id, e.target.value)}
                          className={`ks-status-select is-${ord.status}`}
                        >
                          <option value="pending">Pending</option>
                          <option value="accepted">Accepted</option>
                          <option value="preparing">Preparing</option>
                          <option value="on_delivery">On Delivery</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                          <option value="rejected">Rejected</option>
                        </select>
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
                  ))}
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
    </div>
  );
}
