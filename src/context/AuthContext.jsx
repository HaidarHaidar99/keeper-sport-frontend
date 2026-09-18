import React, { createContext, useContext, useState, useEffect } from 'react';
import apiClient from '../services/apiClient';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState('login'); // 'login' | 'register'

  // Fetch current session from HttpOnly cookie
  const fetchSession = async () => {
    try {
      const data = await apiClient('/customers/me');
      if (data?.success && data?.customer) {
        setCustomer(data.customer);
      } else {
        setCustomer(null);
      }
    } catch {
      setCustomer(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSession();
  }, []);

  const login = async (email, password) => {
    const data = await apiClient('/auth/customer/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    const cust = data?.data?.customer || data?.customer;
    if (cust) {
      setCustomer(cust);
      setIsAuthModalOpen(false);
    }
    return data;
  };

  const register = async (email, password) => {
    const data = await apiClient('/auth/customer/register', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    const cust = data?.data?.customer || data?.customer;
    if (cust) {
      setCustomer(cust);
      setIsAuthModalOpen(false);
    }
    return data;
  };

  const logout = async () => {
    try {
      await apiClient('/auth/customer/logout', { method: 'POST' });
    } catch (e) {
      console.error('Logout error:', e);
    } finally {
      setCustomer(null);
    }
  };

  const openAuthModal = (mode = 'login') => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  return (
    <AuthContext.Provider
      value={{
        customer,
        loading,
        isAuthenticated: !!customer,
        login,
        register,
        logout,
        isAuthModalOpen,
        authModalMode,
        setAuthModalMode,
        openAuthModal,
        closeAuthModal,
        refreshSession: fetchSession
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
