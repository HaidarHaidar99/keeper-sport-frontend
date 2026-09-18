import React, { useState, useEffect } from 'react';
import { Package, Plus, Edit2, Trash2, Search, Check, AlertCircle } from 'lucide-react';
import apiClient from '../../services/apiClient';

const standardSizes = ['S', 'M', 'L', 'XL', 'XXL', '39', '40', '41', '42', '43', '44', '45'];

const AdminProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  // Form Fields
  const [nameEn, setNameEn] = useState('');
  const [nameAr, setNameAr] = useState('');
  const [descriptionEn, setDescriptionEn] = useState('');
  const [descriptionAr, setDescriptionAr] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [basePrice, setBasePrice] = useState('');
  const [saleEnabled, setSaleEnabled] = useState(false);
  const [salePrice, setSalePrice] = useState('');
  const [featured, setFeatured] = useState(false);
  const [isActive, setIsActive] = useState(true);

  // Variants state: [{ size, price, physical_stock }]
  const [variants, setVariants] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const fetchCatalog = async () => {
    setLoading(true);
    try {
      const [prodRes, catRes] = await Promise.all([
        apiClient('/products?limit=100'),
        apiClient('/categories')
      ]);
      if (prodRes?.data) setProducts(prodRes.data);
      if (catRes?.data) {
        setCategories(catRes.data);
        if (catRes.data.length > 0 && !categoryId) {
          setCategoryId(catRes.data[0].id);
        }
      }
    } catch (err) {
      console.error("Error loading products", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCatalog();
  }, []);

  const openCreateModal = () => {
    setEditingProduct(null);
    setNameEn('');
    setNameAr('');
    setDescriptionEn('');
    setDescriptionAr('');
    setBasePrice('45.00');
    setSaleEnabled(false);
    setSalePrice('');
    setFeatured(false);
    setIsActive(true);
    setVariants([
      { size: 'S', price: '', physical_stock: 10 },
      { size: 'M', price: '', physical_stock: 15 },
      { size: 'L', price: '', physical_stock: 15 },
      { size: 'XL', price: '', physical_stock: 10 }
    ]);
    setModalOpen(true);
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        name_en: nameEn,
        name_ar: nameAr || nameEn,
        description_en: descriptionEn,
        description_ar: descriptionAr || descriptionEn,
        category_id: categoryId,
        base_price: parseFloat(basePrice),
        sale_enabled: saleEnabled,
        sale_price: saleEnabled && salePrice ? parseFloat(salePrice) : null,
        featured,
        is_active: isActive,
        variants: variants.map((v) => ({
          size: v.size,
          price: v.price ? parseFloat(v.price) : null,
          physical_stock: parseInt(v.physical_stock || 0, 10)
        }))
      };

      if (editingProduct) {
        await apiClient(`/products/${editingProduct.id}`, {
          method: 'PUT',
          body: JSON.stringify(payload)
        });
      } else {
        await apiClient('/products', {
          method: 'POST',
          body: JSON.stringify(payload)
        });
      }

      setModalOpen(false);
      fetchCatalog();
    } catch (err) {
      alert(err.message || "Failed to save product");
    } finally {
      setSubmitting(false);
    }
  };

  const addVariantRow = (size) => {
    if (!variants.some((v) => v.size === size)) {
      setVariants([...variants, { size, price: '', physical_stock: 10 }]);
    }
  };

  const removeVariantRow = (size) => {
    setVariants(variants.filter((v) => v.size !== size));
  };

  const filteredProducts = products.filter((p) =>
    p.name_en?.toLowerCase().includes(search.toLowerCase()) ||
    p.name_ar?.includes(search)
  );

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 900 }}>Product Catalog</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '4px' }}>
            Manage shirts, boots, sizes, variant prices, and live stock.
          </p>
        </div>

        <button onClick={openCreateModal} className="btn btn-primary" style={{ gap: '8px' }}>
          <Plus size={18} />
          <span>Add New Product</span>
        </button>
      </div>

      {/* Search Filter */}
      <div style={{ marginBottom: '20px', maxWidth: '360px', position: 'relative' }}>
        <input
          type="text"
          className="form-input"
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ paddingInlineStart: '38px' }}
        />
        <Search size={16} style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', insetInlineStart: '12px', color: 'var(--text-muted)' }} />
      </div>

      {/* Products Table */}
      <div className="glass-card" style={{ overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>Loading products...</div>
        ) : filteredProducts.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>No products found.</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--bg-input)', borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-secondary)' }}>
                  <th style={{ padding: '14px 18px' }}>Product Name</th>
                  <th style={{ padding: '14px 18px' }}>Category</th>
                  <th style={{ padding: '14px 18px' }}>Base Price</th>
                  <th style={{ padding: '14px 18px' }}>Sale Price</th>
                  <th style={{ padding: '14px 18px' }}>Total Sold</th>
                  <th style={{ padding: '14px 18px' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((p) => (
                  <tr key={p.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={{ padding: '14px 18px', fontWeight: 800 }}>
                      <div>{p.name_en}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{p.name_ar}</div>
                    </td>
                    <td style={{ padding: '14px 18px' }}>
                      <span className="badge badge-cyan">{p.category_name || "Football"}</span>
                    </td>
                    <td style={{ padding: '14px 18px', fontWeight: 700 }}>
                      ${Number(p.base_price).toFixed(2)}
                    </td>
                    <td style={{ padding: '14px 18px' }}>
                      {p.sale_enabled && p.sale_price ? (
                        <span style={{ color: 'var(--accent-red)', fontWeight: 800 }}>${Number(p.sale_price).toFixed(2)}</span>
                      ) : (
                        <span style={{ color: 'var(--text-muted)' }}>—</span>
                      )}
                    </td>
                    <td style={{ padding: '14px 18px', fontWeight: 800, color: 'var(--accent-cyan)' }}>
                      🔥 {p.total_sold || 0}
                    </td>
                    <td style={{ padding: '14px 18px' }}>
                      <span className={`badge ${p.is_active ? 'badge-green' : 'badge-sale'}`}>
                        {p.is_active ? 'Active' : 'Hidden'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Product Add/Edit Modal */}
      {modalOpen && (
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
          <div className="glass-card" style={{
            width: '100%',
            maxWidth: '680px',
            maxHeight: '90vh',
            overflowY: 'auto',
            padding: '32px',
            backgroundColor: 'var(--bg-surface)'
          }}>
            <h2 style={{ fontSize: '20px', fontWeight: 900, marginBottom: '20px' }}>
              {editingProduct ? 'Edit Product' : 'Create New Product'}
            </h2>

            <form onSubmit={handleSaveProduct} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Name (EN)</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    value={nameEn}
                    onChange={(e) => setNameEn(e.target.value)}
                    placeholder="Real Madrid Home Jersey 2026/27"
                  />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Name (AR)</label>
                  <input
                    type="text"
                    className="form-input"
                    value={nameAr}
                    onChange={(e) => setNameAr(e.target.value)}
                    placeholder="قميص ريال مدريد الأساسي 2026/27"
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Category</label>
                  <select
                    className="form-input"
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name_en}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Base Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    className="form-input"
                    value={basePrice}
                    onChange={(e) => setBasePrice(e.target.value)}
                  />
                </div>
              </div>

              {/* Sale Price Toggle */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '12px', backgroundColor: 'var(--bg-input)', borderRadius: 'var(--radius-md)' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: 700 }}>
                  <input
                    type="checkbox"
                    checked={saleEnabled}
                    onChange={(e) => setSaleEnabled(e.target.checked)}
                    style={{ accentColor: 'var(--accent-red)' }}
                  />
                  <span>Enable Discount / Sale</span>
                </label>

                {saleEnabled && (
                  <input
                    type="number"
                    step="0.01"
                    className="form-input"
                    style={{ width: '140px', padding: '6px 10px' }}
                    placeholder="Sale Price $"
                    value={salePrice}
                    onChange={(e) => setSalePrice(e.target.value)}
                  />
                )}
              </div>

              {/* Size Variants Matrix */}
              <div>
                <label className="form-label">Variant Sizes & Stock</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '10px' }}>
                  {standardSizes.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => addVariantRow(s)}
                      className="btn btn-outline btn-sm"
                      style={{ padding: '4px 10px', fontSize: '12px' }}
                    >
                      + {s}
                    </button>
                  ))}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {variants.map((v, i) => (
                    <div key={v.size} style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                      <span className="badge badge-cyan" style={{ minWidth: '40px', textAlign: 'center' }}>{v.size}</span>
                      <input
                        type="number"
                        placeholder="Price Override (optional)"
                        className="form-input"
                        style={{ padding: '6px 10px', fontSize: '13px' }}
                        value={v.price}
                        onChange={(e) => {
                          const updated = [...variants];
                          updated[i].price = e.target.value;
                          setVariants(updated);
                        }}
                      />
                      <input
                        type="number"
                        placeholder="Stock Quantity"
                        className="form-input"
                        style={{ width: '120px', padding: '6px 10px', fontSize: '13px' }}
                        value={v.physical_stock}
                        onChange={(e) => {
                          const updated = [...variants];
                          updated[i].physical_stock = e.target.value;
                          setVariants(updated);
                        }}
                      />
                      <button type="button" onClick={() => removeVariantRow(v.size)} style={{ color: 'var(--accent-red)' }}>
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '14px' }}>
                <button type="submit" disabled={submitting} className="btn btn-primary" style={{ flex: 1 }}>
                  {submitting ? "Saving..." : "Save Product"}
                </button>
                <button type="button" onClick={() => setModalOpen(false)} className="btn btn-ghost">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProductsPage;
