import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useSite } from '../context/SiteContext';
import HamburgerMenu from './HamburgerMenu';

export default function Navbar({ siteSettings: propSettings, categories: propCategories, counts: propCounts }) {
  const siteCtx = useSite();
  const siteSettings = (propSettings && Object.keys(propSettings).length > 0) ? propSettings : (siteCtx?.siteSettings || {});
  const categories = (propCategories && propCategories.length > 0) ? propCategories : (siteCtx?.categories || []);
  const counts = (propCounts && Object.keys(propCounts).length > 0) ? propCounts : (siteCtx?.counts || {});

  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <header className="ks-navbar-root" role="banner">
        <div className="ks-navbar-container">
          {/* Left: Actual Keeper Sports Logo maintaining correct aspect ratio */}
          <div className="ks-navbar-left">
            <Link to="/" className="ks-navbar-brand-link" aria-label="Keeper Sports Home">
              {siteSettings?.logo_path ? (
                <img
                  src={siteSettings.logo_path}
                  alt={siteSettings?.site_name || 'Keeper Sports'}
                  className="ks-navbar-logo-img"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    const fallback = e.currentTarget.parentElement?.querySelector('.ks-navbar-logo-fallback');
                    if (fallback) fallback.style.display = 'flex';
                  }}
                />
              ) : null}

              {/* Bold Athletic Brand Lockup Fallback */}
              <div
                className="ks-navbar-logo-fallback"
                style={{ display: siteSettings?.logo_path ? 'none' : 'flex' }}
                aria-label="Keeper Sports Logo"
              >
                <div className="ks-logo-emblem">
                  <svg viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" className="ks-logo-shield-svg">
                    <path
                      d="M18 3L31 8V18C31 26.5 25.5 32 18 34C10.5 32 5 26.5 5 18V8L18 3Z"
                      fill="#E10600"
                    />
                    <path
                      d="M18 10V26M10 18H26"
                      stroke="#FFFFFF"
                      strokeWidth="2.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <div className="ks-logo-text-block">
                  <span className="ks-logo-primary">{siteSettings?.site_name || 'KEEPER SPORTS'}</span>
                  <span className="ks-logo-secondary">AUTHENTIC FOOTBALL GEAR</span>
                </div>
              </div>
            </Link>
          </div>

          {/* Right: Custom 2-Line Hamburger Control (top line ~28px, bottom line ~14px half length) */}
          <div className="ks-navbar-right">
            <button
              type="button"
              className="ks-hamburger-trigger"
              onClick={() => setMenuOpen(true)}
              aria-label="Open navigation menu"
              aria-expanded={menuOpen}
              title="Menu"
              id="ks-main-nav-toggle"
            >
              <span className="ks-hamburger-line ks-hamburger-line-top" aria-hidden="true" />
              <span className="ks-hamburger-line ks-hamburger-line-bottom" aria-hidden="true" />
            </button>
          </div>
        </div>
      </header>

      {/* Full-Viewport Navigation Curtain */}
      <HamburgerMenu
        isOpen={menuOpen}
        onClose={() => setMenuOpen(false)}
        siteSettings={siteSettings}
        categories={categories}
        counts={counts}
      />
    </>
  );
}
