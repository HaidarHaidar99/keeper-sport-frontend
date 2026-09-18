import React, { useState, useEffect } from 'react';
import { Sliders, Plus, Trash2, CheckCircle2 } from 'lucide-react';
import apiClient from '../../services/apiClient';

const AdminContentPage = () => {
  const [slides, setSlides] = useState([]);
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);

  // New slide form
  const [titleEn, setTitleEn] = useState('');
  const [titleAr, setTitleAr] = useState('');
  const [subtitleEn, setSubtitleEn] = useState('');
  const [ctaEn, setCtaEn] = useState('Shop Now');
  const [link, setLink] = useState('/products');
  const [submitting, setSubmitting] = useState(false);

  const fetchContent = async () => {
    setLoading(true);
    try {
      const [slideRes, offerRes] = await Promise.all([
        apiClient('/content/hero-slides'),
        apiClient('/content/offers')
      ]);
      if (slideRes?.data) setSlides(slideRes.data);
      if (offerRes?.data) setOffers(offerRes.data);
    } catch (err) {
      console.error("Content error", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContent();
  }, []);

  const handleAddSlide = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await apiClient('/content/hero-slides', {
        method: 'POST',
        body: JSON.stringify({
          title_en: titleEn,
          title_ar: titleAr || titleEn,
          subtitle_en: subtitleEn,
          subtitle_ar: subtitleEn,
          cta_text_en: ctaEn,
          cta_text_ar: "تسوق الآن",
          cta_link: link,
          is_active: true
        })
      });
      setTitleEn('');
      setTitleAr('');
      setSubtitleEn('');
      fetchContent();
    } catch (err) {
      alert(err.message || "Failed to create hero slide (maximum 3 active slides allowed)");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 900 }}>Banners, Slides & Offers</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '4px' }}>
          Configure homepage hero banners (up to 3 active) and announcement promos.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '32px', alignItems: 'flex-start' }}>
        {/* Existing Slides List */}
        <div className="glass-card" style={{ padding: '28px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '16px' }}>Active Hero Slides</h2>
          {loading ? (
            <div style={{ color: 'var(--text-muted)' }}>Loading slides...</div>
          ) : slides.length === 0 ? (
            <div style={{ color: 'var(--text-muted)' }}>No hero slides created. Using default studio banners.</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {slides.map((s) => (
                <div key={s.id} style={{
                  padding: '16px',
                  backgroundColor: 'var(--bg-input)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-subtle)'
                }}>
                  <div style={{ fontWeight: 800, fontSize: '15px' }}>{s.title_en}</div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '13px', marginTop: '4px' }}>{s.subtitle_en}</div>
                  <div style={{ marginTop: '8px', fontSize: '12px', color: 'var(--accent-cyan)' }}>
                    Link: {s.cta_link}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Add Slide Form */}
        <div className="glass-card" style={{ padding: '28px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '16px' }}>Add Hero Slide (Max 3)</h2>
          <form onSubmit={handleAddSlide} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Headline (EN)</label>
              <input
                type="text"
                required
                className="form-input"
                placeholder="Champions League Special"
                value={titleEn}
                onChange={(e) => setTitleEn(e.target.value)}
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Headline (AR)</label>
              <input
                type="text"
                className="form-input"
                placeholder="عروض دوري أبطال أوروبا الحصرية"
                value={titleAr}
                onChange={(e) => setTitleAr(e.target.value)}
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Subtitle Description</label>
              <input
                type="text"
                className="form-input"
                placeholder="Get free official badges with every kit"
                value={subtitleEn}
                onChange={(e) => setSubtitleEn(e.target.value)}
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Target Link</label>
              <input
                type="text"
                className="form-input"
                placeholder="/products?category=..."
                value={link}
                onChange={(e) => setLink(e.target.value)}
              />
            </div>

            <button type="submit" disabled={submitting} className="btn btn-primary btn-lg" style={{ marginTop: '8px' }}>
              {submitting ? "Adding..." : "Publish Slide"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminContentPage;
