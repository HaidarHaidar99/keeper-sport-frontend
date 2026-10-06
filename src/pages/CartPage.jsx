import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, ArrowRight, Trash2, ArrowLeft, Loader2 } from 'lucide-react';
import { productApi } from '../api/productApi';
import { useSite } from '../context/SiteContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function CartPage() {
  const navigate = useNavigate();
  const { siteSettings, categories, refreshCounts } = useSite();
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    productApi.getCart()
      .then((cartRes) => {
        if (!isMounted) return;
        if (cartRes?.success && cartRes.cart) {
          setCart(cartRes.cart);
        }
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const items = cart?.items || [];
  const deliveryFee = Number(siteSettings?.delivery_fee || 0);

  const subtotal = items.reduce((acc, item) => {
    const price = Number(item.unitPrice || item.product?.base_price || 0);
    return acc + price * (item.quantity || 1);
  }, 0);

  const total = subtotal > 0 ? subtotal + deliveryFee : 0;

  return (
    <div className="ks-page-canvas">
      <Navbar siteSettings={siteSettings} categories={categories} counts={userCounts} />

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
                const itemPrice = Number(item.unitPrice || p.base_price || 0);
                return (
                  <div key={item.id} className="ks-cart-item-row">
                    <div className="ks-cart-item-img-wrap">
                      {item.coverImage || p.primaryImage ? (
                        <img
                          src={item.coverImage || p.primaryImage}
                          alt={p.name || 'Product'}
                          className="ks-cart-item-img"
                        />
                      ) : (
                        <div className="ks-card-img-fallback">KS</div>
                      )}
                    </div>

                    <div className="ks-cart-item-details">
                      <h3 className="ks-cart-item-name">
                        <Link to={`/products/${p.slug || p.id}`}>{p.name}</Link>
                      </h3>
                      <div className="ks-cart-item-meta">
                        {item.selectedSize && <span>Size: {item.selectedSize}</span>}
                        {item.selectedColor && <span>Color: {item.selectedColor}</span>}
                        {item.printedName && <span>Print: {item.printedName} #{item.printedNumber}</span>}
                        {item.badge && <span>Badge: {item.badge}</span>}
                      </div>
                      <div className="ks-cart-item-qty">Qty: {item.quantity}</div>
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
