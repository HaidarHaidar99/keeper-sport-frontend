import React, { useState, useEffect } from 'react';
import { Shield, Truck, RotateCcw, Headphones } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSite } from '../context/SiteContext';
import { contentApi } from '../api/contentApi';
import { productApi } from '../api/productApi';

import Navbar from '../components/Navbar';
import OffersBar from '../components/OffersBar';
import HeroCarousel from '../components/HeroCarousel';
import CinematicSection from '../components/CinematicSection';
import ProductsPreview from '../components/ProductsPreview';
import ShopByCategory from '../components/ShopByCategory';
import OffersSection from '../components/OffersSection';
import ReviewsSection from '../components/ReviewsSection';
import ContactLocationSection from '../components/ContactLocationSection';
import Footer from '../components/Footer';

export default function HomePage() {
  const { user } = useAuth();
  const { siteSettings, categories, counts, refreshCounts, updateCartCount, updateFavoritesCount } = useSite();

  // 1. Hero Slides
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

  // 2. Offer Bars (Announcement Bar)
  const [offerBars, setOfferBars] = useState(() => {
    try {
      const cached = sessionStorage.getItem('ks_cached_offer_bars');
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  });

  // 3. Featured Products
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

  // 4. Promotions / Offers
  const [activeOffers, setActiveOffers] = useState([]);

  // 5. Customer Reviews
  const [reviews, setReviews] = useState([]);

  // Fetch Public Content on Mount
  useEffect(() => {
    let isMounted = true;

    // Hero Slides
    contentApi.getHeroSlides().then((res) => {
      if (isMounted) {
        if (res?.success && res.slides) {
          setHeroSlides(res.slides);
          try {
            sessionStorage.setItem('ks_cached_hero_slides', JSON.stringify(res.slides));
          } catch {}
        }
        setHeroLoading(false);
      }
    });

    // Offer Announcement Bars
    contentApi.getOfferBars().then((res) => {
      if (isMounted && res?.success && res.offers) {
        setOfferBars(res.offers);
        try {
          sessionStorage.setItem('ks_cached_offer_bars', JSON.stringify(res.offers));
        } catch {}
      }
    });

    // Featured Products
    productApi.getFeaturedProducts(8).then((res) => {
      if (isMounted) {
        if (res?.success && Array.isArray(res.products)) {
          setFeaturedProducts(res.products);
          try {
            sessionStorage.setItem('ks_cached_featured_products', JSON.stringify(res.products));
          } catch {}
        }
        setFeaturedLoading(false);
      }
    });

    // Promotions / Offers
    contentApi.getOffers().then((res) => {
      if (isMounted && res?.success && Array.isArray(res.offers)) {
        setActiveOffers(res.offers);
      }
    });

    // Public Reviews
    contentApi.getReviews().then((res) => {
      if (isMounted && res?.success && Array.isArray(res.reviews)) {
        setReviews(res.reviews);
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  // Optimized Count Updaters (In-memory, Zero-Latency)
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
      {/* 1. Slim Announcement Bar */}
      <OffersBar offers={offerBars} />

      {/* 2. Premium Minimal Navigation Header */}
      <Navbar
        siteSettings={siteSettings}
        categories={categories}
        counts={counts}
      />

      {/* 3. True Full-Viewport Responsive Hero (Admin Content Only) */}
      <HeroCarousel slides={heroSlides} loading={heroLoading} />

      {/* 4. Second Section — Cinematic Image & Scroll Text */}
      <CinematicSection categories={categories} products={featuredProducts} />

      {/* 5. Products Preview (2-Card Desktop Carousel + Mobile Swipe) */}
      <ProductsPreview
        products={featuredProducts}
        loading={featuredLoading}
        onCartUpdated={handleCartUpdated}
        onFavoriteToggled={handleFavoriteToggled}
      />

      {/* 6. Shop by Category (Images, Search Field, Rail & Compact Mobile Grid) */}
      <ShopByCategory categories={categories} />

      {/* 7. Active Offers Section (Omitted if no active offers exist) */}
      <OffersSection offers={activeOffers} />

      {/* 8. Customer Reviews Section (Omitted gracefully if empty) */}
      <ReviewsSection reviews={reviews} />

      {/* 9. Brand Quality Pillars */}
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

      {/* 10. Contact, Location & Social Section */}
      <ContactLocationSection siteSettings={siteSettings} />

      {/* 11. Compact Luxury Footer */}
      <Footer siteSettings={siteSettings} categories={categories} />
    </div>
  );
}
