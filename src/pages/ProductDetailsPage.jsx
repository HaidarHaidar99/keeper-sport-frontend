import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Heart,
  Plus,
  Minus,
  Star,
  Check,
  AlertCircle,
  Truck,
  ShieldCheck,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  ArrowLeft
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSite } from '../context/SiteContext';
import { productApi } from '../api/productApi';
import { launchFootballToCart } from '../utils/cartAnimation';
import { launchHeartToFavorites } from '../utils/favoriteAnimation';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function ProductDetailsPage() {
  const { slugOrId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { siteSettings, categories, refreshCounts } = useSite();
  const heartBtnRef = useRef(null);

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Gallery state
  const [activeMediaIndex, setActiveMediaIndex] = useState(0);
  const [goalCelebration, setGoalCelebration] = useState(false);

  // Variant selection state
  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [quantity, setQuantity] = useState(1);

  // Customization state (if supported)
  const [printedName, setPrintedName] = useState('');
  const [printedNumber, setPrintedNumber] = useState('');
  const [selectedBadge, setSelectedBadge] = useState(null);

  // Action states
  const [isFavorited, setIsFavorited] = useState(false);
  const [favAnimating, setFavAnimating] = useState(false);
  const [cartLoading, setCartLoading] = useState(false);
  const [cartSuccess, setCartSuccess] = useState(false);
  const [actionError, setActionError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);

    // Fetch product details
    productApi.getProduct(slugOrId)
      .then((prodRes) => {
        if (!isMounted) return;

        if (prodRes && prodRes.success && prodRes.product) {
          const p = prodRes.product;
          setProduct(p);
          setIsFavorited(Boolean(p.isFavorited));

          // Auto-select initial size/color if variants exist
          if (p.variants && p.variants.length > 0) {
            const availableSizes = Array.from(new Set(p.variants.map((v) => v.size_value).filter(Boolean)));
            if (availableSizes.length > 0) setSelectedSize(availableSizes[0]);

            const availableColors = Array.from(new Set(p.variants.map((v) => v.color_value).filter(Boolean)));
            if (availableColors.length > 0) setSelectedColor(availableColors[0]);
          }
        } else {
          setError(prodRes?.message || 'Product not found.');
        }
      })
      .catch((err) => {
        if (isMounted) setError(err.message || 'Failed to load product.');
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [slugOrId]);

  // Handle Gallery index change with Goal celebration on last item
  const handleMediaChange = (newIndex) => {
    if (!product?.media || product.media.length <= 1) return;
    const total = product.media.length;
    const clampedIndex = (newIndex + total) % total;
    setActiveMediaIndex(clampedIndex);

    // Trigger subtle goal animation if customer navigated to the final image
    if (clampedIndex === total - 1) {
      setGoalCelebration(true);
      setTimeout(() => setGoalCelebration(false), 900);
    }
  };

  // Immediate optimistic Favorite toggle
  const handleFavoriteClick = async () => {
    if (!user) {
      navigate(`/login?redirect=${encodeURIComponent(window.location.pathname)}`);
      return;
    }
    if (!product) return;

    const prevState = isFavorited;
    const nextState = !prevState;
    setIsFavorited(nextState);
    setFavAnimating(true);
    setTimeout(() => setFavAnimating(false), 400);

    if (nextState && heartBtnRef.current) {
      launchHeartToFavorites(heartBtnRef.current);
    }

    try {
      const res = await productApi.toggleFavorite(product.id);
      if (res && res.success) {
        setIsFavorited(res.isFavorited);
        if (typeof refreshCounts === 'function') refreshCounts();
      } else {
        setIsFavorited(prevState);
        setActionError(res.message || 'Could not update favorites.');
        setTimeout(() => setActionError(null), 3000);
      }
    } catch {
      setIsFavorited(prevState);
      setActionError('Network error updating favorites.');
      setTimeout(() => setActionError(null), 3000);
    }
  };

  // Add to Cart
  const handleAddToCart = async (e) => {
    if (!product) return;
    if (product.stock?.isOutOfStock || product.stock_quantity === 0) return;
    if (cartLoading) return;

    setCartLoading(true);
    setActionError(null);
    const btnEl = e.currentTarget;

    // Find matched variant id if variants exist
    let matchedVariantId = null;
    if (product.variants && product.variants.length > 0) {
      const match = product.variants.find((v) => {
        const sizeMatch = !selectedSize || v.size_value === selectedSize;
        const colorMatch = !selectedColor || v.color_value === selectedColor;
        return sizeMatch && colorMatch;
      });
      matchedVariantId = match?.id || null;
    }

    try {
      const res = await productApi.addToCart({
        productId: product.id,
        variantId: matchedVariantId,
        quantity: quantity,
        printedName: printedName.trim() || null,
        printedNumber: printedNumber.trim() || null,
        badge: selectedBadge || null
      });

      if (res && res.success) {
        setCartSuccess(true);
        setTimeout(() => setCartSuccess(false), 2000);

        // Micro-animation: Football travels from button to Cart icon in Navbar
        launchFootballToCart(btnEl, () => {
          if (typeof refreshCounts === 'function') refreshCounts();
        });
      } else {
        setActionError(res.message || 'Failed to add to cart.');
        setTimeout(() => setActionError(null), 3500);
      }
    } catch {
      setActionError('Network error adding to cart.');
      setTimeout(() => setActionError(null), 3500);
    } finally {
      setCartLoading(false);
    }
  };

  // Order Now (Direct Checkout Flow)
  const handleOrderNow = () => {
    if (!product) return;
    if (product.stock?.isOutOfStock || product.stock_quantity === 0) return;

    let url = `/checkout?direct=true&productId=${encodeURIComponent(product.id)}&qty=${quantity}`;
    if (selectedSize) url += `&size=${encodeURIComponent(selectedSize)}`;
    if (selectedColor) url += `&color=${encodeURIComponent(selectedColor)}`;
    if (printedName.trim()) url += `&name=${encodeURIComponent(printedName.trim())}`;
    if (printedNumber.trim()) url += `&number=${encodeURIComponent(printedNumber.trim())}`;
    if (selectedBadge) url += `&badge=${encodeURIComponent(selectedBadge)}`;
    navigate(url);
  };

  if (loading) {
    return (
      <div className="ks-page-canvas">
        <Navbar siteSettings={siteSettings} categories={categories} counts={userCounts} />
        <main className="ks-details-loading-wrap" aria-live="polite">
          <div className="ks-loading-spinner" />
          <p className="ks-loading-text">Loading product details...</p>
        </main>
        <Footer siteSettings={siteSettings} categories={categories} />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="ks-page-canvas">
        <Navbar siteSettings={siteSettings} categories={categories} counts={userCounts} />
        <main className="ks-details-error-wrap">
          <div className="ks-details-error-card">
            <AlertCircle size={44} style={{ color: 'var(--ks-accent-red)', margin: '0 auto 16px' }} />
            <h1 className="ks-error-title">Product Not Found</h1>
            <p className="ks-error-message">{error || 'This product does not exist or has been discontinued.'}</p>
            <Link to="/products" className="ks-btn-primary" style={{ display: 'inline-flex', marginTop: '20px' }}>
              <ArrowLeft size={16} style={{ marginRight: '8px' }} />
              <span>RETURN TO PRODUCTS</span>
            </Link>
          </div>
        </main>
        <Footer siteSettings={siteSettings} categories={categories} />
      </div>
    );
  }

  // Real data calculations
  const mediaList = product.media && product.media.length > 0 ? product.media : [];
  const currentMedia = mediaList[activeMediaIndex] || {
    storage_path: product.primaryImage || product.image_url || null,
    media_type: 'image'
  };

  const isOutOfStock = Boolean(product.stock?.isOutOfStock || product.stock_quantity === 0);
  const isLowStock = Boolean(
    (product.stock?.isLowStock || (product.stock_quantity > 0 && product.stock_quantity <= 5)) &&
    !isOutOfStock
  );
  const hasDiscount = Boolean(
    product.pricing?.hasDiscount ||
    (product.old_price && Number(product.old_price) > Number(product.base_price || product.price))
  );

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

  // Real sizes and colors from variants (NO hardcoded data)
  const availableSizes = Array.from(
    new Set((product.variants || []).map((v) => v.size_value).filter(Boolean))
  );
  const availableColors = Array.from(
    new Set((product.variants || []).map((v) => v.color_value).filter(Boolean))
  );

  // Real Reviews / Ratings only
  const ratingAverage = product.rating?.average || product.avg_rating || null;
  const ratingCount = product.rating?.count ?? product.reviews_count ?? null;
  const hasRealRating = Boolean(ratingCount && ratingCount > 0 && ratingAverage);

  return (
    <div className="ks-page-canvas">
      <Navbar siteSettings={siteSettings} categories={categories} counts={userCounts} />

      <main className="ks-details-container">
        {/* Breadcrumb row */}
        <div className="ks-details-breadcrumb">
          <Link to="/" className="ks-breadcrumb-link">HOME</Link>
          <span className="ks-breadcrumb-sep">/</span>
          <Link to="/products" className="ks-breadcrumb-link">PRODUCTS</Link>
          {product.category?.name && (
            <>
              <span className="ks-breadcrumb-sep">/</span>
              <Link
                to={`/products?category=${encodeURIComponent(product.category.slug || product.category.id)}`}
                className="ks-breadcrumb-link"
              >
                {product.category.name.toUpperCase()}
              </Link>
            </>
          )}
          <span className="ks-breadcrumb-sep">/</span>
          <span className="ks-breadcrumb-current">{product.name}</span>
        </div>

        {/* Product Grid: Left Gallery, Right Specifications & Actions */}
        <div className="ks-details-grid">
          {/* LEFT: GALLERY AREA */}
          <section className="ks-details-media-col" aria-label="Product Media Gallery">
            <div className="ks-details-viewport">
              {currentMedia.media_type === 'video' ? (
                <video
                  src={currentMedia.storage_path}
                  controls
                  autoPlay
                  muted
                  loop
                  playsInline
                  className="ks-details-img"
                />
              ) : currentMedia.storage_path ? (
                <img
                  src={currentMedia.storage_path}
                  alt={product.name}
                  className="ks-details-img"
                  loading="eager"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    const fb = e.currentTarget.parentElement?.querySelector('.ks-card-img-fallback');
                    if (fb) fb.style.display = 'flex';
                  }}
                />
              ) : null}

              {/* Clean fallback if image fails */}
              <div
                className="ks-card-img-fallback"
                style={{ display: currentMedia.storage_path ? 'none' : 'flex' }}
              >
                <div className="ks-card-fallback-badge">
                  <span className="ks-card-fallback-brand">KEEPER SPORTS</span>
                  <span className="ks-card-fallback-sub">AUTHENTIC GEAR</span>
                </div>
              </div>

              {/* Gallery arrows if multiple images exist */}
              {mediaList.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={() => handleMediaChange(activeMediaIndex - 1)}
                    className="ks-gallery-arrow ks-gallery-prev"
                    aria-label="Previous image"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMediaChange(activeMediaIndex + 1)}
                    className="ks-gallery-arrow ks-gallery-next"
                    aria-label="Next image"
                  >
                    <ChevronRight size={20} />
                  </button>
                </>
              )}

              {/* Top Right Favorite Button inside gallery frame */}
              <button
                ref={heartBtnRef}
                type="button"
                onClick={handleFavoriteClick}
                className={`ks-details-fav-btn ${isFavorited ? 'is-active' : ''} ${favAnimating ? 'is-animating' : ''}`}
                aria-label={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
                title={isFavorited ? 'Favorited' : 'Add to Favorites'}
              >
                <Heart
                  size={20}
                  fill={isFavorited ? '#E10600' : 'none'}
                  stroke={isFavorited ? '#E10600' : 'currentColor'}
                  strokeWidth={2}
                />
              </button>
            </div>

            {/* Micro Indicator Progress Track: Small moving ball entering mini goal on last image */}
            {mediaList.length > 1 && (
              <div className="ks-gallery-tracker-container" aria-label="Gallery indicator">
                <div className="ks-gallery-pitch-track">
                  {mediaList.map((m, idx) => {
                    const isLast = idx === mediaList.length - 1;
                    const isActive = idx === activeMediaIndex;
                    return (
                      <button
                        key={m.id || idx}
                        type="button"
                        onClick={() => handleMediaChange(idx)}
                        className={`ks-gallery-node ${isActive ? 'is-active' : ''} ${isLast ? 'is-goal-node' : ''}`}
                        aria-label={`View slide ${idx + 1}`}
                      >
                        {isLast ? (
                          <span className={`ks-goal-net ${goalCelebration ? 'is-goal-scored' : ''}`} title="Goal!">
                            🥅
                          </span>
                        ) : (
                          <span className="ks-node-dot" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Thumbnail Strip */}
            {mediaList.length > 1 && (
              <div className="ks-details-thumbs-row">
                {mediaList.map((media, idx) => (
                  <button
                    key={media.id || idx}
                    type="button"
                    onClick={() => handleMediaChange(idx)}
                    className={`ks-thumb-btn ${idx === activeMediaIndex ? 'is-active' : ''}`}
                    aria-label={`Select media ${idx + 1}`}
                  >
                    <img
                      src={media.storage_path}
                      alt={`${product.name} thumb ${idx + 1}`}
                      className="ks-thumb-img"
                    />
                  </button>
                ))}
              </div>
            )}
          </section>

          {/* RIGHT: PRODUCT INFO & COMMERCE ACTIONS */}
          <section className="ks-details-info-col">
            {/* Category Tag */}
            {product.category?.name && (
              <div className="ks-details-category-tag">
                {product.category.name.toUpperCase()}
              </div>
            )}

            {/* Title */}
            <h1 className="ks-details-title">{product.name}</h1>

            {/* Real Rating row */}
            <div className="ks-details-rating-row">
              {hasRealRating ? (
                <div className="ks-card-rating">
                  <Star size={16} className="ks-star-icon" fill="#E10600" stroke="#E10600" />
                  <span className="ks-rating-val">{Number(ratingAverage).toFixed(1)}</span>
                  <span className="ks-rating-cnt">({ratingCount} verified reviews)</span>
                </div>
              ) : (
                <div className="ks-card-rating ks-rating-empty">
                  <Star size={15} className="ks-star-icon-empty" stroke="currentColor" fill="none" />
                  <span className="ks-rating-empty-label">No reviews yet</span>
                </div>
              )}
            </div>

            {/* Price Row */}
            <div className="ks-details-price-row">
              <span className="ks-details-price-current">
                ${currentPrice.toFixed(2)}
              </span>
              {hasDiscount && originalPrice && originalPrice > currentPrice ? (
                <span className="ks-details-price-original">
                  ${originalPrice.toFixed(2)}
                </span>
              ) : null}

              {hasDiscount && (
                <span className="ks-badge ks-badge-sale">
                  {product.pricing?.discountLabel || 'SPECIAL OFFER'}
                </span>
              )}
            </div>

            {/* Stock status indicator */}
            <div className="ks-details-stock-status">
              {isOutOfStock ? (
                <span className="ks-stock-pill is-out">OUT OF STOCK</span>
              ) : isLowStock ? (
                <span className="ks-stock-pill is-low">LOW STOCK — ORDER SOON</span>
              ) : (
                <span className="ks-stock-pill is-in">IN STOCK &amp; READY TO SHIP</span>
              )}
            </div>

            {/* Description */}
            {product.description && (
              <div className="ks-details-description">
                <p>{product.description}</p>
              </div>
            )}

            {/* OPTIONAL: SIZES (Only rendered when sizes exist) */}
            {availableSizes.length > 0 && (
              <div className="ks-details-option-group">
                <label className="ks-details-option-label">
                  SELECT SIZE: <strong style={{ color: 'var(--ks-text-title)' }}>{selectedSize || 'Choose size'}</strong>
                </label>
                <div className="ks-sizes-grid">
                  {availableSizes.map((size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => setSelectedSize(size)}
                      className={`ks-size-pill ${selectedSize === size ? 'is-active' : ''}`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* OPTIONAL: COLORS (Only rendered when colors exist) */}
            {availableColors.length > 0 && (
              <div className="ks-details-option-group">
                <label className="ks-details-option-label">
                  COLOR: <strong style={{ color: 'var(--ks-text-title)' }}>{selectedColor || 'Choose color'}</strong>
                </label>
                <div className="ks-colors-grid">
                  {availableColors.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setSelectedColor(color)}
                      className={`ks-color-pill ${selectedColor === color ? 'is-active' : ''}`}
                      title={color}
                    >
                      <span
                        className="ks-color-dot"
                        style={{
                          backgroundColor:
                            color.toLowerCase() === 'white' ? '#FFFFFF' :
                            color.toLowerCase() === 'black' ? '#000000' :
                            color.toLowerCase() === 'red' ? '#E10600' :
                            color.toLowerCase() === 'blue' ? '#0047AB' :
                            color.toLowerCase() === 'green' ? '#1E792C' :
                            color.toLowerCase() === 'yellow' ? '#FFD700' :
                            color.toLowerCase() === 'navy' ? '#000080' :
                            color.toLowerCase() === 'gray' ? '#7A7A7A' : color
                        }}
                      />
                      <span className="ks-color-name">{color}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* OPTIONAL: PRINTING & BADGES (If enabled on this product) */}
            {(product.printing_available || product.badges_available) && (
              <div className="ks-details-custom-group">
                <h4 className="ks-custom-heading">CUSTOMIZE YOUR KIT</h4>

                {product.printing_available && (
                  <div className="ks-printing-fields">
                    <div className="ks-printing-field">
                      <label className="ks-label">NAME PRINTING</label>
                      <input
                        type="text"
                        maxLength={14}
                        placeholder="e.g. RONALDO"
                        value={printedName}
                        onChange={(e) => setPrintedName(e.target.value.toUpperCase())}
                        className="ks-input"
                      />
                    </div>
                    <div className="ks-printing-field">
                      <label className="ks-label">NUMBER</label>
                      <input
                        type="text"
                        maxLength={2}
                        placeholder="7"
                        value={printedNumber}
                        onChange={(e) => setPrintedNumber(e.target.value.replace(/\D/g, ''))}
                        className="ks-input"
                      />
                    </div>
                  </div>
                )}

                {product.badges_available && (
                  <div className="ks-badge-selector">
                    <label className="ks-label">SLEEVE BADGE</label>
                    <div className="ks-badge-options">
                      {[
                        { id: null, label: 'None' },
                        { id: 'premier_league', label: 'Premier League' },
                        { id: 'champions_league', label: 'UEFA Champions League' },
                        { id: 'la_liga', label: 'La Liga' }
                      ].map((b) => (
                        <button
                          key={String(b.id)}
                          type="button"
                          onClick={() => setSelectedBadge(b.id)}
                          className={`ks-badge-select-btn ${selectedBadge === b.id ? 'is-active' : ''}`}
                        >
                          {b.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Quantity Selector */}
            <div className="ks-details-qty-row">
              <label className="ks-details-option-label" style={{ marginBottom: 0 }}>
                QUANTITY:
              </label>
              <div className="ks-qty-stepper">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  disabled={quantity <= 1 || isOutOfStock}
                  className="ks-qty-btn"
                  aria-label="Decrease quantity"
                >
                  <Minus size={15} />
                </button>
                <span className="ks-qty-value">{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => q + 1)}
                  disabled={isOutOfStock}
                  className="ks-qty-btn"
                  aria-label="Increase quantity"
                >
                  <Plus size={15} />
                </button>
              </div>
            </div>

            {/* Inline Error Notice */}
            {actionError && (
              <div className="ks-alert ks-alert-error" style={{ margin: '14px 0' }} role="alert">
                <AlertCircle size={15} />
                <span>{actionError}</span>
              </div>
            )}

            {/* TWO COMMERCE ACTIONS: ADD TO CART & ORDER NOW */}
            <div className="ks-details-actions-grid">
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={isOutOfStock || cartLoading}
                className={`ks-details-btn-cart ${cartSuccess ? 'is-success' : ''}`}
                aria-label={`Add ${product.name} to cart`}
              >
                {cartSuccess ? (
                  <>
                    <Check size={18} strokeWidth={2.5} />
                    <span>ADDED TO CART</span>
                  </>
                ) : (
                  <>
                    <Plus size={18} strokeWidth={2.5} />
                    <span>ADD TO CART</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleOrderNow}
                disabled={isOutOfStock}
                className="ks-details-btn-order"
                aria-label={`Order ${product.name} now`}
              >
                ORDER NOW
              </button>
            </div>

            {/* Authentic Brand Perks */}
            <div className="ks-details-perks">
              <div className="ks-perk-item">
                <Truck size={18} className="ks-perk-icon" />
                <div>
                  <strong>FAST LEBANON DELIVERY</strong>
                  <span>Delivered securely to your doorstep</span>
                </div>
              </div>
              <div className="ks-perk-item">
                <ShieldCheck size={18} className="ks-perk-icon" />
                <div>
                  <strong>100% AUTHENTIC GUARANTEE</strong>
                  <span>Official club &amp; manufacturer gear</span>
                </div>
              </div>
              <div className="ks-perk-item">
                <RotateCcw size={18} className="ks-perk-icon" />
                <div>
                  <strong>VERIFIED SIZING ASSISTANCE</strong>
                  <span>Direct WhatsApp support for measurements</span>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>

      <Footer siteSettings={siteSettings} categories={categories} />
    </div>
  );
}
