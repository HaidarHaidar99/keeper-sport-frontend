import React from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import { CheckCircle2, Package, ShieldCheck, ArrowRight, ArrowLeft } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const OrderConfirmationPage = () => {
  const { id } = useParams();
  const location = useLocation();
  const { t, isRtl } = useLanguage();

  const order = location.state?.order;

  return (
    <div style={{ padding: '80px 0 100px' }}>
      <div className="container" style={{ maxWidth: '640px' }}>
        <div className="glass-card" style={{ padding: '48px 36px', textAlign: 'center' }}>
          <div style={{
            width: '72px',
            height: '72px',
            borderRadius: '50%',
            backgroundColor: 'rgba(0, 229, 153, 0.15)',
            color: 'var(--accent-green)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 24px',
            boxShadow: '0 0 24px var(--accent-green-glow)'
          }}>
            <CheckCircle2 size={42} />
          </div>

          <h1 style={{ fontSize: '28px', fontWeight: 900, marginBottom: '8px' }}>
            {t('orderConfirmed')}
          </h1>

          <p style={{ color: 'var(--text-secondary)', fontSize: '15px', lineHeight: 1.6, marginBottom: '28px' }}>
            {isRtl 
              ? "شكراً لاختيارك متجر كيبر سبورتس! سنقوم بتجهيز قميصك ومعداتك الرياضية والتواصل معك لتأكيد موعد التوصيل."
              : "Thank you for supporting Keeper Sports! Our dispatch team is preparing your gear and will contact you for delivery."}
          </p>

          <div style={{
            backgroundColor: 'var(--bg-input)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: '18px 24px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '32px'
          }}>
            <span style={{ color: 'var(--text-muted)', fontSize: '13px', fontWeight: 600 }}>
              {t('orderNumber')}
            </span>
            <span style={{ fontSize: '17px', fontWeight: 900, color: 'var(--accent-cyan)' }}>
              {order?.order_number || id?.slice(0, 8).toUpperCase()}
            </span>
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '12px 16px',
            backgroundColor: 'rgba(0, 240, 255, 0.06)',
            borderRadius: 'var(--radius-sm)',
            color: 'var(--accent-cyan)',
            fontSize: '12px',
            fontWeight: 600,
            marginBottom: '32px',
            textAlign: isRtl ? 'right' : 'left'
          }}>
            <ShieldCheck size={18} style={{ flexShrink: 0 }} />
            <span>{t('saveGuestTokenNotice')}</span>
          </div>

          <div style={{ display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/my-orders" className="btn btn-outline" style={{ gap: '8px' }}>
              <Package size={16} />
              <span>{t('myOrders')}</span>
            </Link>
            <Link to="/products" className="btn btn-primary" style={{ gap: '8px' }}>
              <span>{isRtl ? "متابعة التسوق" : "Continue Shopping"}</span>
              {isRtl ? <ArrowLeft size={16} /> : <ArrowRight size={16} />}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmationPage;
