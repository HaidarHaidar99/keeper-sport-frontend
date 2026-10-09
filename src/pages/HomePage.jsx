import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSite } from '../context/SiteContext';
import { contentApi } from '../api/contentApi';
import { productApi } from '../api/productApi';

import Navbar from '../components/Navbar';
import OffersBar from '../components/OffersBar';
import HeroCarousel from '../components/HeroCarousel';
import CinematicSection from '../components/CinematicSection';
import ShopByCategory from '../components/ShopByCategory';
import ProductsPreview from '../components/ProductsPreview';
import OffersSection from '../components/OffersSection';
import LocationSection from '../components/LocationSection';
import SocialMediaSection from '../components/SocialMediaSection';
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

  // 2. Offer Bars (Announcement Bar above Navbar)
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

    // Active Offers
    contentApi.getOffers().then((res) => {
      if (isMounted && res?.success && Array.isArray(res.offers)) {
        setActiveOffers(res.offers);
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  // Smooth scroll animations on sections
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-in-view');
          }
        });
      },
      { threshold: 0.1 }
    );

    const revealElements = document.querySelectorAll('.ks-scroll-reveal');
    revealElements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [featuredProducts, categories]);

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
      {/* 0. Slim Announcement Bar (Renders ONLY when real active Admin offers exist) */}
      <OffersBar offers={offerBars} />

      {/* Navbar with 2-Line Hamburger and full-viewport Curtain */}
      <Navbar
        siteSettings={siteSettings}
        categories={categories}
        counts={counts}
      />

      <main id="main-content">
        {/* 1. Full-screen Hero (Admin media only, side-by-side square CTAs) */}
        <HeroCarousel slides={heroSlides} loading={heroLoading} />

        {/* 2. Animated After-Hero Story (Admin-managed media & scroll-reveal text) */}
        <CinematicSection />

        {/* 3. Shop by Category (Full background image, 24px radius, contained mobile grid) */}
        <div className="ks-scroll-reveal">
          <ShopByCategory categories={categories} />
        </div>

        {/* 4. Products Preview (BUY NOW + smaller '+' button, no description, 24px radius) */}
        <div className="ks-scroll-reveal">
          <ProductsPreview
            products={featuredProducts}
            loading={featuredLoading}
            onCartUpdated={handleCartUpdated}
            onFavoriteToggled={handleFavoriteToggled}
          />
        </div>

        {/* 5. Offers, only if active offers exist */}
        <div className="ks-scroll-reveal">
          <OffersSection offers={activeOffers} />
        </div>

        {/* 6. Location / Google Maps (Luxury dark card, Open in Google Maps) */}
        <div className="ks-scroll-reveal">
          <LocationSection siteSettings={siteSettings} />
        </div>

        {/* 7. Animated Social Media Section */}
        <div className="ks-scroll-reveal">
          <SocialMediaSection siteSettings={siteSettings} />
        </div>
      </main>

      {/* 8. Compact Footer */}
      <Footer
        siteSettings={siteSettings}
        categories={categories}
      />
    </div>
  );
}
