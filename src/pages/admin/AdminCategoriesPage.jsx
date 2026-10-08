import React, { useState, useEffect } from 'react';
import { Tags, Plus, Edit2, Trash2, Check, X, Upload, Image as ImageIcon, Loader2 } from 'lucide-react';
import { adminApi } from '../../api/adminApi';
import { useSite } from '../../context/SiteContext';
import ConfirmModal from '../../components/admin/ConfirmModal';

// Helper to compress large camera/phone images (> 1.5MB) before upload to avoid Vercel 4.5MB payload limit
async function compressImageIfNeeded(file) {
  if (!file || !file.type || !file.type.startsWith('image/')) return file;
  if (file.type === 'image/svg+xml' || file.type === 'image/gif') return file;
  if (file.size <= 1.5 * 1024 * 1024) return file; // Already reasonably sized

  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      const maxDim = 1600;
      let { width, height } = img;
      if (width > maxDim || height > maxDim) {
        if (width > height) {
          height = Math.round((height * maxDim) / width);
          width = maxDim;
        } else {
          width = Math.round((width * maxDim) / height);
          height = maxDim;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);

      const mimeType = file.type === 'image/png' ? 'image/jpeg' : file.type;
      canvas.toBlob(
        (blob) => {
          if (!blob || blob.size >= file.size) {
            resolve(file);
          } else {
            const compressedFile = new File([blob], file.name.replace(/\.[^/.]+$/, '.jpg'), {
              type: mimeType,
              lastModified: Date.now()
            });
            resolve(compressedFile);
          }
        },
        mimeType,
        0.85
      );
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(file);
    };
    img.src = url;
  });
}

