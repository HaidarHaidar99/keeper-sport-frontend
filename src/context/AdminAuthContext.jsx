import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../api/authApi';

const AdminAuthContext = createContext(null);

export const ADMIN_TOKEN_KEY = 'ks_admin_token';
export const ADMIN_USER_CACHE_KEY = 'ks_admin_user_cache';

function readCachedAdminUser() {
  try {
    const token = localStorage.getItem(ADMIN_TOKEN_KEY);
    if (!token) return null;
    const raw = localStorage.getItem(ADMIN_USER_CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && parsed.id && (parsed.role === 'admin' || parsed.role === 'super_admin')) {
      return parsed;
    }
    return null;
  } catch {
    return null;
  }
}

export function AdminAuthProvider({ children }) {
  // Hydrate immediately from cache so Admin Panel opens directly with 0ms wait time
  const [adminUser, setAdminUser] = useState(() => readCachedAdminUser());
  const [adminLoading, setAdminLoading] = useState(() => {
    const token = localStorage.getItem(ADMIN_TOKEN_KEY);
    if (!token) return false;
    return !readCachedAdminUser();
  });

  // Silently validate & refresh Admin Session in background
  useEffect(() => {
    let isMounted = true;
    const token = localStorage.getItem(ADMIN_TOKEN_KEY);

    if (!token) {
      localStorage.removeItem(ADMIN_USER_CACHE_KEY);
      setAdminUser(null);
      setAdminLoading(false);
      return;
    }

    authApi.getAdminMe()
      .then((data) => {
        if (!isMounted) return;
        if (data?.success && data?.user && (data.user.role === 'admin' || data.user.role === 'super_admin')) {
          setAdminUser(data.user);
          try {
            localStorage.setItem(ADMIN_USER_CACHE_KEY, JSON.stringify(data.user));
          } catch {}
        } else {
          localStorage.removeItem(ADMIN_TOKEN_KEY);
          localStorage.removeItem(ADMIN_USER_CACHE_KEY);
          setAdminUser(null);
        }
      })
      .catch(() => {
        if (!isMounted) return;
        // Only clear session if token was rejected; keep cached user only if network offline? Better: clear on auth failure
        localStorage.removeItem(ADMIN_TOKEN_KEY);
        localStorage.removeItem(ADMIN_USER_CACHE_KEY);
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
      try {
        localStorage.setItem(ADMIN_USER_CACHE_KEY, JSON.stringify(data.user));
      } catch {}
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
      localStorage.removeItem(ADMIN_USER_CACHE_KEY);
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
        isAdmin: Boolean(adminUser && (adminUser.role === 'admin' || adminUser.role === 'super_admin')),
        isSuperAdmin: Boolean(adminUser && adminUser.role === 'super_admin')
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
