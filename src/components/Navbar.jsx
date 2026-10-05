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
import HamburgerMenu from './HamburgerMenu';

export default function Navbar({ siteSettings = {}, categories = [], counts = {} }) {
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
          {/* Left: Dynamic Store Logo from Backend Settings or Neutral Placeholder */}
          <div className="ks-navbar-left">
            <Link to="/" className="ks-navbar-brand-link" aria-label="Store Home">
              {siteSettings?.logo_path ? (
                <img
                  src={siteSettings.logo_path}
                  alt={siteSettings?.site_name || 'Store Logo'}
                  className="ks-navbar-logo-img"
                  onError={(e) => {
                    // Hide broken image link and display minimal neutral placeholder
                    e.currentTarget.style.display = 'none';
                    const fallback = e.currentTarget.parentElement?.querySelector('.ks-navbar-logo-placeholder');
                    if (fallback) fallback.style.display = 'flex';
                  }}
                />
              ) : null}

              {/* Minimal neutral placeholder when no dynamic logo is configured yet */}
              <div
                className="ks-navbar-logo-placeholder"
                style={{ display: siteSettings?.logo_path ? 'none' : 'flex' }}
                aria-label="Store Logo"
                title="Store Logo"
              >
                <svg
                  className="ks-navbar-logo-mark"
                  viewBox="0 0 40 40"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                >
                  <path
                    d="M20 4L34 11V21C34 29.5 28 35.5 20 38C12 35.5 6 29.5 6 21V11L20 4Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M20 13V27M13 20H27"
                    stroke="currentColor"
                    strokeWidth="1.75"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    opacity="0.6"
                  />
                </svg>
              </div>
            </Link>
          </div>

          {/* Center: Desktop Horizontal Navigation Links (with red line IN the active word) */}
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

              {/* Favorites Icon Button */}
              <Link
                to="/favorites"
                className="ks-nav-action-btn"
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
