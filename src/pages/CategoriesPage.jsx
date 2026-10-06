import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Tag, ArrowRight, Loader2 } from 'lucide-react';
import { useSite } from '../context/SiteContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function CategoriesPage() {
  const { categories, siteSettings, isInitialized } = useSite();
  const loading = !isInitialized && categories.length === 0;

  return (
    <div className="ks-page-canvas">
      <Navbar siteSettings={siteSettings} categories={categories} />

      <main className="ks-catalog-page-container">
        {/* Header */}
        <header className="ks-catalog-header">
          <div className="ks-catalog-header-badge">
            <Tag size={13} style={{ color: 'var(--ks-accent-red)' }} />
            <span>AUTHENTIC GEAR</span>
          </div>
          <h1 className="ks-catalog-title">Shop by Category</h1>
          <p className="ks-catalog-subtitle">
            Explore authentic football boots, jerseys, kits, and equipment.
          </p>
        </header>

        {loading ? (
          <div className="ks-catalog-loading" aria-live="polite">
            <Loader2 size={32} className="ks-spin-icon" style={{ color: 'var(--ks-accent-red)' }} />
            <p>Loading categories...</p>
          </div>
        ) : categories.length === 0 ? (
          <div className="ks-catalog-empty">
            <Tag size={44} style={{ opacity: 0.3, marginBottom: '14px' }} />
            <h3>No categories yet</h3>
            <p>Check back shortly as new categories are being cataloged.</p>
            <Link to="/products" className="ks-btn-primary" style={{ display: 'inline-flex', marginTop: '16px' }}>
              <span>EXPLORE ALL PRODUCTS</span>
            </Link>
          </div>
        ) : (
          <div className="ks-categories-grid">
            {categories.map((cat, idx) => {
              const imageSrc = cat.image_path || cat.imagePath || null;
              return (
                <Link
                  key={cat.id || cat.slug}
                  to={`/products?category=${encodeURIComponent(cat.slug || cat.id)}`}
                  className="ks-category-card"
                  style={{ animationDelay: `${idx * 0.06}s` }}
                >
                  <div className="ks-category-card-media">
                    {imageSrc ? (
                      <img
                        src={imageSrc}
                        alt={cat.name}
                        className="ks-category-card-img"
                        loading="lazy"
                      />
                    ) : (
                      <div className="ks-category-card-fallback">
                        <Tag size={36} style={{ opacity: 0.3 }} />
                      </div>
                    )}
                  </div>
                  <div className="ks-category-card-body">
                    <span className="ks-category-card-tag">CATEGORY</span>
                    <h2 className="ks-category-card-title">{cat.name}</h2>
                    <div className="ks-category-card-action">
                      <span>EXPLORE PRODUCTS</span>
                      <ArrowRight size={16} />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </main>

      <Footer siteSettings={siteSettings} categories={categories} />
    </div>
  );
}
