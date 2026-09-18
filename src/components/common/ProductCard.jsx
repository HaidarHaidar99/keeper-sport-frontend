import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Star, ShoppingBag } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useFavorites } from '../../context/FavoritesContext';
import { useCart } from '../../context/CartContext';

const ProductCard = ({ product }) => {
  const { language, t } = useLanguage();
  const { isFavorite, toggleFavorite } = useFavorites();
  const { addToCart } = useCart();

  const isFav = isFavorite(product.id);
  const name = language === 'ar' ? (product.name_ar || product.name_en) : product.name_en;
  
  // Image fallback
  const displayImage = product.primary_image || product.image_url || (product.images && product.images[0]?.image_url);

  // Pricing calculations
  const isOnSale = product.sale_enabled && product.sale_price !== null && Number(product.sale_price) < Number(product.base_price);
  const currentPrice = isOnSale ? Number(product.sale_price) : Number(product.base_price);
  const originalPrice = Number(product.base_price);

  const discountPercent = isOnSale 
    ? Math.round(((originalPrice - currentPrice) / originalPrice) * 100) 
    : 0;

  const handleQuickAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, null, 1);
  };

  const handleFavClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite(product);
  };

  return (
    <div className="glass-card glow-card-cyan" style={{
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      position: 'relative',
      height: '100%'
    }}>
      {/* ── Card Image Container ── */}
      <Link to={`/products/${product.id}`} style={{ position: 'relative', width: '100%', paddingTop: '105%', backgroundColor: 'var(--bg-input)', overflow: 'hidden' }}>
        {displayImage ? (
          <img 
            src={displayImage} 
            alt={name} 
            loading="lazy"
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              transition: 'transform var(--transition-normal)'
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.06)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
          />
        ) : (
          <div style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--text-muted)'
          }}>
            <ShoppingBag size={40} strokeWidth={1.5} />
          </div>
        )}

        {/* Badges Overlay */}
        <div style={{
          position: 'absolute',
          top: '10px',
          insetInlineStart: '10px',
          display: 'flex',
          flexDirection: 'column',
          gap: '6px',
          zIndex: 2
        }}>
          {isOnSale && (
            <span className="badge badge-sale">
              -{discountPercent}%
            </span>
          )}
          {product.featured && (
            <span className="badge badge-gold">
              {t('featured')}
            </span>
          )}
          {product.total_sold > 5 && (
            <span className="badge badge-cyan" style={{ fontSize: '10px' }}>
              🔥 {t('sortBestSeller')}
            </span>
          )}
        </div>

        {/* Favorite Heart Button */}
        <button
          onClick={handleFavClick}
          aria-label="Toggle Wishlist"
          style={{
            position: 'absolute',
            top: '10px',
            insetInlineEnd: '10px',
            zIndex: 2,
            width: '34px',
            height: '34px',
            borderRadius: '50%',
            backgroundColor: 'var(--bg-glass)',
            backdropFilter: 'blur(8px)',
            border: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: isFav ? 'var(--accent-red)' : 'var(--text-secondary)',
            transition: 'all var(--transition-fast)'
          }}
        >
          <Heart size={18} fill={isFav ? 'var(--accent-red)' : 'none'} />
        </button>
      </Link>

      {/* ── Product Info & Actions ── */}
      <div style={{
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
        justifyContent: 'space-between'
      }}>
        <div>
          {/* Rating */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '6px' }}>
            <Star size={13} fill="#FFB800" color="#FFB800" />
            <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)' }}>
              {Number(product.avg_rating || 5.0).toFixed(1)}
            </span>
          </div>

          {/* Title */}
          <Link to={`/products/${product.id}`}>
            <h3 style={{
              fontSize: '15px',
              fontWeight: 700,
              lineHeight: 1.35,
              marginBottom: '8px',
              color: 'var(--text-primary)',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden'
            }}>
              {name}
            </h3>
          </Link>
        </div>

        {/* Pricing & Add to Cart */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginTop: '12px',
          paddingTop: '10px',
          borderTop: '1px solid var(--border-subtle)'
        }}>
          <div>
            <div style={{ fontSize: '18px', fontWeight: 900, color: isOnSale ? 'var(--accent-cyan)' : 'var(--text-primary)' }}>
              ${currentPrice.toFixed(2)}
            </div>
            {isOnSale && (
              <div style={{ fontSize: '12px', textDecoration: 'line-through', color: 'var(--text-muted)' }}>
                ${originalPrice.toFixed(2)}
              </div>
            )}
          </div>

          <button
            onClick={handleQuickAdd}
            className="btn btn-primary btn-sm"
            title={t('addToCart')}
            style={{ borderRadius: 'var(--radius-full)', padding: '7px 12px' }}
          >
            <ShoppingBag size={15} />
            <span>+</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
