import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, Clock, CheckCircle2, Truck, XCircle, ChevronRight, ChevronLeft, ShoppingBag } from 'lucide-react';
import apiClient from '../services/apiClient';
import { useAuth } from '../context/AuthContext';
import { useGuest } from '../context/GuestContext';
import { useLanguage } from '../context/LanguageContext';

const statusBadges = {
  Pending: { bg: 'rgba(255, 184, 0, 0.15)', color: 'var(--accent-gold)' },
  Confirmed: { bg: 'rgba(0, 240, 255, 0.15)', color: 'var(--accent-cyan)' },
  Shipped: { bg: 'rgba(168, 85, 247, 0.15)', color: '#C084FC' },
  Delivered: { bg: 'rgba(0, 229, 153, 0.15)', color: 'var(--accent-green)' },
  Cancelled: { bg: 'rgba(255, 59, 48, 0.15)', color: 'var(--accent-red)' },
  Declined: { bg: 'rgba(255, 59, 48, 0.15)', color: 'var(--accent-red)' }
};

const MyOrdersPage = () => {
  const { isAuthenticated } = useAuth();
  const { guestOrders, guestToken } = useGuest();
  const { t, isRtl } = useLanguage();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      try {
        if (isAuthenticated) {
          // Fetch authenticated customer order history
          const res = await apiClient('/orders/my-orders');
          if (res?.data) setOrders(res.data);
        } else if (guestToken) {
          // Fetch guest order history via X-Guest-Token header
          const res = await apiClient('/orders/guest');
          if (res?.data) {
            setOrders(res.data);
          } else {
            setOrders(guestOrders);
          }
        } else {
          setOrders(guestOrders);
        }
      } catch (err) {
        console.warn("Could not fetch remote orders, falling back to local storage:", err);
        setOrders(guestOrders);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [isAuthenticated, guestToken]);

  return (
    <div style={{ padding: '50px 0 80px' }}>
      <div className="container" style={{ maxWidth: '800px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 900, marginBottom: '8px' }}>{t('myOrders')}</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '32px' }}>
          {isRtl ? "تتبع حالة طلباتك ومقاساتك، أو اطلب استبدال المقاس عند الاستلام." : "Track delivery milestones and request replacement size exchanges."}
        </p>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
            Loading your orders...
          </div>
        ) : orders.length === 0 ? (
          <div className="glass-card" style={{ padding: '60px 20px', textAlign: 'center' }}>
            <Package size={52} color="var(--border-medium)" style={{ margin: '0 auto 16px' }} />
            <h3 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '8px' }}>
              {isRtl ? "لا توجد طلبات مسجلة على هذا الجهاز" : "No orders found"}
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '24px' }}>
              {isRtl ? "قم بالطلب كزائر أو سجّل الدخول لحفظ واستعراض تاريخ مشترياتك." : "Order as a guest or sign in to track your official kits."}
            </p>
            <Link to="/products" className="btn btn-primary">
              {t('shop')}
            </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            {orders.map((ord) => {
              const badge = statusBadges[ord.order_status] || statusBadges.Pending;
              return (
                <Link
                  key={ord.id}
                  to={`/orders/${ord.id}`}
                  className="glass-card"
                  style={{
                    padding: '24px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '16px',
                    transition: 'all var(--transition-fast)'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                      <span style={{ fontSize: '16px', fontWeight: 900, color: 'var(--accent-cyan)' }}>
                        #{ord.order_number || ord.id.slice(0, 8).toUpperCase()}
                      </span>
                      <span style={{
                        padding: '3px 10px',
                        borderRadius: 'var(--radius-full)',
                        fontSize: '12px',
                        fontWeight: 800,
                        backgroundColor: badge.bg,
                        color: badge.color
                      }}>
                        {ord.order_status}
                      </span>
                    </div>

                    <div style={{ fontSize: '13px', color: 'var(--text-secondary)', display: 'flex', gap: '16px' }}>
                      <span>{new Date(ord.created_at).toLocaleDateString()}</span>
                      <span>•</span>
                      <span>{ord.delivery_city}</span>
                      <span>•</span>
                      <span>{ord.order_items?.length || 1} {isRtl ? "عناصر" : "items"}</span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <span style={{ fontSize: '18px', fontWeight: 900 }}>
                      ${Number(ord.total_amount || 0).toFixed(2)}
                    </span>
                    {isRtl ? <ChevronLeft size={18} color="var(--text-muted)" /> : <ChevronRight size={18} color="var(--text-muted)" />}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyOrdersPage;
