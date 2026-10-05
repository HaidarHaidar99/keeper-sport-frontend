import React, { useState, useEffect, useCallback } from 'react';
import {
  Package,
  Plus,
  Search,
  Filter,
  SlidersHorizontal,
  Edit2,
  Trash2,
  Upload,
  Check,
  X,
  AlertTriangle,
  Sparkles,
  Loader2,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { adminApi } from '../../api/adminApi';
import ConfirmModal from '../../components/admin/ConfirmModal';

export default function AdminProductsPage() {
  const [stats, setStats] = useState({ total: 0, active: 0, outOfStock: 0, lowStock: 0, featured: 0, lowStockThreshold: 5 });
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');

  // Product Create/Edit Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    category_id: '',
    brand: '',
    description: '',
    base_price: '',
    old_price: '',
    stock_quantity: 10,
    is_premium: false,
    is_active: true,
    is_featured: false,
    is_best_seller: false,
    is_new_arrival: false,
    image_url: ''
  });
  const [uploadingImage, setUploadingImage] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);

  // Delete Confirm Modal
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: null, name: '' });
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Toast Notice
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Fetch Categories on mount
  useEffect(() => {
    adminApi.getCategories().then((res) => {
      if (res?.success) setCategories(res.categories || []);
    });
  }, []);

  // Fetch Stats Overview
  const fetchStats = async () => {
    try {
      const res = await adminApi.getProductsOverview();
      if (res?.success) setStats(res.stats);
    } catch (err) {
      console.error('Error fetching product stats:', err);
    }
  };

  // Fetch Products
  const fetchProducts = useCallback(async (targetPage = 1) => {
    setLoading(true);
    try {
      const res = await adminApi.getProducts({
        page: targetPage,
        limit: 15,
        search: searchTerm,
        category: selectedCategory || undefined,
        status: selectedStatus !== 'all' ? selectedStatus : undefined
      });

      if (res && res.success) {
        setProducts(res.products || []);
        setTotalCount(res.total || 0);
        setPage(res.page || targetPage);
        setTotalPages(res.totalPages || 1);
      }
    } catch (err) {
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, selectedCategory, selectedStatus]);

  useEffect(() => {
    fetchStats();
    fetchProducts(1);
  }, [fetchProducts]);

  // Handle Search Submission
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchProducts(1);
  };

  // Handle Media File Upload
  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const res = await adminApi.uploadMedia(file);
      if (res && res.success && res.url) {
        setFormData((prev) => ({ ...prev, image_url: res.url }));
        showToast('Product cover image uploaded to Supabase.');
      } else {
        showToast(res.message || 'Image upload failed.');
      }
    } catch {
      showToast('Network error during image upload.');
    } finally {
      setUploadingImage(false);
    }
  };

  // Open Modal for Create or Edit
  const openModal = (prod = null) => {
    if (prod) {
      setEditingProduct(prod);
      setFormData({
        name: prod.name || '',
        category_id: prod.category_id || '',
        brand: prod.brand || '',
        description: prod.description || '',
        base_price: prod.base_price !== undefined ? prod.base_price : '',
        old_price: prod.old_price !== undefined && prod.old_price !== null ? prod.old_price : '',
        stock_quantity: prod.stock_quantity !== undefined ? prod.stock_quantity : 0,
        is_premium: Boolean(prod.is_premium),
        is_active: Boolean(prod.is_active),
        is_featured: Boolean(prod.is_featured),
        is_best_seller: Boolean(prod.is_best_seller),
        is_new_arrival: Boolean(prod.is_new_arrival),
        image_url: prod.primaryImage || ''
      });
    } else {
      setEditingProduct(null);
      setFormData({
        name: '',
        category_id: categories[0]?.id || '',
        brand: '',
        description: '',
        base_price: '',
        old_price: '',
        stock_quantity: 10,
        is_premium: false,
        is_active: true,
        is_featured: false,
        is_best_seller: false,
        is_new_arrival: false,
        image_url: ''
      });
    }
    setModalOpen(true);
  };

  // Save Product (Create or Edit)
  const handleSaveProduct = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      showToast('Product name is required.');
      return;
    }
    if (!formData.category_id) {
      showToast('Please select a product category.');
      return;
    }
    if (!formData.base_price || isNaN(parseFloat(formData.base_price))) {
      showToast('Please provide a valid base price.');
      return;
    }

    setSaveLoading(true);
    try {
      let res;
      if (editingProduct) {
        res = await adminApi.updateProduct(editingProduct.id, formData);
      } else {
        res = await adminApi.createProduct(formData);
      }

      if (res && res.success) {
        showToast(res.message || 'Product saved successfully.');
        setModalOpen(false);
        fetchStats();
        fetchProducts(page);
      } else {
        showToast(res.message || 'Failed to save product.');
      }
    } catch {
      showToast('Network error saving product.');
    } finally {
      setSaveLoading(false);
    }
  };

  // Toggle Product Active State
  const handleToggleActive = async (prod) => {
    try {
      const res = await adminApi.updateProduct(prod.id, { is_active: !prod.is_active });
      if (res && res.success) {
        setProducts((prev) =>
          prev.map((p) => (p.id === prod.id ? { ...p, is_active: !p.is_active } : p))
        );
        fetchStats();
        showToast(`Product "${prod.name}" ${!prod.is_active ? 'activated' : 'deactivated'}.`);
      }
    } catch {
      showToast('Error toggling product status.');
    }
  };

  // Toggle Featured State (Controls public horizontal rail)
  const handleToggleFeatured = async (prod) => {
    try {
      const res = await adminApi.updateProduct(prod.id, { is_featured: !prod.is_featured });
      if (res && res.success) {
        setProducts((prev) =>
          prev.map((p) => (p.id === prod.id ? { ...p, is_featured: !p.is_featured } : p))
        );
        fetchStats();
        showToast(`Product "${prod.name}" ${!prod.is_featured ? 'featured on rail' : 'removed from rail'}.`);
      }
    } catch {
      showToast('Error updating featured status.');
    }
  };

  // Delete Product
  const handleConfirmDelete = async () => {
    setDeleteLoading(true);
    try {
      const res = await adminApi.deleteProduct(deleteModal.id);
      if (res && res.success) {
        showToast(res.message || 'Product deleted.');
        setDeleteModal({ isOpen: false, id: null, name: '' });
        fetchStats();
        fetchProducts(page);
      } else {
        showToast(res.message || 'Failed to delete product.');
      }
    } catch {
      showToast('Network error during delete.');
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="ks-admin-page-container">
      {/* Toast Feedback */}
      {toastMessage && (
        <div className="ks-admin-toast" role="status">
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Page Header */}
      <div className="ks-admin-header-row">
        <div>
          <span className="ks-admin-header-eyebrow">CATALOG &amp; INVENTORY</span>
          <h1 className="ks-admin-page-title">Products Management</h1>
        </div>

        <button
          type="button"
          onClick={() => openModal(null)}
          className="ks-admin-btn-primary"
        >
          <Plus size={15} />
          <span>New Product</span>
        </button>
      </div>

      {/* OVERVIEW STAT CARDS */}
      <div className="ks-admin-stats-grid">
        <div className="ks-admin-stat-card">
          <div className="ks-stat-card-icon-wrap is-neutral">
            <Package size={20} />
          </div>
          <div className="ks-stat-card-content">
            <span className="ks-stat-card-label">TOTAL PRODUCTS</span>
            <div className="ks-stat-card-value">{stats.total}</div>
            <div className="ks-stat-card-subtext">{stats.active} Active in Store</div>
          </div>
        </div>

        <div className={`ks-admin-stat-card ${stats.lowStock > 0 ? 'is-warning' : ''}`}>
          <div className="ks-stat-card-icon-wrap is-danger">
            <AlertTriangle size={20} />
          </div>
          <div className="ks-stat-card-content">
            <span className="ks-stat-card-label">LOW STOCK</span>
            <div className="ks-stat-card-value is-red">{stats.lowStock}</div>
            <div className="ks-stat-card-subtext">≤ {stats.lowStockThreshold} units</div>
          </div>
        </div>

        <div className="ks-admin-stat-card">
          <div className="ks-stat-card-icon-wrap is-neutral">
            <Package size={20} />
          </div>
          <div className="ks-stat-card-content">
            <span className="ks-stat-card-label">OUT OF STOCK</span>
            <div className="ks-stat-card-value">{stats.outOfStock}</div>
            <div className="ks-stat-card-subtext">Needs Restocking</div>
          </div>
        </div>

        <div className="ks-admin-stat-card">
          <div className="ks-stat-card-icon-wrap is-neutral">
            <Sparkles size={20} />
          </div>
          <div className="ks-stat-card-content">
            <span className="ks-stat-card-label">FEATURED RAIL</span>
            <div className="ks-stat-card-value">{stats.featured}</div>
            <div className="ks-stat-card-subtext">Active on Top Rail</div>
          </div>
        </div>
      </div>

      {/* PRODUCTS TOOLBAR & FILTERS */}
      <div className="ks-admin-filter-toolbar">
        <form onSubmit={handleSearchSubmit} className="ks-admin-search-wrap">
          <Search size={15} className="ks-admin-search-icon" />
          <input
            type="search"
            placeholder="Search products by title, brand, or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="ks-admin-input is-search"
          />
        </form>

        <div className="ks-admin-filter-actions">
          {/* Category Dropdown */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="ks-admin-select"
            aria-label="Filter by category"
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          {/* Status Dropdown */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="ks-admin-select"
            aria-label="Filter by status"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active Only</option>
            <option value="inactive">Inactive Only</option>
            <option value="low_stock">Low Stock Only</option>
            <option value="out_of_stock">Out of Stock Only</option>
            <option value="featured">Featured Rail Only</option>
          </select>
        </div>
      </div>

      {/* PRODUCTS TABLE */}
      <section className="ks-admin-panel" aria-label="Products Table">
        <div className="ks-admin-panel-body" style={{ padding: 0 }}>
          {loading ? (
            <div className="ks-admin-table-loading">Loading products catalog...</div>
          ) : products.length === 0 ? (
            <div className="ks-admin-empty-notice" style={{ padding: '48px 24px' }}>
              <span>No products match the selected criteria. Click "New Product" to add your first item.</span>
            </div>
          ) : (
            <div className="ks-admin-table-responsive">
              <table className="ks-admin-table">
                <thead>
                  <tr>
                    <th>Image</th>
                    <th>Product Name &amp; Category</th>
                    <th>Price</th>
                    <th>Inventory</th>
                    <th>Featured</th>
                    <th>Active</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((prod) => (
                    <tr key={prod.id}>
                      <td style={{ width: '64px' }}>
                        <div className="ks-table-media-thumb">
                          {prod.primaryImage ? (
                            <img src={prod.primaryImage} alt={prod.name} onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                          ) : (
                            <Package size={20} className="ks-media-type-icon" />
                          )}
                        </div>
                      </td>
                      <td>
                        <div className="ks-table-strong">{prod.name}</div>
                        <div className="ks-table-subtext">{prod.categoryName} {prod.brand ? `• ${prod.brand}` : ''}</div>
                      </td>
                      <td>
                        <div className="ks-table-strong">${parseFloat(prod.base_price).toFixed(2)}</div>
                        {prod.old_price && (
                          <div className="ks-table-subtext" style={{ textDecoration: 'line-through' }}>
                            ${parseFloat(prod.old_price).toFixed(2)}
                          </div>
                        )}
                      </td>
                      <td>
                        <span className={`ks-stock-pill ${prod.stock_quantity <= 0 ? 'is-out' : prod.isLowStock ? 'is-low' : 'is-in'}`}>
                          {prod.stock_quantity <= 0
                            ? 'OUT OF STOCK'
                            : prod.isLowStock
                            ? `LOW (${prod.stock_quantity})`
                            : `${prod.stock_quantity} in stock`}
                        </span>
                      </td>
                      <td>
                        <button
                          type="button"
                          onClick={() => handleToggleFeatured(prod)}
                          className={`ks-toggle-star ${prod.is_featured ? 'is-active' : ''}`}
                          title={prod.is_featured ? 'Remove from top rail' : 'Show on top rail'}
                        >
                          <Sparkles size={16} />
                        </button>
                      </td>
                      <td>
                        <button
                          type="button"
                          onClick={() => handleToggleActive(prod)}
                          className={`ks-toggle-switch ${prod.is_active ? 'is-active' : ''}`}
                          aria-label={prod.is_active ? 'Deactivate' : 'Activate'}
                        >
                          <span className="ks-toggle-slider" />
                        </button>
                      </td>
                      <td>
                        <div className="ks-table-actions-cell">
                          <button
                            type="button"
                            onClick={() => openModal(prod)}
                            className="ks-table-icon-btn"
                            title="Edit Product"
                          >
                            <Edit2 size={15} />
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              setDeleteModal({
                                isOpen: true,
                                id: prod.id,
                                name: prod.name
                              })
                            }
                            className="ks-table-icon-btn is-danger"
                            title="Delete Product"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination Footer */}
          {totalPages > 1 && (
            <div className="ks-admin-table-pagination">
              <span className="ks-table-page-info">
                Page {page} of {totalPages} ({totalCount} total items)
              </span>

              <div className="ks-table-page-controls">
                <button
                  type="button"
                  onClick={() => fetchProducts(page - 1)}
                  disabled={page <= 1 || loading}
                  className="ks-table-page-btn"
                >
                  <ChevronLeft size={16} />
                  <span>Prev</span>
                </button>
                <button
                  type="button"
                  onClick={() => fetchProducts(page + 1)}
                  disabled={page >= totalPages || loading}
                  className="ks-table-page-btn"
                >
                  <span>Next</span>
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* CREATE / EDIT PRODUCT MODAL */}
      {modalOpen && (
        <div className="ks-admin-modal-backdrop" onClick={() => setModalOpen(false)} role="dialog" aria-modal="true">
          <div className="ks-admin-modal-box is-wide" onClick={(e) => e.stopPropagation()}>
            <div className="ks-admin-modal-header">
              <h3 className="ks-admin-modal-title">
                {editingProduct ? `Edit "${editingProduct.name}"` : 'New Product'}
              </h3>
              <button type="button" onClick={() => setModalOpen(false)} className="ks-admin-modal-close-btn" aria-label="Close">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="ks-admin-form">
              <div className="ks-admin-modal-body">
                <div className="ks-form-row">
                  <div className="ks-form-group">
                    <label className="ks-form-label">Product Name *</label>
                    <input
                      type="text"
                      placeholder="e.g. Predator Pro Match Gloves"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="ks-admin-input"
                      required
                    />
                  </div>

                  <div className="ks-form-group">
                    <label className="ks-form-label">Category *</label>
                    <select
                      value={formData.category_id}
                      onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                      className="ks-admin-select"
                      required
                    >
                      <option value="">Select Category...</option>
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="ks-form-row">
                  <div className="ks-form-group">
                    <label className="ks-form-label">Base Price ($ USD) *</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="e.g. 89.99"
                      value={formData.base_price}
                      onChange={(e) => setFormData({ ...formData, base_price: e.target.value })}
                      className="ks-admin-input"
                      required
                    />
                  </div>

                  <div className="ks-form-group">
                    <label className="ks-form-label">Original / Old Price ($ USD)</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="Leave empty if not on sale"
                      value={formData.old_price}
                      onChange={(e) => setFormData({ ...formData, old_price: e.target.value })}
                      className="ks-admin-input"
                    />
                  </div>

                  <div className="ks-form-group">
                    <label className="ks-form-label">Stock Quantity *</label>
                    <input
                      type="number"
                      min="0"
                      value={formData.stock_quantity}
                      onChange={(e) => setFormData({ ...formData, stock_quantity: e.target.value })}
                      className="ks-admin-input"
                      required
                    />
                  </div>
                </div>

                <div className="ks-form-row">
                  <div className="ks-form-group">
                    <label className="ks-form-label">Brand</label>
                    <input
                      type="text"
                      placeholder="e.g. Adidas, Uhlsport, Nike"
                      value={formData.brand}
                      onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                      className="ks-admin-input"
                    />
                  </div>

                  <div className="ks-form-group">
                    <label className="ks-form-label">Description</label>
                    <input
                      type="text"
                      placeholder="Short product overview"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="ks-admin-input"
                    />
                  </div>
                </div>

                {/* Cover Image Upload */}
                <div className="ks-form-group">
                  <label className="ks-form-label">Product Cover Image</label>
                  <div className="ks-admin-upload-field">
                    <input
                      type="file"
                      accept="image/*"
                      id="product-file-input"
                      onChange={handleImageUpload}
                      style={{ display: 'none' }}
                    />
                    <label htmlFor="product-file-input" className="ks-admin-btn-secondary" style={{ cursor: 'pointer' }}>
                      {uploadingImage ? (
                        <>
                          <Loader2 size={15} className="ks-spin-icon" />
                          <span>Uploading to Storage...</span>
                        </>
                      ) : (
                        <>
                          <Upload size={15} />
                          <span>Upload Image File</span>
                        </>
                      )}
                    </label>

                    <input
                      type="text"
                      placeholder="or enter Image URL directly"
                      value={formData.image_url}
                      onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                      className="ks-admin-input"
                      style={{ flex: 1 }}
                    />
                  </div>

                  {formData.image_url && (
                    <div className="ks-upload-preview-wrap">
                      <img src={formData.image_url} alt="Product Preview" className="ks-upload-preview-img" />
                    </div>
                  )}
                </div>

                {/* Flags / Switches */}
                <div className="ks-form-row" style={{ marginTop: '8px' }}>
                  <label className="ks-checkbox-wrap">
                    <input
                      type="checkbox"
                      checked={formData.is_active}
                      onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    />
                    <span className="ks-checkbox-custom" />
                    <span>Active on Storefront</span>
                  </label>

                  <label className="ks-checkbox-wrap">
                    <input
                      type="checkbox"
                      checked={formData.is_featured}
                      onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                    />
                    <span className="ks-checkbox-custom" />
                    <span>Show on Top Featured Rail</span>
                  </label>

                  <label className="ks-checkbox-wrap">
                    <input
                      type="checkbox"
                      checked={formData.is_premium}
                      onChange={(e) => setFormData({ ...formData, is_premium: e.target.checked })}
                    />
                    <span className="ks-checkbox-custom" />
                    <span>Premium Badge</span>
                  </label>
                </div>
              </div>

              <div className="ks-admin-modal-footer">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="ks-admin-btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saveLoading}
                  className="ks-admin-btn-primary"
                >
                  {saveLoading ? 'Saving Product...' : editingProduct ? 'Update Product' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteModal.isOpen}
        title="Delete Product"
        message={`Are you sure you want to permanently delete "${deleteModal.name}"? This action will remove it from the public catalog.`}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteModal({ isOpen: false, id: null, name: '' })}
        loading={deleteLoading}
      />
    </div>
  );
}
