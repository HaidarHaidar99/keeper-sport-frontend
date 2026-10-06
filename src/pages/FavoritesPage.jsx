import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Loader2 } from 'lucide-react';
import { useSite } from '../context/SiteContext';
import { productApi } from '../api/productApi';
import ProductCard from '../components/ProductCard';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function FavoritesPage() {
  const { siteSettings, categories, refreshCounts } = useSite();
  const [favoriteProducts, setFavoriteProducts] = useState([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <div className="ks-page-canvas">
      <Navbar siteSettings={siteSettings} categories={categories} />

      <main className="ks-catalog-page-container">
        <header className="ks-catalog-header">
          <div className="ks-catalog-header-badge">
            <Heart size={13} style={{ color: 'var(--ks-accent-red)' }} />
            <span>SAVED ITEMS</span>
          </div>
          <h1 className="ks-catalog-title">My Favorites</h1>
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

      <Footer siteSettings={siteSettings} categories={categories} />
    </div>
  );
}
