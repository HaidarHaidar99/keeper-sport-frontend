import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../api/authApi';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const hasCustomerSession = localStorage.getItem('ks_customer_logged_in');
    if (!hasCustomerSession) {
      setUser(null);
      setLoading(false);
      return;
    }

    authApi.getMe()
      .then((data) => {
        if (data.success && data.user) {
          setUser(data.user);
        } else {
          localStorage.removeItem('ks_customer_logged_in');
          setUser(null);
        }
      })
      .catch(() => {
        localStorage.removeItem('ks_customer_logged_in');
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const login = async (credentials) => {
    const data = await authApi.login(credentials);
    if (data.user) {
      localStorage.setItem('ks_customer_logged_in', '1');
      setUser(data.user);
    }
    return data;
  };

  const register = async (userData) => {
    return authApi.register(userData);
  };

  const googleLogin = async (credential) => {
    const data = await authApi.googleAuth(credential);
    if (data.user) {
      localStorage.setItem('ks_customer_logged_in', '1');
      setUser(data.user);
    }
    return data;
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } finally {
      localStorage.removeItem('ks_customer_logged_in');
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, googleLogin, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
