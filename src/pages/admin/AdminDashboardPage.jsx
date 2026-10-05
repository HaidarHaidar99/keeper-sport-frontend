import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  ShoppingBag,
  Package,
  AlertTriangle,
  Bell,
  Star,
  ArrowRight,
  RefreshCw,
  ExternalLink
} from 'lucide-react';
import { adminApi } from '../../api/adminApi';

export default function AdminDashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDashboard = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    else setLoading(true);

    try {
      const res = await adminApi.getDashboard();
      if (res && res.success) {
        setData(res);
      }
    } catch (err) {
      console.error('Error fetching dashboard:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboard(false);
  }, []);

  const stats = data?.stats || {};
  const recentOrders = data?.recentOrders || [];
  const recentUsers = data?.recentUsers || [];
  const lowStockItems = data?.lowStockItems || [];
  const recentNotifications = data?.recentNotifications || [];

  return (
    <div className="ks-admin-page-container">
      {/* Page Header */}
      <div className="ks-admin-header-row">
        <div>
          <span className="ks-admin-header-eyebrow">STORE OVERVIEW</span>
          <h1 className="ks-admin-page-title">Dashboard</h1>
        </div>

        <button
          type="button"
          onClick={() => fetchDashboard(true)}
          disabled={loading || refreshing}
          className="ks-admin-btn-secondary"
          title="Refresh dashboard metrics"
        >
          <RefreshCw size={14} className={refreshing ? 'ks-spin-icon' : ''} />
          <span>Refresh</span>
        </button>
      </div>

      {/* STAT CARDS GRID */}
      <div className="ks-admin-stats-grid">
        {/* Total Users */}
        <div className="ks-admin-stat-card">
          <div className="ks-stat-card-icon-wrap is-neutral">
            <Users size={20} />
          </div>
          <div className="ks-stat-card-content">
            <span className="ks-stat-card-label">TOTAL USERS</span>
            <div className="ks-stat-card-value">
              {loading ? '—' : stats.totalUsers ?? 0}
            </div>
          </div>
        </div>

        {/* Total Orders */}
        <div className="ks-admin-stat-card">
          <div className="ks-stat-card-icon-wrap is-neutral">
            <ShoppingBag size={20} />
          </div>
          <div className="ks-stat-card-content">
            <span className="ks-stat-card-label">TOTAL ORDERS</span>
            <div className="ks-stat-card-value">
              {loading ? '—' : stats.totalOrders ?? 0}
            </div>
          </div>
        </div>

        {/* Total Products */}
        <div className="ks-admin-stat-card">
          <div className="ks-stat-card-icon-wrap is-neutral">
            <Package size={20} />
          </div>
          <div className="ks-stat-card-content">
            <span className="ks-stat-card-label">TOTAL PRODUCTS</span>
            <div className="ks-stat-card-value">
              {loading ? '—' : stats.totalProducts ?? 0}
            </div>
            <div className="ks-stat-card-subtext">
              {stats.activeProducts ?? 0} Active
            </div>
          </div>
        </div>

        {/* Low Stock Products */}
        <div className={`ks-admin-stat-card ${stats.lowStockProducts > 0 ? 'is-warning' : ''}`}>
          <div className="ks-stat-card-icon-wrap is-danger">
            <AlertTriangle size={20} />
          </div>
          <div className="ks-stat-card-content">
            <span className="ks-stat-card-label">LOW STOCK</span>
            <div className="ks-stat-card-value is-red">
              {loading ? '—' : stats.lowStockProducts ?? 0}
            </div>
            <div className="ks-stat-card-subtext">
              Threshold: ≤ {stats.lowStockThreshold ?? 5} units
            </div>
          </div>
        </div>

        {/* Unread Notifications */}
        <div className="ks-admin-stat-card">
          <div className="ks-stat-card-icon-wrap is-neutral">
            <Bell size={20} />
          </div>
          <div className="ks-stat-card-content">
            <span className="ks-stat-card-label">NOTIFICATIONS</span>
            <div className="ks-stat-card-value">
              {loading ? '—' : stats.unreadNotifications ?? 0}
            </div>
            <div className="ks-stat-card-subtext">Unread Admin Alerts</div>
          </div>
        </div>

        {/* Customer Reviews */}
        <div className="ks-admin-stat-card">
          <div className="ks-stat-card-icon-wrap is-neutral">
            <Star size={20} />
          </div>
          <div className="ks-stat-card-content">
            <span className="ks-stat-card-label">REVIEWS</span>
            <div className="ks-stat-card-value">
              {loading ? '—' : stats.totalReviews ?? 0}
            </div>
          </div>
        </div>
      </div>

      {/* DASHBOARD 2-COLUMN SECTION: Low Stock & Recent Orders */}
      <div className="ks-admin-dashboard-split">
        {/* Left: Inventory Alert (Low Stock) */}
        <section className="ks-admin-panel" aria-label="Low Stock Alerts">
          <div className="ks-admin-panel-header">
            <div className="ks-panel-title-wrap">
              <AlertTriangle size={17} className="ks-warn-icon-title" />
              <h2 className="ks-admin-panel-title">Low Stock Inventory</h2>
            </div>
            <Link to="/admin/products?status=low_stock" className="ks-panel-link">
              <span>View Products</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          <div className="ks-admin-panel-body">
            {loading ? (
              <div className="ks-admin-table-loading">Loading inventory data...</div>
            ) : lowStockItems.length === 0 ? (
              <div className="ks-admin-empty-notice">
                <span>All product inventory levels are currently sufficient.</span>
              </div>
            ) : (
              <div className="ks-admin-mini-list">
                {lowStockItems.map((item) => (
                  <div key={item.id} className="ks-mini-item-row">
                    <div className="ks-mini-item-info">
                      <Link to={`/admin/products`} className="ks-mini-item-name">
                        {item.name}
                      </Link>
                      <span className="ks-mini-item-meta">${parseFloat(item.base_price).toFixed(2)}</span>
                    </div>
                    <span className={`ks-stock-pill ${item.stock_quantity <= 0 ? 'is-out' : 'is-low'}`}>
                      {item.stock_quantity <= 0 ? 'OUT OF STOCK' : `${item.stock_quantity} left`}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Right: Recent Orders */}
        <section className="ks-admin-panel" aria-label="Recent Orders">
          <div className="ks-admin-panel-header">
            <div className="ks-panel-title-wrap">
              <ShoppingBag size={17} />
              <h2 className="ks-admin-panel-title">Recent Orders</h2>
            </div>
            <Link to="/admin/orders" className="ks-panel-link">
              <span>View All</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          <div className="ks-admin-panel-body">
            {loading ? (
              <div className="ks-admin-table-loading">Loading recent orders...</div>
            ) : recentOrders.length === 0 ? (
              <div className="ks-admin-empty-notice">
                <span>No customer orders recorded yet.</span>
              </div>
            ) : (
              <div className="ks-admin-mini-list">
                {recentOrders.map((ord) => (
                  <div key={ord.id} className="ks-mini-item-row">
                    <div className="ks-mini-item-info">
                      <span className="ks-mini-item-name">
                        Order #{ord.order_number}
                      </span>
                      <span className="ks-mini-item-meta">
                        {ord.customer_full_name} • ${parseFloat(ord.total).toFixed(2)}
                      </span>
                    </div>
                    <span className={`ks-status-badge is-${ord.status}`}>
                      {ord.status.toUpperCase()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>

      {/* DASHBOARD 2-COLUMN SECTION: Recent Users & Store Alerts */}
      <div className="ks-admin-dashboard-split">
        {/* Recent Users */}
        <section className="ks-admin-panel" aria-label="Recent Users">
          <div className="ks-admin-panel-header">
            <div className="ks-panel-title-wrap">
              <Users size={17} />
              <h2 className="ks-admin-panel-title">Recent Registered Users</h2>
            </div>
            <Link to="/admin/users" className="ks-panel-link">
              <span>View All</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          <div className="ks-admin-panel-body">
            {loading ? (
              <div className="ks-admin-table-loading">Loading users...</div>
            ) : recentUsers.length === 0 ? (
              <div className="ks-admin-empty-notice">
                <span>No users registered yet.</span>
              </div>
            ) : (
              <div className="ks-admin-mini-list">
                {recentUsers.map((u) => (
                  <div key={u.id} className="ks-mini-item-row">
                    <div className="ks-mini-item-info">
                      <span className="ks-mini-item-name">{u.full_name}</span>
                      <span className="ks-mini-item-meta">{u.email}</span>
                    </div>
                    <span className="ks-role-pill">
                      {u.role.toUpperCase()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Recent Notifications */}
        <section className="ks-admin-panel" aria-label="Recent Notifications">
          <div className="ks-admin-panel-header">
            <div className="ks-panel-title-wrap">
              <Bell size={17} />
              <h2 className="ks-admin-panel-title">Store Alerts &amp; Notifications</h2>
            </div>
            <Link to="/admin/notifications" className="ks-panel-link">
              <span>View All</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          <div className="ks-admin-panel-body">
            {loading ? (
              <div className="ks-admin-table-loading">Loading notifications...</div>
            ) : recentNotifications.length === 0 ? (
              <div className="ks-admin-empty-notice">
                <span>No notifications available.</span>
              </div>
            ) : (
              <div className="ks-admin-mini-list">
                {recentNotifications.map((notif) => (
                  <div key={notif.id} className="ks-mini-item-row">
                    <div className="ks-mini-item-info">
                      <span className="ks-mini-item-name">{notif.title}</span>
                      <span className="ks-mini-item-meta">{notif.message}</span>
                    </div>
                    <span className="ks-date-meta">
                      {new Date(notif.created_at).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
