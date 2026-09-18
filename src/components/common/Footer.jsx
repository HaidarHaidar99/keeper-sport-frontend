import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, MapPin, Phone, Mail, Shirt, RefreshCw } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

const Footer = () => {
  const { t, isRtl } = useLanguage();

  return (
    <footer style={{
      backgroundColor: 'var(--bg-surface)',
      borderTop: '1px solid var(--border-subtle)',
      marginTop: '80px',
      paddingTop: '60px',
      paddingBottom: '30px'
    }}>
      <div className="container">
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '40px',
          marginBottom: '50px'
        }}>
          {/* Brand Col */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, var(--accent-cyan) 0%, #0077B6 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Shirt size={18} color="#040914" />
              </div>
              <span style={{ fontSize: '18px', fontWeight: 900, color: '#fff' }}>KEEPER SPORTS</span>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: 1.6, marginBottom: '18px' }}>
              {isRtl 
                ? "وجهتك الأولى لقمصان وأحذية كرة القدم الأصلية، وتصميم الأطقم المخصصة بأحدث التقنيات." 
                : "Your premier destination for authentic football shirts, boots, accessories, and interactive 2D custom jersey design."}
            </p>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'rgba(255, 184, 0, 0.1)',
              color: 'var(--accent-gold)',
              fontSize: '12px',
              fontWeight: 700
            }}>
              <RefreshCw size={14} />
              <span>{isRtl ? "استبدال فقط — لا يوجد استرجاع للأموال" : "Exchanges Only — No Refunds"}</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 style={{ fontSize: '15px', fontWeight: 800, marginBottom: '16px', color: 'var(--text-primary)' }}>
              {isRtl ? "روابط سريعة" : "Quick Links"}
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '14px', color: 'var(--text-secondary)' }}>
              <li><Link to="/products" style={{ transition: 'color var(--transition-fast)' }}>{t('shop')}</Link></li>
              <li><Link to="/custom-kit" style={{ color: 'var(--accent-cyan)' }}>{t('customKit')}</Link></li>
              <li><Link to="/my-orders">{t('myOrders')}</Link></li>
              <li><Link to="/favorites">{t('favorites')}</Link></li>
              <li><Link to="/reviews">{t('reviews')}</Link></li>
            </ul>
          </div>

          {/* Customer Care & Store Policy */}
          <div>
            <h4 style={{ fontSize: '15px', fontWeight: 800, marginBottom: '16px', color: 'var(--text-primary)' }}>
              {isRtl ? "خدمة العملاء والسياسات" : "Customer Care & Policy"}
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '14px', color: 'var(--text-secondary)' }}>
              <li style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <ShieldCheck size={16} color="var(--accent-green)" />
                <span>{isRtl ? "ضمان المنتجات الأصلية 100%" : "100% Guaranteed Authenticity"}</span>
              </li>
              <li><Link to="/about">{t('about')}</Link></li>
              <li><Link to="/contact">{t('contact')}</Link></li>
              <li><Link to="/admin/login" style={{ color: 'var(--text-muted)', fontSize: '12px' }}>{t('adminPanel')}</Link></li>
            </ul>
          </div>

          {/* Physical Store Location */}
          <div>
            <h4 style={{ fontSize: '15px', fontWeight: 800, marginBottom: '16px', color: 'var(--text-primary)' }}>
              {isRtl ? "معرضنا الفعلي" : "Physical Store"}
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '14px', color: 'var(--text-secondary)' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                <MapPin size={18} color="var(--accent-cyan)" style={{ flexShrink: 0, marginTop: '2px' }} />
                <span>{isRtl ? "شارع فلسطين، بجانب الملعب الرياضي الرئيسي" : "Palestine Street, next to Main Sports Arena"}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Phone size={16} color="var(--accent-cyan)" />
                <span>+964 770 000 0000</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Mail size={16} color="var(--accent-cyan)" />
                <span>support@keepersports.com</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div style={{
          paddingTop: '24px',
          borderTop: '1px solid var(--border-subtle)',
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '12px',
          fontSize: '13px',
          color: 'var(--text-muted)'
        }}>
          <div>
            © {new Date().getFullYear()} Keeper Sports. {isRtl ? "جميع الحقوق محفوظة." : "All rights reserved."}
          </div>
          <div style={{ display: 'flex', gap: '16px' }}>
            <span>Built for Performance & Authenticity</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
