import React from 'react';
import { Link } from 'react-router-dom';
import { 
  ShieldCheck, 
  MapPin, 
  Phone, 
  Mail, 
  Shirt, 
  RefreshCw,
  MessageCircle
} from 'lucide-react';
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <div style={{
                width: '34px',
                height: '34px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'var(--brand-red)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: 'var(--shadow-red)'
              }}>
                <Shirt size={18} color="#FFFFFF" strokeWidth={2.2} />
              </div>
              <span style={{ fontSize: '18px', fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '0.5px' }}>
                KEEPER <span style={{ color: 'var(--brand-red)' }}>SPORTS</span>
              </span>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: 1.6, marginBottom: '18px' }}>
              {isRtl 
                ? "وجهتك الرياضية الأولى للأطقم والأحذية الأصلية وكل ما يحتاجه لاعب كرة القدم بأعلى معايير الجودة." 
                : "Your premier destination for authentic football shirts, pro boots, elite equipment, and bespoke team kit design."}
            </p>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--brand-gold-light)',
              color: 'var(--brand-gold)',
              fontSize: '12px',
              fontWeight: 700
            }}>
              <RefreshCw size={14} />
              <span>{isRtl ? "استبدال المقاس متاح — لا يوجد استرجاع للأموال" : "Exchanges Only — No Refunds"}</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 style={{ fontSize: '15px', fontWeight: 800, marginBottom: '16px', color: 'var(--text-primary)' }}>
              {isRtl ? "روابط المتجر" : "Store Navigation"}
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '14px', color: 'var(--text-secondary)' }}>
              <li>
                <Link to="/products" style={{ transition: 'color var(--transition-fast)' }}>
                  {t('shop')}
                </Link>
              </li>
              <li>
                <Link to="/custom-kit" style={{ color: 'var(--brand-red)', fontWeight: 700 }}>
                  {t('customKit')}
                </Link>
              </li>
              <li>
                <Link to="/my-orders">
                  {t('myOrders')}
                </Link>
              </li>
              <li>
                <Link to="/favorites">
                  {t('favorites')}
                </Link>
              </li>
              <li>
                <Link to="/reviews">
                  {t('reviews')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Care & Policies */}
          <div>
            <h4 style={{ fontSize: '15px', fontWeight: 800, marginBottom: '16px', color: 'var(--text-primary)' }}>
              {isRtl ? "الضمان والسياسات" : "Customer Care & Policy"}
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '14px', color: 'var(--text-secondary)' }}>
              <li style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <ShieldCheck size={16} color="var(--brand-green)" />
                <span style={{ fontWeight: 600 }}>{isRtl ? "أطقم أصلية 100% مضمونة" : "100% Guaranteed Pitch Authentic"}</span>
              </li>
              <li>
                <Link to="/about">
                  {t('about')}
                </Link>
              </li>
              <li>
                <Link to="/contact">
                  {t('contact')}
                </Link>
              </li>
              <li>
                <Link to="/admin/login" style={{ color: 'var(--text-muted)', fontSize: '12px' }}>
                  {t('adminPanel')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Direct WhatsApp & Social Links */}
          <div>
            <h4 style={{ fontSize: '15px', fontWeight: 800, marginBottom: '16px', color: 'var(--text-primary)' }}>
              {isRtl ? "تواصل وطلب فوري" : "Direct Order & Contact"}
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '14px', color: 'var(--text-secondary)' }}>
              <a 
                href="https://wa.me/96170000000" 
                target="_blank" 
                rel="noopener noreferrer"
                style={{ 
                  display: 'inline-flex', 
                  alignItems: 'center', 
                  gap: '8px', 
                  color: 'var(--brand-green)', 
                  fontWeight: 700 
                }}
              >
                <MessageCircle size={17} />
                <span>WhatsApp: +961 70 000 000</span>
              </a>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Phone size={15} color="var(--brand-red)" />
                <span>+961 1 000 000</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Mail size={15} color="var(--brand-red)" />
                <span>support@keepersports.com</span>
              </div>

              {/* Social Channels */}
              <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
                <a 
                  href="https://instagram.com" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  aria-label="Instagram"
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-medium)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--text-primary)',
                    backgroundColor: 'var(--bg-input)'
                  }}
                >
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
                  </svg>
                </a>
                <a 
                  href="https://facebook.com" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  aria-label="Facebook"
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-medium)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--text-primary)',
                    backgroundColor: 'var(--bg-input)'
                  }}
                >
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
                  </svg>
                </a>
                <a 
                  href="https://tiktok.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  aria-label="TikTok"
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-medium)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--text-primary)',
                    backgroundColor: 'var(--bg-input)'
                  }}
                >
                  <span style={{ fontSize: '13px', fontWeight: 900 }}>TT</span>
                </a>
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
            <span style={{ fontWeight: 600 }}>{t('tagline')}</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
