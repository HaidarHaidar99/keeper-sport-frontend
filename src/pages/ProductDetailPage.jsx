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
  Upload, 
  AlertCircle,
  MessageSquare
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Review submission modal state
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [reviewImageFile, setReviewImageFile] = useState(null);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewSuccessMsg, setReviewSuccessMsg] = useState('');

  useEffect(() => {
    const fetchDetail = async () => {
      setLoading(true);
      try {
        const res = await apiClient(`/products/${id}`);
        if (res?.data) {
          setProduct(res.data);
          // Set first available variant as default if variants exist
          if (res.data.variants && res.data.variants.length > 0) {
            const firstAvailable = res.data.variants.find((v) => v.is_available) || res.data.variants[0];
            setSelectedVariant(firstAvailable);
          }
        }
      } catch (err) {
        setError("Failed to load product details");
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [id]);

  if (loading) {
    return (
      <div className="container" style={{ padding: '80px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
        Loading product details...
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="container" style={{ padding: '80px 20px', textAlign: 'center' }}>
        <h2 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '12px' }}>Product Not Found</h2>
        <Link to="/products" className="btn btn-primary">Browse All Products</Link>
      </div>
    );
  }

  const name = language === 'ar' ? (product.name_ar || product.name_en) : product.name_en;
  const description = language === 'ar' ? (product.description_ar || product.description_en) : product.description_en;
  const isFav = isFavorite(product.id);

  // Images list: combine images array or fallback to primary_image
  const images = product.images && product.images.length > 0 
    ? product.images.map((img) => img.image_url) 
    : [product.primary_image || product.image_url].filter(Boolean);

  // Dynamic Effective Price: variant price override if set, else sale/base price
  const effectivePrice = Number(
    selectedVariant?.price !== undefined && selectedVariant?.price !== null
      ? selectedVariant.price
      : product.sale_enabled && product.sale_price !== null
      ? product.sale_price
      : product.base_price
  );

  const originalPrice = Number(product.base_price);
  const isOnSale = product.sale_enabled && product.sale_price !== null && effectivePrice < originalPrice;

  const handleAddToCart = () => {
    addToCart(product, selectedVariant, 1);
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setSubmittingReview(true);
    try {
      let uploadedImageUrl = null;

      // 1. Upload review image if attached
      if (reviewImageFile) {
        const formData = new FormData();
        formData.append('image', reviewImageFile);
        const uploadRes = await apiClient('/reviews/upload', {
          method: 'POST',
          body: formData
        });
        if (uploadRes?.imageUrl) {
          uploadedImageUrl = uploadRes.imageUrl;
        }
      }

      // 2. Submit review to backend
      await apiClient('/reviews', {
        method: 'POST',
        body: JSON.stringify({
          product_id: product.id,
          rating,
          comment,
          customer_name: customerName || undefined,
          images: uploadedImageUrl ? [uploadedImageUrl] : []
        })
      });

      setReviewSuccessMsg(isRtl ? "تم إرسال تقييمك بنجاح! سيظهر بعد المراجعة." : "Review submitted successfully! It will appear once approved by our moderators.");
      setComment('');
      setReviewImageFile(null);
      setTimeout(() => {
        setReviewModalOpen(false);
        setReviewSuccessMsg('');
      }, 2500);
    } catch (err) {
      alert(err.message || "Failed to submit review");
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <div style={{ padding: '50px 0 80px' }}>
      <div className="container">
        {/* Breadcrumb */}
        <div style={{ display: 'flex', gap: '8px', fontSize: '13px', color: 'var(--text-muted)', marginBottom: '32px' }}>
          <Link to="/" style={{ color: 'var(--text-secondary)' }}>{t('home')}</Link>
          <span>/</span>
          <Link to="/products" style={{ color: 'var(--text-secondary)' }}>{t('shop')}</Link>
          <span>/</span>
          <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{name}</span>
        </div>

        {/* ── Top Section: Images + Details ── */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '48px',
          alignItems: 'flex-start',
          marginBottom: '80px'
        }}>
          {/* Gallery Col */}
          <div>
            <div style={{
              width: '100%',
              paddingTop: '100%',
              position: 'relative',
              borderRadius: 'var(--radius-xl)',
              overflow: 'hidden',
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-subtle)',
              marginBottom: '16px'
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
                  <ShoppingBag size={48} color="var(--text-muted)" />
                </div>
              )}
            </div>

            {/* Thumbnails (up to 3 images) */}
            {images.length > 1 && (
              <div style={{ display: 'flex', gap: '12px' }}>
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    style={{
                      width: '74px',
                      height: '74px',
                      borderRadius: 'var(--radius-md)',
                      overflow: 'hidden',
                      border: activeImageIndex === idx ? '2px solid var(--accent-cyan)' : '1px solid var(--border-subtle)',
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

          {/* Details Col */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              {/* Category & Status */}
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '8px' }}>
                {product.category_name && (
                  <span className="badge badge-cyan">{product.category_name}</span>
                )}
                {product.featured && <span className="badge badge-gold">{t('featured')}</span>}
                {isOnSale && <span className="badge badge-sale">{t('sale')}</span>}
              </div>

              <h1 style={{ fontSize: '32px', fontWeight: 900, lineHeight: 1.2 }}>{name}</h1>

              {/* Rating */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '8px' }}>
                <div style={{ display: 'flex', gap: '2px' }}>
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={15} fill={i < Math.round(product.avg_rating || 5) ? "#FFB800" : "none"} color="#FFB800" />
                  ))}
                </div>
                <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-secondary)' }}>
                  {Number(product.avg_rating || 5.0).toFixed(1)} ({product.reviews_count || 0} reviews)
                </span>
              </div>
            </div>

            {/* Price Box */}
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '14px' }}>
              <span style={{ fontSize: '36px', fontWeight: 900, color: isOnSale ? 'var(--accent-cyan)' : 'var(--text-primary)' }}>
                ${effectivePrice.toFixed(2)}
              </span>
              {isOnSale && (
                <span style={{ fontSize: '18px', textDecoration: 'line-through', color: 'var(--text-muted)' }}>
                  ${originalPrice.toFixed(2)}
                </span>
              )}
            </div>

            {/* Size Variant Matrix */}
            {product.variants && product.variants.length > 0 && (
              <div style={{ paddingTop: '10px', borderTop: '1px solid var(--border-subtle)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <span className="form-label">{t('selectSize')}</span>
                  {selectedVariant && (
                    <span style={{ fontSize: '12px', color: selectedVariant.is_available ? 'var(--accent-green)' : 'var(--accent-red)', fontWeight: 700 }}>
                      {selectedVariant.is_available ? `✓ ${t('availableStock')} (${selectedVariant.available_stock || 10})` : `✗ ${t('outOfStock')}`}
                    </span>
                  )}
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                  {product.variants.map((v) => {
                    const isSelected = selectedVariant?.id === v.id;
                    const isAvailable = v.is_available;
                    return (
                      <button
                        key={v.id}
                        disabled={!isAvailable}
                        onClick={() => setSelectedVariant(v)}
                        style={{
                          padding: '10px 18px',
                          borderRadius: 'var(--radius-md)',
                          fontSize: '13px',
                          fontWeight: 800,
                          backgroundColor: isSelected ? 'var(--accent-cyan)' : 'var(--bg-card)',
                          color: isSelected ? '#040914' : isAvailable ? 'var(--text-primary)' : 'var(--text-muted)',
                          border: isSelected ? '1px solid var(--accent-cyan)' : '1px solid var(--border-subtle)',
                          opacity: isAvailable ? 1 : 0.4,
                          textDecoration: !isAvailable ? 'line-through' : 'none',
                          cursor: isAvailable ? 'pointer' : 'not-allowed',
                          transition: 'all var(--transition-fast)'
                        }}
                      >
                        {v.size}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Actions: Add to Cart & Wishlist */}
            <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
              <button
                onClick={handleAddToCart}
                disabled={selectedVariant && !selectedVariant.is_available}
                className="btn btn-primary btn-lg"
                style={{ flex: 1, gap: '10px' }}
              >
                <ShoppingBag size={20} />
                <span>{t('addToCart')}</span>
              </button>

              <button
                onClick={() => toggleFavorite(product)}
                className="btn btn-outline btn-lg btn-icon"
                title="Wishlist"
                style={{ color: isFav ? 'var(--accent-red)' : 'var(--text-primary)' }}
              >
                <Heart size={22} fill={isFav ? 'var(--accent-red)' : 'none'} />
              </button>
            </div>

            {/* Store Policy Alert Box */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '14px 18px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'rgba(255, 184, 0, 0.08)',
              border: '1px solid rgba(255, 184, 0, 0.25)',
              color: 'var(--accent-gold)',
              fontSize: '13px',
              lineHeight: 1.5
            }}>
              <ShieldAlert size={20} style={{ flexShrink: 0 }} />
              <div>
                <strong>{isRtl ? "سياسة الاستبدال:" : "Exchanges Only Guarantee:"}</strong>{' '}
                {isRtl ? "يمكنك استبدال المقاس خلال 3 أيام من الاستلام. لا يوجد استرجاع مالي." : "Replacement size exchanges are supported within 3 days of delivery. No cash refunds."}
              </div>
            </div>

            {/* Description */}
            <div style={{ marginTop: '10px' }}>
              <h4 style={{ fontSize: '15px', fontWeight: 800, marginBottom: '8px' }}>
                {isRtl ? "تفاصيل ومواصفات المنتج" : "Product Details"}
              </h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: 1.7, whiteSpace: 'pre-line' }}>
                {description || (isRtl ? "خامة رياضية احترافية خفيفة الوزن ومقاومة للعرق مصممة للأداء الرياضي العالي." : "Engineered high-performance breathable sportswear fabrics designed for maximum agility and pitch performance.")}
              </p>
            </div>
          </div>
        </div>

        {/* ── Reviews & Community Section ── */}
        <section style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '60px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
            <div>
              <h3 style={{ fontSize: '24px', fontWeight: 900 }}>{t('reviews')}</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                {isRtl ? "تقييمات وصور المشترين المعتمدة لهذا المنتج" : "Verified buyer feedback and uploaded photos"}
              </p>
            </div>

            <button onClick={() => setReviewModalOpen(true)} className="btn btn-outline btn-sm" style={{ gap: '6px' }}>
              <MessageSquare size={16} />
              <span>{isRtl ? "أضف تقييمك" : "Write a Review"}</span>
            </button>
          </div>

          {/* Review List */}
          {(!product.reviews || product.reviews.length === 0) ? (
            <div className="glass-card" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
              {isRtl ? "كن أول من يقيّم هذا المنتج!" : "Be the first to review this product!"}
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
              {product.reviews.map((rev) => (
                <div key={rev.id} className="glass-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', gap: '2px' }}>
                      {[...Array(rev.rating)].map((_, i) => (
                        <Star key={i} size={14} fill="#FFB800" color="#FFB800" />
                      ))}
                    </div>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                      {new Date(rev.created_at).toLocaleDateString()}
                    </span>
                  </div>

                  <p style={{ fontSize: '14px', color: 'var(--text-primary)', lineHeight: 1.5 }}>
                    "{rev.comment}"
                  </p>

                  {/* Customer Review Image */}
                  {rev.images && rev.images.length > 0 && (
                    <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                      {rev.images.map((img, i) => (
                        <img 
                          key={i} 
                          src={img.image_url || img} 
                          alt="review photo" 
                          style={{ width: '64px', height: '64px', borderRadius: 'var(--radius-sm)', objectFit: 'cover' }} 
                        />
                      ))}
                    </div>
                  )}

                  <div style={{ marginTop: 'auto', fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>
                    {rev.customer_name || "Verified Customer"}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ── Review Submission Modal ── */}
        {reviewModalOpen && (
          <div style={{
            position: 'fixed',
            inset: 0,
            zIndex: 300,
            backgroundColor: 'rgba(0,0,0,0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}>
            <div style={{
              width: '100%',
              maxWidth: '480px',
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-medium)',
              borderRadius: 'var(--radius-lg)',
              padding: '28px'
            }}>
              <h3 style={{ fontSize: '20px', fontWeight: 900, marginBottom: '16px' }}>
                {isRtl ? "كتابة تقييم للمنتج" : "Write a Product Review"}
              </h3>

              {reviewSuccessMsg ? (
                <div style={{ padding: '20px', backgroundColor: 'rgba(0,229,153,0.1)', color: 'var(--accent-green)', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
                  {reviewSuccessMsg}
                </div>
              ) : (
                <form onSubmit={handleReviewSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div>
                    <label className="form-label">{isRtl ? "التقييم بالنجوم" : "Star Rating"}</label>
                    <div style={{ display: 'flex', gap: '6px', cursor: 'pointer', marginTop: '6px' }}>
                      {[1, 2, 3, 4, 5].map((s) => (
                        <button key={s} type="button" onClick={() => setRating(s)}>
                          <Star size={24} fill={s <= rating ? "#FFB800" : "none"} color="#FFB800" />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="form-label">{isRtl ? "اسمك أو لقبك" : "Your Name (optional)"}</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Ahmed S."
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="form-label">{isRtl ? "رأيك في المنتج" : "Your Review"}</label>
                    <textarea
                      required
                      className="form-input"
                      rows={3}
                      placeholder={isRtl ? "اكتب تفاصيل تجربتك وجودة القماش والمقاس..." : "Describe product quality, fabric feel, and size fit..."}
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="form-label">{isRtl ? "صورة المنتج (اختياري)" : "Attach Photo (optional)"}</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setReviewImageFile(e.target.files[0])}
                      style={{ fontSize: '13px', color: 'var(--text-secondary)' }}
                    />
                  </div>

                  <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                    <button type="submit" disabled={submittingReview} className="btn btn-primary" style={{ flex: 1 }}>
                      {submittingReview ? "Submitting..." : (isRtl ? "إرسال التقييم" : "Submit Review")}
                    </button>
                    <button type="button" onClick={() => setReviewModalOpen(false)} className="btn btn-ghost">
                      {isRtl ? "إلغاء" : "Cancel"}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetailPage;
