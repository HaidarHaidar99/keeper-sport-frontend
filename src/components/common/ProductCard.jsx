import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, Star, ShoppingBag } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useFavorites } from '../../context/FavoritesContext';
import { useCart } from '../../context/CartContext';
import QuickSizeModal from './QuickSizeModal';

const ProductCard = ({ product }) => {
  const { language, t } = useLanguage();
  const { isFavorite, toggleFavorite } = useFavorites();
  const { addToCart } = useCart();
  const navigate = useNavigate();

  const [quickSizeOpen, setQuickSizeOpen] = useState(false);

  if (!product) return null;

  const isFav = isFavorite(product.id);
  const name = language === 'ar' ? (product.name_ar || product.name_en) : product.name_en;
  
  // High-quality image resolution
  const displayImage = product.primary_image || product.image_url || (product.images && product.images[0]?.image_url);

  // Pricing calculations
  const isOnSale = Boolean(product.is_sale_enabled || product.sale_enabled) && 
    product.sale_price !== null && 
    Number(product.sale_price) < Number(product.base_price);

  const currentPrice = isOnSale ? Number(product.sale_price) : Number(product.base_price);
  const originalPrice = Number(product.base_price);

  const discountPercent = isOnSale && originalPrice > 0
    ? Math.round(((originalPrice - currentPrice) / originalPrice) * 100) 
    : 0;

  const avgRating = Math.max(1, Math.min(5, Number(product.avg_rating || 5.0)));

  const handleQuickAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();

    // If product has size variants, prompt size selector modal
    if (product.variants && product.variants.length > 0) {
      setQuickSizeOpen(true);
    } else {
      addToCart(product, null, 1);
    }
  };

  const handleFavClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite(product);
  };

  // Render 5 stars based on rating
  const renderStars = () => {
    const stars = [];
    const fullStars = Math.floor(avgRating);
    const hasHalf = avgRating - fullStars >= 0.4;

    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) {
        stars.push(
          <Star key={i} size={13} fill="var(--brand-gold)" color="var(--brand-gold)" />
        );
      } else if (i === fullStars + 1 && hasHalf) {
        stars.push(
          <span key={i} style={{ position: 'relative', display: 'inline-flex', width: '13px', height: '13px' }}>
            <Star size={13} color="var(--border-strong)" style={{ position: 'absolute' }} />
            <span style={{ overflow: 'hidden', width: '50%', position: 'absolute' }}>
              <Star size={13} fill="var(--brand-gold)" color="var(--brand-gold)" />
            </span>
          </span>
        );
      } else {
        stars.push(
          <Star key={i} size={13} color="var(--border-strong)" />
        );
      }
    }
    return stars;
  };

  return (
    <>
      <div className="card" style={{
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        position: 'relative',
        height: '100%'
      }}>
        {/* ── Card Image Link ── */}
        <Link 
          to={`/products/${product.id}`} 
          style={{ 
            position: 'relative', 
            width: '100%', 
            paddingTop: '105%', 
            backgroundColor: 'var(--bg-input)', 
            overflow: 'hidden' 
          }}
        >
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
              onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
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
              <ShoppingBag size={38} strokeWidth={1.5} />
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
            {(product.featured || product.is_featured) && (
              <span className="badge badge-gold">
                {t('featured')}
              </span>
            )}
            {product.is_available === false && (
              <span className="badge badge-dark">
                {t('outOfStock')}
              </span>
            )}
          </div>

          {/* Favorite Button */}
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
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'var(--bg-glass)',
              border: '1px solid var(--border-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: isFav ? 'var(--brand-red)' : 'var(--text-secondary)',
              boxShadow: 'var(--shadow-sm)',
              transition: 'all var(--transition-fast)'
            }}
          >
            <Heart size={16} fill={isFav ? 'var(--brand-red)' : 'none'} color={isFav ? 'var(--brand-red)' : 'currentColor'} />
          </button>
        </Link>

        {/* ── Product Info & Actions ── */}
        <div style={{
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          flex: 1,
          justifyContent: 'space-between',
          textAlign: 'start'
        }}>
          <div>
            {/* 5-Star Graphic Rating + Average Numeric Rating (NO Review Count) */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                {renderStars()}
              </div>
              <span style={{ fontSize: '12px', fontWeight: 800, color: 'var(--text-secondary)' }}>
                {avgRating.toFixed(1)}
              </span>
            </div>

            {/* Title */}
            <Link to={`/products/${product.id}`}>
              <h3 style={{
                fontSize: '14px',
                fontWeight: 700,
                lineHeight: 1.4,
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
            marginTop: '14px',
            paddingTop: '12px',
            borderTop: '1px solid var(--border-subtle)'
          }}>
            <div>
              <div style={{ fontSize: '17px', fontWeight: 900, color: 'var(--text-primary)' }}>
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
              style={{
                borderRadius: 'var(--radius-sm)',
                paddingInlineStart: '12px',
                paddingInlineEnd: '12px',
                gap: '4px'
              }}
            >
              <ShoppingBag size={14} />
              <span>+</span>
            </button>
          </div>
        </div>
      </div>

      {/* Quick Size Modal for Sized Products */}
      <QuickSizeModal 
        product={product} 
        isOpen={quickSizeOpen} 
        onClose={() => setQuickSizeOpen(false)} 
      />
    </>
  );
};

export default ProductCard;
