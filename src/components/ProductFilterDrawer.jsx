import React from 'react';
import { X, RotateCcw, Check } from 'lucide-react';

export default function ProductFilterDrawer({
  isOpen,
  onClose,
  categories = [],
  filters = {},
  onFilterChange,
  onResetFilters,
  onApply
}) {
  if (!isOpen) return null;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="ks-filter-drawer-backdrop"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-label="Filter Products"
    >
      <div className="ks-filter-drawer-panel">
        {/* Drawer Header */}
        <div className="ks-filter-drawer-header">
          <div className="ks-filter-drawer-title-group">
            <h2 className="ks-filter-drawer-title">FILTERS &amp; SORT</h2>
            <span className="ks-filter-drawer-subtitle">Refine Keeper Sports Catalog</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="ks-filter-drawer-close-btn"
            aria-label="Close filters"
          >
            <X size={20} />
          </button>
        </div>

        {/* Drawer Scrollable Content */}
        <div className="ks-filter-drawer-content">
          {/* Category Filter */}
          {categories && categories.length > 0 && (
            <div className="ks-filter-group">
              <label className="ks-filter-group-label">Category</label>
              <div className="ks-filter-pills-list">
                <button
                  type="button"
                  onClick={() => onFilterChange('category', '')}
                  className={`ks-filter-pill ${!filters.category ? 'is-active' : ''}`}
                >
                  All Categories
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => onFilterChange('category', cat.slug || cat.id)}
                    className={`ks-filter-pill ${filters.category === (cat.slug || cat.id) ? 'is-active' : ''}`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Sort By Filter */}
          <div className="ks-filter-group">
            <label className="ks-filter-group-label" htmlFor="filter-sort-select">
              Sort By
            </label>
            <select
              id="filter-sort-select"
              value={filters.sort || 'featured'}
              onChange={(e) => onFilterChange('sort', e.target.value)}
              className="ks-filter-select"
            >
              <option value="featured">Featured / Recommended</option>
              <option value="newest">Newest Arrivals</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
            </select>
          </div>

          {/* Availability & Offers Checkboxes */}
          <div className="ks-filter-group">
            <label className="ks-filter-group-label">Product Status</label>
            <div className="ks-filter-checkboxes">
              <label className="ks-filter-checkbox-label">
                <input
                  type="checkbox"
                  checked={Boolean(filters.in_stock)}
                  onChange={(e) => onFilterChange('in_stock', e.target.checked)}
                  className="ks-filter-checkbox"
                />
                <span className="ks-checkbox-custom" />
                <span className="ks-checkbox-text">In Stock Only</span>
              </label>

              <label className="ks-filter-checkbox-label">
                <input
                  type="checkbox"
                  checked={Boolean(filters.on_sale)}
                  onChange={(e) => onFilterChange('on_sale', e.target.checked)}
                  className="ks-filter-checkbox"
                />
                <span className="ks-checkbox-custom" />
                <span className="ks-checkbox-text">On Sale / Discounted</span>
              </label>
            </div>
          </div>

          {/* Price Range Filter */}
          <div className="ks-filter-group">
            <label className="ks-filter-group-label">Price Range ($ USD)</label>
            <div className="ks-filter-price-inputs">
              <div className="ks-filter-price-field">
                <span className="ks-price-prefix">$</span>
                <input
                  type="number"
                  min="0"
                  placeholder="Min"
                  value={filters.min_price || ''}
                  onChange={(e) => onFilterChange('min_price', e.target.value)}
                  className="ks-filter-input"
                  aria-label="Minimum price"
                />
              </div>
              <span className="ks-price-divider">—</span>
              <div className="ks-filter-price-field">
                <span className="ks-price-prefix">$</span>
                <input
                  type="number"
                  min="0"
                  placeholder="Max"
                  value={filters.max_price || ''}
                  onChange={(e) => onFilterChange('max_price', e.target.value)}
                  className="ks-filter-input"
                  aria-label="Maximum price"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Drawer Actions Footer */}
        <div className="ks-filter-drawer-footer">
          <button
            type="button"
            onClick={onResetFilters}
            className="ks-filter-btn-reset"
          >
            <RotateCcw size={15} />
            <span>RESET</span>
          </button>

          <button
            type="button"
            onClick={() => {
              if (onApply) onApply();
              onClose();
            }}
            className="ks-filter-btn-apply"
          >
            <Check size={16} strokeWidth={2.5} />
            <span>APPLY FILTERS</span>
          </button>
        </div>
      </div>
    </div>
  );
}
