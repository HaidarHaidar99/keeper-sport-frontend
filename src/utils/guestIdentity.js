/**
 * Keeper Sports Guest Identity & Session Utility
 * Manages persistent anonymous guest identity and cryptographically isolated guest order tokens.
 */

const GUEST_ID_KEY = 'ks_guest_id';
const GUEST_ORDER_TOKENS_KEY = 'ks_guest_order_tokens';
const GUEST_ORDERS_KEY = 'ks_guest_orders';

/**
 * Get or create a stable, persistent anonymous guest ID
 */
export function getOrCreateGuestId() {
  try {
    let guestId = localStorage.getItem(GUEST_ID_KEY);
    if (!guestId) {
      const randomPart = typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : `${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 11)}`;
      guestId = `guest_${randomPart}`;
      localStorage.setItem(GUEST_ID_KEY, guestId);
    }
    return guestId;
  } catch {
    return 'guest_fallback_anon';
  }
}

/**
 * Get array of guest order access tokens stored on this device
 */
export function getGuestOrderTokens() {
  try {
    const raw = localStorage.getItem(GUEST_ORDER_TOKENS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((t) => typeof t === 'string' && t.length > 0) : [];
  } catch {
    return [];
  }
}

/**
 * Save a guest order access token to this device's storage
 */
export function saveGuestOrderToken(token) {
  if (!token || typeof token !== 'string') return;
  try {
    const existing = getGuestOrderTokens();
    if (!existing.includes(token)) {
      existing.push(token);
      localStorage.setItem(GUEST_ORDER_TOKENS_KEY, JSON.stringify(existing));
    }
  } catch (err) {
    console.warn('Could not persist guest order token:', err);
  }
}

/**
 * Save full guest order snapshot for local reference
 */
export function saveGuestOrder(order) {
  if (!order || !order.id) return;
  try {
    if (order.guestAccessToken) {
      saveGuestOrderToken(order.guestAccessToken);
    }
    const raw = localStorage.getItem(GUEST_ORDERS_KEY);
    const existing = raw ? JSON.parse(raw) : [];
    const list = Array.isArray(existing) ? existing : [];
    if (!list.some((o) => o.id === order.id)) {
      list.unshift({
        id: order.id,
        order_number: order.order_number,
        total: order.total,
        status: order.status || 'pending',
        token: order.guestAccessToken || null,
        created_at: new Date().toISOString()
      });
      localStorage.setItem(GUEST_ORDERS_KEY, JSON.stringify(list));
    }
  } catch (err) {
    console.warn('Could not persist guest order metadata:', err);
  }
}

const HIDDEN_ORDERS_KEY = 'ks_hidden_order_ids';

/**
 * Get array of order IDs hidden from customer-side history
 */
export function getHiddenOrderIds() {
  try {
    const raw = localStorage.getItem(HIDDEN_ORDERS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/**
 * Hide an order from customer view without deleting database record
 */
export function hideOrderFromHistory(orderId) {
  if (!orderId) return;
  try {
    const list = getHiddenOrderIds();
    if (!list.includes(orderId)) {
      list.push(orderId);
      localStorage.setItem(HIDDEN_ORDERS_KEY, JSON.stringify(list));
    }
  } catch (err) {
    console.warn('Could not hide order from history:', err);
  }
}

