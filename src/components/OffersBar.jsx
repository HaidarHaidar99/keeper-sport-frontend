import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function OffersBar({ offers = [] }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const contentRef = useRef(null);
  const textRef = useRef(null);

  const [isOverflowing, setIsOverflowing] = useState(false);
  const [scrollDistance, setScrollDistance] = useState(0);
  const [effectiveDurationSec, setEffectiveDurationSec] = useState(5);

  const validOffers = Array.isArray(offers) ? offers.filter((o) => o && o.text) : [];
  const currentOffer = validOffers[currentIndex] || validOffers[0] || null;

  // Measure text width vs container width to detect long announcements
  useEffect(() => {
    if (!contentRef.current || !textRef.current || !currentOffer) {
      setIsOverflowing(false);
      setScrollDistance(0);
      setEffectiveDurationSec(currentOffer?.duration_seconds || 5);
      return;
    }

    // Force layout measurement
    const containerWidth = contentRef.current.clientWidth;
    const textWidth = textRef.current.scrollWidth;

    if (textWidth > containerWidth + 6) {
      const diff = textWidth - containerWidth + 24; // extra buffer so last letters are fully visible
      setIsOverflowing(true);
      setScrollDistance(diff);

      // Smooth reading speed: ~38px per second + 1.6s pause at start + 1.5s pause at end
      const moveDuration = Math.max(3.5, diff / 38);
      const totalDuration = Number((1.6 + moveDuration + 1.5).toFixed(1));
      setEffectiveDurationSec(totalDuration);
    } else {
      setIsOverflowing(false);
      setScrollDistance(0);
      setEffectiveDurationSec(currentOffer?.duration_seconds || 5);
    }
  }, [currentIndex, currentOffer?.text]);

  // Auto rotation: Wait for text to move to the end before switching to next announcement
  useEffect(() => {
    if (validOffers.length <= 1 || !currentOffer) return;

    const timerMs = effectiveDurationSec * 1000;
    const timer = setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % validOffers.length);
    }, timerMs);

    return () => clearTimeout(timer);
  }, [currentIndex, validOffers.length, effectiveDurationSec]);

  // If no offers in database, hide bar completely without leaving empty gap
  if (validOffers.length === 0 || !currentOffer) {
    return null;
  }

  const handlePrev = (e) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + validOffers.length) % validOffers.length);
  };

  const handleNext = (e) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % validOffers.length);
  };

  const offerContent = currentOffer.route ? (
    <Link to={currentOffer.route} className="ks-offers-link">
      <span ref={textRef}>{currentOffer.text}</span>
    </Link>
  ) : (
    <span ref={textRef} className="ks-offers-text">
      {currentOffer.text}
    </span>
  );

  return (
    <div className="ks-offers-bar-root" role="region" aria-label="Special Offers">
      <div className="ks-offers-bar-container">
        {/* Left Arrow (Visible only if multiple offers) */}
        {validOffers.length > 1 && (
          <button
            type="button"
            className="ks-offers-arrow-btn ks-offers-arrow-left"
            onClick={handlePrev}
            aria-label="Previous offer"
          >
            <ChevronLeft size={16} />
          </button>
        )}

        {/* Offer Content with smart marquee/ticker for long text */}
        <div
          ref={contentRef}
          className={`ks-offers-content ${isOverflowing ? 'is-overflowing' : ''}`}
          style={
            isOverflowing
              ? {
                  '--ks-scroll-dist': `-${scrollDistance}px`,
                  '--ks-scroll-duration': `${effectiveDurationSec}s`
                }
              : undefined
          }
        >
          {offerContent}
        </div>

        {/* Right Arrow (Visible only if multiple offers) */}
        {validOffers.length > 1 && (
          <button
            type="button"
            className="ks-offers-arrow-btn ks-offers-arrow-right"
            onClick={handleNext}
            aria-label="Next offer"
          >
            <ChevronRight size={16} />
          </button>
        )}
      </div>
    </div>
  );
}
