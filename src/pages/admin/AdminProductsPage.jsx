import React, { useState, useEffect } from 'react';
import { 
  Package, 
  Plus, 
  Edit2, 
  Trash2, 
  Search, 
  Check, 
  AlertCircle, 
  Upload, 
  Image as ImageIcon,
  Layers,
  X
} from 'lucide-react';
import apiClient from '../../services/apiClient';

const clothingSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
const shoeSizes = ['38', '39', '40', '41', '42', '43', '44', '45'];

const AdminProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [activeTab, setActiveTab] = useState('general'); // 'general' | 'pricing' | 'images' | 'sizes'

  // Form Fields
  const [nameEn, setNameEn] = useState('');
  const [nameAr, setNameAr] = useState('');
  const [descriptionEn, setDescriptionEn] = useState('');
  const [descriptionAr, setDescriptionAr] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [basePrice, setBasePrice] = useState('45.00');
  const [saleEnabled, setSaleEnabled] = useState(false);
  const [salePrice, setSalePrice] = useState('');
  const [featured, setFeatured] = useState(false);
  const [isActive, setIsActive] = useState(true);

  // Images state (1 to 3 image URLs)
  const [images, setImages] = useState(['']);

  // Sizing Matrix State
  const [hasSizes, setHasSizes] = useState(true);
  // Array of { size, price, physical_stock, track_quantity }
  const [variants, setVariants] = useState([]);

  const [submitting, setSubmitting] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');

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
    setCategoryId(categories[0]?.id || '');
    setBasePrice('45.00');
    setSaleEnabled(false);
    setSalePrice('');
    setFeatured(false);
    setIsActive(true);
    setImages(['']);
    setHasSizes(true);
    setVariants([
      { size: 'S', price: '', physical_stock: 10, track_quantity: true },
      { size: 'M', price: '', physical_stock: 15, track_quantity: true },
      { size: 'L', price: '', physical_stock: 15, track_quantity: true },
      { size: 'XL', price: '', physical_stock: 10, track_quantity: true }
    ]);
    setActiveTab('general');
    setModalOpen(true);
  };

  const openEditModal = async (product) => {
    setEditingProduct(product);
    try {
      const res = await apiClient(`/products/${product.id}`);
      const full = res?.data || product;

      setNameEn(full.name_en || '');
      setNameAr(full.name_ar || '');
      setDescriptionEn(full.description_en || '');
      setDescriptionAr(full.description_ar || '');
      setCategoryId(full.category_id || categories[0]?.id || '');
      setBasePrice(String(full.base_price || ''));
      setSaleEnabled(Boolean(full.is_sale_enabled));
      setSalePrice(full.sale_price ? String(full.sale_price) : '');
      setFeatured(Boolean(full.is_featured));
      setIsActive(Boolean(full.is_active));

      // Load images
      if (full.product_images && full.product_images.length > 0) {
        setImages(full.product_images.map(img => img.image_url));
      } else {
        setImages([full.primary_image || full.image_url || '']);
      }

      // Load variants
      const vars = full.product_variants || full.variants || [];
      if (vars.length > 0) {
        setHasSizes(true);
        setVariants(vars.map(v => ({
          size: v.size,
          price: v.price !== null && v.price !== undefined ? String(v.price) : '',
          physical_stock: v.physical_stock !== undefined ? v.physical_stock : 10,
          track_quantity: v.track_quantity !== undefined ? v.track_quantity : true
        })));
      } else {
        setHasSizes(false);
        setVariants([]);
      }

      setActiveTab('general');
      setModalOpen(true);
    } catch (err) {
      alert("Failed to load product details for editing: " + err.message);
    }
  };

  // Toggle size checkbox in matrix
  const toggleSizeSelection = (sizeName) => {
    const existingIndex = variants.findIndex(v => v.size === sizeName);
    if (existingIndex > -1) {
      setVariants(variants.filter(v => v.size !== sizeName));
    } else {
      setVariants([
        ...variants,
        { size: sizeName, price: '', physical_stock: 10, track_quantity: true }
      ]);
    }
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setStatusMsg('');

    try {
      const validImages = images.filter(img => img && img.trim().length > 0).slice(0, 3);
      if (validImages.length === 0) {
        throw new Error("At least 1 product image URL is required (max 3).");
      }

      const payload = {
        name_en: nameEn.trim(),
        name_ar: (nameAr || nameEn).trim(),
        description_en: descriptionEn.trim(),
        description_ar: (descriptionAr || descriptionEn).trim(),
        category_id: categoryId,
        base_price: parseFloat(basePrice),
        is_sale_enabled: saleEnabled,
        sale_price: saleEnabled && salePrice ? parseFloat(salePrice) : null,
        is_featured: featured,
        is_active: isActive,
        images: validImages,
        variants: hasSizes
          ? variants.map((v) => ({
              size: v.size,
              price: v.price ? parseFloat(v.price) : null,
              physical_stock: parseInt(v.physical_stock || 0, 10),
              track_quantity: v.track_quantity !== false
            }))
          : []
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

  const handleDeactivate = async (id) => {
    if (!window.confirm("Are you sure you want to deactivate this product?")) return;
    try {
      await apiClient(`/products/${id}`, { method: 'DELETE' });
      fetchCatalog();
    } catch (err) {
      alert("Failed to deactivate: " + err.message);
    }
  };

  const filteredProducts = products.filter((p) =>
    p.name_en?.toLowerCase().includes(search.toLowerCase()) ||
    p.name_ar?.includes(search)
  );

  return (
    <div>
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 900, color: 'var(--text-primary)' }}>Product Catalog</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '4px' }}>
            Authoritative inventory, multi-size matrix pricing, and image management.
          </p>
        </div>

        <button onClick={openCreateModal} className="btn btn-primary" style={{ gap: '8px' }}>
          <Plus size={18} />
          <span>Add New Product</span>
        </button>
      </div>

      {/* Search Input */}
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
      <div className="card" style={{ overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>Loading products...</div>
        ) : filteredProducts.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>No products found.</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--bg-surface)', borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-secondary)' }}>
                  <th style={{ padding: '14px 18px' }}>Product</th>
                  <th style={{ padding: '14px 18px' }}>Category</th>
                  <th style={{ padding: '14px 18px' }}>Base Price</th>
                  <th style={{ padding: '14px 18px' }}>Sale Price</th>
                  <th style={{ padding: '14px 18px' }}>Total Sold</th>
                  <th style={{ padding: '14px 18px' }}>Status</th>
                  <th style={{ padding: '14px 18px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((p) => (
                  <tr key={p.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={{ padding: '14px 18px' }}>
                      <div style={{ fontWeight: 800, color: 'var(--text-primary)' }}>{p.name_en}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{p.name_ar}</div>
                    </td>
                    <td style={{ padding: '14px 18px' }}>
                      <span className="badge badge-red">{p.category_name || "Football"}</span>
                    </td>
                    <td style={{ padding: '14px 18px', fontWeight: 700 }}>
                      ${Number(p.base_price).toFixed(2)}
                    </td>
                    <td style={{ padding: '14px 18px' }}>
                      {p.is_sale_enabled && p.sale_price ? (
                        <span style={{ color: 'var(--brand-red)', fontWeight: 800 }}>${Number(p.sale_price).toFixed(2)}</span>
                      ) : (
                        <span style={{ color: 'var(--text-muted)' }}>—</span>
                      )}
                    </td>
                    <td style={{ padding: '14px 18px', fontWeight: 800 }}>
                      {p.total_sold || 0}
                    </td>
                    <td style={{ padding: '14px 18px' }}>
                      <span className={`badge ${p.is_active ? 'badge-green' : 'badge-red'}`}>
                        {p.is_active ? 'Active' : 'Hidden'}
                      </span>
                    </td>
                    <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '8px' }}>
                        <button
                          type="button"
                          onClick={() => openEditModal(p)}
                          className="btn btn-secondary btn-sm"
                          title="Edit Product"
                        >
                          <Edit2 size={14} />
                          <span>Edit</span>
                        </button>
                        {p.is_active && (
                          <button
                            type="button"
                            onClick={() => handleDeactivate(p.id)}
                            className="btn btn-outline-red btn-sm"
                            title="Deactivate Product"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Logical Tabbed Product Modal */}
      {modalOpen && (
        <div className="modal-overlay" style={{ zIndex: 1200 }}>
          <div className="modal-content" style={{ maxWidth: '720px', padding: '28px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: 900, color: 'var(--text-primary)' }}>
                {editingProduct ? 'Edit Product' : 'Create New Product'}
              </h2>
              <button 
                type="button" 
                onClick={() => setModalOpen(false)}
                style={{ padding: '4px', color: 'var(--text-muted)' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Logical Tabs: General | Pricing | Images | Sizing & Stock */}
            <div style={{
              display: 'flex',
              gap: '4px',
              backgroundColor: 'var(--bg-input)',
              padding: '4px',
              borderRadius: 'var(--radius-sm)',
              marginBottom: '20px'
            }}>
              {[
                { id: 'general', label: '1. General' },
                { id: 'pricing', label: '2. Pricing & Status' },
                { id: 'images', label: '3. Images (1–3)' },
                { id: 'sizes', label: '4. Sizing Matrix' }
              ].map(tab => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    flex: 1,
                    padding: '8px',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '12px',
                    fontWeight: 800,
                    backgroundColor: activeTab === tab.id ? 'var(--brand-red)' : 'transparent',
                    color: activeTab === tab.id ? '#FFFFFF' : 'var(--text-secondary)',
                    transition: 'all var(--transition-fast)'
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <form onSubmit={handleSaveProduct}>
              {/* Tab 1: General */}
              {activeTab === 'general' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">Name (EN) *</label>
                      <input
                        type="text"
                        required
                        className="form-input"
                        value={nameEn}
                        onChange={(e) => setNameEn(e.target.value)}
                        placeholder="Real Madrid Home Kit 2026/27"
                      />
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">Name (AR) *</label>
                      <input
                        type="text"
                        required
                        className="form-input"
                        value={nameAr}
                        onChange={(e) => setNameAr(e.target.value)}
                        placeholder="طقم ريال مدريد الأساسي 2026/27"
                      />
                    </div>
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Category *</label>
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

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">Description (EN)</label>
                      <textarea
                        className="form-textarea"
                        value={descriptionEn}
                        onChange={(e) => setDescriptionEn(e.target.value)}
                        placeholder="Official player edition kit details..."
                      />
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">Description (AR)</label>
                      <textarea
                        className="form-textarea"
                        value={descriptionAr}
                        onChange={(e) => setDescriptionAr(e.target.value)}
                        placeholder="مواصفات وتفاصيل الطقم الرسمي..."
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 2: Pricing & Status */}
              {activeTab === 'pricing' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Base / Main Price ($) *</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      className="form-input"
                      value={basePrice}
                      onChange={(e) => setBasePrice(e.target.value)}
                    />
                  </div>

                  {/* Sale Toggle */}
                  <div style={{ padding: '14px', backgroundColor: 'var(--bg-input)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-medium)' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '13px', fontWeight: 800 }}>
                      <input
                        type="checkbox"
                        checked={saleEnabled}
                        onChange={(e) => setSaleEnabled(e.target.checked)}
                        style={{ accentColor: 'var(--brand-red)', width: '16px', height: '16px' }}
                      />
                      <span>Enable Sale Price</span>
                    </label>

                    {saleEnabled && (
                      <div style={{ marginTop: '10px' }}>
                        <label className="form-label">Sale Price ($) *</label>
                        <input
                          type="number"
                          step="0.01"
                          required={saleEnabled}
                          className="form-input"
                          value={salePrice}
                          onChange={(e) => setSalePrice(e.target.value)}
                          placeholder="Sale price (must be less than base price)"
                        />
                      </div>
                    )}
                  </div>

                  {/* Featured & Active Toggles */}
                  <div style={{ display: 'flex', gap: '24px', padding: '10px 0' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: 700 }}>
                      <input
                        type="checkbox"
                        checked={featured}
                        onChange={(e) => setFeatured(e.target.checked)}
                        style={{ accentColor: 'var(--brand-red)', width: '16px', height: '16px' }}
                      />
                      <span>Featured Product</span>
                    </label>

                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: 700 }}>
                      <input
                        type="checkbox"
                        checked={isActive}
                        onChange={(e) => setIsActive(e.target.checked)}
                        style={{ accentColor: 'var(--brand-red)', width: '16px', height: '16px' }}
                      />
                      <span>Active / Published in Store</span>
                    </label>
                  </div>
                </div>
              )}

              {/* Tab 3: Images (1 to 3 images, Supabase Storage URLs) */}
              {activeTab === 'images' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                    Provide 1 to 3 image URLs stored in Supabase Storage. The first image serves as the primary catalog cover.
                  </p>

                  {[0, 1, 2].map((idx) => (
                    <div key={idx} className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">Image #{idx + 1} URL {idx === 0 ? '*' : '(Optional)'}</label>
                      <input
                        type="url"
                        required={idx === 0}
                        className="form-input"
                        placeholder={`https://.../storage/v1/object/public/products/image${idx + 1}.jpg`}
                        value={images[idx] || ''}
                        onChange={(e) => {
                          const updated = [...images];
                          updated[idx] = e.target.value;
                          setImages(updated);
                        }}
                      />
                    </div>
                  ))}
                </div>
              )}

              {/* Tab 4: Sizes & Inventory Matrix */}
              {activeTab === 'sizes' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '13px', fontWeight: 800 }}>
                    <input
                      type="checkbox"
                      checked={hasSizes}
                      onChange={(e) => setHasSizes(e.target.checked)}
                      style={{ accentColor: 'var(--brand-red)', width: '16px', height: '16px' }}
                    />
                    <span>This product has size variants (Clothing / Shoes)</span>
                  </label>

                  {hasSizes && (
                    <>
                      {/* Clothing Checkboxes */}
                      <div>
                        <div style={{ fontSize: '12px', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '8px' }}>
                          Select Clothing Sizes (Checkboxes):
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                          {clothingSizes.map((s) => {
                            const isChecked = variants.some(v => v.size === s);
                            return (
                              <button
                                key={s}
                                type="button"
                                onClick={() => toggleSizeSelection(s)}
                                style={{
                                  padding: '6px 14px',
                                  borderRadius: 'var(--radius-sm)',
                                  fontSize: '12px',
                                  fontWeight: 800,
                                  border: `1.5px solid ${isChecked ? 'var(--brand-red)' : 'var(--border-medium)'}`,
                                  backgroundColor: isChecked ? 'var(--brand-red-light)' : 'var(--bg-input)',
                                  color: isChecked ? 'var(--brand-red)' : 'var(--text-secondary)',
                                  cursor: 'pointer'
                                }}
                              >
                                {isChecked ? `✓ ${s}` : s}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Shoe Checkboxes */}
                      <div>
                        <div style={{ fontSize: '12px', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '8px' }}>
                          Select Shoe Sizes (Checkboxes):
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                          {shoeSizes.map((s) => {
                            const isChecked = variants.some(v => v.size === s);
                            return (
                              <button
                                key={s}
                                type="button"
                                onClick={() => toggleSizeSelection(s)}
                                style={{
                                  padding: '6px 14px',
                                  borderRadius: 'var(--radius-sm)',
                                  fontSize: '12px',
                                  fontWeight: 800,
                                  border: `1.5px solid ${isChecked ? 'var(--brand-red)' : 'var(--border-medium)'}`,
                                  backgroundColor: isChecked ? 'var(--brand-red-light)' : 'var(--bg-input)',
                                  color: isChecked ? 'var(--brand-red)' : 'var(--text-secondary)',
                                  cursor: 'pointer'
                                }}
                              >
                                {isChecked ? `✓ ${s}` : s}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Size Matrix Table: Independent Price & Stock */}
                      {variants.length > 0 && (
                        <div style={{ marginTop: '10px' }}>
                          <div style={{ fontSize: '12px', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '8px' }}>
                            Configure Individual Size Prices & Live Stock:
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {variants.map((v, idx) => (
                              <div key={v.size} style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                <span className="badge badge-red" style={{ minWidth: '45px', textAlign: 'center' }}>
                                  {v.size}
                                </span>
                                <input
                                  type="number"
                                  step="0.01"
                                  placeholder="Price Override ($)"
                                  className="form-input"
                                  style={{ flex: 1, height: '36px', fontSize: '13px' }}
                                  value={v.price || ''}
                                  onChange={(e) => {
                                    const updated = [...variants];
                                    updated[idx].price = e.target.value;
                                    setVariants(updated);
                                  }}
                                />
                                <input
                                  type="number"
                                  placeholder="Physical Stock"
                                  className="form-input"
                                  style={{ width: '130px', height: '36px', fontSize: '13px' }}
                                  value={v.physical_stock}
                                  onChange={(e) => {
                                    const updated = [...variants];
                                    updated[idx].physical_stock = e.target.value;
                                    setVariants(updated);
                                  }}
                                />
                                <button
                                  type="button"
                                  onClick={() => toggleSizeSelection(v.size)}
                                  style={{ color: 'var(--brand-red)', padding: '4px' }}
                                >
                                  ✕
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}

              {/* Modal Footer Controls */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '24px', paddingTop: '16px', borderTop: '1px solid var(--border-subtle)' }}>
                <button 
                  type="button" 
                  onClick={() => setModalOpen(false)} 
                  className="btn btn-secondary"
                >
                  Cancel
                </button>

                <div style={{ display: 'flex', gap: '10px' }}>
                  {activeTab !== 'general' && (
                    <button 
                      type="button" 
                      onClick={() => {
                        const tabs = ['general', 'pricing', 'images', 'sizes'];
                        const currIdx = tabs.indexOf(activeTab);
                        if (currIdx > 0) setActiveTab(tabs[currIdx - 1]);
                      }}
                      className="btn btn-secondary btn-sm"
                    >
                      Back
                    </button>
                  )}

                  {activeTab !== 'sizes' ? (
                    <button 
                      type="button" 
                      onClick={() => {
                        const tabs = ['general', 'pricing', 'images', 'sizes'];
                        const currIdx = tabs.indexOf(activeTab);
                        if (currIdx < tabs.length - 1) setActiveTab(tabs[currIdx + 1]);
                      }}
                      className="btn btn-primary btn-sm"
                    >
                      Next Step →
                    </button>
                  ) : (
                    <button 
                      type="submit" 
                      disabled={submitting} 
                      className="btn btn-primary"
                    >
                      {submitting ? "Saving..." : (editingProduct ? "Update Product" : "Publish Product")}
                    </button>
                  )}
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProductsPage;
