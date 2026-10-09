import React, { useEffect, useRef, useState } from 'react';

export default function CinematicSection() {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef(null);

  // Scroll reveal Intersection Observer
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.15 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      className={`ks-story-section ${isVisible ? 'is-in-view' : ''}`}
      aria-label="Story Showcase"
    >
      <div className="ks-story-container">
        <div className="ks-story-card" style={{ borderRadius: '24px', overflow: 'hidden', minHeight: '440px', position: 'relative' }}>
          {/* Background Photography from frontend/images1/11.jpeg */}
          <div className="ks-story-media-wrap">
            <img
              src="/images1/11.jpeg"
              alt="Keeper Sports"
              className="ks-story-img"
              loading="lazy"
              decoding="async"
              onError={(e) => {
                // Fallback to relative path if needed
                e.currentTarget.src = '/images1/11.jpeg';
              }}
            />
            <div className="ks-story-overlay-scrim" />
          </div>

          {/* Small Animated Falling Text in Pure White */}
          <div className="ks-story-content" style={{ textAlign: 'center', padding: '40px 24px' }}>
            <p
              className="ks-story-falling-phrase"
              style={{
                fontFamily: 'Outfit, sans-serif',
                fontSize: 'clamp(1.2rem, 2.5vw, 1.85rem)',
                fontWeight: 800,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: '#FFFFFF',
                textShadow: '0 4px 20px rgba(0, 0, 0, 0.8)',
                margin: 0
              }}
            >
              ENGINEERED FOR CHAMPIONS &bull; ELEVATE YOUR GAME
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
