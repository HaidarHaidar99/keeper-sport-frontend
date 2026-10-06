import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Plus, Star, Check, AlertCircle, ShoppingCart } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { productApi } from '../api/productApi';
import { launchFootballToCart } from '../utils/cartAnimation';
import { launchHeartToFavorites } from '../utils/favoriteAnimation';

export default function ProductCard({
  product = {},
  onCartUpdated,
  onFavoriteToggled
}) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const heartBtnRef = useRef(null);

  // Optimistic favorite state
  const [isFavorited, setIsFavorited] = useState(Boolean(product?.isFavorited));
  const [favAnimating, setFavAnimating] = useState(false);
  const [favLoading, setFavLoading] = useState(false);

  // Cart action state
  const [cartLoading, setCartLoading] = useState(false);
  const [cartSuccess, setCartSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  // Active badge index for controlled single badge slot
  const [activeBadgeIndex, setActiveBadgeIndex] = useState(0);

  // Keep favorite state synced if prop changes
  useEffect(() => {
    setIsFavorited(Boolean(product?.isFavorited));
  }, [product?.isFavorited]);

  const productUrl = `/products/${product?.slug || product?.id || ''}`;
  const categoryName = product.category?.name || product.category_name || null;

  // Real status badges computation from genuine DB fields only
  const isOutOfStock = Boolean(product.stock?.isOutOfStock || product.stock_quantity === 0);
  const isLowStock = Boolean(
    (product.stock?.isLowStock || (product.stock_quantity > 0 && product.stock_quantity <= 5)) &&
    !isOutOfStock
  );
  const hasDiscount = Boolean(
    product.pricing?.hasDiscount ||
    (product.old_price && Number(product.old_price) > Number(product.base_price || product.price))
  );

  const realBadges = [];
  if (isOutOfStock) {
    realBadges.push({ type: 'out-of-stock', label: 'OUT OF STOCK' });
  } else if (isLowStock) {
    realBadges.push({ type: 'low-stock', label: 'LOW STOCK' });
  }
  if (hasDiscount) {
    realBadges.push({
      type: 'sale',
      label: product.pricing?.discountLabel || 'SALE'
    });
  }
  if (product.is_featured) {
    realBadges.push({ type: 'featured', label: 'FEATURED' });
  }
  if (product.is_best_seller) {
    realBadges.push({ type: 'bestseller', label: 'BEST SELLER' });
  }
  if (product.is_new_arrival) {
    realBadges.push({ type: 'new', label: 'NEW' });
  }

  // Smooth rotation for multiple badges in single controlled area
  useEffect(() => {
    if (realBadges.length <= 1) return;
    const interval = setInterval(() => {
      setActiveBadgeIndex((prev) => (prev + 1) % realBadges.length);
    }, 3800);
    return () => clearInterval(interval);
  }, [realBadges.length]);

  // Navigate to product details
  const handleCardClick = (e) => {
    if (e.target.closest('button') || e.target.closest('a')) {
      return;
    }
    navigate(productUrl);
  };

  // Immediate optimistic Favorite toggle
  const handleFavoriteClick = async (e) => {
    e.stopPropagation();
    e.preventDefault();

    if (!user) {
      navigate(`/login?redirect=${encodeURIComponent(window.location.pathname)}`);
      return;
    }

    if (favLoading) return;

    const previousState = isFavorited;
    const nextState = !previousState;

    // 1. Immediate optimistic UI feedback
    setIsFavorited(nextState);
    setFavAnimating(true);
    setTimeout(() => setFavAnimating(false), 400);

    // 2. If favorited, launch fast micro-animation toward navbar heart
    if (nextState && heartBtnRef.current) {
      launchHeartToFavorites(heartBtnRef.current);
    }

    setFavLoading(true);

    try {
      const res = await productApi.toggleFavorite(product.id);
      if (res && res.success) {
        setIsFavorited(res.isFavorited);
        if (onFavoriteToggled) {
          onFavoriteToggled(product.id, res.isFavorited, res.favoritesCount);
        }
      } else {
        // Revert on failure
        setIsFavorited(previousState);
        setErrorMessage(res.message || 'Could not update favorites.');
        setTimeout(() => setErrorMessage(null), 3000);
      }
    } catch {
      // Revert on network error
      setIsFavorited(previousState);
      setErrorMessage('Network error updating favorites.');
      setTimeout(() => setErrorMessage(null), 3000);
    } finally {
      setFavLoading(false);
    }
  };

  // Add to Cart
  const handleAddToCart = async (e) => {
    e.stopPropagation();
    e.preventDefault();

    if (isOutOfStock) return;
    if (cartLoading) return;

    setCartLoading(true);
    setErrorMessage(null);
    const buttonEl = e.currentTarget;

    try {
      const res = await productApi.addToCart({
        productId: product.id,
        quantity: 1
      });

      if (res && res.success) {
        setCartSuccess(true);
        setTimeout(() => setCartSuccess(false), 2000);

        // Micro-animation: Football travels from button to Cart icon in Navbar
        launchFootballToCart(buttonEl, () => {
          if (onCartUpdated) {
            onCartUpdated(res.cartCount);
          }
        });
      } else {
        setErrorMessage(res.message || 'Failed to add to cart.');
        setTimeout(() => setErrorMessage(null), 3500);
      }
    } catch {
      setErrorMessage('Network error adding to cart.');
      setTimeout(() => setErrorMessage(null), 3500);
    } finally {
      setCartLoading(false);
    }
  };

  // Order Now (Direct Checkout Flow)
  const handleOrderNow = (e) => {
    e.stopPropagation();
    e.preventDefault();

    if (isOutOfStock) return;
    navigate(`/checkout?direct=true&productId=${encodeURIComponent(product.id)}&qty=1`);
  };

  // Pricing calculations
  const currentPrice =
    typeof product.pricing?.currentPrice === 'number'
      ? product.pricing.currentPrice
      : Number(product.base_price || product.price || 0);

  const originalPrice =
    typeof product.pricing?.originalPrice === 'number'
      ? product.pricing.originalPrice
      : product.old_price
      ? Number(product.old_price)
      : null;

  // Real Reviews / Ratings only
  const ratingAverage = product.rating?.average || product.avg_rating || null;
  const ratingCount = product.rating?.count ?? product.reviews_count ?? null;
  const hasRealRating = Boolean(ratingCount && ratingCount > 0 && ratingAverage);

  const primaryImgSrc = product.primaryImage || product.image_url || product.images?.[0] || null;

  return (
    <article
      className={`ks-product-card ${isOutOfStock ? 'is-out-of-stock' : ''}`}
      onClick={handleCardClick}
      data-product-id={product.id}
    >
      {/* Top Header Area: Real Category on Left, Favorite Heart on Right */}
      <div className="ks-card-top-bar">
        <div className="ks-card-category-wrap">
          {categoryName ? (
            <span className="ks-card-category-label">{categoryName}</span>
          ) : (
            <span className="ks-card-category-placeholder" aria-hidden="true" />
          )}
        </div>

        <button
          ref={heartBtnRef}
          type="button"
          onClick={handleFavoriteClick}
          className={`ks-card-fav-btn ${isFavorited ? 'is-active' : ''} ${favAnimating ? 'is-animating' : ''}`}
          aria-label={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
          title={isFavorited ? 'Favorited' : 'Add to Favorites'}
        >
          <Heart
            size={18}
            className={`ks-fav-icon ${isFavorited ? 'ks-fav-icon-active' : ''}`}
            fill={isFavorited ? '#E10600' : 'none'}
            stroke={isFavorited ? '#E10600' : 'currentColor'}
            strokeWidth={1.8}
          />
        </button>
      </div>

      {/* Large Dominant Product Image */}
      <div className="ks-card-media-wrap">
        <a
          href={productUrl}
          onClick={(e) => {
            e.preventDefault();
            navigate(productUrl);
          }}
          className="ks-card-img-link"
          aria-label={`View details for ${product.name}`}
        >
          {primaryImgSrc ? (
            <img
              src={primaryImgSrc}
              alt={product.name || 'Keeper Sports Product'}
              className="ks-card-img"
              loading="lazy"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                const fb = e.currentTarget.parentElement?.querySelector('.ks-card-img-fallback');
                if (fb) fb.style.display = 'flex';
              }}
            />
          ) : null}

          {/* Clean Neutral Fallback when no image is uploaded */}
          <div
            className="ks-card-img-fallback"
            style={{ display: primaryImgSrc ? 'none' : 'flex' }}
            aria-hidden="true"
          >
            <div className="ks-card-fallback-badge">
              <span className="ks-card-fallback-brand">KEEPER SPORTS</span>
              <span className="ks-card-fallback-sub">AUTHENTIC GEAR</span>
            </div>
          </div>
        </a>

        {/* Single Controlled Status Badge Area (No stacking, smooth rotation) */}
        {realBadges.length > 0 && (
          <div className="ks-card-badge-container">
            <span
              key={activeBadgeIndex}
              className={`ks-badge ks-badge-${realBadges[activeBadgeIndex]?.type || 'default'} ks-badge-animate`}
            >
              {realBadges[activeBadgeIndex]?.label}
            </span>
          </div>
        )}
      </div>

      {/* Product Content */}
      <div className="ks-card-body">
        {/* Title */}
        <h3 className="ks-card-title">
          <a
            href={productUrl}
            onClick={(e) => {
              e.preventDefault();
              navigate(productUrl);
            }}
            className="ks-card-title-link"
            title={product.name}
          >
            {product.name}
          </a>
        </h3>

        {/* Pricing */}
        <div className="ks-card-pricing-row">
          <span className="ks-card-price-current">
            ${currentPrice.toFixed(2)}
          </span>
          {hasDiscount && originalPrice && originalPrice > currentPrice ? (
            <span className="ks-card-price-original">
              ${originalPrice.toFixed(2)}
            </span>
          ) : null}
        </div>

        {/* Short Description */}
        {product.description ? (
          <p className="ks-card-description">{product.description}</p>
        ) : (
          <p className="ks-card-description-placeholder" aria-hidden="true" />
        )}

        {/* Rating row: Real stars & count, clean zero-review state */}
        <div className="ks-card-rating-row">
          {hasRealRating ? (
            <div className="ks-card-rating">
              <Star size={13} className="ks-star-icon" fill="#E10600" stroke="#E10600" />
              <span className="ks-rating-val">{Number(ratingAverage).toFixed(1)}</span>
              <span className="ks-rating-cnt">({ratingCount})</span>
            </div>
          ) : (
            <div className="ks-card-rating ks-rating-empty">
              <Star size={13} className="ks-star-icon-empty" stroke="currentColor" fill="none" />
              <span className="ks-rating-empty-label">No reviews yet</span>
            </div>
          )}
        </div>

        {/* Inline Error Notice */}
        {errorMessage && (
          <div className="ks-card-inline-error" role="alert">
            <AlertCircle size={12} />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Bottom Two Actions: Add to Cart and Order Now */}
        <div className="ks-card-actions-grid">
          <button
            type="button"
            onClick={handleAddToCart}
            disabled={isOutOfStock || cartLoading}
            className={`ks-card-btn-cart ${cartSuccess ? 'is-success' : ''}`}
            aria-label={`Add ${product.name} to cart`}
            title="Add to Cart"
          >
            {cartSuccess ? (
              <>
                <Check size={14} strokeWidth={2.5} />
                <span className="ks-btn-label">ADDED</span>
              </>
            ) : (
              <>
                <Plus size={14} strokeWidth={2.5} />
                <span className="ks-btn-label">ADD TO CART</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleOrderNow}
            disabled={isOutOfStock}
            className="ks-card-btn-order"
            aria-label={`Order ${product.name} now`}
            title="Order Now"
          >
            ORDER NOW
          </button>
        </div>
      </div>
    </article>
  );
}
