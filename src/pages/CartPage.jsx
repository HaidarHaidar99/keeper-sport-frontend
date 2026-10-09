import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, ArrowRight, Trash2, Plus, Minus, Loader2, AlertTriangle, X } from 'lucide-react';
import { productApi } from '../api/productApi';
import { useSite } from '../context/SiteContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function CartPage() {
  const navigate = useNavigate();
  const { siteSettings, categories, refreshCounts } = useSite();
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updatingItemId, setUpdatingItemId] = useState(null);
  const [showClearModal, setShowClearModal] = useState(false);
  const [clearingCart, setClearingCart] = useState(false);

  const loadCart = () => {
    return productApi.getCart().then((cartRes) => {
      if (cartRes?.success) {
        const rawItems = Array.isArray(cartRes.items)
          ? cartRes.items
          : Array.isArray(cartRes.cart?.items)
          ? cartRes.cart.items
          : [];
        setCart({
          ...(cartRes.cart || {}),
          items: rawItems,
          subtotal: cartRes.subtotal != null ? cartRes.subtotal : cartRes.cart?.subtotal || 0,
          cartCount: cartRes.cartCount != null ? cartRes.cartCount : cartRes.cart?.cartCount || 0
        });
      }
    });
  };

  useEffect(() => {
    let isMounted = true;
    loadCart().finally(() => {
      if (isMounted) setLoading(false);
    });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleUpdateQty = async (itemId, currentQty, delta) => {
    if (updatingItemId) return;
    const newQty = currentQty + delta;
    if (newQty < 1) return; // Min quantity is 1; use Delete button to remove

    setUpdatingItemId(itemId);

    // Optimistic update
    setCart((prev) => {
      if (!prev) return prev;
      const updatedItems = (prev.items || []).map((it) => {
        if (it.id === itemId) {
          const unitPrice = Number(it.unitPrice || it.product?.base_price || 0);
          return { ...it, quantity: newQty, lineTotal: unitPrice * newQty };
        }
        return it;
      });
      return { ...prev, items: updatedItems };
    });

    try {
      const res = await productApi.updateCartQuantity(itemId, newQty);
      if (res?.success) {
        const rawItems = Array.isArray(res.items)
          ? res.items
          : Array.isArray(res.cart?.items)
          ? res.cart.items
          : null;
        if (rawItems) {
          setCart({
            ...(res.cart || {}),
            items: rawItems,
            subtotal: res.subtotal != null ? res.subtotal : res.cart?.subtotal || 0,
            cartCount: res.cartCount != null ? res.cartCount : res.cart?.cartCount || 0
          });
        }
        if (typeof refreshCounts === 'function') refreshCounts();
      } else {
        await loadCart();
      }
    } catch {
      await loadCart();
    } finally {
      setUpdatingItemId(null);
    }
  };

  const handleSelectVariant = async (itemId, variantId) => {
    if (updatingItemId) return;
    setUpdatingItemId(itemId);
    try {
      const res = await productApi.updateCartItemVariant(itemId, variantId);
      if (res?.success) {
        await loadCart();
        if (typeof refreshCounts === 'function') refreshCounts();
      } else {
        await loadCart();
      }
    } catch {
      await loadCart();
    } finally {
      setUpdatingItemId(null);
    }
  };

  const handleRemoveItem = async (itemId) => {
    if (updatingItemId) return;
    setUpdatingItemId(itemId);

    // Optimistic removal
    setCart((prev) => {
      if (!prev) return prev;
      const updatedItems = (prev.items || []).filter((it) => it.id !== itemId);
      return { ...prev, items: updatedItems };
    });

    try {
      const res = await productApi.removeFromCart(itemId);
      if (res?.success) {
        const rawItems = Array.isArray(res.items)
          ? res.items
          : Array.isArray(res.cart?.items)
          ? res.cart.items
          : null;
        if (rawItems) {
          setCart({
            ...(res.cart || {}),
            items: rawItems,
            subtotal: res.subtotal != null ? res.subtotal : res.cart?.subtotal || 0,
            cartCount: res.cartCount != null ? res.cartCount : res.cart?.cartCount || 0
          });
        }
        if (typeof refreshCounts === 'function') refreshCounts();
      } else {
        await loadCart();
      }
    } catch {
      await loadCart();
    } finally {
      setUpdatingItemId(null);
    }
  };

  const handleClearCart = async () => {
    if (clearingCart) return;
    setClearingCart(true);

    try {
      const res = await productApi.clearCart();
      if (res?.success) {
        setCart({
          items: [],
          cartCount: 0,
          subtotal: 0
        });
        if (typeof refreshCounts === 'function') refreshCounts();
      } else {
        await loadCart();
      }
    } catch {
      await loadCart();
    } finally {
      setClearingCart(false);
      setShowClearModal(false);
    }
  };

  const items = cart?.items || [];
  const deliveryFee = Number(siteSettings?.delivery_fee || 0);

  const subtotal = items.reduce((acc, item) => {
    const price = Number(item.unitPrice || item.product?.base_price || 0);
    return acc + price * (item.quantity || 1);
  }, 0);

  const total = subtotal > 0 ? subtotal + deliveryFee : 0;

  return (
    <div className="ks-page-canvas">
      <Navbar siteSettings={siteSettings} categories={categories} />

      <main className="ks-catalog-page-container">
        <header className="ks-catalog-header">
          <div className="ks-catalog-header-badge">
            <ShoppingBag size={13} style={{ color: 'var(--ks-accent-red)' }} />
            <span>ORDER BAG</span>
          </div>
          <h1 className="ks-catalog-title">Shopping Cart</h1>
        </header>

        {loading ? (
          <div className="ks-catalog-loading" aria-live="polite">
            <Loader2 size={32} className="ks-spin-icon" style={{ color: 'var(--ks-accent-red)' }} />
            <p>Loading your bag...</p>
          </div>
        ) : items.length === 0 ? (
          <div className="ks-catalog-empty">
            <ShoppingBag size={48} style={{ opacity: 0.25, marginBottom: '16px' }} />
            <h3>Your cart is empty</h3>
            <p>Discover our latest authentic boots, jerseys, and sportswear.</p>
            <Link to="/products" className="ks-btn-primary" style={{ display: 'inline-flex', marginTop: '16px' }}>
              <span>START SHOPPING</span>
            </Link>
          </div>
        ) : (
          <div className="ks-cart-grid">
            {/* Items Column */}
            <div className="ks-cart-items-col">
              {/* Header with Clear Cart */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', paddingBottom: '8px', borderBottom: '1px solid var(--ks-border-card)' }}>
                <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--ks-text-muted)' }}>
                  {items.length} {items.length === 1 ? 'item' : 'items'} in your cart
                </span>
                <button
                  type="button"
                  onClick={() => setShowClearModal(true)}
                  disabled={clearingCart}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    background: 'none',
                    border: 'none',
                    color: 'var(--ks-text-muted)',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    transition: 'color 0.2s'
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--ks-error-red, #dc2626)')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--ks-text-muted)')}
                  title="Remove all products from cart"
                >
                  <Trash2 size={13} />
                  <span>Clear Cart</span>
                </button>
              </div>

              {items.map((item) => {
                const p = item.product || {};
                const productName = item.productName || p.name || 'Product';
                const productSlug = item.productSlug || p.slug || item.productId || '';
                const itemImg = item.coverImage || p.primaryImage || null;
                const itemPrice = Number(item.unitPrice || p.base_price || 0);
                const sizeVal = item.selectedSize || item.variant?.size;
                const colorVal = item.selectedColor || item.variant?.color;
                const isUpdating = updatingItemId === item.id;

                return (
                  <div key={item.id} className="ks-cart-item-row" style={{ opacity: isUpdating ? 0.6 : 1 }}>
                    <div className="ks-cart-item-img-wrap">
                      {itemImg ? (
                        <img
                          src={itemImg}
                          alt={productName}
                          className="ks-cart-item-img"
                        />
                      ) : (
                        <div className="ks-card-img-fallback">KS</div>
                      )}
                    </div>

                    <div className="ks-cart-item-details">
                      <h3 className="ks-cart-item-name">
                        <Link to={`/products/${productSlug}`}>{productName}</Link>
                      </h3>
                      <div className="ks-cart-item-meta">
                        {sizeVal && !sizeVal.toLowerCase().includes('standard') && <span>Size: {sizeVal}</span>}
                        {colorVal && <span>Color: {colorVal}</span>}
                        {item.printedName && <span>Print: {item.printedName} #{item.printedNumber}</span>}
                        {item.badge && <span>Badge: {item.badge}</span>}
                      </div>

                      {/* Deferred Size / Variant Selector */}
                      {item.requiresVariantSelection && (
                        <div className="ks-cart-variant-picker-box">
                          <div className="ks-cart-variant-picker-label">
                            <AlertTriangle size={13} className="ks-alert-icon" />
                            <span>Please choose your size before checkout:</span>
                          </div>
                          <div className="ks-cart-variant-options-list">
                            {Array.isArray(item.availableVariants) && item.availableVariants.length > 0 ? (
                              item.availableVariants.map((v) => {
                                const cleanLabel = (v.size || v.name || '').replace(/standard/gi, '').trim() || v.color || 'One Size';
                                const cleanColor = v.color && v.size && !v.size.toLowerCase().includes('standard') ? `— ${v.color}` : '';
                                return (
                                  <button
                                    key={v.id}
                                    type="button"
                                    onClick={() => handleSelectVariant(item.id, v.id)}
                                    disabled={isUpdating}
                                    className="ks-cart-variant-option-btn"
                                  >
                                    {cleanLabel} {cleanColor}
                                  </button>
                                );
                              })
                            ) : (
                              <span className="ks-text-muted" style={{ fontSize: '12px' }}>
                                No variants found.
                              </span>
                            )}
                          </div>
                        </div>
                      )}


                      {/* Visible, high-contrast Quantity Controls and Delete */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '10px' }}>
                        <div
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            border: '1px solid var(--ks-border-card, #e5e7eb)',
                            borderRadius: '8px',
                            background: 'var(--ks-bg-card, #ffffff)',
                            boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                            overflow: 'hidden'
                          }}
                        >
                          <button
                            type="button"
                            onClick={() => handleUpdateQty(item.id, item.quantity, -1)}
                            disabled={isUpdating || item.quantity <= 1}
                            aria-label="Decrease quantity"
                            title={item.quantity <= 1 ? "Minimum quantity is 1" : "Decrease quantity"}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: item.quantity <= 1 ? 'var(--ks-text-muted)' : 'var(--ks-text-title)',
                              opacity: item.quantity <= 1 ? 0.4 : 1,
                              padding: '8px 12px',
                              cursor: item.quantity <= 1 ? 'not-allowed' : 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              transition: 'background-color 0.15s'
                            }}
                            onMouseEnter={(e) => {
                              if (item.quantity > 1) e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.04)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = 'transparent';
                            }}
                          >
                            <Minus size={13} strokeWidth={2.5} />
                          </button>

                          <span
                            style={{
                              fontSize: '14px',
                              fontWeight: 700,
                              minWidth: '28px',
                              textAlign: 'center',
                              color: 'var(--ks-text-title, #111317)',
                              userSelect: 'none'
                            }}
                          >
                            {item.quantity}
                          </span>

                          <button
                            type="button"
                            onClick={() => handleUpdateQty(item.id, item.quantity, 1)}
                            disabled={isUpdating}
                            aria-label="Increase quantity"
                            title="Increase quantity"
                            style={{
                              background: 'none',
                              border: 'none',
                              color: 'var(--ks-text-title)',
                              padding: '8px 12px',
                              cursor: isUpdating ? 'not-allowed' : 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              transition: 'background-color 0.15s'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.04)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = 'transparent';
                            }}
                          >
                            <Plus size={13} strokeWidth={2.5} />
                          </button>
                        </div>

                        {/* Distinct Delete button */}
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(item.id)}
                          disabled={isUpdating}
                          aria-label={`Remove ${productName} from cart`}
                          title="Remove item"
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            background: 'none',
                            border: 'none',
                            color: 'var(--ks-text-muted, #6B7280)',
                            fontSize: '12px',
                            fontWeight: 600,
                            padding: '6px 8px',
                            cursor: 'pointer',
                            borderRadius: '6px',
                            transition: 'color 0.2s, background-color 0.2s'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.color = 'var(--ks-error-red, #dc2626)';
                            e.currentTarget.style.backgroundColor = 'rgba(220, 38, 38, 0.06)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.color = 'var(--ks-text-muted, #6B7280)';
                            e.currentTarget.style.backgroundColor = 'transparent';
                          }}
                        >
                          <Trash2 size={14} />
                          <span>Remove</span>
                        </button>
                      </div>
                    </div>

                    <div className="ks-cart-item-pricing">
                      <span className="ks-cart-item-price">${(itemPrice * item.quantity).toFixed(2)}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Summary Column */}
            <div className="ks-cart-summary-col">
              <div className="ks-cart-summary-card">
                <h3 className="ks-cart-summary-title">Order Summary</h3>

                <div className="ks-summary-row">
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>

                <div className="ks-summary-row">
                  <span>Estimated Delivery</span>
                  <span>${deliveryFee.toFixed(2)}</span>
                </div>

                <div className="ks-summary-divider" />

                <div className="ks-summary-row ks-summary-total">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>

                {/* Unresolved Variants Warning */}
                {(cart?.items || []).some((it) => it.requiresVariantSelection) ? (
                  <div style={{ marginTop: '16px', padding: '12px', background: 'rgba(225,6,0,0.08)', border: '1px solid var(--ks-accent-red)', color: 'var(--ks-accent-red)', fontSize: '13px', fontWeight: 600 }}>
                    Please select a size for all highlighted items above before checkout.
                  </div>
                ) : null}

                <button
                  type="button"
                  onClick={() => {
                    const unresolved = (cart?.items || []).some((it) => it.requiresVariantSelection);
                    if (unresolved) return;
                    navigate('/checkout');
                  }}
                  disabled={(cart?.items || []).some((it) => it.requiresVariantSelection)}
                  className="ks-btn-primary"
                  style={{
                    width: '100%',
                    marginTop: '20px',
                    opacity: (cart?.items || []).some((it) => it.requiresVariantSelection) ? 0.5 : 1,
                    cursor: (cart?.items || []).some((it) => it.requiresVariantSelection) ? 'not-allowed' : 'pointer'
                  }}
                >
                  <span>PROCEED TO CHECKOUT</span>
                  <ArrowRight size={16} style={{ marginLeft: '6px' }} />
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Confirmation Modal for Clear Cart */}
      {showClearModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="clear-cart-title"
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(0, 0, 0, 0.65)',
            backdropFilter: 'blur(3px)',
            padding: '16px'
          }}
          onClick={() => setShowClearModal(false)}
        >
          <div
            style={{
              background: 'var(--ks-bg-card, #ffffff)',
              color: 'var(--ks-text-title, #111317)',
              borderRadius: '14px',
              padding: '24px',
              maxWidth: '420px',
              width: '100%',
              boxShadow: '0 20px 40px rgba(0,0,0,0.25)',
              border: '1px solid var(--ks-border-card, #e5e7eb)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: 'rgba(220, 38, 38, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--ks-error-red, #dc2626)', flexShrink: 0 }}>
                <AlertTriangle size={20} />
              </div>
              <h3 id="clear-cart-title" style={{ fontSize: '18px', fontWeight: 700, margin: 0 }}>
                Clear Entire Cart?
              </h3>
            </div>

            <p style={{ fontSize: '14px', color: 'var(--ks-text-subtitle, #4b5563)', margin: '0 0 20px', lineHeight: 1.5 }}>
              Are you sure you want to clear your cart? All {items.length} items will be removed from your order bag.
            </p>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => setShowClearModal(false)}
                disabled={clearingCart}
                style={{
                  background: 'none',
                  border: '1px solid var(--ks-border-card, #d1d5db)',
                  borderRadius: '8px',
                  padding: '8px 16px',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: 'var(--ks-text-title, #111317)',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleClearCart}
                disabled={clearingCart}
                style={{
                  background: 'var(--ks-error-red, #dc2626)',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '8px 18px',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: '#ffffff',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                {clearingCart ? <Loader2 size={14} className="ks-spin-icon" /> : <Trash2 size={14} />}
                <span>Clear Cart</span>
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer siteSettings={siteSettings} categories={categories} />
    </div>
  );
}
