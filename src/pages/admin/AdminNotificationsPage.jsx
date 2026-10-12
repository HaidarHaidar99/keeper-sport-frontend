import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Bell, 
  CheckCheck, 
  Check, 
  Clock, 
  Megaphone, 
  Send, 
  Trash2, 
  ShoppingBag, 
  Mail, 
  Plus, 
  X, 
  Filter, 
  Search,
  ExternalLink,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { adminApi } from '../../api/adminApi';

export default function AdminNotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [stats, setStats] = useState({ total: 0, unread: 0, read: 0 });
  const [loading, setLoading] = useState(true);

  // Filter & Search states
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'broadcast' | 'order' | 'contact' | 'unread'
  const [searchQuery, setSearchQuery] = useState('');

  // Broadcast Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [broadcastForm, setBroadcastForm] = useState({
    title: '',
    message: '',
    type: 'system'
  });
  const [submittingBroadcast, setSubmittingBroadcast] = useState(false);

  // Toast
  const [toastMessage, setToastMessage] = useState(null);
  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getNotifications();
      if (res && res.success) {
        setNotifications(res.notifications || []);
        if (res.stats) setStats(res.stats);
      }
    } catch (err) {
      console.error('Error loading notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const handleMarkRead = async (id) => {
    try {
      const res = await adminApi.markNotificationRead(id);
      if (res && res.success) {
        setNotifications((prev) =>
          prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
        );
        setStats((prev) => ({
          ...prev,
          unread: Math.max(0, prev.unread - 1),
          read: prev.read + 1
        }));
        showToast('Notification marked as read.');
      }
    } catch {
      showToast('Error marking notification as read.');
    }
  };

  const handleMarkAllRead = async () => {
    try {
      const res = await adminApi.markAllNotificationsRead();
      if (res && res.success) {
        setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
        setStats((prev) => ({ ...prev, unread: 0, read: prev.total }));
        showToast('All notifications marked as read.');
      }
    } catch {
      showToast('Error marking all as read.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this notification?')) return;
    try {
      const res = await adminApi.deleteNotification(id);
      if (res && res.success) {
        setNotifications((prev) => prev.filter((n) => n.id !== id));
        setStats((prev) => ({
          ...prev,
          total: Math.max(0, prev.total - 1)
        }));
        showToast('Notification deleted successfully.');
      }
    } catch {
      showToast('Error deleting notification.');
    }
  };

  const handleSendBroadcast = async (e) => {
    e.preventDefault();
    if (!broadcastForm.title.trim() || !broadcastForm.message.trim()) {
      showToast('Please fill out both the title and announcement message.');
      return;
    }

    setSubmittingBroadcast(true);
    try {
      const res = await adminApi.sendBroadcastNotification({
        title: broadcastForm.title.trim(),
        message: broadcastForm.message.trim(),
        type: broadcastForm.type || 'system'
      });

      if (res && res.success) {
        showToast(res.message || 'System notification broadcasted to all users!');
        setIsModalOpen(false);
        setBroadcastForm({ title: '', message: '', type: 'system' });
        loadNotifications();
      } else {
        showToast(res?.message || 'Failed to send broadcast.');
      }
    } catch (err) {
      console.error('Error sending broadcast:', err);
      showToast('Server error sending broadcast.');
    } finally {
      setSubmittingBroadcast(false);
    }
  };

  // Helper for notification type styling
  const getNotificationBadge = (n) => {
    const isBroadcast = n.reference_type === 'broadcast' || n.type === 'system';
    const isOrder = n.type === 'order' || n.reference_type === 'order';
    const isContact = n.type === 'contact' || n.reference_type === 'contact_message';

    if (isBroadcast) {
      return {
        icon: <Megaphone size={14} />,
        label: 'System Broadcast',
        badgeClass: 'is-broadcast',
        color: '#8b5cf6',
        bg: 'rgba(139, 92, 246, 0.12)'
      };
    }
    if (isOrder) {
      return {
        icon: <ShoppingBag size={14} />,
        label: 'Order Activity',
        badgeClass: 'is-order',
        color: '#10b981',
        bg: 'rgba(16, 185, 129, 0.12)'
      };
    }
    if (isContact) {
      return {
        icon: <Mail size={14} />,
        label: 'Contact Inquiry',
        badgeClass: 'is-contact',
        color: '#3b82f6',
        bg: 'rgba(59, 130, 246, 0.12)'
      };
    }
    return {
      icon: <Bell size={14} />,
      label: n.type ? n.type.toUpperCase() : 'General',
      badgeClass: 'is-default',
      color: '#e2e8f0',
      bg: 'rgba(255, 255, 255, 0.08)'
    };
  };

  // Filter logic
  const filteredNotifications = notifications.filter((n) => {
    // Tab filter
    if (activeTab === 'unread' && n.is_read) return false;
    if (activeTab === 'broadcast' && n.reference_type !== 'broadcast' && n.type !== 'system') return false;
    if (activeTab === 'order' && n.type !== 'order' && n.reference_type !== 'order') return false;
    if (activeTab === 'contact' && n.type !== 'contact' && n.reference_type !== 'contact_message') return false;

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = (n.title || '').toLowerCase().includes(q);
      const matchMsg = (n.message || '').toLowerCase().includes(q);
      if (!matchTitle && !matchMsg) return false;
    }

    return true;
  });

  const broadcastCount = notifications.filter((n) => n.reference_type === 'broadcast' || n.type === 'system').length;
  const orderCount = notifications.filter((n) => n.type === 'order' || n.reference_type === 'order').length;

  return (
    <div className="ks-admin-page-container">
      {toastMessage && (
        <div className="ks-admin-toast" role="status">
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="ks-admin-header-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <span className="ks-admin-header-eyebrow">ACTIVITY &amp; ALERTS</span>
          <h1 className="ks-admin-page-title">Notifications &amp; Announcements</h1>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="ks-admin-btn-primary"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
          >
            <Megaphone size={16} />
            <span>Send Broadcast to Users</span>
          </button>

          {stats.unread > 0 && (
            <button
              type="button"
              onClick={handleMarkAllRead}
              className="ks-admin-btn-secondary"
            >
              <CheckCheck size={16} />
              <span>Mark All Read</span>
            </button>
          )}
        </div>
      </div>

      {/* STAT CARDS */}
      <div className="ks-admin-stats-grid">
        <div className="ks-admin-stat-card">
          <div className="ks-stat-card-icon-wrap is-neutral">
            <Bell size={20} />
          </div>
          <div className="ks-stat-card-content">
            <span className="ks-stat-card-label">TOTAL ALERTS</span>
            <div className="ks-stat-card-value">{loading ? '—' : stats.total}</div>
          </div>
        </div>

        <div className={`ks-admin-stat-card ${stats.unread > 0 ? 'is-warning' : ''}`}>
          <div className="ks-stat-card-icon-wrap is-danger">
            <Bell size={20} />
          </div>
          <div className="ks-stat-card-content">
            <span className="ks-stat-card-label">UNREAD ALERTS</span>
            <div className="ks-stat-card-value is-red">{loading ? '—' : stats.unread}</div>
          </div>
        </div>

        <div className="ks-admin-stat-card">
          <div className="ks-stat-card-icon-wrap is-neutral" style={{ color: '#8b5cf6' }}>
            <Megaphone size={20} />
          </div>
          <div className="ks-stat-card-content">
            <span className="ks-stat-card-label">BROADCASTS</span>
            <div className="ks-stat-card-value">{loading ? '—' : broadcastCount}</div>
          </div>
        </div>

        <div className="ks-admin-stat-card">
          <div className="ks-stat-card-icon-wrap is-neutral" style={{ color: '#10b981' }}>
            <ShoppingBag size={20} />
          </div>
          <div className="ks-stat-card-content">
            <span className="ks-stat-card-label">ORDER ALERTS</span>
            <div className="ks-stat-card-value">{loading ? '—' : orderCount}</div>
          </div>
        </div>
      </div>

      {/* FILTER TABS & SEARCH */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', margin: '20px 0 16px' }}>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {[
            { id: 'all', label: 'All', count: notifications.length },
            { id: 'broadcast', label: 'Broadcasts', count: broadcastCount },
            { id: 'order', label: 'Orders', count: orderCount },
            { id: 'contact', label: 'Inquiries', count: notifications.filter((n) => n.type === 'contact' || n.reference_type === 'contact_message').length },
            { id: 'unread', label: 'Unread Only', count: stats.unread }
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '7px 14px',
                borderRadius: '8px',
                border: '1px solid',
                borderColor: activeTab === tab.id ? 'var(--ks-accent-red, #dc2626)' : 'var(--ks-border-card, #2D3343)',
                background: activeTab === tab.id ? 'rgba(220, 38, 38, 0.15)' : 'var(--ks-bg-card, #1A1F2C)',
                color: activeTab === tab.id ? '#fff' : 'var(--ks-text-muted, #94a3b8)',
                fontWeight: activeTab === tab.id ? 700 : 500,
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
                opacity: 0.8, 
                background: 'rgba(255,255,255,0.1)', 
                padding: '1px 6px', 
                borderRadius: '10px' 
              }}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        <div style={{ position: 'relative', minWidth: '240px' }}>
          <Search size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--ks-text-muted, #64748b)' }} />
          <input
            type="text"
            placeholder="Search alerts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '8px 12px 8px 36px',
              borderRadius: '8px',
              border: '1px solid var(--ks-border-card, #2D3343)',
              background: 'var(--ks-bg-input, #131722)',
              color: 'var(--ks-text-title, #fff)',
              fontSize: '13px',
              outline: 'none'
            }}
          />
        </div>
      </div>

      {/* NOTIFICATIONS LIST */}
      <section className="ks-admin-panel" aria-label="Notifications List">
        <div className="ks-admin-panel-body">
          {loading ? (
            <div className="ks-admin-table-loading" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', padding: '40px 0' }}>
              <Loader2 size={20} className="ks-spin-icon" style={{ color: 'var(--ks-accent-red)' }} />
              <span>Loading notifications...</span>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="ks-admin-empty-notice" style={{ padding: '48px 20px', textAlign: 'center' }}>
              <Bell size={32} style={{ opacity: 0.3, marginBottom: '12px', color: 'var(--ks-text-muted)' }} />
              <p style={{ margin: 0, fontWeight: 600 }}>No notifications found matching your selection.</p>
            </div>
          ) : (
            <div className="ks-notif-full-list" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {filteredNotifications.map((n) => {
                const meta = getNotificationBadge(n);
                const isOrder = n.type === 'order' || n.reference_type === 'order';

                return (
                  <div 
                    key={n.id} 
                    className={`ks-notif-card ${!n.is_read ? 'is-unread' : ''}`}
                    style={{
                      padding: '16px 20px',
                      background: n.is_read ? 'var(--ks-bg-input, #131722)' : 'rgba(220, 38, 38, 0.05)',
                      border: '1px solid',
                      borderColor: !n.is_read ? 'rgba(220, 38, 38, 0.4)' : 'var(--ks-border-input, #222938)',
                      borderLeft: !n.is_read ? '4px solid var(--ks-accent-red, #dc2626)' : '1px solid var(--ks-border-input, #222938)',
                      borderRadius: '10px',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div className="ks-notif-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px', marginBottom: '8px' }}>
                      <div className="ks-notif-title-row" style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                        {!n.is_read && <span className="ks-notif-unread-dot" />}

                        {/* Badge Tag */}
                        <span 
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px',
                            background: meta.bg,
                            color: meta.color,
                            fontSize: '11px',
                            fontWeight: 700,
                            padding: '3px 8px',
                            borderRadius: '6px',
                            letterSpacing: '0.02em'
                          }}
                        >
                          {meta.icon}
                          <span>{meta.label}</span>
                        </span>

                        <h3 className="ks-notif-title" style={{ fontSize: '15px', fontWeight: 700, margin: 0, color: 'var(--ks-text-title, #fff)' }}>
                          {n.title}
                        </h3>
                      </div>

                      <span className="ks-notif-time" style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '12px', color: 'var(--ks-text-muted, #94a3b8)', whiteSpace: 'nowrap' }}>
                        <Clock size={12} />
                        <span>{new Date(n.created_at).toLocaleString()}</span>
                      </span>
                    </div>

                    <p className="ks-notif-msg" style={{ fontSize: '13.5px', color: 'var(--ks-text-subtitle, #cbd5e1)', margin: '4px 0 12px', lineHeight: 1.5 }}>
                      {n.message}
                    </p>

                    <div className="ks-notif-card-actions" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '8px', borderTop: '1px solid var(--ks-border-input, rgba(255,255,255,0.06))' }}>
                      <div>
                        {isOrder && n.reference_id && (
                          <Link
                            to={`/admin/orders`}
                            className="ks-admin-btn-secondary mini"
                            style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '12px', textDecoration: 'none' }}
                          >
                            <ExternalLink size={12} />
                            <span>Go to Orders</span>
                          </Link>
                        )}
                      </div>

                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        {!n.is_read && (
                          <button
                            type="button"
                            onClick={() => handleMarkRead(n.id)}
                            className="ks-admin-btn-secondary mini"
                            style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '12px' }}
                          >
                            <Check size={13} />
                            <span>Mark Read</span>
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => handleDelete(n.id)}
                          style={{
                            background: 'transparent',
                            border: '1px solid transparent',
                            color: '#94a3b8',
                            borderRadius: '6px',
                            padding: '4px 8px',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            fontSize: '12px',
                            transition: 'color 0.15s ease'
                          }}
                          onMouseEnter={(e) => { e.currentTarget.style.color = '#ef4444'; }}
                          onMouseLeave={(e) => { e.currentTarget.style.color = '#94a3b8'; }}
                          title="Delete notification"
                        >
                          <Trash2 size={13} />
                          <span>Delete</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* BROADCAST ANNOUNCEMENT MODAL */}
      {isModalOpen && (
        <div className="ks-admin-modal-backdrop" onClick={() => !submittingBroadcast && setIsModalOpen(false)} role="dialog" aria-modal="true">
          <div className="ks-admin-modal-box" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '540px' }}>
            <div className="ks-admin-modal-header" style={{ padding: '16px 20px', borderBottom: '1px solid var(--ks-border-card, #2D3343)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '34px', height: '34px', borderRadius: '8px', background: 'rgba(139, 92, 246, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#a78bfa' }}>
                  <Megaphone size={18} />
                </div>
                <div>
                  <h3 className="ks-admin-modal-title" style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#fff' }}>
                    Broadcast System Notification
                  </h3>
                  <span style={{ fontSize: '12px', color: 'var(--ks-text-muted, #94a3b8)' }}>
                    Notify all registered customers instantly
                  </span>
                </div>
              </div>
              <button 
                type="button" 
                onClick={() => setIsModalOpen(false)} 
                className="ks-admin-modal-close-btn" 
                disabled={submittingBroadcast}
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSendBroadcast}>
              <div className="ks-admin-modal-body" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ background: 'rgba(59, 130, 246, 0.08)', border: '1px solid rgba(59, 130, 246, 0.2)', borderRadius: '8px', padding: '10px 14px', display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                  <AlertCircle size={16} style={{ color: '#60a5fa', marginTop: '2px', flexShrink: 0 }} />
                  <p style={{ margin: 0, fontSize: '12.5px', color: '#93c5fd', lineHeight: 1.4 }}>
                    This notification will appear in the <strong>Notifications Page</strong> for all customers, and will also be saved in your admin activity log.
                  </p>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px', color: 'var(--ks-text-title, #fff)' }}>
                    Notification Title <span style={{ color: 'var(--ks-accent-red)' }}>*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Flash Weekend Sale ⚡ or Holiday Shipping Notice 📦"
                    value={broadcastForm.title}
                    onChange={(e) => setBroadcastForm((prev) => ({ ...prev, title: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      border: '1px solid var(--ks-border-card, #2D3343)',
                      background: 'var(--ks-bg-input, #131722)',
                      color: 'var(--ks-text-title, #fff)',
                      fontSize: '14px',
                      outline: 'none'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px', color: 'var(--ks-text-title, #fff)' }}>
                    Type
                  </label>
                  <select
                    value={broadcastForm.type}
                    onChange={(e) => setBroadcastForm((prev) => ({ ...prev, type: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      border: '1px solid var(--ks-border-card, #2D3343)',
                      background: 'var(--ks-bg-input, #131722)',
                      color: 'var(--ks-text-title, #fff)',
                      fontSize: '14px',
                      outline: 'none'
                    }}
                  >
                    <option value="system">System Announcement (Default)</option>
                    <option value="offer">Special Offer / Promotion</option>
                    <option value="update">Store Policy or Schedule Update</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px', color: 'var(--ks-text-title, #fff)' }}>
                    Message Body <span style={{ color: 'var(--ks-accent-red)' }}>*</span>
                  </label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Write the full message details for your customers..."
                    value={broadcastForm.message}
                    onChange={(e) => setBroadcastForm((prev) => ({ ...prev, message: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      border: '1px solid var(--ks-border-card, #2D3343)',
                      background: 'var(--ks-bg-input, #131722)',
                      color: 'var(--ks-text-title, #fff)',
                      fontSize: '14px',
                      outline: 'none',
                      resize: 'vertical'
                    }}
                  />
                  <div style={{ textAlign: 'right', fontSize: '11px', color: 'var(--ks-text-muted, #64748b)', marginTop: '4px' }}>
                    {broadcastForm.message.length} characters
                  </div>
                </div>
              </div>

              <div className="ks-admin-modal-footer" style={{ padding: '16px 20px', borderTop: '1px solid var(--ks-border-card, #2D3343)', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="ks-admin-btn-secondary"
                  disabled={submittingBroadcast}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="ks-admin-btn-primary"
                  disabled={submittingBroadcast}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
                >
                  {submittingBroadcast ? (
                    <>
                      <Loader2 size={16} className="ks-spin-icon" />
                      <span>Broadcasting...</span>
                    </>
                  ) : (
                    <>
                      <Send size={16} />
                      <span>Send Broadcast</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
