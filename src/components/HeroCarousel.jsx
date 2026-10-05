import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';

export default function HeroCarousel({ slides = [] }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const videoRefs = useRef({});

  // Clean empty/fallback state when no slides are configured in the backend
  if (!slides || slides.length === 0) {
    return (
      <section className="ks-hero-root ks-hero-empty" aria-label="Hero Showcase">
        <div className="ks-hero-container">
          <div className="ks-hero-ambient-canvas" />
          <div className="ks-hero-overlay" />
          <div className="ks-hero-empty-content">
            <div className="ks-hero-empty-emblem" aria-hidden="true">
              <svg
                viewBox="0 0 60 60"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="ks-hero-empty-icon"
              >
                <path
                  d="M30 6L50 16.5V31.5C50 44.25 41.5 53.25 30 57C18.5 53.25 10 44.25 10 31.5V16.5L30 6Z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M30 19.5V40.5M19.5 30H40.5"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  opacity="0.4"
                />
              </svg>
            </div>
          </div>
        </div>
      </section>
    );
  }

  const currentSlide = slides[currentIndex] || slides[0];

  // Auto rotation if multiple slides
  useEffect(() => {
    if (slides.length <= 1) return;

    const duration = (currentSlide?.duration_seconds || 6) * 1000;
    const timer = setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    }, duration);

    return () => clearTimeout(timer);
  }, [currentIndex, slides, currentSlide]);

  return (
    <section className="ks-hero-root" aria-label="Hero Showcase">
      <div className="ks-hero-container">
        {/* Media Background */}
        <div className="ks-hero-media-wrapper">
          {currentSlide.media_type === 'video' && currentSlide.media_path ? (
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
              className="ks-hero-media ks-hero-video"
            />
          ) : currentSlide.media_path ? (
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

        {/* Dynamic Content Group (Only renders fields that actually exist) */}
        {(currentSlide.title ||
          currentSlide.subtitle ||
          (currentSlide.primary_button_text && currentSlide.primary_button_route) ||
          (currentSlide.secondary_button_text && currentSlide.secondary_button_route)) && (
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

            {/* Action Buttons (Only render if text and route exist) */}
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

        {/* Carousel Slide Indicators (Only if multiple slides) */}
        {slides.length > 1 && (
          <div className="ks-hero-indicators" role="tablist" aria-label="Hero Slides">
            {slides.map((slide, idx) => (
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
