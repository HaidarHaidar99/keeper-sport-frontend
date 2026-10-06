import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Loader2, Trash2, AlertTriangle } from 'lucide-react';
import { useSite } from '../context/SiteContext';
import { productApi } from '../api/productApi';
import ProductCard from '../components/ProductCard';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function FavoritesPage() {
  const { siteSettings, categories, refreshCounts } = useSite();
  const [favoriteProducts, setFavoriteProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showClearModal, setShowClearModal] = useState(false);
  const [clearingFavorites, setClearingFavorites] = useState(false);

  useEffect(() => {
    let isMounted = true;
    Promise.all([
      productApi.getUserFavoriteIds(),
      productApi.getProducts({ limit: 100 })
    ])
      .then(([favIdsRes, prodsRes]) => {
        if (!isMounted) return;

        const rawIds = favIdsRes?.favoriteIds || favIdsRes?.ids || [];
        const ids = Array.isArray(rawIds) ? rawIds : [];
        const allProds = prodsRes?.success && Array.isArray(prodsRes.products) ? prodsRes.products : [];

        // Filter products that are in user's / guest's favorites
        const matched = allProds
          .filter((p) => ids.includes(p.id))
          .map((p) => ({ ...p, isFavorited: true }));

        setFavoriteProducts(matched);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleFavoriteToggled = (productId, isFav) => {
    if (!isFav) {
      setFavoriteProducts((prev) => prev.filter((p) => p.id !== productId));
      if (typeof refreshCounts === 'function') refreshCounts();
    }
  };

  const handleClearFavorites = async () => {
    if (clearingFavorites) return;
    setClearingFavorites(true);

    try {
      const res = await productApi.clearFavorites();
      if (res?.success) {
        setFavoriteProducts([]);
        if (typeof refreshCounts === 'function') refreshCounts();
      }
    } catch (err) {
      console.warn("Failed to clear favorites:", err);
    } finally {
      setClearingFavorites(false);
      setShowClearModal(false);
    }
  };

  return (
    <div className="ks-page-canvas">
      <Navbar siteSettings={siteSettings} categories={categories} />

      <main className="ks-catalog-page-container">
        <header className="ks-catalog-header">
          <div className="ks-catalog-header-badge">
            <Heart size={13} style={{ color: 'var(--ks-accent-red)' }} />
            <span>SAVED ITEMS</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <h1 className="ks-catalog-title" style={{ margin: 0 }}>My Favorites</h1>
            {favoriteProducts.length > 0 && (
              <button
                type="button"
                onClick={() => setShowClearModal(true)}
                disabled={clearingFavorites}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: 'none',
                  border: '1px solid var(--ks-border-card, #e5e7eb)',
                  color: 'var(--ks-text-muted, #6B7280)',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  padding: '6px 12px',
                  borderRadius: '6px',
                  transition: 'color 0.2s, border-color 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = 'var(--ks-error-red, #dc2626)';
                  e.currentTarget.style.borderColor = 'var(--ks-error-red, #dc2626)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = 'var(--ks-text-muted, #6B7280)';
                  e.currentTarget.style.borderColor = 'var(--ks-border-card, #e5e7eb)';
                }}
                title="Remove all saved favorites"
              >
                <Trash2 size={13} />
                <span>Clear Favorites</span>
              </button>
            )}
          </div>
        </header>

        {loading ? (
          <div className="ks-catalog-loading" aria-live="polite">
            <Loader2 size={32} className="ks-spin-icon" style={{ color: 'var(--ks-accent-red)' }} />
            <p>Loading your favorite products...</p>
          </div>
        ) : favoriteProducts.length === 0 ? (
          <div className="ks-catalog-empty">
            <Heart size={48} style={{ opacity: 0.25, marginBottom: '16px' }} />
            <h3>No favorites saved yet</h3>
            <p>Tap the heart icon on any product to save it here for quick access.</p>
            <Link to="/products" className="ks-btn-primary" style={{ display: 'inline-flex', marginTop: '16px' }}>
              <span>BROWSE PRODUCTS</span>
            </Link>
          </div>
        ) : (
          <div className="ks-products-grid">
            {favoriteProducts.map((prod) => (
              <ProductCard
                key={prod.id}
                product={prod}
                onFavoriteToggled={handleFavoriteToggled}
                onCartUpdated={() => {
                  if (typeof refreshCounts === 'function') refreshCounts();
                }}
              />
            ))}
          </div>
        )}
      </main>

      {/* Confirmation Modal for Clear Favorites */}
      {showClearModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="clear-favs-title"
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(0, 0, 0, 0.65)',
            backdropFilter: 'blur(3px)',
            padding: '16px'
          }}
          onClick={() => setShowClearModal(false)}
        >
          <div
            style={{
              background: 'var(--ks-bg-card, #ffffff)',
              color: 'var(--ks-text-title, #111317)',
              borderRadius: '14px',
              padding: '24px',
              maxWidth: '420px',
              width: '100%',
              boxShadow: '0 20px 40px rgba(0,0,0,0.25)',
              border: '1px solid var(--ks-border-card, #e5e7eb)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: 'rgba(220, 38, 38, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--ks-error-red, #dc2626)', flexShrink: 0 }}>
                <AlertTriangle size={20} />
              </div>
              <h3 id="clear-favs-title" style={{ fontSize: '18px', fontWeight: 700, margin: 0 }}>
                Clear All Favorites?
              </h3>
            </div>

            <p style={{ fontSize: '14px', color: 'var(--ks-text-subtitle, #4b5563)', margin: '0 0 20px', lineHeight: 1.5 }}>
              Are you sure you want to clear your favorites? All {favoriteProducts.length} saved items will be removed from your list.
            </p>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => setShowClearModal(false)}
                disabled={clearingFavorites}
                style={{
                  background: 'none',
                  border: '1px solid var(--ks-border-card, #d1d5db)',
                  borderRadius: '8px',
                  padding: '8px 16px',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: 'var(--ks-text-title, #111317)',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleClearFavorites}
                disabled={clearingFavorites}
                style={{
                  background: 'var(--ks-error-red, #dc2626)',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '8px 18px',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: '#ffffff',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                {clearingFavorites ? <Loader2 size={14} className="ks-spin-icon" /> : <Trash2 size={14} />}
                <span>Clear Favorites</span>
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer siteSettings={siteSettings} categories={categories} />
    </div>
  );
}
