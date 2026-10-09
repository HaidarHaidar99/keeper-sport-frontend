import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { contentApi } from '../api/contentApi';

export default function CinematicSection({ storyData: propStoryData }) {
  const [story, setStory] = useState(propStoryData || null);
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef(null);

  // If not passed as prop, fetch from API
  useEffect(() => {
    if (propStoryData) {
      setStory(propStoryData);
      return;
    }

    let isMounted = true;
    contentApi.getHomepageStory().then((res) => {
      if (isMounted && res?.success && res.story) {
        setStory(res.story);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [propStoryData]);

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
  }, [story]);

  // If section is explicitly disabled by Admin or has no content, cleanly omit without gap
  if (!story || story.is_active === false) {
    return null;
  }

  const {
    image_url,
    heading,
    subheading,
    button_text = 'Shop Collection',
    button_link = '/products'
  } = story;

  if (!heading && !image_url) {
    return null;
  }

  return (
    <section
      ref={sectionRef}
      className={`ks-story-section ${isVisible ? 'is-in-view' : ''}`}
      aria-label="Homepage Story"
    >
      <div className="ks-story-container">
        <div className="ks-story-card">
          {/* Background Photography with Smooth Reveal */}
          {image_url ? (
            <div className="ks-story-media-wrap">
              <img
                src={image_url}
                alt={heading || 'Keeper Sports Story'}
                className="ks-story-img"
                loading="lazy"
                decoding="async"
              />
              <div className="ks-story-overlay-scrim" />
            </div>
          ) : (
            <div className="ks-story-media-ambient" />
          )}

          {/* Cinematic Text Entering from Above into Image Area */}
          <div className="ks-story-content">
            <span className="ks-story-eyebrow">AUTHENTIC MATCHDAY HERITAGE</span>

            {heading && (
              <h2 className="ks-story-heading">
                {heading}
              </h2>
            )}

            {subheading && (
              <p className="ks-story-subheading">
                {subheading}
              </p>
            )}

            {button_text && button_link && (
              <div className="ks-story-action">
                <Link to={button_link} className="ks-story-btn">
                  <span>{button_text}</span>
                  <ArrowRight size={16} />
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
