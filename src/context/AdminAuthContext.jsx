import React, { createContext, useContext, useState, useEffect } from 'react';
import apiClient from '../services/apiClient';

const AdminAuthContext = createContext();

export const AdminAuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('ks_admin_token') || null);
  const [loading, setLoading] = useState(true);

  // Check admin validity
  useEffect(() => {
    const checkAdmin = async () => {
      if (!token) {
        setAdmin(null);
        setLoading(false);
        return;
      }
      try {
        const data = await apiClient('/admin/me');
        if (data?.success && data?.admin) {
          setAdmin(data.admin);
        } else {
          logout();
        }
      } catch {
        logout();
      } finally {
        setLoading(false);
      }
    };
    checkAdmin();
  }, [token]);

  const login = async (email, password) => {
    const res = await apiClient('/auth/admin/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });

    const adminToken = res?.data?.token || res?.token;
    const adminUser = res?.data?.admin || res?.admin;

    if (adminToken && adminUser) {
      localStorage.setItem('ks_admin_token', adminToken);
      setToken(adminToken);
      setAdmin(adminUser);
    }
    return res;
  };

  const logout = () => {
    localStorage.removeItem('ks_admin_token');
    setToken(null);
    setAdmin(null);
  };

  return (
    <AdminAuthContext.Provider
      value={{
        admin,
        token,
        loading,
        isAdmin: !!admin,
        isSuperAdmin: admin?.role === 'super_admin',
        login,
        logout
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => useContext(AdminAuthContext);
