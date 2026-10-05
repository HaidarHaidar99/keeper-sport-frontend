/**
 * Keeper Sports Product, Favorites, and Cart API Client
 * Interacts with real backend endpoints:
 * /api/products
 * /api/products/featured
 * /api/products/:slugOrId
 * /api/favorites/toggle
 * /api/favorites/ids
 * /api/cart
 * /api/cart/add
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
   * Toggle product favorite (requires login)
   */
  async toggleFavorite(productId) {
    return safeRequest(`${API_BASE}/favorites/toggle`, {
      method: 'POST',
      body: JSON.stringify({ productId })
    });
  },

  /**
   * Get user favorited product IDs
   */
  async getUserFavoriteIds() {
    return safeRequest(`${API_BASE}/favorites/ids`);
  },

  /**
   * Add product to cart
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
  }
};
