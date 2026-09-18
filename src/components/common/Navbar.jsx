import React, { useState } from 'react';
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
  Shirt
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import { useCart } from '../../context/CartContext';
import { useFavorites } from '../../context/FavoritesContext';
import { useAuth } from '../../context/AuthContext';

const Navbar = () => {
  const { t, language, toggleLanguage, isRtl } = useLanguage();
  const { isDark, toggleTheme } = useTheme();
  const { totalCount, openCart } = useCart();
  const { count: favCount } = useFavorites();
  const { customer, isAuthenticated, openAuthModal, logout } = useAuth();
  
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

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
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)'
    }}>
      {/* ── Top Promo Bar ── */}
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <ShieldCheck size={14} color="var(--accent-cyan)" />
          <span>{isRtl ? "أطقم أصلية 100% | استبدال المقاس متاح" : "100% Authentic Kits | Size Exchanges Guaranteed"}</span>
        </div>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <button 
            onClick={toggleLanguage}
            style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--accent-cyan)', fontWeight: 700 }}
          >
            <Languages size={14} />
            <span>{language === 'en' ? 'العربية' : 'English'}</span>
          </button>
          <button onClick={toggleTheme} style={{ display: 'flex', alignItems: 'center', color: 'var(--text-secondary)' }}>
            {isDark ? <Sun size={14} /> : <Moon size={14} />}
          </button>
        </div>
      </div>

      {/* ── Main Navigation Bar ── */}
      <div className="container" style={{
        height: 'var(--header-height)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '20px'
      }}>
        {/* Brand Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, var(--accent-cyan) 0%, #0077B6 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 16px var(--accent-cyan-glow)'
          }}>
            <Shirt size={22} color="#040914" />
          </div>
          <div>
            <span style={{
              fontSize: '19px',
              fontWeight: 900,
              letterSpacing: '1px',
              background: 'linear-gradient(90deg, #FFFFFF 0%, var(--accent-cyan) 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              KEEPER
            </span>
            <span style={{
              fontSize: '19px',
              fontWeight: 900,
              color: 'var(--accent-gold)',
              marginInlineStart: '4px'
            }}>
              SPORTS
            </span>
          </div>
        </Link>

        {/* Desktop Links */}
        <nav style={{
          display: 'none',
          alignItems: 'center',
          gap: '24px',
          fontWeight: 600,
          fontSize: '14px'
        }} className="desktop-nav">
          <Link to="/" style={{ color: 'var(--text-primary)', transition: 'color var(--transition-fast)' }}>{t('home')}</Link>
          <Link to="/products" style={{ color: 'var(--text-secondary)' }}>{t('shop')}</Link>
          <Link to="/custom-kit" style={{ 
            color: 'var(--accent-cyan)', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '4px' 
          }}>
            <Shirt size={16} />
            <span>{t('customKit')}</span>
          </Link>
          <Link to="/reviews" style={{ color: 'var(--text-secondary)' }}>{t('reviews')}</Link>
          <Link to="/about" style={{ color: 'var(--text-secondary)' }}>{t('about')}</Link>
          <Link to="/contact" style={{ color: 'var(--text-secondary)' }}>{t('contact')}</Link>
        </nav>

        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} style={{
          flex: '1',
          maxWidth: '320px',
          position: 'relative',
          display: 'none'
        }} className="desktop-search">
          <input
            type="text"
            placeholder={t('searchPlaceholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '8px 14px',
              paddingInlineStart: '36px',
              background: 'var(--bg-card)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-full)',
              color: 'var(--text-primary)',
              fontSize: '13px'
            }}
          />
          <Search 
            size={16} 
            style={{
              position: 'absolute',
              top: '50%',
              transform: 'translateY(-50%)',
              insetInlineStart: '12px',
              color: 'var(--text-muted)'
            }} 
          />
        </form>

        {/* Action Icons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* Favorites */}
          <Link to="/favorites" className="btn btn-ghost btn-icon" title={t('favorites')} style={{ position: 'relative' }}>
            <Heart size={20} />
            {favCount > 0 && (
              <span style={{
                position: 'absolute',
                top: '4px',
                right: '4px',
                backgroundColor: 'var(--accent-red)',
                color: '#fff',
                fontSize: '10px',
                fontWeight: 800,
                width: '18px',
                height: '18px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {favCount}
              </span>
            )}
          </Link>

          {/* Cart Trigger */}
          <button onClick={openCart} className="btn btn-ghost btn-icon" title={t('cart')} style={{ position: 'relative' }}>
            <ShoppingBag size={20} />
            {totalCount > 0 && (
              <span style={{
                position: 'absolute',
                top: '4px',
                right: '4px',
                backgroundColor: 'var(--accent-cyan)',
                color: '#040914',
                fontSize: '10px',
                fontWeight: 800,
                width: '18px',
                height: '18px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 10px var(--accent-cyan-glow)'
              }}>
                {totalCount}
              </span>
            )}
          </button>

          {/* User Profile / Auth */}
          {isAuthenticated ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Link to="/my-orders" className="btn btn-outline btn-sm" style={{ gap: '6px' }}>
                <User size={15} />
                <span>{customer?.email?.split('@')[0]}</span>
              </Link>
              <button onClick={logout} className="btn btn-ghost btn-sm" title={t('logout')}>
                {t('logout')}
              </button>
            </div>
          ) : (
            <button onClick={() => openAuthModal('login')} className="btn btn-primary btn-sm">
              <User size={15} />
              <span>{t('login')}</span>
            </button>
          )}

          {/* Mobile Hamburger */}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="btn btn-ghost btn-icon"
            style={{ display: 'flex' }}
            id="mobile-nav-toggle"
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* ── Mobile Dropdown Menu ── */}
      {mobileMenuOpen && (
        <div style={{
          backgroundColor: 'var(--bg-surface)',
          borderBottom: '1px solid var(--border-subtle)',
          padding: '16px 20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px'
        }}>
          <form onSubmit={handleSearchSubmit} style={{ position: 'relative', width: '100%' }}>
            <input
              type="text"
              placeholder={t('searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 14px',
                paddingInlineStart: '36px',
                background: 'var(--bg-input)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--text-primary)'
              }}
            />
            <Search size={16} style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', insetInlineStart: '12px', color: 'var(--text-muted)' }} />
          </form>

          <Link to="/" onClick={() => setMobileMenuOpen(false)} style={{ padding: '8px 0', fontWeight: 600 }}>{t('home')}</Link>
          <Link to="/products" onClick={() => setMobileMenuOpen(false)} style={{ padding: '8px 0', fontWeight: 600 }}>{t('shop')}</Link>
          <Link to="/custom-kit" onClick={() => setMobileMenuOpen(false)} style={{ padding: '8px 0', fontWeight: 600, color: 'var(--accent-cyan)' }}>{t('customKit')}</Link>
          <Link to="/my-orders" onClick={() => setMobileMenuOpen(false)} style={{ padding: '8px 0', fontWeight: 600 }}>{t('myOrders')}</Link>
          <Link to="/reviews" onClick={() => setMobileMenuOpen(false)} style={{ padding: '8px 0', fontWeight: 600 }}>{t('reviews')}</Link>
          <Link to="/about" onClick={() => setMobileMenuOpen(false)} style={{ padding: '8px 0', fontWeight: 600 }}>{t('about')}</Link>
          <Link to="/contact" onClick={() => setMobileMenuOpen(false)} style={{ padding: '8px 0', fontWeight: 600 }}>{t('contact')}</Link>
        </div>
      )}

      <style>{`
        @media (min-width: 900px) {
          .desktop-nav { display: flex !important; }
          .desktop-search { display: block !important; }
          #mobile-nav-toggle { display: none !important; }
        }
      `}</style>
    </header>
  );
};

export default Navbar;
