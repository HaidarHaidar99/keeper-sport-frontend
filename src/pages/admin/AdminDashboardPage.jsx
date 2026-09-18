import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  ShoppingBag, 
  DollarSign, 
  Clock, 
  AlertTriangle, 
  ArrowRight,
  Package,
  Layers,
  Store
} from 'lucide-react';
import apiClient from '../../services/apiClient';

const AdminDashboardPage = () => {
  const [stats, setStats] = useState({
    total_orders: 0,
    total_sales: 0,
    pending_orders: 0,
    low_stock_count: 0
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const [dashRes, ordersRes] = await Promise.all([
          apiClient('/admin/dashboard'),
          apiClient('/admin/orders?limit=5')
        ]);
        if (dashRes?.data) setStats(dashRes.data);
        if (ordersRes?.data) setRecentOrders(ordersRes.data);
      } catch (err) {
        console.error("Dashboard error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  return (
    <div>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 900 }}>Executive Overview</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '4px' }}>
          Real-time store metrics, fulfillment statuses, and inventory health.
        </p>
      </div>

      {/* ── KPI Cards ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '20px',
        marginBottom: '40px'
      }}>
        <div className="glass-card glow-card-cyan" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-secondary)' }}>Total Revenue</span>
            <div style={{ padding: '8px', borderRadius: '8px', backgroundColor: 'rgba(0, 240, 255, 0.1)', color: 'var(--accent-cyan)' }}>
              <DollarSign size={18} />
            </div>
          </div>
          <div style={{ fontSize: '28px', fontWeight: 900, color: 'var(--text-primary)' }}>
            ${Number(stats.total_sales || 0).toFixed(2)}
          </div>
        </div>

        <div className="glass-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-secondary)' }}>Total Orders</span>
            <div style={{ padding: '8px', borderRadius: '8px', backgroundColor: 'rgba(168, 85, 247, 0.1)', color: '#C084FC' }}>
              <ShoppingBag size={18} />
            </div>
          </div>
          <div style={{ fontSize: '28px', fontWeight: 900, color: 'var(--text-primary)' }}>
            {stats.total_orders || 0}
          </div>
        </div>

        <div className="glass-card glow-card-gold" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--accent-gold)' }}>Pending Dispatch</span>
            <div style={{ padding: '8px', borderRadius: '8px', backgroundColor: 'rgba(255, 184, 0, 0.1)', color: 'var(--accent-gold)' }}>
              <Clock size={18} />
            </div>
          </div>
          <div style={{ fontSize: '28px', fontWeight: 900, color: 'var(--accent-gold)' }}>
            {stats.pending_orders || 0}
          </div>
        </div>

        <div className="glass-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--accent-red)' }}>Low Stock Alerts</span>
            <div style={{ padding: '8px', borderRadius: '8px', backgroundColor: 'rgba(255, 59, 48, 0.1)', color: 'var(--accent-red)' }}>
              <AlertTriangle size={18} />
            </div>
          </div>
          <div style={{ fontSize: '28px', fontWeight: 900, color: 'var(--accent-red)' }}>
            {stats.low_stock_count || 0}
          </div>
        </div>
      </div>

      {/* ── Recent Activity & Quick Navigation ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '28px' }}>
        {/* Recent Orders Table */}
        <div className="glass-card" style={{ padding: '28px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 800 }}>Recent Orders</h2>
            <Link to="/admin/orders" style={{ fontSize: '13px', color: 'var(--accent-cyan)', fontWeight: 700 }}>
              View All
            </Link>
          </div>

          {recentOrders.length === 0 ? (
            <div style={{ color: 'var(--text-muted)', fontSize: '14px', padding: '20px 0' }}>
              No incoming orders yet.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {recentOrders.map((ord) => (
                <div key={ord.id} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px 14px',
                  backgroundColor: 'var(--bg-input)',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '13px'
                }}>
                  <div>
                    <div style={{ fontWeight: 800 }}>#{ord.order_number || ord.id.slice(0, 8)}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{ord.customer_name} • {ord.delivery_city}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 800, color: 'var(--accent-cyan)' }}>${Number(ord.total_amount).toFixed(2)}</div>
                    <span className="badge badge-cyan" style={{ fontSize: '10px' }}>{ord.order_status}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Operations Links */}
        <div className="glass-card" style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 800 }}>Quick Operations</h2>

          <Link to="/admin/inventory" className="btn btn-outline" style={{ justifyContent: 'space-between', padding: '14px 18px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Store size={18} color="var(--accent-cyan)" />
              <span>Record Walk-in Store Sale (POS)</span>
            </div>
            <ArrowRight size={16} />
          </Link>

          <Link to="/admin/products" className="btn btn-outline" style={{ justifyContent: 'space-between', padding: '14px 18px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Package size={18} color="var(--accent-gold)" />
              <span>Add / Manage Product Catalog</span>
            </div>
            <ArrowRight size={16} />
          </Link>

          <Link to="/admin/orders?status=Pending" className="btn btn-outline" style={{ justifyContent: 'space-between', padding: '14px 18px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Clock size={18} color="var(--accent-green)" />
              <span>Fulfill Pending Orders</span>
            </div>
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
