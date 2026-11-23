import React, { useState, useEffect, useCallback } from 'react';
import {
  Users,
  Search,
  ShieldCheck,
  CheckCircle2,
  Clock,
  ChevronLeft,
  ChevronRight,
  X,
  UserPlus,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Send,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { adminApi } from '../../api/adminApi';
import { useAdminAuth } from '../../context/AdminAuthContext';
import AdminLoader from '../../components/admin/AdminLoader';

export default function AdminUsersPage() {
  const { adminUser: currentUser } = useAdminAuth();
  const isSuperAdmin = currentUser?.role === 'super_admin';

  const cachedInit = adminApi.peekCache('/users?page=1&limit=15');
  const [users, setUsers] = useState(() => cachedInit?.users || []);
  const [stats, setStats] = useState(() => cachedInit?.stats || { total: 0, verified: 0, unverified: 0, admins: 0 });
  const [totalCount, setTotalCount] = useState(() => cachedInit?.total || 0);
  const [page, setPage] = useState(() => cachedInit?.page || 1);
  const [totalPages, setTotalPages] = useState(() => cachedInit?.totalPages || 1);
  const [loading, setLoading] = useState(() => !cachedInit);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('');

  // Add Administrator Modal (Super Admin Only)
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [adminForm, setAdminForm] = useState({
    full_name: '',
    email: '',
    password: '',
    confirm_password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [addError, setAddError] = useState('');
  const [creatingAdmin, setCreatingAdmin] = useState(false);
  const [resendingId, setResendingId] = useState(null);

  // Toast
  const [toastMessage, setToastMessage] = useState(null);
  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4500);
  };

  const fetchUsers = useCallback(async (targetPage = 1, { silent = false } = {}) => {
    if (!silent) setLoading(true);
    try {
      const res = await adminApi.getUsers({
        page: targetPage,
        limit: 15,
        role: selectedRole || undefined,
        search: searchTerm || undefined
      });

      if (res && res.success) {
        setUsers(res.users || []);
        setTotalCount(res.total || 0);
        setPage(res.page || targetPage);
        setTotalPages(res.totalPages || 1);
        if (res.stats) setStats(res.stats);
      }
    } catch (err) {
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, selectedRole]);

  useEffect(() => {
    const isDefaultQuery = !searchTerm && !selectedRole;
    fetchUsers(1, { silent: isDefaultQuery && Boolean(cachedInit) });
  }, [fetchUsers]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchUsers(1);
  };

  const handleRoleChange = async (userId, newRole) => {
    if (userId === currentUser?.id) {
      showToast('You cannot alter your own administrator role.');
      return;
    }

    try {
      const res = await adminApi.updateUserRole(userId, newRole);
      if (res && res.success) {
        setUsers((prev) =>
          prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
        );
        showToast(`User role updated to ${newRole}.`);
        fetchUsers(page, { silent: true });
      } else {
        showToast(res.message || 'Failed to update user role.');
      }
    } catch {
      showToast('Network error updating role.');
    }
  };

  const openAddAdminModal = () => {
    setAdminForm({ full_name: '', email: '', password: '', confirm_password: '' });
    setShowPassword(false);
    setAddError('');
    setAddModalOpen(true);
  };

  const handleCreateAdmin = async (e) => {
    e.preventDefault();
    setAddError('');

    const fullName = adminForm.full_name.trim();
    const email = adminForm.email.trim().toLowerCase();
    const password = adminForm.password;
    const confirmPassword = adminForm.confirm_password;

    if (fullName.length < 2) {
      setAddError('Full name must be at least 2 characters.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setAddError('Please enter a valid email address.');
      return;
    }
    if (password.length < 8) {
      setAddError('Password must be at least 8 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setAddError('Passwords do not match.');
      return;
    }

    setCreatingAdmin(true);
    try {
      const res = await adminApi.createAdmin({
        full_name: fullName,
        email,
        password
      });

      if (res && res.success) {
        setAddModalOpen(false);
        showToast(res.message || `Administrator added. Verification link sent to ${email}.`);
        fetchUsers(1, { silent: true });
      } else {
        setAddError(res?.message || 'Failed to add administrator.');
      }
    } catch {
      setAddError('Network error creating administrator.');
    } finally {
      setCreatingAdmin(false);
    }
  };

  const handleResendVerification = async (u) => {
    if (resendingId) return;
    setResendingId(u.id);
    try {
      const res = await adminApi.resendAdminVerification(u.id);
      if (res && res.success) {
        showToast(res.message || `Verification link resent to ${u.email}.`);
      } else {
        showToast(res?.message || 'Failed to resend verification email.');
      }
    } catch {
      showToast('Network error resending verification link.');
    } finally {
      setResendingId(null);
    }
  };

  return (
    <div className="ks-admin-page-container">
      {/* Toast */}
      {toastMessage && (
        <div className="ks-admin-toast" role="status">
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="ks-admin-header-row">
        <div>
          <span className="ks-admin-header-eyebrow">ACCOUNTS &amp; SECURITY</span>
          <h1 className="ks-admin-page-title">Users Management</h1>
        </div>

        {isSuperAdmin && (
          <button
            type="button"
            onClick={openAddAdminModal}
            className="ks-admin-btn-primary"
          >
            <UserPlus size={16} />
            <span>Add Administrator</span>
          </button>
        )}
      </div>

      {/* STAT CARDS */}
      <div className="ks-admin-stats-grid">
        <div className="ks-admin-stat-card">
          <div className="ks-stat-card-icon-wrap is-neutral">
            <Users size={20} />
          </div>
          <div className="ks-stat-card-content">
            <span className="ks-stat-card-label">TOTAL USERS</span>
            <div className="ks-stat-card-value">{loading ? '—' : stats.total}</div>
          </div>
        </div>

        <div className="ks-admin-stat-card">
          <div className="ks-stat-card-icon-wrap is-neutral">
            <CheckCircle2 size={20} />
          </div>
          <div className="ks-stat-card-content">
            <span className="ks-stat-card-label">VERIFIED ACCOUNTS</span>
            <div className="ks-stat-card-value">{loading ? '—' : stats.verified}</div>
          </div>
        </div>

        <div className="ks-admin-stat-card">
          <div className="ks-stat-card-icon-wrap is-neutral">
            <Clock size={20} />
          </div>
          <div className="ks-stat-card-content">
            <span className="ks-stat-card-label">UNVERIFIED</span>
            <div className="ks-stat-card-value">{loading ? '—' : stats.unverified}</div>
          </div>
        </div>

        <div className="ks-admin-stat-card">
          <div className="ks-stat-card-icon-wrap is-neutral">
            <ShieldCheck size={20} />
          </div>
          <div className="ks-stat-card-content">
            <span className="ks-stat-card-label">ADMINISTRATORS</span>
            <div className="ks-stat-card-value">{loading ? '—' : stats.admins}</div>
          </div>
        </div>
      </div>

      {/* USERS TOOLBAR */}
      <div className="ks-admin-filter-toolbar">
        <form onSubmit={handleSearchSubmit} className="ks-shop-search-form" role="search">
          <Search size={16} className="ks-search-icon" aria-hidden="true" />
          <input
            type="search"
            placeholder="Search by full name or email address..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="ks-shop-search-input"
            aria-label="Search users"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm('')}
              className="ks-search-clear-btn"
              aria-label="Clear search text"
            >
              <X size={15} />
            </button>
          )}
        </form>

        <div className="ks-admin-filter-actions">
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="ks-admin-select"
            aria-label="Filter by role"
          >
            <option value="">All Roles</option>
            <option value="user">Normal Users</option>
            <option value="admin">Administrators</option>
            <option value="super_admin">Super Admins</option>
          </select>
        </div>
      </div>

      {/* USERS TABLE */}
      <section className="ks-admin-panel" aria-label="Users Table">
        <div className="ks-admin-panel-body" style={{ padding: 0 }}>
          {loading ? (
            <AdminLoader message="Loading users..." />
          ) : users.length === 0 ? (
            <div className="ks-admin-empty-notice" style={{ padding: '48px 24px' }}>
              <span>No user accounts found matching your query.</span>
            </div>
          ) : (
            <div className="ks-admin-table-responsive">
              <table className="ks-admin-table">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Email</th>
                    <th>Auth Provider</th>
                    <th>Status / Verification</th>
                    <th>Role</th>
                    <th>Registered</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => {
                    const isSelf = u.id === currentUser?.id;
                    const initial = u.full_name?.trim()?.charAt(0)?.toUpperCase() || 'U';
                    const isPendingAdmin = u.role === 'admin' && !u.is_verified;

                    return (
                      <tr key={u.id}>
                        <td>
                          <div className="ks-user-cell">
                            <div className="ks-admin-avatar-circle mini">{initial}</div>
                            <div>
                              <div className="ks-table-strong">
                                {u.full_name} {isSelf && <span className="ks-self-badge">(You)</span>}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td>{u.email}</td>
                        <td>
                          <span className="ks-provider-pill">{u.auth_provider?.toUpperCase()}</span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                            <span className={`ks-verify-pill ${u.is_verified ? 'is-verified' : 'is-pending'}`}>
                              {u.is_verified
                                ? (u.role === 'admin' || u.role === 'super_admin' ? 'Active · Verified' : 'Verified')
                                : (isPendingAdmin ? 'Inactive · Pending Email' : 'Pending')}
                            </span>

                            {isSuperAdmin && isPendingAdmin && (
                              <button
                                type="button"
                                onClick={() => handleResendVerification(u)}
                                disabled={resendingId === u.id}
                                className="ks-admin-mini-resend-btn"
                                title="Resend activation verification link"
                              >
                                {resendingId === u.id ? (
                                  <Loader2 size={12} className="ks-spin-icon" />
                                ) : (
                                  <Send size={12} />
                                )}
                                <span>{resendingId === u.id ? 'Sending...' : 'Resend Link'}</span>
                              </button>
                            )}
                          </div>
                        </td>
                        <td>
                          {u.role === 'super_admin' ? (
                            <span className="ks-role-pill is-super">SUPER ADMIN</span>
                          ) : (
                            <select
                              value={u.role}
                              disabled={isSelf}
                              onChange={(e) => handleRoleChange(u.id, e.target.value)}
                              className="ks-role-select"
                              title={isSelf ? 'Cannot edit own role' : 'Change user role'}
                            >
                              <option value="user">User</option>
                              <option value="admin">Admin</option>
                            </select>
                          )}
                        </td>
                        <td>{new Date(u.created_at).toLocaleDateString()}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="ks-admin-table-pagination">
              <span className="ks-table-page-info">
                Page {page} of {totalPages} ({totalCount} total registered users)
              </span>

              <div className="ks-table-page-controls">
                <button
                  type="button"
                  onClick={() => fetchUsers(page - 1)}
                  disabled={page <= 1 || loading}
                  className="ks-table-page-btn"
                >
                  <ChevronLeft size={16} />
                  <span>Prev</span>
                </button>
                <button
                  type="button"
                  onClick={() => fetchUsers(page + 1)}
                  disabled={page >= totalPages || loading}
                  className="ks-table-page-btn"
                >
                  <span>Next</span>
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ADD ADMINISTRATOR MODAL (SUPER ADMIN ONLY) */}
      {isSuperAdmin && addModalOpen && (
        <div
          className="ks-admin-modal-backdrop"
          role="dialog"
          aria-modal="true"
          aria-labelledby="add-admin-modal-title"
          onClick={() => !creatingAdmin && setAddModalOpen(false)}
        >
          <div className="ks-admin-modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="ks-admin-modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <ShieldCheck size={20} style={{ color: 'var(--ks-accent-red)' }} />
                <h2 id="add-admin-modal-title" className="ks-admin-modal-title">
                  Add New Administrator
                </h2>
              </div>
              <button
                type="button"
                onClick={() => !creatingAdmin && setAddModalOpen(false)}
                className="ks-admin-modal-close-btn"
                aria-label="Close modal"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateAdmin} noValidate>
              <div className="ks-admin-modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div className="ks-admin-info-callout">
                  <Mail size={16} style={{ flexShrink: 0, color: 'var(--ks-accent-red)' }} />
                  <span>
                    A verification link will be emailed to the new administrator. Their account will remain{' '}
                    <strong>inactive</strong> until they verify their email address.
                  </span>
                </div>

                {addError && (
                  <div className="ks-alert ks-alert-error" role="alert" style={{ margin: 0 }}>
                    <AlertCircle size={15} style={{ flexShrink: 0 }} />
                    <span>{addError}</span>
                  </div>
                )}

                <div className="ks-form-group" style={{ marginBottom: 0 }}>
                  <label className="ks-label" htmlFor="new-admin-name">FULL NAME *</label>
                  <input
                    id="new-admin-name"
                    type="text"
                    className="ks-input"
                    placeholder="e.g. Rami Mansour"
                    value={adminForm.full_name}
                    onChange={(e) => setAdminForm((prev) => ({ ...prev, full_name: e.target.value }))}
                    disabled={creatingAdmin}
                    required
                  />
                </div>

                <div className="ks-form-group" style={{ marginBottom: 0 }}>
                  <label className="ks-label" htmlFor="new-admin-email">EMAIL ADDRESS *</label>
                  <input
                    id="new-admin-email"
                    type="email"
                    className="ks-input"
                    placeholder="admin.member@keepersportlb.com"
                    value={adminForm.email}
                    onChange={(e) => setAdminForm((prev) => ({ ...prev, email: e.target.value }))}
                    disabled={creatingAdmin}
                    required
                  />
                </div>

                <div className="ks-form-group" style={{ marginBottom: 0 }}>
                  <label className="ks-label" htmlFor="new-admin-password">PASSWORD (MIN 8 CHARACTERS) *</label>
                  <div className="ks-input-container">
                    <input
                      id="new-admin-password"
                      type={showPassword ? 'text' : 'password'}
                      className="ks-input ks-input-has-eye"
                      placeholder="Set initial administrator password"
                      value={adminForm.password}
                      onChange={(e) => setAdminForm((prev) => ({ ...prev, password: e.target.value }))}
                      disabled={creatingAdmin}
                      minLength={8}
                      required
                    />
                    <button
                      type="button"
                      className="ks-eye-btn"
                      onClick={() => setShowPassword((s) => !s)}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div className="ks-form-group" style={{ marginBottom: 0 }}>
                  <label className="ks-label" htmlFor="new-admin-confirm">CONFIRM PASSWORD *</label>
                  <input
                    id="new-admin-confirm"
                    type={showPassword ? 'text' : 'password'}
                    className="ks-input"
                    placeholder="Re-enter password"
                    value={adminForm.confirm_password}
                    onChange={(e) => setAdminForm((prev) => ({ ...prev, confirm_password: e.target.value }))}
                    disabled={creatingAdmin}
                    minLength={8}
                    required
                  />
                </div>
              </div>

              <div className="ks-admin-modal-footer">
                <button
                  type="button"
                  onClick={() => setAddModalOpen(false)}
                  disabled={creatingAdmin}
                  className="ks-admin-btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingAdmin}
                  className="ks-admin-btn-primary"
                >
                  {creatingAdmin ? (
                    <>
                      <Loader2 size={15} className="ks-spin-icon" />
                      <span>Sending Verification...</span>
                    </>
                  ) : (
                    <>
                      <Lock size={15} />
                      <span>Create &amp; Send Link</span>
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
