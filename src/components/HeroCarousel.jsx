import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function HeroCarousel({ slides = [], loading = false }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [videoReady, setVideoReady] = useState(false);
  const videoRefs = useRef({});

  const validSlides = Array.isArray(slides)
    ? slides.filter((s) => s && s.is_active !== false && (s.media_path || s.title))
    : [];
  const currentSlide = validSlides[currentIndex] || validSlides[0] || null;

  // Reset video ready state on slide switch
  useEffect(() => {
    setVideoReady(false);
  }, [currentSlide?.media_path]);

  // Auto-rotation if multiple slides exist
  useEffect(() => {
    if (validSlides.length <= 1 || !currentSlide) return;

    const duration = Math.max(3, currentSlide.duration_seconds || 6) * 1000;
    const timer = setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % validSlides.length);
    }, duration);

    return () => clearTimeout(timer);
  }, [currentIndex, validSlides.length, currentSlide?.duration_seconds]);

  // Preload all hero slide images for instantaneous switching
  useEffect(() => {
    validSlides.forEach((s) => {
      if (s?.media_path && s?.media_type !== 'video') {
        const img = new Image();
        img.src = s.media_path;
      }
    });
  }, [validSlides]);

  const handlePrev = (e) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + validSlides.length) % validSlides.length);
  };

  const handleNext = (e) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % validSlides.length);
  };

  // 1. Loading State: Subtle ambient canvas without layout shift or fake promotional banners
  if (loading && validSlides.length === 0) {
    return (
      <section className="ks-hero-root ks-hero-loading" aria-label="Hero Loading">
        <div className="ks-hero-container">
          <div className="ks-hero-ambient-canvas" />
        </div>
      </section>
    );
  }

  // 2. If no Admin slides configured in database, hide or show minimal neutral frame
  if (!loading && (!currentSlide || validSlides.length === 0)) {
    return null;
  }

  // Real button routes & labels from Admin config
  const primaryRoute = currentSlide.primary_button_route || '/products';
  const primaryLabel = currentSlide.primary_button_text || 'Shop Now';
  const secondaryRoute = (currentSlide.secondary_button_route === '/contact_us')
    ? '/contact'
    : (currentSlide.secondary_button_route || '/contact');
  const secondaryLabel = currentSlide.secondary_button_text || 'Contact Us';

  return (
    <section className="ks-hero-root" aria-label="Hero Showcase">
      <div className="ks-hero-container">
        {/* Media Background (Image / Video) */}
        <div className="ks-hero-media-wrapper">
          {currentSlide.media_type === 'video' && currentSlide.media_path ? (
            <div className="ks-hero-video-container" style={{ position: 'relative', width: '100%', height: '100%' }}>
              {/* Fallback image or ambient canvas shown while video buffers to avoid native browser play icon flash */}
              {(!videoReady && currentSlide.fallback_image_path) && (
                <img
                  src={currentSlide.fallback_image_path}
                  alt={currentSlide.title || 'Hero'}
                  className="ks-hero-media ks-hero-image"
                  style={{ position: 'absolute', inset: 0, zIndex: 1 }}
                />
              )}
              <video
                ref={(el) => {
                  if (currentSlide.id) videoRefs.current[currentSlide.id] = el;
                }}
                key={currentSlide.media_path}
                src={currentSlide.media_path}
                poster={currentSlide.fallback_image_path || undefined}
                autoPlay
                muted
                loop
                playsInline
                webkit-playsinline="true"
                x5-playsinline="true"
                controls={false}
                disablePictureInPicture
                disableRemotePlayback
                preload="auto"
                onLoadedData={() => setVideoReady(true)}
                onPlaying={() => setVideoReady(true)}
                onCanPlay={() => setVideoReady(true)}
                className="ks-hero-media ks-hero-video"
                style={{
                  opacity: videoReady ? 1 : 0,
                  transition: 'opacity 0.4s ease',
                  position: 'relative',
                  zIndex: 2
                }}
              />
            </div>
          ) : currentSlide.media_path ? (
            <img
              src={currentSlide.media_path}
              alt={currentSlide.title || 'Hero Banner'}
              fetchPriority="high"
              decoding="async"
              className="ks-hero-media ks-hero-image"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          ) : (
            <div className="ks-hero-ambient-canvas" />
          )}

          {/* Cinematic Overlay for Readability */}
          <div className="ks-hero-overlay" />
        </div>

        {/* Dynamic Admin-Configured Content */}
        <div className="ks-hero-content-group">
          {currentSlide.title && (
            <h1 className="ks-hero-title">
              {currentSlide.title}
            </h1>
          )}

          {currentSlide.subtitle && (
            <p className="ks-hero-subtitle">
              {currentSlide.subtitle}
            </p>
          )}

          {/* Hero CTAs: Strictly Side by Side, Never Stacking */}
          <div className="ks-hero-actions" style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: '12px', flexWrap: 'nowrap' }}>
            <Link to={primaryRoute} className="ks-hero-btn-primary">
              <span>{primaryLabel}</span>
            </Link>

            <Link to={secondaryRoute} className="ks-hero-btn-secondary">
              <span>{secondaryLabel}</span>
            </Link>
          </div>
        </div>

        {/* Carousel Arrow Controls (Visible only when multiple slides exist) */}
        {validSlides.length > 1 && (
          <div className="ks-hero-arrows">
            <button
              type="button"
              onClick={handlePrev}
              className="ks-hero-arrow-btn ks-hero-arrow-prev"
              aria-label="Previous slide"
            >
              <ChevronLeft size={24} />
            </button>
            <button
              type="button"
              onClick={handleNext}
              className="ks-hero-arrow-btn ks-hero-arrow-next"
              aria-label="Next slide"
            >
              <ChevronRight size={24} />
            </button>
          </div>
        )}

        {/* Carousel Slide Indicators */}
        {validSlides.length > 1 && (
          <div className="ks-hero-indicators" role="tablist" aria-label="Hero Slides">
            {validSlides.map((slide, idx) => (
              <button
                key={slide.id || idx}
                type="button"
                className={`ks-hero-indicator-dot ${idx === currentIndex ? 'is-active' : ''}`}
                onClick={() => setCurrentIndex(idx)}
                aria-label={`Go to slide ${idx + 1}`}
                aria-selected={idx === currentIndex}
                role="tab"
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
