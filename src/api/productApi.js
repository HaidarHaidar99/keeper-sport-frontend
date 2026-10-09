/**
 * Keeper Sports Product, Favorites, Cart, and Orders API Client
 * Interacts with real backend endpoints:
 * /api/products
 * /api/products/featured
 * /api/products/:slugOrId
 * /api/favorites/toggle
 * /api/favorites/ids
 * /api/cart
 * /api/cart/add
 * /api/cart/items/:itemId (PUT, DELETE)
 * /api/orders
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
      return {
        success: false,
        status: res.status,
        message: data.message || `HTTP ${res.status}`
      };
    }

    return data;
  } catch (err) {
    console.warn(`Product API request to ${url} failed:`, err.message);
    return { success: false, error: err.message };
  }
}

let featuredCache = { data: null, timestamp: 0, limit: 0 };
const FEATURED_CACHE_TTL = 60 * 1000;
const productsMemoryCache = new Map();
const PRODUCTS_CACHE_TTL = 45 * 1000;

export const productApi = {
  /**
   * Query catalog products with filters, search, sort, pagination (cached 45s)
   */
  async getProducts(params = {}) {
    const query = new URLSearchParams();

    if (params.page) query.append('page', params.page);
    if (params.limit) query.append('limit', params.limit);
    if (params.category) query.append('category', params.category);
    if (params.search) query.append('search', params.search);
    if (params.sort) query.append('sort', params.sort);
    if (params.in_stock) query.append('in_stock', 'true');
    if (params.on_sale) query.append('on_sale', 'true');
    if (params.min_price) query.append('min_price', params.min_price);
    if (params.max_price) query.append('max_price', params.max_price);

    const qs = query.toString();
    const cacheKey = qs || 'default';
    const now = Date.now();

    const cachedEntry = productsMemoryCache.get(cacheKey);
    if (cachedEntry && now - cachedEntry.timestamp < PRODUCTS_CACHE_TTL) {
      return cachedEntry.data;
    }

    const url = `${API_BASE}/products${qs ? `?${qs}` : ''}`;
    const res = await safeRequest(url);

    if (res && res.success) {
      productsMemoryCache.set(cacheKey, { data: res, timestamp: now });
    }

    return res;
  },

  /**
   * Query dynamic featured rail products (cached in memory and localStorage for instant 0ms load)
   */
  async getFeaturedProducts(limit = 10) {
    const now = Date.now();
    if (featuredCache.data && featuredCache.limit === limit && now - featuredCache.timestamp < FEATURED_CACHE_TTL) {
      return featuredCache.data;
    }

    // Check localStorage cache if memory cache is empty
    if (!featuredCache.data && typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('ks_cached_featured_products');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) {
            featuredCache = { data: { success: true, products: parsed }, timestamp: now, limit };
          }
        }
      } catch {}
    }

    const res = await safeRequest(`${API_BASE}/products/featured?limit=${limit}`);
    if (res && res.success && Array.isArray(res.products)) {
      featuredCache = { data: res, timestamp: now, limit };
      try {
        localStorage.setItem('ks_cached_featured_products', JSON.stringify(res.products));
        sessionStorage.setItem('ks_cached_featured_products', JSON.stringify(res.products));
      } catch {}
    }
    return res.success ? res : (featuredCache.data || res);
  },

  /**
   * Get single product details
   */
  async getProduct(slugOrId) {
    return safeRequest(`${API_BASE}/products/${slugOrId}`);
  },

  /**
   * Toggle product favorite (guests & users)
   */
  async toggleFavorite(productId) {
    return safeRequest(`${API_BASE}/favorites/toggle`, {
      method: 'POST',
      body: JSON.stringify({ productId })
    });
  },

  /**
   * Get user or guest favorited product IDs
   */
  async getUserFavoriteIds() {
    return safeRequest(`${API_BASE}/favorites/ids`);
  },

  /**
   * Add product to cart (guests & users)
   */
  async addToCart({ productId, variantId = null, quantity = 1, printedName = null, printedNumber = null, badge = null }) {
    return safeRequest(`${API_BASE}/cart/add`, {
      method: 'POST',
      body: JSON.stringify({
        productId,
        variantId,
        quantity,
        printedName,
        printedNumber,
        badge
      })
    });
  },

  /**
   * Fetch current cart state
   */
  async getCart() {
    return safeRequest(`${API_BASE}/cart`);
  },

  /**
   * Update quantity of an item in cart
   */
  async updateCartQuantity(itemId, quantity) {
    return safeRequest(`${API_BASE}/cart/items/${itemId}`, {
      method: 'PUT',
      body: JSON.stringify({ quantity })
    });
  },

  /**
   * Update selected variant (size/color) of an item in cart
   */
  async updateCartItemVariant(itemId, variantId) {
    return safeRequest(`${API_BASE}/cart/items/${itemId}/variant`, {
      method: 'PUT',
      body: JSON.stringify({ variantId })
    });
  },

  /**
   * Remove item from cart
   */
  async removeFromCart(itemId) {
    return safeRequest(`${API_BASE}/cart/items/${itemId}`, {
      method: 'DELETE'
    });
  },

  /**
   * Fetch user or guest orders
   */
  async getUserOrders() {
    return safeRequest(`${API_BASE}/orders`);
  },

  /**
   * Create order
   */
  async createOrder(orderData) {
    return safeRequest(`${API_BASE}/orders`, {
      method: 'POST',
      body: JSON.stringify(orderData)
    });
  },

  /**
   * Clear entire cart (guests & users)
   */
  async clearCart() {
    return safeRequest(`${API_BASE}/cart`, {
      method: 'DELETE'
    });
  },

  /**
   * Clear all favorites (guests & users)
   */
  async clearFavorites() {
    return safeRequest(`${API_BASE}/favorites`, {
      method: 'DELETE'
    });
  },

  /**
   * Customer cancel order (strictly pending orders only)
   */
  async cancelOrder(orderId) {
    return safeRequest(`${API_BASE}/orders/${orderId}/cancel`, {
      method: 'PATCH'
    });
  },

  /**
   * Get single order by id
   */
  async getOrder(orderId) {
    return safeRequest(`${API_BASE}/orders/${orderId}`);
  }
};
