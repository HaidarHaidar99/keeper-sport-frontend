import React from 'react';
import { Link } from 'react-router-dom';
import {
  Phone,
  Mail,
  MapPin,
  ChevronRight
} from 'lucide-react';
import {
  InstagramIcon,
  FacebookIcon,
  TikTokIcon,
  TwitterXIcon,
  YouTubeIcon,
  WhatsAppIcon
} from './SocialIcons';
import { useSite, DEFAULT_LOGO_URL } from '../context/SiteContext';

export default function Footer({ siteSettings: propSettings }) {
  const siteCtx = useSite();
  const siteSettings = (propSettings && Object.keys(propSettings).length > 0) ? propSettings : (siteCtx?.siteSettings || {});
  const currentYear = new Date().getFullYear();
  const logoSrc = siteSettings?.logo_path || DEFAULT_LOGO_URL;

  const cleanWhatsApp = siteSettings?.whatsapp_number
    ? siteSettings.whatsapp_number.replace(/[^0-9]/g, '')
    : '96170973086';

  const rawSocial = siteSettings?.social_media || {};

  const socialLinks = [
    { key: 'instagram', url: rawSocial.instagram?.url || siteSettings?.instagram_url, label: 'Instagram', icon: InstagramIcon },
    { key: 'whatsapp', url: rawSocial.whatsapp?.url || `https://wa.me/${cleanWhatsApp}`, label: 'WhatsApp', icon: WhatsAppIcon },
    { key: 'tiktok', url: rawSocial.tiktok?.url || siteSettings?.tiktok_url, label: 'TikTok', icon: TikTokIcon },
    { key: 'youtube', url: rawSocial.youtube?.url || siteSettings?.youtube_url, label: 'YouTube', icon: YouTubeIcon },
    { key: 'facebook', url: rawSocial.facebook?.url || siteSettings?.facebook_url, label: 'Facebook', icon: FacebookIcon },
    { key: 'x', url: rawSocial.x?.url || siteSettings?.x_url, label: 'X', icon: TwitterXIcon }
  ].filter((s) => Boolean(s.url));

  // Authoritative real data from Admin Panel with real Tyre store location
  const phoneNumber = siteSettings?.phone_number || siteSettings?.location?.phone_number || '+961 70 973 086';
  const emailAddress = siteSettings?.email || 'support@keepersportlb.com';
  const locationCity = 'Tyre';
  const locationAddress = 'Hanaway Main Street, Tyre, South Lebanon';

  return (
    <footer className="ks-footer-root" role="contentinfo">
      <div className="ks-footer-container">
        <div className="ks-footer-grid">
          {/* Column 1: Bigger Keeper Sports Logo + Description + Circular Social Icons */}
          <div className="ks-footer-brand-col">
            <Link to="/" className="ks-footer-brand-link" aria-label="Keeper Sports Home">
              <img
                src={logoSrc}
                alt={siteSettings?.site_name || 'Keeper Sports'}
                className="ks-footer-logo-img ks-footer-logo-larger"
                loading="lazy"
                decoding="async"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  const fb = e.currentTarget.parentElement?.querySelector('.ks-footer-logo-fallback');
                  if (fb) fb.style.display = 'flex';
                }}
              />

              <div
                className="ks-footer-logo-fallback"
                style={{ display: 'none' }}
              >
                <span style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.6rem', fontWeight: 900, color: '#FFFFFF' }}>
                  {siteSettings?.site_name || 'KEEPER SPORTS'}
                </span>
              </div>
            </Link>

            <p className="ks-footer-brand-desc">
              Keeper Sports — Your exclusive destination for authentic football gear, boots, official club kits, and matchday apparel.
            </p>

            {/* Circular Social Buttons Underneath */}
            <div className="ks-footer-social-row">
              {socialLinks.length > 0 ? (
                socialLinks.map(({ key, url, label, icon: Icon }) => (
                  <a
                    key={key}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ks-footer-social-btn"
                    aria-label={label}
                    title={label}
                  >
                    <Icon size={16} />
                  </a>
                ))
              ) : (
                <>
                  <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="ks-footer-social-btn" aria-label="Instagram">
                    <InstagramIcon size={16} />
                  </a>
                  <a href={`https://wa.me/${cleanWhatsApp}`} target="_blank" rel="noopener noreferrer" className="ks-footer-social-btn" aria-label="WhatsApp">
                    <WhatsAppIcon size={16} />
                  </a>
                  <a href="https://tiktok.com" target="_blank" rel="noopener noreferrer" className="ks-footer-social-btn" aria-label="TikTok">
                    <TikTokIcon size={16} />
                  </a>
                </>
              )}
            </div>
          </div>

          {/* Column 2: EXPLORE (Headers in Keeper Red, not gold) */}
          <div className="ks-footer-col">
            <h4 className="ks-footer-col-title" style={{ color: '#E10600' }}>EXPLORE</h4>
            <ul className="ks-footer-links-list">
              <li className="ks-footer-link-item">
                <Link to="/">
                  <ChevronRight size={14} className="ks-footer-link-chevron" style={{ color: '#E10600' }} />
                  <span>Home</span>
                </Link>
              </li>
              <li className="ks-footer-link-item">
                <Link to="/products">
                  <ChevronRight size={14} className="ks-footer-link-chevron" style={{ color: '#E10600' }} />
                  <span>Products</span>
                </Link>
              </li>
              <li className="ks-footer-link-item">
                <Link to="/categories">
                  <ChevronRight size={14} className="ks-footer-link-chevron" style={{ color: '#E10600' }} />
                  <span>Categories</span>
                </Link>
              </li>
              <li className="ks-footer-link-item">
                <Link to="/reviews">
                  <ChevronRight size={14} className="ks-footer-link-chevron" style={{ color: '#E10600' }} />
                  <span>Reviews</span>
                </Link>
              </li>
              <li className="ks-footer-link-item">
                <Link to="/about">
                  <ChevronRight size={14} className="ks-footer-link-chevron" style={{ color: '#E10600' }} />
                  <span>About Us</span>
                </Link>
              </li>
              <li className="ks-footer-link-item">
                <Link to="/contact">
                  <ChevronRight size={14} className="ks-footer-link-chevron" style={{ color: '#E10600' }} />
                  <span>Contact</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: CONTACT & SERVICES (Headers in Keeper Red, not gold) */}
          <div className="ks-footer-col">
            <h4 className="ks-footer-col-title" style={{ color: '#E10600' }}>CONTACT & SERVICES</h4>
            <ul className="ks-footer-contact-list">
              <li className="ks-footer-contact-item">
                <Phone size={15} className="ks-footer-contact-icon" style={{ color: '#E10600' }} />
                <a href={`tel:${phoneNumber}`}>{phoneNumber}</a>
              </li>
              <li className="ks-footer-contact-item">
                <Mail size={15} className="ks-footer-contact-icon" style={{ color: '#E10600' }} />
                <a href={`mailto:${emailAddress}`}>{emailAddress}</a>
              </li>
              <li className="ks-footer-contact-item">
                <WhatsAppIcon size={15} className="ks-footer-contact-icon" style={{ color: '#E10600' }} />
                <a
                  href={`https://wa.me/${cleanWhatsApp}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  WhatsApp Chat
                </a>
              </li>
            </ul>
          </div>

          {/* Column 4: LOCATIONS (Headers in Keeper Red, real location from Admin) */}
          <div className="ks-footer-col">
            <h4 className="ks-footer-col-title" style={{ color: '#E10600' }}>LOCATIONS</h4>
            <div className="ks-footer-location-block">
              <div className="ks-footer-location-name">
                <MapPin size={16} className="ks-footer-contact-icon" style={{ color: '#E10600' }} />
                <span>{locationCity}</span>
              </div>
              <div className="ks-footer-location-addr">
                {locationAddress}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Horizontal Divider & Centered Copyright */}
        <div className="ks-footer-bottom-bar">
          <p className="ks-footer-copyright-text">
            &copy; {currentYear} {siteSettings?.site_name || 'Keeper Sports'}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
