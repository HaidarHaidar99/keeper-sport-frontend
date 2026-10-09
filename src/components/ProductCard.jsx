import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Star, Plus, Check, AlertCircle } from 'lucide-react';
import { productApi } from '../api/productApi';
import { launchFootballToCart } from '../utils/cartAnimation';

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

  // Keep favorite state in sync if prop changes
  useEffect(() => {
    setIsFavorited(Boolean(product?.isFavorited));
  }, [product?.isFavorited]);

  const productUrl = `/products/${product?.slug || product?.id || ''}`;
  const categoryName = product.category?.name || product.category_name || null;

  // Real status tags from genuine database fields only
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

  // Card click navigates to details unless clicking a button or link
  const handleCardClick = (e) => {
    if (e.target.closest('button') || e.target.closest('a')) {
      return;
    }
    navigate(productUrl);
  };

  // Immediate optimistic Favorite toggle with pulse animation & rollback
  const handleFavoriteClick = async (e) => {
    e.stopPropagation();
    e.preventDefault();

    if (favLoading) return;

    const previousState = isFavorited;
    const nextState = !previousState;

    setIsFavorited(nextState);
    setFavAnimating(true);
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

  // Add to Cart via '+' button with flying football flight animation
  const handleAddToCart = async (e) => {
    e.stopPropagation();
    e.preventDefault();

    if (isOutOfStock || cartLoading) return;

    // Trigger soccer ball flying animation to the Navbar cart
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

  // Buy Now: Takes shopper directly into the purchase flow preserving guest checkout
  const handleBuyNow = (e) => {
    e.stopPropagation();
    e.preventDefault();

    if (isOutOfStock) return;
    navigate(`/checkout?direct=true&productId=${encodeURIComponent(product.id)}&qty=1`);
  };

  // Pricing
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

  // Real ratings only
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
      {/* Product Image Area with 20px/24px rounded corners */}
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

          {/* Clean Brand Fallback */}
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

        {/* Top-Left: Category Name Badge */}
        <div className="ks-card-top-left-badges">
          {categoryName && (
            <span className="ks-card-category-tag">{categoryName}</span>
          )}
          {realBadges.length > 0 && (
            <span className={`ks-badge ks-badge-${realBadges[0].type}`}>
              {realBadges[0].label}
            </span>
          )}
        </div>

        {/* Top-Right: Circular Favorite Heart Button with Pulse Animation */}
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
            strokeWidth={2}
          />
        </button>
      </div>

      {/* Product Content Below Image (No description, clean price, rating top-right) */}
      <div className="ks-card-body">
        {/* Rating row at top of content if available */}
        <div className="ks-card-top-info-row">
          {hasRealRating ? (
            <div className="ks-card-rating">
              <Star size={12} fill="#E10600" stroke="#E10600" />
              <span>{Number(ratingAverage).toFixed(1)}</span>
              <span>({ratingCount})</span>
            </div>
          ) : (
            <div className="ks-card-rating">
              <Star size={12} stroke="#737373" fill="none" />
              <span style={{ fontSize: '0.7rem', color: '#737373' }}>Official Gear</span>
            </div>
          )}
        </div>

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

        {/* Inline Error Notice if needed */}
        {errorMessage && (
          <div className="ks-card-inline-error" role="alert">
            <AlertCircle size={12} />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Bottom Actions Row: BUY NOW Button + Smaller '+' Button for Add to Cart */}
        <div className="ks-card-actions-row">
          {/* BUY NOW Button */}
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

          {/* Smaller '+' Button with Ball Animation */}
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
