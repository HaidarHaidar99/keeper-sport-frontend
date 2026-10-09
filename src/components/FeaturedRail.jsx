import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import ProductCard from './ProductCard';

export default function FeaturedRail({
  products = [],
  loading = false,
  onCartUpdated,
  onFavoriteToggled
}) {
  const scrollRef = useRef(null);

  if (!loading && products.length === 0) {
    // If no featured products configured yet in backend, do not display fake products
    return null;
  }

  const scrollBy = (offset) => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  };

  return (
    <section className="ks-featured-rail-section" aria-label="Featured Products">
      <div className="ks-featured-rail-header">
        <div className="ks-featured-rail-title-group">
          <div className="ks-featured-badge">
            <Sparkles size={13} className="ks-featured-sparkle-icon" />
            <span>FEATURED SELECTION</span>
          </div>
          <h2 className="ks-featured-rail-heading">CURATED FOR ATHLETES</h2>
        </div>

        {/* Desktop Scroll Controls */}
        <div className="ks-featured-rail-nav-desktop">
          <button
            type="button"
            onClick={() => scrollBy(-320)}
            className="ks-rail-nav-btn"
            aria-label="Scroll featured products left"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            type="button"
            onClick={() => scrollBy(320)}
            className="ks-rail-nav-btn"
            aria-label="Scroll featured products right"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* Horizontal Rail Container */}
      <div className="ks-featured-rail-track-wrap">
        <div className="ks-featured-rail-track" ref={scrollRef}>
          {loading ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 0', gap: '10px', color: '#E10600', width: '100%' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#A3A3A3' }}>Loading featured gear...</span>
            </div>
          ) : (
            products.map((prod, idx) => (
              <div key={prod.id} className="ks-featured-rail-item">
                <ProductCard
                  product={prod}
                  index={idx}
                  onCartUpdated={onCartUpdated}
                  onFavoriteToggled={onFavoriteToggled}
                />
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
