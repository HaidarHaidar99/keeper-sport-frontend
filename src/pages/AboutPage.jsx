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

      <main className="ks-catalog-page-container">
        {/* Header */}
        <header className="ks-catalog-header">
          <div className="ks-catalog-header-badge">
            <span>OUR STORE</span>
          </div>
          <h1 className="ks-catalog-title">ABOUT US</h1>
          <p className="ks-catalog-subtitle">
            KEEPER SPORTS — YOUR EXCLUSIVE DESTINATION FOR AUTHENTIC FOOTBALL GEAR
          </p>
        </header>

        {/* Storefront Feature Card */}
        <div className="ks-about-content-card" style={{ maxWidth: '980px', margin: '0 auto 60px', padding: '0', overflow: 'hidden', border: '1px solid var(--ks-border-card, #222222)', borderRadius: '24px', backgroundColor: 'var(--ks-bg-card, #0e0e0e)' }}>
          {/* Storefront Image */}
          <div style={{ position: 'relative', width: '100%', minHeight: '380px', maxHeight: '560px', overflow: 'hidden', backgroundColor: '#000' }}>
            <img
              src="/images1/11.jpeg"
              alt="Keeper Sports Storefront"
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
            {/* Image Overlay with KEEPER SPORT in red, address, and intro text */}
            <div
              style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                padding: '36px 28px 24px',
                background: 'linear-gradient(to top, rgba(0,0,0,0.96) 0%, rgba(0,0,0,0.8) 65%, transparent 100%)',
                color: '#fff'
              }}
            >
              <div style={{ color: '#E10600', fontSize: 'clamp(1.5rem, 3.2vw, 2.2rem)', fontWeight: 900, fontFamily: 'Outfit, sans-serif', letterSpacing: '0.04em', marginBottom: '4px' }}>
                KEEPER SPORT
              </div>
              <p style={{ margin: '0 0 10px', fontSize: '0.98rem', fontWeight: 600, color: '#f3f4f6', opacity: 0.95 }}>
                Hanaway Main Street, Tyre, South Lebanon
              </p>
              <p style={{ margin: 0, fontSize: '0.92rem', lineHeight: '1.65', color: '#e5e7eb', maxWidth: '840px' }}>
                Welcome to Keeper Sport. Located in Tyre, South Lebanon, our storefront is dedicated to footballers, athletes, and passionate supporters seeking genuine sports apparel, football boots, and official match kits.
              </p>
            </div>
          </div>

          {/* Storefront Details Body */}
          <div style={{ padding: '36px 32px' }}>
            {/* About Text Body */}
            <div style={{ fontSize: '1rem', lineHeight: '1.75', color: 'var(--ks-text-secondary, #cccccc)', marginBottom: '36px' }}>
              <p style={{ marginBottom: '16px' }}>
                Inside our store, you will find an extensive collection of elite brands, specialized footwear, performance apparel, and customized jerseys with official player names and numbers. Every single product in our catalog is guaranteed 100% authentic.
              </p>
              <p style={{ margin: 0 }}>
                Whether you visit us in person at our Tyre storefront or order through our online platform, we provide prompt nationwide delivery across all regions of Lebanon and personalized customer service.
              </p>
            </div>

            {/* 3 Value Pillars With God-Tier Amazing Icons */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                gap: '20px',
                marginBottom: '36px'
              }}
            >
              {/* Card 1: Authenticity */}
              <div style={{ padding: '24px 20px', borderRadius: '16px', border: '1px solid var(--ks-border-card, #222222)', backgroundColor: 'rgba(255, 255, 255, 0.02)', transition: 'border-color 0.2s ease' }}>
                <div style={{ width: 48, height: 48, borderRadius: '14px', backgroundColor: 'rgba(225, 6, 0, 0.12)', border: '1px solid rgba(225, 6, 0, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px', boxShadow: '0 0 20px rgba(225, 6, 0, 0.15)' }}>
                  <ShieldCheck size={26} style={{ color: '#E10600' }} />
                </div>
                <div style={{ color: '#E10600', fontWeight: 900, fontSize: '0.78rem', letterSpacing: '0.1em', marginBottom: '6px' }}>
                  01. AUTHENTICITY
                </div>
                <div style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--ks-text-title, #fff)', marginBottom: '8px' }}>
                  Guaranteed Genuine Gear
                </div>
                <div style={{ fontSize: '0.9rem', color: '#888888', lineHeight: '1.55' }}>
                  Directly sourced authentic football boots, club shirts, and athletic apparel.
                </div>
              </div>

              {/* Card 2: Customization */}
              <div style={{ padding: '24px 20px', borderRadius: '16px', border: '1px solid var(--ks-border-card, #222222)', backgroundColor: 'rgba(255, 255, 255, 0.02)', transition: 'border-color 0.2s ease' }}>
                <div style={{ width: 48, height: 48, borderRadius: '14px', backgroundColor: 'rgba(225, 6, 0, 0.12)', border: '1px solid rgba(225, 6, 0, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px', boxShadow: '0 0 20px rgba(225, 6, 0, 0.15)' }}>
                  <Sparkles size={26} style={{ color: '#E10600' }} />
                </div>
                <div style={{ color: '#E10600', fontWeight: 900, fontSize: '0.78rem', letterSpacing: '0.1em', marginBottom: '6px' }}>
                  02. CUSTOMIZATION
                </div>
                <div style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--ks-text-title, #fff)', marginBottom: '8px' }}>
                  Official Matchday Lettering
                </div>
                <div style={{ fontSize: '0.9rem', color: '#888888', lineHeight: '1.55' }}>
                  Professional player names and numbering according to official league standards.
                </div>
              </div>

              {/* Card 3: Lebanon Delivery */}
              <div style={{ padding: '24px 20px', borderRadius: '16px', border: '1px solid var(--ks-border-card, #222222)', backgroundColor: 'rgba(255, 255, 255, 0.02)' }}>
                <div style={{ width: 48, height: 48, borderRadius: '14px', backgroundColor: 'rgba(225, 6, 0, 0.12)', border: '1px solid rgba(225, 6, 0, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px', boxShadow: '0 0 20px rgba(225, 6, 0, 0.15)' }}>
                  <Truck size={26} style={{ color: '#E10600' }} />
                </div>
                <div style={{ color: '#E10600', fontWeight: 900, fontSize: '0.78rem', letterSpacing: '0.1em', marginBottom: '6px' }}>
                  03. LEBANON DELIVERY
                </div>
                <div style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--ks-text-title, #fff)', marginBottom: '8px' }}>
                  Fast Nationwide Shipping
                </div>
                <div style={{ fontSize: '0.9rem', color: '#888888', lineHeight: '1.55' }}>
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