export default function AdminCategoriesPage() {
  const { refreshCategories } = useSite();
  const [categories, setCategories] = useState([]);
  const [stats, setStats] = useState({ total: 0, active: 0, inactive: 0 });
  const [loading, setLoading] = useState(true);

  // Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [name, setName] = useState('');
  const [sortOrder, setSortOrder] = useState(0);
  const [isActive, setIsActive] = useState(true);
  const [imagePath, setImagePath] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);

  // Delete Confirm
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: null, name: '' });
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Toast
  const [toastMessage, setToastMessage] = useState(null);
  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const loadCategories = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getCategories();
      if (res && res.success) {
        setCategories(res.categories || []);
        if (res.stats) setStats(res.stats);
      }
    } catch (err) {
      console.error('Error loading categories:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const openModal = (cat = null) => {
    if (cat) {
      setEditingCategory(cat);
      setName(cat.name || '');
      setSortOrder(cat.sortOrder ?? 0);
      setIsActive(Boolean(cat.isActive));
      setImagePath(cat.imagePath || '');
    } else {
      setEditingCategory(null);
      setName('');
      setSortOrder(categories.length);
      setIsActive(true);
      setImagePath('');
    }
    setModalOpen(true);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const processedFile = await compressImageIfNeeded(file);
      const res = await adminApi.uploadMedia(processedFile);
      if (res && res.success && res.url) {
        setImagePath(res.url);
        showToast('Category image uploaded successfully.');
      } else {
        showToast(res?.message || 'Image upload failed. Please try again.');
      }
    } catch (err) {
      showToast(err?.message || 'Image upload failed. Please try again.');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleRemoveImage = () => {
    setImagePath('');
    showToast('Category image removed.');
  };

  const handleSaveCategory = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast('Category name is required.');
      return;
    }

    setSaveLoading(true);
    try {
      const payload = {
        name: name.trim(),
        sort_order: sortOrder,
        is_active: isActive,
        image_path: imagePath ? imagePath.trim() : null
      };

      let res;
      if (editingCategory) {
        res = await adminApi.updateCategory(editingCategory.id, payload);
      } else {
        res = await adminApi.createCategory(payload);
      }

      if (res && res.success) {
        showToast(res.message || 'Category saved successfully.');
        setModalOpen(false);
        loadCategories();
        refreshCategories();
      } else {
        showToast(res?.message || 'Failed to save category. Please try again.');
      }
    } catch (err) {
      showToast(err?.message || 'Failed to save category. Please try again.');
    } finally {
      setSaveLoading(false);
    }
  };

  const handleToggleActive = async (cat) => {
    try {
      const res = await adminApi.updateCategory(cat.id, { is_active: !cat.isActive });
      if (res && res.success) {
        setCategories((prev) =>
          prev.map((c) => (c.id === cat.id ? { ...c, isActive: !c.isActive } : c))
        );
        loadCategories();
        refreshCategories();
        showToast(`Category "${cat.name}" ${!cat.isActive ? 'activated' : 'deactivated'}.`);
      }
    } catch {
      showToast('Error toggling category status.');
    }
  };

  const handleConfirmDelete = async () => {
    setDeleteLoading(true);
    try {
      const res = await adminApi.deleteCategory(deleteModal.id);
      if (res && res.success) {
        showToast('Category deleted successfully.');
        setDeleteModal({ isOpen: false, id: null, name: '' });
        loadCategories();
        refreshCategories();
      } else {
        showToast(res.message || 'Failed to delete category.');
      }
    } catch {
      showToast('Network error deleting category.');
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
      <div className="ks-admin-page-header">
        <div>
          <h1 className="ks-admin-page-title">Categories Management</h1>
          <p className="ks-admin-page-subtitle">
            Organize catalog hierarchy, manage category ordering, single cover visual, and storefront visibility.
          </p>
        </div>
        <button
          type="button"
          onClick={() => openModal()}
          className="ks-admin-btn-primary"
        >
          <Plus size={16} />
          <span>New Category</span>
        </button>
      </div>

      {/* Top Metric Cards */}
      <div className="ks-admin-stats-grid" style={{ marginBottom: '24px' }}>
        <div className="ks-admin-stat-card">
          <div className="ks-stat-card-icon-wrap is-red">
            <Tags size={20} />
          </div>
          <div className="ks-stat-card-content">
            <span className="ks-stat-card-label">TOTAL CATEGORIES</span>
            <div className="ks-stat-card-value">{loading ? '—' : stats.total}</div>
          </div>
        </div>

        <div className="ks-admin-stat-card">
          <div className="ks-stat-card-icon-wrap is-active">
            <Check size={20} />
          </div>
          <div className="ks-stat-card-content">
            <span className="ks-stat-card-label">ACTIVE / VISIBLE</span>
            <div className="ks-stat-card-value">{loading ? '—' : stats.active}</div>
          </div>
        </div>

        <div className="ks-admin-stat-card">
          <div className="ks-stat-card-icon-wrap is-neutral">
            <X size={20} />
          </div>
          <div className="ks-stat-card-content">
            <span className="ks-stat-card-label">INACTIVE</span>
            <div className="ks-stat-card-value">{loading ? '—' : stats.inactive}</div>
          </div>
        </div>
      </div>

      {/* CATEGORIES TABLE */}
      <section className="ks-admin-panel" aria-label="Categories Table">
        <div className="ks-admin-panel-body" style={{ padding: 0 }}>
          {loading ? (
            <div className="ks-admin-table-loading">Loading categories...</div>
          ) : categories.length === 0 ? (
            <div className="ks-admin-empty-notice" style={{ padding: '48px 24px' }}>
              <span>No categories created yet. Click "New Category" to create your first one.</span>
            </div>
          ) : (
            <div className="ks-admin-table-responsive">
              <table className="ks-admin-table">
                <thead>
                  <tr>
                    <th style={{ width: '64px' }}>Image</th>
                    <th>Category Name</th>
                    <th>Slug</th>
                    <th>Assigned Products</th>
                    <th>Sort Order</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.map((c) => (
                    <tr key={c.id}>
                      <td>
                        <div
                          style={{
                            width: '44px',
                            height: '44px',
                            borderRadius: '6px',
                            overflow: 'hidden',
                            backgroundColor: 'var(--ks-bg-card)',
                            border: '1px solid var(--ks-border-color)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          {c.imagePath ? (
                            <img
                              src={c.imagePath}
                              alt={c.name}
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                          ) : (
                            <ImageIcon size={18} style={{ opacity: 0.3 }} />
                          )}
                        </div>
                      </td>
                      <td>
                        <div className="ks-table-strong">{c.name}</div>
                      </td>
                      <td>
                        <code>{c.slug}</code>
                      </td>
                      <td>
                        <span className="ks-table-badge-count">{c.productCount} products</span>
                      </td>
                      <td>{c.sortOrder}</td>
                      <td>
                        <button
                          type="button"
                          onClick={() => handleToggleActive(c)}
                          className={`ks-toggle-switch ${c.isActive ? 'is-active' : ''}`}
                          aria-label={c.isActive ? 'Deactivate category' : 'Activate category'}
                        >
                          <span className="ks-toggle-slider" />
                        </button>
                      </td>
                      <td>
                        <div className="ks-table-actions-cell">
                          <button
                            type="button"
                            onClick={() => openModal(c)}
                            className="ks-table-icon-btn"
                            title="Edit Category"
                          >
                            <Edit2 size={15} />
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              setDeleteModal({
                                isOpen: true,
                                id: c.id,
                                name: c.name
                              })
                            }
                            className="ks-table-icon-btn is-danger"
                            title="Delete Category"
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
      </section>

      {/* CREATE / EDIT CATEGORY MODAL */}
      {modalOpen && (
        <div className="ks-admin-modal-backdrop" onClick={() => setModalOpen(false)} role="dialog" aria-modal="true">
          <div className="ks-admin-modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="ks-admin-modal-header">
              <h3 className="ks-admin-modal-title">
                {editingCategory ? `Edit "${editingCategory.name}"` : 'New Category'}
              </h3>
              <button type="button" onClick={() => setModalOpen(false)} className="ks-admin-modal-close-btn" aria-label="Close">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveCategory} className="ks-admin-form">
              <div className="ks-admin-modal-body">
                {/* Category Name */}
                <div className="ks-form-group">
                  <label className="ks-form-label">Category Name *</label>
                  <input
                    type="text"
                    placeholder="e.g. Goalkeeper Gloves, Match Kits, Accessories"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="ks-admin-input"
                    required
                  />
                </div>

                {/* EXACTLY ONE CATEGORY IMAGE */}
                <div className="ks-form-group" style={{ marginTop: '16px', marginBottom: '16px' }}>
                  <label className="ks-form-label">
                    Category Cover Image (Outer Public Card Visual)
                  </label>
                  <span className="ks-form-hint" style={{ display: 'block', marginBottom: '10px' }}>
                    Single high-resolution visual displayed on the public outer category card.
                  </span>

                  {imagePath ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <div
                        style={{
                          width: '100px',
                          height: '80px',
                          borderRadius: '8px',
                          overflow: 'hidden',
                          border: '1px solid var(--ks-border-color)',
                          backgroundColor: 'var(--ks-bg-card)'
                        }}
                      >
                        <img
                          src={imagePath}
                          alt="Category Preview"
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      </div>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <label
                          className="ks-admin-btn-secondary"
                          style={{ cursor: 'pointer', padding: '6px 14px', fontSize: '0.85rem' }}
                        >
                          <Upload size={14} />
                          <span>Replace Image</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            style={{ display: 'none' }}
                            disabled={uploadingImage}
                          />
                        </label>
                        <button
                          type="button"
                          onClick={handleRemoveImage}
                          className="ks-admin-btn-secondary"
                          style={{ color: 'var(--ks-error-red)', padding: '6px 14px', fontSize: '0.85rem' }}
                        >
                          Remove Image
                        </button>
                      </div>
                    </div>
                  ) : (
                    <label
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '24px 16px',
                        border: '2px dashed var(--ks-border-color)',
                        borderRadius: '8px',
                        cursor: uploadingImage ? 'wait' : 'pointer',
                        backgroundColor: 'var(--ks-bg-card)',
                        textAlign: 'center'
                      }}
                    >
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        style={{ display: 'none' }}
                        disabled={uploadingImage}
                      />
                      {uploadingImage ? (
                        <>
                          <Loader2 size={24} className="ks-spinner-icon" style={{ marginBottom: '8px' }} />
                          <span style={{ fontSize: '0.9rem', color: 'var(--ks-text-subtitle)' }}>
                            Uploading Image to Storage...
                          </span>
                        </>
                      ) : (
                        <>
                          <ImageIcon size={26} style={{ marginBottom: '8px', opacity: 0.5 }} />
                          <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>Click to choose category image</span>
                          <span style={{ fontSize: '0.8rem', color: 'var(--ks-text-subtitle)', marginTop: '4px' }}>
                            PNG, JPG, or WebP (Stored persistently in media bucket)
                          </span>
                        </>
                      )}
                    </label>
                  )}
                </div>

                <div className="ks-form-row">
                  <div className="ks-form-group">
                    <label className="ks-form-label">Sort Order</label>
                    <input
                      type="number"
                      min="0"
                      value={sortOrder}
                      onChange={(e) => setSortOrder(parseInt(e.target.value, 10) || 0)}
                      className="ks-admin-input"
                    />
                  </div>

                  <div className="ks-form-group" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <label className="ks-form-label">Active State</label>
                    <label className="ks-checkbox-wrap">
                      <input
                        type="checkbox"
                        checked={isActive}
                        onChange={(e) => setIsActive(e.target.checked)}
                      />
                      <span className="ks-checkbox-custom" />
                      <span>Visible in Store</span>
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
                  disabled={saveLoading || uploadingImage}
                  className="ks-admin-btn-primary"
                >
                  {saveLoading ? 'Saving...' : editingCategory ? 'Update Category' : 'Create Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Safeguard Modal */}
      <ConfirmModal
        isOpen={deleteModal.isOpen}
        title="Delete Category"
        message={`Are you sure you want to delete category "${deleteModal.name}"? This operation will be rejected if products are currently assigned to it.`}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteModal({ isOpen: false, id: null, name: '' })}
        loading={deleteLoading}
      />
    </div>
  );
}
