import React from 'react';
import { Navigate, useLocation, Link, Outlet } from 'react-router-dom';
import { ShieldAlert, ArrowLeft, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function AdminGuard({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="ks-admin-loading-screen" aria-live="polite">
        <Loader2 size={32} className="ks-spin-icon" style={{ color: 'var(--ks-accent-red)' }} />
        <span>Verifying Administrator Privileges...</span>
      </div>
    );
  }

  // If user is unauthenticated, redirect to existing login flow preserving target location
  if (!user) {
    return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname)}`} replace />;
  }

  // If authenticated but unauthorized, render clean luxury 403 state
  const isAuthorized = user.role === 'admin' || user.role === 'super_admin';

  if (!isAuthorized) {
    return (
      <div className="ks-admin-unauthorized-container">
        <div className="ks-admin-unauthorized-card">
          <div className="ks-unauthorized-badge">
            <ShieldAlert size={44} className="ks-unauthorized-icon" />
          </div>
          <h1 className="ks-unauthorized-title">Access Denied</h1>
          <p className="ks-unauthorized-text">
            Administrator privileges required. Your account (<strong>{user.email}</strong>) has the role{' '}
            <code>{user.role}</code> and is not authorized to access the Keeper Sports administrative interface.
          </p>
          <div className="ks-unauthorized-actions">
            <Link to="/" className="ks-btn-admin-return">
              <ArrowLeft size={16} />
              <span>RETURN TO STORE</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return children ? children : <Outlet />;
}
