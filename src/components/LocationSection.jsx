import React from 'react';
import { MapPin, ExternalLink, Navigation, Clock } from 'lucide-react';

export default function LocationSection({ siteSettings = {} }) {
  const loc = siteSettings?.location || {};
  const isVisible = loc.is_visible !== undefined ? loc.is_visible : (siteSettings?.location_is_visible !== false);
  const locationName = loc.store_name || siteSettings?.location_name || 'Keeper Sports Store';
  const address = loc.full_address || siteSettings?.full_address || siteSettings?.location_address || siteSettings?.location_name || null;
  const mapsUrl = loc.google_maps_url || siteSettings?.location_url || null;
  const description = loc.description || siteSettings?.location_description || 'Visit our flagship football destination for boots, official kits, gloves, and tournament gear.';

  if (!isVisible || (!address && !mapsUrl)) {
    return null;
  }

  return (
    <section className="ks-location-section" aria-label="Store Location">
      <div className="ks-location-container">
        <div className="ks-location-card" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '36px', alignItems: 'center' }}>
          {/* Left Info Column */}
          <div className="ks-location-left-col">
            <div className="ks-location-badge">
              <MapPin size={15} />
              <span>OFFICIAL STOREFRONT</span>
            </div>
            <h2 className="ks-location-title">{locationName}</h2>
            {description && (
              <p className="ks-location-desc">{description}</p>
            )}

            {mapsUrl && (
              <div className="ks-location-action-row" style={{ marginTop: '20px' }}>
                <a
                  href={mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ks-location-maps-btn"
                  aria-label="Open Keeper Sports location in Google Maps"
                >
                  <span>Open in Google Maps</span>
                  <ExternalLink size={16} />
                </a>
              </div>
            )}
          </div>

          {/* Right Address & Status Card */}
          <div className="ks-location-right-col" style={{ backgroundColor: '#141414', border: '1px solid #262626', borderRadius: '20px', padding: '28px' }}>
            {address && (
              <div className="ks-location-address-row" style={{ marginBottom: '18px' }}>
                <Navigation size={22} className="ks-location-pin-icon" />
                <span className="ks-location-address-text" style={{ fontSize: '1rem', color: '#FFFFFF' }}>{address}</span>
              </div>
            )}

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#A3A3A3', fontSize: '0.9rem', marginBottom: '12px' }}>
              <Clock size={16} style={{ color: '#E10600' }} />
              <span>Open Monday – Saturday: 10:00 AM – 9:00 PM</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#10B981', fontSize: '0.85rem', fontWeight: 700 }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10B981', display: 'inline-block' }} />
              <span>In-Store Fitting & Official Customization Available</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
