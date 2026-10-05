import React, { useState, useEffect } from 'react';
import { Bell, CheckCheck, Check, Clock } from 'lucide-react';
import { adminApi } from '../../api/adminApi';

export default function AdminNotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [stats, setStats] = useState({ total: 0, unread: 0, read: 0 });
  const [loading, setLoading] = useState(true);

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
          <span className="ks-admin-header-eyebrow">ACTIVITY &amp; ALERTS</span>
          <h1 className="ks-admin-page-title">Notifications</h1>
        </div>

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
          <div className="ks-stat-card-icon-wrap is-neutral">
            <Check size={20} />
          </div>
          <div className="ks-stat-card-content">
            <span className="ks-stat-card-label">ARCHIVED / READ</span>
            <div className="ks-stat-card-value">{loading ? '—' : stats.read}</div>
          </div>
        </div>
      </div>

      {/* NOTIFICATIONS LIST */}
      <section className="ks-admin-panel" aria-label="Notifications List">
        <div className="ks-admin-panel-body">
          {loading ? (
            <div className="ks-admin-table-loading">Loading notifications...</div>
          ) : notifications.length === 0 ? (
            <div className="ks-admin-empty-notice">
              <span>No administrative notifications logged.</span>
            </div>
          ) : (
            <div className="ks-notif-full-list">
              {notifications.map((n) => (
                <div key={n.id} className={`ks-notif-card ${!n.is_read ? 'is-unread' : ''}`}>
                  <div className="ks-notif-card-header">
                    <div className="ks-notif-title-row">
                      {!n.is_read && <span className="ks-notif-unread-dot" />}
                      <h3 className="ks-notif-title">{n.title}</h3>
                    </div>
                    <span className="ks-notif-time">
                      <Clock size={12} />
                      <span>{new Date(n.created_at).toLocaleString()}</span>
                    </span>
                  </div>

                  <p className="ks-notif-msg">{n.message}</p>

                  {!n.is_read && (
                    <div className="ks-notif-card-actions">
                      <button
                        type="button"
                        onClick={() => handleMarkRead(n.id)}
                        className="ks-admin-btn-secondary mini"
                      >
                        <Check size={13} />
                        <span>Mark Read</span>
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
