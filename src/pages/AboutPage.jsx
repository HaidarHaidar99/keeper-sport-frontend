import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Trophy, Sparkles, Truck } from 'lucide-react';
import { useSite } from '../context/SiteContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function AboutPage() {
  const { siteSettings, categories } = useSite();

  return (
    <div className="ks-page-canvas">
      <Navbar siteSettings={siteSettings} categories={categories} />

      <main className="ks-catalog-page-container">
        <header className="ks-catalog-header">
          <div className="ks-catalog-header-badge">
            <Trophy size={13} style={{ color: 'var(--ks-accent-red)' }} />
            <span>OUR HERITAGE</span>
          </div>
          <h1 className="ks-catalog-title">About Keeper Sports</h1>
          <p className="ks-catalog-subtitle">
            Lebanon's premier destination for authentic football boots, jerseys, and athletic gear.
          </p>
        </header>

        <div className="ks-about-content-card">
          <div className="ks-about-text">
            {siteSettings?.about_us ? (
              <p>{siteSettings.about_us}</p>
            ) : (
              <p>
                Keeper Sports was established to supply footballers and sports enthusiasts with 100% genuine football kits, boots, and match equipment. We believe in authenticity, unmatched customer support, and delivering world-class sports apparel right to your doorstep.
              </p>
            )}
          </div>

          <div className="ks-about-pillars-grid">
            <div className="ks-about-pillar">
              <ShieldCheck size={28} className="ks-about-icon" />
              <h3>Guaranteed Authenticity</h3>
              <p>Every jersey, shoe, and accessory in our collection is authentic and verified.</p>
            </div>
            <div className="ks-about-pillar">
              <Sparkles size={28} className="ks-about-icon" />
              <h3>Official Kit Customization</h3>
              <p>Name and number printing following official league lettering standards.</p>
            </div>
            <div className="ks-about-pillar">
              <Truck size={28} className="ks-about-icon" />
              <h3>Nationwide Fast Delivery</h3>
              <p>Dependable delivery service covering all regions across Lebanon.</p>
            </div>
          </div>

          <div style={{ textAlign: 'center', marginTop: '36px' }}>
            <Link to="/products" className="ks-btn-primary">
              <span>EXPLORE THE COLLECTION</span>
            </Link>
          </div>
        </div>
      </main>

      <Footer siteSettings={siteSettings} categories={categories} />
    </div>
  );
}
