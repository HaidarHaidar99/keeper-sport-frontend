import React, { useState, useEffect } from 'react';
import { Store, Plus, CheckCircle2, AlertCircle, ShoppingCart } from 'lucide-react';
import apiClient from '../../services/apiClient';

const AdminInventoryPage = () => {
  const [products, setProducts] = useState([]);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedVariantId, setSelectedVariantId] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [posNotes, setPosNotes] = useState('Walk-in store cash sale');
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Restock state
  const [restockQty, setRestockQty] = useState(10);
  const [restockReason, setRestockReason] = useState('Supplier shipment batch');

  useEffect(() => {
    apiClient('/products?limit=100')
      .then((res) => {
        if (res?.data && res.data.length > 0) {
          setProducts(res.data);
          setSelectedProductId(res.data[0].id);
        }
      })
      .catch((e) => console.error("Error loading products", e));
  }, []);

  useEffect(() => {
    if (selectedProductId) {
      apiClient(`/products/${selectedProductId}`).then((res) => {
        if (res?.data) {
          setSelectedProduct(res.data);
          if (res.data.variants && res.data.variants.length > 0) {
            setSelectedVariantId(res.data.variants[0].id);
          }
        }
      });
    }
  }, [selectedProductId]);

  const handlePosSale = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      await apiClient('/inventory/pos-sale', {
        method: 'POST',
        body: JSON.stringify({
          variant_id: selectedVariantId,
          quantity: parseInt(quantity, 10),
          notes: posNotes
        })
      });
      setSuccessMsg(`✓ Successfully recorded physical store sale for ${quantity} item(s)! Stock updated atomically.`);
      // Refresh current product
      const updated = await apiClient(`/products/${selectedProductId}`);
      if (updated?.data) setSelectedProduct(updated.data);
    } catch (err) {
      setErrorMsg(err.message || "Failed to record POS sale (insufficient stock)");
    } finally {
      setSubmitting(false);
    }
  };

  const handleRestock = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      await apiClient('/inventory/restock', {
        method: 'POST',
        body: JSON.stringify({
          variant_id: selectedVariantId,
          quantity_change: parseInt(restockQty, 10),
          reason: restockReason
        })
      });
      setSuccessMsg(`✓ Successfully restocked ${restockQty} units!`);
      const updated = await apiClient(`/products/${selectedProductId}`);
      if (updated?.data) setSelectedProduct(updated.data);
    } catch (err) {
      setErrorMsg(err.message || "Failed to restock");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 900 }}>Inventory & Physical Store POS</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '4px' }}>
          Record in-store walk-in sales and manage stock balances shared between retail and online.
        </p>
      </div>

      {successMsg && (
        <div style={{ padding: '14px', backgroundColor: 'rgba(0,229,153,0.1)', color: 'var(--accent-green)', borderRadius: 'var(--radius-md)', display: 'flex', gap: '8px', marginBottom: '20px' }}>
          <CheckCircle2 size={18} />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div style={{ padding: '14px', backgroundColor: 'rgba(255,59,48,0.1)', color: 'var(--accent-red)', borderRadius: 'var(--radius-md)', display: 'flex', gap: '8px', marginBottom: '20px' }}>
          <AlertCircle size={18} />
          <span>{errorMsg}</span>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '32px', alignItems: 'flex-start' }}>
        {/* ── POS Walk-in Sale Form ── */}
        <div className="glass-card glow-card-cyan" style={{ padding: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
            <Store size={22} color="var(--accent-cyan)" />
            <h2 style={{ fontSize: '18px', fontWeight: 900 }}>Point of Sale: Walk-in Cash Sale</h2>
          </div>

          <form onSubmit={handlePosSale} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label className="form-label">Select Product</label>
              <select
                className="form-input"
                value={selectedProductId}
                onChange={(e) => setSelectedProductId(e.target.value)}
              >
                {products.map((p) => (
                  <option key={p.id} value={p.id}>{p.name_en} (${Number(p.base_price).toFixed(2)})</option>
                ))}
              </select>
            </div>

            {selectedProduct?.variants && selectedProduct.variants.length > 0 && (
              <div>
                <label className="form-label">Select Variant Size</label>
                <select
                  className="form-input"
                  value={selectedVariantId}
                  onChange={(e) => setSelectedVariantId(e.target.value)}
                >
                  {selectedProduct.variants.map((v) => (
                    <option key={v.id} value={v.id}>
                      Size {v.size} — In Stock: {v.available_stock || 0} units
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Sold Quantity</label>
              <input
                type="number"
                min="1"
                required
                className="form-input"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Audit Notes</label>
              <input
                type="text"
                className="form-input"
                value={posNotes}
                onChange={(e) => setPosNotes(e.target.value)}
              />
            </div>

            <button type="submit" disabled={submitting} className="btn btn-primary btn-lg" style={{ marginTop: '10px' }}>
              {submitting ? "Processing..." : "Deduct & Record POS Sale"}
            </button>
          </form>
        </div>

        {/* ── Restock Adjustment Form ── */}
        <div className="glass-card" style={{ padding: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
            <Plus size={22} color="var(--accent-gold)" />
            <h2 style={{ fontSize: '18px', fontWeight: 900 }}>Receive Stock Shipment</h2>
          </div>

          <form onSubmit={handleRestock} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Quantity to Add</label>
              <input
                type="number"
                min="1"
                required
                className="form-input"
                value={restockQty}
                onChange={(e) => setRestockQty(e.target.value)}
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Shipment Batch / Reason</label>
              <input
                type="text"
                className="form-input"
                value={restockReason}
                onChange={(e) => setRestockReason(e.target.value)}
              />
            </div>

            <button type="submit" disabled={submitting} className="btn btn-gold btn-lg" style={{ marginTop: '10px' }}>
              {submitting ? "Restocking..." : "Add Stock to Variant"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminInventoryPage;
