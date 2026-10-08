import React from 'react';
import { Link } from 'react-router-dom';
import {
  Phone,
  Mail,
  MapPin,
  Shield
} from 'lucide-react';
import {
  InstagramIcon,
  FacebookIcon,
  TikTokIcon,
  TwitterXIcon
} from './SocialIcons';
import { useSite } from '../context/SiteContext';

export default function Footer({ siteSettings: propSettings, categories: propCategories }) {
  const siteCtx = useSite();
  const siteSettings = (propSettings && Object.keys(propSettings).length > 0) ? propSettings : (siteCtx?.siteSettings || {});
  const categories = (propCategories && propCategories.length > 0) ? propCategories : (siteCtx?.categories || []);
  const currentYear = new Date().getFullYear();

  const socialLinks = [
    { key: 'instagram', url: siteSettings?.instagram_url, label: 'Instagram', icon: InstagramIcon },
    { key: 'facebook', url: siteSettings?.facebook_url, label: 'Facebook', icon: FacebookIcon },
    { key: 'tiktok', url: siteSettings?.tiktok_url, label: 'TikTok', icon: TikTokIcon },
    { key: 'x', url: siteSettings?.x_url, label: 'X', icon: TwitterXIcon },
  ].filter((s) => Boolean(s.url));

  const cleanWhatsApp = siteSettings?.whatsapp_number
    ? siteSettings.whatsapp_number.replace(/[^0-9]/g, '')
    : null;

  return (
    <footer className="ks-footer-root" role="contentinfo">
      <div className="ks-footer-container">
        <div className="ks-footer-grid">
          {/* Col 1: Brand & Identity (Sensibly Sized Logo) */}
          <div className="ks-footer-col ks-footer-brand-col">
            <Link to="/" className="ks-footer-brand-link" aria-label="Keeper Sports Home">
              {siteSettings?.logo_path ? (
                <img
                  src={siteSettings.logo_path}
                  alt={siteSettings?.site_name || 'Keeper Sports'}
                  className="ks-footer-logo-img"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    const fb = e.currentTarget.parentElement?.querySelector('.ks-footer-logo-fallback');
                    if (fb) fb.style.display = 'flex';
                  }}
                />
              ) : null}

              <div
                className="ks-footer-logo-fallback"
                style={{ display: siteSettings?.logo_path ? 'none' : 'flex' }}
              >
                <div className="ks-logo-emblem">
                  <svg viewBox="0 0 36 36" fill="none" className="ks-logo-shield-svg">
                    <path
                      d="M18 3L31 8V18C31 26.5 25.5 32 18 34C10.5 32 5 26.5 5 18V8L18 3Z"
                      fill="#E10600"
                    />
                    <path
                      d="M18 10V26M10 18H26"
                      stroke="#FFFFFF"
                      strokeWidth="2.8"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
                <span className="ks-footer-brand-name">{siteSettings?.site_name || 'KEEPER SPORTS'}</span>
              </div>
            </Link>

            <p className="ks-footer-brand-desc">
              Premier destination for authentic football boots, official club kits, goalkeeper gear, and matchday essentials in Lebanon.
            </p>

            {socialLinks.length > 0 && (
              <div className="ks-footer-social-row">
                {socialLinks.map(({ key, url, label, icon: Icon }) => (
                  <a
                    key={key}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ks-footer-social-btn"
                    aria-label={label}
                  >
                    <Icon size={16} />
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Col 2: Navigation Links */}
          <div className="ks-footer-col">
            <h4 className="ks-footer-col-title">NAVIGATION</h4>
            <ul className="ks-footer-links-list">
              <li><Link to="/">Home</Link></li>
              <li><Link to="/products">All Products</Link></li>
              <li><Link to="/categories">Categories</Link></li>
              <li><Link to="/offers">Special Offers</Link></li>
              <li><Link to="/reviews">Customer Reviews</Link></li>
              <li><Link to="/about">About Us</Link></li>
              <li><Link to="/contact">Contact Us</Link></li>
            </ul>
          </div>

          {/* Col 3: Categories from Real DB */}
          <div className="ks-footer-col">
            <h4 className="ks-footer-col-title">CATEGORIES</h4>
            <ul className="ks-footer-links-list">
              {categories && categories.length > 0 ? (
                categories.slice(0, 6).map((cat) => (
                  <li key={cat.id || cat.slug}>
                    <Link to={`/products?category=${encodeURIComponent(cat.slug || cat.id)}`}>
                      {cat.name}
                    </Link>
                  </li>
                ))
              ) : (
                <li><Link to="/products">Browse Catalog</Link></li>
              )}
            </ul>
          </div>

          {/* Col 4: Store Contact & Support */}
          <div className="ks-footer-col">
            <h4 className="ks-footer-col-title">SUPPORT</h4>
            <ul className="ks-footer-contact-list">
              {siteSettings?.phone_number && (
                <li>
                  <Phone size={14} className="ks-footer-contact-icon" />
                  <a href={`tel:${siteSettings.phone_number}`}>{siteSettings.phone_number}</a>
                </li>
              )}
              {siteSettings?.whatsapp_number && (
                <li>
                  <Phone size={14} className="ks-footer-contact-icon" />
                  <a
                    href={`https://wa.me/${cleanWhatsApp}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    WhatsApp Service
                  </a>
                </li>
              )}
              {siteSettings?.email && (
                <li>
                  <Mail size={14} className="ks-footer-contact-icon" />
                  <a href={`mailto:${siteSettings.email}`}>{siteSettings.email}</a>
                </li>
              )}
              {siteSettings?.location_name && (
                <li>
                  <MapPin size={14} className="ks-footer-contact-icon" />
                  <span>{siteSettings.location_name}</span>
                </li>
              )}
            </ul>
          </div>
        </div>

        {/* Bottom Copyright Bar */}
        <div className="ks-footer-bottom">
          <p className="ks-footer-copyright">
            &copy; {currentYear} {siteSettings?.site_name || 'Keeper Sports'}. All rights reserved.
          </p>
          <div className="ks-footer-meta-pill">
            <Shield size={13} style={{ color: 'var(--ks-accent-red)' }} />
            <span>100% Guaranteed Authentic</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
