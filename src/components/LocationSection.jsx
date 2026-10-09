import React from 'react';
import { MapPin, ExternalLink, Navigation } from 'lucide-react';

export default function LocationSection({ siteSettings = {} }) {
  // Support both merged siteSettings and dedicated location object
  const loc = siteSettings?.location || {};
  const isVisible = loc.is_visible !== undefined ? loc.is_visible : (siteSettings?.location_is_visible !== false);
  const locationName = loc.store_name || siteSettings?.location_name || 'Keeper Sports Store';
  const address = loc.full_address || siteSettings?.full_address || siteSettings?.location_address || siteSettings?.location_name || null;
  const mapsUrl = loc.google_maps_url || siteSettings?.location_url || null;
  const description = loc.description || siteSettings?.location_description || null;

  if (!isVisible || (!address && !mapsUrl)) {
    return null;
  }

  return (
    <section className="ks-location-section" aria-label="Store Location">
      <div className="ks-location-container">
        <div className="ks-location-card">
          <div className="ks-location-header">
            <div className="ks-location-badge">
              <MapPin size={16} />
              <span>OFFICIAL STOREFRONT</span>
            </div>
            <h2 className="ks-location-title">{locationName}</h2>
            {description && (
              <p className="ks-location-desc">{description}</p>
            )}
          </div>

          <div className="ks-location-body">
            {address && (
              <div className="ks-location-address-row">
                <Navigation size={18} className="ks-location-pin-icon" />
                <span className="ks-location-address-text">{address}</span>
              </div>
            )}

            {mapsUrl && (
              <div className="ks-location-action-row">
                <a
                  href={mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ks-location-maps-btn"
                  aria-label="Open Keeper Sports location in Google Maps"
                >
                  <span>Open in Google Maps</span>
                  <ExternalLink size={15} />
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
