import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  Filter, 
  SlidersHorizontal, 
  Search, 
  X, 
  ChevronLeft, 
  ChevronRight,
  Flame,
  Check
} from 'lucide-react';
import ProductCard from '../components/common/ProductCard';
import apiClient from '../services/apiClient';
import { useLanguage } from '../context/LanguageContext';

const standardSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '38', '39', '40', '41', '42', '43', '44', '45'];

const ProductsPage = () => {
  const { t, language, isRtl } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 12, totalItems: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Read filter params from URL
  const search = searchParams.get('search') || '';
  const categoryId = searchParams.get('category') || '';
  const size = searchParams.get('size') || '';
  const minPrice = searchParams.get('min_price') || '';
  const maxPrice = searchParams.get('max_price') || '';
  const onSale = searchParams.get('on_sale') === 'true';
  const inStock = searchParams.get('in_stock') === 'true';
  const sort = searchParams.get('sort') || 'best_seller';
  const page = parseInt(searchParams.get('page') || '1', 10);

  // Fetch Categories on mount
  useEffect(() => {
    apiClient('/categories')
      .then((res) => {
        if (res?.data) setCategories(res.data);
      })
      .catch((e) => console.error("Error loading categories", e));
  }, []);

  // Fetch Products whenever filters change
  useEffect(() => {
    const fetchCatalog = async () => {
      setLoading(true);
      try {
        const query = new URLSearchParams();
        if (search) query.set('search', search);
        if (categoryId) query.set('category', categoryId);
        if (size) query.set('size', size);
        if (minPrice) query.set('min_price', minPrice);
        if (maxPrice) query.set('max_price', maxPrice);
        if (onSale) query.set('on_sale', 'true');
        if (inStock) query.set('in_stock', 'true');
        if (sort) query.set('sort', sort);
        query.set('page', page.toString());
        query.set('limit', '12');

        const res = await apiClient(`/products?${query.toString()}`);
        if (res?.data) {
          setProducts(res.data);
          if (res.pagination) setPagination(res.pagination);
        }
      } catch (err) {
        console.error("Error fetching products:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCatalog();
  }, [search, categoryId, size, minPrice, maxPrice, onSale, inStock, sort, page]);

  // Helper to update specific param and reset page to 1
  const updateParam = (key, value) => {
    const newParams = new URLSearchParams(searchParams);
    if (value === null || value === '' || value === false) {
      newParams.delete(key);
    } else {
      newParams.set(key, value.toString());
    }
    newParams.set('page', '1');
    setSearchParams(newParams);
  };

  const clearAllFilters = () => {
    setSearchParams({});
  };

  return (
    <div style={{ padding: '40px 0 80px' }}>
      <div className="container">
        {/* Page Title & Search Bar */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '20px',
          marginBottom: '32px'
        }}>
          <div>
            <h1 style={{ fontSize: '32px', fontWeight: 900 }}>{t('allProducts')}</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '4px' }}>
              {pagination.totalItems} {isRtl ? "منتجات متاحة" : "products available"}
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            {/* Mobile Filter Toggle */}
            <button 
              onClick={() => setMobileFilterOpen(!mobileFilterOpen)} 
              className="btn btn-outline"
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
              id="mobile-filter-btn"
            >
              <SlidersHorizontal size={16} />
              <span>{t('filters')}</span>
            </button>

            {/* Sort Dropdown */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 600 }}>{t('sortBy')}:</span>
              <select
                value={sort}
                onChange={(e) => updateParam('sort', e.target.value)}
                style={{
                  padding: '9px 14px',
                  backgroundColor: 'var(--bg-card)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  color: 'var(--text-primary)',
                  fontWeight: 600,
                  fontSize: '13px',
                  outline: 'none'
                }}
              >
                <option value="best_seller">🔥 {t('sortBestSeller')}</option>
                <option value="price_asc">{t('sortPriceAsc')}</option>
                <option value="price_desc">{t('sortPriceDesc')}</option>
                <option value="rating_desc">⭐ {t('sortRatingDesc')}</option>
                <option value="rating_asc">{t('sortRatingAsc')}</option>
                <option value="a_z">{t('sortAZ')}</option>
                <option value="z_a">{t('sortZA')}</option>
              </select>
            </div>
          </div>
        </div>

        {/* Main Layout: Sidebar Filters + Products Grid */}
        <div style={{ display: 'flex', gap: '32px', alignItems: 'flex-start' }}>
          {/* ── Desktop Filters Sidebar ── */}
          <aside className="filters-sidebar" style={{
            width: '270px',
            flexShrink: 0,
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-lg)',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '24px',
            position: 'sticky',
            top: '90px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Filter size={18} color="var(--accent-cyan)" />
                <span>{t('filters')}</span>
              </h3>
              <button onClick={clearAllFilters} style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>
                {t('clearFilters')}
              </button>
            </div>

            {/* Category Filter */}
            <div>
              <h4 className="form-label" style={{ marginBottom: '10px' }}>{t('category')}</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <button
                  onClick={() => updateParam('category', '')}
                  style={{
                    textAlign: isRtl ? 'right' : 'left',
                    padding: '6px 10px',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '13px',
                    fontWeight: 600,
                    backgroundColor: !categoryId ? 'rgba(0, 240, 255, 0.1)' : 'transparent',
                    color: !categoryId ? 'var(--accent-cyan)' : 'var(--text-secondary)'
                  }}
                >
                  {isRtl ? "كافة الأقسام" : "All Categories"}
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => updateParam('category', cat.id)}
                    style={{
                      textAlign: isRtl ? 'right' : 'left',
                      padding: '6px 10px',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '13px',
                      fontWeight: 600,
                      backgroundColor: categoryId === cat.id ? 'rgba(0, 240, 255, 0.1)' : 'transparent',
                      color: categoryId === cat.id ? 'var(--accent-cyan)' : 'var(--text-secondary)'
                    }}
                  >
                    {language === 'ar' ? (cat.name_ar || cat.name_en) : cat.name_en}
                  </button>
                ))}
              </div>
            </div>

            {/* Size Variant Filter */}
            <div>
              <h4 className="form-label" style={{ marginBottom: '10px' }}>{t('size')}</h4>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {standardSizes.map((s) => {
                  const isSelected = size === s;
                  return (
                    <button
                      key={s}
                      onClick={() => updateParam('size', isSelected ? '' : s)}
                      style={{
                        padding: '6px 12px',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '12px',
                        fontWeight: 700,
                        backgroundColor: isSelected ? 'var(--accent-cyan)' : 'var(--bg-input)',
                        color: isSelected ? '#040914' : 'var(--text-secondary)',
                        border: isSelected ? '1px solid var(--accent-cyan)' : '1px solid var(--border-subtle)',
                        transition: 'all var(--transition-fast)'
                      }}
                    >
                      {s}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Toggles: In Stock & On Sale */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', paddingTop: '12px', borderTop: '1px solid var(--border-subtle)' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={inStock}
                  onChange={(e) => updateParam('in_stock', e.target.checked)}
                  style={{ accentColor: 'var(--accent-cyan)', width: '16px', height: '16px' }}
                />
                <span>{t('inStockOnly')}</span>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={onSale}
                  onChange={(e) => updateParam('on_sale', e.target.checked)}
                  style={{ accentColor: 'var(--accent-red)', width: '16px', height: '16px' }}
                />
                <span style={{ color: 'var(--accent-red)' }}>{t('onSaleOnly')}</span>
              </label>
            </div>
          </aside>

          {/* ── Products Grid Container ── */}
          <div style={{ flex: 1, minWidth: 0 }}>
            {loading ? (
              <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)' }}>
                Loading products...
              </div>
            ) : products.length === 0 ? (
              <div className="glass-card" style={{ padding: '60px 20px', textAlign: 'center' }}>
                <Search size={40} color="var(--text-muted)" style={{ margin: '0 auto 16px' }} />
                <h3 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '8px' }}>{t('noProductsFound')}</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '20px' }}>
                  {isRtl ? "جرّب مسح الفلاتر أو تغيير كلمة البحث." : "Try clearing selected filters or modifying your search query."}
                </p>
                <button onClick={clearAllFilters} className="btn btn-primary btn-sm">
                  {t('clearFilters')}
                </button>
              </div>
            ) : (
              <div>
                <div className="grid-products">
                  {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>

                {/* Pagination Controls */}
                {pagination.totalPages > 1 && (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '12px',
                    marginTop: '48px'
                  }}>
                    <button
                      disabled={page <= 1}
                      onClick={() => updateParam('page', page - 1)}
                      className="btn btn-outline btn-sm"
                      style={{ opacity: page <= 1 ? 0.4 : 1 }}
                    >
                      {isRtl ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
                      <span>{isRtl ? "السابق" : "Previous"}</span>
                    </button>

                    <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-secondary)' }}>
                      {page} / {pagination.totalPages}
                    </span>

                    <button
                      disabled={page >= pagination.totalPages}
                      onClick={() => updateParam('page', page + 1)}
                      className="btn btn-outline btn-sm"
                      style={{ opacity: page >= pagination.totalPages ? 0.4 : 1 }}
                    >
                      <span>{isRtl ? "التالي" : "Next"}</span>
                      {isRtl ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 860px) {
          .filters-sidebar { display: none !important; }
        }
      `}</style>
    </div>
  );
};

export default ProductsPage;
