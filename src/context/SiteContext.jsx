import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { contentApi } from '../api/contentApi';

const SiteContext = createContext(null);

const SETTINGS_STORAGE_KEY = 'ks_cached_site_settings';
const CATEGORIES_STORAGE_KEY = 'ks_cached_categories';
const COUNTS_STORAGE_KEY = 'ks_cached_user_counts';

export function SiteProvider({ children }) {
  // Read initial cache if available for instant zero-latency render
  const [siteSettings, setSiteSettings] = useState(() => {
    try {
      const cached = sessionStorage.getItem(SETTINGS_STORAGE_KEY);
      return cached ? JSON.parse(cached) : null;
    } catch {
      return null;
    }
  });

  const [categories, setCategories] = useState(() => {
    try {
      const cached = sessionStorage.getItem(CATEGORIES_STORAGE_KEY);
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  });

  const [counts, setCounts] = useState(() => {
    try {
      const cached = sessionStorage.getItem(COUNTS_STORAGE_KEY);
      return cached ? JSON.parse(cached) : { cart: 0, favorites: 0, orders: 0, notifications: 0 };
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
        setSiteSettings(res.settings);
        try {
          sessionStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(res.settings));
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
        setCounts(res.counts);
        try {
          sessionStorage.setItem(COUNTS_STORAGE_KEY, JSON.stringify(res.counts));
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
          setSiteSettings(settingsRes.settings);
          try {
            sessionStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settingsRes.settings));
          } catch {}
        }
        if (catsRes?.success && Array.isArray(catsRes.categories)) {
          setCategories(catsRes.categories);
          try {
            sessionStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(catsRes.categories));
          } catch {}
        }
        if (countsRes?.success && countsRes.counts) {
          setCounts(countsRes.counts);
          try {
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
