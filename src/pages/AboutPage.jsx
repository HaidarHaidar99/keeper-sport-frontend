import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Sparkles, Truck } from 'lucide-react';
import { useSite } from '../context/SiteContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function AboutPage() {
  const { siteSettings, categories } = useSite();

  return (
    <div className="ks-page-canvas">
      <Navbar siteSettings={siteSettings} categories={categories} />

      <main className="ks-catalog-page-container" style={{ paddingTop: '28px' }}>
        {/* Storefront Feature Card */}
        <div
          className="ks-about-content-card"
          style={{
            maxWidth: '980px',
            margin: '0 auto 60px',
            padding: '0',
            overflow: 'hidden',
            border: '1px solid var(--ks-border-card, #222222)',
            borderRadius: '24px',
            backgroundColor: 'var(--ks-bg-card, #0e0e0e)'
          }}
        >
          {/* Storefront Image with ALL text inside the image overlay */}
          <div
            style={{
              position: 'relative',
              width: '100%',
              minHeight: '480px',
              overflow: 'hidden',
              backgroundColor: '#000000',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'flex-end'
            }}
          >
            <img
              src="/images1/11.jpeg"
              alt="Keeper Sport Storefront"
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                objectPosition: 'center 25%'
              }}
              onError={(e) => {
                e.currentTarget.src = '/images1/11.jpeg';
              }}
            />

            {/* Dark gradient backdrop overlay ensuring high contrast readability */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(to top, rgba(0,0,0,0.96) 0%, rgba(0,0,0,0.85) 55%, rgba(0,0,0,0.45) 100%)'
              }}
            />

            {/* All Text Placed Inside The Image */}
            <div
              style={{
                position: 'relative',
                zIndex: 2,
                padding: 'clamp(28px, 4vw, 44px)',
                color: '#ffffff'
              }}
            >
              <div
                style={{
                  color: '#E10600',
                  fontSize: 'clamp(1.6rem, 3.4vw, 2.4rem)',
                  fontWeight: 900,
                  fontFamily: 'Outfit, sans-serif',
                  letterSpacing: '0.05em',
                  marginBottom: '6px',
                  textTransform: 'uppercase'
                }}
              >
                KEEPER SPORT LB
              </div>

              <p
                style={{
                  margin: '0 0 16px',
                  fontSize: '1rem',
                  fontWeight: 600,
                  color: '#f3f4f6',
                  opacity: 0.95
                }}
              >
                Hanaway Main Street, Tyre, South Lebanon
              </p>

              <div
                style={{
                  fontSize: 'clamp(0.92rem, 1.4vw, 1rem)',
                  lineHeight: '1.75',
                  color: '#e5e7eb',
                  maxWidth: '860px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px'
                }}
              >
                <p style={{ margin: 0 }}>
                  Welcome to Keeper Sport LB. Located in Tyre, South Lebanon, our storefront is dedicated to footballers, athletes, and passionate supporters seeking genuine sports apparel, football boots, and official match kits.
                </p>
                <p style={{ margin: 0 }}>
                  Inside our store, you will find an extensive collection of elite brands, specialized footwear, performance apparel, and customized jerseys with official player names and numbers. Every single product in our catalog is guaranteed 100% authentic.
                </p>
                <p style={{ margin: 0 }}>
                  Whether you visit us in person at our Tyre storefront or order through our online platform, we provide prompt nationwide delivery across all regions of Lebanon and personalized customer service.
                </p>
              </div>
            </div>
          </div>

          {/* Under Image: Authenticity & Others in 1 Horizontal Line (Icon + Title Only) */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 'clamp(16px, 3.5vw, 36px)',
              flexWrap: 'wrap',
              padding: '32px 24px 24px',
              borderBottom: '1px solid var(--ks-border-card, #1f222a)'
            }}
          >
            {/* Authenticity */}
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: '12px',
                  backgroundColor: 'rgba(225, 6, 0, 0.12)',
                  border: '1px solid rgba(225, 6, 0, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 0 16px rgba(225, 6, 0, 0.15)',
                  flexShrink: 0
                }}
              >
                <ShieldCheck size={22} style={{ color: '#E10600' }} />
              </div>
              <span
                style={{
                  fontWeight: 800,
                  fontSize: '0.98rem',
                  color: 'var(--ks-text-title, #ffffff)',
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase'
                }}
              >
                Authenticity
              </span>
            </div>

            {/* Customization */}
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: '12px',
                  backgroundColor: 'rgba(225, 6, 0, 0.12)',
                  border: '1px solid rgba(225, 6, 0, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 0 16px rgba(225, 6, 0, 0.15)',
                  flexShrink: 0
                }}
              >
                <Sparkles size={22} style={{ color: '#E10600' }} />
              </div>
              <span
                style={{
                  fontWeight: 800,
                  fontSize: '0.98rem',
                  color: 'var(--ks-text-title, #ffffff)',
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase'
                }}
              >
                Customization
              </span>
            </div>

            {/* Lebanon Delivery */}
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: '12px',
                  backgroundColor: 'rgba(225, 6, 0, 0.12)',
                  border: '1px solid rgba(225, 6, 0, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 0 16px rgba(225, 6, 0, 0.15)',
                  flexShrink: 0
                }}
              >
                <Truck size={22} style={{ color: '#E10600' }} />
              </div>
              <span
                style={{
                  fontWeight: 800,
                  fontSize: '0.98rem',
                  color: 'var(--ks-text-title, #ffffff)',
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase'
                }}
              >
                Lebanon Delivery
              </span>
            </div>
          </div>

          {/* Call To Action: Explore The Collection Button */}
          <div style={{ textAlign: 'center', padding: '28px 24px 34px' }}>
            <Link
              to="/products"
              className="ks-btn-primary"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '14px 36px',
                fontSize: '0.95rem',
                fontWeight: 800,
                letterSpacing: '0.06em'
              }}
            >
              <span>EXPLORE THE COLLECTION</span>
            </Link>
          </div>
        </div>
      </main>

      <Footer siteSettings={siteSettings} categories={categories} />
    </div>
  );
}
