import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
  X,
  ChevronDown,
  ChevronRight,
  Sun,
  Moon,
  Home,
  ShoppingBag,
  Grid,
  Heart,
  ShoppingCart,
  Package,
  Star,
  Info,
  Mail,
  User,
  LogOut,
  LogIn
} from 'lucide-react';

export default function HamburgerMenu({ isOpen, onClose, categories = [], counts = {} }) {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const [categoriesOpen, setCategoriesOpen] = useState(false);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Lock body scroll when drawer is open
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
    onClose();
    navigate('/login');
  };

  if (!isOpen) return null;

  return (
    <div className="ks-drawer-root" role="dialog" aria-modal="true" aria-label="Navigation Menu">
      {/* Backdrop */}
      <div className="ks-drawer-backdrop" onClick={onClose} />

      {/* Drawer Container */}
      <div className="ks-drawer-panel">
        {/* Header */}
        <div className="ks-drawer-header">
          <div className="ks-drawer-brand">
            KEEPER SPORTS
          </div>
          <button
            type="button"
            className="ks-drawer-close-btn"
            onClick={onClose}
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>

        {/* User Info Bar if Authenticated */}
        {user && (
          <div className="ks-drawer-user-info">
            <div className="ks-drawer-user-avatar">
              <User size={16} />
            </div>
            <div className="ks-drawer-user-details">
              <div className="ks-drawer-user-name">{user.full_name || 'Customer'}</div>
              <div className="ks-drawer-user-email">{user.email}</div>
            </div>
          </div>
        )}

        {/* Scrollable Navigation Links */}
        <div className="ks-drawer-nav">
          {/* Home */}
          <Link to="/" className="ks-drawer-link" onClick={onClose}>
            <Home size={17} className="ks-drawer-icon" />
            <span>Home</span>
          </Link>

          {/* Products */}
          <Link to="/products" className="ks-drawer-link" onClick={onClose}>
            <ShoppingBag size={17} className="ks-drawer-icon" />
            <span>Products</span>
          </Link>

          {/* Categories with Clickable Word + Chevron Submenu Toggle */}
          <div className="ks-drawer-category-group">
            <div className="ks-drawer-category-row">
              <Link to="/categories" className="ks-drawer-link-inner" onClick={onClose}>
                <Grid size={17} className="ks-drawer-icon" />
                <span>Categories</span>
              </Link>
              <button
                type="button"
                className="ks-drawer-chevron-btn"
                onClick={() => setCategoriesOpen(!categoriesOpen)}
                aria-label={categoriesOpen ? 'Collapse categories' : 'Expand categories'}
                aria-expanded={categoriesOpen}
              >
                {categoriesOpen ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
              </button>
            </div>

            {/* Submenu */}
            {categoriesOpen && (
              <div className="ks-drawer-submenu">
                {categories && categories.length > 0 ? (
                  categories.map((cat) => (
                    <Link
                      key={cat.id || cat.slug}
                      to={`/categories/${cat.slug || cat.id}`}
                      className="ks-drawer-sublink"
                      onClick={onClose}
                    >
                      {cat.name}
                    </Link>
                  ))
                ) : (
                  <div className="ks-drawer-empty-note">
                    No categories available
                  </div>
                )}
              </div>
            )}
          </div>

          {/* My Orders */}
          <Link to="/orders" className="ks-drawer-link" onClick={onClose}>
            <Package size={17} className="ks-drawer-icon" />
            <span>My Orders</span>
            {counts.orders > 0 && (
              <span className="ks-drawer-badge">{counts.orders}</span>
            )}
          </Link>

          {/* Cart */}
          <Link to="/cart" className="ks-drawer-link" onClick={onClose}>
            <ShoppingCart size={17} className="ks-drawer-icon" />
            <span>Cart</span>
            {counts.cart > 0 && (
              <span className="ks-drawer-badge">{counts.cart}</span>
            )}
          </Link>

          {/* Favorites */}
          <Link to="/favorites" className="ks-drawer-link" onClick={onClose}>
            <Heart size={17} className="ks-drawer-icon" />
            <span>Favorites</span>
            {counts.favorites > 0 && (
              <span className="ks-drawer-badge">{counts.favorites}</span>
            )}
          </Link>

          {/* Reviews */}
          <Link to="/reviews" className="ks-drawer-link" onClick={onClose}>
            <Star size={17} className="ks-drawer-icon" />
            <span>Reviews</span>
          </Link>

          {/* About Us */}
          <Link to="/about" className="ks-drawer-link" onClick={onClose}>
            <Info size={17} className="ks-drawer-icon" />
            <span>About Us</span>
          </Link>

          {/* Contact Us */}
          <Link to="/contact" className="ks-drawer-link" onClick={onClose}>
            <Mail size={17} className="ks-drawer-icon" />
            <span>Contact Us</span>
          </Link>
        </div>

        {/* Drawer Footer Actions */}
        <div className="ks-drawer-footer">
          {/* Theme Toggle */}
          <button
            type="button"
            className="ks-drawer-theme-btn"
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
              <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
            </div>
            <span style={{ fontSize: '0.75rem', opacity: 0.7, textTransform: 'uppercase' }}>
              {theme}
            </span>
          </button>

          {/* Auth Button */}
          {user ? (
            <button
              type="button"
              className="ks-drawer-auth-btn"
              onClick={handleLogout}
            >
              <LogOut size={16} />
              <span>LOGOUT</span>
            </button>
          ) : (
            <Link
              to="/login"
              className="ks-drawer-auth-btn"
              onClick={onClose}
              style={{ textDecoration: 'none' }}
            >
              <LogIn size={16} />
              <span>SIGN IN</span>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
