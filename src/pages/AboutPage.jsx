import React from 'react';
import { Link } from 'react-router-dom';
import { useSite } from '../context/SiteContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function AboutPage() {
  const { siteSettings, categories } = useSite();

  return (
    <div className="ks-page-canvas">
      <Navbar siteSettings={siteSettings} categories={categories} />

      <main className="ks-catalog-page-container">
        {/* Header */}
        <header className="ks-catalog-header">
          <div className="ks-catalog-header-badge">
            <span>OUR STORE</span>
          </div>
          <h1 className="ks-catalog-title">PROCESS INTERNATIONAL</h1>
          <p className="ks-catalog-subtitle">
            KEEPER SPORTS — YOUR EXCLUSIVE DESTINATION FOR AUTHENTIC FOOTBALL GEAR
          </p>
        </header>

        {/* Storefront Feature Card */}
        <div className="ks-about-content-card" style={{ maxWidth: '980px', margin: '0 auto 60px', padding: '0', overflow: 'hidden', border: '1px solid var(--ks-border-card, #222222)', borderRadius: '24px', backgroundColor: 'var(--ks-bg-card, #0e0e0e)' }}>
          {/* Storefront Image */}
          <div style={{ position: 'relative', width: '100%', maxHeight: '560px', overflow: 'hidden', backgroundColor: '#000' }}>
            <img
              src="/images1/11.jpeg"
              alt="Keeper Sports Storefront - Process International"
              style={{
                width: '100%',
                height: '100%',
                maxHeight: '560px',
                objectFit: 'cover',
                objectPosition: 'center 20%',
                display: 'block'
              }}
              onError={(e) => {
                e.currentTarget.src = '/images1/11.jpeg';
              }}
            />
            <div
              style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                padding: '30px 24px 20px',
                background: 'linear-gradient(to top, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.4) 70%, transparent 100%)',
                color: '#fff'
              }}
            >
              <div style={{ display: 'inline-block', backgroundColor: '#E10600', color: '#fff', fontSize: '0.75rem', fontWeight: 800, letterSpacing: '0.12em', padding: '4px 12px', borderRadius: '4px', marginBottom: '8px' }}>
                KS FLAGSHIP STORE
              </div>
              <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: 'clamp(1.5rem, 3vw, 2.2rem)', fontWeight: 900, margin: '0 0 6px', letterSpacing: '0.04em' }}>
                PROCESS INTERNATIONAL
              </h2>
              <p style={{ margin: 0, fontSize: '0.95rem', opacity: 0.9, color: '#f3f4f6' }}>
                Hanaway Main Street, Tyre, South Lebanon
              </p>
            </div>
          </div>

          {/* Storefront Sign Text & Details (Strictly Without Icons) */}
          <div style={{ padding: '36px 32px' }}>
            {/* Sign Text Banner */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: '16px',
                padding: '24px',
                backgroundColor: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid var(--ks-border-card, #222222)',
                borderRadius: '16px',
                marginBottom: '32px'
              }}
            >
              <div>
                <span style={{ display: 'block', fontSize: '0.72rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#888888', marginBottom: '4px' }}>
                  STORE BANNER
                </span>
                <span style={{ fontSize: '1.25rem', fontWeight: 900, color: '#E10600', letterSpacing: '0.05em' }}>
                  PROCESS INTERNATIONAL
                </span>
              </div>

              <div>
                <span style={{ display: 'block', fontSize: '0.72rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#888888', marginBottom: '4px' }}>
                  INSTAGRAM HANDLE
                </span>
                <a
                  href="https://www.instagram.com/keepersportlb"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--ks-text-title, #FFFFFF)', textDecoration: 'none' }}
                >
                  @keepersportlb
                </a>
              </div>

              <div>
                <span style={{ display: 'block', fontSize: '0.72rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#888888', marginBottom: '4px' }}>
                  DIRECT CONTACT
                </span>
                <a
                  href="tel:+96181107426"
                  style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--ks-text-title, #FFFFFF)', textDecoration: 'none' }}
                >
                  81-10 74 26
                </a>
              </div>
            </div>

            {/* About Text Body */}
            <div style={{ fontSize: '1rem', lineHeight: '1.75', color: 'var(--ks-text-secondary, #cccccc)', marginBottom: '32px' }}>
              <p style={{ marginBottom: '16px' }}>
                Welcome to <strong>Keeper Sports (KS) — Process International</strong>. Located in Tyre, South Lebanon, our physical storefront is dedicated to footballers, athletes, and passionate supporters seeking genuine sports apparel, football boots, and official match kits.
              </p>
              <p style={{ marginBottom: '16px' }}>
                Inside our store, you will find an extensive collection of elite brands, specialized footwear, performance apparel, and customized jerseys with official player names and numbers. Every single product in our catalog is guaranteed 100% authentic.
              </p>
              <p style={{ margin: 0 }}>
                Whether you visit us in person at our Tyre storefront or order through our online platform, we provide prompt nationwide delivery across all regions of Lebanon and personalized customer service.
              </p>
            </div>

            {/* Clean Value Pillars Without Icons */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                gap: '20px',
                marginBottom: '36px'
              }}
            >
              <div style={{ padding: '20px', borderRadius: '12px', border: '1px solid var(--ks-border-card, #222222)', backgroundColor: 'rgba(255, 255, 255, 0.02)' }}>
                <div style={{ color: '#E10600', fontWeight: 900, fontSize: '0.8rem', letterSpacing: '0.1em', marginBottom: '6px' }}>
                  01. AUTHENTICITY
                </div>
                <div style={{ fontWeight: 800, color: 'var(--ks-text-title, #fff)', marginBottom: '6px' }}>
                  Guaranteed Genuine Gear
                </div>
                <div style={{ fontSize: '0.9rem', color: '#888888', lineHeight: '1.5' }}>
                  Directly sourced authentic football boots, club shirts, and athletic apparel.
                </div>
              </div>

              <div style={{ padding: '20px', borderRadius: '12px', border: '1px solid var(--ks-border-card, #222222)', backgroundColor: 'rgba(255, 255, 255, 0.02)' }}>
                <div style={{ color: '#E10600', fontWeight: 900, fontSize: '0.8rem', letterSpacing: '0.1em', marginBottom: '6px' }}>
                  02. CUSTOMIZATION
                </div>
                <div style={{ fontWeight: 800, color: 'var(--ks-text-title, #fff)', marginBottom: '6px' }}>
                  Official Matchday Lettering
                </div>
                <div style={{ fontSize: '0.9rem', color: '#888888', lineHeight: '1.5' }}>
                  Professional player names and numbering according to official league standards.
                </div>
              </div>

              <div style={{ padding: '20px', borderRadius: '12px', border: '1px solid var(--ks-border-card, #222222)', backgroundColor: 'rgba(255, 255, 255, 0.02)' }}>
                <div style={{ color: '#E10600', fontWeight: 900, fontSize: '0.8rem', letterSpacing: '0.1em', marginBottom: '6px' }}>
                  03. LEBANON DELIVERY
                </div>
                <div style={{ fontWeight: 800, color: 'var(--ks-text-title, #fff)', marginBottom: '6px' }}>
                  Fast Nationwide Shipping
                </div>
                <div style={{ fontSize: '0.9rem', color: '#888888', lineHeight: '1.5' }}>
                  Reliable door-to-door delivery throughout Beirut, Tyre, Sidon, and all regions.
                </div>
              </div>
            </div>

            {/* Call to action */}
            <div style={{ textAlign: 'center', paddingTop: '10px' }}>
              <Link to="/products" className="ks-btn-primary" style={{ display: 'inline-flex', padding: '14px 32px' }}>
                <span>EXPLORE THE COLLECTION</span>
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer siteSettings={siteSettings} categories={categories} />
    </div>
  );
}
