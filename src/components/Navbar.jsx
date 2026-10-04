import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  X,
  Heart,
  ShoppingCart,
  Package,
  Bell,
  Menu
} from 'lucide-react';
import HamburgerMenu from './HamburgerMenu';

export default function Navbar({ siteSettings = {}, categories = [], counts = {} }) {
  const navigate = useNavigate();

  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);

  const searchInputRef = useRef(null);

  // Auto focus search input when opened
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
      <header className="ks-navbar-root">
        <div className="ks-navbar-container">
          {/* Far Left: Brand / Logo */}
          <div className="ks-navbar-left">
            <Link to="/" className="ks-navbar-brand-link" aria-label="Keeper Sports Home">
              {siteSettings?.logo_path ? (
                <img
                  src={siteSettings.logo_path}
                  alt={siteSettings.site_name || 'Keeper Sports'}
                  className="ks-navbar-logo-img"
                  onError={(e) => {
                    // Fallback to text if image fails to load
                    e.target.style.display = 'none';
                    const fallback = e.target.parentElement.querySelector('.ks-navbar-logo-text');
                    if (fallback) fallback.style.display = 'flex';
                  }}
                />
              ) : null}
              <span
                className="ks-navbar-logo-text"
                style={{ display: siteSettings?.logo_path ? 'none' : 'flex' }}
              >
                KEEPER<span className="ks-brand-dot">SPORTS</span>
              </span>
            </Link>
          </div>

          {/* Far Right Navigation Area */}
          <div className="ks-navbar-right">
            {/* Search Action / Expandable Input */}
            <div className={`ks-nav-search-wrapper ${searchOpen ? 'is-open' : ''}`}>
              {searchOpen ? (
                <form onSubmit={handleSearchSubmit} className="ks-nav-search-form">
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={handleSearchKeyDown}
                    placeholder="Search kits, teams, players..."
                    className="ks-nav-search-input"
                    aria-label="Search store"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setSearchOpen(false);
                      setSearchQuery('');
                    }}
                    className="ks-nav-search-close-btn"
                    aria-label="Close search"
                  >
                    <X size={16} />
                  </button>
                </form>
              ) : (
                <button
                  type="button"
                  onClick={() => setSearchOpen(true)}
                  className="ks-nav-action-btn"
                  aria-label="Open search"
                  title="Search"
                >
                  <Search size={18} />
                </button>
              )}
            </div>

            {/* Desktop Navigation Items (Hidden on small mobile) */}
            <div className="ks-navbar-desktop-links">
              {/* Favorites */}
              <Link to="/favorites" className="ks-nav-text-link">
                <span>Favorites</span>
                {counts.favorites > 0 && (
                  <span className="ks-nav-badge">{counts.favorites}</span>
                )}
              </Link>

              {/* Orders */}
              <Link to="/orders" className="ks-nav-text-link">
                <span>Orders</span>
                {counts.orders > 0 && (
                  <span className="ks-nav-badge ks-nav-badge-neutral">{counts.orders}</span>
                )}
              </Link>

              {/* Cart */}
              <Link to="/cart" className="ks-nav-text-link">
                <span>Cart</span>
                {counts.cart > 0 && (
                  <span className="ks-nav-badge">{counts.cart}</span>
                )}
              </Link>

              {/* Notifications */}
              <Link
                to="/notifications"
                className="ks-nav-icon-link"
                aria-label="Notifications"
                title="Notifications"
              >
                <Bell size={18} />
                {counts.notifications > 0 && (
                  <span className="ks-nav-badge ks-nav-badge-dot" />
                )}
              </Link>
            </div>

            {/* Mobile Direct Cart Icon */}
            <div className="ks-navbar-mobile-cart">
              <Link to="/cart" className="ks-nav-action-btn" aria-label="Shopping Cart">
                <ShoppingCart size={19} />
                {counts.cart > 0 && (
                  <span className="ks-nav-badge ks-mobile-cart-badge">{counts.cart}</span>
                )}
              </Link>
            </div>

            {/* Farthest Right Item: Hamburger Menu Button */}
            <button
              type="button"
              className="ks-nav-action-btn ks-hamburger-btn"
              onClick={() => setMenuOpen(true)}
              aria-label="Open navigation menu"
              title="Menu"
            >
              <Menu size={22} />
            </button>
          </div>
        </div>
      </header>

      {/* Slide-out Hamburger Menu Drawer */}
      <HamburgerMenu
        isOpen={menuOpen}
        onClose={() => setMenuOpen(false)}
        categories={categories}
        counts={counts}
      />
    </>
  );
}
