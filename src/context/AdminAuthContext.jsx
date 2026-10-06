import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { authApi } from '../api/authApi';

const AdminAuthContext = createContext(null);

export const ADMIN_TOKEN_KEY = 'ks_admin_token';

export function AdminAuthProvider({ children }) {
  const [adminUser, setAdminUser] = useState(null);
  const [adminLoading, setAdminLoading] = useState(true);

  // Initialize Admin Session
  useEffect(() => {
    let isMounted = true;
    const token = localStorage.getItem(ADMIN_TOKEN_KEY);

    if (!token) {
      setAdminUser(null);
      setAdminLoading(false);
      return;
    }

    authApi.getAdminMe()
      .then((data) => {
        if (!isMounted) return;
        if (data?.success && data?.user && (data.user.role === 'admin' || data.user.role === 'super_admin')) {
          setAdminUser(data.user);
        } else {
          localStorage.removeItem(ADMIN_TOKEN_KEY);
          setAdminUser(null);
        }
      })
      .catch(() => {
        if (!isMounted) return;
        localStorage.removeItem(ADMIN_TOKEN_KEY);
        setAdminUser(null);
      })
      .finally(() => {
        if (isMounted) {
          setAdminLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const adminLogin = async ({ email, password }) => {
    const data = await authApi.adminLogin({ email, password });
    if (data?.success && data?.token && data?.user) {
      if (data.user.role !== 'admin' && data.user.role !== 'super_admin') {
        throw new Error('Access Denied: This account does not possess administrator privileges.');
      }
      localStorage.setItem(ADMIN_TOKEN_KEY, data.token);
      setAdminUser(data.user);
      return data;
    }
    throw new Error(data?.message || 'Administrator authentication failed.');
  };

  const adminLogout = async () => {
    try {
      await authApi.adminLogout();
    } catch (err) {
      console.warn('Admin logout network notice:', err.message);
    } finally {
      localStorage.removeItem(ADMIN_TOKEN_KEY);
      setAdminUser(null);
    }
  };

  return (
    <AdminAuthContext.Provider
      value={{
        adminUser,
        adminLoading,
        adminLogin,
        adminLogout,
        isAdmin: Boolean(adminUser && (adminUser.role === 'admin' || adminUser.role === 'super_admin'))
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
}
