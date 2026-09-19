import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Heart, 
  ShoppingBag, 
  Star, 
  ShieldAlert, 
  Truck, 
  RefreshCw, 
  Check, 
  AlertCircle,
  ChevronRight,
  ChevronLeft,
  Plus,
  Minus
} from 'lucide-react';
import apiClient from '../services/apiClient';
import { useCart } from '../context/CartContext';
import { useFavorites } from '../context/FavoritesContext';
import { useLanguage } from '../context/LanguageContext';

const ProductDetailPage = () => {
  const { id } = useParams();
  const { t, language, isRtl } = useLanguage();
  const { addToCart } = useCart();
  const { isFavorite, toggleFavorite } = useFavorites();

  const [product, setProduct] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sizeError, setSizeError] = useState(false);
  const [addedSuccess, setAddedSuccess] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const fetchDetail = async () => {
      setLoading(true);
      try {
        const res = await apiClient(`/products/${id}`);
        if (isMounted && res?.data) {
          setProduct(res.data);
          // Set first available variant if variants exist
          if (res.data.product_variants && res.data.product_variants.length > 0) {
            const firstAvailable = res.data.product_variants.find((v) => v.is_available) || res.data.product_variants[0];
            setSelectedVariant(firstAvailable);
          }
        }
      } catch (err) {
        if (isMounted) setError("Product could not be found or is inactive.");
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchDetail();
    return () => { isMounted = false; };
  }, [id]);

  if (loading) {
    return (
      <div className="container" style={{ padding: '80px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
        {isRtl ? "جارٍ تحميل تفاصيل المنتج..." : "Loading pitch product details..."}
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="container" style={{ padding: '80px 20px', textAlign: 'center' }}>
        <h2 style={{ fontSize: '24px', fontWeight: 900, marginBottom: '12px', color: 'var(--text-primary)' }}>
          {isRtl ? "المنتج غير متوفر" : "Product Not Found"}
        </h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '20px' }}>
          {error}
        </p>
        <Link to="/products" className="btn btn-primary">
          {isRtl ? "تصفح جميع المنتجات" : "Browse All Gear"}
        </Link>
      </div>
    );
  }

  const name = language === 'ar' ? (product.name_ar || product.name_en) : product.name_en;
  const description = language === 'ar' ? (product.description_ar || product.description_en) : product.description_en;
  const categoryName = language === 'ar' 
    ? (product.categories?.name_ar || product.categories?.name_en) 
    : product.categories?.name_en;
  const isFav = isFavorite(product.id);

  // Images list: combine product_images array or fallback
  const images = product.product_images && product.product_images.length > 0
    ? product.product_images.map((img) => img.image_url)
    : [product.primary_image || product.image_url].filter(Boolean);

  const variants = product.product_variants || product.variants || [];
  const hasVariants = variants.length > 0;

  // Authoritative Effective Price Calculation:
  // If variant has specific price override, use it. Otherwise, use sale_price (if sale enabled) or base_price.
  const effectivePrice = Number(
    selectedVariant?.price !== undefined && selectedVariant?.price !== null
      ? selectedVariant.price
      : product.is_sale_enabled && product.sale_price !== null
      ? product.sale_price
      : product.base_price
  );

  const originalPrice = Number(product.base_price);
  const isOnSale = Boolean(product.is_sale_enabled) && product.sale_price !== null && effectivePrice < originalPrice;

  // Max orderable quantity
  const maxAvailableQty = selectedVariant?.track_quantity
    ? (selectedVariant.available_stock || 10)
    : 99;

  const handleQuantityChange = (delta) => {
    setQuantity((prev) => {
      const next = prev + delta;
      if (next < 1) return 1;
      if (next > maxAvailableQty) return maxAvailableQty;
      return next;
    });
  };

  const handleAddToCart = () => {
    if (hasVariants && !selectedVariant) {
      setSizeError(true);
      return;
    }
    setSizeError(false);
    addToCart(product, selectedVariant, quantity);
    setAddedSuccess(true);
    setTimeout(() => setAddedSuccess(false), 2200);
  };

  return (
    <div style={{ padding: '40px 0 80px' }}>
      <div className="container">
        {/* Breadcrumb Navigation */}
        <div style={{ display: 'flex', gap: '8px', fontSize: '13px', color: 'var(--text-muted)', marginBottom: '28px', alignItems: 'center' }}>
          <Link to="/" style={{ color: 'var(--text-secondary)' }}>{t('home')}</Link>
          <span>/</span>
          <Link to="/products" style={{ color: 'var(--text-secondary)' }}>{t('shop')}</Link>
          {categoryName && (
            <>
              <span>/</span>
              <Link to={`/products?category=${product.category_id}`} style={{ color: 'var(--text-secondary)' }}>
                {categoryName}
              </Link>
            </>
          )}
          <span>/</span>
          <span style={{ color: 'var(--text-primary)', fontWeight: 700 }}>{name}</span>
        </div>

        {/* ── Top Section: Image Gallery + Product Configurator ── */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '48px',
          alignItems: 'flex-start',
          marginBottom: '60px'
        }}>
          {/* 1. Image Gallery */}
          <div>
            <div style={{
              width: '100%',
              paddingTop: '100%',
              position: 'relative',
              borderRadius: 'var(--radius-lg)',
              overflow: 'hidden',
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              marginBottom: '14px',
              boxShadow: 'var(--shadow-sm)'
            }}>
              {images[activeImageIndex] ? (
                <img
                  src={images[activeImageIndex]}
                  alt={name}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover'
                  }}
                />
              ) : (
                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <ShoppingBag size={54} color="var(--text-muted)" />
                </div>
              )}
            </div>

            {/* Thumbnails (1 to 3 images max) */}
            {images.length > 1 && (
              <div style={{ display: 'flex', gap: '10px' }}>
                {images.slice(0, 3).map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveImageIndex(idx)}
                    style={{
                      width: '74px',
                      height: '74px',
                      borderRadius: 'var(--radius-sm)',
                      overflow: 'hidden',
                      border: activeImageIndex === idx ? '2px solid var(--brand-red)' : '1px solid var(--border-medium)',
                      opacity: activeImageIndex === idx ? 1 : 0.6,
                      transition: 'all var(--transition-fast)'
                    }}
                  >
                    <img src={img} alt="thumb" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 2. Product Details & Purchase Configuration */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', textAlign: 'start' }}>
            <div>
              {/* Category & Status Badges */}
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '8px' }}>
                {categoryName && (
                  <span className="badge badge-red">{categoryName}</span>
                )}
                {product.is_featured && <span className="badge badge-gold">{t('featured')}</span>}
                {isOnSale && <span className="badge badge-sale">{t('sale')}</span>}
              </div>

              <h1 style={{ fontSize: '30px', fontWeight: 900, lineHeight: 1.25, color: 'var(--text-primary)' }}>
                {name}
              </h1>

              {/* 5-Star Graphic Rating (NO review count on card/banner) */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '8px' }}>
                <div style={{ display: 'flex', gap: '2px' }}>
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      size={15} 
                      fill={i < Math.round(product.average_rating || 5) ? "var(--brand-gold)" : "none"} 
                      color="var(--brand-gold)" 
                    />
                  ))}
                </div>
                <span style={{ fontSize: '13px', fontWeight: 800, color: 'var(--text-secondary)' }}>
                  {Number(product.average_rating || 5.0).toFixed(1)}
                </span>
              </div>
            </div>

            {/* Price Box */}
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px' }}>
              <span style={{ fontSize: '34px', fontWeight: 900, color: 'var(--text-primary)' }}>
                ${effectivePrice.toFixed(2)}
              </span>
              {isOnSale && (
                <span style={{ fontSize: '18px', textDecoration: 'line-through', color: 'var(--text-muted)' }}>
                  ${originalPrice.toFixed(2)}
                </span>
              )}
            </div>

            {/* Sizing Matrix Selection */}
            {hasVariants && (
              <div style={{ paddingTop: '12px', borderTop: '1px solid var(--border-subtle)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <span className="form-label" style={{ fontWeight: 800 }}>{t('selectSize')}:</span>
                  {selectedVariant && (
                    <span style={{ 
                      fontSize: '12px', 
                      color: selectedVariant.is_available ? 'var(--brand-green)' : 'var(--brand-red)', 
                      fontWeight: 700 
                    }}>
                      {selectedVariant.is_available 
                        ? `✓ ${t('availableStock')}${selectedVariant.track_quantity ? ` (${selectedVariant.available_stock || 0})` : ''}` 
                        : `✗ ${t('outOfStock')}`}
                    </span>
                  )}
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {variants.map((v) => {
                    const isSelected = selectedVariant?.id === v.id;
                    const isAvailable = v.is_available !== false;
                    return (
                      <button
                        key={v.id || v.size}
                        type="button"
                        disabled={!isAvailable}
                        onClick={() => {
                          setSelectedVariant(v);
                          setSizeError(false);
                          setQuantity(1);
                        }}
                        style={{
                          minWidth: '48px',
                          height: '42px',
                          paddingInlineStart: '12px',
                          paddingInlineEnd: '12px',
                          borderRadius: 'var(--radius-sm)',
                          fontSize: '13px',
                          fontWeight: 800,
                          backgroundColor: isSelected ? 'var(--brand-red-light)' : 'var(--bg-input)',
                          color: isSelected ? 'var(--brand-red)' : isAvailable ? 'var(--text-primary)' : 'var(--text-muted)',
                          border: isSelected ? '1.5px solid var(--brand-red)' : '1px solid var(--border-medium)',
                          opacity: isAvailable ? 1 : 0.45,
                          cursor: isAvailable ? 'pointer' : 'not-allowed',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '4px',
                          transition: 'all var(--transition-fast)'
                        }}
                      >
                        <span>{v.size}</span>
                        {isSelected && <Check size={14} color="var(--brand-red)" />}
                      </button>
                    );
                  })}
                </div>

                {sizeError && (
                  <div style={{ color: 'var(--brand-red)', fontSize: '13px', fontWeight: 700, marginTop: '8px' }}>
                    {isRtl ? "يرجى تحديد المقاس المناسب قبل الإضافة للسلة." : "Please choose a size before adding to cart."}
                  </div>
                )}
              </div>
            )}

            {/* Quantity Selector */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', paddingTop: '10px' }}>
              <span className="form-label" style={{ fontWeight: 800 }}>
                {isRtl ? "الكمية:" : "Quantity:"}
              </span>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                backgroundColor: 'var(--bg-input)',
                border: '1px solid var(--border-medium)',
                borderRadius: 'var(--radius-sm)',
                overflow: 'hidden'
              }}>
                <button
                  type="button"
                  onClick={() => handleQuantityChange(-1)}
                  disabled={quantity <= 1}
                  style={{
                    width: '36px',
                    height: '36px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--text-primary)',
                    opacity: quantity <= 1 ? 0.4 : 1
                  }}
                >
                  <Minus size={15} />
                </button>
                <span style={{ width: '40px', textAlign: 'center', fontWeight: 800, fontSize: '14px' }}>
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => handleQuantityChange(1)}
                  disabled={quantity >= maxAvailableQty}
                  style={{
                    width: '36px',
                    height: '36px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--text-primary)',
                    opacity: quantity >= maxAvailableQty ? 0.4 : 1
                  }}
                >
                  <Plus size={15} />
                </button>
              </div>
            </div>

            {/* Actions: Add to Cart & Wishlist */}
            <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={hasVariants && selectedVariant && !selectedVariant.is_available}
                className="btn btn-primary btn-lg"
                style={{ flex: 1, gap: '10px' }}
              >
                <ShoppingBag size={18} />
                <span>{addedSuccess ? (isRtl ? "تمت الإضافة للسلة ✓" : "Added to Cart ✓") : t('addToCart')}</span>
              </button>

              <button
                type="button"
                onClick={() => toggleFavorite(product)}
                className="btn btn-secondary btn-lg"
                title="Wishlist"
                style={{
                  width: '48px',
                  padding: 0,
                  color: isFav ? 'var(--brand-red)' : 'var(--text-secondary)'
                }}
              >
                <Heart size={20} fill={isFav ? 'var(--brand-red)' : 'none'} color={isFav ? 'var(--brand-red)' : 'currentColor'} />
              </button>
            </div>

            {/* Store Policy Guarantee Banner */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '14px 18px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--brand-gold-light)',
              border: '1px solid rgba(229, 169, 16, 0.25)',
              color: 'var(--brand-gold)',
              fontSize: '13px',
              lineHeight: 1.5,
              marginTop: '10px'
            }}>
              <ShieldAlert size={20} style={{ flexShrink: 0 }} />
              <div>
                <strong>{isRtl ? "ضمان استبدال المقاس:" : "Size Exchange Guarantee:"}</strong>{' '}
                {isRtl ? "يمكنك استبدال المقاس خلال 3 أيام من الاستلام عبر مندوب التوصيل. لا يوجد استرجاع مالي." : "Size replacements are fully supported within 3 days of delivery. Exchanges only — no cash refunds."}
              </div>
            </div>

            {/* Product Description */}
            <div style={{ marginTop: '10px', paddingTop: '14px', borderTop: '1px solid var(--border-subtle)' }}>
              <h4 style={{ fontSize: '15px', fontWeight: 800, marginBottom: '8px', color: 'var(--text-primary)' }}>
                {isRtl ? "مواصفات وتفاصيل الطقم" : "Product Specifications"}
              </h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: 1.7, whiteSpace: 'pre-line' }}>
                {description || (isRtl ? "خامة رياضية احترافية خفيفة الوزن ومقاومة للعرق مصممة للأداء الرياضي العالي في الملعب." : "Engineered with lightweight breathable performance fabric tailored for matchday speed, airflow, and elite athletic agility.")}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;
