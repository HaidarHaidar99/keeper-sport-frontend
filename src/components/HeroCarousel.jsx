import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';

export default function HeroCarousel({ slides = [] }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const videoRefs = useRef({});

  // Fallback slide if no slides exist in the database yet
  const fallbackSlide = {
    id: 'fallback-hero',
    title: 'AUTHENTIC PERFORMANCE GEAR',
    subtitle: 'Official club and national team kits, training apparel, and custom kit printing engineered for players and supporters.',
    media_type: 'image',
    media_path: null,
    primary_button_text: 'EXPLORE PRODUCTS',
    primary_button_route: '/products',
    secondary_button_text: 'ALL CATEGORIES',
    secondary_button_route: '/categories'
  };

  const activeSlides = slides && slides.length > 0 ? slides : [fallbackSlide];
  const currentSlide = activeSlides[currentIndex] || activeSlides[0];

  // Auto rotation if multiple slides
  useEffect(() => {
    if (activeSlides.length <= 1) return;

    const duration = (currentSlide.duration_seconds || 6) * 1000;
    const timer = setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % activeSlides.length);
    }, duration);

    return () => clearTimeout(timer);
  }, [currentIndex, activeSlides, currentSlide]);

  return (
    <section className="ks-hero-root" aria-label="Hero Showcase">
      <div className="ks-hero-container">
        {/* Media Background */}
        <div className="ks-hero-media-wrapper">
          {currentSlide.media_type === 'video' && currentSlide.media_path ? (
            <video
              ref={(el) => {
                videoRefs.current[currentSlide.id] = el;
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
          ) : currentSlide.media_path ? (
            <img
              src={currentSlide.media_path}
              alt={currentSlide.title || 'Keeper Sports Hero'}
              className="ks-hero-media ks-hero-image"
              onError={(e) => {
                // If media path fails, hide and show pattern
                e.target.style.display = 'none';
              }}
            />
          ) : (
            // Subtle geometric ambient grid background for fallback state
            <div className="ks-hero-ambient-canvas" />
          )}

          {/* Readability Overlay (Subtle gradient overlay) */}
          <div className="ks-hero-overlay" />
        </div>

        {/* Content Group (Visual Middle Region) */}
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
          {(currentSlide.primary_button_text || currentSlide.secondary_button_text) && (
            <div className="ks-hero-actions">
              {currentSlide.primary_button_text && (
                <Link
                  to={currentSlide.primary_button_route || '/products'}
                  className="ks-hero-btn-primary"
                >
                  {currentSlide.primary_button_text}
                </Link>
              )}

              {currentSlide.secondary_button_text && (
                <Link
                  to={currentSlide.secondary_button_route || '/categories'}
                  className="ks-hero-btn-secondary"
                >
                  {currentSlide.secondary_button_text}
                </Link>
              )}
            </div>
          )}
        </div>

        {/* Slide Indicators (Visible only if multiple slides exist) */}
        {activeSlides.length > 1 && (
          <div className="ks-hero-indicators" role="tablist" aria-label="Hero Slides">
            {activeSlides.map((slide, idx) => (
              <button
                key={slide.id || idx}
                type="button"
                role="tab"
                aria-selected={idx === currentIndex}
                aria-label={`Go to slide ${idx + 1}`}
                className={`ks-hero-indicator-dot ${idx === currentIndex ? 'is-active' : ''}`}
                onClick={() => setCurrentIndex(idx)}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
