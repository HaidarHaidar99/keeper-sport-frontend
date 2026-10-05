import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Shield, ArrowRight } from 'lucide-react';

export default function HeroCarousel({ slides = [] }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const videoRefs = useRef({});

  const validSlides = Array.isArray(slides) ? slides.filter((s) => s && (s.media_path || s.title)) : [];
  const currentSlide = validSlides[currentIndex] || validSlides[0] || {};

  // Auto rotation if multiple slides - hooks MUST always be called unconditionally at top of component
  useEffect(() => {
    if (validSlides.length <= 1) return;

    const duration = Math.max(2, currentSlide?.duration_seconds || 6) * 1000;
    const timer = setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % validSlides.length);
    }, duration);

    return () => clearTimeout(timer);
  }, [currentIndex, validSlides.length, currentSlide?.duration_seconds]);

  // Default rich showcase when no slides are configured in the database
  if (validSlides.length === 0) {
    return (
      <section className="ks-hero-root ks-hero-fallback-active" aria-label="Hero Showcase">
        <div className="ks-hero-container">
          <div className="ks-hero-ambient-canvas" />
          <div className="ks-hero-fallback-card">
            <div className="ks-hero-badge-pill">
              <Shield size={14} className="ks-hero-badge-icon" />
              <span>KEEPER SPORTS • OFFICIAL STORE</span>
            </div>
            <h1 className="ks-hero-title">
              PRO GOALKEEPER GEAR &amp; APPAREL
            </h1>
            <p className="ks-hero-subtitle">
              Engineered for matchday dominance. Explore professional goalkeeper gloves, match kits, boots, and training essentials.
            </p>
            <div className="ks-hero-actions">
              <Link to="/products" className="ks-hero-btn-primary">
                <span>EXPLORE PRODUCTS</span>
                <ArrowRight size={16} />
              </Link>
              <Link to="/products?on_sale=true" className="ks-hero-btn-secondary">
                <span>VIEW OFFERS</span>
              </Link>
            </div>
          </div>
        </div>
      </section>
    );
  }

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
              className="ks-hero-media ks-hero-video"
            />
          ) : currentSlide?.media_path ? (
            <img
              src={currentSlide.media_path}
              alt={currentSlide.title || 'Hero Banner'}
              className="ks-hero-media ks-hero-image"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          ) : (
            <div className="ks-hero-ambient-canvas" />
          )}

          {/* Readability Overlay */}
          <div className="ks-hero-overlay" />
        </div>

        {/* Dynamic Content Group */}
        {(currentSlide?.title ||
          currentSlide?.subtitle ||
          (currentSlide?.primary_button_text && currentSlide?.primary_button_route) ||
          (currentSlide?.secondary_button_text && currentSlide?.secondary_button_route)) && (
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

            {/* Action Buttons */}
            {((currentSlide.primary_button_text && currentSlide.primary_button_route) ||
              (currentSlide.secondary_button_text && currentSlide.secondary_button_route)) && (
              <div className="ks-hero-actions">
                {currentSlide.primary_button_text && currentSlide.primary_button_route && (
                  <Link
                    to={currentSlide.primary_button_route}
                    className="ks-hero-btn-primary"
                  >
                    {currentSlide.primary_button_text}
                  </Link>
                )}

                {currentSlide.secondary_button_text && currentSlide.secondary_button_route && (
                  <Link
                    to={currentSlide.secondary_button_route}
                    className="ks-hero-btn-secondary"
                  >
                    {currentSlide.secondary_button_text}
                  </Link>
                )}
              </div>
            )}
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
