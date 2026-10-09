import React from 'react';
import { MapPin, ExternalLink } from 'lucide-react';

export default function LocationSection({ siteSettings = {} }) {
  const loc = siteSettings?.location || {};
  const isVisible = loc.is_visible !== undefined ? loc.is_visible : (siteSettings?.location_is_visible !== false);
  const locationName = loc.store_name || siteSettings?.location_name || 'Keeper Sports';
  const address = 'Hanaway Main Street, Tyre, South Lebanon';
  const mapsUrl = loc.google_maps_url || siteSettings?.location_url || 'https://maps.app.goo.gl/mffodPxBbR573zzk8';

  if (!isVisible && !address && !mapsUrl) {
    return null;
  }

  return (
    <section className="ks-location-section" aria-label="Store Location">
      <div className="ks-location-container">
        {/* Compact, Clean Location Card */}
        <div
          className="ks-location-card"
          style={{
            maxWidth: '520px',
            margin: '0 auto',
            padding: '28px 24px',
            borderRadius: '24px',
            backgroundColor: 'var(--ks-bg-card, #0E0E0E)',
            border: '1px solid var(--ks-border-card, #222222)',
            boxShadow: 'var(--ks-shadow-card, 0 10px 40px rgba(0, 0, 0, 0.15))',
            textAlign: 'center'
          }}
        >
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              backgroundColor: 'rgba(225, 6, 0, 0.1)',
              color: '#E10600',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px'
            }}
          >
            <MapPin size={22} />
          </div>

          <h3
            style={{
              fontFamily: 'Outfit, sans-serif',
              fontSize: '1.45rem',
              fontWeight: 900,
              textTransform: 'uppercase',
              color: 'var(--ks-text-title, #FFFFFF)',
              margin: '0 0 10px'
            }}
          >
            {locationName}
          </h3>

          <p
            style={{
              fontSize: '0.96rem',
              color: 'var(--ks-text-muted, #A3A3A3)',
              lineHeight: 1.5,
              maxWidth: '480px',
              margin: '0 auto 24px'
            }}
          >
            {address}
          </p>

          {mapsUrl && (
            <a
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="ks-location-maps-btn"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                height: '44px',
                padding: '0 24px',
                borderRadius: '24px',
                backgroundColor: '#E10600',
                color: '#FFFFFF',
                textDecoration: 'none',
                fontSize: '0.8rem',
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: '0.06em'
              }}
              aria-label="Open Keeper Sports location in Google Maps"
            >
              <span>Open in Google Maps</span>
              <ExternalLink size={15} />
            </a>
          )}
        </div>
      </div>
    </section>
  );
}
