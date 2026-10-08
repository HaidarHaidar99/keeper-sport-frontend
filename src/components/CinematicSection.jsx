import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';

export default function CinematicSection({ categories = [], products = [] }) {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef(null);

  // Discover real Admin-managed media source (category image or product image)
  const candidateCategory = categories.find((c) => c && c.image_path);
  const candidateProduct = products.find((p) => p && (p.primaryImage || p.coverImage));
  const mediaUrl = candidateCategory?.image_path || candidateProduct?.primaryImage || candidateProduct?.coverImage || null;
  const mediaLabel = candidateCategory?.name || candidateProduct?.name || 'Exclusive Matchday Apparel';
  const targetRoute = candidateCategory ? `/products?category=${encodeURIComponent(candidateCategory.slug || candidateCategory.id)}` : '/products';

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
      className={`ks-cinematic-section ${isVisible ? 'is-in-view' : ''}`}
      aria-label="Editorial Showcase"
    >
      <div className="ks-cinematic-container">
        <div className="ks-cinematic-frame">
          {/* Admin Media Layer */}
          {mediaUrl ? (
            <div className="ks-cinematic-media-wrap">
              <img
                src={mediaUrl}
                alt={mediaLabel}
                className="ks-cinematic-img"
                loading="lazy"
                decoding="async"
              />
              <div className="ks-cinematic-gradient-overlay" />
            </div>
          ) : (
            <div className="ks-cinematic-ambient-canvas" />
          )}

          {/* Animated Editorial Text Revealing into Image */}
          <div className="ks-cinematic-content">
            <div className="ks-cinematic-eyebrow-pill">
              <Sparkles size={13} className="ks-cinematic-sparkle" />
              <span>EDITORIAL SPOTLIGHT</span>
            </div>

            <h2 className="ks-cinematic-title">
              CRAFTED FOR MATCHDAY EXCELLENCE
            </h2>

            <p className="ks-cinematic-subtitle">
              Engineered with championship durability and high-performance ergonomics. Designed for athletes who command the field.
            </p>

            <div className="ks-cinematic-action">
              <Link to={targetRoute} className="ks-cinematic-btn">
                <span>Explore {candidateCategory ? candidateCategory.name : 'Collection'}</span>
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
