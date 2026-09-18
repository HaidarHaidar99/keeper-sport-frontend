import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, Trash2, Plus, Minus, ArrowRight, ArrowLeft, ShieldAlert } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';

const CartPage = () => {
  const { items, updateQuantity, removeFromCart, subtotal, totalCount } = useCart();
  const { t, language, isRtl } = useLanguage();
  const navigate = useNavigate();

  if (items.length === 0) {
    return (
      <div className="container" style={{ padding: '80px 20px', textAlign: 'center' }}>
        <div className="glass-card" style={{ maxWidth: '500px', margin: '0 auto', padding: '50px 30px' }}>
          <ShoppingBag size={54} color="var(--border-medium)" style={{ margin: '0 auto 16px' }} />
          <h2 style={{ fontSize: '24px', fontWeight: 900, marginBottom: '8px' }}>{t('emptyCart')}</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '24px' }}>
            {isRtl ? "لم تقم بإضافة أي قمصان أو منتجات إلى سلتك بعد." : "You haven't added any gear to your bag yet."}
          </p>
          <Link to="/products" className="btn btn-primary">
            {t('allProducts')}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '40px 0 80px' }}>
      <div className="container">
        <h1 style={{ fontSize: '32px', fontWeight: 900, marginBottom: '24px' }}>{t('cartTitle')}</h1>

        {/* Policy Notification Banner */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '14px 20px',
          backgroundColor: 'rgba(255, 184, 0, 0.08)',
          border: '1px solid rgba(255, 184, 0, 0.25)',
          borderRadius: 'var(--radius-md)',
          color: 'var(--accent-gold)',
          fontSize: '13px',
          marginBottom: '32px'
        }}>
          <ShieldAlert size={18} style={{ flexShrink: 0 }} />
          <span>{isRtl ? "تنبيه هام: متجر كيبر سبورتس يعتمد سياسة استبدال المقاس فقط — لا يوجد استرجاع مالي للأموال." : "Important Policy Notice: Keeper Sports operates under an Exchanges Only — No Refunds policy."}</span>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '36px',
          alignItems: 'flex-start'
        }}>
          {/* Cart Table List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {items.map((item) => (
              <div key={item.id} className="glass-card" style={{
                padding: '20px',
                display: 'flex',
                gap: '18px',
                alignItems: 'center',
                flexWrap: 'wrap'
              }}>
                <div style={{
                  width: '84px',
                  height: '84px',
                  borderRadius: 'var(--radius-md)',
                  overflow: 'hidden',
                  backgroundColor: 'var(--bg-input)',
                  flexShrink: 0
                }}>
                  {item.image_url ? (
                    <img src={item.image_url} alt={item.name_en} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <ShoppingBag size={28} color="var(--text-muted)" />
                    </div>
                  )}
                </div>

                <div style={{ flex: 1, minWidth: '180px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: 800 }}>
                    {language === 'ar' ? (item.name_ar || item.name_en) : item.name_en}
                  </h3>
                  <div style={{ display: 'flex', gap: '8px', margin: '6px 0', flexWrap: 'wrap' }}>
                    {item.size && <span className="badge badge-cyan">{t('size')}: {item.size}</span>}
                    {item.customKitDetails && (
                      <span className="badge badge-gold">
                        #{item.customKitDetails.number} {item.customKitDetails.name}
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: '16px', fontWeight: 900, color: 'var(--accent-cyan)' }}>
                    ${Number(item.price).toFixed(2)}
                  </div>
                </div>

                {/* Quantity Stepper */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  backgroundColor: 'var(--bg-input)',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-subtle)'
                }}>
                  <button onClick={() => updateQuantity(item.id, item.quantity - 1)} style={{ padding: '6px 12px' }}>
                    <Minus size={14} />
                  </button>
                  <span style={{ minWidth: '32px', textAlign: 'center', fontWeight: 800 }}>{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.id, item.quantity + 1)} style={{ padding: '6px 12px' }}>
                    <Plus size={14} />
                  </button>
                </div>

                <button onClick={() => removeFromCart(item.id)} style={{ color: 'var(--accent-red)', padding: '6px' }}>
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>

          {/* Order Summary Card */}
          <div className="glass-card" style={{ padding: '28px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 900, marginBottom: '20px' }}>{isRtl ? "ملخص الطلب" : "Order Summary"}</h2>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', color: 'var(--text-secondary)' }}>
              <span>{t('subtotal')} ({totalCount} {isRtl ? "قطع" : "items"})</span>
              <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>${subtotal.toFixed(2)}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', color: 'var(--text-secondary)' }}>
              <span>{t('deliveryFee')}</span>
              <span style={{ color: 'var(--accent-green)', fontWeight: 700 }}>{isRtl ? "حسب المدينة" : "Calculated at checkout"}</span>
            </div>

            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              paddingTop: '16px',
              borderTop: '1px solid var(--border-subtle)',
              marginBottom: '24px'
            }}>
              <span style={{ fontSize: '18px', fontWeight: 800 }}>{t('total')}</span>
              <span style={{ fontSize: '24px', fontWeight: 900, color: 'var(--accent-cyan)' }}>${subtotal.toFixed(2)}</span>
            </div>

            <button
              onClick={() => navigate('/checkout')}
              className="btn btn-primary btn-lg"
              style={{ width: '100%', gap: '10px' }}
            >
              <span>{t('proceedToCheckout')}</span>
              {isRtl ? <ArrowLeft size={18} /> : <ArrowRight size={18} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
