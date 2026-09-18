import React, { useState, useEffect } from 'react';
import { Users, UserPlus, Shield, CheckCircle2, AlertCircle } from 'lucide-react';
import apiClient from '../../services/apiClient';
import { useAdminAuth } from '../../context/AdminAuthContext';

const AdminTeamPage = () => {
  const { isSuperAdmin } = useAdminAuth();
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);

  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState('admin');
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState('');

  const fetchAdmins = async () => {
    setLoading(true);
    try {
      const res = await apiClient('/admin/admins');
      if (res?.data) setAdmins(res.data);
    } catch (err) {
      console.error("Admins error", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isSuperAdmin) fetchAdmins();
  }, [isSuperAdmin]);

  if (!isSuperAdmin) {
    return (
      <div style={{ padding: '40px', color: 'var(--accent-red)' }}>
        Super Admin privileges are required to manage team members.
      </div>
    );
  }

  const handleCreateAdmin = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMsg('');
    try {
      await apiClient('/admin/admins', {
        method: 'POST',
        body: JSON.stringify({ email: newEmail, password: newPassword, role: newRole })
      });
      setMsg("✓ Administrator added successfully!");
      setNewEmail('');
      setNewPassword('');
      fetchAdmins();
    } catch (err) {
      alert(err.message || "Failed to create administrator");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 900 }}>Staff & Administrator Team</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '4px' }}>
          Super Admin controls for staff access, role assignments, and security privileges.
        </p>
      </div>

      {msg && (
        <div style={{ padding: '12px', backgroundColor: 'rgba(0,229,153,0.1)', color: 'var(--accent-green)', borderRadius: 'var(--radius-md)', display: 'flex', gap: '8px', marginBottom: '20px' }}>
          <CheckCircle2 size={18} />
          <span>{msg}</span>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '32px', alignItems: 'flex-start' }}>
        {/* Admin List */}
        <div className="glass-card" style={{ padding: '28px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '16px' }}>Current Administrators</h2>
          {loading ? (
            <div style={{ color: 'var(--text-muted)' }}>Loading administrators...</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {admins.map((adm) => (
                <div key={adm.id} style={{
                  padding: '14px 18px',
                  backgroundColor: 'var(--bg-input)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-subtle)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div>
                    <div style={{ fontWeight: 800 }}>{adm.email}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>ID: {adm.id.slice(0, 8)}</div>
                  </div>
                  <span className={`badge ${adm.role === 'super_admin' ? 'badge-gold' : 'badge-cyan'}`}>
                    {adm.role === 'super_admin' ? 'Super Admin' : 'Staff Admin'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Add Admin Form */}
        <div className="glass-card" style={{ padding: '28px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <UserPlus size={18} color="var(--accent-cyan)" />
            <span>Add New Administrator</span>
          </h2>

          <form onSubmit={handleCreateAdmin} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Admin Email</label>
              <input
                type="email"
                required
                className="form-input"
                placeholder="staff@keepersports.com"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Temporary Password</label>
              <input
                type="password"
                required
                className="form-input"
                placeholder="••••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Role Privilege</label>
              <select
                className="form-input"
                value={newRole}
                onChange={(e) => setNewRole(e.target.value)}
              >
                <option value="admin">Staff Admin</option>
                <option value="super_admin">Super Administrator</option>
              </select>
            </div>

            <button type="submit" disabled={submitting} className="btn btn-primary btn-lg" style={{ marginTop: '10px' }}>
              {submitting ? "Adding..." : "Add Administrator"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminTeamPage;
