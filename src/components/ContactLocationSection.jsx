import React from 'react';
import { Link } from 'react-router-dom';
import {
  MapPin,
  Phone,
  Mail,
  ExternalLink,
  ArrowRight
} from 'lucide-react';
import {
  InstagramIcon,
  FacebookIcon,
  TikTokIcon,
  TwitterXIcon
} from './SocialIcons';

export default function ContactLocationSection({ siteSettings = {} }) {
  const hasPhone = Boolean(siteSettings?.phone_number);
  const hasWhatsApp = Boolean(siteSettings?.whatsapp_number);
  const hasEmail = Boolean(siteSettings?.email);
  const hasLocation = Boolean(siteSettings?.location_name);
  const hasMapLink = Boolean(siteSettings?.location_url);

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
    <section className="ks-contact-location-section" aria-label="Store Location and Inquiries">
      <div className="ks-contact-location-container">
        <div className="ks-contact-location-card">
          <div className="ks-contact-location-header">
            <span className="ks-section-eyebrow">STORE HEADQUARTERS</span>
            <h2 className="ks-section-title">VISIT &amp; CONNECT</h2>
            <p className="ks-contact-location-desc">
              Experience authentic goalkeeper performance and matchday gear in person, or get direct assistance from our gear specialists.
            </p>
          </div>

          <div className="ks-contact-location-grid">
            {/* Location Details */}
            {hasLocation && (
              <div className="ks-contact-info-block">
                <div className="ks-contact-icon-wrap">
                  <MapPin size={20} />
                </div>
                <div className="ks-contact-info-content">
                  <h4 className="ks-contact-block-label">STORE LOCATION</h4>
                  <p className="ks-contact-block-val">{siteSettings.location_name}</p>
                  {hasMapLink && (
                    <a
                      href={siteSettings.location_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ks-contact-map-link"
                    >
                      <span>Open in Maps</span>
                      <ExternalLink size={13} />
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* Direct Line / WhatsApp */}
            {(hasPhone || hasWhatsApp) && (
              <div className="ks-contact-info-block">
                <div className="ks-contact-icon-wrap">
                  <Phone size={20} />
                </div>
                <div className="ks-contact-info-content">
                  <h4 className="ks-contact-block-label">MATCHDAY HOTLINE</h4>
                  {hasPhone && (
                    <a href={`tel:${siteSettings.phone_number}`} className="ks-contact-phone-link">
                      {siteSettings.phone_number}
                    </a>
                  )}
                  {hasWhatsApp && (
                    <a
                      href={`https://wa.me/${cleanWhatsApp}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ks-contact-whatsapp-link"
                    >
                      <span>Chat on WhatsApp</span>
                      <ArrowRight size={13} />
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* Email Support */}
            {hasEmail && (
              <div className="ks-contact-info-block">
                <div className="ks-contact-icon-wrap">
                  <Mail size={20} />
                </div>
                <div className="ks-contact-info-content">
                  <h4 className="ks-contact-block-label">OFFICIAL INQUIRIES</h4>
                  <a href={`mailto:${siteSettings.email}`} className="ks-contact-email-link">
                    {siteSettings.email}
                  </a>
                </div>
              </div>
            )}
          </div>

          {/* Social Channels & Contact Action */}
          <div className="ks-contact-location-footer">
            {socialLinks.length > 0 && (
              <div className="ks-contact-social-row">
                <span className="ks-contact-social-title">Follow Us:</span>
                <div className="ks-contact-social-icons">
                  {socialLinks.map(({ key, url, label, icon: Icon }) => (
                    <a
                      key={key}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ks-contact-social-btn"
                      aria-label={label}
                      title={label}
                    >
                      <Icon size={17} />
                    </a>
                  ))}
                </div>
              </div>
            )}

            <div className="ks-contact-cta-wrap">
              <Link to="/contact" className="ks-contact-message-btn">
                <span>Send a Message</span>
                <ArrowRight size={15} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
