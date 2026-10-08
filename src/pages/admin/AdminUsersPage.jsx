import React, { useState, useEffect, useCallback } from 'react';
import { Users, Search, ShieldCheck, CheckCircle2, Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import { adminApi } from '../../api/adminApi';
import { useAdminAuth } from '../../context/AdminAuthContext';

export default function AdminUsersPage() {
  const { adminUser: currentUser } = useAdminAuth();
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({ total: 0, verified: 0, unverified: 0, admins: 0 });
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('');

  // Toast
  const [toastMessage, setToastMessage] = useState(null);
  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const fetchUsers = useCallback(async (targetPage = 1) => {
    setLoading(true);
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
    fetchUsers(1);
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
        fetchUsers(page);
      } else {
        showToast(res.message || 'Failed to update user role.');
      }
    } catch {
      showToast('Network error updating role.');
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
        <form onSubmit={handleSearchSubmit} className="ks-admin-search-wrap">
          <Search size={15} className="ks-admin-search-icon" />
          <input
            type="search"
            placeholder="Search by full name or email address..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="ks-admin-input is-search"
          />
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
            <div className="ks-admin-table-loading">Loading users...</div>
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
                    <th>Verification</th>
                    <th>Role</th>
                    <th>Registered</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => {
                    const isSelf = u.id === currentUser?.id;
                    const initial = u.full_name?.trim()?.charAt(0)?.toUpperCase() || 'U';

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
                          <span className={`ks-verify-pill ${u.is_verified ? 'is-verified' : 'is-pending'}`}>
                            {u.is_verified ? 'Verified' : 'Pending'}
                          </span>
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
    </div>
  );
}
