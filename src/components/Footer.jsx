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
import { useSite } from '../context/SiteContext';

export default function Footer({ siteSettings: propSettings }) {
  const siteCtx = useSite();
  const siteSettings = (propSettings && Object.keys(propSettings).length > 0) ? propSettings : (siteCtx?.siteSettings || {});
  const currentYear = new Date().getFullYear();

  const cleanWhatsApp = siteSettings?.whatsapp_number
    ? siteSettings.whatsapp_number.replace(/[^0-9]/g, '')
    : null;

  const rawSocial = siteSettings?.social_media || {};

  // Social platforms
  const socialLinks = [
    { key: 'instagram', url: rawSocial.instagram?.url || siteSettings?.instagram_url, label: 'Instagram', icon: InstagramIcon },
    { key: 'whatsapp', url: rawSocial.whatsapp?.url || (cleanWhatsApp ? `https://wa.me/${cleanWhatsApp}` : null), label: 'WhatsApp', icon: WhatsAppIcon },
    { key: 'tiktok', url: rawSocial.tiktok?.url || siteSettings?.tiktok_url, label: 'TikTok', icon: TikTokIcon },
    { key: 'youtube', url: rawSocial.youtube?.url || siteSettings?.youtube_url, label: 'YouTube', icon: YouTubeIcon },
    { key: 'facebook', url: rawSocial.facebook?.url || siteSettings?.facebook_url, label: 'Facebook', icon: FacebookIcon },
    { key: 'x', url: rawSocial.x?.url || siteSettings?.x_url, label: 'X', icon: TwitterXIcon }
  ].filter((s) => Boolean(s.url));

  const phoneNumber = siteSettings?.phone_number || '+961 70 973 086';
  const emailAddress = siteSettings?.email || 'support@keepersportlb.com';
  const locationCity = siteSettings?.location?.store_name || 'Beirut';
  const locationAddress = siteSettings?.location?.full_address || siteSettings?.location_name || 'Beirut, Lebanon';

  return (
    <footer className="ks-footer-root" role="contentinfo">
      <div className="ks-footer-container">
        <div className="ks-footer-grid">
          {/* Column 1: Brand Logo + Description + Circular Social Media Icons */}
          <div className="ks-footer-brand-col">
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
                <span style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.4rem', fontWeight: 900, color: '#FFFFFF' }}>
                  {siteSettings?.site_name || 'KEEPER SPORTS'}
                </span>
              </div>
            </Link>

            <p className="ks-footer-brand-desc">
              Keeper Sports — Your exclusive destination for authentic football gear, boots, official kits, and tournament matchday apparel.
            </p>

            {/* Circular Social Buttons Underneath Logo & Description */}
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
                  <a href={`https://wa.me/${cleanWhatsApp || '96170973086'}`} target="_blank" rel="noopener noreferrer" className="ks-footer-social-btn" aria-label="WhatsApp">
                    <WhatsAppIcon size={16} />
                  </a>
                  <a href="https://tiktok.com" target="_blank" rel="noopener noreferrer" className="ks-footer-social-btn" aria-label="TikTok">
                    <TikTokIcon size={16} />
                  </a>
                </>
              )}
            </div>
          </div>

          {/* Column 2: EXPLORE (with Chevron '>' links) */}
          <div className="ks-footer-col">
            <h4 className="ks-footer-col-title">EXPLORE</h4>
            <ul className="ks-footer-links-list">
              <li className="ks-footer-link-item">
                <Link to="/">
                  <ChevronRight size={14} className="ks-footer-link-chevron" />
                  <span>Home</span>
                </Link>
              </li>
              <li className="ks-footer-link-item">
                <Link to="/products">
                  <ChevronRight size={14} className="ks-footer-link-chevron" />
                  <span>Products</span>
                </Link>
              </li>
              <li className="ks-footer-link-item">
                <Link to="/categories">
                  <ChevronRight size={14} className="ks-footer-link-chevron" />
                  <span>Categories</span>
                </Link>
              </li>
              <li className="ks-footer-link-item">
                <Link to="/reviews">
                  <ChevronRight size={14} className="ks-footer-link-chevron" />
                  <span>Reviews</span>
                </Link>
              </li>
              <li className="ks-footer-link-item">
                <Link to="/about">
                  <ChevronRight size={14} className="ks-footer-link-chevron" />
                  <span>About Us</span>
                </Link>
              </li>
              <li className="ks-footer-link-item">
                <Link to="/contact">
                  <ChevronRight size={14} className="ks-footer-link-chevron" />
                  <span>Contact</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: CONTACT & SERVICES */}
          <div className="ks-footer-col">
            <h4 className="ks-footer-col-title">CONTACT & SERVICES</h4>
            <ul className="ks-footer-contact-list">
              <li className="ks-footer-contact-item">
                <Phone size={15} className="ks-footer-contact-icon" />
                <a href={`tel:${phoneNumber}`}>{phoneNumber}</a>
              </li>
              <li className="ks-footer-contact-item">
                <Mail size={15} className="ks-footer-contact-icon" />
                <a href={`mailto:${emailAddress}`}>{emailAddress}</a>
              </li>
              <li className="ks-footer-contact-item">
                <WhatsAppIcon size={15} className="ks-footer-contact-icon" />
                <a
                  href={`https://wa.me/${cleanWhatsApp || '96170973086'}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  WhatsApp Chat
                </a>
              </li>
            </ul>
          </div>

          {/* Column 4: LOCATIONS */}
          <div className="ks-footer-col">
            <h4 className="ks-footer-col-title">LOCATIONS</h4>
            <div className="ks-footer-location-block">
              <div className="ks-footer-location-name">
                <MapPin size={16} className="ks-footer-contact-icon" />
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
