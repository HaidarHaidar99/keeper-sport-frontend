import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ShoppingBag, Eye, CheckCircle, XCircle, AlertTriangle, Truck } from 'lucide-react';
import apiClient from '../../services/apiClient';

const statuses = ['All', 'Pending', 'Confirmed', 'Shipped', 'Delivered', 'Declined', 'Cancelled'];

const AdminOrdersPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeStatus = searchParams.get('status') || 'All';

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Status update modal state
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [targetStatus, setTargetStatus] = useState('Confirmed');
  const [rejectionReason, setRejectionReason] = useState('');
  const [updating, setUpdating] = useState(false);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const endpoint = activeStatus === 'All' ? '/admin/orders' : `/admin/orders?status=${activeStatus}`;
      const res = await apiClient(endpoint);
      if (res?.data) setOrders(res.data);
    } catch (err) {
      console.error("Error fetching orders:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [activeStatus]);

  const handleStatusSubmit = async (e) => {
    e.preventDefault();
    setUpdating(true);
    try {
      await apiClient(`/orders/${selectedOrder.id}/status`, {
        method: 'PUT',
        body: JSON.stringify({
          order_status: targetStatus,
          rejection_reason: ['Declined', 'Cancelled'].includes(targetStatus) ? rejectionReason : undefined
        })
      });
      setSelectedOrder(null);
      setRejectionReason('');
      fetchOrders();
    } catch (err) {
      alert(err.message || "Failed to update order status");
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 900 }}>Customer Orders</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '4px' }}>
            Manage online orders, track delivery dispatches, and trigger inventory fulfillment.
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '12px', marginBottom: '24px' }}>
        {statuses.map((s) => {
          const isSelected = activeStatus === s;
          return (
            <button
              key={s}
              onClick={() => setSearchParams(s === 'All' ? {} : { status: s })}
              style={{
                padding: '8px 16px',
                borderRadius: 'var(--radius-full)',
                fontSize: '13px',
                fontWeight: 700,
                backgroundColor: isSelected ? 'var(--accent-cyan)' : 'var(--bg-card)',
                color: isSelected ? '#040914' : 'var(--text-secondary)',
                border: isSelected ? '1px solid var(--accent-cyan)' : '1px solid var(--border-subtle)',
                whiteSpace: 'nowrap'
              }}
            >
              {s}
            </button>
          );
        })}
      </div>

      {/* Orders Table */}
      <div className="glass-card" style={{ overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>Loading orders...</div>
        ) : orders.length === 0 ? (
          <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-secondary)' }}>No orders found for this status.</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--bg-input)', borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-secondary)' }}>
                  <th style={{ padding: '14px 18px' }}>Order #</th>
                  <th style={{ padding: '14px 18px' }}>Customer / Phone</th>
                  <th style={{ padding: '14px 18px' }}>City & Address</th>
                  <th style={{ padding: '14px 18px' }}>Items</th>
                  <th style={{ padding: '14px 18px' }}>Total</th>
                  <th style={{ padding: '14px 18px' }}>Status</th>
                  <th style={{ padding: '14px 18px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((ord) => (
                  <tr key={ord.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={{ padding: '14px 18px', fontWeight: 800, color: 'var(--accent-cyan)' }}>
                      #{ord.order_number || ord.id.slice(0, 8)}
                    </td>
                    <td style={{ padding: '14px 18px' }}>
                      <div style={{ fontWeight: 700 }}>{ord.customer_name}</div>
                      <div style={{ color: 'var(--text-muted)', fontSize: '12px' }}>{ord.delivery_phone}</div>
                    </td>
                    <td style={{ padding: '14px 18px' }}>
                      <div style={{ fontWeight: 600 }}>{ord.delivery_city}</div>
                      <div style={{ color: 'var(--text-muted)', fontSize: '12px', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {ord.delivery_address}
                      </div>
                    </td>
                    <td style={{ padding: '14px 18px', fontWeight: 600 }}>
                      {ord.order_items?.length || 1} items
                    </td>
                    <td style={{ padding: '14px 18px', fontWeight: 800 }}>
                      ${Number(ord.total_amount).toFixed(2)}
                    </td>
                    <td style={{ padding: '14px 18px' }}>
                      <span className="badge badge-cyan">{ord.order_status}</span>
                    </td>
                    <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                      <button
                        onClick={() => {
                          setSelectedOrder(ord);
                          setTargetStatus(ord.order_status);
                        }}
                        className="btn btn-outline btn-sm"
                      >
                        Update Status
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Status Update Modal */}
      {selectedOrder && (
        <div style={{
          position: 'fixed',
          inset: 0,
          zIndex: 300,
          backgroundColor: 'rgba(0,0,0,0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <div className="glass-card" style={{ width: '100%', maxWidth: '440px', padding: '28px', backgroundColor: 'var(--bg-surface)' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 900, marginBottom: '14px' }}>
              Update Order #{selectedOrder.order_number || selectedOrder.id.slice(0, 8)}
            </h3>

            <form onSubmit={handleStatusSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label className="form-label">Select New Status</label>
                <select
                  className="form-input"
                  value={targetStatus}
                  onChange={(e) => setTargetStatus(e.target.value)}
                >
                  {['Pending', 'Confirmed', 'Shipped', 'Delivered', 'Declined', 'Cancelled'].map((st) => (
                    <option key={st} value={st}>{st}</option>
                  ))}
                </select>
              </div>

              {['Declined', 'Cancelled'].includes(targetStatus) && (
                <div>
                  <label className="form-label">Mandatory Rejection / Cancellation Reason</label>
                  <textarea
                    required
                    rows={3}
                    className="form-input"
                    placeholder="Enter explicit reason for audit log..."
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                  />
                </div>
              )}

              {targetStatus === 'Delivered' && (
                <div style={{ padding: '10px 14px', backgroundColor: 'rgba(0,229,153,0.1)', borderRadius: 'var(--radius-sm)', color: 'var(--accent-green)', fontSize: '12px', fontWeight: 600 }}>
                  ✓ Marking as Delivered fulfills reserved stock and atomically increments total_sold.
                </div>
              )}

              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button type="submit" disabled={updating} className="btn btn-primary" style={{ flex: 1 }}>
                  {updating ? "Saving..." : "Confirm Status"}
                </button>
                <button type="button" onClick={() => setSelectedOrder(null)} className="btn btn-ghost">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrdersPage;
