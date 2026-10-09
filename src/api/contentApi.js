/**
 * Keeper Sports Content API Client
 * Provides dynamic site settings, hero slides, offer bars, categories, and user counts.
 */

import { getOrCreateGuestId, getGuestOrderTokens } from '../utils/guestIdentity';

const getApiBase = () => {
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl) {
    const clean = envUrl.replace(/\/+$/, '');
    return clean.endsWith('/api') ? clean : `${clean}/api`;
  }
  return 'https://keeper-sport-backend.vercel.app/api';
};

const API_BASE = getApiBase();

async function safeRequest(url, options = {}) {
  const guestId = getOrCreateGuestId();
  const guestTokens = getGuestOrderTokens();

  const headers = {
    'Content-Type': 'application/json',
    'x-guest-identifier': guestId,
    'x-guest-order-tokens': JSON.stringify(guestTokens),
    ...(options.headers || {})
  };

  try {
    const res = await fetch(url, {
      ...options,
      headers,
      credentials: 'include'
    });

    const text = await res.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      return { success: false, data: null };
    }

    if (!res.ok) {
      return { success: false, message: data.message || `HTTP ${res.status}` };
    }

    return data;
  } catch (err) {
    console.warn(`Content API request to ${url} failed:`, err.message);
    return { success: false, error: err.message };
  }
}

let categoriesCache = { data: null, timestamp: 0 };
let heroSlidesCache = { data: null, timestamp: 0 };
const CONTENT_CACHE_TTL = 60 * 1000;

function preloadImages(urls) {
  if (typeof window === 'undefined' || !Array.isArray(urls)) return;
  urls.forEach((url) => {
    if (url && typeof url === 'string') {
      const img = new Image();
      img.src = url;
    }
  });
}

export const contentApi = {
  async getSiteSettings() {
    return safeRequest(`${API_BASE}/site-settings`);
  },

  async getHeroSlides() {
    const now = Date.now();
    if (heroSlidesCache.data && now - heroSlidesCache.timestamp < CONTENT_CACHE_TTL) {
      return heroSlidesCache.data;
    }
    const res = await safeRequest(`${API_BASE}/hero-slides`);
    if (res?.success && Array.isArray(res.slides)) {
      heroSlidesCache = { data: res, timestamp: now };
      preloadImages(res.slides.map((s) => s.media_path));
    }
    return res;
  },

  async getOfferBars() {
    return safeRequest(`${API_BASE}/offer-bars`);
  },

  async getCategories() {
    const now = Date.now();
    if (categoriesCache.data && now - categoriesCache.timestamp < CONTENT_CACHE_TTL) {
      return categoriesCache.data;
    }
    const res = await safeRequest(`${API_BASE}/categories`);
    if (res?.success && Array.isArray(res.categories)) {
      categoriesCache = { data: res, timestamp: now };
      preloadImages(res.categories.map((c) => c.image_path));
    }
    return res;
  },

  async getUserCounts() {
    return safeRequest(`${API_BASE}/user/counts`);
  },

  async getOffers() {
    return safeRequest(`${API_BASE}/offers`);
  },

  async getReviews() {
    return safeRequest(`${API_BASE}/reviews`);
  },

  async submitContact(formData) {
    return safeRequest(`${API_BASE}/contact`, {
      method: 'POST',
      body: JSON.stringify(formData)
    });
  },

  async getNotifications() {
    return safeRequest(`${API_BASE}/notifications`);
  },

  async markNotificationRead(id) {
    return safeRequest(`${API_BASE}/notifications/${id}/read`, {
      method: 'PATCH'
    });
  },

  async markAllNotificationsRead() {
    return safeRequest(`${API_BASE}/notifications/mark-all-read`, {
      method: 'POST'
    });
  },

  async getHomepageStory() {
    return safeRequest(`${API_BASE}/homepage-story`);
  },

  async getLocationSettings() {
    return safeRequest(`${API_BASE}/location`);
  },

  async getSocialSettings() {
    return safeRequest(`${API_BASE}/social-media`);
  }
};
