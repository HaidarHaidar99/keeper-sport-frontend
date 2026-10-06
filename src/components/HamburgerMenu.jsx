import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSite } from '../context/SiteContext';
import {
  X,
  ChevronDown,
  ChevronRight,
  User,
  LogOut,
  ShoppingBag,
  Heart,
  Package,
  ShieldCheck
} from 'lucide-react';

export default function HamburgerMenu({
  isOpen,
  onClose,
  siteSettings: propSettings,
  categories: propCategories,
  counts: propCounts
}) {
  const siteCtx = useSite();
  const siteSettings = (propSettings && Object.keys(propSettings).length > 0) ? propSettings : (siteCtx?.siteSettings || {});
  const categories = (propCategories && propCategories.length > 0) ? propCategories : (siteCtx?.categories || []);
  const counts = (propCounts && Object.keys(propCounts).length > 0) ? propCounts : (siteCtx?.counts || {});

  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  const handleClose = () => {
    if (isClosing) return;
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      onClose();
    }, 250);
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
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Lock body scroll when mobile drawer is open
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

  const navItems = [
    { label: 'HOME', path: '/' },
    { label: 'PRODUCTS', path: '/products' },
    { label: 'CATEGORIES', path: '/categories', hasSubmenu: true },
    { label: 'OFFERS', path: '/offers' },
    { label: 'MY ORDERS', path: '/orders', icon: Package },
    { label: 'CART', path: '/cart', count: counts.cart, icon: ShoppingBag },
    { label: 'FAVORITES', path: '/favorites', count: counts.favorites, icon: Heart },
    { label: 'REVIEWS', path: '/reviews' },
    { label: 'ABOUT US', path: '/about' },
    { label: 'CONTACT US', path: '/contact' }
  ];

  return (
    <div
      className={`ks-mobile-drawer-root ${isClosing ? 'is-closing' : 'is-open'}`}
      role="dialog"
      aria-modal="true"
      aria-label="Navigation Menu"
    >
      {/* Dimmed Backdrop */}
      <div className="ks-mobile-drawer-backdrop" onClick={handleClose} />

      {/* Drawer Panel Sliding in from the RIGHT */}
      <div className="ks-mobile-drawer-panel">
        {/* Drawer Header */}
        <div className="ks-mobile-drawer-header">
          <div className="ks-mobile-drawer-brand">
            {siteSettings?.logo_path ? (
              <img
                src={siteSettings.logo_path}
                alt={siteSettings?.site_name || 'Keeper Sports'}
                className="ks-mobile-drawer-logo"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  const fb = e.currentTarget.parentElement?.querySelector('.ks-mobile-drawer-logo-fallback');
                  if (fb) fb.style.display = 'flex';
                }}
              />
            ) : null}
            <div
              className="ks-mobile-drawer-logo-fallback"
              style={{ display: siteSettings?.logo_path ? 'none' : 'flex' }}
            >
              <ShieldCheck size={24} style={{ color: 'var(--ks-accent-red)' }} />
              <span className="ks-mobile-drawer-title">{siteSettings?.site_name || 'KEEPER SPORTS'}</span>
            </div>
          </div>

          <button
            type="button"
            className="ks-mobile-drawer-close"
            onClick={handleClose}
            aria-label="Close menu"
          >
            <X size={22} />
          </button>
        </div>

        {/* Drawer Scrollable Content */}
        <div className="ks-mobile-drawer-body">
          <nav className="ks-mobile-drawer-nav" aria-label="Mobile Navigation">
            {navItems.map((item) => {
              const active = isItemActive(item.path);

              if (item.hasSubmenu) {
                return (
                  <div key={item.label} className={`ks-mobile-nav-group ${active ? 'is-active' : ''}`}>
                    <div className="ks-mobile-nav-item-wrap">
                      <Link
                        to={item.path}
                        className={`ks-mobile-drawer-link ${active ? 'is-active' : ''}`}
                        onClick={handleClose}
                      >
                        {active && <span className="ks-mobile-route-red-bar" aria-hidden="true" />}
                        <span className="ks-mobile-drawer-link-text">{item.label}</span>
                      </Link>

                      {categories && categories.length > 0 && (
                        <button
                          type="button"
                          className="ks-mobile-subnav-toggle"
                          onClick={(e) => {
                            e.stopPropagation();
                            setCategoriesOpen(!categoriesOpen);
                          }}
                          aria-label={categoriesOpen ? 'Collapse categories' : 'Expand categories'}
                          aria-expanded={categoriesOpen}
                        >
                          {categoriesOpen ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                        </button>
                      )}
                    </div>

                    {/* Subcategories */}
                    {categoriesOpen && categories && categories.length > 0 && (
                      <div className="ks-mobile-subcategories-drawer">
                        {categories.map((cat) => (
                          <Link
                            key={cat.id || cat.slug}
                            to={`/products?category=${encodeURIComponent(cat.slug || cat.id)}`}
                            className="ks-mobile-subcat-link"
                            onClick={handleClose}
                          >
                            <span>{cat.name}</span>
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                );
              }

              return (
                <div key={item.path} className="ks-mobile-nav-item-wrap">
                  <Link
                    to={item.path}
                    className={`ks-mobile-drawer-link ${active ? 'is-active' : ''}`}
                    onClick={handleClose}
                  >
                    {active && <span className="ks-mobile-route-red-bar" aria-hidden="true" />}
                    <span className="ks-mobile-drawer-link-text">{item.label}</span>
                    {item.count > 0 && (
                      <span className="ks-mobile-link-badge">{item.count}</span>
                    )}
                  </Link>
                </div>
              );
            })}
          </nav>
        </div>

        {/* Drawer Bottom Auth Section */}
        <div className="ks-mobile-drawer-footer">
          {user ? (
            <div className="ks-mobile-auth-logged-in">
              <div className="ks-mobile-user-info">
                <div className="ks-mobile-user-avatar">
                  {user.full_name?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                <div className="ks-mobile-user-details">
                  <div className="ks-mobile-user-name">{user.full_name || 'My Account'}</div>
                  <div className="ks-mobile-user-email">{user.email}</div>
                </div>
              </div>

              {(user.role === 'admin' || user.role === 'super_admin') && (
                <Link to="/admin" className="ks-mobile-admin-btn" onClick={handleClose}>
                  <span>Access Admin Portal</span>
                </Link>
              )}

              <button
                type="button"
                className="ks-mobile-logout-btn"
                onClick={handleLogout}
              >
                <LogOut size={16} />
                <span>Sign Out</span>
              </button>
            </div>
          ) : (
            <div className="ks-mobile-auth-actions">
              <Link to="/login" className="ks-mobile-btn-signin" onClick={handleClose}>
                <span>SIGN IN</span>
              </Link>
              <Link to="/signup" className="ks-mobile-btn-signup" onClick={handleClose}>
                <span>CREATE ACCOUNT</span>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
