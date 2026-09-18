import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ShoppingBag, 
  Heart, 
  User, 
  Sun, 
  Moon, 
  Languages, 
  Search, 
  Menu, 
  X, 
  ShieldCheck,
  Shirt,
  Sparkles
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import { useCart } from '../../context/CartContext';
import { useFavorites } from '../../context/FavoritesContext';
import { useAuth } from '../../context/AuthContext';
import apiClient from '../../services/apiClient';

const Navbar = () => {
  const { t, language, toggleLanguage, isRtl } = useLanguage();
  const { isDark, toggleTheme } = useTheme();
  const { totalCount, openCart } = useCart();
  const { count: favCount } = useFavorites();
  const { customer, isAuthenticated, openAuthModal, logout } = useAuth();
  
  const [announcementText, setAnnouncementText] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  // Fetch admin-controlled announcement text from settings once
  useEffect(() => {
    let isMounted = true;
    apiClient('/content/settings')
      .then((res) => {
        if (isMounted && res?.data?.announcement_text) {
          setAnnouncementText(res.data.announcement_text);
        }
      })
      .catch(() => {
        // Graceful fallback to default
      });
    return () => { isMounted = false; };
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setMobileMenuOpen(false);
    }
  };

  return (
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 100,
      borderBottom: '1px solid var(--border-subtle)',
      backgroundColor: 'var(--bg-glass)',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)'
    }}>
      {/* ── 1. Announcement Bar (Admin-Controlled & Responsive) ── */}
      <div style={{
        backgroundColor: 'var(--bg-surface)',
        borderBottom: '1px solid var(--border-subtle)',
        padding: '6px 16px',
        fontSize: '12px',
        fontWeight: 600,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        color: 'var(--text-secondary)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          <ShieldCheck size={14} color="var(--brand-red)" style={{ flexShrink: 0 }} />
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {announcementText || t('announcementDefault')}
          </span>
        </div>

        {/* Language & Theme Controls */}
        <div style={{ display: 'flex', gap: '14px', alignItems: 'center', flexShrink: 0 }}>
          <button 
            onClick={toggleLanguage}
            title={language === 'en' ? 'التحويل إلى العربية' : 'Switch to English'}
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '4px', 
              color: 'var(--brand-red)', 
              fontWeight: 800,
              fontSize: '12px'
            }}
          >
            <Languages size={13} />
            <span>{language === 'en' ? 'العربية' : 'EN'}</span>
          </button>

          <button 
            onClick={toggleTheme} 
            title={isDark ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
            style={{ display: 'flex', alignItems: 'center', color: 'var(--text-secondary)' }}
          >
            {isDark ? <Sun size={14} /> : <Moon size={14} />}
          </button>
        </div>
      </div>

      {/* ── 2. Main Navbar ── */}
      <div className="container" style={{
        height: 'var(--header-height)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '16px'
      }}>
        {/* Brand Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: 'var(--radius-sm)',
            backgroundColor: 'var(--brand-red)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: 'var(--shadow-red)'
          }}>
            <Shirt size={20} color="#FFFFFF" strokeWidth={2.2} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
              <span style={{
                fontSize: '18px',
                fontWeight: 900,
                letterSpacing: '0.8px',
                color: 'var(--text-primary)'
              }}>
                KEEPER
              </span>
              <span style={{
                fontSize: '18px',
                fontWeight: 900,
                color: 'var(--brand-red)'
              }}>
                SPORTS
              </span>
            </div>
            <span style={{
              fontSize: '10px',
              fontWeight: 700,
              color: 'var(--text-muted)',
              marginTop: '-2px',
              letterSpacing: '0.3px'
            }}>
              {t('tagline')}
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav style={{
          display: 'none',
          alignItems: 'center',
          gap: '24px',
          fontWeight: 700,
          fontSize: '14px'
        }} className="desktop-nav">
          <Link to="/" style={{ color: 'var(--text-primary)', transition: 'color var(--transition-fast)' }}>
            {t('home')}
          </Link>
          <Link to="/products" style={{ color: 'var(--text-secondary)', transition: 'color var(--transition-fast)' }}>
            {t('shop')}
          </Link>
          <Link to="/custom-kit" style={{ 
            color: 'var(--brand-red)', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '5px' 
          }}>
            <Sparkles size={14} />
            <span>{t('customKit')}</span>
          </Link>
          <Link to="/reviews" style={{ color: 'var(--text-secondary)', transition: 'color var(--transition-fast)' }}>
            {t('reviews')}
          </Link>
          <Link to="/about" style={{ color: 'var(--text-secondary)', transition: 'color var(--transition-fast)' }}>
            {t('about')}
          </Link>
          <Link to="/contact" style={{ color: 'var(--text-secondary)', transition: 'color var(--transition-fast)' }}>
            {t('contact')}
          </Link>
        </nav>

        {/* Search Bar (Desktop) */}
        <form 
          onSubmit={handleSearchSubmit} 
          style={{
            display: 'none',
            alignItems: 'center',
            backgroundColor: 'var(--bg-input)',
            border: '1px solid var(--border-medium)',
            borderRadius: 'var(--radius-sm)',
            paddingInlineStart: '12px',
            paddingInlineEnd: '4px',
            height: '38px',
            width: '260px'
          }}
          className="desktop-search"
        >
          <Search size={15} color="var(--text-muted)" style={{ flexShrink: 0 }} />
          <input 
            type="text"
            placeholder={t('searchPlaceholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              background: 'none',
              border: 'none',
              outline: 'none',
              color: 'var(--text-primary)',
              fontSize: '13px',
              paddingInlineStart: '8px',
              width: '100%'
            }}
          />
        </form>

        {/* Right Actions: Account, Favorites, Cart, Hamburger */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Account Button */}
          {isAuthenticated ? (
            <Link 
              to="/my-orders" 
              title={customer?.email || t('account')} 
              style={{
                width: '38px',
                height: '38px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-medium)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--text-primary)',
                backgroundColor: 'var(--bg-input)'
              }}
            >
              <User size={18} color="var(--brand-red)" />
            </Link>
          ) : (
            <button 
              onClick={openAuthModal}
              title={t('login')}
              style={{
                width: '38px',
                height: '38px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-medium)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--text-primary)',
                backgroundColor: 'var(--bg-input)'
              }}
            >
              <User size={18} />
            </button>
          )}

          {/* Favorites Button */}
          <Link 
            to="/favorites"
            title={t('favorites')}
            style={{
              position: 'relative',
              width: '38px',
              height: '38px',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-medium)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-primary)',
              backgroundColor: 'var(--bg-input)'
            }}
          >
            <Heart size={18} />
            {favCount > 0 && (
              <span style={{
                position: 'absolute',
                top: '-5px',
                insetInlineEnd: '-5px',
                backgroundColor: 'var(--brand-red)',
                color: '#fff',
                fontSize: '10px',
                fontWeight: 900,
                width: '18px',
                height: '18px',
                borderRadius: 'var(--radius-full)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: 'var(--shadow-sm)'
              }}>
                {favCount}
              </span>
            )}
          </Link>

          {/* Cart Drawer Trigger */}
          <button 
            onClick={openCart}
            title={t('cart')}
            className="btn btn-primary"
            style={{
              position: 'relative',
              height: '38px',
              paddingInlineStart: '14px',
              paddingInlineEnd: '14px',
              borderRadius: 'var(--radius-sm)',
              gap: '6px'
            }}
          >
            <ShoppingBag size={16} />
            <span style={{ fontWeight: 800, fontSize: '13px' }}>{totalCount}</span>
          </button>

          {/* Mobile Hamburger Toggle */}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="mobile-nav-toggle"
            aria-label="Toggle navigation menu"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '38px',
              height: '38px',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-medium)',
              backgroundColor: 'var(--bg-input)',
              color: 'var(--text-primary)'
            }}
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* ── Mobile Navigation Drawer ── */}
      {mobileMenuOpen && (
        <div 
          style={{
            backgroundColor: 'var(--bg-surface)',
            borderBottom: '1px solid var(--border-medium)',
            padding: '20px',
            boxShadow: 'var(--shadow-lg)',
            animation: 'fadeIn 0.2s ease'
          }}
        >
          {/* Mobile Search */}
          <form onSubmit={handleSearchSubmit} style={{ marginBottom: '16px' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              backgroundColor: 'var(--bg-input)',
              border: '1px solid var(--border-medium)',
              borderRadius: 'var(--radius-sm)',
              paddingInlineStart: '12px',
              height: '42px'
            }}>
              <Search size={16} color="var(--text-muted)" style={{ flexShrink: 0 }} />
              <input 
                type="text"
                placeholder={t('searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  background: 'none',
                  border: 'none',
                  outline: 'none',
                  color: 'var(--text-primary)',
                  fontSize: '14px',
                  paddingInlineStart: '8px',
                  width: '100%'
                }}
              />
            </div>
          </form>

          {/* Mobile Links */}
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '15px', fontWeight: 700 }}>
            <Link 
              to="/" 
              onClick={() => setMobileMenuOpen(false)}
              style={{ color: 'var(--text-primary)', padding: '6px 0' }}
            >
              {t('home')}
            </Link>
            <Link 
              to="/products" 
              onClick={() => setMobileMenuOpen(false)}
              style={{ color: 'var(--text-primary)', padding: '6px 0' }}
            >
              {t('shop')}
            </Link>
            <Link 
              to="/custom-kit" 
              onClick={() => setMobileMenuOpen(false)}
              style={{ color: 'var(--brand-red)', display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 0' }}
            >
              <Sparkles size={16} />
              <span>{t('customKit')}</span>
            </Link>
            <Link 
              to="/reviews" 
              onClick={() => setMobileMenuOpen(false)}
              style={{ color: 'var(--text-primary)', padding: '6px 0' }}
            >
              {t('reviews')}
            </Link>
            <Link 
              to="/about" 
              onClick={() => setMobileMenuOpen(false)}
              style={{ color: 'var(--text-primary)', padding: '6px 0' }}
            >
              {t('about')}
            </Link>
            <Link 
              to="/contact" 
              onClick={() => setMobileMenuOpen(false)}
              style={{ color: 'var(--text-primary)', padding: '6px 0' }}
            >
              {t('contact')}
            </Link>
            <Link 
              to="/my-orders" 
              onClick={() => setMobileMenuOpen(false)}
              style={{ color: 'var(--text-secondary)', padding: '6px 0', borderTop: '1px solid var(--border-subtle)', paddingTop: '12px' }}
            >
              {t('myOrders')}
            </Link>
          </nav>
        </div>
      )}

      {/* Breakpoint CSS for Navbar */}
      <style>{`
        @media (min-width: 900px) {
          .desktop-nav { display: flex !important; }
          .desktop-search { display: flex !important; }
          .mobile-nav-toggle { display: none !important; }
        }
      `}</style>
    </header>
  );
};

export default Navbar;
