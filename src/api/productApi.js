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

export const productApi = {
  /**
   * Query catalog products with filters, search, sort, pagination
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
    const url = `${API_BASE}/products${qs ? `?${qs}` : ''}`;
    return safeRequest(url);
  },

  /**
   * Query dynamic featured rail products
   */
  async getFeaturedProducts(limit = 10) {
    return safeRequest(`${API_BASE}/products/featured?limit=${limit}`);
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
