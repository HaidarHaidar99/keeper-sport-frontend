import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, ArrowRight, Shield } from 'lucide-react';

export default function ShopByCategory({ categories = [] }) {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const validCategories = Array.isArray(categories)
    ? categories.filter((c) => c && c.is_active !== false)
    : [];

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  if (validCategories.length === 0) {
    return null;
  }

  // Display 4 categories initially in a clean equal grid
  const initialCategories = validCategories.slice(0, 4);

  return (
    <section className="ks-category-section" aria-label="Shop By Category">
      <div className="ks-category-container">
        {/* Section Header */}
        <div className="ks-category-header" style={{ marginBottom: '24px' }}>
          <div className="ks-category-title-group">
            <span className="ks-section-eyebrow">EXPLORE DIVISIONS</span>
            <h2 className="ks-section-title">SHOP BY CATEGORY</h2>
          </div>
        </div>

        {/* Clean Rectangular Search Bar with 24px Radius */}
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

        {/* 4 Equal Category Cards with Full Background Image */}
        <div className="ks-category-equal-grid">
          {initialCategories.map((cat) => (
            <Link
              key={cat.id || cat.slug}
              to={`/products?category=${encodeURIComponent(cat.slug || cat.id)}`}
              className="ks-category-rail-card"
              style={{
                borderRadius: '24px',
                overflow: 'hidden',
                position: 'relative',
                minHeight: '230px',
                aspectRatio: '4 / 3',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-end',
                textDecoration: 'none'
              }}
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

        {/* View All Categories Button Directly Under the Cards */}
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <Link to="/categories" className="ks-category-view-all-btn">
            <span>View All Categories</span>
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
}
