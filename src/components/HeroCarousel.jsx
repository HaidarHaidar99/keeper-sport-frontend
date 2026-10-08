import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';

export default function HeroCarousel({ slides = [], loading = false }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const videoRefs = useRef({});

  const validSlides = Array.isArray(slides)
    ? slides.filter((s) => s && (s.media_path || s.title))
    : [];
  const currentSlide = validSlides[currentIndex] || validSlides[0] || {};

  // Auto rotation if multiple slides
  useEffect(() => {
    if (validSlides.length <= 1) return;

    const duration = Math.max(3, currentSlide?.duration_seconds || 6) * 1000;
    const timer = setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % validSlides.length);
    }, duration);

    return () => clearTimeout(timer);
  }, [currentIndex, validSlides.length, currentSlide?.duration_seconds]);

  const handlePrev = (e) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + validSlides.length) % validSlides.length);
  };

  const handleNext = (e) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % validSlides.length);
  };

  // 1. Loading State: Neutral ambient container without any promotional text or fake content
  if (loading && validSlides.length === 0) {
    return (
      <section className="ks-hero-root ks-hero-loading" aria-label="Hero Loading">
        <div className="ks-hero-container">
          <div className="ks-hero-ambient-canvas" />
          <div className="ks-hero-overlay" />
        </div>
      </section>
    );
  }

  // 2. Intentional Minimal Empty State when Admin has no slides configured (NO hardcoded Antigravity card)
  if (!loading && validSlides.length === 0) {
    return (
      <section className="ks-hero-root ks-hero-empty" aria-label="Hero Showcase">
        <div className="ks-hero-container">
          <div className="ks-hero-ambient-canvas" />
          <div className="ks-hero-overlay" />
          <div className="ks-hero-content-group">
            <h1 className="ks-hero-title">KEEPER SPORTS</h1>
            <p className="ks-hero-subtitle">Authentic Football Kits &amp; Performance Equipment</p>
            <div className="ks-hero-actions">
              <Link to="/products" className="ks-hero-btn-primary">
                <span>Shop Now</span>
                <ArrowRight size={16} />
              </Link>
              <Link to="/contact" className="ks-hero-btn-secondary">
                <span>Contact Us</span>
              </Link>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Resolve Real Button Routes & Labels
  const primaryRoute = currentSlide?.primary_button_route || '/products';
  const primaryLabel = currentSlide?.primary_button_text || 'Shop Now';
  const secondaryRoute = (currentSlide?.secondary_button_route === '/contact_us')
    ? '/contact'
    : (currentSlide?.secondary_button_route || '/contact');
  const secondaryLabel = currentSlide?.secondary_button_text || 'Contact Us';

  return (
    <section className="ks-hero-root" aria-label="Hero Showcase">
      <div className="ks-hero-container">
        {/* Media Background */}
        <div className="ks-hero-media-wrapper">
          {currentSlide?.media_type === 'video' && currentSlide?.media_path ? (
            <video
              ref={(el) => {
                if (currentSlide?.id) videoRefs.current[currentSlide.id] = el;
              }}
              key={currentSlide.media_path}
              src={currentSlide.media_path}
              poster={currentSlide.fallback_image_path || undefined}
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              className="ks-hero-media ks-hero-video"
            />
          ) : currentSlide?.media_path ? (
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
          {currentSlide?.title && (
            <h1 className="ks-hero-title">
              {currentSlide.title}
            </h1>
          )}

          {currentSlide?.subtitle && (
            <p className="ks-hero-subtitle">
              {currentSlide.subtitle}
            </p>
          )}

          {/* Side-by-Side Hero Actions */}
          <div className="ks-hero-actions">
            <Link to={primaryRoute} className="ks-hero-btn-primary">
              <span>{primaryLabel}</span>
              <ArrowRight size={16} />
            </Link>

            <Link to={secondaryRoute} className="ks-hero-btn-secondary">
              <span>{secondaryLabel}</span>
            </Link>
          </div>
        </div>

        {/* Carousel Arrow Controls (When multiple slides exist) */}
        {validSlides.length > 1 && (
          <div className="ks-hero-arrows">
            <button
              type="button"
              onClick={handlePrev}
              className="ks-hero-arrow-btn ks-hero-arrow-prev"
              aria-label="Previous slide"
            >
              <ChevronLeft size={22} />
            </button>
            <button
              type="button"
              onClick={handleNext}
              className="ks-hero-arrow-btn ks-hero-arrow-next"
              aria-label="Next slide"
            >
              <ChevronRight size={22} />
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
