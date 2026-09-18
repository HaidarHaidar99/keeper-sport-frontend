import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Package, 
  Truck, 
  MapPin, 
  Phone, 
  User, 
  RefreshCw, 
  ShieldAlert, 
  Clock, 
  CheckCircle2, 
  XCircle,
  AlertCircle
} from 'lucide-react';
import apiClient from '../services/apiClient';
import { useLanguage } from '../context/LanguageContext';

const steps = ['Pending', 'Confirmed', 'Shipped', 'Delivered'];

const OrderDetailPage = () => {
  const { id } = useParams();
  const { t, language, isRtl } = useLanguage();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Exchange modal states
  const [exchangeModalOpen, setExchangeModalOpen] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState('');
  const [requestedSize, setRequestedSize] = useState('M');
  const [exchangeReason, setExchangeReason] = useState('');
  const [submittingExchange, setSubmittingExchange] = useState(false);
  const [exchangeSuccess, setExchangeSuccess] = useState('');

  useEffect(() => {
    const fetchOrder = async () => {
      setLoading(true);
      try {
        const res = await apiClient(`/orders/${id}`);
        if (res?.data) {
          setOrder(res.data);
          if (res.data.order_items && res.data.order_items.length > 0) {
            setSelectedItemId(res.data.order_items[0].id);
          }
        }
      } catch (err) {
        setError(err.message || "Failed to load order details");
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id]);

  if (loading) {
    return (
      <div className="container" style={{ padding: '80px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
        Loading order details...
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="container" style={{ padding: '80px 20px', textAlign: 'center' }}>
        <h2 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '12px' }}>Order Not Found</h2>
        <Link to="/my-orders" className="btn btn-primary">Back to Orders</Link>
      </div>
    );
  }

  const currentStepIdx = steps.indexOf(order.order_status);
  const isDelivered = order.order_status === 'Delivered';
  const isCancelled = ['Cancelled', 'Declined'].includes(order.order_status);

  const handleExchangeSubmit = async (e) => {
    e.preventDefault();
    setSubmittingExchange(true);
    try {
      await apiClient('/exchanges', {
        method: 'POST',
        body: JSON.stringify({
          order_id: order.id,
          order_item_id: selectedItemId,
          requested_size: requestedSize,
          reason: exchangeReason
        })
      });
      setExchangeSuccess(isRtl ? "تم استلام طلب استبدال المقاس بنجاح! سنتواصل معك لترتيب التبديل." : "Exchange request submitted successfully! We will coordinate the size swap.");
      setTimeout(() => {
        setExchangeModalOpen(false);
        setExchangeSuccess('');
      }, 3000);
    } catch (err) {
      alert(err.message || "Failed to submit exchange request");
    } finally {
      setSubmittingExchange(false);
    }
  };

  return (
    <div style={{ padding: '50px 0 80px' }}>
      <div className="container" style={{ maxWidth: '840px' }}>
        {/* Top Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{t('orderNumber')}</span>
            <h1 style={{ fontSize: '28px', fontWeight: 900, color: 'var(--accent-cyan)' }}>
              #{order.order_number || order.id.slice(0, 8).toUpperCase()}
            </h1>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            {isDelivered && (
              <button 
                onClick={() => setExchangeModalOpen(true)}
                className="btn btn-gold btn-sm"
                style={{ gap: '6px' }}
              >
                <RefreshCw size={15} />
                <span>{t('requestExchange')}</span>
              </button>
            )}
            <Link to="/my-orders" className="btn btn-outline btn-sm">
              {isRtl ? "كافة الطلبات" : "Back to Orders"}
            </Link>
          </div>
        </div>

        {/* ── Status Progress Stepper ── */}
        <div className="glass-card" style={{ padding: '32px 24px', marginBottom: '32px' }}>
          {isCancelled ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--accent-red)' }}>
              <XCircle size={28} />
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 800 }}>
                  {order.order_status === 'Declined' ? (isRtl ? "تم رفض الطلب" : "Order Declined") : (isRtl ? "تم إلغاء الطلب" : "Order Cancelled")}
                </h3>
                {order.rejection_reason && (
                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                    Reason: {order.rejection_reason}
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative' }}>
              {steps.map((s, idx) => {
                const isPassed = currentStepIdx >= idx;
                const isCurrent = currentStepIdx === idx;
                return (
                  <div key={s} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, zIndex: 1 }}>
                    <div style={{
                      width: '38px',
                      height: '38px',
                      borderRadius: '50%',
                      backgroundColor: isPassed ? 'var(--accent-cyan)' : 'var(--bg-input)',
                      color: isPassed ? '#040914' : 'var(--text-muted)',
                      border: isCurrent ? '3px solid var(--accent-gold)' : '1px solid var(--border-medium)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 900,
                      marginBottom: '8px',
                      boxShadow: isPassed ? '0 0 16px var(--accent-cyan-glow)' : 'none'
                    }}>
                      {isPassed ? <CheckCircle2 size={18} /> : idx + 1}
                    </div>
                    <span style={{ fontSize: '12px', fontWeight: isPassed ? 800 : 500, color: isPassed ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                      {s}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ── Order Items Breakdown ── */}
        <div className="glass-card" style={{ padding: '28px', marginBottom: '32px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 900, marginBottom: '18px' }}>
            {isRtl ? "محتويات الطلب" : "Order Items"}
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {order.order_items?.map((item) => (
              <div key={item.id} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingBottom: '16px',
                borderBottom: '1px solid var(--border-subtle)',
                fontSize: '14px'
              }}>
                <div>
                  <div style={{ fontWeight: 800 }}>{item.products?.name_en || "Football Gear Item"}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'flex', gap: '8px', marginTop: '4px' }}>
                    {item.product_variants?.size && (
                      <span className="badge badge-cyan">{t('size')}: {item.product_variants.size}</span>
                    )}
                    <span>Qty: {item.quantity}</span>
                  </div>
                </div>
                <div style={{ fontWeight: 800, fontSize: '15px' }}>
                  ${(Number(item.price_at_purchase) * item.quantity).toFixed(2)}
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '16px', fontSize: '17px', fontWeight: 900 }}>
            <span>{t('total')}</span>
            <span style={{ color: 'var(--accent-cyan)' }}>${Number(order.total_amount).toFixed(2)}</span>
          </div>
        </div>

        {/* ── Delivery Details Snapshot ── */}
        <div className="glass-card" style={{ padding: '28px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 900, marginBottom: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <MapPin size={18} color="var(--accent-cyan)" />
            <span>{t('deliveryDetails')}</span>
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', fontSize: '14px' }}>
            <div>
              <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>{t('fullName')}:</span>
              <div style={{ fontWeight: 700 }}>{order.customer_name}</div>
            </div>
            <div>
              <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>{t('phone')}:</span>
              <div style={{ fontWeight: 700 }}>{order.delivery_phone}</div>
            </div>
            <div>
              <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>{t('city')}:</span>
              <div style={{ fontWeight: 700 }}>{order.delivery_city}</div>
            </div>
            <div>
              <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>{t('address')}:</span>
              <div style={{ fontWeight: 700 }}>{order.delivery_address}</div>
            </div>
          </div>
        </div>

        {/* ── Size Exchange Request Modal ── */}
        {exchangeModalOpen && (
          <div style={{
            position: 'fixed',
            inset: 0,
            zIndex: 300,
            backgroundColor: 'rgba(0,0,0,0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}>
            <div style={{
              width: '100%',
              maxWidth: '480px',
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-medium)',
              borderRadius: 'var(--radius-lg)',
              padding: '28px'
            }}>
              <h3 style={{ fontSize: '20px', fontWeight: 900, marginBottom: '8px' }}>
                {t('requestExchange')}
              </h3>
              <p style={{ fontSize: '13px', color: 'var(--accent-gold)', marginBottom: '16px' }}>
                {t('exchangeNotice')}
              </p>

              {exchangeSuccess ? (
                <div style={{ padding: '20px', backgroundColor: 'rgba(0,229,153,0.1)', color: 'var(--accent-green)', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
                  {exchangeSuccess}
                </div>
              ) : (
                <form onSubmit={handleExchangeSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div>
                    <label className="form-label">{isRtl ? "اختر القطعة المراد استبدالها" : "Select Item to Swap"}</label>
                    <select
                      className="form-input"
                      value={selectedItemId}
                      onChange={(e) => setSelectedItemId(e.target.value)}
                    >
                      {order.order_items?.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.products?.name_en} (Current Size: {item.product_variants?.size || 'N/A'})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="form-label">{isRtl ? "المقاس البديل المطلوب" : "Requested Replacement Size"}</label>
                    <select
                      className="form-input"
                      value={requestedSize}
                      onChange={(e) => setRequestedSize(e.target.value)}
                    >
                      {['S', 'M', 'L', 'XL', 'XXL', '39', '40', '41', '42', '43', '44', '45'].map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="form-label">{isRtl ? "سبب الاستبدال" : "Reason for Exchange"}</label>
                    <textarea
                      required
                      rows={3}
                      className="form-input"
                      placeholder={isRtl ? "مثال: المقاس الحالي ضيق قليلاً وأريد مقاساً أكبر..." : "e.g. Current size is too tight, requesting one size up..."}
                      value={exchangeReason}
                      onChange={(e) => setExchangeReason(e.target.value)}
                    />
                  </div>

                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button type="submit" disabled={submittingExchange} className="btn btn-primary" style={{ flex: 1 }}>
                      {submittingExchange ? "Submitting..." : (isRtl ? "إرسال طلب الاستبدال" : "Submit Exchange Request")}
                    </button>
                    <button type="button" onClick={() => setExchangeModalOpen(false)} className="btn btn-ghost">
                      {isRtl ? "إلغاء" : "Cancel"}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderDetailPage;
