import React from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Trash2, ShoppingBag, Plus, Minus, ArrowRight, ArrowLeft, ShieldAlert } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useLanguage } from '../../context/LanguageContext';

const CartDrawer = () => {
  const { isCartOpen, closeCart, items, updateQuantity, removeFromCart, subtotal, totalCount } = useCart();
  const { t, language, isRtl } = useLanguage();
  const navigate = useNavigate();

  if (!isCartOpen) return null;

  const handleCheckoutClick = () => {
    closeCart();
    navigate('/checkout');
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 200,
      display: 'flex',
      justifyContent: isRtl ? 'flex-start' : 'flex-end',
      backgroundColor: 'rgba(0, 0, 0, 0.65)',
      backdropFilter: 'blur(6px)',
      WebkitBackdropFilter: 'blur(6px)'
    }}>
      {/* Backdrop click area */}
      <div 
        onClick={closeCart} 
        style={{ position: 'absolute', inset: 0 }} 
      />

      {/* Slide Drawer Content */}
      <aside style={{
        position: 'relative',
        width: '100%',
        maxWidth: '440px',
        height: '100%',
        backgroundColor: 'var(--bg-surface)',
        borderLeft: isRtl ? 'none' : '1px solid var(--border-medium)',
        borderRight: isRtl ? '1px solid var(--border-medium)' : 'none',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: 'var(--shadow-lg)',
        zIndex: 1
      }}>
        {/* Drawer Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <ShoppingBag size={20} color="var(--accent-cyan)" />
            <h2 style={{ fontSize: '17px', fontWeight: 800 }}>{t('cartTitle')}</h2>
            <span className="badge badge-cyan">{totalCount}</span>
          </div>
          <button onClick={closeCart} className="btn btn-ghost btn-icon">
            <X size={20} />
          </button>
        </div>

        {/* Policy Notification */}
        <div style={{
          padding: '10px 20px',
          backgroundColor: 'rgba(255, 184, 0, 0.08)',
          borderBottom: '1px solid rgba(255, 184, 0, 0.2)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '12px',
          color: 'var(--accent-gold)'
        }}>
          <ShieldAlert size={15} style={{ flexShrink: 0 }} />
          <span>{isRtl ? "تنبيه: سياسة المتجر استبدال المقاس فقط (لا يوجد استرجاع للأموال)" : "Store Policy: Exchanges Only — No Refunds"}</span>
        </div>

        {/* Items List */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '20px'
        }}>
          {items.length === 0 ? (
            <div style={{
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-muted)',
              textAlign: 'center',
              gap: '12px'
            }}>
              <ShoppingBag size={48} strokeWidth={1.5} color="var(--border-medium)" />
              <p style={{ fontSize: '15px' }}>{t('emptyCart')}</p>
              <button onClick={() => { closeCart(); navigate('/products'); }} className="btn btn-primary btn-sm">
                {t('allProducts')}
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {items.map((item) => (
                <div key={item.id} style={{
                  display: 'flex',
                  gap: '14px',
                  padding: '12px',
                  backgroundColor: 'var(--bg-card)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-subtle)',
                  alignItems: 'center'
                }}>
                  {/* Item Image */}
                  <div style={{
                    width: '68px',
                    height: '68px',
                    borderRadius: 'var(--radius-sm)',
                    overflow: 'hidden',
                    backgroundColor: 'var(--bg-primary)',
                    flexShrink: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {item.image_url ? (
                      <img src={item.image_url} alt={item.name_en} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <ShoppingBag size={24} color="var(--text-muted)" />
                    )}
                  </div>

                  {/* Details */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h4 style={{
                      fontSize: '14px',
                      fontWeight: 700,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}>
                      {language === 'ar' ? (item.name_ar || item.name_en) : item.name_en}
                    </h4>

                    {/* Size & Custom Kit badge */}
                    <div style={{ display: 'flex', gap: '6px', margin: '4px 0', flexWrap: 'wrap' }}>
                      {item.size && (
                        <span className="badge badge-cyan" style={{ fontSize: '10px' }}>
                          {t('size')}: {item.size}
                        </span>
                      )}
                      {item.customKitDetails && (
                        <span className="badge badge-gold" style={{ fontSize: '10px' }}>
                          #{item.customKitDetails.number} {item.customKitDetails.name}
                        </span>
                      )}
                    </div>

                    <div style={{ fontWeight: 800, color: 'var(--accent-cyan)', fontSize: '14px' }}>
                      ${Number(item.price).toFixed(2)}
                    </div>
                  </div>

                  {/* Quantity Stepper & Remove */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
                    <button 
                      onClick={() => removeFromCart(item.id)} 
                      style={{ color: 'var(--text-muted)', padding: '2px' }}
                      title="Remove"
                    >
                      <Trash2 size={15} />
                    </button>

                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      backgroundColor: 'var(--bg-surface)',
                      borderRadius: 'var(--radius-xs)',
                      border: '1px solid var(--border-subtle)',
                      overflow: 'hidden'
                    }}>
                      <button 
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        style={{ padding: '4px 8px', color: 'var(--text-secondary)' }}
                      >
                        <Minus size={12} />
                      </button>
                      <span style={{ fontSize: '13px', fontWeight: 700, minWidth: '22px', textAlign: 'center' }}>
                        {item.quantity}
                      </span>
                      <button 
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        style={{ padding: '4px 8px', color: 'var(--text-secondary)' }}
                      >
                        <Plus size={12} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Drawer Footer with Subtotal and Checkout CTA */}
        {items.length > 0 && (
          <div style={{
            padding: '20px 24px',
            borderTop: '1px solid var(--border-subtle)',
            backgroundColor: 'var(--bg-surface)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
              <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>{t('subtotal')}</span>
              <span style={{ fontSize: '20px', fontWeight: 900, color: 'var(--text-primary)' }}>
                ${subtotal.toFixed(2)}
              </span>
            </div>

            <button 
              onClick={handleCheckoutClick}
              className="btn btn-primary btn-lg"
              style={{ width: '100%', gap: '10px' }}
            >
              <span>{t('proceedToCheckout')}</span>
              {isRtl ? <ArrowLeft size={18} /> : <ArrowRight size={18} />}
            </button>
          </div>
        )}
      </aside>
    </div>
  );
};

export default CartDrawer;
