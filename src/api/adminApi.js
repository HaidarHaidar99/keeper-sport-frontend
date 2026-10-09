/**
 * Keeper Sports Admin API Client
 * Interacts with /api/admin endpoints protected by requireAdmin
 */

const getApiBase = () => {
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl) {
    const clean = envUrl.replace(/\/+$/, '');
    return clean.endsWith('/api') ? clean : `${clean}/api`;
  }
  return 'https://keeper-sport-backend.vercel.app/api';
};

const API_BASE = `${getApiBase()}/admin`;

async function adminRequest(url, options = {}) {
  const isFormData = options.body instanceof FormData;
  const adminToken = localStorage.getItem('ks_admin_token');
  const authHeaders = adminToken ? { Authorization: `Bearer ${adminToken}` } : {};

  const headers = isFormData
    ? { ...authHeaders, ...(options.headers || {}) }
    : {
        'Content-Type': 'application/json',
        ...authHeaders,
        ...(options.headers || {})
      };

  try {
    const res = await fetch(url, {
      ...options,
      headers,
      credentials: 'include'
    });

    const text = await res.text();
    let data = null;
    try {
      data = JSON.parse(text);
    } catch {
      // Non-JSON response (e.g. Vercel 413 HTML or 504 gateway timeout)
      if (res.status === 413) {
        return { success: false, status: 413, message: 'Upload size too large. Please choose an image under 4MB.' };
      }
      if (res.status === 401) {
        return { success: false, status: 401, message: 'Your admin session has expired. Please sign in again.' };
      }
      if (res.status === 504) {
        return { success: false, status: 504, message: 'Server request timed out. Please try again.' };
      }
      if (!res.ok) {
        return { success: false, status: res.status, message: `Server error (HTTP ${res.status}). Please try again.` };
      }
      return { success: false, message: 'Invalid response format from server.' };
    }

    if (!res.ok) {
      if (res.status === 401) {
        return { success: false, status: 401, message: 'Your admin session has expired. Please sign in again.' };
      }
      if (res.status === 413) {
        return { success: false, status: 413, message: 'Upload size too large. Please choose an image under 4MB.' };
      }
      return {
        success: false,
        status: res.status,
        message: data.message || `Server error (HTTP ${res.status})`
      };
    }

    return data;
  } catch (err) {
    console.warn(`Admin API request to ${url} failed:`, err.message);
    const isOffline = typeof navigator !== 'undefined' && !navigator.onLine;
    const msg = isOffline
      ? 'No internet connection detected. Please check your network.'
      : (err.message && !err.message.includes('fetch')
          ? `Request failed: ${err.message}`
          : 'Could not reach server. Please check your connection and try again.');
    return { success: false, error: err.message, message: msg };
  }
}

