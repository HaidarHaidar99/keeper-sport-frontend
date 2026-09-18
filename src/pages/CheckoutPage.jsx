import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { 
  ShieldAlert, 
  Truck, 
  Phone, 
  MapPin, 
  User, 
  Check, 
  ArrowLeft, 
  ArrowRight,
  AlertCircle
} from 'lucide-react';
import apiClient from '../services/apiClient';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useGuest } from '../context/GuestContext';
import { useLanguage } from '../context/LanguageContext';

const iraqCities = [
  "Baghdad (بغداد)",
  "Erbil (أربيل)",
  "Basra (البصرة)",
  "Sulaymaniyah (السليمانية)",
  "Najaf (النجف)",
  "Karbala (كربلاء)",
  "Mosul (الموصل)",
  "Kirkuk (كركوك)",
  "Duhok (دهوك)",
  "Babil (بابل)",
  "Anbar (الأنبار)",
  "Dhi Qar (ذي قار)",
  "Maysan (ميسان)",
  "Diwaniyah (الديوانية)",
  "Wasit (واسط)",
  "Salah al-Din (صلاح الدين)",
  "Diyala (ديالى)"
];

const CheckoutPage = () => {
  const { items, subtotal, totalCount, clearCart } = useCart();
  const { customer, isAuthenticated } = useAuth();
  const { saveGuestOrder } = useGuest();
  const { t, isRtl } = useLanguage();
  const navigate = useNavigate();

  // Form states
  const [fullName, setFullName] = useState(customer?.email?.split('@')[0] || '');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState(iraqCities[0]);
  const [address, setAddress] = useState('');
  const [agreedPolicy, setAgreedPolicy] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (items.length === 0) {
    return (
      <div className="container" style={{ padding: '80px 20px', textAlign: 'center' }}>
        <h2 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '16px' }}>Your Cart is Empty</h2>
        <Link to="/products" className="btn btn-primary">Return to Shop</Link>
      </div>
    );
  }

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (!agreedPolicy) {
      setErrorMsg(isRtl ? "يجب الموافقة على سياسة الاستبدال فقط لإتمام الطلب." : "You must acknowledge the Exchanges Only policy to proceed.");
      return;
    }

    setSubmitting(true);
    setErrorMsg('');

    try {
      // Backend expects: { delivery: { customer_name, delivery_phone, delivery_city, delivery_address }, items: [{ product_id, variant_id, quantity }] }
      const payload = {
        delivery: {
          customer_name: fullName,
          delivery_phone: phone,
          delivery_city: city,
          delivery_address: address
        },
        items: items.map((item) => ({
          product_id: item.product_id,
          variant_id: item.variant_id || undefined,
          quantity: item.quantity,
          custom_details: item.customKitDetails || undefined
        }))
      };

      const res = await apiClient('/orders', {
        method: 'POST',
        body: JSON.stringify(payload)
      });

      if (res?.success && res?.order) {
        // Trigger celebratory confetti
        try {
          confetti({ particleCount: 120, spread: 70, origin: { y: 0.6 } });
        } catch {}

        // Save guest token locally if guest order
        if (res.guest_token) {
          saveGuestOrder(res.order, res.guest_token);
        }

        clearCart();
        navigate(`/order-confirmed/${res.order.id}`, { state: { order: res.order, guestToken: res.guest_token } });
      } else {
        throw new Error(res.message || "Failed to place order");
      }
    } catch (err) {
      setErrorMsg(err.message || "Checkout failed. Please review your details and stock availability.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ padding: '40px 0 80px' }}>
      <div className="container">
        <h1 style={{ fontSize: '32px', fontWeight: 900, marginBottom: '8px' }}>{t('checkoutTitle')}</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '32px' }}>
          {isRtl ? "أدخل بيانات التوصيل بدقة لاستلام طلبك والدفع عند الاستلام." : "Enter your delivery address to receive your official kit. Cash on delivery."}
        </p>

        {errorMsg && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '14px 18px',
            backgroundColor: 'rgba(255, 59, 48, 0.12)',
            border: '1px solid rgba(255, 59, 48, 0.35)',
            borderRadius: 'var(--radius-md)',
            color: 'var(--accent-red)',
            fontSize: '14px',
            marginBottom: '24px'
          }}>
            <AlertCircle size={18} />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handlePlaceOrder}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '40px',
            alignItems: 'flex-start'
          }}>
            {/* ── Left Col: Delivery Form ── */}
            <div className="glass-card" style={{ padding: '32px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: 900, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Truck size={20} color="var(--accent-cyan)" />
                <span>{t('deliveryDetails')}</span>
              </h2>

              <div className="form-group">
                <label className="form-label">{t('fullName')}</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    required
                    className="form-input"
                    style={{ paddingInlineStart: '38px' }}
                    placeholder="Ali Mohammed"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                  />
                  <User size={16} style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', insetInlineStart: '12px', color: 'var(--text-muted)' }} />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">{t('phone')}</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="tel"
                    required
                    className="form-input"
                    style={{ paddingInlineStart: '38px' }}
                    placeholder="0770 000 0000"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                  <Phone size={16} style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', insetInlineStart: '12px', color: 'var(--text-muted)' }} />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">{t('city')}</label>
                <select
                  className="form-input"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  style={{ fontWeight: 600 }}
                >
                  {iraqCities.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">{t('address')}</label>
                <div style={{ position: 'relative' }}>
                  <textarea
                    required
                    rows={3}
                    className="form-input"
                    style={{ paddingInlineStart: '38px' }}
                    placeholder={isRtl ? "اسم الحي، المحلة، الزقاق، أقرب نقطة دالة..." : "Neighborhood, Street, Landmark..."}
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                  />
                  <MapPin size={16} style={{ position: 'absolute', top: '16px', insetInlineStart: '12px', color: 'var(--text-muted)' }} />
                </div>
              </div>

              {/* Mandatory Policy Consent */}
              <div style={{
                marginTop: '24px',
                padding: '16px',
                backgroundColor: 'rgba(255, 184, 0, 0.08)',
                border: '1px solid rgba(255, 184, 0, 0.3)',
                borderRadius: 'var(--radius-md)'
              }}>
                <label style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    required
                    checked={agreedPolicy}
                    onChange={(e) => setAgreedPolicy(e.target.checked)}
                    style={{ accentColor: 'var(--accent-gold)', width: '18px', height: '18px', marginTop: '2px', flexShrink: 0 }}
                  />
                  <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--accent-gold)', lineHeight: 1.5 }}>
                    {t('policyAgreement')}
                  </span>
                </label>
              </div>
            </div>

            {/* ── Right Col: Order Review & Place Order ── */}
            <div className="glass-card" style={{ padding: '32px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: 900, marginBottom: '20px' }}>
                {isRtl ? "مراجعة العناصر" : "Review Items"} ({totalCount})
              </h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
                {items.map((item) => (
                  <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '14px' }}>
                    <div>
                      <span style={{ fontWeight: 700 }}>{item.quantity}x</span> {item.name_en}
                      {item.size && <span style={{ color: 'var(--accent-cyan)', fontSize: '12px', marginInlineStart: '6px' }}>({item.size})</span>}
                    </div>
                    <span style={{ fontWeight: 800 }}>${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div style={{
                paddingTop: '16px',
                borderTop: '1px solid var(--border-subtle)',
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: '10px'
              }}>
                <span style={{ color: 'var(--text-secondary)' }}>{t('subtotal')}</span>
                <span style={{ fontWeight: 700 }}>${subtotal.toFixed(2)}</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                <span style={{ color: 'var(--text-secondary)' }}>{t('deliveryFee')}</span>
                <span style={{ color: 'var(--accent-green)', fontWeight: 700 }}>{isRtl ? "مجاني لفترة محدودة" : "FREE (Promo)"}</span>
              </div>

              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                paddingTop: '16px',
                borderTop: '1px solid var(--border-subtle)',
                marginBottom: '28px'
              }}>
                <span style={{ fontSize: '18px', fontWeight: 800 }}>{t('total')}</span>
                <span style={{ fontSize: '26px', fontWeight: 900, color: 'var(--accent-cyan)' }}>
                  ${subtotal.toFixed(2)}
                </span>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="btn btn-primary btn-lg"
                style={{ width: '100%', gap: '10px' }}
              >
                <span>{submitting ? (isRtl ? "جاري إرسال الطلب..." : "Placing Order...") : t('placeOrder')}</span>
                {isRtl ? <ArrowLeft size={18} /> : <ArrowRight size={18} />}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CheckoutPage;
