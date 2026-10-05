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
            // Minimal Loading Skeletons
            Array.from({ length: 4 }).map((_, idx) => (
              <div key={idx} className="ks-product-card-skeleton" aria-hidden="true">
                <div className="ks-skeleton-img" />
                <div className="ks-skeleton-line short" />
                <div className="ks-skeleton-line title" />
                <div className="ks-skeleton-line price" />
                <div className="ks-skeleton-actions" />
              </div>
            ))
          ) : (
            products.map((prod) => (
              <div key={prod.id} className="ks-featured-rail-item">
                <ProductCard
                  product={prod}
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
