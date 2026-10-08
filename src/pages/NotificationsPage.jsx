import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Bell, CheckCheck, Clock, Check, Loader2, UserCheck, ShieldAlert } from 'lucide-react';
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

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <div className="ks-page-canvas">
      <Navbar siteSettings={siteSettings} categories={categories} />

      <main className="ks-catalog-page-container" style={{ minHeight: '60vh', maxWidth: '800px', margin: '0 auto', padding: '32px 16px' }}>
        {toastMessage && (
          <div className="ks-admin-toast" role="status" style={{ zIndex: 9999 }}>
            <span>{toastMessage}</span>
          </div>
        )}

        <header className="ks-catalog-header" style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <div className="ks-catalog-header-badge" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                <Bell size={13} style={{ color: 'var(--ks-accent-red)' }} />
                <span>ACTIVITY &amp; UPDATES</span>
              </div>
              <h1 className="ks-catalog-title" style={{ margin: 0, fontSize: '2rem', fontWeight: 800 }}>Notifications</h1>
            </div>

            {!isGuest && unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllRead}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: 'transparent',
                  border: '1px solid var(--ks-border-card, #374151)',
                  borderRadius: '8px',
                  color: 'var(--ks-text-title, #fff)',
                  padding: '8px 16px',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                <CheckCheck size={16} style={{ color: 'var(--ks-accent-red)' }} />
                <span>Mark All Read</span>
              </button>
            )}
          </div>
        </header>

        {loading ? (
          <div className="ks-catalog-loading" aria-live="polite" style={{ textAlign: 'center', padding: '60px 0' }}>
            <Loader2 size={32} className="ks-spin-icon" style={{ color: 'var(--ks-accent-red)', margin: '0 auto 12px' }} />
            <p style={{ color: 'var(--ks-text-muted)' }}>Loading your notifications...</p>
          </div>
        ) : isGuest && !user ? (
          <div className="ks-catalog-empty" style={{ textAlign: 'center', padding: '48px 24px', background: 'var(--ks-bg-card, #1a1e24)', borderRadius: '12px', border: '1px solid var(--ks-border-card, #2e3440)' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'rgba(239, 68, 68, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', color: 'var(--ks-accent-red)' }}>
              <Bell size={28} />
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '8px', color: 'var(--ks-text-title)' }}>Guest Session</h3>
            <p style={{ color: 'var(--ks-text-subtitle)', maxWidth: '420px', margin: '0 auto 20px', fontSize: '14px', lineHeight: 1.5 }}>
              Account notifications are tied to registered customer profiles. Sign in or create an account to receive alerts on order progress and special offers.
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <Link to="/login?redirect=/notifications" className="ks-btn-primary" style={{ padding: '10px 20px', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                <UserCheck size={16} />
                <span>SIGN IN</span>
              </Link>
              <Link to="/products" style={{ padding: '10px 20px', background: 'transparent', border: '1px solid var(--ks-border-card)', borderRadius: '8px', color: 'var(--ks-text-title)', textDecoration: 'none', fontSize: '13px', fontWeight: 600, display: 'inline-flex', alignItems: 'center' }}>
                <span>BROWSE STORE</span>
              </Link>
            </div>
          </div>
        ) : notifications.length === 0 ? (
          <div className="ks-catalog-empty" style={{ textAlign: 'center', padding: '60px 24px', background: 'var(--ks-bg-card, #1a1e24)', borderRadius: '12px', border: '1px solid var(--ks-border-card, #2e3440)' }}>
            <Bell size={48} style={{ opacity: 0.25, marginBottom: '16px', color: 'var(--ks-text-muted)' }} />
            <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '8px', color: 'var(--ks-text-title)' }}>You're all caught up</h3>
            <p style={{ color: 'var(--ks-text-subtitle)', fontSize: '14px', margin: 0 }}>
              No new notifications at this time. Updates regarding your orders will appear here.
            </p>
          </div>
        ) : (
          <div className="ks-notif-full-list">
            {notifications.map((n) => {
              const isUnread = !n.is_read;
              return (
                <div key={n.id} className={`ks-notif-card ${isUnread ? 'is-unread' : ''}`}>
                  <div className="ks-notif-card-header">
                    <div className="ks-notif-title-row">
                      {isUnread && <span className="ks-notif-unread-dot" />}
                      <h3 className="ks-notif-title">{n.title}</h3>
                    </div>
                    <span className="ks-notif-time">
                      <Clock size={12} />
                      {new Date(n.created_at).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>

                  <p className="ks-notif-msg">{n.message}</p>

                  {isUnread && (
                    <div className="ks-notif-card-actions">
                      <button
                        type="button"
                        onClick={() => handleMarkRead(n.id)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'var(--ks-accent-red)',
                          fontSize: '12px',
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
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
