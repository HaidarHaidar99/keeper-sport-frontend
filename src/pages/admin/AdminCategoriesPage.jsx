import React, { useState, useEffect } from 'react';
import { Layers, Plus, Edit2, Trash2 } from 'lucide-react';
import apiClient from '../../services/apiClient';

const AdminCategoriesPage = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [nameEn, setNameEn] = useState('');
  const [nameAr, setNameAr] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchCats = async () => {
    setLoading(true);
    try {
      const res = await apiClient('/categories');
      if (res?.data) setCategories(res.data);
    } catch (err) {
      console.error("Categories error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCats();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await apiClient('/categories', {
        method: 'POST',
        body: JSON.stringify({ name_en: nameEn, name_ar: nameAr || nameEn })
      });
      setNameEn('');
      setNameAr('');
      fetchCats();
    } catch (err) {
      alert(err.message || "Failed to create category");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 900 }}>Categories Management</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '4px' }}>
          Organize store collections (Football Shirts, Shoes, Sportswear, Accessories).
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '32px', alignItems: 'flex-start' }}>
        {/* Category List */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '16px' }}>Existing Categories</h3>
          {loading ? (
            <div style={{ color: 'var(--text-muted)' }}>Loading categories...</div>
          ) : categories.length === 0 ? (
            <div style={{ color: 'var(--text-muted)' }}>No categories created yet.</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {categories.map((c) => (
                <div key={c.id} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px 16px',
                  backgroundColor: 'var(--bg-input)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-subtle)'
                }}>
                  <div>
                    <div style={{ fontWeight: 800 }}>{c.name_en}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{c.name_ar}</div>
                  </div>
                  <span className="badge badge-cyan">{c.is_active ? 'Active' : 'Hidden'}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Add Category Form */}
        <div className="glass-card" style={{ padding: '28px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '16px' }}>Add New Category</h3>
          <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Category Name (EN)</label>
              <input
                type="text"
                required
                className="form-input"
                placeholder="Football Boots"
                value={nameEn}
                onChange={(e) => setNameEn(e.target.value)}
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Category Name (AR)</label>
              <input
                type="text"
                className="form-input"
                placeholder="أحذية كرة القدم"
                value={nameAr}
                onChange={(e) => setNameAr(e.target.value)}
              />
            </div>

            <button type="submit" disabled={submitting} className="btn btn-primary btn-lg" style={{ marginTop: '8px' }}>
              {submitting ? "Creating..." : "Create Category"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminCategoriesPage;
