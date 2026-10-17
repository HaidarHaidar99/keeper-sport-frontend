/**
 * Keeper Sports API Client
 * Configured for production deployment at keeper-sport-backend.vercel.app
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
  const token = localStorage.getItem('ks_customer_token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {})
  };

  const res = await fetch(url, {
    ...options,
    headers,
    credentials: 'include'
  });

  const text = await res.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch (err) {
    if (!res.ok) {
      throw new Error(`Server returned ${res.status}. Please check backend service.`);
    }
    throw new Error('Received unexpected response format from server.');
  }

  if (!res.ok) {
    const error = new Error(data?.message || `Request failed with status ${res.status}`);
    if (data && typeof data === 'object') {
      Object.assign(error, data);
    }
    error.status = res.status;
    throw error;
  }

  return data;
}

export const authApi = {
  async register({ full_name, email, password, confirm_password }) {
    return safeRequest(`${API_BASE}/auth/register`, {
      method: 'POST',
      body: JSON.stringify({ full_name, email, password, confirm_password })
    });
  },

  async login({ email, password }) {
    return safeRequest(`${API_BASE}/auth/login`, {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
  },

  async adminLogin({ email, password }) {
    return safeRequest(`${API_BASE}/auth/admin/login`, {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
  },

  async adminLogout() {
    const adminToken = localStorage.getItem('ks_admin_token');
    const headers = adminToken ? { Authorization: `Bearer ${adminToken}` } : {};
    return safeRequest(`${API_BASE}/auth/admin/logout`, {
      method: 'POST',
      headers
    });
  },

  async getAdminMe() {
    const adminToken = localStorage.getItem('ks_admin_token');
    const headers = adminToken ? { Authorization: `Bearer ${adminToken}` } : {};
    return safeRequest(`${API_BASE}/auth/admin/me`, {
      method: 'GET',
      headers
    });
  },

  async googleAuth(credential) {
    return safeRequest(`${API_BASE}/auth/google`, {
      method: 'POST',
      body: JSON.stringify({ credential })
    });
  },

  async logout() {
    return safeRequest(`${API_BASE}/auth/logout`, {
      method: 'POST'
    });
  },

  async getMe() {
    return safeRequest(`${API_BASE}/auth/me`, {
      method: 'GET'
    });
  },

  async updateProfile({ full_name }) {
    return safeRequest(`${API_BASE}/auth/profile`, {
      method: 'PUT',
      body: JSON.stringify({ full_name })
    });
  },

  async changePassword({ current_password, new_password, confirm_password }) {
    return safeRequest(`${API_BASE}/auth/change-password`, {
      method: 'POST',
      body: JSON.stringify({ current_password, new_password, confirm_password })
    });
  },

  async verifyEmail(token) {
    return safeRequest(`${API_BASE}/auth/verify-email`, {
      method: 'POST',
      body: JSON.stringify({ token })
    });
  },

  async resendVerification(email) {
    return safeRequest(`${API_BASE}/auth/resend-verification`, {
      method: 'POST',
      body: JSON.stringify({ email })
    });
  },

  async forgotPassword(email) {
    return safeRequest(`${API_BASE}/auth/forgot-password`, {
      method: 'POST',
      body: JSON.stringify({ email })
    });
  },

  async verifyResetToken(token) {
    return safeRequest(`${API_BASE}/auth/verify-reset-token?token=${encodeURIComponent(token)}`, {
      method: 'GET'
    });
  },

  async resetPassword({ token, password, confirm_password }) {
    return safeRequest(`${API_BASE}/auth/reset-password`, {
      method: 'POST',
      body: JSON.stringify({ token, password, confirm_password })
    });
  }
};
