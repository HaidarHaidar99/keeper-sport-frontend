import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function OffersBar({ offers = [] }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const validOffers = Array.isArray(offers) ? offers.filter((o) => o && o.text) : [];
  const currentOffer = validOffers[currentIndex] || validOffers[0] || null;

  // Auto rotation if multiple offers - unconditionally called at top
  useEffect(() => {
    if (validOffers.length <= 1 || !currentOffer) return;

    const duration = (currentOffer?.duration_seconds || 5) * 1000;
    const timer = setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % validOffers.length);
    }, duration);

    return () => clearTimeout(timer);
  }, [currentIndex, validOffers.length, currentOffer?.duration_seconds]);

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

  return (
    <div className="ks-offers-bar-root" role="region" aria-label="Special Offers">
      <div className="ks-offers-bar-container">
        {/* Left Arrow (Visible only if multiple offers) */}
        {offers.length > 1 && (
          <button
            type="button"
            className="ks-offers-arrow-btn ks-offers-arrow-left"
            onClick={handlePrev}
            aria-label="Previous offer"
          >
            <ChevronLeft size={16} />
          </button>
        )}

        {/* Centered Offer Content */}
        <div className="ks-offers-content">
          {currentOffer.route ? (
            <Link to={currentOffer.route} className="ks-offers-link">
              <span>{currentOffer.text}</span>
            </Link>
          ) : (
            <span className="ks-offers-text">{currentOffer.text}</span>
          )}
        </div>

        {/* Right Arrow (Visible only if multiple offers) */}
        {offers.length > 1 && (
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
