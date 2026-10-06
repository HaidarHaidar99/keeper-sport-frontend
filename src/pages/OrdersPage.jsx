import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Package, Clock, CheckCircle2, XCircle, ArrowRight, Loader2, Ban, EyeOff, AlertTriangle, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSite } from '../context/SiteContext';
import { productApi } from '../api/productApi';
import { getHiddenOrderIds, hideOrderFromHistory } from '../utils/guestIdentity';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function OrdersPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { siteSettings, categories, refreshCounts } = useSite();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [orderToCancel, setOrderToCancel] = useState(null);
  const [cancelling, setCancelling] = useState(false);
  const [cancelError, setCancelError] = useState(null);

  const [orderToHide, setOrderToHide] = useState(null);

  const fetchOrders = () => {
    return productApi.getUserOrders().then((ordersRes) => {
      if (ordersRes?.success && Array.isArray(ordersRes.orders)) {
        const hiddenIds = getHiddenOrderIds();
        const visible = ordersRes.orders.filter((o) => !hiddenIds.includes(o.id));
        setOrders(visible);
      }
    });
  };

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    fetchOrders().finally(() => {
      if (isMounted) setLoading(false);
    });

    return () => {
      isMounted = false;
    };
  }, [user]);

  const handleConfirmCancel = async () => {
    if (!orderToCancel || cancelling) return;
    setCancelling(true);
    setCancelError(null);

    try {
      const res = await productApi.cancelOrder(orderToCancel.id);
      if (res?.success) {
        setOrders((prev) =>
          prev.map((o) => (o.id === orderToCancel.id ? { ...o, status: 'cancelled' } : o))
        );
        if (typeof refreshCounts === 'function') refreshCounts();
        setOrderToCancel(null);
      } else {
        setCancelError(res?.message || 'Could not cancel order.');
      }
    } catch {
      setCancelError('Network error while cancelling order.');
    } finally {
      setCancelling(false);
    }
  };

  const handleConfirmHide = () => {
    if (!orderToHide) return;
    hideOrderFromHistory(orderToHide.id);
    setOrders((prev) => prev.filter((o) => o.id !== orderToHide.id));
    setOrderToHide(null);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'accepted':
        return <span className="ks-status-badge is-accepted">ACCEPTED</span>;
      case 'preparing':
        return <span className="ks-status-badge is-preparing">PREPARING</span>;
      case 'on_delivery':
        return <span className="ks-status-badge is-shipping">ON DELIVERY</span>;
      case 'delivered':
        return <span className="ks-status-badge is-delivered">DELIVERED</span>;
      case 'rejected':
        return <span className="ks-status-badge is-rejected">REJECTED</span>;
      case 'cancelled':
        return <span className="ks-status-badge is-cancelled">CANCELLED</span>;
      default:
        return <span className="ks-status-badge is-pending">PENDING</span>;
    }
  };

  return (
    <div className="ks-page-canvas">
      <Navbar siteSettings={siteSettings} categories={categories} />

      <main className="ks-catalog-page-container">
        <header className="ks-catalog-header">
          <div className="ks-catalog-header-badge">
            <Package size={13} style={{ color: 'var(--ks-accent-red)' }} />
            <span>ORDER HISTORY</span>
          </div>
          <h1 className="ks-catalog-title">My Orders</h1>
        </header>

        {loading ? (
          <div className="ks-catalog-loading" aria-live="polite">
            <Loader2 size={32} className="ks-spin-icon" style={{ color: 'var(--ks-accent-red)' }} />
            <p>Loading your orders...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="ks-catalog-empty">
            <Package size={48} style={{ opacity: 0.25, marginBottom: '16px' }} />
            <h3>No orders placed yet</h3>
            <p>When you complete a purchase, your order tracking will appear here.</p>
            <Link to="/products" className="ks-btn-primary" style={{ display: 'inline-flex', marginTop: '16px' }}>
              <span>BROWSE PRODUCTS</span>
            </Link>
            {!user && (
              <p style={{ marginTop: '20px', fontSize: '13px', color: 'var(--ks-text-muted)' }}>
                Have an existing account?{' '}
                <Link to="/login?redirect=/orders" style={{ color: 'var(--ks-accent-red)', textDecoration: 'underline' }}>
                  Sign in
                </Link>
              </p>
            )}
          </div>
        ) : (
          <div className="ks-orders-list">
            {orders.map((order) => {
              const orderItems = order.order_items || [];
              const isPending = order.status === 'pending';
              const isRejected = order.status === 'rejected';

              return (
                <div key={order.id} className="ks-order-card">
                  <div className="ks-order-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                    <div>
                      <span className="ks-order-num">Order #{order.order_number}</span>
                      <span className="ks-order-date">
                        Placed on {new Date(order.created_at).toLocaleDateString()}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      {getStatusBadge(order.status)}

                      {/* Remove from View Button */}
                      <button
                        type="button"
                        onClick={() => setOrderToHide(order)}
                        title="Remove order from view"
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'var(--ks-text-muted, #9ca3af)',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          padding: '4px',
                          fontSize: '11px',
                          transition: 'color 0.2s'
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--ks-error-red, #dc2626)')}
                        onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--ks-text-muted, #9ca3af)')}
                      >
                        <EyeOff size={14} />
                        <span>Hide</span>
                      </button>
                    </div>
                  </div>

                  {/* Rejection Reason Notice */}
                  {isRejected && (
                    <div
                      style={{
                        background: 'rgba(239, 68, 68, 0.08)',
                        border: '1px solid rgba(239, 68, 68, 0.25)',
                        borderRadius: '8px',
                        padding: '10px 14px',
                        margin: '12px 0 6px',
                        fontSize: '13px',
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '8px'
                      }}
                    >
                      <AlertTriangle size={16} style={{ color: 'var(--ks-error-red, #dc2626)', flexShrink: 0, marginTop: '2px' }} />
                      <div>
                        <strong style={{ color: 'var(--ks-error-red, #dc2626)' }}>Order Rejected:</strong>{' '}
                        <span style={{ color: 'var(--ks-text-title, #111317)' }}>
                          {order.rejection_message || 'Order could not be accepted.'}
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="ks-order-items-grid">
                    {orderItems.map((item) => (
                      <div key={item.id} className="ks-order-item-mini">
                        {item.cover_image_path_snapshot ? (
                          <img
                            src={item.cover_image_path_snapshot}
                            alt={item.product_name_snapshot}
                            className="ks-order-mini-img"
                          />
                        ) : (
                          <div className="ks-card-img-fallback">KS</div>
                        )}
                        <div className="ks-order-mini-info">
                          <span className="ks-order-mini-title">{item.product_name_snapshot}</span>
                          <span className="ks-order-mini-meta">
                            Qty: {item.quantity} · ${Number(item.final_unit_price).toFixed(2)}
                            {item.size_value_snapshot && ` · Size: ${item.size_value_snapshot}`}
                            {item.color_value_snapshot && ` · Color: ${item.color_value_snapshot}`}
                            {item.printed_name && ` · Print: ${item.printed_name} #${item.printed_number}`}
                            {item.badge && ` · Badge: ${item.badge}`}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="ks-order-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '12px', borderTop: '1px solid var(--ks-border-card)', paddingTop: '12px', marginTop: '12px' }}>
                    {/* Customer Action Area */}
                    <div>
                      {isPending && (
                        <button
                          type="button"
                          onClick={() => {
                            setCancelError(null);
                            setOrderToCancel(order);
                          }}
                          style={{
                            background: 'none',
                            border: '1px solid var(--ks-error-red, #dc2626)',
                            borderRadius: '6px',
                            color: 'var(--ks-error-red, #dc2626)',
                            padding: '6px 12px',
                            fontSize: '12px',
                            fontWeight: 600,
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            transition: 'background-color 0.2s, color 0.2s'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = 'var(--ks-error-red, #dc2626)';
                            e.currentTarget.style.color = '#ffffff';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'transparent';
                            e.currentTarget.style.color = 'var(--ks-error-red, #dc2626)';
                          }}
                        >
                          <Ban size={13} />
                          <span>Cancel Order</span>
                        </button>
                      )}
                    </div>

                    {/* Financial totals */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                      <div style={{ fontSize: '13px', color: 'var(--ks-text-muted)' }}>
                        Subtotal: ${Number(order.subtotal != null ? order.subtotal : (order.total - (order.delivery_fee || 0))).toFixed(2)} · Delivery: ${Number(order.delivery_fee || 0).toFixed(2)}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span className="ks-order-total-label">Total Amount:</span>
                        <span className="ks-order-total-val">${Number(order.total).toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* CANCEL ORDER CONFIRMATION MODAL */}
      {orderToCancel && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="cancel-order-title"
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(0, 0, 0, 0.65)',
            backdropFilter: 'blur(3px)',
            padding: '16px'
          }}
          onClick={() => {
            if (!cancelling) setOrderToCancel(null);
          }}
        >
          <div
            style={{
              background: 'var(--ks-bg-card, #ffffff)',
              color: 'var(--ks-text-title, #111317)',
              borderRadius: '14px',
              padding: '24px',
              maxWidth: '420px',
              width: '100%',
              boxShadow: '0 20px 40px rgba(0,0,0,0.25)',
              border: '1px solid var(--ks-border-card, #e5e7eb)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: 'rgba(220, 38, 38, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--ks-error-red, #dc2626)', flexShrink: 0 }}>
                <Ban size={20} />
              </div>
              <h3 id="cancel-order-title" style={{ fontSize: '18px', fontWeight: 700, margin: 0 }}>
                Cancel Order #{orderToCancel.order_number}?
              </h3>
            </div>

            <p style={{ fontSize: '14px', color: 'var(--ks-text-subtitle, #4b5563)', margin: '0 0 16px', lineHeight: 1.5 }}>
              Are you sure you want to cancel this order? This action cannot be reversed once confirmed.
            </p>

            {cancelError && (
              <div style={{ background: 'rgba(220, 38, 38, 0.1)', color: 'var(--ks-error-red, #dc2626)', padding: '10px 12px', borderRadius: '6px', fontSize: '13px', marginBottom: '16px' }}>
                {cancelError}
              </div>
            )}

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => setOrderToCancel(null)}
                disabled={cancelling}
                style={{
                  background: 'none',
                  border: '1px solid var(--ks-border-card, #d1d5db)',
                  borderRadius: '8px',
                  padding: '8px 16px',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: 'var(--ks-text-title, #111317)',
                  cursor: 'pointer'
                }}
              >
                Keep Order
              </button>
              <button
                type="button"
                onClick={handleConfirmCancel}
                disabled={cancelling}
                style={{
                  background: 'var(--ks-error-red, #dc2626)',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '8px 18px',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: '#ffffff',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                {cancelling ? <Loader2 size={14} className="ks-spin-icon" /> : <Ban size={14} />}
                <span>Confirm Cancellation</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* HIDE / REMOVE FROM HISTORY CONFIRMATION MODAL */}
      {orderToHide && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="hide-order-title"
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(0, 0, 0, 0.65)',
            backdropFilter: 'blur(3px)',
            padding: '16px'
          }}
          onClick={() => setOrderToHide(null)}
        >
          <div
            style={{
              background: 'var(--ks-bg-card, #ffffff)',
              color: 'var(--ks-text-title, #111317)',
              borderRadius: '14px',
              padding: '24px',
              maxWidth: '420px',
              width: '100%',
              boxShadow: '0 20px 40px rgba(0,0,0,0.25)',
              border: '1px solid var(--ks-border-card, #e5e7eb)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: 'rgba(107, 114, 128, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--ks-text-title, #111317)', flexShrink: 0 }}>
                <EyeOff size={20} />
              </div>
              <h3 id="hide-order-title" style={{ fontSize: '18px', fontWeight: 700, margin: 0 }}>
                Remove From History?
              </h3>
            </div>

            <p style={{ fontSize: '14px', color: 'var(--ks-text-subtitle, #4b5563)', margin: '0 0 20px', lineHeight: 1.5 }}>
              This will remove Order #{orderToHide.order_number} from your My Orders view on this device. (This does not delete the store's official record).
            </p>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => setOrderToHide(null)}
                style={{
                  background: 'none',
                  border: '1px solid var(--ks-border-card, #d1d5db)',
                  borderRadius: '8px',
                  padding: '8px 16px',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: 'var(--ks-text-title, #111317)',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmHide}
                style={{
                  background: 'var(--ks-text-title, #111317)',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '8px 18px',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: '#ffffff',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <EyeOff size={14} />
                <span>Remove from View</span>
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer siteSettings={siteSettings} categories={categories} />
    </div>
  );
}
