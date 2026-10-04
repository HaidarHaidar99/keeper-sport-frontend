import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function OffersBar({ offers = [] }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  // If no offers in database, hide bar completely without leaving empty gap
  if (!offers || offers.length === 0) {
    return null;
  }

  const currentOffer = offers[currentIndex] || offers[0];

  // Auto rotation if multiple offers
  useEffect(() => {
    if (offers.length <= 1) return;

    const duration = (currentOffer?.duration_seconds || 5) * 1000;
    const timer = setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % offers.length);
    }, duration);

    return () => clearTimeout(timer);
  }, [currentIndex, offers, currentOffer]);

  const handlePrev = (e) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + offers.length) % offers.length);
  };

  const handleNext = (e) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % offers.length);
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
