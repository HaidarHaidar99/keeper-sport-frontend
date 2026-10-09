import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Star, Plus, Check, AlertCircle } from 'lucide-react';
import { productApi } from '../api/productApi';
import { launchFootballToCart, launchHeartToFavorites } from '../utils/cartAnimation';

export default function ProductCard({
  product = {},
  onCartUpdated,
  onFavoriteToggled
}) {
  const navigate = useNavigate();
  const heartBtnRef = useRef(null);
  const plusBtnRef = useRef(null);

  // Optimistic favorite state
  const [isFavorited, setIsFavorited] = useState(Boolean(product?.isFavorited));
  const [favAnimating, setFavAnimating] = useState(false);
  const [favLoading, setFavLoading] = useState(false);

  // Cart action state
  const [cartLoading, setCartLoading] = useState(false);
  const [cartSuccess, setCartSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  useEffect(() => {
    setIsFavorited(Boolean(product?.isFavorited));
  }, [product?.isFavorited]);

  const productUrl = `/products/${product?.slug || product?.id || ''}`;

  // Real stock/sale status
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
  if (product.is_new_arrival) {
    realBadges.push({ type: 'new', label: 'NEW ARRIVAL' });
  }

  const handleCardClick = (e) => {
    if (e.target.closest('button') || e.target.closest('a')) {
      return;
    }
    navigate(productUrl);
  };

  // Favorite toggle: Optimistic update + Flying Heart to Navbar/Mobile Menu
  const handleFavoriteClick = async (e) => {
    e.stopPropagation();
    e.preventDefault();

    if (favLoading) return;

    const previousState = isFavorited;
    const nextState = !previousState;

    setIsFavorited(nextState);
    setFavAnimating(true);

    // Launch flying heart to favorite icon in top bar (or mobile nav)
    if (nextState && heartBtnRef.current) {
      launchHeartToFavorites(heartBtnRef.current);
    }

    setTimeout(() => setFavAnimating(false), 400);

    if (onFavoriteToggled) {
      onFavoriteToggled(product.id, nextState);
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
        setIsFavorited(previousState);
        if (onFavoriteToggled) onFavoriteToggled(product.id, previousState);
        setErrorMessage(res?.message || 'Could not update favorites.');
        setTimeout(() => setErrorMessage(null), 3000);
      }
    } catch {
      setIsFavorited(previousState);
      if (onFavoriteToggled) onFavoriteToggled(product.id, previousState);
      setErrorMessage('Network error updating favorites.');
      setTimeout(() => setErrorMessage(null), 3000);
    } finally {
      setFavLoading(false);
    }
  };

  // Add to Cart with flying football animation
  const handleAddToCart = async (e) => {
    e.stopPropagation();
    e.preventDefault();

    if (isOutOfStock || cartLoading) return;

    if (plusBtnRef.current) {
      launchFootballToCart(plusBtnRef.current);
    }

    setCartLoading(true);
    setErrorMessage(null);
    setCartSuccess(true);

    try {
      const res = await productApi.addToCart({
        productId: product.id,
        quantity: 1
      });

      if (res && res.success) {
        if (onCartUpdated) {
          onCartUpdated(res.cartCount);
        }
        setTimeout(() => setCartSuccess(false), 1800);
      } else {
        setCartSuccess(false);
        setErrorMessage(res?.message || 'Failed to add to cart.');
        setTimeout(() => setErrorMessage(null), 3500);
      }
    } catch {
      setCartSuccess(false);
      setErrorMessage('Network error adding to cart.');
      setTimeout(() => setErrorMessage(null), 3500);
    } finally {
      setCartLoading(false);
    }
  };

  const handleBuyNow = (e) => {
    e.stopPropagation();
    e.preventDefault();

    if (isOutOfStock) return;
    navigate(`/checkout?direct=true&productId=${encodeURIComponent(product.id)}&qty=1`);
  };

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

  const ratingAverage = product.rating?.average || product.avg_rating || null;
  const ratingCount = product.rating?.count ?? product.reviews_count ?? null;
  const hasRealRating = Boolean(ratingCount && ratingCount > 0 && ratingAverage);

  const primaryImgSrc = product.primaryImage || product.image_url || product.images?.[0] || null;

  return (
    <article
      className={`ks-product-card ${isOutOfStock ? 'is-out-of-stock' : ''}`}
      onClick={handleCardClick}
      data-product-id={product.id}
      style={{ padding: 0, overflow: 'hidden', borderRadius: '24px' }}
    >
      {/* Product Image Area: covers full upper area without spaces */}
      <div
        className="ks-card-media-wrap ks-card-media-fullbleed"
        style={{ width: '100%', margin: 0, padding: 0, aspectRatio: '1 / 1', overflow: 'hidden', borderTopLeftRadius: '24px', borderTopRightRadius: '24px', position: 'relative' }}
      >
        <a
          href={productUrl}
          onClick={(e) => {
            e.preventDefault();
            navigate(productUrl);
          }}
          className="ks-card-img-link"
          aria-label={`View details for ${product.name}`}
          style={{ display: 'block', width: '100%', height: '100%', margin: 0, padding: 0 }}
        >
          {primaryImgSrc ? (
            <img
              src={primaryImgSrc}
              alt={product.name || 'Keeper Sports Product'}
              className="ks-card-img"
              loading="lazy"
              decoding="async"
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', margin: 0, padding: 0 }}
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                const fb = e.currentTarget.parentElement?.querySelector('.ks-card-img-fallback');
                if (fb) fb.style.display = 'flex';
              }}
            />
          ) : null}

          <div
            className="ks-card-img-fallback"
            style={{ display: primaryImgSrc ? 'none' : 'flex' }}
            aria-hidden="true"
          >
            <div className="ks-card-fallback-badge">
              <span className="ks-card-fallback-brand">KEEPER SPORTS</span>
            </div>
          </div>
        </a>

        {/* Top-Right: Low Stock / Sale Status Badges */}
        {realBadges.length > 0 && (
          <div className="ks-card-top-right-badges">
            <span className={`ks-badge ks-badge-${realBadges[0].type}`}>
              {realBadges[0].label}
            </span>
          </div>
        )}

        {/* Favorite Heart Button: Top Left (Background stays dark, only heart icon is red) */}
        <button
          ref={heartBtnRef}
          type="button"
          onClick={handleFavoriteClick}
          className={`ks-card-fav-btn ks-card-fav-left ${isFavorited ? 'is-active' : ''} ${favAnimating ? 'is-animating' : ''}`}
          aria-label={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
          title={isFavorited ? 'Favorited' : 'Add to Favorites'}
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.65)', border: '1px solid rgba(255, 255, 255, 0.25)', borderRadius: '50%' }}
        >
          <Heart
            size={18}
            className={`ks-fav-icon ${isFavorited ? 'ks-fav-icon-active' : ''}`}
            fill={isFavorited ? '#E10600' : 'none'}
            stroke={isFavorited ? '#E10600' : 'currentColor'}
            strokeWidth={2}
          />
        </button>
      </div>

      {/* Product Content Below Image (No description, clean price, no official gear text) */}
      <div className="ks-card-body">
        {/* Rating row at top of content only if real rating exists */}
        {hasRealRating && (
          <div className="ks-card-top-info-row">
            <div className="ks-card-rating">
              <Star size={12} fill="#E10600" stroke="#E10600" />
              <span>{Number(ratingAverage).toFixed(1)}</span>
              <span>({ratingCount})</span>
            </div>
          </div>
        )}

        {/* Product Name */}
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

        {/* Pricing Row: Real Price + Original Price */}
        <div className="ks-card-pricing-row">
          <span className="ks-card-price-main">
            ${currentPrice.toFixed(2)}
          </span>
          {hasDiscount && originalPrice && originalPrice > currentPrice && (
            <span className="ks-card-price-original">
              ${originalPrice.toFixed(2)}
            </span>
          )}
        </div>

        {/* Inline Error Notice */}
        {errorMessage && (
          <div className="ks-card-inline-error" role="alert">
            <AlertCircle size={12} />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Bottom Actions Row: BUY NOW Button + Smaller '+' Button */}
        <div className="ks-card-actions-row">
          <button
            type="button"
            onClick={handleBuyNow}
            disabled={isOutOfStock}
            className="ks-card-btn-buy"
            aria-label={`Buy ${product.name} now`}
            title="Buy Now"
          >
            <span>BUY NOW</span>
          </button>

          <button
            ref={plusBtnRef}
            type="button"
            onClick={handleAddToCart}
            disabled={isOutOfStock || cartLoading}
            className={`ks-card-btn-plus ${cartSuccess ? 'is-success' : ''}`}
            aria-label={`Add ${product.name} to cart`}
            title="Add to Cart"
          >
            {cartSuccess ? (
              <Check size={18} strokeWidth={3} />
            ) : (
              <Plus size={20} strokeWidth={2.5} />
            )}
          </button>
        </div>
      </div>
    </article>
  );
}
