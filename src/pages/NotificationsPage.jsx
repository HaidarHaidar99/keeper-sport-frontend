import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Bell, 
  CheckCheck, 
  Clock, 
  Check, 
  Loader2, 
  UserCheck, 
  Trash2,
  Megaphone,
  Package,
  Truck,
  CheckCircle,
  AlertTriangle,
  XCircle,
  ShoppingBag,
  ExternalLink,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSite } from '../context/SiteContext';
import { contentApi } from '../api/contentApi';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function NotificationsPage() {
  const { user } = useAuth();
  const { siteSettings, categories, refreshCounts } = useSite();

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isGuest, setIsGuest] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all'); // 'all' | 'orders' | 'broadcasts' | 'unread'
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const res = await contentApi.getNotifications();
      if (res && res.success) {
        setNotifications(res.notifications || []);
        setIsGuest(Boolean(res.isGuest));
      }
    } catch (err) {
      console.error('Error loading notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, [user]);

  const handleMarkRead = async (id) => {
    try {
      const res = await contentApi.markNotificationRead(id);
      if (res && res.success) {
        setNotifications((prev) =>
          prev.map((n) => (n.id === id ? { ...n, is_read: true, read_at: new Date().toISOString() } : n))
        );
        if (typeof refreshCounts === 'function') refreshCounts();
        showToast('Notification marked as read.');
      }
    } catch {
      showToast('Error marking notification as read.');
    }
  };

  const handleMarkAllRead = async () => {
    try {
      const res = await contentApi.markAllNotificationsRead();
      if (res && res.success) {
        setNotifications((prev) =>
          prev.map((n) => ({ ...n, is_read: true, read_at: new Date().toISOString() }))
        );
        if (typeof refreshCounts === 'function') refreshCounts();
        showToast('All notifications marked as read.');
      }
    } catch {
      showToast('Error marking all as read.');
    }
  };

  const handleDelete = async (id) => {
    try {
      const res = await contentApi.deleteNotification(id);
      if (res && res.success) {
        setNotifications((prev) => prev.filter((n) => n.id !== id));
        if (typeof refreshCounts === 'function') refreshCounts();
        showToast('Notification removed.');
      } else {
        // If guest or public broadcast, remove locally
        setNotifications((prev) => prev.filter((n) => n.id !== id));
        showToast('Notification dismissed.');
      }
    } catch {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      showToast('Notification dismissed.');
    }
  };

  // Helper to determine notification metadata and styling
  const getNotificationDetails = (n) => {
    const titleLower = (n.title || '').toLowerCase();
    const msgLower = (n.message || '').toLowerCase();
    const isOrderType = n.type === 'order' || n.reference_type === 'order';
    const isBroadcast = n.reference_type === 'broadcast' || n.type === 'system' || n.type === 'offer';

    if (isBroadcast) {
      return {
        icon: <Megaphone size={18} />,
        label: 'Announcement',
        color: '#a855f7',
        bg: 'rgba(168, 85, 247, 0.12)',
        borderColor: 'rgba(168, 85, 247, 0.3)',
        category: 'broadcast',
        isBroadcast: true
      };
    }

    if (titleLower.includes('rejected') || msgLower.includes('rejected')) {
      return {
        icon: <AlertTriangle size={18} />,
        label: 'Order Rejected',
        color: '#ef4444',
        bg: 'rgba(239, 68, 68, 0.12)',
        borderColor: 'rgba(239, 68, 68, 0.3)',
        category: 'order',
        isOrder: true,
        isRejected: true
      };
    }

    if (titleLower.includes('delivered') || msgLower.includes('safely delivered')) {
      return {
        icon: <CheckCircle size={18} />,
        label: 'Delivered',
        color: '#10b981',
        bg: 'rgba(16, 185, 129, 0.12)',
        borderColor: 'rgba(16, 185, 129, 0.3)',
        category: 'order',
        isOrder: true
      };
    }

    if (titleLower.includes('delivery') || titleLower.includes('courier') || msgLower.includes('on the way')) {
      return {
        icon: <Truck size={18} />,
        label: 'Out for Delivery',
        color: '#06b6d4',
        bg: 'rgba(6, 182, 212, 0.12)',
        borderColor: 'rgba(6, 182, 212, 0.3)',
        category: 'order',
        isOrder: true
      };
    }

    if (titleLower.includes('preparing') || titleLower.includes('prepared') || msgLower.includes('packing')) {
      return {
        icon: <Package size={18} />,
        label: 'Being Prepared',
        color: '#f59e0b',
        bg: 'rgba(245, 158, 11, 0.12)',
        borderColor: 'rgba(245, 158, 11, 0.3)',
        category: 'order',
        isOrder: true
      };
    }

    if (titleLower.includes('accepted') || msgLower.includes('confirmed and accepted')) {
      return {
        icon: <CheckCircle size={18} />,
        label: 'Order Accepted',
        color: '#22c55e',
        bg: 'rgba(34, 197, 94, 0.14)',
        borderColor: 'rgba(34, 197, 94, 0.35)',
        category: 'order',
        isOrder: true
      };
    }

    if (titleLower.includes('cancelled') || msgLower.includes('cancelled')) {
      return {
        icon: <XCircle size={18} />,
        label: 'Order Cancelled',
        color: '#94a3b8',
        bg: 'rgba(148, 163, 184, 0.12)',
        borderColor: 'rgba(148, 163, 184, 0.3)',
        category: 'order',
        isOrder: true
      };
    }

    if (isOrderType) {
      return {
        icon: <ShoppingBag size={18} />,
        label: 'Order Update',
        color: '#3b82f6',
        bg: 'rgba(59, 130, 246, 0.12)',
        borderColor: 'rgba(59, 130, 246, 0.3)',
        category: 'order',
        isOrder: true
      };
    }

    return {
      icon: <Bell size={18} />,
      label: 'Notification',
      color: '#e2e8f0',
      bg: 'rgba(255, 255, 255, 0.08)',
      borderColor: 'rgba(255, 255, 255, 0.15)',
      category: 'general'
    };
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;
  const orderCount = notifications.filter((n) => {
    const meta = getNotificationDetails(n);
    return meta.category === 'order';
  }).length;
  const broadcastCount = notifications.filter((n) => {
    const meta = getNotificationDetails(n);
    return meta.category === 'broadcast';
  }).length;

  const filteredNotifications = notifications.filter((n) => {
    const meta = getNotificationDetails(n);
    if (activeFilter === 'unread' && n.is_read) return false;
    if (activeFilter === 'orders' && meta.category !== 'order') return false;
    if (activeFilter === 'broadcasts' && meta.category !== 'broadcast') return false;
    return true;
  });

  return (
    <div className="ks-page-canvas">
      <Navbar siteSettings={siteSettings} categories={categories} />

      <main className="ks-catalog-page-container" style={{ minHeight: '65vh', maxWidth: '840px', margin: '0 auto', padding: '36px 16px 64px' }}>
        {toastMessage && (
          <div className="ks-admin-toast" role="status" style={{ zIndex: 9999 }}>
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Guest Warning Banner if not logged in */}
        {!user && (
          <div style={{
            background: 'linear-gradient(135deg, rgba(220, 38, 38, 0.12) 0%, rgba(20, 24, 33, 0.8) 100%)',
            border: '1px solid rgba(220, 38, 38, 0.25)',
            borderRadius: '12px',
            padding: '16px 20px',
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: 'rgba(220, 38, 38, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--ks-accent-red)' }}>
                <Sparkles size={18} />
              </div>
              <div>
                <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: 'var(--ks-text-title, #fff)' }}>
                  Viewing Store Announcements as Guest
                </h4>
                <p style={{ margin: '2px 0 0', fontSize: '12.5px', color: 'var(--ks-text-subtitle, #94a3b8)' }}>
                  Sign in to track real-time order status updates and customized alerts.
                </p>
              </div>
            </div>
            <Link 
              to="/login?redirect=/notifications" 
              className="ks-btn-primary" 
              style={{ padding: '8px 18px', fontSize: '12.5px', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              <UserCheck size={14} />
              <span>SIGN IN</span>
            </Link>
          </div>
        )}

        {/* Page Header */}
        <header className="ks-catalog-header" style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <div className="ks-catalog-header-badge" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                <Bell size={13} style={{ color: 'var(--ks-accent-red)' }} />
                <span>ACTIVITY &amp; ALERTS</span>
              </div>
              <h1 className="ks-catalog-title" style={{ margin: 0, fontSize: '2.1rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
                Notifications
              </h1>
            </div>

            {user && unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllRead}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid var(--ks-border-card, #374151)',
                  borderRadius: '8px',
                  color: 'var(--ks-text-title, #fff)',
                  padding: '8px 16px',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                <CheckCheck size={16} style={{ color: 'var(--ks-accent-red)' }} />
                <span>Mark All Read</span>
              </button>
            )}
          </div>

          {/* Filter Tabs */}
          {notifications.length > 0 && (
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '20px' }}>
              {[
                { id: 'all', label: 'All Alerts', count: notifications.length },
                { id: 'orders', label: 'Order Updates', count: orderCount },
                { id: 'broadcasts', label: 'Announcements', count: broadcastCount },
                ...(user ? [{ id: 'unread', label: 'Unread', count: unreadCount }] : [])
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveFilter(tab.id)}
                  style={{
                    padding: '7px 14px',
                    borderRadius: '8px',
                    border: '1px solid',
                    borderColor: activeFilter === tab.id ? 'var(--ks-accent-red, #dc2626)' : 'var(--ks-border-card, #2e3440)',
                    background: activeFilter === tab.id ? 'rgba(220, 38, 38, 0.14)' : 'var(--ks-bg-card, #1a1e24)',
                    color: activeFilter === tab.id ? '#fff' : 'var(--ks-text-subtitle, #94a3b8)',
                    fontWeight: activeFilter === tab.id ? 700 : 500,
                    fontSize: '13px',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <span>{tab.label}</span>
                  <span style={{
                    fontSize: '11px',
                    background: activeFilter === tab.id ? 'rgba(220, 38, 38, 0.4)' : 'rgba(255,255,255,0.08)',
                    padding: '1px 6px',
                    borderRadius: '10px'
                  }}>
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>
          )}
        </header>

        {loading ? (
          <div className="ks-catalog-loading" aria-live="polite" style={{ textAlign: 'center', padding: '60px 0' }}>
            <Loader2 size={32} className="ks-spin-icon" style={{ color: 'var(--ks-accent-red)', margin: '0 auto 12px' }} />
            <p style={{ color: 'var(--ks-text-muted)' }}>Loading your notifications...</p>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="ks-catalog-empty" style={{ textAlign: 'center', padding: '56px 24px', background: 'var(--ks-bg-card, #1a1e24)', borderRadius: '14px', border: '1px solid var(--ks-border-card, #2e3440)' }}>
            <Bell size={44} style={{ opacity: 0.25, marginBottom: '14px', color: 'var(--ks-text-muted)' }} />
            <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '8px', color: 'var(--ks-text-title)' }}>
              No notifications found
            </h3>
            <p style={{ color: 'var(--ks-text-subtitle)', fontSize: '14px', margin: '0 auto 20px', maxWidth: '420px', lineHeight: 1.5 }}>
              {activeFilter === 'unread' 
                ? "You have read all of your alerts." 
                : "Updates regarding your orders, special offers, and system announcements will appear here."}
            </p>
            <Link to="/products" className="ks-btn-primary" style={{ padding: '9px 20px', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}>
              <span>EXPLORE CATALOG</span>
              <ChevronRight size={15} />
            </Link>
          </div>
        ) : (
          <div className="ks-notif-full-list" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {filteredNotifications.map((n) => {
              const meta = getNotificationDetails(n);
              const isUnread = !n.is_read;

              return (
                <div 
                  key={n.id} 
                  className={`ks-notif-card ${isUnread ? 'is-unread' : ''}`}
                  style={{
                    padding: '18px 20px',
                    background: isUnread ? 'var(--ks-bg-card, #191e28)' : 'var(--ks-bg-input, #131722)',
                    border: '1px solid',
                    borderColor: isUnread ? meta.borderColor : 'var(--ks-border-card, #222938)',
                    borderLeft: isUnread ? `4px solid ${meta.color}` : '1px solid var(--ks-border-card, #222938)',
                    borderRadius: '12px',
                    boxShadow: isUnread ? '0 4px 16px rgba(0,0,0,0.2)' : 'none',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div className="ks-notif-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px', marginBottom: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                      {/* Icon avatar */}
                      <div style={{
                        width: '34px',
                        height: '34px',
                        borderRadius: '8px',
                        background: meta.bg,
                        color: meta.color,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}>
                        {meta.icon}
                      </div>

                      {/* Title & Badge */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        <span style={{
                          fontSize: '11px',
                          fontWeight: 700,
                          padding: '2px 8px',
                          borderRadius: '6px',
                          background: meta.bg,
                          color: meta.color,
                          letterSpacing: '0.02em',
                          textTransform: 'uppercase'
                        }}>
                          {meta.label}
                        </span>

                        <h3 className="ks-notif-title" style={{ fontSize: '15px', fontWeight: 700, margin: 0, color: 'var(--ks-text-title, #fff)' }}>
                          {n.title}
                        </h3>

                        {isUnread && <span className="ks-notif-unread-dot" style={{ background: meta.color }} />}
                      </div>
                    </div>

                    <span className="ks-notif-time" style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '12px', color: 'var(--ks-text-muted, #94a3b8)', whiteSpace: 'nowrap' }}>
                      <Clock size={12} />
                      {new Date(n.created_at).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>

                  {/* Body Message */}
                  <p className="ks-notif-msg" style={{ fontSize: '14px', color: 'var(--ks-text-subtitle, #cbd5e1)', margin: '4px 0 10px', lineHeight: 1.55 }}>
                    {n.message}
                  </p>

                  {/* Rejection Alert Box */}
                  {meta.isRejected && (
                    <div style={{
                      background: 'rgba(239, 68, 68, 0.08)',
                      border: '1px solid rgba(239, 68, 68, 0.25)',
                      borderRadius: '8px',
                      padding: '10px 14px',
                      marginBottom: '10px',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '8px'
                    }}>
                      <AlertTriangle size={16} style={{ color: '#ef4444', flexShrink: 0, marginTop: '2px' }} />
                      <div>
                        <span style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#f87171', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                          Rejection Reason
                        </span>
                        <p style={{ margin: '2px 0 0', fontSize: '13px', color: '#fca5a5', lineHeight: 1.45 }}>
                          {n.message}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Action Bar */}
                  <div className="ks-notif-card-actions" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '10px', borderTop: '1px solid var(--ks-border-input, rgba(255,255,255,0.06))', flexWrap: 'wrap', gap: '8px' }}>
                    <div>
                      {meta.isOrder && (
                        <Link
                          to="/orders"
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px',
                            background: 'rgba(255,255,255,0.05)',
                            border: '1px solid var(--ks-border-card, #2e3440)',
                            color: 'var(--ks-text-title, #fff)',
                            padding: '5px 12px',
                            borderRadius: '6px',
                            fontSize: '12px',
                            fontWeight: 600,
                            textDecoration: 'none'
                          }}
                        >
                          <ShoppingBag size={13} style={{ color: meta.color }} />
                          <span>View My Orders</span>
                          <ExternalLink size={11} style={{ opacity: 0.6 }} />
                        </Link>
                      )}
                    </div>

                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      {isUnread && user && (
                        <button
                          type="button"
                          onClick={() => handleMarkRead(n.id)}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            color: 'var(--ks-accent-red, #dc2626)',
                            fontSize: '12.5px',
                            fontWeight: 600,
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            padding: '4px 8px'
                          }}
                        >
                          <Check size={14} />
                          <span>Mark read</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => handleDelete(n.id)}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: '#64748b',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          fontSize: '12px',
                          padding: '4px 8px',
                          transition: 'color 0.15s ease'
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.color = '#ef4444'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.color = '#64748b'; }}
                        title="Dismiss notification"
                      >
                        <Trash2 size={13} />
                        <span>Dismiss</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {!loading && <Footer siteSettings={siteSettings} categories={categories} />}
    </div>
  );
}
