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
  MessageCircle,
  Clock,
  ChevronRight,
  ChevronLeft
} from 'lucide-react';
import ProductCard from '../components/common/ProductCard';
import apiClient from '../services/apiClient';
import { useLanguage } from '../context/LanguageContext';

const defaultHeroSlides = [
  {
    title_en: "OFFICIAL 2026/27 MATCHDAY KITS",
    title_ar: "أطقم موسم 2026/27 الرسمية للمباريات",
    subtitle_en: "Authentic player version and fan edition football shirts straight from the world's top clubs.",
    subtitle_ar: "قمصان اللاعبين والجمهور الأصلية مباشرة من كبرى أندية ومنتخبات العالم.",
    cta_text_en: "Shop Football Shirts",
    cta_text_ar: "تسوق القمصان الآن",
    cta_link: "/products",
    badge_en: "OFFICIAL MATCH GEAR",
    badge_ar: "أطقم رسمية أصلية",
    image_url: "https://images.unsplash.com/photo-1518091043644-c1d4457512c6?auto=format&fit=crop&w=1600&q=80"
  },
  {
    title_en: "BESPOKE TEAM KIT DESIGNER",
    title_ar: "صمم طقم فريقك المفضل بتقنية 2D",
    subtitle_en: "Official club artwork, authentic player typography, and licensed sleeve badges in our 2D studio.",
    subtitle_ar: "أطقم أندية حقيقية، خطوط رسمية، وشارات أكمام مطابقة للأصل مباشرة عبر متصفحك.",
    cta_text_en: "Launch Kit Designer",
    cta_text_ar: "ابدأ التصميم الآن",
    cta_link: "/custom-kit",
    badge_en: "2D INTERACTIVE STUDIO",
    badge_ar: "مختبر التصميم التفاعلي",
    image_url: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=1600&q=80"
  }
];

