import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import ProductCard from './ProductCard';

export default function ProductsPreview({
  products = [],
  loading = false,
  onCartUpdated,
  onFavoriteToggled
}) {
  const [currentPage, setCurrentPage] = useState(0);
  const trackRef = useRef(null);

  const validProducts = Array.isArray(products) ? products.filter(Boolean) : [];
  // For desktop: 2 cards per view
  const totalPages = Math.ceil(validProducts.length / 2);

  const handlePrev = () => {
    if (trackRef.current) {
      const cardWidth = trackRef.current.clientWidth / 2;
      trackRef.current.scrollBy({ left: -cardWidth * 2, behavior: 'smooth' });
    }
    setCurrentPage((prev) => Math.max(0, prev - 1));
  };

  const handleNext = () => {
    if (trackRef.current) {
      const cardWidth = trackRef.current.clientWidth / 2;
      trackRef.current.scrollBy({ left: cardWidth * 2, behavior: 'smooth' });
    }
    setCurrentPage((prev) => Math.min(totalPages - 1, prev + 1));
  };

  if (!loading && validProducts.length === 0) {
    return null;
  }

  return (
    <section className="ks-products-preview-section" aria-label="Products Preview">
      <div className="ks-products-preview-container">
        {/* Section Header */}
        <div className="ks-products-preview-header">
          <div className="ks-products-preview-title-group">
            <span className="ks-section-eyebrow">CURATED SELECTION</span>
            <h2 className="ks-section-title">FEATURED PRODUCTS</h2>
          </div>

          {/* Desktop Paging Arrows */}
          <div className="ks-products-preview-controls">
            <button
              type="button"
              onClick={handlePrev}
              disabled={currentPage === 0}
              className="ks-preview-arrow-btn"
              aria-label="Previous products"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              type="button"
              onClick={handleNext}
              disabled={currentPage >= totalPages - 1}
              className="ks-preview-arrow-btn"
              aria-label="Next products"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        {/* 2-Card Desktop Viewport Carousel Track */}
        <div className="ks-products-preview-track-wrap">
          <div className="ks-products-preview-track" ref={trackRef}>
            {loading ? (
              Array.from({ length: 2 }).map((_, idx) => (
                <div key={idx} className="ks-preview-card-slot">
                  <div className="ks-product-card-skeleton">
                    <div className="ks-skeleton-img" />
                    <div className="ks-skeleton-line short" />
                    <div className="ks-skeleton-line title" />
                    <div className="ks-skeleton-line price" />
                    <div className="ks-skeleton-actions" />
                  </div>
                </div>
              ))
            ) : (
              validProducts.map((prod) => (
                <div key={prod.id} className="ks-preview-card-slot">
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

        {/* View All Products Action Button */}
        <div className="ks-products-preview-footer">
          <Link to="/products" className="ks-products-view-all-btn">
            <span>View All Products</span>
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
}
