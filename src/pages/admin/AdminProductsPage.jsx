import React, { useState, useEffect, useCallback } from 'react';
import {
  Package,
  Plus,
  Search,
  SlidersHorizontal,
  Edit2,
  Trash2,
  Upload,
  Check,
  X,
  AlertTriangle,
  Sparkles,
  Loader2,
  Image as ImageIcon,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Star,
  Layers,
  Palette,
  Ruler
} from 'lucide-react';
import { adminApi } from '../../api/adminApi';
import ConfirmModal from '../../components/admin/ConfirmModal';

// Preset color options for quick admin picking
const PRESET_COLORS = [
  { name: 'Black', value: '#111111' },
  { name: 'White', value: '#FFFFFF' },
  { name: 'Keeper Red', value: '#E10600' },
  { name: 'Royal Blue', value: '#1E40AF' },
  { name: 'Volt Yellow', value: '#CCFF00' },
  { name: 'Neon Orange', value: '#FF6B00' },
  { name: 'Emerald Green', value: '#059669' },
  { name: 'Silver Grey', value: '#9CA3AF' },
  { name: 'Gold', value: '#D97706' }
];

const QUICK_SIZES = ['39', '40', '41', '42', '43', '44', '45', '7', '8', '8.5', '9', '9.5', '10', '10.5', '11', 'S', 'M', 'L', 'XL', 'XXL'];

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

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  // Product Form Data
  const [formData, setFormData] = useState({
    name: '',
    category_id: '',
    brand: '',
    description: '',
    base_price: '',
    old_price: '',
    stock_quantity: 10,
    track_inventory: true,
    is_premium: false,
    is_active: true,
    is_featured: false,
    is_best_seller: false,
    is_new_arrival: false,
    printing_available: false,
    badges_available: false
  });

  // Multiple Images State
  const [images, setImages] = useState([]);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [customImageUrl, setCustomImageUrl] = useState('');

  // Options State (Sizes & Colors)
  const [hasSizes, setHasSizes] = useState(false);
  const [sizesList, setSizesList] = useState([]);
  const [customSizeInput, setCustomSizeInput] = useState('');

  const [hasColors, setHasColors] = useState(false);
  const [colorsList, setColorsList] = useState([]);
  const [newColorName, setNewColorName] = useState('Keeper Red');
  const [newColorValue, setNewColorValue] = useState('#E10600');

  // Variants Matrix State
  const [variantsList, setVariantsList] = useState([]);

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

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchProducts(1);
  };

  // Auto generate variants matrix whenever sizes or colors change
  const regenerateVariants = (newSizes, newColors, existingVariants = []) => {
    const existingMap = new Map();
    existingVariants.forEach((v) => {
      const key = `${v.size_value || ''}__${v.color_value || ''}`;
      existingMap.set(key, v);
    });

    let newGenerated = [];

    if (newSizes.length > 0 && newColors.length > 0) {
      // Case A: Size + Color
      newColors.forEach((c) => {
        newSizes.forEach((s) => {
          const key = `${s}__${c.value}`;
          const existing = existingMap.get(key);
          newGenerated.push({
            size_value: s,
            color_value: c.value,
            color_name: c.name,
            sku: existing?.sku || '',
            price: existing?.price !== undefined ? existing.price : '',
            stock_quantity: existing?.stock_quantity !== undefined ? existing.stock_quantity : 5,
            is_active: existing?.is_active !== undefined ? existing.is_active : true
          });
        });
      });
    } else if (newSizes.length > 0) {
      // Case B: Size only
      newSizes.forEach((s) => {
        const key = `${s}__`;
        const existing = existingMap.get(key);
        newGenerated.push({
          size_value: s,
          color_value: null,
          color_name: null,
          sku: existing?.sku || '',
          price: existing?.price !== undefined ? existing.price : '',
          stock_quantity: existing?.stock_quantity !== undefined ? existing.stock_quantity : 5,
          is_active: existing?.is_active !== undefined ? existing.is_active : true
        });
      });
    } else if (newColors.length > 0) {
      // Case C: Color only
      newColors.forEach((c) => {
        const key = `__${c.value}`;
        const existing = existingMap.get(key);
        newGenerated.push({
          size_value: null,
          color_value: c.value,
          color_name: c.name,
          sku: existing?.sku || '',
          price: existing?.price !== undefined ? existing.price : '',
          stock_quantity: existing?.stock_quantity !== undefined ? existing.stock_quantity : 5,
          is_active: existing?.is_active !== undefined ? existing.is_active : true
        });
      });
    } else {
      // Case D: Neither
      newGenerated = [];
    }

    setVariantsList(newGenerated);
  };

  // Add a size
  const handleAddSize = (sizeVal) => {
    const clean = String(sizeVal).trim();
    if (!clean || sizesList.includes(clean)) return;
    const updated = [...sizesList, clean];
    setSizesList(updated);
    regenerateVariants(updated, colorsList, variantsList);
  };

  // Remove a size
  const handleRemoveSize = (sizeVal) => {
    const updated = sizesList.filter((s) => s !== sizeVal);
    setSizesList(updated);
    regenerateVariants(updated, colorsList, variantsList);
  };

  // Add a color visually
  const handleAddColor = () => {
    if (!newColorName.trim()) return;
    const exists = colorsList.some((c) => c.name.toLowerCase() === newColorName.trim().toLowerCase());
    if (exists) {
      showToast('A color with this name is already in the list.');
      return;
    }
    const updated = [...colorsList, { name: newColorName.trim(), value: newColorValue }];
    setColorsList(updated);
    regenerateVariants(sizesList, updated, variantsList);
    setNewColorName('');
  };

  // Remove a color
  const handleRemoveColor = (index) => {
    const updated = colorsList.filter((_, idx) => idx !== index);
    setColorsList(updated);
    regenerateVariants(sizesList, updated, variantsList);
  };

  // Handle Multi-Image Upload
  const handleMultipleFilesUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setUploadingImage(true);
    let successCount = 0;

    for (const file of files) {
      try {
        const res = await adminApi.uploadMedia(file);
        if (res && res.success && res.url) {
          setImages((prev) => {
            const isFirst = prev.length === 0;
            return [
              ...prev,
              {
                storage_path: res.url,
                is_cover: isFirst,
                sort_order: prev.length,
                alt_text: file.name
              }
            ];
          });
          successCount++;
        }
      } catch (err) {
        console.error('File upload error:', err);
      }
    }

    setUploadingImage(false);
    if (successCount > 0) {
      showToast(`${successCount} ${successCount === 1 ? 'image' : 'images'} uploaded successfully.`);
    } else {
      showToast('Media upload failed. Please verify storage permissions.');
    }
    e.target.value = '';
  };

  // Add image by CDN URL
  const handleAddImageUrl = () => {
    if (!customImageUrl.trim()) return;
    const url = customImageUrl.trim();
    setImages((prev) => {
      const isFirst = prev.length === 0;
      return [
        ...prev,
        {
          storage_path: url,
          is_cover: isFirst,
          sort_order: prev.length,
          alt_text: 'Product Image'
        }
      ];
    });
    setCustomImageUrl('');
    showToast('Image added to gallery.');
  };

  // Set primary cover image
  const handleSetCover = (index) => {
    setImages((prev) =>
      prev.map((img, idx) => ({
        ...img,
        is_cover: idx === index
      }))
    );
  };

  // Remove image from gallery
  const handleRemoveImage = (index) => {
    setImages((prev) => {
      const updated = prev.filter((_, idx) => idx !== index);
      // If we removed the cover and there are other images, designate the first as cover
      if (updated.length > 0 && !updated.some((img) => img.is_cover)) {
        updated[0].is_cover = true;
      }
      return updated;
    });
  };

  // Open Modal for Create or Edit
  const openModal = async (prod = null) => {
    setModalOpen(true);

    if (prod) {
      setModalLoading(true);
      setEditingProduct(prod);

      try {
        // Fetch full product details including variants and all media
        const fullRes = await adminApi.getProduct(prod.id);
        const fullProd = fullRes?.success && fullRes.product ? fullRes.product : prod;

        setFormData({
          name: fullProd.name || '',
          category_id: fullProd.category_id || '',
          brand: fullProd.brand || '',
          description: fullProd.description || '',
          base_price: fullProd.base_price !== undefined ? fullProd.base_price : '',
          old_price: fullProd.old_price !== undefined && fullProd.old_price !== null ? fullProd.old_price : '',
          stock_quantity: fullProd.stock_quantity !== undefined ? fullProd.stock_quantity : 0,
          track_inventory: fullProd.track_inventory !== undefined ? Boolean(fullProd.track_inventory) : true,
          is_premium: Boolean(fullProd.is_premium),
          is_active: Boolean(fullProd.is_active),
          is_featured: Boolean(fullProd.is_featured),
          is_best_seller: Boolean(fullProd.is_best_seller),
          is_new_arrival: Boolean(fullProd.is_new_arrival),
          printing_available: Boolean(fullProd.printing_available),
          badges_available: Boolean(fullProd.badges_available)
        });

        // Set Images
        const media = fullProd.media || [];
        if (media.length > 0) {
          setImages(
            media.map((m, idx) => ({
              storage_path: m.storage_path,
              is_cover: Boolean(m.is_cover),
              sort_order: m.sort_order !== undefined ? m.sort_order : idx,
              alt_text: m.alt_text || ''
            }))
          );
        } else if (prod.primaryImage) {
          setImages([{ storage_path: prod.primaryImage, is_cover: true, sort_order: 0, alt_text: prod.name }]);
        } else {
          setImages([]);
        }

        // Set Variants, Sizes & Colors
        const variants = fullProd.variants || [];
        setVariantsList(variants);

        const loadedSizes = Array.from(new Set(variants.map((v) => v.size_value).filter(Boolean)));
        setHasSizes(loadedSizes.length > 0);
        setSizesList(loadedSizes);

        const colorMap = new Map();
        variants.forEach((v) => {
          if (v.color_value || v.color_name) {
            const name = v.color_name || v.color_value;
            const val = v.color_value || '#000000';
            if (!colorMap.has(name)) {
              colorMap.set(name, { name, value: val });
            }
          }
        });
        const loadedColors = Array.from(colorMap.values());
        setHasColors(loadedColors.length > 0);
        setColorsList(loadedColors);
      } catch (err) {
        console.error('Error loading product details:', err);
      } finally {
        setModalLoading(false);
      }
    } else {
      setEditingProduct(null);
      setModalLoading(false);
      setFormData({
        name: '',
        category_id: categories[0]?.id || '',
        brand: '',
        description: '',
        base_price: '',
        old_price: '',
        stock_quantity: 10,
        track_inventory: true,
        is_premium: false,
        is_active: true,
        is_featured: false,
        is_best_seller: false,
        is_new_arrival: false,
        printing_available: false,
        badges_available: false
      });
      setImages([]);
      setHasSizes(false);
      setSizesList([]);
      setHasColors(false);
      setColorsList([]);
      setVariantsList([]);
    }
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
      const payload = {
        ...formData,
        base_price: parseFloat(formData.base_price),
        old_price: formData.old_price ? parseFloat(formData.old_price) : null,
        stock_quantity: parseInt(formData.stock_quantity, 10) || 0,
        images: images.map((img, idx) => ({
          storage_path: img.storage_path,
          is_cover: Boolean(img.is_cover),
          sort_order: idx,
          alt_text: img.alt_text || formData.name
        })),
        variants: variantsList.map((v, idx) => ({
          size_value: v.size_value || null,
          color_value: v.color_value || null,
          color_name: v.color_name || null,
          sku: v.sku || null,
          price: v.price !== '' && v.price !== undefined ? parseFloat(v.price) : null,
          old_price: v.old_price !== '' && v.old_price !== undefined ? parseFloat(v.old_price) : null,
          stock_quantity: parseInt(v.stock_quantity, 10) || 0,
          is_active: v.is_active !== undefined ? Boolean(v.is_active) : true,
          sort_order: idx
        }))
      };

      let res;
      if (editingProduct) {
        res = await adminApi.updateProduct(editingProduct.id, payload);
      } else {
        res = await adminApi.createProduct(payload);
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

  // Toggle Featured State
  const handleToggleFeatured = async (prod) => {
    try {
      const res = await adminApi.updateProduct(prod.id, { is_featured: !prod.is_featured });
      if (res && res.success) {
        setProducts((prev) =>
          prev.map((p) => (p.id === prod.id ? { ...p, is_featured: !p.is_featured } : p))
        );
        fetchStats();
        showToast(`Product "${prod.name}" ${!prod.is_featured ? 'added to' : 'removed from'} Featured Rail.`);
      }
    } catch {
      showToast('Error toggling featured status.');
    }
  };

  // Confirm Delete
  const handleConfirmDelete = async () => {
    setDeleteLoading(true);
    try {
      const res = await adminApi.deleteProduct(deleteModal.id);
      if (res && res.success) {
        showToast(`Product deleted successfully.`);
        setDeleteModal({ isOpen: false, id: null, name: '' });
        fetchStats();
        fetchProducts(page);
      } else {
        showToast(res.message || 'Failed to delete product.');
      }
    } catch {
      showToast('Network error deleting product.');
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="ks-admin-page-container">
      {/* Toast Notice */}
      {toastMessage && (
        <div className="ks-admin-toast" role="status">
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Page Header */}
      <div className="ks-admin-header-row">
        <div>
          <span className="ks-admin-header-eyebrow">CATALOG INVENTORY</span>
          <h1 className="ks-admin-page-title">Products Management</h1>
        </div>

        <button
          type="button"
          onClick={() => openModal(null)}
          className="ks-admin-btn-primary"
        >
          <Plus size={16} />
          <span>New Product</span>
        </button>
      </div>

      {/* STATS OVERVIEW CARDS */}
      <div className="ks-admin-stats-grid">
        <div className="ks-admin-stat-card">
          <div className="ks-stat-card-icon-wrap is-neutral">
            <Package size={20} />
          </div>
          <div className="ks-stat-card-content">
            <span className="ks-stat-card-label">TOTAL CATALOG</span>
            <div className="ks-stat-card-value">{loading ? '—' : stats.total}</div>
            <div className="ks-stat-card-subtext">{stats.active} Active Items</div>
          </div>
        </div>

        <div className="ks-admin-stat-card">
          <div className="ks-stat-card-icon-wrap is-warning">
            <AlertTriangle size={20} />
          </div>
          <div className="ks-stat-card-content">
            <span className="ks-stat-card-label">LOW STOCK WARNING</span>
            <div className="ks-stat-card-value" style={{ color: stats.lowStock > 0 ? '#F59E0B' : undefined }}>
              {loading ? '—' : stats.lowStock}
            </div>
            <div className="ks-stat-card-subtext">Threshold ≤ {stats.lowStockThreshold} units</div>
          </div>
        </div>

        <div className="ks-admin-stat-card">
          <div className="ks-stat-card-icon-wrap is-danger">
            <Package size={20} />
          </div>
          <div className="ks-stat-card-content">
            <span className="ks-stat-card-label">OUT OF STOCK</span>
            <div className="ks-stat-card-value" style={{ color: stats.outOfStock > 0 ? 'var(--ks-accent-red)' : undefined }}>
              {loading ? '—' : stats.outOfStock}
            </div>
            <div className="ks-stat-card-subtext">Requires replenishment</div>
          </div>
        </div>

        <div className="ks-admin-stat-card">
          <div className="ks-stat-card-icon-wrap is-neutral">
            <Sparkles size={20} />
          </div>
          <div className="ks-stat-card-content">
            <span className="ks-stat-card-label">FEATURED RAIL</span>
            <div className="ks-stat-card-value">{loading ? '—' : stats.featured}</div>
            <div className="ks-stat-card-subtext">Showcased on Home</div>
          </div>
        </div>
      </div>

      {/* SEARCH AND FILTER BAR */}
      <div className="ks-admin-filters-bar">
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
                          className={`ks-table-icon-btn ${prod.is_featured ? 'is-starred' : ''}`}
                          title={prod.is_featured ? 'Remove from Featured Rail' : 'Add to Featured Rail'}
                        >
                          <Star size={16} fill={prod.is_featured ? '#E10600' : 'none'} color={prod.is_featured ? '#E10600' : 'currentColor'} />
                        </button>
                      </td>
                      <td>
                        <button
                          type="button"
                          onClick={() => handleToggleActive(prod)}
                          className={`ks-toggle-switch ${prod.is_active ? 'is-active' : ''}`}
                          aria-label={prod.is_active ? 'Deactivate product' : 'Activate product'}
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
        </div>

        {/* PAGINATION CONTROLS */}
        {totalPages > 1 && (
          <div className="ks-admin-pagination-bar">
            <span className="ks-pagination-info">
              Showing page {page} of {totalPages} ({totalCount} items)
            </span>
            <div className="ks-pagination-buttons">
              <button
                type="button"
                onClick={() => fetchProducts(page - 1)}
                disabled={page <= 1}
                className="ks-pagination-btn"
                aria-label="Previous page"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                type="button"
                onClick={() => fetchProducts(page + 1)}
                disabled={page >= totalPages}
                className="ks-pagination-btn"
                aria-label="Next page"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </section>

      {/* CREATE & EDIT PRODUCT MODAL */}
      {modalOpen && (
        <div className="ks-admin-modal-backdrop" onClick={() => setModalOpen(false)} role="dialog" aria-modal="true">
          <div className="ks-admin-modal-box is-wide" onClick={(e) => e.stopPropagation()}>
            <div className="ks-admin-modal-header">
              <h3 className="ks-admin-modal-title">
                {editingProduct ? `Edit Product: ${editingProduct.name}` : 'Create New Product'}
              </h3>
              <button type="button" onClick={() => setModalOpen(false)} className="ks-admin-modal-close-btn" aria-label="Close modal">
                <X size={18} />
              </button>
            </div>

            {modalLoading ? (
              <div style={{ padding: '60px 24px', textAlign: 'center' }}>
                <Loader2 size={32} className="ks-spin-icon" style={{ color: 'var(--ks-accent-red)' }} />
                <div style={{ marginTop: '12px', fontSize: '0.9rem', color: 'var(--ks-text-muted)' }}>
                  Loading product details and variants...
                </div>
              </div>
            ) : (
              <form onSubmit={handleSaveProduct} className="ks-admin-form">
                <div className="ks-admin-modal-body" style={{ maxHeight: '72vh', overflowY: 'auto' }}>
                  
                  {/* SECTION 1: BASIC INFORMATION */}
                  <div className="ks-form-section">
                    <h4 className="ks-form-section-title">1. Basic Information</h4>
                    <div className="ks-form-row">
                      <div className="ks-form-group" style={{ flex: 2 }}>
                        <label className="ks-form-label">Product Name *</label>
                        <input
                          type="text"
                          placeholder="e.g. Predator Pro Match Goalkeeper Gloves"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="ks-admin-input"
                          required
                        />
                      </div>

                      <div className="ks-form-group" style={{ flex: 1 }}>
                        <label className="ks-form-label">Category *</label>
                        <select
                          value={formData.category_id}
                          onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                          className="ks-admin-select"
                          required
                        >
                          <option value="">Select Category</option>
                          {categories.map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="ks-form-group" style={{ flex: 1 }}>
                        <label className="ks-form-label">Brand</label>
                        <input
                          type="text"
                          placeholder="e.g. Adidas, Uhlsport, Reusch"
                          value={formData.brand}
                          onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                          className="ks-admin-input"
                        />
                      </div>
                    </div>

                    <div className="ks-form-group">
                      <label className="ks-form-label">Description</label>
                      <textarea
                        rows={3}
                        placeholder="Detailed specifications, grip latex, cut, wrist closure..."
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className="ks-admin-textarea"
                      />
                    </div>
                  </div>

                  {/* SECTION 2: PRICING & BADGES */}
                  <div className="ks-form-section">
                    <h4 className="ks-form-section-title">2. Pricing &amp; Badges</h4>
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
                        <label className="ks-form-label">Old / Sale Price ($ USD)</label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder="e.g. 119.99 (Optional crossed-out price)"
                          value={formData.old_price}
                          onChange={(e) => setFormData({ ...formData, old_price: e.target.value })}
                          className="ks-admin-input"
                        />
                      </div>
                    </div>

                    {/* Marketing Badges Row */}
                    <div className="ks-form-row-checkboxes" style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', marginTop: '12px' }}>
                      <label className="ks-checkbox-wrap">
                        <input
                          type="checkbox"
                          checked={formData.is_featured}
                          onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                        />
                        <span className="ks-checkbox-custom" />
                        <span>Featured Selection Rail</span>
                      </label>

                      <label className="ks-checkbox-wrap">
                        <input
                          type="checkbox"
                          checked={formData.is_premium}
                          onChange={(e) => setFormData({ ...formData, is_premium: e.target.checked })}
                        />
                        <span className="ks-checkbox-custom" />
                        <span>Premium Elite Badge</span>
                      </label>

                      <label className="ks-checkbox-wrap">
                        <input
                          type="checkbox"
                          checked={formData.is_best_seller}
                          onChange={(e) => setFormData({ ...formData, is_best_seller: e.target.checked })}
                        />
                        <span className="ks-checkbox-custom" />
                        <span>Best Seller Badge</span>
                      </label>

                      <label className="ks-checkbox-wrap">
                        <input
                          type="checkbox"
                          checked={formData.is_new_arrival}
                          onChange={(e) => setFormData({ ...formData, is_new_arrival: e.target.checked })}
                        />
                        <span className="ks-checkbox-custom" />
                        <span>New Arrival Badge</span>
                      </label>

                      <label className="ks-checkbox-wrap">
                        <input
                          type="checkbox"
                          checked={formData.printing_available}
                          onChange={(e) => setFormData({ ...formData, printing_available: e.target.checked })}
                        />
                        <span className="ks-checkbox-custom" />
                        <span>Custom Printing Available</span>
                      </label>

                      <label className="ks-checkbox-wrap">
                        <input
                          type="checkbox"
                          checked={formData.badges_available}
                          onChange={(e) => setFormData({ ...formData, badges_available: e.target.checked })}
                        />
                        <span className="ks-checkbox-custom" />
                        <span>Tournament Badges Available</span>
                      </label>
                    </div>
                  </div>

                  {/* SECTION 3: MULTIPLE PRODUCT MEDIA / IMAGES */}
                  <div className="ks-form-section">
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <h4 className="ks-form-section-title" style={{ margin: 0 }}>
                        3. Product Gallery Images ({images.length})
                      </h4>
                      <span className="ks-form-hint">Click any image to set it as Cover Image</span>
                    </div>

                    <div className="ks-admin-upload-field" style={{ marginBottom: '16px' }}>
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        id="product-gallery-input"
                        onChange={handleMultipleFilesUpload}
                        style={{ display: 'none' }}
                      />
                      <label htmlFor="product-gallery-input" className="ks-admin-btn-secondary" style={{ cursor: 'pointer' }}>
                        {uploadingImage ? (
                          <>
                            <Loader2 size={16} className="ks-spin-icon" />
                            <span>Uploading to Storage...</span>
                          </>
                        ) : (
                          <>
                            <Upload size={16} />
                            <span>Upload Multiple Images</span>
                          </>
                        )}
                      </label>

                      <input
                        type="text"
                        placeholder="or paste image CDN URL and click Add"
                        value={customImageUrl}
                        onChange={(e) => setCustomImageUrl(e.target.value)}
                        className="ks-admin-input"
                        style={{ flex: 1 }}
                      />
                      <button
                        type="button"
                        onClick={handleAddImageUrl}
                        className="ks-admin-btn-secondary"
                        disabled={!customImageUrl.trim()}
                      >
                        Add URL
                      </button>
                    </div>

                    {/* Image Previews Grid */}
                    {images.length > 0 ? (
                      <div className="ks-product-images-grid">
                        {images.map((img, idx) => (
                          <div
                            key={img.storage_path + idx}
                            className={`ks-product-thumb-card ${img.is_cover ? 'is-cover' : ''}`}
                            onClick={() => handleSetCover(idx)}
                            title={img.is_cover ? 'Primary Cover Image' : 'Click to set as primary cover'}
                          >
                            <img src={img.storage_path} alt={`Product ${idx + 1}`} className="ks-product-thumb-img" />
                            {img.is_cover && (
                              <div className="ks-product-thumb-cover-tag">
                                <Check size={11} />
                                <span>PRIMARY COVER</span>
                              </div>
                            )}
                            <button
                              type="button"
                              className="ks-product-thumb-delete"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRemoveImage(idx);
                              }}
                              aria-label="Remove image"
                              title="Remove image"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="ks-admin-empty-notice" style={{ padding: '20px', borderStyle: 'dashed' }}>
                        <span>No images added yet. Upload from your device or paste image URLs.</span>
                      </div>
                    )}
                  </div>

                  {/* SECTION 4: PRODUCT OPTIONS (SIZES & COLORS) */}
                  <div className="ks-form-section">
                    <h4 className="ks-form-section-title">4. Product Options (Sizes &amp; Colors)</h4>

                    {/* SIZES CONFIGURATION */}
                    <div className="ks-option-box" style={{ marginBottom: '18px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                        <label className="ks-checkbox-wrap" style={{ fontWeight: 600 }}>
                          <input
                            type="checkbox"
                            checked={hasSizes}
                            onChange={(e) => {
                              const checked = e.target.checked;
                              setHasSizes(checked);
                              const newSizes = checked ? (sizesList.length > 0 ? sizesList : ['40', '41', '42']) : [];
                              setSizesList(newSizes);
                              regenerateVariants(newSizes, colorsList, variantsList);
                            }}
                          />
                          <span className="ks-checkbox-custom" />
                          <Ruler size={16} style={{ color: 'var(--ks-accent-red)' }} />
                          <span>This Product has Sizes</span>
                        </label>
                      </div>

                      {hasSizes && (
                        <div className="ks-option-panel">
                          {/* Quick Common Sizes */}
                          <div style={{ marginBottom: '12px' }}>
                            <span className="ks-form-hint" style={{ display: 'block', marginBottom: '6px' }}>
                              Quick Add Common Sizes:
                            </span>
                            <div className="ks-quick-pills-row">
                              {QUICK_SIZES.map((sz) => {
                                const isAdded = sizesList.includes(sz);
                                return (
                                  <button
                                    key={sz}
                                    type="button"
                                    onClick={() => (isAdded ? handleRemoveSize(sz) : handleAddSize(sz))}
                                    className={`ks-quick-pill ${isAdded ? 'is-active' : ''}`}
                                  >
                                    {isAdded ? <Check size={11} /> : <Plus size={11} />}
                                    <span>{sz}</span>
                                  </button>
                                );
                              })}
                            </div>
                          </div>

                          {/* Custom Size Input */}
                          <div style={{ display: 'flex', gap: '8px', maxWidth: '320px', marginBottom: '12px' }}>
                            <input
                              type="text"
                              placeholder="Enter custom size (e.g. 7.5, XL)..."
                              value={customSizeInput}
                              onChange={(e) => setCustomSizeInput(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  handleAddSize(customSizeInput);
                                  setCustomSizeInput('');
                                }
                              }}
                              className="ks-admin-input"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                handleAddSize(customSizeInput);
                                setCustomSizeInput('');
                              }}
                              className="ks-admin-btn-secondary"
                              disabled={!customSizeInput.trim()}
                            >
                              Add Size
                            </button>
                          </div>

                          {/* Active Selected Sizes Chips */}
                          <div className="ks-chips-wrap">
                            <span className="ks-form-hint" style={{ marginRight: '6px' }}>Active Sizes:</span>
                            {sizesList.length === 0 ? (
                              <span style={{ fontSize: '0.85rem', color: 'var(--ks-text-muted)' }}>None selected</span>
                            ) : (
                              sizesList.map((sz) => (
                                <span key={sz} className="ks-badge-chip">
                                  <span>{sz}</span>
                                  <button type="button" onClick={() => handleRemoveSize(sz)} aria-label={`Remove size ${sz}`}>
                                    <X size={12} />
                                  </button>
                                </span>
                              ))
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* COLORS CONFIGURATION WITH VISUAL PICKER */}
                    <div className="ks-option-box">
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                        <label className="ks-checkbox-wrap" style={{ fontWeight: 600 }}>
                          <input
                            type="checkbox"
                            checked={hasColors}
                            onChange={(e) => {
                              const checked = e.target.checked;
                              setHasColors(checked);
                              const newColors = checked ? (colorsList.length > 0 ? colorsList : [{ name: 'Keeper Red', value: '#E10600' }]) : [];
                              setColorsList(newColors);
                              regenerateVariants(sizesList, newColors, variantsList);
                            }}
                          />
                          <span className="ks-checkbox-custom" />
                          <Palette size={16} style={{ color: 'var(--ks-accent-red)' }} />
                          <span>This Product has Colors</span>
                        </label>
                      </div>

                      {hasColors && (
                        <div className="ks-option-panel">
                          {/* Visual Preset Colors */}
                          <div style={{ marginBottom: '12px' }}>
                            <span className="ks-form-hint" style={{ display: 'block', marginBottom: '6px' }}>
                              Quick Add Preset Colors:
                            </span>
                            <div className="ks-quick-pills-row">
                              {PRESET_COLORS.map((pc) => {
                                const isAdded = colorsList.some((c) => c.name.toLowerCase() === pc.name.toLowerCase());
                                return (
                                  <button
                                    key={pc.name}
                                    type="button"
                                    onClick={() => {
                                      if (!isAdded) {
                                        const updated = [...colorsList, pc];
                                        setColorsList(updated);
                                        regenerateVariants(sizesList, updated, variantsList);
                                      }
                                    }}
                                    className={`ks-quick-pill ${isAdded ? 'is-active' : ''}`}
                                    style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                                  >
                                    <span
                                      style={{
                                        width: '12px',
                                        height: '12px',
                                        borderRadius: '50%',
                                        backgroundColor: pc.value,
                                        border: '1px solid rgba(0,0,0,0.2)'
                                      }}
                                    />
                                    <span>{pc.name}</span>
                                    {isAdded && <Check size={11} />}
                                  </button>
                                );
                              })}
                            </div>
                          </div>

                          {/* Visual Color Picker Form */}
                          <div className="ks-color-picker-row" style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <label className="ks-form-label" style={{ margin: 0 }}>Color:</label>
                              <input
                                type="color"
                                value={newColorValue}
                                onChange={(e) => setNewColorValue(e.target.value)}
                                style={{ width: '40px', height: '36px', padding: '2px', border: '1px solid var(--ks-border-input)', borderRadius: '8px', cursor: 'pointer' }}
                              />
                            </div>

                            <input
                              type="text"
                              placeholder="Color Name (e.g. Midnight Navy)"
                              value={newColorName}
                              onChange={(e) => setNewColorName(e.target.value)}
                              className="ks-admin-input"
                              style={{ maxWidth: '240px' }}
                            />

                            <button
                              type="button"
                              onClick={handleAddColor}
                              className="ks-admin-btn-secondary"
                              disabled={!newColorName.trim()}
                            >
                              Add Color
                            </button>
                          </div>

                          {/* Active Selected Colors */}
                          <div className="ks-chips-wrap">
                            <span className="ks-form-hint" style={{ marginRight: '6px' }}>Active Colors:</span>
                            {colorsList.length === 0 ? (
                              <span style={{ fontSize: '0.85rem', color: 'var(--ks-text-muted)' }}>None selected</span>
                            ) : (
                              colorsList.map((col, idx) => (
                                <span key={col.name + idx} className="ks-badge-chip">
                                  <span
                                    style={{
                                      width: '12px',
                                      height: '12px',
                                      borderRadius: '50%',
                                      backgroundColor: col.value,
                                      border: '1px solid rgba(0,0,0,0.2)'
                                    }}
                                  />
                                  <span>{col.name}</span>
                                  <button type="button" onClick={() => handleRemoveColor(idx)} aria-label={`Remove color ${col.name}`}>
                                    <X size={12} />
                                  </button>
                                </span>
                              ))
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* SECTION 5: VARIANTS MATRIX */}
                    {variantsList.length > 0 && (
                      <div style={{ marginTop: '20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                          <span style={{ fontWeight: 600, fontSize: '0.92rem' }}>
                            Auto-Generated Variants Matrix ({variantsList.length} Combinations)
                          </span>
                          <span className="ks-form-hint">Set stock quantity and optional custom price for each combination</span>
                        </div>

                        <div className="ks-admin-table-responsive" style={{ maxHeight: '280px', overflowY: 'auto', border: '1px solid var(--ks-border-card)', borderRadius: '10px' }}>
                          <table className="ks-admin-table">
                            <thead>
                              <tr>
                                <th>Variant</th>
                                <th>Stock Qty</th>
                                <th>Custom Price ($)</th>
                                <th>SKU (Optional)</th>
                                <th>Active</th>
                              </tr>
                            </thead>
                            <tbody>
                              {variantsList.map((v, idx) => {
                                const variantLabel = [v.color_name, v.size_value ? `Size ${v.size_value}` : null].filter(Boolean).join(' / ') || 'Default';
                                return (
                                  <tr key={idx}>
                                    <td>
                                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        {v.color_value && (
                                          <span
                                            style={{
                                              width: '14px',
                                              height: '14px',
                                              borderRadius: '50%',
                                              backgroundColor: v.color_value,
                                              border: '1px solid rgba(0,0,0,0.2)',
                                              flexShrink: 0
                                            }}
                                          />
                                        )}
                                        <span className="ks-table-strong">{variantLabel}</span>
                                      </div>
                                    </td>
                                    <td style={{ width: '110px' }}>
                                      <input
                                        type="number"
                                        min="0"
                                        value={v.stock_quantity !== undefined ? v.stock_quantity : 5}
                                        onChange={(e) => {
                                          const val = parseInt(e.target.value, 10) || 0;
                                          setVariantsList((prev) =>
                                            prev.map((item, i) => (i === idx ? { ...item, stock_quantity: val } : item))
                                          );
                                        }}
                                        className="ks-admin-input"
                                        style={{ height: '32px', padding: '4px 8px' }}
                                      />
                                    </td>
                                    <td style={{ width: '130px' }}>
                                      <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        placeholder={`Base ($${formData.base_price || 0})`}
                                        value={v.price !== undefined ? v.price : ''}
                                        onChange={(e) => {
                                          const val = e.target.value;
                                          setVariantsList((prev) =>
                                            prev.map((item, i) => (i === idx ? { ...item, price: val } : item))
                                          );
                                        }}
                                        className="ks-admin-input"
                                        style={{ height: '32px', padding: '4px 8px' }}
                                      />
                                    </td>
                                    <td style={{ width: '140px' }}>
                                      <input
                                        type="text"
                                        placeholder="e.g. KS-GLV-01"
                                        value={v.sku || ''}
                                        onChange={(e) => {
                                          const val = e.target.value;
                                          setVariantsList((prev) =>
                                            prev.map((item, i) => (i === idx ? { ...item, sku: val } : item))
                                          );
                                        }}
                                        className="ks-admin-input"
                                        style={{ height: '32px', padding: '4px 8px' }}
                                      />
                                    </td>
                                    <td style={{ width: '60px' }}>
                                      <input
                                        type="checkbox"
                                        checked={v.is_active !== undefined ? v.is_active : true}
                                        onChange={(e) => {
                                          const val = e.target.checked;
                                          setVariantsList((prev) =>
                                            prev.map((item, i) => (i === idx ? { ...item, is_active: val } : item))
                                          );
                                        }}
                                      />
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* SECTION 5: INVENTORY & STATUS */}
                  <div className="ks-form-section">
                    <h4 className="ks-form-section-title">5. Inventory &amp; Status</h4>
                    <div className="ks-form-row">
                      <div className="ks-form-group">
                        <label className="ks-checkbox-wrap" style={{ fontWeight: 600, marginBottom: '6px' }}>
                          <input
                            type="checkbox"
                            checked={formData.track_inventory}
                            onChange={(e) => setFormData({ ...formData, track_inventory: e.target.checked })}
                          />
                          <span className="ks-checkbox-custom" />
                          <span>Track Inventory for this Product</span>
                        </label>
                        <span className="ks-form-hint">
                          {formData.track_inventory
                            ? 'Stock quantities are actively counted and trigger Out of Stock badges.'
                            : 'Unlimited inventory. Stock will not be enforced.'}
                        </span>
                      </div>

                      {formData.track_inventory && variantsList.length === 0 && (
                        <div className="ks-form-group">
                          <label className="ks-form-label">Total Stock Quantity *</label>
                          <input
                            type="number"
                            min="0"
                            placeholder="Available units in warehouse"
                            value={formData.stock_quantity}
                            onChange={(e) => setFormData({ ...formData, stock_quantity: e.target.value })}
                            className="ks-admin-input"
                            required
                          />
                        </div>
                      )}

                      {formData.track_inventory && variantsList.length > 0 && (
                        <div className="ks-form-group">
                          <label className="ks-form-label">Total Calculated Stock</label>
                          <div className="ks-admin-input" style={{ backgroundColor: 'var(--ks-bg-card)', display: 'flex', alignItems: 'center' }}>
                            {variantsList.reduce((acc, v) => acc + (parseInt(v.stock_quantity, 10) || 0), 0)} units (sum of variants)
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="ks-form-group" style={{ marginTop: '12px' }}>
                      <label className="ks-checkbox-wrap">
                        <input
                          type="checkbox"
                          checked={formData.is_active}
                          onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                        />
                        <span className="ks-checkbox-custom" />
                        <span>Visible &amp; Active on Storefront Catalog</span>
                      </label>
                    </div>
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
                    {saveLoading ? (
                      <>
                        <Loader2 size={16} className="ks-spin-icon" />
                        <span>Saving Product...</span>
                      </>
                    ) : (
                      <span>{editingProduct ? 'Save Changes' : 'Create Product'}</span>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Confirmation Modal for Delete */}
      <ConfirmModal
        isOpen={deleteModal.isOpen}
        title="Delete Product"
        message={`Are you sure you want to delete "${deleteModal.name}"? This action cannot be undone and will delete all associated media and variants.`}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteModal({ isOpen: false, id: null, name: '' })}
        loading={deleteLoading}
      />
    </div>
  );
}
