import React from 'react';
import { Navigate, useLocation, Link, Outlet } from 'react-router-dom';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { useAdminAuth } from '../../context/AdminAuthContext';
import AdminLoader from './AdminLoader';

export default function AdminGuard({ children }) {
  const { adminUser, adminLoading } = useAdminAuth();
  const location = useLocation();

  if (adminLoading) {
    return <AdminLoader fullScreen message="Verifying Administrator Privileges..." />;
  }

  // If user is unauthenticated in admin context, redirect to dedicated admin login portal
  if (!adminUser) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  // If authenticated but unauthorized, render clean luxury 403 state
  const isAuthorized = adminUser.role === 'admin' || adminUser.role === 'super_admin';

  if (!isAuthorized) {
    return (
      <div className="ks-admin-unauthorized-container">
        <div className="ks-admin-unauthorized-card">
          <div className="ks-unauthorized-badge">
            <ShieldAlert size={44} className="ks-unauthorized-icon" />
          </div>
          <h1 className="ks-unauthorized-title">Access Denied</h1>
          <p className="ks-unauthorized-text">
            Administrator privileges required. Your account (<strong>{adminUser.email}</strong>) has the role{' '}
            <code>{adminUser.role}</code> and is not authorized to access the Keeper Sports administrative interface.
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

