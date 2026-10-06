import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Search,
  X,
  Heart,
  ShoppingBag,
  Package,
  Bell,
  User,
  LogIn
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSite } from '../context/SiteContext';
import HamburgerMenu from './HamburgerMenu';

export default function Navbar({ siteSettings: propSettings, categories: propCategories, counts: propCounts }) {
  const siteCtx = useSite();
  const siteSettings = (propSettings && Object.keys(propSettings).length > 0) ? propSettings : (siteCtx?.siteSettings || {});
  const categories = (propCategories && propCategories.length > 0) ? propCategories : (siteCtx?.categories || []);
  const counts = (propCounts && Object.keys(propCounts).length > 0) ? propCounts : (siteCtx?.counts || {});

  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);

  const searchInputRef = useRef(null);

  // Auto-focus search input when opened
  useEffect(() => {
    if (searchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [searchOpen]);

  // Handle Search Submission
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery('');
    }
  };

  const handleSearchKeyDown = (e) => {
    if (e.key === 'Escape') {
      setSearchOpen(false);
      setSearchQuery('');
    }
  };

  // Determine active desktop navigation link
  const isActiveRoute = (path) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  const desktopNavItems = [
    { label: 'HOME', path: '/' },
    { label: 'PRODUCTS', path: '/products' },
    { label: 'CATEGORIES', path: '/categories' },
    { label: 'OFFERS', path: '/offers' },
    { label: 'MY ORDERS', path: '/orders', count: counts.orders },
    { label: 'CART', path: '/cart', count: counts.cart },
    { label: 'REVIEWS', path: '/reviews' },
    { label: 'ABOUT US', path: '/about' },
    { label: 'CONTACT US', path: '/contact' }
  ];

  return (
    <>
      <header className="ks-navbar-root">
        <div className="ks-navbar-container">
          {/* Left: Prominent Keeper Sports Brand Logo */}
          <div className="ks-navbar-left">
            <Link to="/" className="ks-navbar-brand-link" aria-label="Keeper Sports Home">
              {siteSettings?.logo_path ? (
                <img
                  src={siteSettings.logo_path}
                  alt={siteSettings?.site_name || 'Keeper Sports'}
                  className="ks-navbar-logo-img"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    const fallback = e.currentTarget.parentElement?.querySelector('.ks-navbar-logo-fallback');
                    if (fallback) fallback.style.display = 'flex';
                  }}
                />
              ) : null}

              {/* Bold Athletic Keeper Sports Horizontal Brand Lockup */}
              <div
                className="ks-navbar-logo-fallback"
                style={{ display: siteSettings?.logo_path ? 'none' : 'flex' }}
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
                  <span className="ks-logo-primary">KEEPER SPORTS</span>
                  <span className="ks-logo-secondary">AUTHENTIC FOOTBALL GEAR</span>
                </div>
              </div>
            </Link>
          </div>

          {/* Center: Desktop Horizontal Navigation Links (Clean active route without lines cutting through text) */}
          <nav className="ks-navbar-desktop-nav" aria-label="Main Navigation">
            {desktopNavItems.map((item) => {
              const active = isActiveRoute(item.path);
              const isCart = item.path === '/cart';
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  data-nav-cart={isCart ? 'true' : undefined}
                  className={`ks-nav-desktop-item ${active ? 'is-active' : ''} ${isCart ? 'ks-nav-cart-btn' : ''}`}
                >
                  <span className="ks-nav-desktop-label">
                    {item.label}
                    {item.count > 0 && (
                      <span className="ks-nav-inline-badge">{item.count}</span>
                    )}
                  </span>
                </Link>
              );
            })}
          </nav>

          {/* Right: Desktop Icons (Search, Favorites, Notifications) + Top Right Sign In / Profile */}
          <div className="ks-navbar-right">
            {/* Desktop Icons Grouped Next to Each Other */}
            <div className="ks-navbar-desktop-icons-group">
              {/* Search Button */}
              <button
                type="button"
                onClick={() => setSearchOpen(!searchOpen)}
                className={`ks-nav-action-btn ${searchOpen ? 'is-active' : ''}`}
                aria-label={searchOpen ? 'Close search' : 'Open search'}
                title="Search"
              >
                {searchOpen ? <X size={19} strokeWidth={1.75} /> : <Search size={19} strokeWidth={1.75} />}
              </button>

              {/* Favorites Icon Button (target for heart animation) */}
              <Link
                to="/favorites"
                data-nav-favorites="true"
                className="ks-nav-action-btn ks-nav-fav-btn"
                aria-label="Favorites"
                title="Favorites"
              >
                <Heart size={19} strokeWidth={1.75} />
                {counts.favorites > 0 && (
                  <span className="ks-nav-badge">{counts.favorites}</span>
                )}
              </Link>


              {/* Notifications Icon Button */}
              <Link
                to="/notifications"
                className="ks-nav-action-btn"
                aria-label="Notifications"
                title="Notifications"
              >
                <Bell size={19} strokeWidth={1.75} />
                {counts.notifications > 0 && (
                  <span className="ks-nav-badge">{counts.notifications}</span>
                )}
              </Link>
            </div>

            {/* Top Right Desktop Auth Control: Normal Sign In Button, or Profile Icon if Signed In */}
            <div className="ks-navbar-desktop-auth">
              {user ? (
                <Link
                  to="/profile"
                  className="ks-nav-action-btn ks-nav-profile-btn"
                  aria-label="My Profile"
                  title={user.full_name || 'My Profile'}
                >
                  <User size={19} strokeWidth={1.75} />
                </Link>
              ) : (
                <Link
                  to="/login"
                  className="ks-nav-desktop-signin-btn"
                  aria-label="Sign In"
                >
                  SIGN IN
                </Link>
              )}
            </div>

            {/* Mobile / Tablet Utility Controls (< 1024px) */}
            <div className="ks-navbar-mobile-controls">
              {/* Mobile Search Button */}
              <button
                type="button"
                onClick={() => setSearchOpen(!searchOpen)}
                className="ks-nav-action-btn"
                aria-label={searchOpen ? 'Close search' : 'Open search'}
              >
                {searchOpen ? <X size={19} strokeWidth={1.75} /> : <Search size={19} strokeWidth={1.75} />}
              </button>

              {/* Mobile Cart Button */}
              <Link
                to="/cart"
                data-nav-cart="true"
                className="ks-nav-action-btn ks-nav-cart-btn"
                aria-label="Shopping Cart"
              >
                <ShoppingBag size={19} strokeWidth={1.75} />
                {counts.cart > 0 && (
                  <span className="ks-nav-badge">{counts.cart}</span>
                )}
              </Link>

              {/* Luxury Hamburger Trigger */}
              <button
                type="button"
                className="ks-hamburger-trigger"
                onClick={() => setMenuOpen(true)}
                aria-label="Open navigation menu"
                aria-expanded={menuOpen}
                title="Menu"
              >
                <span className="ks-hamburger-line ks-line-top" />
                <span className="ks-hamburger-line ks-line-bottom" />
              </button>
            </div>
          </div>

          {/* Centered Search Overlay (Expands gracefully with balanced space on both sides) */}
          {searchOpen && (
            <div className="ks-search-centered-overlay" role="search">
              <form onSubmit={handleSearchSubmit} className="ks-search-centered-form">
                <Search size={18} strokeWidth={1.75} className="ks-search-icon" aria-hidden="true" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={handleSearchKeyDown}
                  placeholder="SEARCH STORE..."
                  className="ks-search-input"
                  aria-label="Search store products"
                />
                <button
                  type="button"
                  onClick={() => {
                    setSearchOpen(false);
                    setSearchQuery('');
                  }}
                  className="ks-search-close-btn"
                  aria-label="Close search"
                >
                  <X size={17} strokeWidth={1.75} />
                </button>
              </form>
            </div>
          )}
        </div>
      </header>

      {/* Full-Screen Luxury Mobile Menu */}
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
