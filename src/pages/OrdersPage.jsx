import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Package, Clock, CheckCircle2, XCircle, ArrowRight, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSite } from '../context/SiteContext';
import { productApi } from '../api/productApi';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function OrdersPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { siteSettings, categories } = useSite();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    if (!user) {
      setLoading(false);
      return;
    }

    productApi.getUserOrders()
      .then((ordersRes) => {
        if (!isMounted) return;
        if (ordersRes?.success) setOrders(ordersRes.orders || []);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [user]);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'delivered':
        return <span className="ks-badge ks-badge-delivered">DELIVERED</span>;
      case 'on_delivery':
        return <span className="ks-badge ks-badge-shipping">ON DELIVERY</span>;
      case 'preparing':
      case 'accepted':
        return <span className="ks-badge ks-badge-preparing">PREPARING</span>;
      case 'rejected':
      case 'cancelled':
        return <span className="ks-badge ks-badge-rejected">CANCELLED</span>;
      default:
        return <span className="ks-badge ks-badge-pending">PENDING</span>;
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

        {!user ? (
          <div className="ks-catalog-empty">
            <Package size={48} style={{ opacity: 0.25, marginBottom: '16px' }} />
            <h3>Sign in to view your orders</h3>
            <p>Track your current shipments and past purchases.</p>
            <button
              type="button"
              onClick={() => navigate('/login?redirect=/orders')}
              className="ks-btn-primary"
              style={{ display: 'inline-flex', marginTop: '16px' }}
            >
              <span>SIGN IN TO YOUR ACCOUNT</span>
            </button>
          </div>
        ) : loading ? (
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
          </div>
        ) : (
          <div className="ks-orders-list">
            {orders.map((order) => {
              const orderItems = order.order_items || [];
              return (
                <div key={order.id} className="ks-order-card">
                  <div className="ks-order-header">
                    <div>
                      <span className="ks-order-num">Order #{order.order_number}</span>
                      <span className="ks-order-date">
                        Placed on {new Date(order.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <div>{getStatusBadge(order.status)}</div>
                  </div>

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
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="ks-order-footer" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                    <div style={{ fontSize: '13px', color: 'var(--ks-text-muted)' }}>
                      Subtotal: ${Number(order.subtotal != null ? order.subtotal : (order.total - (order.delivery_fee || 0))).toFixed(2)} · Delivery: ${Number(order.delivery_fee || 0).toFixed(2)}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span className="ks-order-total-label">Total Amount:</span>
                      <span className="ks-order-total-val">${Number(order.total).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <Footer siteSettings={siteSettings} categories={categories} />
    </div>
  );
}
