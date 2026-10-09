import React from 'react';
import { Link } from 'react-router-dom';
import {
  Phone,
  Mail,
  Clock,
  ArrowRight
} from 'lucide-react';
import {
  InstagramIcon,
  FacebookIcon,
  TikTokIcon,
  YouTubeIcon,
  WhatsAppIcon
} from './SocialIcons';

export default function SocialMediaSection({ siteSettings = {} }) {
  const rawSocial = siteSettings?.social_media || {};

  const cleanWhatsApp = siteSettings?.whatsapp_number
    ? siteSettings.whatsapp_number.replace(/[^0-9]/g, '')
    : '96170973086';

  const phoneNumber = siteSettings?.phone_number || '+961 70 973 086';

  const emailAddress = siteSettings?.email && !siteSettings.email.includes('support@keepersportlb.com')
    ? siteSettings.email
    : 'keepersportlb@gmail.com';

  const instagramUrl = rawSocial.instagram?.url || siteSettings?.instagram_url || 'https://instagram.com/keepersportlb';
  const tiktokUrl = rawSocial.tiktok?.url || siteSettings?.tiktok_url || 'https://tiktok.com/@keepersportlb';
  const youtubeUrl = rawSocial.youtube?.url || siteSettings?.youtube_url;
  const facebookUrl = rawSocial.facebook?.url || siteSettings?.facebook_url;
  const whatsappUrl = rawSocial.whatsapp?.url || `https://wa.me/${cleanWhatsApp}`;

  return (
    <section className="ks-getintouch-section" aria-label="Get in Touch">
      <div className="ks-getintouch-container" style={{ maxWidth: '1360px', margin: '0 auto', padding: '0 24px' }}>
        {/* Main Get In Touch Card (Matching Screenshot 2 with 24px Radius) */}
        <div
          className="ks-getintouch-card"
          style={{
            backgroundColor: 'var(--ks-bg-card, #0E0E0E)',
            border: '1px solid var(--ks-border-card, #222222)',
            borderRadius: '24px',
            padding: '40px 36px',
            boxShadow: 'var(--ks-shadow-card, 0 10px 40px rgba(0, 0, 0, 0.15))'
          }}
        >
          {/* Card Header: Title on Left, 'GET IN TOUCH ->' Button on Right */}
          <div
            className="ks-getintouch-header"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '16px',
              marginBottom: '32px'
            }}
          >
            <div>
              <span
                style={{
                  display: 'block',
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  letterSpacing: '0.14em',
                  textTransform: 'uppercase',
                  color: '#E10600',
                  marginBottom: '6px'
                }}
              >
                CONTACT
              </span>
              <h2
                style={{
                  fontFamily: 'Outfit, sans-serif',
                  fontSize: 'clamp(1.8rem, 3.5vw, 2.5rem)',
                  fontWeight: 900,
                  color: 'var(--ks-text-title, #FFFFFF)',
                  margin: 0
                }}
              >
                Get in Touch
              </h2>
            </div>

            <Link
              to="/contact"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                height: '46px',
                padding: '0 24px',
                borderRadius: '24px',
                backgroundColor: '#E10600',
                color: '#FFFFFF',
                textDecoration: 'none',
                fontSize: '0.82rem',
                fontWeight: 900,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                transition: 'background-color 0.2s ease'
              }}
            >
              <span>GET IN TOUCH</span>
              <ArrowRight size={16} />
            </Link>
          </div>

          {/* 4 Info Cards Grid */}
          <div
            className="ks-getintouch-grid"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: '16px',
              marginBottom: '36px'
            }}
          >
            {/* 1. Phone Card */}
            <a
              href={`tel:${phoneNumber}`}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
                padding: '20px',
                backgroundColor: 'var(--ks-bg-surface, #141414)',
                border: '1px solid var(--ks-border-subtle, #242424)',
                borderRadius: '20px',
                textDecoration: 'none',
                color: 'var(--ks-text-title, #FFFFFF)'
              }}
            >
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(225, 6, 0, 0.1)',
                  color: '#E10600',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}
              >
                <Phone size={18} />
              </div>
              <div>
                <span style={{ display: 'block', fontSize: '0.72rem', fontWeight: 800, color: '#E10600', textTransform: 'uppercase' }}>
                  PHONE
                </span>
                <span style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--ks-text-title, #FFFFFF)' }}>
                  {phoneNumber}
                </span>
              </div>
            </a>

            {/* 2. WhatsApp Card */}
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
                padding: '20px',
                backgroundColor: 'var(--ks-bg-surface, #141414)',
                border: '1px solid var(--ks-border-subtle, #242424)',
                borderRadius: '20px',
                textDecoration: 'none',
                color: 'var(--ks-text-title, #FFFFFF)'
              }}
            >
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(37, 211, 102, 0.12)',
                  color: '#25D366',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}
              >
                <WhatsAppIcon size={18} />
              </div>
              <div>
                <span style={{ display: 'block', fontSize: '0.72rem', fontWeight: 800, color: '#E10600', textTransform: 'uppercase' }}>
                  WHATSAPP
                </span>
                <span style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--ks-text-title, #FFFFFF)' }}>
                  Chat with us
                </span>
              </div>
            </a>

            {/* 3. Email Card */}
            <a
              href={`mailto:${emailAddress}`}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
                padding: '20px',
                backgroundColor: 'var(--ks-bg-surface, #141414)',
                border: '1px solid var(--ks-border-subtle, #242424)',
                borderRadius: '20px',
                textDecoration: 'none',
                color: 'var(--ks-text-title, #FFFFFF)'
              }}
            >
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(225, 6, 0, 0.1)',
                  color: '#E10600',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}
              >
                <Mail size={18} />
              </div>
              <div style={{ overflow: 'hidden' }}>
                <span style={{ display: 'block', fontSize: '0.72rem', fontWeight: 800, color: '#E10600', textTransform: 'uppercase' }}>
                  E-MAIL
                </span>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--ks-text-title, #FFFFFF)', wordBreak: 'break-all' }}>
                  {emailAddress}
                </span>
              </div>
            </a>

            {/* 4. Opening Hours Card */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
                padding: '20px',
                backgroundColor: 'var(--ks-bg-surface, #141414)',
                border: '1px solid var(--ks-border-subtle, #242424)',
                borderRadius: '20px',
                color: 'var(--ks-text-title, #FFFFFF)'
              }}
            >
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(225, 6, 0, 0.1)',
                  color: '#E10600',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}
              >
                <Clock size={18} />
              </div>
              <div>
                <span style={{ display: 'block', fontSize: '0.72rem', fontWeight: 800, color: '#E10600', textTransform: 'uppercase' }}>
                  OPENING HOURS
                </span>
                <span style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--ks-text-title, #FFFFFF)' }}>
                  Mon – Sat: 10:00 – 19:00
                </span>
                <span style={{ display: 'block', fontSize: '0.78rem', color: 'var(--ks-text-muted, #A3A3A3)' }}>
                  Sunday: 11:00 – 18:00
                </span>
              </div>
            </div>
          </div>

          {/* Social Channels Strip Inside the Card */}
          <div
            style={{
              paddingTop: '24px',
              borderTop: '1px solid var(--ks-divider-line, #202020)',
              textAlign: 'center'
            }}
          >
            <span
              style={{
                display: 'block',
                fontSize: '0.72rem',
                fontWeight: 800,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: '#E10600',
                marginBottom: '16px'
              }}
            >
              OFFICIAL CHANNELS & SOCIAL NETWORKS
            </span>

            {/* Circular Social Icons in Red & Dark (No Gold!) */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', flexWrap: 'wrap' }}>
              {/* Email / Gmail */}
              <a
                href={`mailto:${emailAddress}`}
                className="ks-social-round-btn"
                aria-label="Email Us"
                title="Email Us"
              >
                <Mail size={16} />
              </a>

              {/* WhatsApp */}
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="ks-social-round-btn"
                aria-label="WhatsApp Chat"
                title="WhatsApp Chat"
              >
                <WhatsAppIcon size={16} />
              </a>

              {/* Phone */}
              <a
                href={`tel:${phoneNumber}`}
                className="ks-social-round-btn"
                aria-label="Call Us"
                title="Call Us"
              >
                <Phone size={16} />
              </a>

              {/* TikTok */}
              <a
                href={tiktokUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="ks-social-round-btn"
                aria-label="TikTok"
                title="TikTok"
              >
                <TikTokIcon size={16} />
              </a>

              {/* Instagram */}
              <a
                href={instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="ks-social-round-btn"
                aria-label="Instagram"
                title="Instagram"
              >
                <InstagramIcon size={16} />
              </a>

              {/* YouTube if configured */}
              {youtubeUrl && (
                <a
                  href={youtubeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ks-social-round-btn"
                  aria-label="YouTube"
                  title="YouTube"
                >
                  <YouTubeIcon size={16} />
                </a>
              )}

              {/* Facebook if configured */}
              {facebookUrl && (
                <a
                  href={facebookUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ks-social-round-btn"
                  aria-label="Facebook"
                  title="Facebook"
                >
                  <FacebookIcon size={16} />
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
