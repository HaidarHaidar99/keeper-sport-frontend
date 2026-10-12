import React from 'react';
import { Link } from 'react-router-dom';
import { Tag, ArrowRight, Clock } from 'lucide-react';

export default function OffersSection({ offers = [] }) {
  const validOffers = Array.isArray(offers)
    ? offers.filter((o) => o && o.title && o.is_visible !== false)
    : [];

  // If no genuine active offers exist, omit section entirely without placeholder banners
  if (validOffers.length === 0) {
    return null;
  }

  return (
    <section className="ks-offers-section" aria-label="Special Offers">
      <div className="ks-offers-container">
        <div className="ks-offers-header">
          <span className="ks-section-eyebrow">EXCLUSIVE PROMOTIONS</span>
          <h2 className="ks-section-title">ACTIVE OFFERS</h2>
        </div>

        <div className="ks-offers-grid">
          {validOffers.map((offer) => {
            const discountLabel = offer.discount_type === 'percentage'
              ? `${offer.discount_value}% OFF`
              : offer.discount_value
              ? `$${offer.discount_value} OFF`
              : offer.free_delivery
              ? 'FREE DELIVERY'
              : 'SPECIAL OFFER';

            const targetUrl = offer.route || (
              offer.offer_categories?.length === 1
                ? `/products?category=${offer.offer_categories[0].categories?.slug || ''}`
                : offer.offer_products?.length === 1
                ? `/products/${offer.offer_products[0].products?.slug || offer.offer_products[0].product_id}`
                : '/products?on_sale=true'
            );

            return (
              <div key={offer.id} className="ks-offer-card">
                <div className="ks-offer-badge">
                  <Tag size={14} />
                  <span>{discountLabel}</span>
                </div>

                <h3 className="ks-offer-title">{offer.title}</h3>

                {offer.description && (
                  <p className="ks-offer-desc">{offer.description}</p>
                )}

                {offer.offer_categories && offer.offer_categories.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', margin: '8px 0 12px' }}>
                    {offer.offer_categories.map((oc) => (
                      <span key={oc.category_id} style={{ fontSize: '0.72rem', fontWeight: 700, padding: '2px 8px', borderRadius: '4px', backgroundColor: 'rgba(225, 6, 0, 0.1)', color: '#E10600', border: '1px solid rgba(225, 6, 0, 0.25)' }}>
                        {oc.categories?.name || 'Category'}
                      </span>
                    ))}
                  </div>
                )}

                {offer.ends_at && (
                  <div className="ks-offer-deadline">
                    <Clock size={13} />
                    <span>Limited Time Window</span>
                  </div>
                )}

                <Link to={targetUrl} className="ks-offer-action-btn">
                  <span>Claim Offer</span>
                  <ArrowRight size={15} />
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
