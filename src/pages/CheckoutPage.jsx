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
import { useToast } from '../context/ToastContext';
import { formatColorName, getColorHex, getProductImage } from '../utils/productUtils';

export default function CheckoutPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { siteSettings, categories, deliveryFee, refreshCounts } = useSite();
  const { showToast } = useToast();

  const isDirect = searchParams.get('direct') === 'true';
  const directProductId = searchParams.get('productId');
  const directQty = Math.max(1, parseInt(searchParams.get('qty'), 10) || 1);
  const directSize = searchParams.get('size');
  const directColor = searchParams.get('color');
  const directName = searchParams.get('name');
  const directNumber = searchParams.get('number');
  const directBadge = searchParams.get('badge');

  const [directProduct, setDirectProduct] = useState(null);
  const [selectedDirectSize, setSelectedDirectSize] = useState(directSize || null);
  const [selectedDirectColor, setSelectedDirectColor] = useState(directColor || null);
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
          const prod = orderSourceRes.product;
          setDirectProduct(prod);
          const variants = prod.variants || [];
          const availSizes = Array.from(
            new Set(variants.map((v) => (v.size_value || '').replace(/standard/gi, '').trim()).filter(Boolean))
          );
          const availColors = Array.from(
            new Set(variants.map((v) => (v.color_value || '').trim()).filter(Boolean))
          );
          if (!directSize && availSizes.length === 1) {
            setSelectedDirectSize(availSizes[0]);
          }
          if (!directColor && availColors.length === 1) {
            setSelectedDirectColor(availColors[0]);
          }
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
  }, [isDirect, directProductId, directSize, directColor]);

  // Variant resolution for direct purchase
  const directVariants = directProduct?.variants || [];
  const availableDirectSizes = Array.from(
    new Set(directVariants.map((v) => (v.size_value || '').replace(/standard/gi, '').trim()).filter(Boolean))
  );
  const availableDirectColors = Array.from(
    new Set(directVariants.map((v) => (v.color_value || '').trim()).filter(Boolean))
  );

  let matchedDirectVariant = null;
  if (directVariants.length > 0) {
    matchedDirectVariant = directVariants.find((v) => {
      const sVal = (v.size_value || '').replace(/standard/gi, '').trim();
      const cVal = (v.color_value || '').trim();
      const sMatch = !selectedDirectSize || sVal.toLowerCase() === selectedDirectSize.toLowerCase();
      const cMatch = !selectedDirectColor || cVal.toLowerCase() === selectedDirectColor.toLowerCase();
      return sMatch && cMatch;
    });

    if (!matchedDirectVariant) {
      matchedDirectVariant = directVariants.find((v) => {
        const sVal = (v.size_value || '').replace(/standard/gi, '').trim();
        const cVal = (v.color_value || '').trim();
        if (selectedDirectSize && sVal.toLowerCase() === selectedDirectSize.toLowerCase()) return true;
        if (selectedDirectColor && cVal.toLowerCase() === selectedDirectColor.toLowerCase()) return true;
        return false;
      });
    }
  }

  const handleSelectDirectOption = (type, value) => {
    if (type === 'size') {
      setSelectedDirectSize(value);
    } else if (type === 'color') {
      setSelectedDirectColor(value);
    }
    if (serverError) setServerError('');
  };

  const handleSelectCartOption = async (itemId, optionType, value) => {
    const targetItem = cartItems.find((it) => it.id === itemId);
    if (!targetItem) return;

    const availableVars = Array.isArray(targetItem.availableVariants) ? targetItem.availableVariants : [];
    const currentSize = (targetItem.selectedSize || targetItem.variant?.size || '').replace(/standard/gi, '').trim();
    const currentColor = (targetItem.selectedColor || targetItem.variant?.color || '').trim();

    const newSize = optionType === 'size' ? value : currentSize;
    const newColor = optionType === 'color' ? value : currentColor;

    let matched = availableVars.find((v) => {
      const sVal = (v.size_value || v.size || '').replace(/standard/gi, '').trim();
      const cVal = (v.color_value || v.color || '').trim();
      const sMatch = !newSize || sVal.toLowerCase() === newSize.toLowerCase();
      const cMatch = !newColor || cVal.toLowerCase() === newColor.toLowerCase();
      return sMatch && cMatch;
    });

    if (!matched) {
      matched = availableVars.find((v) => {
        if (optionType === 'size') {
          return (v.size_value || v.size || '').replace(/standard/gi, '').trim().toLowerCase() === value.toLowerCase();
        }
        return (v.color_value || v.color || '').trim().toLowerCase() === value.toLowerCase();
      });
    }

    if (matched) {
      setCartItems((prev) =>
        prev.map((it) => {
          if (it.id !== itemId) return it;
          return {
            ...it,
            selectedVariantId: matched.id,
            variantId: matched.id,
            selectedSize: matched.size_value || newSize,
            selectedColor: matched.color_value || newColor,
            variant: {
              ...(it.variant || {}),
              size: matched.size_value || newSize,
              color: matched.color_value || newColor,
              price: matched.price || it.unitPrice
            },
            requiresVariantSelection: false
          };
        })
      );

      try {
        await productApi.updateCartItemVariant(itemId, matched.id);
        if (typeof refreshCounts === 'function') refreshCounts();
      } catch (err) {
        console.error('Error updating cart variant at checkout:', err);
      }
    }
    if (serverError) setServerError('');
  };

  // Calculate items summary
  let checkoutItems = [];
  let subtotal = 0;

  if (isDirect && directProduct) {
    const basePrice = Number(directProduct.pricing?.currentPrice || directProduct.base_price || 0);
    const unitPrice = matchedDirectVariant?.price ? Number(matchedDirectVariant.price) : basePrice;
    const lineTotal = unitPrice * directQty;
    subtotal = lineTotal;
    checkoutItems = [
      {
        id: 'direct',
        productId: directProduct.id,
        variantId: matchedDirectVariant?.id || null,
        name: directProduct.name,
        quantity: directQty,
        unitPrice,
        size: selectedDirectSize || null,
        color: selectedDirectColor || null,
        printedName: directName,
        printedNumber: directNumber,
        badge: directBadge,
        image: getProductImage(directProduct, null),
        availableSizes: availableDirectSizes,
        availableColors: availableDirectColors,
        requiresSize: availableDirectSizes.length > 0 && !selectedDirectSize,
        requiresColor: availableDirectColors.length > 0 && !selectedDirectColor,
        isDirect: true
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

      const availVars = Array.isArray(item.availableVariants) ? item.availableVariants : [];
      const availSizes = Array.from(
        new Set(availVars.map((v) => (v.size_value || '').replace(/standard/gi, '').trim()).filter(Boolean))
      );
      const availColors = Array.from(
        new Set(availVars.map((v) => (v.color_value || '').trim()).filter(Boolean))
      );
      const chosenSize = (item.selectedSize || item.variant?.size || '').replace(/standard/gi, '').trim() || null;
      const chosenColor = (item.selectedColor || item.variant?.color || '').trim() || null;

      return {
        id: item.id,
        productId: pId,
        variantId: item.variantId || item.selectedVariantId || null,
        name: pName,
        quantity: item.quantity,
        unitPrice,
        size: chosenSize,
        color: chosenColor,
        printedName: item.printedName || null,
        printedNumber: item.printedNumber || null,
        badge: item.badge || null,
        image: getProductImage(p, item),
        availableSizes: availSizes,
        availableColors: availColors,
        requiresSize: availSizes.length > 0 && !chosenSize,
        requiresColor: availColors.length > 0 && !chosenColor,
        isDirect: false
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

      const missingLabels = [];
      if (validationErrors.customer_full_name) missingLabels.push('Full Name');
      if (validationErrors.customer_phone) missingLabels.push('Phone Number');
      if (validationErrors.area) missingLabels.push('City / Area');
      if (validationErrors.address) missingLabels.push('Street Address');

      const msg = missingLabels.length > 0
        ? `Please fill in: ${missingLabels.join(', ')}`
        : 'Please complete all required fields.';
      showToast(msg, 'error');

      // Automatically scroll smoothly to the first missing field
      const firstKey = Object.keys(validationErrors)[0];
      const fieldIdMap = {
        customer_full_name: 'chk-name',
        customer_phone: 'chk-phone',
        area: 'chk-area',
        address: 'chk-address'
      };
      const targetEl = document.getElementById(fieldIdMap[firstKey]);
      if (targetEl) {
        targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
        targetEl.focus();
      }
      return;
    }

    if (checkoutItems.length === 0) {
      const msg = 'No items found in this order.';
      setServerError(msg);
      showToast(msg, 'error');
      return;
    }

    // Precise per-item variant validation
    for (const item of checkoutItems) {
      if (item.requiresSize && item.requiresColor) {
        const msg = `Please select a size and color for "${item.name}" before completing your order.`;
        setServerError(msg);
        showToast(msg, 'error');
        return;
      }
      if (item.requiresSize) {
        const msg = `Please select a size for "${item.name}" before completing your order.`;
        setServerError(msg);
        showToast(msg, 'error');
        return;
      }
      if (item.requiresColor) {
        const msg = `Please select a color for "${item.name}" before completing your order.`;
        setServerError(msg);
        showToast(msg, 'error');
        return;
      }
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
            lines.push(`   • Color: ${formatColorName(item.color)}`);
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

        const storeWhatsAppRaw = siteSettings?.whatsapp_number || siteSettings?.phone_number || '96170973086';
        const cleanWhatsApp = storeWhatsAppRaw.replace(/[^0-9]/g, '') || '96170973086';
        const whatsappUrl = `https://wa.me/${cleanWhatsApp}?text=${encodeURIComponent(fullWhatsAppMessage)}`;

        setOrderComplete({
          ...res.order,
          customerName,
          customerPhone,
          customerArea,
          customerAddress,
          paymentMethodLabel,
          subtotalVal,
          deliveryVal,
          totalVal,
          whatsappUrl
        });

        // Directly open WhatsApp with the complete order details
        try {
          const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
          if (isMobile) {
            window.location.href = whatsappUrl;
          } else {
            const waTab = window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
            if (!waTab || waTab.closed || typeof waTab.closed === 'undefined') {
              window.location.href = whatsappUrl;
            }
          }
        } catch {
          window.location.href = whatsappUrl;
        }
      } else {
        const errorMsg = res.message || 'Could not complete order. Please try again.';
        setServerError(errorMsg);
        showToast(errorMsg, 'error');
      }
    } catch {
      const errorMsg = 'Network error placing order. Please check your connection and try again.';
      setServerError(errorMsg);
      showToast(errorMsg, 'error');
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
            <h1 className="ks-catalog-title">Order Submitted Successfully!</h1>
            <p className="ks-catalog-subtitle" style={{ marginBottom: '16px' }}>
              Your order <strong>#{orderComplete.order_number}</strong> has been submitted successfully. For any inquiries, please contact us on WhatsApp.
            </p>

            {/* Clean, professional WhatsApp contact confirmation banner & link */}
            <a
              href={orderComplete.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                margin: '20px 0',
                padding: '16px 20px',
                borderRadius: '16px',
                background: 'rgba(37, 211, 102, 0.12)',
                border: '1px solid rgba(37, 211, 102, 0.35)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '12px',
                textDecoration: 'none',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              className="ks-whatsapp-order-cta"
            >
              <WhatsAppIcon size={24} style={{ color: '#25D366', flexShrink: 0 }} />
              <div style={{ textAlign: 'left' }}>
                <p style={{ margin: 0, fontSize: '0.96rem', fontWeight: 700, color: 'var(--ks-text-title, #ffffff)' }}>
                  Your order has been submitted successfully!
                </p>
                <p style={{ margin: '3px 0 0', fontSize: '0.86rem', fontWeight: 600, color: '#25D366' }}>
                  For any inquiries, please contact us on WhatsApp &rarr;
                </p>
              </div>
            </a>

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
              <a
                href={orderComplete.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="ks-btn-whatsapp"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: '#25D366',
                  color: '#ffffff',
                  padding: '12px 22px',
                  borderRadius: '12px',
                  fontWeight: 700,
                  fontSize: '0.92rem',
                  textDecoration: 'none',
                  boxShadow: '0 4px 14px rgba(37, 211, 102, 0.3)'
                }}
              >
                <WhatsAppIcon size={18} style={{ color: '#ffffff' }} />
                <span>OPEN ORDER IN WHATSAPP</span>
              </a>
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

                    <label
                      className="ks-payment-option-label is-disabled"
                      style={{ opacity: 0.7, cursor: 'not-allowed' }}
                      title="Whish Money payment will be added soon once approved by the company"
                    >
                      <input
                        type="radio"
                        name="payment_method"
                        value="whish_money"
                        disabled={true}
                        checked={false}
                        onChange={() => {}}
                      />
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <strong>Whish Money</strong>
                          <span
                            style={{
                              fontSize: '10px',
                              fontWeight: 700,
                              textTransform: 'uppercase',
                              padding: '2px 8px',
                              borderRadius: '4px',
                              background: 'rgba(255, 255, 255, 0.08)',
                              color: 'var(--ks-text-muted, #9ca3af)',
                              border: '1px solid rgba(255, 255, 255, 0.12)'
                            }}
                          >
                            Coming Soon
                          </span>
                        </div>
                        <span style={{ fontSize: '0.8rem', color: 'var(--ks-text-muted, #9ca3af)', marginTop: '2px', display: 'block' }}>
                          Whish Money payment will be added soon once approved by the company.
                        </span>
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

                <div className="ks-checkout-items-list" style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '480px', overflowY: 'auto', marginBottom: '16px' }}>
                  {checkoutItems.map((item, idx) => {
                    const itemRequiresSelection = item.requiresSize || item.requiresColor;
                    return (
                      <div
                        key={item.id || idx}
                        className={`ks-checkout-item-mini ${itemRequiresSelection ? 'has-unresolved-variant' : ''}`}
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '8px',
                          padding: '10px 12px',
                          background: 'var(--ks-bg-card, rgba(255, 255, 255, 0.03))',
                          border: itemRequiresSelection ? '1.5px solid #E10600' : '1px solid var(--ks-border, rgba(255, 255, 255, 0.08))',
                          borderRadius: '10px'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div
                            className="ks-checkout-item-thumb"
                            style={{
                              width: '58px',
                              height: '58px',
                              minWidth: '58px',
                              maxWidth: '58px',
                              minHeight: '58px',
                              maxHeight: '58px',
                              borderRadius: '8px',
                              overflow: 'hidden',
                              flexShrink: 0,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              background: 'rgba(0, 0, 0, 0.25)',
                              border: '1px solid rgba(255, 255, 255, 0.08)'
                            }}
                          >
                            {item.image ? (
                              <img
                                src={item.image}
                                alt={item.name}
                                className="ks-checkout-thumb-img"
                                style={{ width: '100%', height: '100%', maxWidth: '58px', maxHeight: '58px', objectFit: 'cover', display: 'block' }}
                                loading="lazy"
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none';
                                  const fallback = e.currentTarget.parentElement?.querySelector('.ks-checkout-thumb-fallback');
                                  if (fallback) fallback.style.display = 'flex';
                                }}
                              />
                            ) : null}
                            <div
                              className="ks-card-img-fallback ks-checkout-thumb-fallback"
                              style={{
                                display: item.image ? 'none' : 'flex',
                                width: '100%',
                                height: '100%',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '11px',
                                fontWeight: 800
                              }}
                            >
                              KS
                            </div>
                          </div>
                          <div className="ks-checkout-item-info" style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '3px' }}>
                            <span className="ks-checkout-item-name" title={item.name} style={{ fontSize: '0.88rem', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {item.name}
                            </span>
                            <span className="ks-checkout-item-meta" style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--ks-text-muted, #a3a3a3)' }}>
                              Qty: {item.quantity} · ${(item.unitPrice * item.quantity).toFixed(2)}
                              {item.size && !item.size.toLowerCase().includes('standard') && ` · Size: ${item.size}`}
                              {item.color && ` · Color: ${formatColorName(item.color)}`}
                            </span>
                          </div>
                        </div>

                        {/* Interactive Size Pill Selector */}
                        {item.availableSizes && item.availableSizes.length > 0 && (
                          <div style={{ marginTop: '2px', paddingTop: '6px', borderTop: '1px solid rgba(255, 255, 255, 0.06)' }}>
                            <div style={{ fontSize: '0.74rem', fontWeight: 700, color: item.requiresSize ? '#E10600' : 'var(--ks-text-muted, #999)', marginBottom: '5px' }}>
                              {item.requiresSize ? '⚠️ Please select a Size:' : 'Size:'}
                            </div>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                              {item.availableSizes.map((sVal) => {
                                const isSelected = item.size && item.size.toLowerCase() === sVal.toLowerCase();
                                return (
                                  <button
                                    key={sVal}
                                    type="button"
                                    onClick={() => {
                                      if (item.isDirect) {
                                        handleSelectDirectOption('size', sVal);
                                      } else {
                                        handleSelectCartOption(item.id, 'size', sVal);
                                      }
                                    }}
                                    className={`ks-cart-size-pill ${isSelected ? 'active' : ''}`}
                                    style={{
                                      padding: '3px 8px',
                                      fontSize: '0.74rem',
                                      fontWeight: 700,
                                      borderRadius: '6px',
                                      cursor: 'pointer'
                                    }}
                                  >
                                    {sVal}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {/* Interactive Color Pill Selector */}
                        {item.availableColors && item.availableColors.length > 0 && (
                          <div style={{ marginTop: '2px', paddingTop: '6px', borderTop: item.availableSizes?.length ? 'none' : '1px solid rgba(255, 255, 255, 0.06)' }}>
                            <div style={{ fontSize: '0.74rem', fontWeight: 700, color: item.requiresColor ? '#E10600' : 'var(--ks-text-muted, #999)', marginBottom: '5px' }}>
                              {item.requiresColor ? '⚠️ Please select a Color:' : 'Color:'}
                            </div>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                              {item.availableColors.map((cVal) => {
                                const isSelected = item.color && item.color.toLowerCase() === cVal.toLowerCase();
                                const hex = getColorHex(cVal);
                                return (
                                  <button
                                    key={cVal}
                                    type="button"
                                    onClick={() => {
                                      if (item.isDirect) {
                                        handleSelectDirectOption('color', cVal);
                                      } else {
                                        handleSelectCartOption(item.id, 'color', cVal);
                                      }
                                    }}
                                    className={`ks-cart-size-pill ${isSelected ? 'active' : ''}`}
                                    style={{
                                      padding: '3px 8px',
                                      fontSize: '0.74rem',
                                      fontWeight: 700,
                                      borderRadius: '6px',
                                      cursor: 'pointer',
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: '5px'
                                    }}
                                  >
                                    {hex && (
                                      <span
                                        style={{
                                          width: '8px',
                                          height: '8px',
                                          borderRadius: '50%',
                                          backgroundColor: hex,
                                          border: '1px solid rgba(255, 255, 255, 0.3)',
                                          flexShrink: 0
                                        }}
                                      />
                                    )}
                                    <span>{formatColorName(cVal)}</span>
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
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
