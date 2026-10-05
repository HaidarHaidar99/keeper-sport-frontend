import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
  X,
  ChevronDown,
  ChevronRight,
  Sun,
  Moon,
  Bell,
  User,
  LogOut
} from 'lucide-react';

export default function HamburgerMenu({
  isOpen,
  onClose,
  siteSettings = {},
  categories = [],
  counts = {}
}) {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  // Smooth closing handler with animation
  const handleCloseWithAnim = () => {
    if (isClosing) return;
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      onClose();
    }, 280);
  };

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        handleCloseWithAnim();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Lock body scroll when full-screen menu is open
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
    handleCloseWithAnim();
    navigate('/login');
  };

  if (!isOpen && !isClosing) return null;

  // Navigation Items (Clean Word-Based including OFFERS)
  const navItems = [
    { label: 'HOME', path: '/' },
    { label: 'PRODUCTS', path: '/products' },
    { label: 'CATEGORIES', path: '/categories', hasSubmenu: true },
    { label: 'OFFERS', path: '/offers' },
    { label: 'MY ORDERS', path: '/orders' },
    { label: 'CART', path: '/cart', count: counts.cart },
    { label: 'FAVORITES', path: '/favorites', count: counts.favorites },
    { label: 'REVIEWS', path: '/reviews' },
    { label: 'ABOUT US', path: '/about' },
    { label: 'CONTACT US', path: '/contact' }
  ];

  // Helper to check active status based on current route
  const isItemActive = (path) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  // Determine active item index so it enters FIRST in the sequential entrance animation
  const activeIndex = navItems.findIndex((item) => isItemActive(item.path));

  // Compute staggered animation delay: active item gets index 0 (enters first),
  // subsequent items enter one-by-one with a slower, more graceful flow.
  const getAnimationDelay = (index) => {
    if (index === activeIndex) {
      return '0.12s';
    }
    const offset = index > activeIndex ? index : index + 1;
    return `${0.18 + offset * 0.085}s`;
  };

  return (
    <div
      className={`ks-mobile-fullscreen-root ${isClosing ? 'is-closing' : ''}`}
      role="dialog"
      aria-modal="true"
      aria-label="Navigation Menu"
    >
      {/* Full-Screen Container */}
      <div className="ks-mobile-fullscreen-container">
        {/* Top Header: Logo + Minimal Close Button */}
        <div className="ks-mobile-fullscreen-header">
          <div className="ks-mobile-header-logo">
            {siteSettings?.logo_path ? (
              <img
                src={siteSettings.logo_path}
                alt={siteSettings?.site_name || 'Store Logo'}
                className="ks-mobile-logo-img"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  const fallback = e.currentTarget.parentElement?.querySelector('.ks-mobile-logo-placeholder');
                  if (fallback) fallback.style.display = 'flex';
                }}
              />
            ) : null}
            <div
              className="ks-mobile-logo-placeholder"
              style={{ display: siteSettings?.logo_path ? 'none' : 'flex' }}
              aria-label="Store Logo"
            >
              <svg
                className="ks-mobile-logo-mark"
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
          </div>

          <button
            type="button"
            className="ks-mobile-close-btn"
            onClick={handleCloseWithAnim}
            aria-label="Close navigation menu"
          >
            <X size={26} strokeWidth={1.75} />
          </button>
        </div>

        {/* Main Editorial Word-Based Navigation Links */}
        <nav className="ks-mobile-fullscreen-nav" aria-label="Mobile Navigation">
          {navItems.map((item, index) => {
            const active = isItemActive(item.path);
            const animDelay = getAnimationDelay(index);

            if (item.hasSubmenu) {
              return (
                <div
                  key={item.label}
                  className={`ks-mobile-nav-group ${active ? 'is-active' : ''}`}
                  style={{ animationDelay: animDelay }}
                >
                  <div className="ks-mobile-nav-row">
                    <Link
                      to={item.path}
                      className={`ks-mobile-nav-word ${active ? 'is-active' : ''}`}
                      onClick={handleCloseWithAnim}
                    >
                      <span className="ks-mobile-word-text">
                        {item.label}
                        {active && (
                          <span className="ks-mobile-active-red-line-in-word" aria-hidden="true" />
                        )}
                      </span>
                    </Link>

                    {categories && categories.length > 0 && (
                      <button
                        type="button"
                        className="ks-mobile-category-toggle"
                        onClick={(e) => {
                          e.stopPropagation();
                          setCategoriesOpen(!categoriesOpen);
                        }}
                        aria-label={categoriesOpen ? 'Collapse categories' : 'Expand categories'}
                        aria-expanded={categoriesOpen}
                      >
                        {categoriesOpen ? (
                          <ChevronDown size={22} strokeWidth={1.75} />
                        ) : (
                          <ChevronRight size={22} strokeWidth={1.75} />
                        )}
                      </button>
                    )}
                  </div>

                  {/* Expandable Subcategories */}
                  {categoriesOpen && categories && categories.length > 0 && (
                    <div className="ks-mobile-subcategories-list">
                      {categories.map((cat) => (
                        <Link
                          key={cat.id || cat.slug}
                          to={`/categories/${cat.slug || cat.id}`}
                          className="ks-mobile-subcategory-item"
                          onClick={handleCloseWithAnim}
                        >
                          {cat.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            }

            return (
              <div
                key={item.label}
                className={`ks-mobile-nav-item ${active ? 'is-active' : ''}`}
                style={{ animationDelay: animDelay }}
              >
                <Link
                  to={item.path}
                  className={`ks-mobile-nav-word ${active ? 'is-active' : ''}`}
                  onClick={handleCloseWithAnim}
                >
                  <span className="ks-mobile-word-text">
                    {item.label}
                    {item.count > 0 && (
                      <span className="ks-mobile-word-badge">{item.count}</span>
                    )}
                    {active && (
                      <span className="ks-mobile-active-red-line-in-word" aria-hidden="true" />
                    )}
                  </span>
                </Link>
              </div>
            );
          })}
        </nav>

        {/* Bottom Utility Area */}
        <div className="ks-mobile-fullscreen-footer">
          {/* Top Row in Footer: Theme and Alerts */}
          <div className="ks-mobile-footer-utilities">
            {/* Light / Dark Theme Toggle */}
            <button
              type="button"
              className="ks-mobile-footer-icon-btn"
              onClick={toggleTheme}
              aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
              title="Toggle Theme"
            >
              {theme === 'dark' ? (
                <Sun size={20} strokeWidth={1.75} />
              ) : (
                <Moon size={20} strokeWidth={1.75} />
              )}
              <span className="ks-mobile-footer-label">
                {theme === 'dark' ? 'LIGHT' : 'DARK'}
              </span>
            </button>

            {/* Notifications */}
            <Link
              to="/notifications"
              className="ks-mobile-footer-icon-btn"
              onClick={handleCloseWithAnim}
              aria-label="Notifications"
            >
              <div className="ks-mobile-footer-icon-wrapper">
                <Bell size={20} strokeWidth={1.75} />
                {counts.notifications > 0 && (
                  <span className="ks-nav-badge ks-mobile-footer-badge">{counts.notifications}</span>
                )}
              </div>
              <span className="ks-mobile-footer-label">ALERTS</span>
            </Link>
          </div>

          {/* Bottom Row in Footer: Real SIGN IN Button (or Profile/Logout if Authenticated) */}
          <div className="ks-mobile-footer-auth-row">
            {user ? (
              <div className="ks-mobile-auth-logged-in">
                <Link
                  to="/profile"
                  className="ks-mobile-profile-link"
                  onClick={handleCloseWithAnim}
                >
                  <User size={18} strokeWidth={1.75} />
                  <span>{user.full_name || 'MY ACCOUNT'}</span>
                </Link>
                <button
                  type="button"
                  className="ks-mobile-logout-btn"
                  onClick={handleLogout}
                  aria-label="Log Out"
                >
                  <LogOut size={16} strokeWidth={1.75} />
                  <span>LOGOUT</span>
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="ks-mobile-real-signin-btn"
                onClick={handleCloseWithAnim}
                aria-label="Sign In"
              >
                SIGN IN
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
