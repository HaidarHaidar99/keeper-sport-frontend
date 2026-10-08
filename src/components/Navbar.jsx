import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Search,
  X,
  Heart,
  ShoppingBag,
  Bell,
  User,
  Sun,
  Moon
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSite } from '../context/SiteContext';
import { useTheme } from '../context/ThemeContext';
import HamburgerMenu from './HamburgerMenu';

export default function Navbar({ siteSettings: propSettings, categories: propCategories, counts: propCounts }) {
  const siteCtx = useSite();
  const siteSettings = (propSettings && Object.keys(propSettings).length > 0) ? propSettings : (siteCtx?.siteSettings || {});
  const categories = (propCategories && propCategories.length > 0) ? propCategories : (siteCtx?.categories || []);
  const counts = (propCounts && Object.keys(propCounts).length > 0) ? propCounts : (siteCtx?.counts || {});

  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();

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

  return (
    <>
      <header className="ks-navbar-root" role="banner">
        <div className="ks-navbar-container">
          {/* Left: Prominent Keeper Sports Logo */}
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

              {/* Bold Athletic Brand Lockup Fallback */}
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
                  <span className="ks-logo-primary">{siteSettings?.site_name || 'KEEPER SPORTS'}</span>
                  <span className="ks-logo-secondary">AUTHENTIC FOOTBALL GEAR</span>
                </div>
              </div>
            </Link>
          </div>

          {/* Right: Action Icons + Distinctive 2-Line Hamburger Menu Button */}
          <div className="ks-navbar-right">
            {/* Search Toggle Button */}
            <button
              type="button"
              onClick={() => setSearchOpen(!searchOpen)}
              className={`ks-nav-action-btn ${searchOpen ? 'is-active' : ''}`}
              aria-label={searchOpen ? 'Close search' : 'Open search'}
              title="Search store"
            >
              {searchOpen ? <X size={20} /> : <Search size={20} />}
            </button>

            {/* Favorites Icon Button (target for heart animation) */}
            <Link
              to="/favorites"
              data-nav-favorites="true"
              className="ks-nav-action-btn ks-nav-fav-btn"
              aria-label="Favorites"
              title="Favorites"
            >
              <Heart size={20} />
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
              <Bell size={20} />
              {counts.notifications > 0 && (
                <span className="ks-nav-badge">{counts.notifications}</span>
              )}
            </Link>

            {/* Cart Icon Button (target for football animation) */}
            <Link
              to="/cart"
              data-nav-cart="true"
              className="ks-nav-action-btn ks-nav-cart-btn"
              aria-label="Shopping Cart"
              title="Cart"
            >
              <ShoppingBag size={20} />
              {counts.cart > 0 && (
                <span className="ks-nav-badge">{counts.cart}</span>
              )}
            </Link>

            {/* Theme Toggle Button */}
            <button
              type="button"
              onClick={toggleTheme}
              className="ks-nav-action-btn ks-nav-theme-btn"
              aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
              title="Toggle theme"
            >
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            {/* Account / Profile Control */}
            {user ? (
              <Link
                to="/profile"
                className="ks-nav-action-btn ks-nav-profile-btn"
                aria-label="Account Profile"
                title={user.full_name || 'My Profile'}
              >
                <User size={20} />
              </Link>
            ) : (
              <Link
                to="/login"
                className="ks-nav-action-btn ks-nav-login-btn"
                aria-label="Sign In"
                title="Sign In"
              >
                <User size={20} />
              </Link>
            )}

            {/* Distinctive Hamburger Menu Control: Larger line above, shorter line below */}
            <button
              type="button"
              className="ks-hamburger-trigger"
              onClick={() => setMenuOpen(true)}
              aria-label="Open navigation curtain"
              aria-expanded={menuOpen}
              title="Menu"
            >
              <span className="ks-hamburger-line ks-line-top" />
              <span className="ks-hamburger-line ks-line-bottom" />
            </button>
          </div>

          {/* Centered Expandable Search Overlay */}
          {searchOpen && (
            <div className="ks-search-centered-overlay" role="search">
              <form onSubmit={handleSearchSubmit} className="ks-search-centered-form">
                <Search size={18} className="ks-search-icon" aria-hidden="true" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={handleSearchKeyDown}
                  placeholder="SEARCH PRODUCTS OR CATEGORIES..."
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
                  <X size={18} />
                </button>
              </form>
            </div>
          )}
        </div>
      </header>

      {/* Full-Screen Navigation Curtain */}
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
