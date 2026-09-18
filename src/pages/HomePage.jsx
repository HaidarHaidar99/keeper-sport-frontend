import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowRight, 
  ArrowLeft, 
  Shirt, 
  Flame, 
  Sparkles, 
  ShieldCheck, 
  Truck, 
  RefreshCw, 
  Star,
  ChevronRight,
  ChevronLeft
} from 'lucide-react';
import ProductCard from '../components/common/ProductCard';
import apiClient from '../services/apiClient';
import { useLanguage } from '../context/LanguageContext';

const HomePage = () => {
  const { t, language, isRtl } = useLanguage();

  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [heroIndex, setHeroIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  // Dynamic hero slides
  const slides = [
    {
      titleEn: "NEW SEASON 2026/27 OFFICIAL KITS",
      titleAr: "أطقم الموسم الجديد 2026/27 الرسمية",
      subtitleEn: "Authentic player version and fan edition football shirts straight from the pitch.",
      subtitleAr: "قمصان اللاعبين والجمهور الأصلية مباشرة من أفضل الأندية والمنتخبات.",
      ctaEn: "Shop Football Shirts",
      ctaAr: "تسوق القمصان الآن",
      link: "/products",
      tagEn: "AUTHENTIC GEAR",
      tagAr: "منتجات أصلية",
      accent: "var(--accent-cyan)",
      bgGradient: "linear-gradient(135deg, rgba(0, 240, 255, 0.18) 0%, rgba(11, 14, 20, 0.95) 100%)"
    },
    {
      titleEn: "2D INTERACTIVE KIT DESIGNER",
      titleAr: "صمم تيشيرتك المفضل بتقنية 2D",
      subtitleEn: "Customize names, legendary numbers, badges, and sleeve accents in real time.",
      subtitleAr: "خصص اسمك ورقمك المفضل وشعارات الأكمام مباشرة من متصفحك.",
      ctaEn: "Launch Kit Customizer",
      ctaAr: "ابدأ التصميم الآن",
      link: "/custom-kit",
      tagEn: "CUSTOM LAB",
      tagAr: "مختبر التصميم",
      accent: "var(--accent-gold)",
      bgGradient: "linear-gradient(135deg, rgba(255, 184, 0, 0.18) 0%, rgba(11, 14, 20, 0.95) 100%)"
    }
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch featured products
        const prodRes = await apiClient('/products?limit=8');
        if (prodRes?.data) setFeaturedProducts(prodRes.data);

        // Fetch categories
        const catRes = await apiClient('/categories');
        if (catRes?.data) setCategories(catRes.data);

        // Fetch reviews highlight
        const revRes = await apiClient('/reviews?limit=3');
        if (revRes?.data) setReviews(revRes.data);
      } catch (err) {
        console.warn("Error fetching homepage data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const nextSlide = () => setHeroIndex((prev) => (prev + 1) % slides.length);
  const prevSlide = () => setHeroIndex((prev) => (prev - 1 + slides.length) % slides.length);

  const currentSlide = slides[heroIndex];

  return (
    <div>
      {/* ── 1. Hero Carousel ── */}
      <section style={{
        position: 'relative',
        minHeight: '520px',
        backgroundColor: 'var(--bg-surface)',
        background: currentSlide.bgGradient,
        borderBottom: '1px solid var(--border-subtle)',
        display: 'flex',
        alignItems: 'center',
        overflow: 'hidden'
      }}>
        <div className="container" style={{ position: 'relative', zIndex: 2, padding: '60px 20px' }}>
          <div style={{ maxWidth: '640px' }}>
            {/* Tag */}
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 12px',
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'rgba(0, 0, 0, 0.4)',
              border: `1px solid ${currentSlide.accent}`,
              color: currentSlide.accent,
              fontSize: '12px',
              fontWeight: 800,
              letterSpacing: '1px',
              marginBottom: '18px'
            }}>
              <Sparkles size={14} />
              <span>{language === 'ar' ? currentSlide.tagAr : currentSlide.tagEn}</span>
            </div>

            {/* Headline */}
            <h1 style={{
              fontSize: 'clamp(32px, 5vw, 54px)',
              fontWeight: 900,
              lineHeight: 1.12,
              marginBottom: '18px',
              letterSpacing: '-0.5px'
            }}>
              {language === 'ar' ? currentSlide.titleAr : currentSlide.titleEn}
            </h1>

            <p style={{
              fontSize: '16px',
              color: 'var(--text-secondary)',
              lineHeight: 1.6,
              marginBottom: '28px',
              maxWidth: '520px'
            }}>
              {language === 'ar' ? currentSlide.subtitleAr : currentSlide.subtitleEn}
            </p>

            <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
              <Link to={currentSlide.link} className="btn btn-primary btn-lg" style={{ gap: '10px' }}>
                <span>{language === 'ar' ? currentSlide.ctaAr : currentSlide.ctaEn}</span>
                {isRtl ? <ArrowLeft size={18} /> : <ArrowRight size={18} />}
              </Link>
              <Link to="/custom-kit" className="btn btn-outline btn-lg" style={{ gap: '8px' }}>
                <Shirt size={18} />
                <span>{t('customKit')}</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Carousel Slide Controls */}
        <div style={{
          position: 'absolute',
          bottom: '24px',
          insetInlineEnd: '40px',
          display: 'flex',
          gap: '10px',
          zIndex: 3
        }}>
          <button onClick={prevSlide} className="btn btn-ghost btn-icon" style={{ backgroundColor: 'var(--bg-glass)', border: '1px solid var(--border-subtle)' }}>
            {isRtl ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </button>
          <button onClick={nextSlide} className="btn btn-ghost btn-icon" style={{ backgroundColor: 'var(--bg-glass)', border: '1px solid var(--border-subtle)' }}>
            {isRtl ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
          </button>
        </div>
      </section>

      {/* ── 2. Trust Badges Banner ── */}
      <section style={{
        borderBottom: '1px solid var(--border-subtle)',
        backgroundColor: 'var(--bg-surface)',
        padding: '24px 0'
      }}>
        <div className="container">
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '24px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{
                width: '46px',
                height: '46px',
                borderRadius: '12px',
                backgroundColor: 'rgba(0, 240, 255, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--accent-cyan)'
              }}>
                <ShieldCheck size={24} />
              </div>
              <div>
                <h4 style={{ fontSize: '15px', fontWeight: 800 }}>{isRtl ? "منتجات أصلية 100%" : "100% Authentic Quality"}</h4>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{isRtl ? "قمصان ومعدات رسمية موثوقة" : "Direct from verified official sportswear makers"}</p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{
                width: '46px',
                height: '46px',
                borderRadius: '12px',
                backgroundColor: 'rgba(255, 184, 0, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--accent-gold)'
              }}>
                <RefreshCw size={24} />
              </div>
              <div>
                <h4 style={{ fontSize: '15px', fontWeight: 800 }}>{isRtl ? "استبدال المقاس متاح" : "Guaranteed Size Exchange"}</h4>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{isRtl ? "سياسة استبدال المقاس فقط (لا استرجاع مالي)" : "Exchanges Only — No Refunds policy"}</p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{
                width: '46px',
                height: '46px',
                borderRadius: '12px',
                backgroundColor: 'rgba(0, 229, 153, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--accent-green)'
              }}>
                <Truck size={24} />
              </div>
              <div>
                <h4 style={{ fontSize: '15px', fontWeight: 800 }}>{isRtl ? "توصيل سريع لكافة المدن" : "Fast City Delivery"}</h4>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{isRtl ? "الدفع عند الاستلام كاش" : "Cash on delivery straight to your door"}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 3. Top Categories Showcase ── */}
      <section style={{ padding: '60px 0' }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '32px' }}>
            <div>
              <span className="badge badge-cyan" style={{ marginBottom: '8px' }}>{t('categories')}</span>
              <h2 style={{ fontSize: '28px', fontWeight: 900 }}>{isRtl ? "تسوق حسب القسم" : "Explore Collections"}</h2>
            </div>
            <Link to="/products" style={{ color: 'var(--accent-cyan)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px', fontSize: '14px' }}>
              <span>{isRtl ? "عرض الكل" : "View All"}</span>
              {isRtl ? <ArrowLeft size={16} /> : <ArrowRight size={16} />}
            </Link>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
            gap: '16px'
          }}>
            {categories.map((cat) => (
              <Link 
                key={cat.id} 
                to={`/products?category=${cat.id}`}
                className="glass-card glow-card-cyan"
                style={{
                  padding: '24px 16px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  gap: '12px'
                }}
              >
                <div style={{
                  width: '54px',
                  height: '54px',
                  borderRadius: '16px',
                  backgroundColor: 'var(--bg-input)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--accent-cyan)'
                }}>
                  <Shirt size={28} />
                </div>
                <h4 style={{ fontSize: '15px', fontWeight: 800 }}>
                  {language === 'ar' ? (cat.name_ar || cat.name_en) : cat.name_en}
                </h4>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── 4. Featured Gear Grid ── */}
      <section style={{ padding: '40px 0 60px', backgroundColor: 'var(--bg-surface)', borderTop: '1px solid var(--border-subtle)', borderBottom: '1px solid var(--border-subtle)' }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '32px' }}>
            <div>
              <span className="badge badge-gold" style={{ marginBottom: '8px' }}>🔥 {t('featured')}</span>
              <h2 style={{ fontSize: '28px', fontWeight: 900 }}>{isRtl ? "أحدث المنتجات والقمصان" : "Featured Performance Gear"}</h2>
            </div>
            <Link to="/products" style={{ color: 'var(--accent-cyan)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px', fontSize: '14px' }}>
              <span>{isRtl ? "تصفح المتجر بالكامل" : "Browse Full Catalog"}</span>
              {isRtl ? <ArrowLeft size={16} /> : <ArrowRight size={16} />}
            </Link>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
              Loading products...
            </div>
          ) : (
            <div className="grid-products">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── 5. 2D Custom Kit Designer CTA Banner ── */}
      <section style={{ padding: '80px 0' }}>
        <div className="container">
          <div className="glass-card" style={{
            background: 'linear-gradient(135deg, #10162A 0%, #080C16 100%)',
            border: '1px solid rgba(0, 240, 255, 0.35)',
            borderRadius: 'var(--radius-xl)',
            padding: '50px 40px',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '30px',
            boxShadow: 'var(--shadow-cyan)'
          }}>
            <div style={{ maxWidth: '580px' }}>
              <span className="badge badge-cyan" style={{ marginBottom: '12px' }}>
                <Sparkles size={13} />
                <span>{t('customKit')}</span>
              </span>
              <h2 style={{ fontSize: '34px', fontWeight: 900, lineHeight: 1.2, marginBottom: '16px' }}>
                {t('kitDesignerTitle')}
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '16px', lineHeight: 1.6, marginBottom: '24px' }}>
                {t('kitDesignerSubtitle')}
              </p>
              <Link to="/custom-kit" className="btn btn-primary btn-lg" style={{ gap: '10px' }}>
                <Shirt size={20} />
                <span>{language === 'ar' ? "ابدأ تصميم قميصك الآن" : "Launch 2D Kit Studio"}</span>
              </Link>
            </div>

            {/* Visual Icon Illustration */}
            <div style={{
              width: '180px',
              height: '180px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(0, 240, 255, 0.25) 0%, rgba(0, 0, 0, 0) 70%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Shirt size={90} color="var(--accent-cyan)" />
            </div>
          </div>
        </div>
      </section>

      {/* ── 6. Verified Customer Reviews Highlight ── */}
      {reviews.length > 0 && (
        <section style={{ padding: '40px 0 80px', backgroundColor: 'var(--bg-surface)', borderTop: '1px solid var(--border-subtle)' }}>
          <div className="container">
            <div style={{ textAlign: 'center', maxWidth: '600px', margin: '0 auto 40px' }}>
              <span className="badge badge-gold" style={{ marginBottom: '8px' }}>⭐ {t('reviews')}</span>
              <h2 style={{ fontSize: '28px', fontWeight: 900 }}>{isRtl ? "آراء عملائنا الأوفياء" : "Trusted by Players & Fans"}</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '6px' }}>
                {isRtl ? "تقييمات حقيقية من عشاق كرة القدم بعد استلام طلباتهم." : "Real verified reviews and ratings from our passionate community."}
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
              {reviews.map((rev) => (
                <div key={rev.id} className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'flex', gap: '2px' }}>
                    {[...Array(rev.rating || 5)].map((_, i) => (
                      <Star key={i} size={15} fill="#FFB800" color="#FFB800" />
                    ))}
                  </div>
                  <p style={{ fontStyle: 'italic', fontSize: '14px', color: 'var(--text-primary)', lineHeight: 1.6 }}>
                    "{rev.comment}"
                  </p>
                  <div style={{ marginTop: 'auto', paddingTop: '12px', borderTop: '1px solid var(--border-subtle)', fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 600 }}>
                    {rev.customer_name || rev.email || "Verified Customer"}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default HomePage;
