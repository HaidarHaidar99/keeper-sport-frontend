import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
  X,
  ShoppingBag,
  Heart,
  Package,
  Sun,
  Moon,
  User,
  LogOut,
  MapPin,
  Phone,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';

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
  const curtainRef = useRef(null);

  // Close smoothly
  const handleClose = () => {
    if (isClosing) return;
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      onClose();
    }, 380);
  };

  // Close on route change
  useEffect(() => {
    if (isOpen) {
      onClose();
    }
  }, [location.pathname]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        handleClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Lock background body scroll while curtain is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleLogout = async () => {
    await logout();
    handleClose();
    navigate('/login');
  };

  if (!isOpen && !isClosing) return null;

  // Real route matching
  const isItemActive = (path) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  // Navigation Links strictly in their normal order
  const navLinks = [
    { num: '01', label: 'HOME', path: '/' },
    { num: '02', label: 'PRODUCTS', path: '/products' },
    { num: '03', label: 'CATEGORIES', path: '/categories' },
    { num: '04', label: 'OFFERS', path: '/offers' },
    { num: '05', label: 'MY ORDERS', path: '/orders', count: counts.orders },
    { num: '06', label: 'CART', path: '/cart', count: counts.cart },
    { num: '07', label: 'FAVORITES', path: '/favorites', count: counts.favorites },
    { num: '08', label: 'REVIEWS', path: '/reviews' },
    { num: '09', label: 'ABOUT US', path: '/about' },
    { num: '10', label: 'CONTACT US', path: '/contact' }
  ];

  return (
    <div
      ref={curtainRef}
      className={`ks-curtain-root ${isClosing ? 'is-closing' : 'is-open'}`}
      role="dialog"
      aria-modal="true"
      aria-label="Navigation Menu"
    >
      <div className="ks-curtain-container">
        {/* Top Header Bar */}
        <div className="ks-curtain-topbar">
          <div className="ks-curtain-brand">
            {siteSettings?.logo_path ? (
              <img
                src={siteSettings.logo_path}
                alt={siteSettings?.site_name || 'Keeper Sports'}
                className="ks-curtain-logo"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  const fb = e.currentTarget.parentElement?.querySelector('.ks-curtain-logo-fallback');
                  if (fb) fb.style.display = 'flex';
                }}
              />
            ) : null}
            <div
              className="ks-curtain-logo-fallback"
              style={{ display: siteSettings?.logo_path ? 'none' : 'flex' }}
            >
              <span className="ks-curtain-logo-text">KEEPER SPORTS</span>
            </div>
          </div>

          <div className="ks-curtain-top-actions">
            {/* Theme Toggle in Curtain */}
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
              type="button"
              className="ks-curtain-close-btn"
              onClick={handleClose}
              aria-label="Close navigation curtain"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Main Curtain Content */}
        <div className="ks-curtain-body">
          {/* Left Column: Sequential Staggered Navigation Links */}
          <nav className="ks-curtain-nav" aria-label="Curtain Navigation">
            {navLinks.map((item, idx) => {
              const active = isItemActive(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`ks-curtain-nav-link ${active ? 'is-active' : ''}`}
                  style={{ animationDelay: `${idx * 0.04 + 0.08}s` }}
                  onClick={handleClose}
                >
                  <span className="ks-curtain-link-num">{item.num}</span>
                  <span className="ks-curtain-link-label">{item.label}</span>
                  {active && <span className="ks-curtain-active-dot" aria-label="Current page" />}
                  {item.count > 0 && (
                    <span className="ks-curtain-count-pill">{item.count}</span>
                  )}
                  <ArrowRight size={18} className="ks-curtain-arrow-hint" />
                </Link>
              );
            })}
          </nav>

          {/* Right Column: Categories Showcase & Store Contact */}
          <div className="ks-curtain-sidebar">
            {/* Quick Categories Section */}
            {categories && categories.length > 0 && (
              <div className="ks-curtain-sidebar-section">
                <span className="ks-curtain-sidebar-title">FEATURED CATEGORIES</span>
                <div className="ks-curtain-categories-grid">
                  {categories.slice(0, 6).map((cat) => (
                    <Link
                      key={cat.id || cat.slug}
                      to={`/products?category=${encodeURIComponent(cat.slug || cat.id)}`}
                      className="ks-curtain-cat-chip"
                      onClick={handleClose}
                    >
                      <span>{cat.name}</span>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Customer Account Strip */}
            <div className="ks-curtain-sidebar-section ks-curtain-auth-section">
              <span className="ks-curtain-sidebar-title">ACCOUNT</span>
              {user ? (
                <div className="ks-curtain-user-card">
                  <div className="ks-curtain-user-info">
                    <User size={18} className="ks-curtain-user-icon" />
                    <span className="ks-curtain-user-name">{user.full_name || user.email}</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="ks-curtain-logout-btn"
                  >
                    <LogOut size={15} />
                    <span>Sign Out</span>
                  </button>
                </div>
              ) : (
                <div className="ks-curtain-auth-actions">
                  <Link
                    to="/login"
                    className="ks-curtain-auth-btn-primary"
                    onClick={handleClose}
                  >
                    SIGN IN
                  </Link>
                  <Link
                    to="/signup"
                    className="ks-curtain-auth-btn-secondary"
                    onClick={handleClose}
                  >
                    REGISTER
                  </Link>
                </div>
              )}
            </div>

            {/* Store Contact & Location Details */}
            {(siteSettings?.phone_number || siteSettings?.whatsapp_number || siteSettings?.location_name) && (
              <div className="ks-curtain-sidebar-section ks-curtain-contact-section">
                <span className="ks-curtain-sidebar-title">DIRECT INQUIRIES</span>
                <div className="ks-curtain-contact-items">
                  {siteSettings?.location_name && (
                    <div className="ks-curtain-contact-line">
                      <MapPin size={15} />
                      <span>{siteSettings.location_name}</span>
                    </div>
                  )}
                  {siteSettings?.phone_number && (
                    <div className="ks-curtain-contact-line">
                      <Phone size={15} />
                      <a href={`tel:${siteSettings.phone_number}`}>{siteSettings.phone_number}</a>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
