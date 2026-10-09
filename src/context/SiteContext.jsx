import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { contentApi } from '../api/contentApi';
import { getGuestOrders, getHiddenOrderIds } from '../utils/guestIdentity';

const SiteContext = createContext(null);

const SETTINGS_STORAGE_KEY = 'ks_cached_site_settings';
const CATEGORIES_STORAGE_KEY = 'ks_cached_categories';
const COUNTS_STORAGE_KEY = 'ks_cached_user_counts';

export const DEFAULT_LOGO_URL = 'https://efdrzxtxqpwvhnyjpcqk.supabase.co/storage/v1/object/public/keeper-media/uploads/1791285583629_cc9704f6c79a.jpg';

export const DEFAULT_SITE_SETTINGS = {
  site_name: 'Keeper Sports',
  logo_path: DEFAULT_LOGO_URL,
  phone_number: '+961 70 973 086',
  email: 'keepersportlb@gmail.com',
  whatsapp_number: '+961 70 973 086',
  instagram_url: 'https://instagram.com/keepersportlb',
  tiktok_url: 'https://tiktok.com/@keepersportlb',
  location_name: 'Keeper Sports',
  location_address: 'Hanaway Main Street, Tyre, South Lebanon',
  location_url: 'https://maps.app.goo.gl/mffodPxBbR573zzk8',
  location: {
    is_active: true,
    location_name: 'Keeper Sports',
    address: 'Hanaway Main Street, Tyre, South Lebanon',
    store_name: 'Tyre',
    full_address: 'Hanaway Main Street, Tyre, South Lebanon',
    location_url: 'https://maps.app.goo.gl/mffodPxBbR573zzk8',
    phone_number: '+961 70 973 086',
    whatsapp_number: '+961 70 973 086'
  }
};

