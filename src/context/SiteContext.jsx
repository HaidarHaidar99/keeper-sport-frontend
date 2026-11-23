import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { contentApi } from '../api/contentApi';
import { productApi } from '../api/productApi';
import { useAuth } from './AuthContext';
import {
  getGuestOrders,
  getHiddenOrderIds,
  getLocalFavoriteIds,
  setLocalFavoriteIds,
  clearLocalFavorites
} from '../utils/guestIdentity';

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

function normalizeIdList(ids) {
  if (!Array.isArray(ids)) return [];
  return Array.from(new Set(ids.filter((id) => id != null && id !== '').map(String)));
}

export function SiteProvider({ children }) {
  const { user, loading: authLoading } = useAuth();

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

  // Single source of truth for favorited product IDs across the entire app
  const [favoriteIds, setFavoriteIds] = useState(() => normalizeIdList(getLocalFavoriteIds()));
  const favoriteIdsRef = useRef(favoriteIds);
  const pendingFavTogglesRef = useRef(new Set());

  const [counts, setCounts] = useState(() => {
    try {
      const cached = localStorage.getItem(COUNTS_STORAGE_KEY) || sessionStorage.getItem(COUNTS_STORAGE_KEY);
      const parsed = cached ? JSON.parse(cached) : { cart: 0, favorites: 0, orders: 0, notifications: 0 };
      const localOrders = getGuestOrders().filter((o) => !getHiddenOrderIds().includes(o.id));
      if ((!parsed.orders || parsed.orders === 0) && localOrders.length > 0) {
        parsed.orders = localOrders.length;
      }
      parsed.favorites = favoriteIdsRef.current.length;
      return parsed;
    } catch {
      return { cart: 0, favorites: favoriteIdsRef.current.length, orders: 0, notifications: 0 };
    }
  });

  const [isInitialized, setIsInitialized] = useState(false);

  const persistCounts = useCallback((updated) => {
    try {
      sessionStorage.setItem(COUNTS_STORAGE_KEY, JSON.stringify(updated));
      localStorage.setItem(COUNTS_STORAGE_KEY, JSON.stringify(updated));
    } catch {}
  }, []);

  // Atomically replace favorite IDs and keep ref, localStorage, and counts.favorites strictly in sync
  const replaceFavoriteIds = useCallback(
    (ids, { persist = true } = {}) => {
      const normalized = normalizeIdList(ids);
      favoriteIdsRef.current = normalized;
      setFavoriteIds(normalized);
      if (persist) {
        setLocalFavoriteIds(normalized);
      }
      setCounts((prev) => {
        const updated = { ...prev, favorites: normalized.length };
        persistCounts(updated);
        return updated;
      });
      return normalized;
    },
    [persistCounts]
  );

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

  // Fetch authoritative favorite IDs from backend (replaces stale local cache)
  const refreshFavorites = useCallback(async () => {
    try {
      const res = await productApi.getUserFavoriteIds();
      if (res?.success) {
        const raw = res.favoriteIds || res.ids || [];
        if (pendingFavTogglesRef.current.size === 0) {
          replaceFavoriteIds(raw);
        }
      }
    } catch (err) {
      console.warn('SiteContext: Failed to sync favorites', err);
    }
  }, [replaceFavoriteIds]);

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
        // Always keep favorites count strictly matching favoriteIds
        updated.favorites = favoriteIdsRef.current.length;
        setCounts(updated);
        persistCounts(updated);
      }
    } catch (err) {
      console.warn('SiteContext: Failed to load user counts', err);
    }
  }, [persistCounts]);

  // In-memory zero-latency count updates from mutation responses
  const updateCartCount = useCallback(
    (newCartCount) => {
      if (typeof newCartCount !== 'number') return;
      setCounts((prev) => {
        const updated = { ...prev, cart: newCartCount };
        persistCounts(updated);
        return updated;
      });
    },
    [persistCounts]
  );

  const updateFavoritesCount = useCallback(
    (newFavCount) => {
      if (typeof newFavCount !== 'number') return;
      setCounts((prev) => {
        const updated = { ...prev, favorites: Math.max(0, newFavCount) };
        persistCounts(updated);
        return updated;
      });
    },
    [persistCounts]
  );

  const updateOrdersCount = useCallback(
    (newOrdersCount) => {
      if (typeof newOrdersCount !== 'number') return;
      setCounts((prev) => {
        const updated = { ...prev, orders: newOrdersCount };
        persistCounts(updated);
        return updated;
      });
    },
    [persistCounts]
  );

  const isFavorite = useCallback(
    (productOrId) => {
      if (!productOrId) return false;
      if (typeof productOrId === 'object') {
        const idStr = productOrId.id != null ? String(productOrId.id) : null;
        const slugStr = productOrId.slug ? String(productOrId.slug) : null;
        return Boolean((idStr && favoriteIds.includes(idStr)) || (slugStr && favoriteIds.includes(slugStr)));
      }
      return favoriteIds.includes(String(productOrId));
    },
    [favoriteIds]
  );

  const registerFavorite = useCallback(
    (productId) => {
      if (!productId) return;
      const idStr = String(productId);
      if (favoriteIdsRef.current.includes(idStr)) return;
      replaceFavoriteIds([...favoriteIdsRef.current, idStr]);
    },
    [replaceFavoriteIds]
  );

  const clearAllFavorites = useCallback(async () => {
    replaceFavoriteIds([], { persist: false });
    clearLocalFavorites();
    try {
      await productApi.clearFavorites();
    } catch (e) {
      console.warn('Could not clear favorites on backend:', e);
    }
  }, [replaceFavoriteIds]);

  const toggleFavorite = useCallback(
    async (productId) => {
      if (!productId) return { success: false, isFavorited: false };
      const idStr = String(productId);

      // Prevent duplicate concurrent toggles on the same product
      if (pendingFavTogglesRef.current.has(idStr)) {
        return { success: true, isFavorited: favoriteIdsRef.current.includes(idStr) };
      }

      const wasFav = favoriteIdsRef.current.includes(idStr);
      const willBeFav = !wasFav;
      const optimisticNext = willBeFav
        ? [...favoriteIdsRef.current, idStr]
        : favoriteIdsRef.current.filter((id) => id !== idStr);

      pendingFavTogglesRef.current.add(idStr);

      // 1. Synchronous Instant Zero-Latency Optimistic Update (outside any setState updater)
      replaceFavoriteIds(optimisticNext);

      // 2. Authoritative Server Sync with explicit action ('add' | 'remove')
      try {
        let res = await productApi.toggleFavorite(productId, willBeFav ? 'add' : 'remove');

        // Compatibility safeguard: if a backend without `action` support was out of sync and toggled the wrong way, toggle once more
        if (res?.success && typeof res.isFavorited === 'boolean' && res.isFavorited !== willBeFav) {
          res = await productApi.toggleFavorite(productId, willBeFav ? 'add' : 'remove');
        }

        if (res && res.success) {
          if (Array.isArray(res.favoriteIds)) {
            replaceFavoriteIds(res.favoriteIds);
          } else {
            const finalIsFav = typeof res.isFavorited === 'boolean' ? res.isFavorited : willBeFav;
            const current = favoriteIdsRef.current;
            const reconciled = finalIsFav
              ? [...current, idStr]
              : current.filter((id) => id !== idStr);
            replaceFavoriteIds(reconciled);
          }
          return {
            success: true,
            isFavorited: typeof res.isFavorited === 'boolean' ? res.isFavorited : willBeFav,
            favoritesCount: favoriteIdsRef.current.length
          };
        }

        // Revert on server failure
        const reverted = wasFav
          ? [...favoriteIdsRef.current, idStr]
          : favoriteIdsRef.current.filter((id) => id !== idStr);
        replaceFavoriteIds(reverted);
        return { success: false, isFavorited: wasFav, message: res?.message || 'Failed to update favorite.' };
      } catch {
        const reverted = wasFav
          ? [...favoriteIdsRef.current, idStr]
          : favoriteIdsRef.current.filter((id) => id !== idStr);
        replaceFavoriteIds(reverted);
        return { success: false, isFavorited: wasFav, message: 'Network error updating favorite.' };
      } finally {
        pendingFavTogglesRef.current.delete(idStr);
      }
    },
    [replaceFavoriteIds]
  );

  // Sync favorites & user counts whenever auth identity is ready or changes (login / logout)
  useEffect(() => {
    if (authLoading) return;
    let isMounted = true;

    Promise.all([
      productApi.getUserFavoriteIds(),
      contentApi.getUserCounts()
    ])
      .then(([favRes, countsRes]) => {
        if (!isMounted) return;

        let syncedFavIds = favoriteIdsRef.current;
        if (favRes?.success && pendingFavTogglesRef.current.size === 0) {
          const raw = favRes.favoriteIds || favRes.ids || [];
          syncedFavIds = replaceFavoriteIds(raw);
        }

        if (countsRes?.success && countsRes.counts) {
          const updatedCounts = { ...countsRes.counts };
          try {
            const localOrders = getGuestOrders().filter((o) => !getHiddenOrderIds().includes(o.id));
            if ((!updatedCounts.orders || updatedCounts.orders === 0) && localOrders.length > 0) {
              updatedCounts.orders = localOrders.length;
            }
          } catch {}
          updatedCounts.favorites = syncedFavIds.length;
          setCounts(updatedCounts);
          persistCounts(updatedCounts);
        }
      })
      .catch(() => {});

    return () => {
      isMounted = false;
    };
  }, [authLoading, user?.id, replaceFavoriteIds, persistCounts]);

  // Listen for external cross-component favorite updates (e.g. clearLocalFavorites)
  useEffect(() => {
    const handleFavUpdated = (e) => {
      const ids = e.detail?.favoriteIds;
      if (Array.isArray(ids)) {
        replaceFavoriteIds(ids, { persist: false });
      }
    };
    window.addEventListener('ks:favorites_updated', handleFavUpdated);
    return () => window.removeEventListener('ks:favorites_updated', handleFavUpdated);
  }, [replaceFavoriteIds]);

  // Initial public site data fetch on mount
  useEffect(() => {
    let isMounted = true;
    Promise.all([
      contentApi.getSiteSettings(),
      contentApi.getCategories()
    ])
      .then(([settingsRes, catsRes]) => {
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
    favoriteIds,
    isFavorite,
    toggleFavorite,
    registerFavorite,
    replaceFavoriteIds,
    refreshFavorites,
    clearAllFavorites,
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
      favoriteIds: [],
      isFavorite: () => false,
      toggleFavorite: async () => ({ success: false, isFavorited: false }),
      replaceFavoriteIds: () => [],
      refreshFavorites: async () => {},
      clearAllFavorites: async () => {},
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
