import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Search, Heart, ShoppingBag, User, Package } from 'lucide-react';
import { useSite, DEFAULT_LOGO_URL } from '../context/SiteContext';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import HamburgerMenu from './HamburgerMenu';

export default function Navbar({ siteSettings: propSettings, categories: propCategories, counts: propCounts }) {
  const siteCtx = useSite();
  const { user } = useAuth();
  const { theme } = useTheme();
  const location = useLocation();

  const siteSettings = (propSettings && Object.keys(propSettings).length > 0) ? propSettings : (siteCtx?.siteSettings || {});
  const categories = (propCategories && propCategories.length > 0) ? propCategories : (siteCtx?.categories || []);
  const counts = (propCounts && Object.keys(propCounts).length > 0) ? propCounts : (siteCtx?.counts || {});
  
  // Dynamic logo: switches automatically in light mode if a light logo is configured
  const logoSrc = (theme === 'light' && siteSettings?.logo_light_path)
    ? siteSettings.logo_light_path
    : (siteSettings?.logo_path || DEFAULT_LOGO_URL);

  const [menuOpen, setMenuOpen] = useState(false);
  const [navVisible, setNavVisible] = useState(true);

  // Always ensure navbar is visible on route changes
  useEffect(() => {
    setNavVisible(true);
  }, [location.pathname, location.search]);

  // Smart Scroll Reveal: Hides on scroll down, reappears immediately on even slight scroll up across ALL pages
  useEffect(() => {
    let lastScrollY = typeof window !== 'undefined'
      ? (window.pageYOffset || window.scrollY || document.documentElement.scrollTop || 0)
      : 0;
    let ticking = false;

    const getScrollTop = () => {
      return (
        window.pageYOffset ||
        window.scrollY ||
        document.documentElement.scrollTop ||
        document.body.scrollTop ||
        0
      );
    };

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentScrollY = getScrollTop();

          if (currentScrollY <= 80) {
            setNavVisible(true);
          } else {
            const diff = currentScrollY - lastScrollY;
            if (diff > 6) {
              // Scrolling down
              setNavVisible(false);
            } else if (diff < -2) {
              // Scrolling up even slightly -> instantly reveal!
              setNavVisible(true);
            }
          }

          lastScrollY = Math.max(0, currentScrollY);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    document.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const navLinks = [
    { label: 'Home', path: '/' },
    { label: 'Products', path: '/products' },
    { label: 'Categories', path: '/categories' },
    { label: 'Offers', path: '/offers' },
    { label: 'Reviews', path: '/reviews' },
    { label: 'About Us', path: '/about' },
    { label: 'Contact', path: '/contact' }
  ];

  const isLinkActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <>
      <header className={`ks-navbar-root ${navVisible ? 'is-visible' : 'is-hidden'}`} role="banner">
        <div className="ks-navbar-container">
          {/* Left: Prominent & Bigger Keeper Sports Logo */}
          <div className="ks-navbar-left">
            <Link to="/" className="ks-navbar-brand-link" aria-label="Keeper Sports Home">
              <img
                key={logoSrc}
                src={logoSrc}
                alt={siteSettings?.site_name || 'Keeper Sports'}
                className="ks-navbar-logo-img ks-navbar-logo-large"
                loading="eager"
                fetchPriority="high"
                decoding="sync"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  const fallback = e.currentTarget.parentElement?.querySelector('.ks-navbar-logo-fallback');
                  if (fallback) fallback.style.display = 'flex';
                }}
              />

              {/* Bold Brand Lockup Fallback (Shown ONLY on image error) */}
              <div
                className="ks-navbar-logo-fallback"
                style={{ display: 'none' }}
                aria-label="Keeper Sports Logo"
              >
                <div className="ks-logo-emblem">
                  <svg viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" className="ks-logo-shield-svg">
                    <path
                      d="M18 3L31 8V18C31 26.5 25.5 32 18 34C10.5 32 5 26.5 5 18V8L18 3Z"
                      fill="#E10600"
                    />
                    <path
                      d="M18 10V26M10 18H26"
                      stroke="#FFFFFF"
                      strokeWidth="2.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <div className="ks-logo-text-block">
                  <span className="ks-logo-primary">{siteSettings?.site_name || 'KEEPER SPORTS'}</span>
                  <span className="ks-logo-secondary">AUTHENTIC FOOTBALL GEAR</span>
                </div>
              </div>
            </Link>
          </div>

          {/* Desktop Center: Normal Top Navbar Links */}
          <nav className="ks-navbar-desktop-nav" aria-label="Desktop Navigation">
            {navLinks.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`ks-navbar-desktop-link ${isLinkActive(item.path) ? 'is-active' : ''}`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Right: Actions */}
          <div className="ks-navbar-right">
            {/* Desktop Only: Search */}
            <Link
              to="/products"
              className="ks-navbar-circle-btn ks-desktop-only"
              aria-label="Search catalog"
              title="Search"
            >
              <Search size={18} />
            </Link>

            {/* Desktop Only: Favorites */}
            <Link
              to="/favorites"
              className="ks-navbar-circle-btn ks-desktop-only ks-desktop-fav-btn"
              aria-label="View favorites"
              title="Favorites"
            >
              <Heart size={18} />
              {Number(counts.favorites) > 0 && (
                <span className="ks-navbar-badge-pill">{counts.favorites}</span>
              )}
            </Link>

            {/* Cart Icon (Visible on Both Mobile & Desktop) */}
            <Link
              to="/cart"
              className="ks-navbar-circle-btn ks-nav-cart-btn"
              data-nav-cart="true"
              aria-label="Shopping Cart"
              title="Cart"
            >
              <ShoppingBag size={19} />
              {Number(counts.cart) > 0 && (
                <span className="ks-navbar-badge-pill">{counts.cart}</span>
              )}
            </Link>

            {/* Desktop Only: Orders */}
            <Link
              to="/orders"
              className="ks-navbar-circle-btn ks-desktop-only"
              aria-label="My Orders"
              title="Orders"
            >
              <Package size={18} />
              {Number(counts.orders) > 0 && (
                <span className="ks-navbar-badge-pill">{counts.orders}</span>
              )}
            </Link>

            {/* Desktop Only: Profile */}
            <Link
              to={user ? '/profile' : '/login'}
              className="ks-navbar-circle-btn ks-desktop-only"
              aria-label={user ? 'My Profile' : 'Sign In'}
              title={user ? 'My Profile' : 'Sign In'}
            >
              <User size={18} />
            </Link>

            {/* Mobile Navigation Button: Clean without badge numbers */}
            <button
              type="button"
              className="ks-hamburger-trigger ks-hamburger-clean"
              onClick={() => setMenuOpen(true)}
              aria-label="Open navigation menu"
              aria-expanded={menuOpen}
              title="Menu"
              id="ks-main-nav-toggle"
            >
              <span className="ks-hamburger-line ks-hamburger-line-top" aria-hidden="true" />
              <span className="ks-hamburger-line ks-hamburger-line-bottom" aria-hidden="true" />
            </button>
          </div>
        </div>
      </header>

      {/* Full-Viewport Navigation Curtain */}
      <HamburgerMenu
        isOpen={menuOpen}
        onClose={() => setMenuOpen(false)}
        siteSettings={siteSettings}
        categories={categories}
        counts={counts}
      />
    </>
  );
}
