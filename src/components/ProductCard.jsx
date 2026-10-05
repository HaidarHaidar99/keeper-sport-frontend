import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Plus, Star, AlertCircle, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { productApi } from '../api/productApi';
import { launchFootballToCart } from '../utils/cartAnimation';

export default function ProductCard({
  product,
  onCartUpdated,
  onFavoriteToggled
}) {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [isFavorited, setIsFavorited] = useState(Boolean(product.isFavorited));
  const [favLoading, setFavLoading] = useState(false);
  const [cartLoading, setCartLoading] = useState(false);
  const [cartSuccess, setCartSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  const productUrl = `/products/${product.slug || product.id}`;

  // Navigate to product details
  const handleCardClick = (e) => {
    // Only navigate if user did not click an interactive action button
    if (e.target.closest('button') || e.target.closest('a')) {
      return;
    }
    navigate(productUrl);
  };

  // Handle Favorite Toggle
  const handleFavoriteClick = async (e) => {
    e.stopPropagation();
    e.preventDefault();

    if (!user) {
      navigate(`/login?redirect=${encodeURIComponent(window.location.pathname)}`);
      return;
    }

    if (favLoading) return;
    setFavLoading(true);

    try {
      const res = await productApi.toggleFavorite(product.id);
      if (res && res.success) {
        setIsFavorited(res.isFavorited);
        if (onFavoriteToggled) {
          onFavoriteToggled(product.id, res.isFavorited, res.favoritesCount);
        }
      } else {
        setErrorMessage(res.message || 'Could not update favorites.');
        setTimeout(() => setErrorMessage(null), 3000);
      }
    } catch {
      setErrorMessage('Network error updating favorites.');
      setTimeout(() => setErrorMessage(null), 3000);
    } finally {
      setFavLoading(false);
    }
  };

  // Handle Add to Cart
  const handleAddToCart = async (e) => {
    e.stopPropagation();
    e.preventDefault();

    if (product.stock?.isOutOfStock) return;
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

        // Trigger football-to-cart flight animation
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

  // Handle Order Now (Direct Checkout Flow)
  const handleOrderNow = (e) => {
    e.stopPropagation();
    e.preventDefault();

    if (product.stock?.isOutOfStock) return;

    // Navigate to direct checkout with product data
    navigate(`/checkout?direct=true&productId=${encodeURIComponent(product.id)}&qty=1`);
  };

  const isOutOfStock = Boolean(product.stock?.isOutOfStock);
  const isLowStock = Boolean(product.stock?.isLowStock) && !isOutOfStock;
  const hasDiscount = Boolean(product.pricing?.hasDiscount);
  const hasRating = Boolean(product.rating?.count && product.rating?.average);

  return (
    <article
      className={`ks-product-card ${isOutOfStock ? 'is-out-of-stock' : ''}`}
      onClick={handleCardClick}
      data-product-id={product.id}
    >
      {/* Product Image Frame */}
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
          {product.primaryImage ? (
            <img
              src={product.primaryImage}
              alt={product.primaryImageAlt || product.name}
              className="ks-card-img"
              loading="lazy"
              onError={(e) => {
                // Clean neutral fallback if image fails to load
                e.currentTarget.style.display = 'none';
                const fallback = e.currentTarget.parentElement?.querySelector('.ks-card-img-fallback');
                if (fallback) fallback.style.display = 'flex';
              }}
            />
          ) : null}

          {/* Clean Neutral Fallback when no image is uploaded */}
          <div
            className="ks-card-img-fallback"
            style={{ display: product.primaryImage ? 'none' : 'flex' }}
            aria-hidden="true"
          >
            <span className="ks-card-fallback-brand">KEEPER SPORTS</span>
          </div>
        </a>

        {/* Top Badges (Offers, Stock status) */}
        <div className="ks-card-badges-row">
          {hasDiscount && (
            <span className="ks-badge ks-badge-offer">
              {product.pricing.discountLabel || 'SALE'}
            </span>
          )}

          {isLowStock && (
            <span className="ks-badge ks-badge-low-stock">
              LOW STOCK
            </span>
          )}

          {isOutOfStock && (
            <span className="ks-badge ks-badge-out-of-stock">
              OUT OF STOCK
            </span>
          )}
        </div>

        {/* Favorite Icon Button (Top Right) */}
        <button
          type="button"
          onClick={handleFavoriteClick}
          disabled={favLoading}
          className={`ks-card-fav-btn ${isFavorited ? 'is-active' : ''}`}
          aria-label={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
          title={isFavorited ? 'In Favorites' : 'Add to Favorites'}
        >
          <Heart
            size={18}
            strokeWidth={1.8}
            className={`ks-fav-icon ${isFavorited ? 'ks-fav-icon-active' : ''}`}
          />
        </button>
      </div>

      {/* Product Content Details */}
      <div className="ks-card-body">
        {/* Category Label (if present) */}
        {product.category?.name ? (
          <span className="ks-card-category">{product.category.name}</span>
        ) : (
          <span className="ks-card-category-spacer" aria-hidden="true" />
        )}

        {/* Product Title (Line clamped) */}
        <h3 className="ks-card-title">
          <a
            href={productUrl}
            onClick={(e) => {
              e.preventDefault();
              navigate(productUrl);
            }}
            className="ks-card-title-link"
          >
            {product.name}
          </a>
        </h3>

        {/* Rating Row (Only rendered when real review data exists) */}
        <div className="ks-card-rating-row">
          {hasRating ? (
            <div className="ks-card-rating">
              <Star size={13} className="ks-star-icon" fill="currentColor" stroke="none" />
              <span className="ks-rating-val">{product.rating.average.toFixed(1)}</span>
              <span className="ks-rating-cnt">({product.rating.count})</span>
            </div>
          ) : (
            <span className="ks-rating-spacer" aria-hidden="true" />
          )}
        </div>

        {/* Pricing Area */}
        <div className="ks-card-pricing-row">
          <span className="ks-card-price-current">
            ${product.pricing?.currentPrice?.toFixed(2) || '0.00'}
          </span>
          {hasDiscount && product.pricing?.originalPrice ? (
            <span className="ks-card-price-original">
              ${product.pricing.originalPrice.toFixed(2)}
            </span>
          ) : null}
        </div>

        {/* Inline Error Notice if an action failed */}
        {errorMessage && (
          <div className="ks-card-inline-error" role="alert">
            <AlertCircle size={12} />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Card Actions: Add to Cart (+) & Order Now */}
        <div className="ks-card-actions-grid">
          <button
            type="button"
            onClick={handleAddToCart}
            disabled={isOutOfStock || cartLoading}
            className={`ks-card-btn-cart ${cartSuccess ? 'is-success' : ''}`}
            aria-label={`Add ${product.name} to cart`}
            title="Add to cart"
          >
            {cartSuccess ? (
              <>
                <Check size={14} strokeWidth={2.5} />
                <span className="ks-btn-label">ADDED</span>
              </>
            ) : (
              <>
                <Plus size={15} strokeWidth={2.5} />
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
          >
            ORDER NOW
          </button>
        </div>
      </div>
    </article>
  );
}
