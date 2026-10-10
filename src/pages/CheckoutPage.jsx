import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, Truck, CheckCircle2, AlertCircle, Loader2, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSite } from '../context/SiteContext';
import { productApi } from '../api/productApi';
import { saveGuestOrder, saveGuestOrderToken } from '../utils/guestIdentity';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { WhatsAppIcon } from '../components/SocialIcons';

export default function CheckoutPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { siteSettings, categories, deliveryFee, refreshCounts } = useSite();

  const isDirect = searchParams.get('direct') === 'true';
  const directProductId = searchParams.get('productId');
  const directQty = Math.max(1, parseInt(searchParams.get('qty'), 10) || 1);
  const directSize = searchParams.get('size');
  const directColor = searchParams.get('color');
  const directName = searchParams.get('name');
  const directNumber = searchParams.get('number');
  const directBadge = searchParams.get('badge');

  const [directProduct, setDirectProduct] = useState(null);
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form state
  const [formData, setFormData] = useState({
    customer_full_name: user?.full_name || '',
    customer_phone: '',
    customer_email: user?.email || '',
    area: 'Beirut',
    address: '',
    location_url: '',
    payment_method: 'cash_on_delivery'
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');
  const [orderComplete, setOrderComplete] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const fetchOrderSource = isDirect && directProductId
      ? productApi.getProduct(directProductId)
      : productApi.getCart();

    fetchOrderSource
      .then((orderSourceRes) => {
        if (!isMounted) return;
        if (isDirect && orderSourceRes?.success && orderSourceRes.product) {
          setDirectProduct(orderSourceRes.product);
        } else if (!isDirect && orderSourceRes?.success) {
          const itemsList = Array.isArray(orderSourceRes.items)
            ? orderSourceRes.items
            : Array.isArray(orderSourceRes.cart?.items)
            ? orderSourceRes.cart.items
            : [];
          setCartItems(itemsList);
        }
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [isDirect, directProductId]);

  // Calculate items summary
  let checkoutItems = [];
  let subtotal = 0;

  if (isDirect && directProduct) {
    const unitPrice = Number(directProduct.pricing?.currentPrice || directProduct.base_price || 0);
    const lineTotal = unitPrice * directQty;
    subtotal = lineTotal;
    checkoutItems = [
      {
        productId: directProduct.id,
        name: directProduct.name,
        quantity: directQty,
        unitPrice,
        size: directSize,
        color: directColor,
        printedName: directName,
        printedNumber: directNumber,
        badge: directBadge,
        image: directProduct.primaryImage || directProduct.image_url
      }
    ];
  } else if (!isDirect && cartItems.length > 0) {
    checkoutItems = cartItems.map((item) => {
      const p = item.product || {};
      const pId = item.productId || p.id;
      const pName = item.productName || p.name || 'Product';
      const unitPrice = Number(item.unitPrice || p.base_price || 0);
      const lineTotal = unitPrice * item.quantity;
      subtotal += lineTotal;
      return {
        productId: pId,
        variantId: item.variantId || item.selectedVariantId || null,
        name: pName,
        quantity: item.quantity,
        unitPrice,
        size: item.selectedSize || item.variant?.size || null,
        color: item.selectedColor || item.variant?.color || null,
        printedName: item.printedName || null,
        printedNumber: item.printedNumber || null,
        badge: item.badge || null,
        image: item.coverImage || p.primaryImage || null
      };
    });
  }

  const total = subtotal > 0 ? subtotal + deliveryFee : 0;

  const validate = () => {
    const errs = {};
    if (!formData.customer_full_name.trim()) errs.customer_full_name = 'Full name is required.';
    if (!formData.customer_phone.trim()) errs.customer_phone = 'Phone number is required.';
    if (!formData.area.trim()) errs.area = 'Delivery area is required.';
    if (!formData.address.trim()) errs.address = 'Street address is required.';
    return errs;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
    if (serverError) setServerError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    if (checkoutItems.length === 0) {
      setServerError('No items found in this order.');
      return;
    }

    const hasUnresolvedVariants = cartItems.some((i) => i.requiresVariantSelection);
    if (hasUnresolvedVariants) {
      setServerError('Please select a size/color for all items in your cart before placing your order.');
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        ...formData,
        items: checkoutItems.map((i) => ({
          productId: i.productId,
          variantId: i.variantId,
          quantity: i.quantity,
          size: i.size,
          color: i.color,
          printedName: i.printedName,
          printedNumber: i.printedNumber,
          badge: i.badge
        }))
      };

      const res = await productApi.createOrder(payload);
      if (res && res.success && res.order) {
        const token = res.order.guestAccessToken || res.guestAccessToken || null;
        if (token) {
          saveGuestOrderToken(token);
          saveGuestOrder({ ...res.order, guestAccessToken: token });
        }
        if (typeof refreshCounts === 'function') refreshCounts();

        // 1. Compile ALL Order Information for WhatsApp
        const orderNumber = res.order.order_number || 'N/A';
        const customerName = formData.customer_full_name.trim();
        const customerPhone = formData.customer_phone.trim();
        const customerEmail = formData.customer_email.trim() || 'Not specified';
        const customerArea = formData.area.trim();
        const customerAddress = formData.address.trim();
        const customerLocationUrl = formData.location_url?.trim() || '';
        const paymentMethodLabel = formData.payment_method === 'whish_money' ? 'Whish Money (App Transfer)' : 'Cash on Delivery (COD)';
        const subtotalVal = Number(res.order.subtotal != null ? res.order.subtotal : subtotal).toFixed(2);
        const deliveryVal = Number(res.order.delivery_fee != null ? res.order.delivery_fee : deliveryFee).toFixed(2);
        const totalVal = Number(res.order.total != null ? res.order.total : total).toFixed(2);

        const itemsSummaryText = checkoutItems.map((item, idx) => {
          const lines = [
            `${idx + 1}. *${item.name}*`,
            `   • Qty: ${item.quantity} × $${Number(item.unitPrice).toFixed(2)} = $${(item.quantity * item.unitPrice).toFixed(2)}`
          ];
          if (item.size && !item.size.toLowerCase().includes('standard')) {
            lines.push(`   • Size: ${item.size}`);
          }
          if (item.color) {
            lines.push(`   • Color: ${item.color}`);
          }
          if (item.printedName) {
            lines.push(`   • Custom Print: ${item.printedName}${item.printedNumber ? ` #${item.printedNumber}` : ''}`);
          }
          if (item.badge) {
            lines.push(`   • Badge: ${item.badge}`);
          }
          return lines.join('\n');
        }).join('\n\n');

        const fullWhatsAppMessage = `⚽ *NEW ORDER - KEEPER SPORTS*
━━━━━━━━━━━━━━━━━━━━
📋 *Order #:* ${orderNumber}
👤 *Customer:* ${customerName}
📞 *Phone:* ${customerPhone}
📧 *Email:* ${customerEmail}
📍 *City / Area:* ${customerArea}
🏠 *Address:* ${customerAddress}${customerLocationUrl ? `\n🗺️ *Maps Link:* ${customerLocationUrl}` : ''}
💳 *Payment:* ${paymentMethodLabel}

━━━━━━━━━━━━━━━━━━━━
📦 *ORDER ITEMS (${checkoutItems.length}):*
${itemsSummaryText}

━━━━━━━━━━━━━━━━━━━━
💰 *Subtotal:* $${subtotalVal}
🚚 *Delivery Fee:* $${deliveryVal}
🔥 *GRAND TOTAL:* $${totalVal}
━━━━━━━━━━━━━━━━━━━━
Thank you for shopping with Keeper Sports! ⚽`;

        setOrderComplete({
          ...res.order,
          customerName,
          customerPhone,
          customerArea,
          customerAddress,
          paymentMethodLabel,
          subtotalVal,
          deliveryVal,
          totalVal
        });
      } else {
        setServerError(res.message || 'Could not complete order. Please try again.');
      }
    } catch {
      setServerError('Network error placing order.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (orderComplete) {
    return (
      <div className="ks-page-canvas">
        <Navbar siteSettings={siteSettings} categories={categories} />

        <main className="ks-catalog-page-container">
          <div className="ks-order-success-card">
            <CheckCircle2 size={54} style={{ color: '#16a34a', margin: '0 auto 16px' }} />
            <h1 className="ks-catalog-title">Order Confirmed!</h1>
            <p className="ks-catalog-subtitle" style={{ marginBottom: '16px' }}>
              Thank you for choosing Keeper Sports. Your order <strong>#{orderComplete.order_number}</strong> has been received and is being prepared.
            </p>

            {/* Clean, professional WhatsApp contact confirmation */}
            <div
              style={{
                margin: '20px 0',
                padding: '16px 20px',
                borderRadius: '16px',
                background: 'rgba(37, 211, 102, 0.1)',
                border: '1px solid rgba(37, 211, 102, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px'
              }}
            >
              <WhatsAppIcon size={20} style={{ color: '#25D366', flexShrink: 0 }} />
              <p style={{ margin: 0, fontSize: '0.94rem', fontWeight: 700, color: 'var(--ks-text-title)' }}>
                We will contact you on WhatsApp as soon as possible.
              </p>
            </div>

            <div className="ks-order-success-details">
              <div>
                <span>Order Number:</span>
                <strong>#{orderComplete.order_number}</strong>
              </div>
              <div>
                <span>Customer:</span>
                <strong>{orderComplete.customerName}</strong>
              </div>
              <div>
                <span>Phone:</span>
                <strong>{orderComplete.customerPhone}</strong>
              </div>
              <div>
                <span>Delivery Area:</span>
                <strong>{orderComplete.customerArea}</strong>
              </div>
              <div>
                <span>Subtotal:</span>
                <strong>${orderComplete.subtotalVal}</strong>
              </div>
              <div>
                <span>Delivery Fee:</span>
                <strong>${orderComplete.deliveryVal}</strong>
              </div>
              <div>
                <span>Grand Total:</span>
                <strong style={{ color: 'var(--ks-accent-red)' }}>${orderComplete.totalVal}</strong>
              </div>
              <div>
                <span>Payment:</span>
                <strong>{orderComplete.paymentMethodLabel}</strong>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '14px', justifyContent: 'center', marginTop: '24px', flexWrap: 'wrap' }}>
              <Link to="/orders" className="ks-btn-primary" style={{ textDecoration: 'none' }}>
                <span>VIEW MY ORDERS</span>
              </Link>
              <Link to="/products" className="ks-btn-secondary" style={{ textDecoration: 'none' }}>
                <span>CONTINUE SHOPPING</span>
              </Link>
            </div>
          </div>
        </main>

        <Footer siteSettings={siteSettings} categories={categories} />
      </div>
    );
  }

  return (
    <div className="ks-page-canvas">
      <Navbar siteSettings={siteSettings} categories={categories} />

      <main className="ks-catalog-page-container">
        <header className="ks-catalog-header">
          <div className="ks-catalog-header-badge">
            <ShieldCheck size={13} style={{ color: 'var(--ks-accent-red)' }} />
            <span>SECURE CHECKOUT</span>
          </div>
          <h1 className="ks-catalog-title">Complete Your Order</h1>
        </header>

        {loading ? (
          <div className="ks-catalog-loading" aria-live="polite">
            <Loader2 size={32} className="ks-spin-icon" style={{ color: 'var(--ks-accent-red)' }} />
            <p>Preparing checkout...</p>
          </div>
        ) : checkoutItems.length === 0 ? (
          <div className="ks-catalog-empty">
            <h3>No items to checkout</h3>
            <p>Your cart is empty.</p>
            <Link to="/products" className="ks-btn-primary" style={{ display: 'inline-flex', marginTop: '16px' }}>
              <span>EXPLORE PRODUCTS</span>
            </Link>
          </div>
        ) : (
          <div className="ks-checkout-grid">
            {/* Delivery Details Form */}
            <div className="ks-checkout-form-col">
              <div className="ks-checkout-card">
                <h2 className="ks-contact-section-title">Delivery Details</h2>

                {serverError && (
                  <div className="ks-alert ks-alert-error" role="alert">
                    <AlertCircle size={16} />
                    <span>{serverError}</span>
                  </div>
                )}

                <form onSubmit={handleSubmit} noValidate>
                  <div className="ks-form-group">
                    <label className="ks-label" htmlFor="chk-name">FULL NAME *</label>
                    <input
                      id="chk-name"
                      name="customer_full_name"
                      type="text"
                      placeholder="Full Name"
                      className={`ks-input ${errors.customer_full_name ? 'has-error' : ''}`}
                      value={formData.customer_full_name}
                      onChange={handleChange}
                      disabled={isSubmitting}
                    />
                    {errors.customer_full_name && <div className="ks-field-error">{errors.customer_full_name}</div>}
                  </div>

                  <div className="ks-form-row">
                    <div className="ks-form-group">
                      <label className="ks-label" htmlFor="chk-phone">PHONE NUMBER *</label>
                      <input
                        id="chk-phone"
                        name="customer_phone"
                        type="tel"
                        placeholder="+961 70 123 456"
                        className={`ks-input ${errors.customer_phone ? 'has-error' : ''}`}
                        value={formData.customer_phone}
                        onChange={handleChange}
                        disabled={isSubmitting}
                      />
                      {errors.customer_phone && <div className="ks-field-error">{errors.customer_phone}</div>}
                    </div>

                    <div className="ks-form-group">
                      <label className="ks-label" htmlFor="chk-email">EMAIL ADDRESS</label>
                      <input
                        id="chk-email"
                        name="customer_email"
                        type="email"
                        placeholder="Your email (optional)"
                        className="ks-input"
                        value={formData.customer_email}
                        onChange={handleChange}
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>

                  <div className="ks-form-row">
                    <div className="ks-form-group">
                      <label className="ks-label" htmlFor="chk-area">CITY / AREA *</label>
                      <input
                        id="chk-area"
                        name="area"
                        type="text"
                        placeholder="e.g. Beirut, Tripoli, Saida"
                        className={`ks-input ${errors.area ? 'has-error' : ''}`}
                        value={formData.area}
                        onChange={handleChange}
                        disabled={isSubmitting}
                      />
                      {errors.area && <div className="ks-field-error">{errors.area}</div>}
                    </div>

                    <div className="ks-form-group">
                      <label className="ks-label" htmlFor="chk-address">STREET &amp; BUILDING *</label>
                      <input
                        id="chk-address"
                        name="address"
                        type="text"
                        placeholder="Street, Building, Floor"
                        className={`ks-input ${errors.address ? 'has-error' : ''}`}
                        value={formData.address}
                        onChange={handleChange}
                        disabled={isSubmitting}
                      />
                      {errors.address && <div className="ks-field-error">{errors.address}</div>}
                    </div>
                  </div>

                  <div className="ks-form-group">
                    <label className="ks-label" htmlFor="chk-location-url">MAPS / GPS LINK (OPTIONAL)</label>
                    <input
                      id="chk-location-url"
                      name="location_url"
                      type="url"
                      placeholder="e.g. Google Maps or WhatsApp Location Link"
                      className="ks-input"
                      value={formData.location_url}
                      onChange={handleChange}
                      disabled={isSubmitting}
                    />
                  </div>

                  <h3 className="ks-payment-method-title">Payment Method</h3>
                  <div className="ks-payment-options">
                    <label className="ks-payment-option-label">
                      <input
                        type="radio"
                        name="payment_method"
                        value="cash_on_delivery"
                        checked={formData.payment_method === 'cash_on_delivery'}
                        onChange={handleChange}
                      />
                      <div>
                        <strong>Cash on Delivery (COD)</strong>
                        <span>Pay in cash upon receiving your order</span>
                      </div>
                    </label>

                    <label className="ks-payment-option-label">
                      <input
                        type="radio"
                        name="payment_method"
                        value="whish_money"
                        checked={formData.payment_method === 'whish_money'}
                        onChange={handleChange}
                      />
                      <div>
                        <strong>Whish Money</strong>
                        <span>Transfer via Whish app before delivery</span>
                      </div>
                    </label>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="ks-btn-primary"
                    style={{ width: '100%', marginTop: '24px' }}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 size={16} className="ks-spinner-icon" />
                        <span>CONFIRMING ORDER...</span>
                      </>
                    ) : (
                      <span>PLACE ORDER (${total.toFixed(2)})</span>
                    )}
                  </button>
                </form>
              </div>
            </div>

            {/* Order Items & Totals Summary */}
            <div className="ks-checkout-summary-col">
              <div className="ks-cart-summary-card">
                <h3 className="ks-cart-summary-title">Order Items ({checkoutItems.length})</h3>

                <div className="ks-checkout-items-list" style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '320px', overflowY: 'auto', marginBottom: '16px' }}>
                  {checkoutItems.map((item, idx) => (
                    <div
                      key={idx}
                      className="ks-checkout-item-mini"
                      style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '8px 12px', background: 'var(--ks-bg-card, rgba(255, 255, 255, 0.03))', border: '1px solid var(--ks-border, rgba(255, 255, 255, 0.08))', borderRadius: '10px' }}
                    >
                      <div
                        className="ks-checkout-item-thumb"
                        style={{ width: '58px', height: '58px', minWidth: '58px', maxWidth: '58px', minHeight: '58px', maxHeight: '58px', borderRadius: '8px', overflow: 'hidden', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0, 0, 0, 0.25)', border: '1px solid rgba(255, 255, 255, 0.08)' }}
                      >
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="ks-checkout-thumb-img"
                            style={{ width: '100%', height: '100%', maxWidth: '58px', maxHeight: '58px', objectFit: 'cover', display: 'block' }}
                            loading="lazy"
                          />
                        ) : (
                          <div className="ks-card-img-fallback ks-checkout-thumb-fallback" style={{ fontSize: '11px', fontWeight: 800 }}>KS</div>
                        )}
                      </div>
                      <div className="ks-checkout-item-info" style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '3px' }}>
                        <span className="ks-checkout-item-name" title={item.name} style={{ fontSize: '0.88rem', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {item.name}
                        </span>
                        <span className="ks-checkout-item-meta" style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--ks-text-muted, #a3a3a3)' }}>
                          Qty: {item.quantity} · ${(item.unitPrice * item.quantity).toFixed(2)}
                          {item.size && ` · ${item.size}`}
                          {item.color && ` · ${item.color}`}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="ks-summary-row" style={{ marginTop: '16px' }}>
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>

                <div className="ks-summary-row">
                  <span>Delivery Fee</span>
                  <span>${deliveryFee.toFixed(2)}</span>
                </div>

                <div className="ks-summary-divider" />

                <div className="ks-summary-row ks-summary-total">
                  <span>Total Amount</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {!loading && <Footer siteSettings={siteSettings} categories={categories} />}
    </div>
  );
}
