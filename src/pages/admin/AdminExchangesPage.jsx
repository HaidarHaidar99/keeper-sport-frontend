import React, { useState, useEffect } from 'react';
import { RefreshCw, CheckCircle, XCircle } from 'lucide-react';
import apiClient from '../../services/apiClient';

const AdminExchangesPage = () => {
  const [exchanges, setExchanges] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchExchanges = async () => {
    setLoading(true);
    try {
      const res = await apiClient('/admin/exchanges');
      if (res?.data) setExchanges(res.data);
    } catch (err) {
      console.error("Exchanges error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExchanges();
  }, []);

  const handleStatusUpdate = async (id, status) => {
    try {
      await apiClient(`/admin/exchanges/${id}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status })
      });
      fetchExchanges();
    } catch (err) {
      alert(err.message || "Failed to update exchange status");
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 900 }}>Size Exchange Requests</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '4px' }}>
          Customer size exchange management under the "Exchanges Only — No Refunds" policy.
        </p>
      </div>

      <div className="glass-card" style={{ overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>Loading exchange requests...</div>
        ) : exchanges.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>No active exchange requests.</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--bg-input)', borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-secondary)' }}>
                  <th style={{ padding: '14px 18px' }}>Order #</th>
                  <th style={{ padding: '14px 18px' }}>Customer</th>
                  <th style={{ padding: '14px 18px' }}>Item</th>
                  <th style={{ padding: '14px 18px' }}>Requested Size</th>
                  <th style={{ padding: '14px 18px' }}>Customer Reason</th>
                  <th style={{ padding: '14px 18px' }}>Status</th>
                  <th style={{ padding: '14px 18px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {exchanges.map((ex) => (
                  <tr key={ex.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={{ padding: '14px 18px', fontWeight: 800, color: 'var(--accent-cyan)' }}>
                      #{ex.orders?.order_number || ex.order_id?.slice(0, 8)}
                    </td>
                    <td style={{ padding: '14px 18px', fontWeight: 700 }}>
                      {ex.orders?.customer_name || "Customer"}
                    </td>
                    <td style={{ padding: '14px 18px' }}>
                      {ex.order_items?.products?.name_en || "Product Item"}
                    </td>
                    <td style={{ padding: '14px 18px' }}>
                      <span className="badge badge-gold">{ex.requested_size}</span>
                    </td>
                    <td style={{ padding: '14px 18px', maxWidth: '240px', color: 'var(--text-secondary)' }}>
                      {ex.reason || "Size swap requested"}
                    </td>
                    <td style={{ padding: '14px 18px' }}>
                      <span className={`badge ${ex.status === 'Completed' ? 'badge-green' : ex.status === 'Approved' ? 'badge-cyan' : 'badge-gold'}`}>
                        {ex.status}
                      </span>
                    </td>
                    <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                        {ex.status === 'Pending' && (
                          <button
                            onClick={() => handleStatusUpdate(ex.id, 'Approved')}
                            className="btn btn-primary btn-sm"
                          >
                            Approve
                          </button>
                        )}
                        {ex.status === 'Approved' && (
                          <button
                            onClick={() => handleStatusUpdate(ex.id, 'Completed')}
                            className="btn btn-gold btn-sm"
                          >
                            Complete Swap
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminExchangesPage;
