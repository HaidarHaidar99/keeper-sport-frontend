import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  X,
  ShoppingBag,
  Heart,
  Bell,
  Package,
  Sun,
  Moon,
  User
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { DEFAULT_LOGO_URL } from '../context/SiteContext';

export default function HamburgerMenu({
  isOpen,
  onClose,
  siteSettings,
  counts = {}
}) {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();

  const [isClosing, setIsClosing] = useState(false);
  const closeBtnRef = useRef(null);

  // Close smoothly with curtain retreat animation
  const handleClose = () => {
    if (isClosing) return;
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      onClose();
    }, 400);
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

  if (!isOpen && !isClosing) return null;

  const isItemActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  const navLinks = [
    { label: 'HOME', path: '/' },
    { label: 'PRODUCTS', path: '/products' },
    { label: 'CATEGORIES', path: '/categories' },
    { label: 'OFFERS', path: '/offers' },
    { label: 'REVIEWS', path: '/reviews' },
    { label: 'ABOUT US', path: '/about' },
    { label: 'CONTACT', path: '/contact' }
  ];

  return (
    <div
      className={`ks-curtain-root ${isClosing ? 'is-closing' : 'is-open'}`}
      role="dialog"
      aria-modal="true"
      aria-label="Navigation Menu"
    >
      {/* Backdrop */}
      <div className="ks-curtain-backdrop" onClick={handleClose} />

      {/* Main Sliding Curtain Surface (Top-Left Aligned, Full Theme Parity) */}
      <div className="ks-curtain-canvas ks-curtain-canvas-theme">
        {/* Top Header inside Curtain */}
        <div className="ks-curtain-top-bar">
          <div className="ks-curtain-brand">
            <img
              key={theme === 'light' && siteSettings?.logo_light_path ? siteSettings.logo_light_path : (siteSettings?.logo_path || DEFAULT_LOGO_URL)}
              src={theme === 'light' && siteSettings?.logo_light_path ? siteSettings.logo_light_path : (siteSettings?.logo_path || DEFAULT_LOGO_URL)}
              alt={siteSettings?.site_name || 'Keeper Sports'}
              className="ks-curtain-logo-img"
              loading="eager"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                const fb = e.currentTarget.parentElement?.querySelector('.ks-curtain-logo-text');
                if (fb) fb.style.display = 'block';
              }}
            />
            <span className="ks-curtain-logo-text" style={{ display: 'none' }}>
              {siteSettings?.site_name || 'KEEPER SPORTS'}
            </span>
          </div>

          {/* Sleek Creative Circular Close Button */}
          <button
            ref={closeBtnRef}
            type="button"
            className="ks-curtain-close-btn-creative"
            onClick={handleClose}
            aria-label="Close menu"
            title="Close menu"
          >
            <X size={20} />
          </button>
        </div>

        {/* Curtain Body: Aligned from BEGINNING of screen (Left & Top), NOT centered */}
        <div className="ks-curtain-body-top-left">
          {/* Main Navigation Links: Animated fall from top-left */}
          <nav className="ks-curtain-nav-left" aria-label="Mobile Navigation">
            {navLinks.map((item, idx) => {
              const active = isItemActive(item.path);
              return (
                <div
                  key={item.path}
                  className="ks-curtain-falling-item-left"
                  style={{ animationDelay: `${0.08 + idx * 0.06}s` }}
                >
                  <Link
                    to={item.path}
                    className={`ks-curtain-left-link ${active ? 'is-active' : ''}`}
                    onClick={handleClose}
                  >
                    {/* Small Red Dot Indicator to know which page we are on */}
                    {active && <span className="ks-curtain-active-dot" aria-hidden="true" />}
                    <span>{item.label}</span>
                  </Link>
                </div>
              );
            })}
          </nav>

          {/* Central Beauty Card: Small Circular Icons beside each other */}
          <div className="ks-curtain-beauty-card ks-curtain-beauty-card-left">
            {/* Cart Icon */}
            <Link
              to="/cart"
              className="ks-curtain-beauty-icon-btn"
              onClick={handleClose}
              aria-label="Shopping Cart"
              title="Cart"
            >
              <ShoppingBag size={18} />
              {counts.cart > 0 && (
                <span className="ks-curtain-beauty-badge">{counts.cart}</span>
              )}
            </Link>

            {/* Favorites Icon */}
            <Link
              to="/favorites"
              className="ks-curtain-beauty-icon-btn"
              onClick={handleClose}
              aria-label="Favorites"
              title="Favorites"
            >
              <Heart size={18} />
              {counts.favorites > 0 && (
                <span className="ks-curtain-beauty-badge">{counts.favorites}</span>
              )}
            </Link>

            {/* Orders Icon */}
            <Link
              to="/orders"
              className="ks-curtain-beauty-icon-btn"
              onClick={handleClose}
              aria-label="My Orders"
              title="Orders"
            >
              <Package size={18} />
              {counts.orders > 0 && (
                <span className="ks-curtain-beauty-badge">{counts.orders}</span>
              )}
            </Link>

            {/* Notifications Icon */}
            <Link
              to="/notifications"
              className="ks-curtain-beauty-icon-btn"
              onClick={handleClose}
              aria-label="Notifications"
              title="Notifications"
            >
              <Bell size={18} />
              {counts.notifications > 0 && (
                <span className="ks-curtain-beauty-badge">{counts.notifications}</span>
              )}
            </Link>

            {/* Profile Icon */}
            <Link
              to={user ? '/profile' : '/login'}
              className="ks-curtain-beauty-icon-btn"
              onClick={handleClose}
              aria-label={user ? 'My Profile' : 'Sign In'}
              title={user ? 'My Profile' : 'Sign In'}
            >
              <User size={18} />
            </Link>

            {/* Light / Dark Theme Toggle Button */}
            <button
              type="button"
              onClick={toggleTheme}
              className="ks-curtain-beauty-icon-btn"
              aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
              title="Toggle theme"
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
