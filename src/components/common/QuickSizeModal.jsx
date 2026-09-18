import React, { useState } from 'react';
import { X, ShoppingBag, Check } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useLanguage } from '../../context/LanguageContext';

const QuickSizeModal = ({ product, isOpen, onClose }) => {
  const { addToCart } = useCart();
  const { t, language, isRtl } = useLanguage();

  const [selectedVariant, setSelectedVariant] = useState(() => {
    if (product?.variants && product.variants.length > 0) {
      return product.variants.find((v) => v.is_available) || product.variants[0];
    }
    return null;
  });

  if (!isOpen || !product) return null;

  const name = language === 'ar' ? (product.name_ar || product.name_en) : product.name_en;
  const variants = product.variants || [];

  const effectivePrice = Number(
    selectedVariant?.price !== undefined && selectedVariant?.price !== null
      ? selectedVariant.price
      : product.sale_enabled && product.sale_price !== null
      ? product.sale_price
      : product.base_price
  );

  const originalPrice = Number(product.base_price);
  const isOnSale = product.sale_enabled && product.sale_price !== null && effectivePrice < originalPrice;

  const handleConfirmAdd = () => {
    addToCart(product, selectedVariant, 1);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 1100 }}>
      <div 
        className="modal-content" 
        onClick={(e) => e.stopPropagation()} 
        style={{ maxWidth: '440px', padding: '24px' }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
          <div>
            <span className="badge badge-red" style={{ marginBottom: '6px' }}>
              {t('quickSelectSize')}
            </span>
            <h3 style={{ fontSize: '18px', fontWeight: 800, lineHeight: 1.3, color: 'var(--text-primary)' }}>
              {name}
            </h3>
          </div>
          <button 
            onClick={onClose} 
            aria-label="Close" 
            style={{ color: 'var(--text-muted)', padding: '4px' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Price Display */}
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '20px' }}>
          <span style={{ fontSize: '24px', fontWeight: 900, color: 'var(--brand-red)' }}>
            ${effectivePrice.toFixed(2)}
          </span>
          {isOnSale && (
            <span style={{ fontSize: '14px', textDecoration: 'line-through', color: 'var(--text-muted)' }}>
              ${originalPrice.toFixed(2)}
            </span>
          )}
        </div>

        {/* Sizes Grid */}
        <div style={{ marginBottom: '24px' }}>
          <label className="form-label" style={{ display: 'block', marginBottom: '10px' }}>
            {t('selectSize')}:
          </label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {variants.map((variant) => {
              const isSelected = selectedVariant?.id === variant.id;
              const isAvailable = variant.is_available !== false;

              return (
                <button
                  key={variant.id || variant.size}
                  type="button"
                  disabled={!isAvailable}
                  onClick={() => setSelectedVariant(variant)}
                  style={{
                    minWidth: '48px',
                    height: '42px',
                    paddingInlineStart: '12px',
                    paddingInlineEnd: '12px',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '13px',
                    fontWeight: 700,
                    border: `1.5px solid ${isSelected ? 'var(--brand-red)' : 'var(--border-medium)'}`,
                    backgroundColor: isSelected ? 'var(--brand-red-light)' : 'var(--bg-input)',
                    color: isSelected ? 'var(--brand-red)' : isAvailable ? 'var(--text-primary)' : 'var(--text-muted)',
                    opacity: isAvailable ? 1 : 0.45,
                    cursor: isAvailable ? 'pointer' : 'not-allowed',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '4px',
                    transition: 'all var(--transition-fast)'
                  }}
                >
                  <span>{variant.size}</span>
                  {isSelected && <Check size={14} color="var(--brand-red)" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            type="button" 
            onClick={onClose} 
            className="btn btn-secondary" 
            style={{ flex: 1 }}
          >
            Cancel
          </button>
          <button 
            type="button" 
            onClick={handleConfirmAdd} 
            disabled={variants.length > 0 && !selectedVariant?.is_available}
            className="btn btn-primary" 
            style={{ flex: 2 }}
          >
            <ShoppingBag size={16} />
            <span>{t('addToCart')}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuickSizeModal;