export function SiteProvider({ children }) {
  // Read initial cache if available for instant zero-latency render, fallback to default settings
  const [siteSettings, setSiteSettings] = useState(() => {
    try {
      const cached = localStorage.getItem(SETTINGS_STORAGE_KEY) || sessionStorage.getItem(SETTINGS_STORAGE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (!parsed.email || parsed.email.includes('support@keepersportlb.com')) {
          parsed.email = 'keepersportlb@gmail.com';
        }
        return parsed;
      }
      return DEFAULT_SITE_SETTINGS;
    } catch {
      return DEFAULT_SITE_SETTINGS;
    }
  });

  const [categories, setCategories] = useState(() => {
    try {
      const cached = localStorage.getItem(CATEGORIES_STORAGE_KEY) || sessionStorage.getItem(CATEGORIES_STORAGE_KEY);
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  });

  const [counts, setCounts] = useState(() => {
    try {
      const cached = localStorage.getItem(COUNTS_STORAGE_KEY) || sessionStorage.getItem(COUNTS_STORAGE_KEY);
      const parsed = cached ? JSON.parse(cached) : { cart: 0, favorites: 0, orders: 0, notifications: 0 };
      const localOrders = getGuestOrders().filter((o) => !getHiddenOrderIds().includes(o.id));
      if ((!parsed.orders || parsed.orders === 0) && localOrders.length > 0) {
        parsed.orders = localOrders.length;
      }
      return parsed;
    } catch {
      return { cart: 0, favorites: 0, orders: 0, notifications: 0 };
    }
  });

  const [isInitialized, setIsInitialized] = useState(false);

  // Fetch Settings
  const refreshSettings = useCallback(async () => {
    try {
      const res = await contentApi.getSiteSettings();
      if (res?.success && res.settings) {
        const merged = { ...DEFAULT_SITE_SETTINGS, ...res.settings };
        if (!merged.logo_path) merged.logo_path = DEFAULT_LOGO_URL;
        setSiteSettings(merged);
        try {
          localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(merged));
          sessionStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(merged));
        } catch {}
      }
    } catch (err) {
      console.warn('SiteContext: Failed to load site settings', err);
    }
  }, []);

  // Fetch Categories
  const refreshCategories = useCallback(async () => {
    try {
      const res = await contentApi.getCategories();
      if (res?.success && Array.isArray(res.categories)) {
        setCategories(res.categories);
        try {
          localStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(res.categories));
          sessionStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(res.categories));
        } catch {}
      }
    } catch (err) {
      console.warn('SiteContext: Failed to load categories', err);
    }
  }, []);

  // Fetch User Counts
  const refreshCounts = useCallback(async () => {
    try {
      const res = await contentApi.getUserCounts();
      if (res?.success && res.counts) {
        const updated = { ...res.counts };
        try {
          const localOrders = getGuestOrders().filter((o) => !getHiddenOrderIds().includes(o.id));
          if ((!updated.orders || updated.orders === 0) && localOrders.length > 0) {
            updated.orders = localOrders.length;
          }
        } catch {}
        setCounts(updated);
        try {
          sessionStorage.setItem(COUNTS_STORAGE_KEY, JSON.stringify(updated));
          localStorage.setItem(COUNTS_STORAGE_KEY, JSON.stringify(updated));
        } catch {}
      }
    } catch (err) {
      console.warn('SiteContext: Failed to load user counts', err);
    }
  }, []);

  // In-memory zero-latency count updates from mutation responses
  const updateCartCount = useCallback((newCartCount) => {
    if (typeof newCartCount !== 'number') return;
    setCounts((prev) => {
      const updated = { ...prev, cart: newCartCount };
      try {
        sessionStorage.setItem(COUNTS_STORAGE_KEY, JSON.stringify(updated));
        localStorage.setItem(COUNTS_STORAGE_KEY, JSON.stringify(updated));
      } catch {}
      return updated;
    });
  }, []);

  const updateFavoritesCount = useCallback((newFavCount) => {
    if (typeof newFavCount !== 'number') return;
    setCounts((prev) => {
      const updated = { ...prev, favorites: newFavCount };
      try {
        sessionStorage.setItem(COUNTS_STORAGE_KEY, JSON.stringify(updated));
        localStorage.setItem(COUNTS_STORAGE_KEY, JSON.stringify(updated));
      } catch {}
      return updated;
    });
  }, []);

  const updateOrdersCount = useCallback((newOrdersCount) => {
    if (typeof newOrdersCount !== 'number') return;
    setCounts((prev) => {
      const updated = { ...prev, orders: newOrdersCount };
      try {
        sessionStorage.setItem(COUNTS_STORAGE_KEY, JSON.stringify(updated));
        localStorage.setItem(COUNTS_STORAGE_KEY, JSON.stringify(updated));
      } catch {}
      return updated;
    });
  }, []);

  // Initial fetch on mount - run in parallel once
  useEffect(() => {
    let isMounted = true;
    Promise.all([
      contentApi.getSiteSettings(),
      contentApi.getCategories(),
      contentApi.getUserCounts()
    ])
      .then(([settingsRes, catsRes, countsRes]) => {
        if (!isMounted) return;
        if (settingsRes?.success && settingsRes.settings) {
          const merged = { ...DEFAULT_SITE_SETTINGS, ...settingsRes.settings };
          if (!merged.logo_path) merged.logo_path = DEFAULT_LOGO_URL;
          if (!merged.email || merged.email.includes('support@keepersportlb.com')) {
            merged.email = 'keepersportlb@gmail.com';
          }
          if (!merged.location_address || merged.location_address.includes('Beirut')) {
            merged.location_address = 'Hanaway Main Street, Tyre, South Lebanon';
          }
          setSiteSettings(merged);
          try {
            localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(merged));
            sessionStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(merged));
          } catch {}
        }
        if (catsRes?.success && Array.isArray(catsRes.categories)) {
          setCategories(catsRes.categories);
          try {
            localStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(catsRes.categories));
            sessionStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(catsRes.categories));
          } catch {}
        }
        if (countsRes?.success && countsRes.counts) {
          setCounts(countsRes.counts);
          try {
            localStorage.setItem(COUNTS_STORAGE_KEY, JSON.stringify(countsRes.counts));
            sessionStorage.setItem(COUNTS_STORAGE_KEY, JSON.stringify(countsRes.counts));
          } catch {}
        }
      })
      .catch((err) => {
        console.warn('SiteContext initialization error:', err);
      })
      .finally(() => {
        if (isMounted) setIsInitialized(true);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const value = {
    siteSettings,
    categories,
    counts,
    isInitialized,
    refreshSettings,
    refreshCategories,
    refreshCounts,
    updateCartCount,
    updateFavoritesCount,
    updateOrdersCount,
    deliveryFee: Number(siteSettings?.delivery_fee || 0),
    printingPrice: Number(siteSettings?.printing_price || 0),
    badgePrice: Number(siteSettings?.badge_price || 0)
  };

  return <SiteContext.Provider value={value}>{children}</SiteContext.Provider>;
}

export function useSite() {
  const ctx = useContext(SiteContext);
  if (!ctx) {
    // Graceful fallback for components used outside Provider (e.g. isolated tests)
    return {
      siteSettings: null,
      categories: [],
      counts: { cart: 0, favorites: 0, orders: 0, notifications: 0 },
      isInitialized: true,
      refreshSettings: async () => {},
      refreshCategories: async () => {},
      refreshCounts: async () => {},
      deliveryFee: 0,
      printingPrice: 0,
      badgePrice: 0
    };
  }
  return ctx;
}
