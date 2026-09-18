import React, { useState } from 'react';
import { Shirt, Sparkles, Check, ShoppingBag, RotateCcw } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';

const colorPresets = [
  { name: 'Obsidian Stealth', hex: '#0B0E14', accent: '#00F0FF' },
  { name: 'Royal Blue', hex: '#0038A8', accent: '#FFFFFF' },
  { name: 'Stadium Red', hex: '#D00000', accent: '#FFFFFF' },
  { name: 'Pitch Emerald', hex: '#007A3D', accent: '#FFB800' },
  { name: 'Classic Blanc', hex: '#EAEAEA', accent: '#0B0E14' },
  { name: 'Sunburst Gold', hex: '#E5A910', accent: '#0B0E14' }
];

const fontStyles = [
  { id: 'athletic', name: 'Athletic Block', font: "'Impact', sans-serif" },
  { id: 'modern', name: 'Modern Strike', font: "'Outfit', sans-serif" },
  { id: 'classic', name: 'Classic Pitch', font: "'Cairo', sans-serif" }
];

const CustomKitDesignerPage = () => {
  const { t, isRtl } = useLanguage();
  const { addToCart } = useCart();

  const [selectedColor, setSelectedColor] = useState(colorPresets[0]);
  const [selectedFont, setSelectedFont] = useState(fontStyles[0]);
  const [playerName, setPlayerName] = useState('HAIDAR');
  const [playerNumber, setPlayerNumber] = useState('10');
  const [selectedSize, setSelectedSize] = useState('L');
  const [viewSide, setViewSide] = useState('back'); // 'back' | 'front'

  const basePrice = 55.0;

  const handleAddToCart = () => {
    const customProduct = {
      id: `custom-kit-${Date.now()}`,
      name_en: `Custom ${selectedColor.name} Jersey (#${playerNumber} ${playerName.toUpperCase()})`,
      name_ar: `تيشيرت مخصص ${selectedColor.name} (رقم ${playerNumber} - ${playerName})`,
      base_price: basePrice,
      sale_enabled: false,
      sale_price: null,
      primary_image: null
    };

    const variant = {
      id: `variant-custom-${selectedSize}`,
      size: selectedSize,
      price: basePrice
    };

    const customKitDetails = {
      name: playerName.toUpperCase(),
      number: playerNumber,
      colorName: selectedColor.name,
      baseColor: selectedColor.hex,
      accentColor: selectedColor.accent,
      fontStyle: selectedFont.id
    };

    addToCart(customProduct, variant, 1, customKitDetails);
  };

  return (
    <div style={{ padding: '40px 0 80px' }}>
      <div className="container">
        {/* Header */}
        <div style={{ textAlign: 'center', maxWidth: '650px', margin: '0 auto 40px' }}>
          <span className="badge badge-cyan" style={{ marginBottom: '10px' }}>
            <Sparkles size={14} />
            <span>2D Interactive Studio</span>
          </span>
          <h1 style={{ fontSize: '36px', fontWeight: 900, marginBottom: '10px' }}>{t('kitDesignerTitle')}</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '15px' }}>
            {t('kitDesignerSubtitle')}
          </p>
        </div>

        {/* ── Studio Layout: Visual Preview Canvas + Customization Controls ── */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '40px',
          alignItems: 'center'
        }}>
          {/* ── 2D Visual SVG Canvas ── */}
          <div className="glass-card" style={{
            padding: '40px 20px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-medium)',
            position: 'relative'
          }}>
            {/* View Toggle (Front / Back) */}
            <div style={{
              display: 'flex',
              gap: '6px',
              backgroundColor: 'var(--bg-input)',
              padding: '4px',
              borderRadius: 'var(--radius-full)',
              marginBottom: '20px'
            }}>
              <button
                onClick={() => setViewSide('back')}
                style={{
                  padding: '6px 16px',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '12px',
                  fontWeight: 700,
                  backgroundColor: viewSide === 'back' ? 'var(--accent-cyan)' : 'transparent',
                  color: viewSide === 'back' ? '#040914' : 'var(--text-secondary)'
                }}
              >
                Back (Name & No.)
              </button>
              <button
                onClick={() => setViewSide('front')}
                style={{
                  padding: '6px 16px',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '12px',
                  fontWeight: 700,
                  backgroundColor: viewSide === 'front' ? 'var(--accent-cyan)' : 'transparent',
                  color: viewSide === 'front' ? '#040914' : 'var(--text-secondary)'
                }}
              >
                Front (Crest)
              </button>
            </div>

            {/* SVG Jersey Graphic */}
            <div style={{ width: '100%', maxWidth: '340px', height: '400px', position: 'relative' }}>
              <svg viewBox="0 0 400 460" width="100%" height="100%" style={{ filter: 'drop-shadow(0 14px 28px rgba(0,0,0,0.5))' }}>
                <defs>
                  <linearGradient id="jerseyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor={selectedColor.hex} />
                    <stop offset="100%" stopColor={selectedColor.hex} stopOpacity="0.85" />
                  </linearGradient>
                </defs>

                {/* Left Sleeve */}
                <path d="M 100,70 L 20,150 L 55,190 L 105,120 Z" fill={selectedColor.hex} stroke="rgba(255,255,255,0.15)" strokeWidth="2" />
                <path d="M 20,150 L 55,190 L 65,180 L 30,140 Z" fill={selectedColor.accent} />

                {/* Right Sleeve */}
                <path d="M 300,70 L 380,150 L 345,190 L 295,120 Z" fill={selectedColor.hex} stroke="rgba(255,255,255,0.15)" strokeWidth="2" />
                <path d="M 380,150 L 345,190 L 335,180 L 370,140 Z" fill={selectedColor.accent} />

                {/* Jersey Torso Body */}
                <path d="M 100,70 L 300,70 L 320,420 L 80,420 Z" fill="url(#jerseyGrad)" stroke="rgba(255,255,255,0.1)" strokeWidth="2" />

                {/* Collar Ribbing */}
                <path d="M 155,70 Q 200,105 245,70" fill="none" stroke={selectedColor.accent} strokeWidth="10" strokeLinecap="round" />

                {/* Subtitle / Texture Stripes */}
                <line x1="85" y1="410" x2="315" y2="410" stroke={selectedColor.accent} strokeWidth="6" />

                {viewSide === 'back' ? (
                  /* Back Typography Rendering */
                  <g>
                    {/* Player Name */}
                    <text
                      x="200"
                      y="160"
                      textAnchor="middle"
                      fill={selectedColor.accent}
                      style={{
                        fontFamily: selectedFont.font,
                        fontSize: '34px',
                        fontWeight: 900,
                        letterSpacing: '5px',
                        textTransform: 'uppercase'
                      }}
                    >
                      {playerName || "NAME"}
                    </text>

                    {/* Player Number */}
                    <text
                      x="200"
                      y="290"
                      textAnchor="middle"
                      fill={selectedColor.accent}
                      style={{
                        fontFamily: selectedFont.font,
                        fontSize: '115px',
                        fontWeight: 900,
                        letterSpacing: '2px'
                      }}
                    >
                      {playerNumber || "10"}
                    </text>

                    <text
                      x="200"
                      y="335"
                      textAnchor="middle"
                      fill="rgba(255,255,255,0.3)"
                      style={{ fontSize: '11px', letterSpacing: '3px', fontWeight: 800 }}
                    >
                      KEEPER SPORTS AUTHENTIC
                    </text>
                  </g>
                ) : (
                  /* Front Crest & Sponsor Rendering */
                  <g>
                    {/* Club Shield Crest */}
                    <circle cx="150" cy="150" r="24" fill={selectedColor.accent} />
                    <text x="150" y="156" textAnchor="middle" fill={selectedColor.hex} style={{ fontSize: '18px', fontWeight: 900 }}>
                      ⚡
                    </text>

                    {/* Maker Logo */}
                    <circle cx="250" cy="150" r="16" fill="none" stroke={selectedColor.accent} strokeWidth="3" />
                    <text x="250" y="154" textAnchor="middle" fill={selectedColor.accent} style={{ fontSize: '12px', fontWeight: 900 }}>
                      KS
                    </text>

                    {/* Sponsor Banner */}
                    <rect x="130" y="240" width="140" height="36" rx="6" fill="rgba(255,255,255,0.08)" stroke={selectedColor.accent} strokeWidth="1" />
                    <text x="200" y="264" textAnchor="middle" fill={selectedColor.accent} style={{ fontSize: '15px', fontWeight: 900, letterSpacing: '3px' }}>
                      KEEPER
                    </text>
                  </g>
                )}
              </svg>
            </div>
          </div>

          {/* ── Customization Panel ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
            {/* Colorway Selection */}
            <div>
              <label className="form-label">{t('primaryColor')}</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginTop: '8px' }}>
                {colorPresets.map((c) => {
                  const isSelected = selectedColor.name === c.name;
                  return (
                    <button
                      key={c.name}
                      onClick={() => setSelectedColor(c)}
                      style={{
                        padding: '10px',
                        borderRadius: 'var(--radius-md)',
                        border: isSelected ? '2px solid var(--accent-cyan)' : '1px solid var(--border-subtle)',
                        backgroundColor: 'var(--bg-card)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}
                    >
                      <span style={{
                        width: '18px',
                        height: '18px',
                        borderRadius: '50%',
                        backgroundColor: c.hex,
                        border: '2px solid var(--border-medium)'
                      }} />
                      <span style={{ fontSize: '12px', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {c.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Typography Style Selection */}
            <div>
              <label className="form-label">{t('fontStyle')}</label>
              <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                {fontStyles.map((f) => {
                  const isSelected = selectedFont.id === f.id;
                  return (
                    <button
                      key={f.id}
                      onClick={() => setSelectedFont(f)}
                      style={{
                        flex: 1,
                        padding: '8px 12px',
                        borderRadius: 'var(--radius-md)',
                        border: isSelected ? '1px solid var(--accent-cyan)' : '1px solid var(--border-subtle)',
                        backgroundColor: isSelected ? 'rgba(0, 240, 255, 0.1)' : 'var(--bg-card)',
                        color: isSelected ? 'var(--accent-cyan)' : 'var(--text-secondary)',
                        fontFamily: f.font,
                        fontSize: '13px',
                        fontWeight: 700
                      }}
                    >
                      {f.name}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Player Name & Number Inputs */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '14px' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">{t('playerName')}</label>
                <input
                  type="text"
                  maxLength={12}
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value.toUpperCase())}
                  className="form-input"
                  style={{ textTransform: 'uppercase', fontWeight: 800 }}
                  placeholder="MESSI"
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">{t('playerNumber')}</label>
                <input
                  type="text"
                  maxLength={2}
                  value={playerNumber}
                  onChange={(e) => setPlayerNumber(e.target.value.replace(/[^0-9]/g, ''))}
                  className="form-input"
                  style={{ fontWeight: 900, textAlign: 'center' }}
                  placeholder="10"
                />
              </div>
            </div>

            {/* Size Selector */}
            <div>
              <label className="form-label">{t('size')}</label>
              <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                {['S', 'M', 'L', 'XL', 'XXL'].map((s) => (
                  <button
                    key={s}
                    onClick={() => setSelectedSize(s)}
                    style={{
                      flex: 1,
                      padding: '10px 0',
                      borderRadius: 'var(--radius-md)',
                      fontSize: '13px',
                      fontWeight: 800,
                      backgroundColor: selectedSize === s ? 'var(--accent-cyan)' : 'var(--bg-card)',
                      color: selectedSize === s ? '#040914' : 'var(--text-primary)',
                      border: selectedSize === s ? '1px solid var(--accent-cyan)' : '1px solid var(--border-subtle)',
                      transition: 'all var(--transition-fast)'
                    }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Price & Add to Cart */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingTop: '20px',
              borderTop: '1px solid var(--border-subtle)'
            }}>
              <div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>Total Custom Price:</div>
                <div style={{ fontSize: '32px', fontWeight: 900, color: 'var(--accent-cyan)' }}>
                  ${basePrice.toFixed(2)}
                </div>
              </div>

              <button
                onClick={handleAddToCart}
                className="btn btn-primary btn-lg"
                style={{ gap: '10px' }}
              >
                <ShoppingBag size={20} />
                <span>{t('addCustomKitToCart')}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomKitDesignerPage;
