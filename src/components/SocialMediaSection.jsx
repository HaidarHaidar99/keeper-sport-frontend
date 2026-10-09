import React from 'react';
import {
  InstagramIcon,
  FacebookIcon,
  TikTokIcon,
  TwitterXIcon,
  YouTubeIcon,
  WhatsAppIcon
} from './SocialIcons';

export default function SocialMediaSection({ siteSettings = {} }) {
  // Read from merged siteSettings or dedicated social array
  const rawSocial = siteSettings?.social_media || {};

  const cleanWhatsApp = siteSettings?.whatsapp_number
    ? siteSettings.whatsapp_number.replace(/[^0-9]/g, '')
    : null;

  const platforms = [
    {
      key: 'instagram',
      name: 'Instagram',
      handle: '@keepersportlb',
      url: rawSocial.instagram?.url || siteSettings?.instagram_url,
      enabled: rawSocial.instagram?.is_enabled !== undefined ? rawSocial.instagram.is_enabled : Boolean(siteSettings?.instagram_url),
      icon: InstagramIcon
    },
    {
      key: 'facebook',
      name: 'Facebook',
      handle: 'Keeper Sports Lebanon',
      url: rawSocial.facebook?.url || siteSettings?.facebook_url,
      enabled: rawSocial.facebook?.is_enabled !== undefined ? rawSocial.facebook.is_enabled : Boolean(siteSettings?.facebook_url),
      icon: FacebookIcon
    },
    {
      key: 'whatsapp',
      name: 'WhatsApp',
      handle: siteSettings?.whatsapp_number || 'Direct Matchday Service',
      url: rawSocial.whatsapp?.url || (cleanWhatsApp ? `https://wa.me/${cleanWhatsApp}` : null),
      enabled: rawSocial.whatsapp?.is_enabled !== undefined ? rawSocial.whatsapp.is_enabled : Boolean(siteSettings?.whatsapp_number),
      icon: WhatsAppIcon
    },
    {
      key: 'x',
      name: 'X (Twitter)',
      handle: '@keepersportlb',
      url: rawSocial.x?.url || siteSettings?.x_url,
      enabled: rawSocial.x?.is_enabled !== undefined ? rawSocial.x.is_enabled : Boolean(siteSettings?.x_url),
      icon: TwitterXIcon
    },
    {
      key: 'youtube',
      name: 'YouTube',
      handle: 'Keeper Sports Official',
      url: rawSocial.youtube?.url || siteSettings?.youtube_url,
      enabled: rawSocial.youtube?.is_enabled !== undefined ? rawSocial.youtube.is_enabled : Boolean(siteSettings?.youtube_url),
      icon: YouTubeIcon
    },
    {
      key: 'tiktok',
      name: 'TikTok',
      handle: '@keepersportlb',
      url: rawSocial.tiktok?.url || siteSettings?.tiktok_url,
      enabled: rawSocial.tiktok?.is_enabled !== undefined ? rawSocial.tiktok.is_enabled : Boolean(siteSettings?.tiktok_url),
      icon: TikTokIcon
    }
  ];

  // Filter only enabled with valid URL
  const activePlatforms = platforms.filter((p) => p.enabled && Boolean(p.url));

  if (activePlatforms.length === 0) {
    return null;
  }

  return (
    <section className="ks-social-section" aria-label="Social Media">
      <div className="ks-social-container">
        <div className="ks-social-header">
          <span className="ks-section-eyebrow">COMMUNITY &amp; MATCHDAY MEDIA</span>
          <h2 className="ks-section-title">CONNECT WITH KEEPER SPORTS</h2>
          <p className="ks-social-subtitle">
            Follow our official channels for boot launches, goalkeeper drills, athlete spotlights, and limited drops.
          </p>
        </div>

        <div className="ks-social-grid">
          {activePlatforms.map((item) => {
            const Icon = item.icon;
            return (
              <a
                key={item.key}
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="ks-social-card"
                aria-label={`Visit Keeper Sports on ${item.name}`}
              >
                <div className="ks-social-card-icon-wrap">
                  <Icon size={24} className="ks-social-card-icon" />
                </div>
                <div className="ks-social-card-info">
                  <span className="ks-social-card-name">{item.name}</span>
                  <span className="ks-social-card-handle">{item.handle}</span>
                </div>
                <span className="ks-social-card-arrow" aria-hidden="true">&rarr;</span>
              </a>
            );
          })}
        </div>
      </div>
    </section>
  );
}
