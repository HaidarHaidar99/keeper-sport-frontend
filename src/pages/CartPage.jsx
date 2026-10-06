import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, ArrowRight, Trash2, Plus, Minus, Loader2 } from 'lucide-react';
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

  const handleUpdateQty = async (itemId, newQty) => {
    if (updatingItemId) return;
    setUpdatingItemId(itemId);

    if (newQty <= 0) {
      await handleRemoveItem(itemId);
      setUpdatingItemId(null);
      return;
    }

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
                        {sizeVal && <span>Size: {sizeVal}</span>}
                        {colorVal && <span>Color: {colorVal}</span>}
                        {item.printedName && <span>Print: {item.printedName} #{item.printedNumber}</span>}
                        {item.badge && <span>Badge: {item.badge}</span>}
                      </div>

                      {/* Quantity Controls */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '8px' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '6px', background: 'rgba(255,255,255,0.03)' }}>
                          <button
                            type="button"
                            onClick={() => handleUpdateQty(item.id, item.quantity - 1)}
                            disabled={isUpdating}
                            aria-label="Decrease quantity"
                            style={{ background: 'none', border: 'none', color: '#fff', padding: '6px 10px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                          >
                            <Minus size={13} />
                          </button>
                          <span style={{ fontSize: '13px', fontWeight: 700, minWidth: '24px', textAlign: 'center', color: '#fff' }}>
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleUpdateQty(item.id, item.quantity + 1)}
                            disabled={isUpdating}
                            aria-label="Increase quantity"
                            style={{ background: 'none', border: 'none', color: '#fff', padding: '6px 10px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                          >
                            <Plus size={13} />
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleRemoveItem(item.id)}
                          disabled={isUpdating}
                          aria-label="Remove item"
                          style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', padding: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', transition: 'color 0.2s' }}
                          onMouseEnter={(e) => (e.currentTarget.style.color = '#ef4444')}
                          onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.5)')}
                          title="Remove item"
                        >
                          <Trash2 size={15} />
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

                <button
                  type="button"
                  onClick={() => navigate('/checkout')}
                  className="ks-btn-primary"
                  style={{ width: '100%', marginTop: '20px' }}
                >
                  <span>PROCEED TO CHECKOUT</span>
                  <ArrowRight size={16} style={{ marginLeft: '6px' }} />
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer siteSettings={siteSettings} categories={categories} />
    </div>
  );
}
