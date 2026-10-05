import React, { useState, useEffect } from 'react';
import { Tags, Plus, Edit2, Trash2, Check, X } from 'lucide-react';
import { adminApi } from '../../api/adminApi';
import ConfirmModal from '../../components/admin/ConfirmModal';

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [stats, setStats] = useState({ total: 0, active: 0, inactive: 0 });
  const [loading, setLoading] = useState(true);

  // Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [name, setName] = useState('');
  const [sortOrder, setSortOrder] = useState(0);
  const [isActive, setIsActive] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);

  // Delete Confirm
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: null, name: '' });
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Toast
  const [toastMessage, setToastMessage] = useState(null);
  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
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
    } else {
      setEditingCategory(null);
      setName('');
      setSortOrder(categories.length);
      setIsActive(true);
    }
    setModalOpen(true);
  };

  const handleSaveCategory = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast('Category name is required.');
      return;
    }

    setSaveLoading(true);
    try {
      let res;
      if (editingCategory) {
        res = await adminApi.updateCategory(editingCategory.id, {
          name: name.trim(),
          sort_order: sortOrder,
          is_active: isActive
        });
      } else {
        res = await adminApi.createCategory({
          name: name.trim(),
          sort_order: sortOrder,
          is_active: isActive
        });
      }

      if (res && res.success) {
        showToast(res.message || 'Category saved.');
        setModalOpen(false);
        loadCategories();
      } else {
        showToast(res.message || 'Failed to save category.');
      }
    } catch {
      showToast('Network error saving category.');
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
        showToast(`Category "${cat.name}" ${!cat.isActive ? 'activated' : 'deactivated'}.`);
      }
    } catch {
      showToast('Error updating category.');
    }
  };

  const handleConfirmDelete = async () => {
    setDeleteLoading(true);
    try {
      const res = await adminApi.deleteCategory(deleteModal.id);
      if (res && res.success) {
        showToast(res.message || 'Category deleted.');
        setDeleteModal({ isOpen: false, id: null, name: '' });
        loadCategories();
      } else {
        showToast(res.message || 'Could not delete category.');
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
          <span className="ks-admin-header-eyebrow">CATALOG TAXONOMY</span>
          <h1 className="ks-admin-page-title">Categories Management</h1>
        </div>

        <button
          type="button"
          onClick={() => openModal(null)}
          className="ks-admin-btn-primary"
        >
          <Plus size={15} />
          <span>New Category</span>
        </button>
      </div>

      {/* OVERVIEW STAT CARDS */}
      <div className="ks-admin-stats-grid">
        <div className="ks-admin-stat-card">
          <div className="ks-stat-card-icon-wrap is-neutral">
            <Tags size={20} />
          </div>
          <div className="ks-stat-card-content">
            <span className="ks-stat-card-label">TOTAL CATEGORIES</span>
            <div className="ks-stat-card-value">{loading ? '—' : stats.total}</div>
          </div>
        </div>

        <div className="ks-admin-stat-card">
          <div className="ks-stat-card-icon-wrap is-neutral">
            <Check size={20} />
          </div>
          <div className="ks-stat-card-content">
            <span className="ks-stat-card-label">ACTIVE IN STORE</span>
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
                  disabled={saveLoading}
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