const HomePage = () => {
  const { t, language, isRtl } = useLanguage();

  const [heroSlides, setHeroSlides] = useState(defaultHeroSlides);
  const [heroIndex, setHeroIndex] = useState(0);

  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [newProducts, setNewProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [offers, setOffers] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  // Local Countdown state for Timed Offers (Local timer ONLY, NO API polling)
  const [countdown, setCountdown] = useState({ days: 2, hours: 14, minutes: 35, seconds: 20 });

  // Fetch initial content once on mount
  useEffect(() => {
    let isMounted = true;

    const fetchHomeData = async () => {
      try {
        setLoading(true);
        const [slidesRes, featRes, newRes, catRes, offerRes, revRes] = await Promise.all([
          apiClient('/content/hero-slides').catch(() => null),
          apiClient('/products?is_featured=true&limit=4').catch(() => null),
          apiClient('/products?sort=newest&limit=4').catch(() => null),
          apiClient('/categories').catch(() => null),
          apiClient('/content/offers').catch(() => null),
          apiClient('/reviews?limit=3').catch(() => null)
        ]);

        if (!isMounted) return;

        if (slidesRes?.data && Array.isArray(slidesRes.data) && slidesRes.data.length > 0) {
          setHeroSlides(slidesRes.data.slice(0, 3));
        }
        if (featRes?.data) setFeaturedProducts(featRes.data);
        if (newRes?.data) setNewProducts(newRes.data);
        if (catRes?.data) setCategories(catRes.data);
        if (offerRes?.data && Array.isArray(offerRes.data)) setOffers(offerRes.data);
        if (revRes?.data) setReviews(revRes.data);
      } catch (err) {
        console.warn("Failed to load some home content:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchHomeData();
    return () => { isMounted = false; };
  }, []);

  // Hero carousel 5-second automatic rotation (pure frontend local state, NO DB refetching)
  useEffect(() => {
    if (heroSlides.length <= 1) return;

    const interval = setInterval(() => {
      setHeroIndex((prev) => (prev + 1) % heroSlides.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [heroSlides.length]);

  // Timed Offer local countdown timer (ticks locally each second, ZERO network requests)
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        } else if (prev.days > 0) {
          return { ...prev, days: prev.days - 1, hours: 23, minutes: 59, seconds: 59 };
        }
        return prev;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const currentSlide = heroSlides[heroIndex] || defaultHeroSlides[0];
  const slideTitle = language === 'ar' ? (currentSlide.title_ar || currentSlide.title_en) : currentSlide.title_en;
  const slideSubtitle = language === 'ar' ? (currentSlide.subtitle_ar || currentSlide.subtitle_en) : currentSlide.subtitle_en;
  const slideCta = language === 'ar' ? (currentSlide.cta_text_ar || currentSlide.cta_text_en || "تسوق الآن") : (currentSlide.cta_text_en || "Shop Now");
  const slideBadge = language === 'ar' ? (currentSlide.badge_ar || "منتج رسمي أصلي") : (currentSlide.badge_en || "OFFICIAL GEAR");

  return (
    <div>
      {/* ── 3. Hero Carousel (Auto-rotating every 5 seconds, NO arrows, client local state) ── */}
      <section style={{
        position: 'relative',
        minHeight: '520px',
        backgroundColor: 'var(--bg-surface)',
        display: 'flex',
        alignItems: 'center',
        overflow: 'hidden',
        borderBottom: '1px solid var(--border-subtle)'
      }}>
        {/* Hero Background Image with Darkness Gradient Overlay */}
        <div style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `linear-gradient(to right, rgba(10, 13, 20, 0.94) 0%, rgba(10, 13, 20, 0.8) 50%, rgba(10, 13, 20, 0.6) 100%), url(${currentSlide.image_url || defaultHeroSlides[0].image_url})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          transition: 'background-image 0.6s ease-in-out'
        }} />

        <div className="container" style={{ position: 'relative', zIndex: 2, padding: '70px 20px' }}>
          <div style={{ maxWidth: '640px', textAlign: 'start' }}>
            {/* Athletic Pill Tag */}
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 12px',
              borderRadius: 'var(--radius-xs)',
              backgroundColor: 'var(--brand-red-light)',
              border: '1px solid rgba(208, 0, 0, 0.3)',
              color: 'var(--brand-red)',
              fontSize: '12px',
              fontWeight: 800,
              letterSpacing: '1px',
              marginBottom: '18px'
            }}>
              <Sparkles size={14} />
              <span>{slideBadge}</span>
            </div>

            {/* Headline */}
            <h1 style={{
              fontSize: 'clamp(32px, 5.2vw, 54px)',
              fontWeight: 900,
              lineHeight: 1.12,
              marginBottom: '18px',
              color: '#FFFFFF',
              letterSpacing: '-0.5px'
            }}>
              {slideTitle}
            </h1>

            {/* Subtitle */}
            <p style={{
              fontSize: '16px',
              color: '#CBD5E1',
              lineHeight: 1.6,
              marginBottom: '32px',
              maxWidth: '520px'
            }}>
              {slideSubtitle}
            </p>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
              <Link to={currentSlide.cta_link || "/products"} className="btn btn-primary btn-lg">
                <span>{slideCta}</span>
                {isRtl ? <ArrowLeft size={18} /> : <ArrowRight size={18} />}
              </Link>
              <Link to="/custom-kit" className="btn btn-secondary btn-lg">
                <Shirt size={18} color="var(--brand-red)" />
                <span>{t('customKit')}</span>
              </Link>
            </div>
          </div>

          {/* Slide Indicator Bar (NO arrows per Section 7) */}
          {heroSlides.length > 1 && (
            <div style={{
              position: 'absolute',
              bottom: '24px',
              insetInlineStart: '20px',
              display: 'flex',
              gap: '8px',
              zIndex: 3
            }}>
              {heroSlides.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setHeroIndex(idx)}
                  aria-label={`Slide ${idx + 1}`}
                  style={{
                    width: idx === heroIndex ? '32px' : '10px',
                    height: '6px',
                    borderRadius: 'var(--radius-full)',
                    backgroundColor: idx === heroIndex ? 'var(--brand-red)' : 'rgba(255, 255, 255, 0.3)',
                    transition: 'all var(--transition-fast)'
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── 4. Featured Products ── */}
      <section style={{ padding: '60px 0' }}>
        <div className="container">
          <div className="section-header">
            <div>
              <span className="badge badge-red" style={{ marginBottom: '8px' }}>
                {t('featured')}
              </span>
              <h2 className="section-title">{t('featuredCollection')}</h2>
              <p className="section-subtitle">{t('featuredSubtitle')}</p>
            </div>
            <Link to="/products?is_featured=true" className="btn btn-secondary btn-sm">
              <span>{t('viewAllProducts')}</span>
              {isRtl ? <ArrowLeft size={15} /> : <ArrowRight size={15} />}
            </Link>
          </div>

          <div className="grid-products">
            {featuredProducts.slice(0, 4).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* ── 5. Categories Showcase ── */}
      <section style={{ padding: '40px 0 60px', backgroundColor: 'var(--bg-surface)' }}>
        <div className="container">
          <div className="section-header">
            <div>
              <h2 className="section-title">{t('shopByCategory')}</h2>
              <p className="section-subtitle">{t('shopByCategorySubtitle')}</p>
            </div>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '16px'
          }}>
            {categories.map((cat) => {
              const catName = language === 'ar' ? (cat.name_ar || cat.name_en) : cat.name_en;
              return (
                <Link
                  key={cat.id}
                  to={`/products?category=${cat.id}`}
                  className="card card-clickable"
                  style={{
                    padding: '24px 20px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                    minHeight: '130px',
                    backgroundColor: 'var(--bg-card)'
                  }}
                >
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: 'var(--brand-red-light)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '16px',
                    color: 'var(--brand-red)'
                  }}>
                    <Shirt size={22} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '4px' }}>
                      {catName}
                    </h3>
                    <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 600 }}>
                      {isRtl ? "تصفح التشكيلة" : "Explore gear"} →
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── 6. Offers / Sales Section with Local Countdown (NO DB polling) ── */}
      <section style={{ padding: '60px 0' }}>
        <div className="container">
          <div style={{
            borderRadius: 'var(--radius-lg)',
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-medium)',
            padding: '40px',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '32px',
            alignItems: 'center'
          }}>
            <div style={{ textAlign: 'start' }}>
              <span className="badge badge-sale" style={{ marginBottom: '12px' }}>
                <Flame size={13} />
                <span>{t('sale')}</span>
              </span>
              <h2 style={{ fontSize: '28px', fontWeight: 900, marginBottom: '10px', color: 'var(--text-primary)' }}>
                {t('exclusiveOffers')}
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '15px', marginBottom: '24px', lineHeight: 1.6 }}>
                {t('exclusiveOffersSubtitle')}
              </p>

              {/* Local Real-Time Countdown */}
              <div style={{ marginBottom: '24px' }}>
                <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '8px' }}>
                  {t('offerEndsIn')}:
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {[
                    { label: t('days'), val: countdown.days },
                    { label: t('hours'), val: countdown.hours },
                    { label: t('minutes'), val: countdown.minutes },
                    { label: t('seconds'), val: countdown.seconds }
                  ].map((unit, idx) => (
                    <div 
                      key={idx}
                      style={{
                        backgroundColor: 'var(--bg-input)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: 'var(--radius-sm)',
                        padding: '8px 12px',
                        minWidth: '55px',
                        textAlign: 'center'
                      }}
                    >
                      <div style={{ fontSize: '20px', fontWeight: 900, color: 'var(--brand-red)' }}>
                        {String(unit.val).padStart(2, '0')}
                      </div>
                      <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 700 }}>
                        {unit.label}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <Link to="/products?on_sale=true" className="btn btn-primary">
                <span>{isRtl ? "تسوق العروض الآن" : "Shop All Offers"}</span>
                {isRtl ? <ArrowLeft size={16} /> : <ArrowRight size={16} />}
              </Link>
            </div>

            {/* Offer Spotlight Gear */}
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <div style={{
                maxWidth: '320px',
                width: '100%',
                backgroundColor: 'var(--bg-card)',
                borderRadius: 'var(--radius-md)',
                padding: '20px',
                border: '1px solid var(--border-medium)',
                boxShadow: 'var(--shadow-md)',
                textAlign: 'center'
              }}>
                <span className="badge badge-sale" style={{ marginBottom: '12px' }}>
                  SAVE $20.00
                </span>
                <div style={{
                  height: '180px',
                  backgroundColor: 'var(--bg-input)',
                  borderRadius: 'var(--radius-sm)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '14px',
                  overflow: 'hidden'
                }}>
                  <Shirt size={64} color="var(--brand-red)" strokeWidth={1.5} />
                </div>
                <h4 style={{ fontSize: '16px', fontWeight: 800, marginBottom: '6px' }}>
                  {isRtl ? "طقم النادي الرسمي للموسم الجديد" : "Season Kickoff Pro Match Kit"}
                </h4>
                <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: '8px', marginBottom: '14px' }}>
                  <span style={{ fontSize: '22px', fontWeight: 900, color: 'var(--brand-red)' }}>$65.00</span>
                  <span style={{ fontSize: '14px', textDecoration: 'line-through', color: 'var(--text-muted)' }}>$85.00</span>
                </div>
                <Link to="/products?on_sale=true" className="btn btn-secondary btn-sm" style={{ width: '100%' }}>
                  {t('quickView')}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 7. New Products (Latest Pitch Releases) ── */}
      <section style={{ padding: '60px 0', backgroundColor: 'var(--bg-surface)' }}>
        <div className="container">
          <div className="section-header">
            <div>
              <span className="badge badge-gold" style={{ marginBottom: '8px' }}>
                2026/27 RELEASES
              </span>
              <h2 className="section-title">{t('newArrivals')}</h2>
              <p className="section-subtitle">{t('newArrivalsSubtitle')}</p>
            </div>
            <Link to="/products?sort=newest" className="btn btn-secondary btn-sm">
              <span>{t('viewAllProducts')}</span>
              {isRtl ? <ArrowLeft size={15} /> : <ArrowRight size={15} />}
            </Link>
          </div>

          <div className="grid-products">
            {newProducts.slice(0, 4).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* ── 8. Reviews Highlight ── */}
      <section style={{ padding: '60px 0' }}>
        <div className="container">
          <div className="section-header">
            <div>
              <h2 className="section-title">{t('customerReviews')}</h2>
              <p className="section-subtitle">{t('customerReviewsSubtitle')}</p>
            </div>
            <Link to="/reviews" className="btn btn-secondary btn-sm">
              <span>{isRtl ? "جميع التقييمات" : "View All Reviews"}</span>
              {isRtl ? <ArrowLeft size={15} /> : <ArrowRight size={15} />}
            </Link>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '20px'
          }}>
            {reviews.slice(0, 3).map((review) => (
              <div 
                key={review.id} 
                className="card" 
                style={{ padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', textAlign: 'start' }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '3px', marginBottom: '10px' }}>
                    {[...Array(review.rating || 5)].map((_, i) => (
                      <Star key={i} size={14} fill="var(--brand-gold)" color="var(--brand-gold)" />
                    ))}
                  </div>
                  <h4 style={{ fontSize: '15px', fontWeight: 800, marginBottom: '6px', color: 'var(--text-primary)' }}>
                    {review.title}
                  </h4>
                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '14px' }}>
                    "{review.description || review.comment}"
                  </p>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', paddingTop: '12px', borderTop: '1px solid var(--border-subtle)' }}>
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: 'var(--radius-full)',
                    backgroundColor: 'var(--brand-red-light)',
                    color: 'var(--brand-red)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '12px',
                    fontWeight: 900
                  }}>
                    {(review.customer_name || 'K')[0]}
                  </div>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {review.customer_name || "Verified Footballer"}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--brand-green)', fontWeight: 600 }}>
                      ✓ Verified Pitch Buyer
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 9. About / Story Section ── */}
      <section style={{ padding: '60px 0', backgroundColor: 'var(--bg-surface)' }}>
        <div className="container">
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '40px',
            alignItems: 'center'
          }}>
            <div style={{ textAlign: 'start' }}>
              <span className="badge badge-red" style={{ marginBottom: '10px' }}>
                AUTHENTICITY & HERITAGE
              </span>
              <h2 style={{ fontSize: '32px', fontWeight: 900, marginBottom: '16px', color: 'var(--text-primary)', lineHeight: 1.2 }}>
                {t('ourStoryTitle')}
              </h2>
              <p style={{ fontSize: '15px', color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: '24px' }}>
                {t('ourStoryText')}
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                  <ShieldCheck size={20} color="var(--brand-red)" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <div>
                    <h4 style={{ fontSize: '14px', fontWeight: 800 }}>100% Guaranteed</h4>
                    <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Official club & match version standards</p>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                  <RefreshCw size={20} color="var(--brand-red)" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <div>
                    <h4 style={{ fontSize: '14px', fontWeight: 800 }}>Exchanges Only</h4>
                    <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Guaranteed size replacement policy</p>
                  </div>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <div style={{
                width: '100%',
                maxWidth: '420px',
                height: '280px',
                borderRadius: 'var(--radius-lg)',
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--border-medium)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                overflow: 'hidden'
              }}>
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  backgroundImage: 'url(https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=800&q=80)',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  opacity: 0.65
                }} />
                <div style={{ position: 'relative', zIndex: 2, textAlign: 'center', padding: '20px' }}>
                  <Shirt size={48} color="#FFFFFF" style={{ margin: '0 auto 12px' }} />
                  <h3 style={{ fontSize: '20px', fontWeight: 900, color: '#FFFFFF' }}>KEEPER SPORTS</h3>
                  <p style={{ fontSize: '13px', color: '#CBD5E1', fontWeight: 600 }}>{t('tagline')}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 10. Social Links Showcase ── */}
      <section style={{ padding: '50px 0' }}>
        <div className="container">
          <div style={{ textAlign: 'center', maxWidth: '600px', margin: '0 auto 32px' }}>
            <h2 style={{ fontSize: '26px', fontWeight: 900, marginBottom: '8px' }}>
              {isRtl ? "تابعنا على منصات التواصل" : "Join Our Football Community"}
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
              {isRtl ? "شاهد أحدث وصول الأطقم وتدريبات اللاعبين عبر منصاتنا الرسمية." : "Follow our official channels for new kit drops, pitch training, and player spotlights."}
            </p>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
            <a 
              href="https://instagram.com" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="card card-clickable" 
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '14px 24px',
                borderRadius: 'var(--radius-sm)'
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--brand-red)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
              </svg>
              <span style={{ fontWeight: 800, fontSize: '14px' }}>Instagram</span>
            </a>

            <a 
              href="https://facebook.com" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="card card-clickable" 
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '14px 24px',
                borderRadius: 'var(--radius-sm)'
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--brand-red)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
              </svg>
              <span style={{ fontWeight: 800, fontSize: '14px' }}>Facebook</span>
            </a>

            <a 
              href="https://tiktok.com" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="card card-clickable" 
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '14px 24px',
                borderRadius: 'var(--radius-sm)'
              }}
            >
              <span style={{ fontWeight: 900, color: 'var(--brand-red)' }}>TT</span>
              <span style={{ fontWeight: 800, fontSize: '14px' }}>TikTok</span>
            </a>
          </div>
        </div>
      </section>

      {/* ── 11. WhatsApp / Direct Contact CTA Banner ── */}
      <section style={{ padding: '30px 0 60px' }}>
        <div className="container">
          <div style={{
            borderRadius: 'var(--radius-lg)',
            backgroundColor: 'var(--bg-surface)',
            border: '1.5px solid var(--border-medium)',
            padding: '36px 30px',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '24px'
          }}>
            <div style={{ maxWidth: '600px', textAlign: 'start' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <MessageCircle size={22} color="var(--brand-green)" />
                <h3 style={{ fontSize: '20px', fontWeight: 900, color: 'var(--text-primary)' }}>
                  {t('whatsAppCtaTitle')}
                </h3>
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: 1.5 }}>
                {t('whatsAppCtaSubtitle')}
              </p>
            </div>

            <a 
              href="https://wa.me/96170000000?text=Hello%20Keeper%20Sports,%20I%20would%20like%20to%20place%20an%20order" 
              target="_blank" 
              rel="noopener noreferrer"
              className="btn btn-lg"
              style={{
                backgroundColor: 'var(--brand-green)',
                color: '#FFFFFF',
                fontWeight: 800,
                borderRadius: 'var(--radius-sm)',
                gap: '8px'
              }}
            >
              <MessageCircle size={20} />
              <span>{t('chatOnWhatsApp')}</span>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
