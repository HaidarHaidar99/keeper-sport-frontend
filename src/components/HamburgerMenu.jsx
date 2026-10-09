import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  X,
  Search,
  ShoppingBag,
  Heart,
  Bell,
  Package,
  Sun,
  Moon,
  User,
  LogOut,
  MapPin,
  Phone,
  ArrowRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export default function HamburgerMenu({
  isOpen,
  onClose,
  siteSettings,
  categories = [],
  counts = {}
}) {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  const [isClosing, setIsClosing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const closeBtnRef = useRef(null);

  // Close smoothly with curtain retreat animation
  const handleClose = () => {
    if (isClosing) return;
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      onClose();
    }, 360);
  };

  // Close on route change
  useEffect(() => {
    if (isOpen) {
      onClose();
    }
  }, [location.pathname]);

  // Close on Escape key + focus management
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        handleClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      // Focus close button on open
      setTimeout(() => {
        closeBtnRef.current?.focus();
      }, 100);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Body scroll locking
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      handleClose();
      setSearchQuery('');
    }
  };

  const handleLogout = async () => {
    await logout();
    handleClose();
    navigate('/login');
  };

  if (!isOpen && !isClosing) return null;

  // Active route matching (no red underline; typographic emphasis)
  const isItemActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  const mainNavLinks = [
    { num: '01', label: 'HOME', path: '/' },
    { num: '02', label: 'PRODUCTS', path: '/products' },
    { num: '03', label: 'CATEGORIES', path: '/categories' },
    { num: '04', label: 'OFFERS', path: '/offers' },
    { num: '05', label: 'REVIEWS', path: '/reviews' },
    { num: '06', label: 'ABOUT US', path: '/about' },
    { num: '07', label: 'CONTACT', path: '/contact' }
  ];

  const cleanWhatsApp = siteSettings?.whatsapp_number
    ? siteSettings.whatsapp_number.replace(/[^0-9]/g, '')
    : null;

  return (
    <div
      className={`ks-curtain-root ${isClosing ? 'is-closing' : 'is-open'}`}
      role="dialog"
      aria-modal="true"
      aria-label="Navigation Menu"
    >
      {/* Backdrop */}
      <div className="ks-curtain-backdrop" onClick={handleClose} />

      {/* Main Sliding Curtain Surface (Opens left to right) */}
      <div className="ks-curtain-canvas">
        {/* Top Bar inside Curtain */}
        <div className="ks-curtain-top-bar">
          <div className="ks-curtain-brand">
            {siteSettings?.logo_path ? (
              <img
                src={siteSettings.logo_path}
                alt={siteSettings?.site_name || 'Keeper Sports'}
                className="ks-curtain-logo-img"
              />
            ) : (
              <span className="ks-curtain-logo-text">
                {siteSettings?.site_name || 'KEEPER SPORTS'}
              </span>
            )}
          </div>

          <div className="ks-curtain-top-actions">
            {/* Theme Toggle Button */}
            <button
              type="button"
              onClick={toggleTheme}
              className="ks-curtain-theme-btn"
              aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
              title="Toggle theme"
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {/* Close Button */}
            <button
              ref={closeBtnRef}
              type="button"
              className="ks-curtain-close-btn"
              onClick={handleClose}
              aria-label="Close menu"
              title="Close menu"
            >
              <X size={22} />
            </button>
          </div>
        </div>

        {/* Curtain Body: 2 Columns on desktop, stacked on mobile */}
        <div className="ks-curtain-body">
          {/* Left Column: Sequential Navigation Links (Aligned to the left) */}
          <div className="ks-curtain-left-col">
            {/* Curtain Search Bar */}
            <form onSubmit={handleSearchSubmit} className="ks-curtain-search-form">
              <Search size={18} className="ks-curtain-search-icon" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="SEARCH GEAR, BOOTS, KITS..."
                className="ks-curtain-search-input"
                aria-label="Search products in menu"
              />
              <button type="submit" className="ks-curtain-search-submit">
                GO
              </button>
            </form>

            {/* Sequential Links with Staggered Entrance */}
            <nav className="ks-curtain-links-nav" aria-label="Main Navigation">
              {mainNavLinks.map((item, idx) => {
                const active = isItemActive(item.path);
                return (
                  <div
                    key={item.path}
                    className={`ks-curtain-link-item ${active ? 'is-active' : ''}`}
                    style={{ animationDelay: `${idx * 0.045 + 0.06}s` }}
                  >
                    <Link
                      to={item.path}
                      className="ks-curtain-link-anchor"
                      onClick={handleClose}
                    >
                      <span className="ks-curtain-link-num">{item.num}</span>
                      <span className="ks-curtain-link-label">{item.label}</span>
                      {active && (
                        <span className="ks-curtain-active-indicator" title="Current route">
                          CURRENT
                        </span>
                      )}
                    </Link>
                  </div>
                );
              })}
            </nav>
          </div>

          {/* Right Column: Customer Hub & Quick Access */}
          <div className="ks-curtain-right-col">
            {/* Customer Quick Actions Hub */}
            <div className="ks-curtain-hub-section">
              <span className="ks-curtain-hub-title">MY ACTIVITY</span>
              <div className="ks-curtain-hub-grid">
                {/* Cart Action */}
                <Link
                  to="/cart"
                  className="ks-curtain-hub-card"
                  onClick={handleClose}
                >
                  <div className="ks-curtain-hub-card-left">
                    <ShoppingBag size={18} />
                    <span>Shopping Cart</span>
                  </div>
                  {counts.cart > 0 && (
                    <span className="ks-curtain-hub-badge">{counts.cart}</span>
                  )}
                </Link>

                {/* Favorites Action */}
                <Link
                  to="/favorites"
                  className="ks-curtain-hub-card"
                  onClick={handleClose}
                >
                  <div className="ks-curtain-hub-card-left">
                    <Heart size={18} />
                    <span>Favorites</span>
                  </div>
                  {counts.favorites > 0 && (
                    <span className="ks-curtain-hub-badge">{counts.favorites}</span>
                  )}
                </Link>

                {/* Orders Action */}
                <Link
                  to="/orders"
                  className="ks-curtain-hub-card"
                  onClick={handleClose}
                >
                  <div className="ks-curtain-hub-card-left">
                    <Package size={18} />
                    <span>My Orders</span>
                  </div>
                  {counts.orders > 0 && (
                    <span className="ks-curtain-hub-badge">{counts.orders}</span>
                  )}
                </Link>

                {/* Notifications Action */}
                <Link
                  to="/notifications"
                  className="ks-curtain-hub-card"
                  onClick={handleClose}
                >
                  <div className="ks-curtain-hub-card-left">
                    <Bell size={18} />
                    <span>Notifications</span>
                  </div>
                  {counts.notifications > 0 && (
                    <span className="ks-curtain-hub-badge">{counts.notifications}</span>
                  )}
                </Link>
              </div>
            </div>

            {/* Account Strip */}
            <div className="ks-curtain-hub-section">
              <span className="ks-curtain-hub-title">ACCOUNT</span>
              {user ? (
                <div className="ks-curtain-account-card">
                  <div className="ks-curtain-account-user">
                    <User size={18} className="ks-curtain-account-avatar" />
                    <div className="ks-curtain-account-text">
                      <span className="ks-curtain-account-name">{user.full_name || 'Valued Athlete'}</span>
                      <span className="ks-curtain-account-email">{user.email}</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="ks-curtain-signout-btn"
                  >
                    <LogOut size={14} />
                    <span>Sign Out</span>
                  </button>
                </div>
              ) : (
                <div className="ks-curtain-auth-btns">
                  <Link
                    to="/login"
                    className="ks-curtain-btn-signin"
                    onClick={handleClose}
                  >
                    SIGN IN
                  </Link>
                  <Link
                    to="/signup"
                    className="ks-curtain-btn-register"
                    onClick={handleClose}
                  >
                    CREATE ACCOUNT
                  </Link>
                </div>
              )}
            </div>

            {/* Quick Categories */}
            {categories && categories.length > 0 && (
              <div className="ks-curtain-hub-section">
                <span className="ks-curtain-hub-title">CATEGORIES</span>
                <div className="ks-curtain-categories-wrap">
                  {categories.slice(0, 6).map((cat) => (
                    <Link
                      key={cat.id || cat.slug}
                      to={`/products?category=${encodeURIComponent(cat.slug || cat.id)}`}
                      className="ks-curtain-cat-pill"
                      onClick={handleClose}
                    >
                      {cat.name}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Store Inquiries */}
            {(siteSettings?.location_name || siteSettings?.phone_number || siteSettings?.whatsapp_number) && (
              <div className="ks-curtain-hub-section ks-curtain-contact-info">
                <span className="ks-curtain-hub-title">CUSTOMER CARE</span>
                {siteSettings?.location_name && (
                  <div className="ks-curtain-contact-item">
                    <MapPin size={15} />
                    <span>{siteSettings.location_name}</span>
                  </div>
                )}
                {siteSettings?.phone_number && (
                  <div className="ks-curtain-contact-item">
                    <Phone size={15} />
                    <a href={`tel:${siteSettings.phone_number}`}>{siteSettings.phone_number}</a>
                  </div>
                )}
                {siteSettings?.whatsapp_number && (
                  <div className="ks-curtain-contact-item">
                    <span className="ks-curtain-wa-dot" />
                    <a
                      href={`https://wa.me/${cleanWhatsApp}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      WhatsApp: {siteSettings.whatsapp_number}
                    </a>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
