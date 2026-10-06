import React from 'react';
import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, ShieldCheck } from 'lucide-react';
import { useSite } from '../context/SiteContext';

export default function Footer({ siteSettings: propSettings, categories: propCategories }) {
  const siteCtx = useSite();
  const siteSettings = (propSettings && Object.keys(propSettings).length > 0) ? propSettings : (siteCtx?.siteSettings || {});
  const categories = (propCategories && propCategories.length > 0) ? propCategories : (siteCtx?.categories || []);
  const currentYear = new Date().getFullYear();

  return (
    <footer className="ks-footer-root">
      <div className="ks-footer-container">
        <div className="ks-footer-grid">
          {/* Col 1: Brand & Identity */}
          <div className="ks-footer-col ks-footer-brand-col">
            <Link to="/" className="ks-footer-brand-link">
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
                <div className="ks-logo-text-block">
                  <span className="ks-logo-primary">{siteSettings?.site_name || 'KEEPER SPORTS'}</span>
                  <span className="ks-logo-secondary">AUTHENTIC FOOTBALL GEAR</span>
                </div>
              </div>
            </Link>

            <p className="ks-footer-brand-desc">
              Lebanon's premier source for authentic football boots, official club kits, goalkeeper gear, and professional match equipment.
            </p>

            <div className="ks-footer-guarantee-pill">
              <ShieldCheck size={16} style={{ color: 'var(--ks-accent-red)' }} />
              <span>100% Guaranteed Authentic</span>
            </div>
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

          {/* Col 3: Categories (from real database) */}
          <div className="ks-footer-col">
            <h4 className="ks-footer-col-title">GEAR CATEGORIES</h4>
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
                <>
                  <li><Link to="/products">Football Boots</Link></li>
                  <li><Link to="/products">Goalkeeper Gloves</Link></li>
                  <li><Link to="/products">Official Jerseys</Link></li>
                  <li><Link to="/products">Training Gear</Link></li>
                </>
              )}
            </ul>
          </div>

          {/* Col 4: Store Contact & Support (Only real configured info) */}
          <div className="ks-footer-col">
            <h4 className="ks-footer-col-title">CUSTOMER SUPPORT</h4>
            <ul className="ks-footer-contact-list">
              {siteSettings?.phone_number && (
                <li>
                  <Phone size={15} className="ks-footer-contact-icon" />
                  <a href={`tel:${siteSettings.phone_number}`}>{siteSettings.phone_number}</a>
                </li>
              )}
              {siteSettings?.whatsapp_number && (
                <li>
                  <Phone size={15} className="ks-footer-contact-icon" />
                  <a
                    href={`https://wa.me/${siteSettings.whatsapp_number.replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    WhatsApp Support
                  </a>
                </li>
              )}
              {siteSettings?.email && (
                <li>
                  <Mail size={15} className="ks-footer-contact-icon" />
                  <a href={`mailto:${siteSettings.email}`}>{siteSettings.email}</a>
                </li>
              )}
              {siteSettings?.location_name && (
                <li>
                  <MapPin size={15} className="ks-footer-contact-icon" />
                  <span>{siteSettings.location_name}</span>
                </li>
              )}
            </ul>

            {/* Social Links when configured */}
            {(siteSettings?.instagram_url || siteSettings?.facebook_url || siteSettings?.tiktok_url || siteSettings?.x_url) && (
              <div className="ks-footer-socials-row">
                {siteSettings.instagram_url && (
                  <a href={siteSettings.instagram_url} target="_blank" rel="noopener noreferrer" className="ks-footer-social-link" aria-label="Instagram">
                    IG
                  </a>
                )}
                {siteSettings.facebook_url && (
                  <a href={siteSettings.facebook_url} target="_blank" rel="noopener noreferrer" className="ks-footer-social-link" aria-label="Facebook">
                    FB
                  </a>
                )}
                {siteSettings.tiktok_url && (
                  <a href={siteSettings.tiktok_url} target="_blank" rel="noopener noreferrer" className="ks-footer-social-link" aria-label="TikTok">
                    TT
                  </a>
                )}
                {siteSettings.x_url && (
                  <a href={siteSettings.x_url} target="_blank" rel="noopener noreferrer" className="ks-footer-social-link" aria-label="X">
                    X
                  </a>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="ks-footer-bottom">
          <p className="ks-footer-copy">
            &copy; {currentYear} {siteSettings?.site_name || 'Keeper Sports'}. All rights reserved.
          </p>
          <div className="ks-footer-bottom-links">
            <Link to="/about">Authenticity Promise</Link>
            <span className="ks-footer-dot">·</span>
            <Link to="/contact">Help &amp; Inquiries</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
