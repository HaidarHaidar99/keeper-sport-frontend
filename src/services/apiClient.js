// Keeper Sports — Unified Fetch API Client
// Handles base URL resolution, credentials, guest tokens, and admin auth headers.

const API_BASE_URL = (import.meta.env.VITE_API_URL || "https://keeper-sport-backend.vercel.app").replace(/\/$/, "");

export const getApiUrl = (endpoint) => {
  const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  return `${API_BASE_URL}/api${cleanEndpoint}`;
};

export const apiClient = async (endpoint, options = {}) => {
  const url = getApiUrl(endpoint);

  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {})
  };

  // If payload is FormData (file upload), remove Content-Type so browser sets boundary
  if (options.body instanceof FormData) {
    delete headers["Content-Type"];
  }

  // Attach guest token if present in localStorage
  const guestToken = localStorage.getItem("ks_guest_token");
  if (guestToken && !headers["X-Guest-Token"]) {
    headers["X-Guest-Token"] = guestToken;
  }

  // Attach admin JWT token if present in localStorage
  const adminToken = localStorage.getItem("ks_admin_token");
  if (adminToken && !headers["Authorization"]) {
    headers["Authorization"] = `Bearer ${adminToken}`;
  }

  const config = {
    ...options,
    headers,
    credentials: "include" // Always include cookies for customer session
  };

  try {
    const response = await fetch(url, config);

    // Handle 204 No Content
    if (response.status === 204) {
      return { success: true };
    }

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      const error = new Error(data.message || data.error || `Request failed with status ${response.status}`);
      error.status = response.status;
      error.details = data;
      throw error;
    }

    return data;
  } catch (err) {
    console.error(`API Error [${endpoint}]:`, err);
    throw err;
  }
};

export default apiClient;