export const adminApi = {
  // 1. Dashboard
  async getDashboard() {
    return adminRequest(`${API_BASE}/dashboard`);
  },

  // 2. Media Upload
  async uploadMedia(file) {
    const formData = new FormData();
    formData.append('file', file);
    return adminRequest(`${API_BASE}/upload`, {
      method: 'POST',
      body: formData
    });
  },

  // 3. Home Management
  async getHomeOverview() {
    return adminRequest(`${API_BASE}/home/overview`);
  },

  async getHeroSlides() {
    return adminRequest(`${API_BASE}/hero-slides`);
  },

  async createHeroSlide(data) {
    return adminRequest(`${API_BASE}/hero-slides`, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  async updateHeroSlide(id, data) {
    return adminRequest(`${API_BASE}/hero-slides/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  },

  async deleteHeroSlide(id) {
    return adminRequest(`${API_BASE}/hero-slides/${id}`, {
      method: 'DELETE'
    });
  },

  async getOfferBars() {
    return adminRequest(`${API_BASE}/offer-bars`);
  },

  async createOfferBar(data) {
    return adminRequest(`${API_BASE}/offer-bars`, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  async updateOfferBar(id, data) {
    return adminRequest(`${API_BASE}/offer-bars/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  },

  async deleteOfferBar(id) {
    return adminRequest(`${API_BASE}/offer-bars/${id}`, {
      method: 'DELETE'
    });
  },

  // 4. Site Settings
  async getSettings() {
    return adminRequest(`${API_BASE}/settings`);
  },

  async updateSettings(data) {
    return adminRequest(`${API_BASE}/settings`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  },

  // 4a. Homepage Story (After-Hero Cinematic Section)
  async getHomepageStory() {
    return adminRequest(`${API_BASE}/homepage-story`);
  },

  async updateHomepageStory(data) {
    return adminRequest(`${API_BASE}/homepage-story`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  },

  // 4b. Location Settings
  async getLocationSettings() {
    return adminRequest(`${API_BASE}/location`);
  },

  async updateLocationSettings(data) {
    return adminRequest(`${API_BASE}/location`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  },

  // 4c. Social Media Settings
  async getSocialSettings() {
    return adminRequest(`${API_BASE}/social-media`);
  },

  async updateSocialSettings(data) {
    return adminRequest(`${API_BASE}/social-media`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  },

  // 4d. Offers & Promotions Management
  async getOffers() {
    return adminRequest(`${API_BASE}/offers`);
  },

  async createOffer(data) {
    return adminRequest(`${API_BASE}/offers`, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  async updateOffer(id, data) {
    return adminRequest(`${API_BASE}/offers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  },

  async deleteOffer(id) {
    return adminRequest(`${API_BASE}/offers/${id}`, {
      method: 'DELETE'
    });
  },

  // 5. Products Management
  async getProductsOverview() {
    return adminRequest(`${API_BASE}/products/overview`);
  },

  async getProducts(params = {}) {
    const qs = new URLSearchParams();
    if (params.page) qs.append('page', params.page);
    if (params.limit) qs.append('limit', params.limit);
    if (params.search) qs.append('search', params.search);
    if (params.category) qs.append('category', params.category);
    if (params.status) qs.append('status', params.status);

    const query = qs.toString();
    return adminRequest(`${API_BASE}/products${query ? `?${query}` : ''}`);
  },

  async getProduct(id) {
    return adminRequest(`${API_BASE}/products/${id}`);
  },

  async createProduct(data) {
    return adminRequest(`${API_BASE}/products`, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  async updateProduct(id, data) {
    return adminRequest(`${API_BASE}/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  },

  async deleteProduct(id) {
    return adminRequest(`${API_BASE}/products/${id}`, {
      method: 'DELETE'
    });
  },

  // 6. Categories Management
  async getCategories() {
    return adminRequest(`${API_BASE}/categories`);
  },

  async createCategory(data) {
    return adminRequest(`${API_BASE}/categories`, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  async updateCategory(id, data) {
    return adminRequest(`${API_BASE}/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  },

  async deleteCategory(id) {
    return adminRequest(`${API_BASE}/categories/${id}`, {
      method: 'DELETE'
    });
  },

  // 7. Orders Management
  async getOrders(params = {}) {
    const qs = new URLSearchParams();
    if (params.page) qs.append('page', params.page);
    if (params.limit) qs.append('limit', params.limit);
    if (params.status) qs.append('status', params.status);
    if (params.search) qs.append('search', params.search);

    const query = qs.toString();
    return adminRequest(`${API_BASE}/orders${query ? `?${query}` : ''}`);
  },

  async updateOrderStatus(id, status, message = null) {
    return adminRequest(`${API_BASE}/orders/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, message })
    });
  },

  // 8. Users Management
  async getUsers(params = {}) {
    const qs = new URLSearchParams();
    if (params.page) qs.append('page', params.page);
    if (params.limit) qs.append('limit', params.limit);
    if (params.role) qs.append('role', params.role);
    if (params.search) qs.append('search', params.search);

    const query = qs.toString();
    return adminRequest(`${API_BASE}/users${query ? `?${query}` : ''}`);
  },

  async updateUserRole(id, role) {
    return adminRequest(`${API_BASE}/users/${id}/role`, {
      method: 'PATCH',
      body: JSON.stringify({ role })
    });
  },

  // 9. Reviews Management
  async getReviews(params = {}) {
    const qs = new URLSearchParams();
    if (params.page) qs.append('page', params.page);
    if (params.limit) qs.append('limit', params.limit);

    const query = qs.toString();
    return adminRequest(`${API_BASE}/reviews${query ? `?${query}` : ''}`);
  },

  async toggleReviewVisibility(id, is_visible) {
    return adminRequest(`${API_BASE}/reviews/${id}/visibility`, {
      method: 'PATCH',
      body: JSON.stringify({ is_visible })
    });
  },

  async deleteReview(id) {
    return adminRequest(`${API_BASE}/reviews/${id}`, {
      method: 'DELETE'
    });
  },

  // 10. Notifications Management
  async getNotifications() {
    return adminRequest(`${API_BASE}/notifications`);
  },

  async markNotificationRead(id) {
    return adminRequest(`${API_BASE}/notifications/${id}/read`, {
      method: 'PATCH'
    });
  },

  async markAllNotificationsRead() {
    return adminRequest(`${API_BASE}/notifications/mark-all-read`, {
      method: 'POST'
    });
  },

  // 11. Contact Forms Management
  async getForms(params = {}) {
    const qs = new URLSearchParams();
    if (params.page) qs.append('page', params.page);
    if (params.limit) qs.append('limit', params.limit);
    if (params.search) qs.append('search', params.search);
    if (params.status) qs.append('status', params.status);

    const query = qs.toString();
    return adminRequest(`${API_BASE}/forms${query ? `?${query}` : ''}`);
  },

  async markFormRead(id) {
    return adminRequest(`${API_BASE}/forms/${id}/read`, {
      method: 'PATCH'
    });
  },

  async deleteForm(id) {
    return adminRequest(`${API_BASE}/forms/${id}`, {
      method: 'DELETE'
    });
  }
};
