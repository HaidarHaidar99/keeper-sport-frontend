import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, ChevronLeft, ChevronRight, ArrowRight, Shield } from 'lucide-react';

export default function ShopByCategory({ categories = [] }) {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const railRef = useRef(null);

  const validCategories = Array.isArray(categories)
    ? categories.filter((c) => c && c.is_active !== false)
    : [];

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const scrollRail = (direction) => {
    if (railRef.current) {
      const scrollAmount = direction === 'left' ? -320 : 320;
      railRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  if (validCategories.length === 0) {
    return null;
  }

  // Mobile: maximum 4 categories initially in equal grid
  const mobileCategories = validCategories.slice(0, 4);

  return (
    <section className="ks-category-section" aria-label="Shop By Category">
      <div className="ks-category-container">
        {/* Section Header */}
        <div className="ks-category-header">
          <div className="ks-category-title-group">
            <span className="ks-section-eyebrow">EXPLORE DIVISIONS</span>
            <h2 className="ks-section-title">SHOP BY CATEGORY</h2>
          </div>

          {/* Desktop Arrow Controls */}
          <div className="ks-category-nav-controls">
            <button
              type="button"
              onClick={() => scrollRail('left')}
              className="ks-category-nav-btn"
              aria-label="Previous categories"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              type="button"
              onClick={() => scrollRail('right')}
              className="ks-category-nav-btn"
              aria-label="Next categories"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        {/* Clean Rectangular Search Bar with Generous Breathing Room & 24px Radius */}
        <div className="ks-category-search-bar-wrap">
          <form onSubmit={handleSearchSubmit} className="ks-category-search-form">
            <Search size={18} className="ks-category-search-icon" aria-hidden="true" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search gear, boots, club kits..."
              className="ks-category-search-input"
              aria-label="Search products and categories"
            />
            <button type="submit" className="ks-category-search-submit-btn">
              <span>Search</span>
            </button>
          </form>
        </div>

        {/* Desktop View: Horizontal Carousel Rail with Full Background Image */}
        <div className="ks-category-desktop-rail-wrap">
          <div className="ks-category-desktop-rail" ref={railRef}>
            {validCategories.map((cat) => (
              <Link
                key={cat.id || cat.slug}
                to={`/products?category=${encodeURIComponent(cat.slug || cat.id)}`}
                className="ks-category-rail-card"
              >
                {cat.image_path ? (
                  <img
                    src={cat.image_path}
                    alt={cat.name}
                    className="ks-category-card-bg-img"
                    loading="lazy"
                  />
                ) : (
                  <div className="ks-category-card-fallback-canvas">
                    <Shield size={36} style={{ color: '#E10600' }} />
                  </div>
                )}
                <div className="ks-category-card-scrim" />
                <div className="ks-category-card-content-bottom">
                  <h3 className="ks-category-card-name">{cat.name}</h3>
                  <span className="ks-category-card-cta">
                    <span>Explore</span>
                    <ArrowRight size={14} />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Mobile View: Contained Two-Column Grid with Equal Card Dimensions and Full Background Image */}
        <div className="ks-category-mobile-grid">
          {mobileCategories.map((cat) => (
            <Link
              key={cat.id || cat.slug}
              to={`/products?category=${encodeURIComponent(cat.slug || cat.id)}`}
              className="ks-category-mobile-card"
            >
              {cat.image_path ? (
                <img
                  src={cat.image_path}
                  alt={cat.name}
                  className="ks-category-card-bg-img"
                  loading="lazy"
                />
              ) : (
                <div className="ks-category-card-fallback-canvas">
                  <Shield size={28} style={{ color: '#E10600' }} />
                </div>
              )}
              <div className="ks-category-card-scrim" />
              <div className="ks-category-card-content-bottom">
                <h3 className="ks-category-card-name">{cat.name}</h3>
                <span className="ks-category-card-cta">
                  <ArrowRight size={14} />
                </span>
              </div>
            </Link>
          ))}
        </div>

        {/* Right-Aligned View All Categories Action */}
        <div className="ks-category-footer-right">
          <Link to="/categories" className="ks-category-view-all-btn">
            <span>View All Categories</span>
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
}
