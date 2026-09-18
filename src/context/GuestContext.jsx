import React, { createContext, useContext, useState, useEffect } from 'react';

const GuestContext = createContext();

export const GuestProvider = ({ children }) => {
  const [guestToken, setGuestToken] = useState(() => localStorage.getItem('ks_guest_token') || null);
  const [guestOrders, setGuestOrders] = useState(() => {
    try {
      const saved = localStorage.getItem('ks_guest_orders');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const saveGuestOrder = (order, rawToken) => {
    if (rawToken) {
      localStorage.setItem('ks_guest_token', rawToken);
      setGuestToken(rawToken);
    }
    setGuestOrders((prev) => {
      const updated = [order, ...prev.filter((o) => o.id !== order.id)];
      try {
        localStorage.setItem('ks_guest_orders', JSON.stringify(updated));
      } catch (e) {
        console.error('Failed to save guest order to localStorage', e);
      }
      return updated;
    });
  };

  return (
    <GuestContext.Provider
      value={{
        guestToken,
        guestOrders,
        saveGuestOrder
      }}
    >
      {children}
    </GuestContext.Provider>
  );
};

export const useGuest = () => useContext(GuestContext);
