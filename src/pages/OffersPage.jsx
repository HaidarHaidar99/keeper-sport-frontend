import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Flame, Percent, ArrowRight, Loader2 } from 'lucide-react';
import { useSite } from '../context/SiteContext';
import { contentApi } from '../api/contentApi';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function OffersPage() {
  const { siteSettings, categories } = useSite();
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    contentApi.getOffers()
      .then((offersRes) => {
        if (!isMounted) return;
        if (offersRes?.success) setOffers(offersRes.offers || []);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="ks-page-canvas">
      <Navbar siteSettings={siteSettings} categories={categories} />

      <main className="ks-catalog-page-container">
        {/* Header */}
        <header className="ks-catalog-header">
          <div className="ks-catalog-header-badge">
            <Flame size={13} style={{ color: 'var(--ks-accent-red)' }} />
            <span>EXCLUSIVE PROMOTIONS</span>
          </div>
          <h1 className="ks-catalog-title">Special Offers &amp; Deals</h1>
          <p className="ks-catalog-subtitle">
            Seasonal promotions and discounted football gear.
          </p>
        </header>

        {loading ? (
          <div className="ks-catalog-loading" aria-live="polite">
            <Loader2 size={32} className="ks-spin-icon" style={{ color: 'var(--ks-accent-red)' }} />
            <p>Loading current offers...</p>
          </div>
        ) : offers.length === 0 ? (
          <div className="ks-catalog-empty">
            <Percent size={44} style={{ opacity: 0.3, marginBottom: '14px' }} />
            <h3>No current offers</h3>
            <p>Sign up for our newsletter or check back soon for upcoming season deals.</p>
            <Link to="/products" className="ks-btn-primary" style={{ display: 'inline-flex', marginTop: '16px' }}>
              <span>SHOP ALL PRODUCTS</span>
            </Link>
          </div>
        ) : (
          <div className="ks-offers-grid">
            {offers.map((offer, idx) => (
              <div
                key={offer.id || idx}
                className="ks-offer-card"
                style={{ animationDelay: `${idx * 0.08}s` }}
              >
                <div className="ks-offer-card-tag">LIMITED TIME</div>
                <h2 className="ks-offer-card-title">{offer.title}</h2>
                {offer.description && (
                  <p className="ks-offer-card-desc">{offer.description}</p>
                )}
                {offer.free_delivery && (
                  <div className="ks-offer-badge-free">FREE LEBANON DELIVERY</div>
                )}
                <div className="ks-offer-card-footer">
                  <Link to="/products?on_sale=true" className="ks-btn-primary">
                    <span>SHOP SALE NOW</span>
                    <ArrowRight size={16} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {!loading && <Footer siteSettings={siteSettings} categories={categories} />}
    </div>
  );
}
