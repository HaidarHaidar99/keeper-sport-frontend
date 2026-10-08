import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Shield, Truck, RotateCcw, Headphones, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSite } from '../context/SiteContext';
import { contentApi } from '../api/contentApi';
import { productApi } from '../api/productApi';
import Navbar from '../components/Navbar';
import OffersBar from '../components/OffersBar';
import HeroCarousel from '../components/HeroCarousel';
import FeaturedRail from '../components/FeaturedRail';
import Footer from '../components/Footer';

export default function HomePage() {
  const { user } = useAuth();
  const { siteSettings, categories, counts, refreshCounts, updateCartCount, updateFavoritesCount } = useSite();

  const [heroSlides, setHeroSlides] = useState(() => {
    try {
      const cached = sessionStorage.getItem('ks_cached_hero_slides');
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  });
  const [heroLoading, setHeroLoading] = useState(() => {
    try {
      const cached = sessionStorage.getItem('ks_cached_hero_slides');
      return cached && JSON.parse(cached).length > 0 ? false : true;
    } catch {
      return true;
    }
  });

  const [offerBars, setOfferBars] = useState(() => {
    try {
      const cached = sessionStorage.getItem('ks_cached_offer_bars');
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  });

  const [featuredProducts, setFeaturedProducts] = useState(() => {
    try {
      const cached = sessionStorage.getItem('ks_cached_featured_products');
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  });
  const [featuredLoading, setFeaturedLoading] = useState(() => {
    try {
      const cached = sessionStorage.getItem('ks_cached_featured_products');
      return cached && JSON.parse(cached).length > 0 ? false : true;
    } catch {
      return true;
    }
  });

  // Fetch Public Content on Mount (Only Hero, Offers, and Featured)
  useEffect(() => {
    let isMounted = true;

    // 1. Hero Slides
    contentApi.getHeroSlides().then((res) => {
      if (isMounted) {
        if (res && res.success && res.slides) {
          setHeroSlides(res.slides);
          try {
            sessionStorage.setItem('ks_cached_hero_slides', JSON.stringify(res.slides));
          } catch {}
        }
        setHeroLoading(false);
      }
    });

    // 2. Offer Bars
    contentApi.getOfferBars().then((res) => {
      if (isMounted) {
        if (res && res.success && res.offers) {
          setOfferBars(res.offers);
          try {
            sessionStorage.setItem('ks_cached_offer_bars', JSON.stringify(res.offers));
          } catch {}
        }
      }
    });

    // 3. Featured Products
    productApi.getFeaturedProducts(8).then((res) => {
      if (isMounted) {
        if (res && res.success && Array.isArray(res.products)) {
          setFeaturedProducts(res.products);
          try {
            sessionStorage.setItem('ks_cached_featured_products', JSON.stringify(res.products));
          } catch {}
        }
        setFeaturedLoading(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  // Optimized count updates without triggering extra network requests
  const handleCartUpdated = (newCount) => {
    if (typeof newCount === 'number' && updateCartCount) {
      updateCartCount(newCount);
    } else {
      refreshCounts();
    }
  };

  const handleFavoriteToggled = (_productId, _isFav, newCount) => {
    if (typeof newCount === 'number' && updateFavoritesCount) {
      updateFavoritesCount(newCount);
    } else {
      refreshCounts();
    }
  };

  return (
    <div className="ks-home-root">
      {/* 1. Responsive Navbar */}
      <Navbar
        siteSettings={siteSettings}
        categories={categories}
        counts={counts}
      />

      {/* 2. Compact Offers Bar */}
      <OffersBar offers={offerBars} />

      {/* 3. Hero Carousel */}
      <HeroCarousel slides={heroSlides} loading={heroLoading} />

      {/* 4. Featured Selection Rail */}
      <FeaturedRail
        products={featuredProducts}
        loading={featuredLoading}
        onCartUpdated={handleCartUpdated}
        onFavoriteToggled={handleFavoriteToggled}
      />

      {/* 5. Categories Showcase Quick Access */}
      {categories && categories.length > 0 && (
        <section className="ks-categories-quick-section" aria-label="Browse Categories">
          <div className="ks-categories-quick-container">
            <div className="ks-categories-quick-header">
              <span className="ks-categories-quick-eyebrow">EQUIPMENT CATEGORIES</span>
              <h2 className="ks-categories-quick-title">EXPLORE BY CATEGORY</h2>
            </div>
            <div className="ks-categories-quick-grid">
              {categories.slice(0, 6).map((cat) => (
                <Link
                  key={cat.id || cat.slug}
                  to={`/products?category=${encodeURIComponent(cat.slug || cat.id)}`}
                  className="ks-category-quick-card"
                >
                  <span className="ks-category-quick-name">{cat.name}</span>
                  <ArrowRight size={16} className="ks-category-quick-arrow" />
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 6. Brand Quality Pillars */}
      <section className="ks-pillars-section" aria-label="Store Guarantees">
        <div className="ks-pillars-container">
          <div className="ks-pillar-item">
            <div className="ks-pillar-icon-wrap">
              <Shield size={22} />
            </div>
            <div className="ks-pillar-content">
              <h3 className="ks-pillar-title">100% AUTHENTIC</h3>
              <p className="ks-pillar-desc">Direct from official manufacturers and top goalkeeper brands.</p>
            </div>
          </div>

          <div className="ks-pillar-item">
            <div className="ks-pillar-icon-wrap">
              <Truck size={22} />
            </div>
            <div className="ks-pillar-content">
              <h3 className="ks-pillar-title">FAST DISPATCH</h3>
              <p className="ks-pillar-desc">Prompt delivery across all Lebanese territories.</p>
            </div>
          </div>

          <div className="ks-pillar-item">
            <div className="ks-pillar-icon-wrap">
              <RotateCcw size={22} />
            </div>
            <div className="ks-pillar-content">
              <h3 className="ks-pillar-title">EASY SIZING &amp; RETURNS</h3>
              <p className="ks-pillar-desc">Professional size consultation and hassle-free exchanges.</p>
            </div>
          </div>

          <div className="ks-pillar-item">
            <div className="ks-pillar-icon-wrap">
              <Headphones size={22} />
            </div>
            <div className="ks-pillar-content">
              <h3 className="ks-pillar-title">DEDICATED SUPPORT</h3>
              <p className="ks-pillar-desc">Direct assistance via WhatsApp and live matchday hotline.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Comprehensive Store Footer */}
      <Footer siteSettings={siteSettings} categories={categories} />
    </div>
  );
}

