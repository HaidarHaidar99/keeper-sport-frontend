import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { contentApi } from '../api/contentApi';
import Navbar from '../components/Navbar';
import OffersBar from '../components/OffersBar';
import HeroCarousel from '../components/HeroCarousel';

export default function HomePage() {
  const { user } = useAuth();

  const [siteSettings, setSiteSettings] = useState(null);
  const [heroSlides, setHeroSlides] = useState([]);
  const [offerBars, setOfferBars] = useState([]);
  const [categories, setCategories] = useState([]);
  const [counts, setCounts] = useState({
    favorites: 0,
    orders: 0,
    cart: 0,
    notifications: 0
  });

  // Fetch Public Content on Mount
  useEffect(() => {
    let isMounted = true;

    // 1. Site Settings
    contentApi.getSiteSettings().then((res) => {
      if (isMounted && res.success && res.settings) {
        setSiteSettings(res.settings);
      }
    });

    // 2. Hero Slides
    contentApi.getHeroSlides().then((res) => {
      if (isMounted && res.success && res.slides) {
        setHeroSlides(res.slides);
      }
    });

    // 3. Offer Bars
    contentApi.getOfferBars().then((res) => {
      if (isMounted && res.success && res.offers) {
        setOfferBars(res.offers);
      }
    });

    // 4. Categories
    contentApi.getCategories().then((res) => {
      if (isMounted && res.success && res.categories) {
        setCategories(res.categories);
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  // Fetch / Refresh User Counts when authentication state updates
  useEffect(() => {
    let isMounted = true;
    contentApi.getUserCounts().then((res) => {
      if (isMounted && res.success && res.counts) {
        setCounts(res.counts);
      }
    });
    return () => {
      isMounted = false;
    };
  }, [user]);

  return (
    <div className="ks-home-root">
      {/* 1. Responsive Navbar */}
      <Navbar
        siteSettings={siteSettings}
        categories={categories}
        counts={counts}
      />

      {/* 2. Compact Offers Bar (Directly attached to Navbar) */}
      <OffersBar offers={offerBars} />

      {/* 3. Hero Carousel (Directly below Offers Bar) */}
      <HeroCarousel slides={heroSlides} />
    </div>
  );
}
