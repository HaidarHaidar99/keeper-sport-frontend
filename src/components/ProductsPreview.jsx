import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Loader2 } from 'lucide-react';
import ProductCard from './ProductCard';

export default function ProductsPreview({
  products = [],
  loading = false,
  onCartUpdated,
  onFavoriteToggled
}) {
  const validProducts = Array.isArray(products) ? products.filter(Boolean) : [];
  // Show 4 products on the preview
  const previewProducts = validProducts.slice(0, 4);

  if (!loading && previewProducts.length === 0) {
    return null;
  }

  return (
    <section className="ks-products-preview-section" aria-label="Products Preview">
      <div className="ks-products-preview-container">
        {/* Section Header */}
        <div className="ks-products-preview-header" style={{ marginBottom: '24px' }}>
          <div className="ks-products-preview-title-group">
            <span className="ks-section-eyebrow">CURATED SELECTION</span>
            <h2 className="ks-section-title">FEATURED PRODUCTS</h2>
          </div>
        </div>

        {/* Loading State: Clean subtle spinner only, NO product-shaped skeleton cards */}
        {loading && previewProducts.length === 0 ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px 0', gap: '10px', color: '#E10600' }}>
            <Loader2 size={24} className="ks-spin-icon" />
            <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#A3A3A3' }}>Loading products...</span>
          </div>
        ) : (
          <>
            {/* 4 Products Grid */}
            <div
              className="ks-products-preview-grid"
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                gap: '16px',
                marginBottom: '32px'
              }}
            >
              {previewProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onCartUpdated={onCartUpdated}
                  onFavoriteToggled={onFavoriteToggled}
                />
              ))}
            </div>

            {/* View All Products Button Directly Under the Cards */}
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <Link to="/products" className="ks-products-view-all-btn">
                <span>View All Products</span>
                <ArrowRight size={16} />
              </Link>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
