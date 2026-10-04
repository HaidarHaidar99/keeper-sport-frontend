/**
 * Keeper Sports Content API Client
 * Provides dynamic site settings, hero slides, offer bars, categories, and user counts.
 */

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
  const headers = {
    'Content-Type': 'application/json',
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

export const contentApi = {
  async getSiteSettings() {
    return safeRequest(`${API_BASE}/site-settings`);
  },

  async getHeroSlides() {
    return safeRequest(`${API_BASE}/hero-slides`);
  },

  async getOfferBars() {
    return safeRequest(`${API_BASE}/offer-bars`);
  },

  async getCategories() {
    return safeRequest(`${API_BASE}/categories`);
  },

  async getUserCounts() {
    return safeRequest(`${API_BASE}/user/counts`);
  }
};
