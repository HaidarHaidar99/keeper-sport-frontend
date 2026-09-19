import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { 
  Filter, 
  SlidersHorizontal, 
  Search, 
  X, 
  ChevronLeft, 
  ChevronRight,
  Flame,
  Check,
  RotateCcw
} from 'lucide-react';
import ProductCard from '../components/common/ProductCard';
import apiClient from '../services/apiClient';
import { useLanguage } from '../context/LanguageContext';

const clothingSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
const shoeSizes = ['38', '39', '40', '41', '42', '43', '44', '45'];

const ProductsPage = () => {
  const { t, language, isRtl } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 12, totalItems: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Read filter params from URL (PostgreSQL authoritative state)
  const search = searchParams.get('search') || '';
  const categoryId = searchParams.get('category') || '';
  const size = searchParams.get('size') || '';
  const minPrice = searchParams.get('min_price') || '';
  const maxPrice = searchParams.get('max_price') || '';
  const onSale = searchParams.get('on_sale') === 'true';
  const inStock = searchParams.get('in_stock') === 'true';
  const isFeatured = searchParams.get('is_featured') === 'true';
  const sort = searchParams.get('sort') || 'best_seller';
  const page = parseInt(searchParams.get('page') || '1', 10);

  // Local state for price inputs to allow typing before submitting
  const [localMinPrice, setLocalMinPrice] = useState(minPrice);
  const [localMaxPrice, setLocalMaxPrice] = useState(maxPrice);
  const [localSearch, setLocalSearch] = useState(search);

  useEffect(() => {
    setLocalMinPrice(minPrice);
    setLocalMaxPrice(maxPrice);
    setLocalSearch(search);
  }, [minPrice, maxPrice, search]);

  // Fetch Categories on mount (Cached lookup)
  useEffect(() => {
    let isMounted = true;
    apiClient('/categories')
      .then((res) => {
        if (isMounted && res?.data) setCategories(res.data);
      })
      .catch((e) => console.error("Error loading categories", e));
    return () => { isMounted = false; };
  }, []);

  // Fetch Products whenever URL query parameters change (PostgreSQL RPC)
  useEffect(() => {
    let isMounted = true;
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
        if (isFeatured) query.set('is_featured', 'true');
        if (sort) query.set('sort', sort);
        query.set('page', page.toString());
        query.set('limit', '12');

        const res = await apiClient(`/products?${query.toString()}`);
        if (isMounted && res?.data) {
          setProducts(res.data);
          if (res.pagination) setPagination(res.pagination);
        }
      } catch (err) {
        console.error("Error fetching products:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchCatalog();
    return () => { isMounted = false; };
  }, [search, categoryId, size, minPrice, maxPrice, onSale, inStock, isFeatured, sort, page]);

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

  const handlePriceApply = (e) => {
    e.preventDefault();
    const newParams = new URLSearchParams(searchParams);
    if (localMinPrice) newParams.set('min_price', localMinPrice);
    else newParams.delete('min_price');
    if (localMaxPrice) newParams.set('max_price', localMaxPrice);
    else newParams.delete('max_price');
    newParams.set('page', '1');
    setSearchParams(newParams);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    updateParam('search', localSearch.trim());
  };

  const clearAllFilters = () => {
    setSearchParams({});
    setLocalMinPrice('');
    setLocalMaxPrice('');
    setLocalSearch('');
    setMobileFilterOpen(false);
  };

  // Reusable Filter Content (used in both desktop sidebar & mobile drawer)
  const renderFilterContent = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
      {/* Category Filter */}
      <div>
        <h4 className="form-label" style={{ marginBottom: '8px' }}>{t('category')}</h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <button
            type="button"
            onClick={() => updateParam('category', '')}
            style={{
              textAlign: isRtl ? 'right' : 'left',
              padding: '7px 10px',
              borderRadius: 'var(--radius-sm)',
              fontSize: '13px',
              fontWeight: 700,
              backgroundColor: !categoryId ? 'var(--brand-red-light)' : 'transparent',
              color: !categoryId ? 'var(--brand-red)' : 'var(--text-secondary)',
              transition: 'all var(--transition-fast)'
            }}
          >
            {isRtl ? "كافة الأقسام" : "All Categories"}
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => updateParam('category', cat.id)}
              style={{
                textAlign: isRtl ? 'right' : 'left',
                padding: '7px 10px',
                borderRadius: 'var(--radius-sm)',
                fontSize: '13px',
                fontWeight: 700,
                backgroundColor: categoryId === cat.id ? 'var(--brand-red-light)' : 'transparent',
                color: categoryId === cat.id ? 'var(--brand-red)' : 'var(--text-secondary)',
                transition: 'all var(--transition-fast)'
              }}
            >
              {language === 'ar' ? (cat.name_ar || cat.name_en) : cat.name_en}
            </button>
          ))}
        </div>
      </div>

      {/* Clothing Sizes */}
      <div style={{ paddingTop: '14px', borderTop: '1px solid var(--border-subtle)' }}>
        <h4 className="form-label" style={{ marginBottom: '8px' }}>
          {isRtl ? "مقاسات الملابس" : "Clothing Sizes"}
        </h4>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
          {clothingSizes.map((s) => {
            const isSelected = size === s;
            return (
              <button
                key={s}
                type="button"
                onClick={() => updateParam('size', isSelected ? '' : s)}
                style={{
                  minWidth: '38px',
                  height: '32px',
                  paddingInlineStart: '8px',
                  paddingInlineEnd: '8px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '12px',
                  fontWeight: 800,
                  backgroundColor: isSelected ? 'var(--brand-red)' : 'var(--bg-input)',
                  color: isSelected ? '#FFFFFF' : 'var(--text-secondary)',
                  border: isSelected ? '1px solid var(--brand-red)' : '1px solid var(--border-medium)',
                  transition: 'all var(--transition-fast)'
                }}
              >
                {s}
              </button>
            );
          })}
        </div>
      </div>

      {/* Shoe Sizes */}
      <div style={{ paddingTop: '14px', borderTop: '1px solid var(--border-subtle)' }}>
        <h4 className="form-label" style={{ marginBottom: '8px' }}>
          {isRtl ? "مقاسات الأحذية" : "Shoe Sizes (EU)"}
        </h4>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
          {shoeSizes.map((s) => {
            const isSelected = size === s;
            return (
              <button
                key={s}
                type="button"
                onClick={() => updateParam('size', isSelected ? '' : s)}
                style={{
                  minWidth: '38px',
                  height: '32px',
                  paddingInlineStart: '8px',
                  paddingInlineEnd: '8px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '12px',
                  fontWeight: 800,
                  backgroundColor: isSelected ? 'var(--brand-red)' : 'var(--bg-input)',
                  color: isSelected ? '#FFFFFF' : 'var(--text-secondary)',
                  border: isSelected ? '1px solid var(--brand-red)' : '1px solid var(--border-medium)',
                  transition: 'all var(--transition-fast)'
                }}
              >
                {s}
              </button>
            );
          })}
        </div>
      </div>

      {/* Price Range Filter */}
      <div style={{ paddingTop: '14px', borderTop: '1px solid var(--border-subtle)' }}>
        <h4 className="form-label" style={{ marginBottom: '8px' }}>{t('priceRange')} ($)</h4>
        <form onSubmit={handlePriceApply} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <input 
              type="number"
              placeholder="Min"
              min="0"
              value={localMinPrice}
              onChange={(e) => setLocalMinPrice(e.target.value)}
              className="form-input"
              style={{ height: '36px', fontSize: '13px' }}
            />
            <span style={{ color: 'var(--text-muted)' }}>-</span>
            <input 
              type="number"
              placeholder="Max"
              min="0"
              value={localMaxPrice}
              onChange={(e) => setLocalMaxPrice(e.target.value)}
              className="form-input"
              style={{ height: '36px', fontSize: '13px' }}
            />
          </div>
          <button type="submit" className="btn btn-secondary btn-sm" style={{ width: '100%' }}>
            {isRtl ? "تطبيق السعر" : "Apply Price"}
          </button>
        </form>
      </div>

      {/* Toggles: In Stock, On Sale, Featured */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', paddingTop: '14px', borderTop: '1px solid var(--border-subtle)' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={inStock}
            onChange={(e) => updateParam('in_stock', e.target.checked)}
            style={{ accentColor: 'var(--brand-red)', width: '16px', height: '16px' }}
          />
          <span>{t('inStockOnly')}</span>
        </label>

        <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={onSale}
            onChange={(e) => updateParam('on_sale', e.target.checked)}
            style={{ accentColor: 'var(--brand-red)', width: '16px', height: '16px' }}
          />
          <span style={{ color: 'var(--brand-red)' }}>{t('onSaleOnly')}</span>
        </label>

        <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={isFeatured}
            onChange={(e) => updateParam('is_featured', e.target.checked)}
            style={{ accentColor: 'var(--brand-red)', width: '16px', height: '16px' }}
          />
          <span>{isRtl ? "المميزة فقط" : "Featured Only"}</span>
        </label>
      </div>
    </div>
  );

  return (
    <div style={{ padding: '40px 0 80px' }}>
      <div className="container">
        {/* Header Bar */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '16px',
          marginBottom: '28px'
        }}>
          <div>
            <h1 style={{ fontSize: '30px', fontWeight: 900, color: 'var(--text-primary)' }}>
              {t('allProducts')}
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginTop: '2px' }}>
              {pagination.totalItems} {isRtl ? "منتجات معتمدة في الملعب" : "pitch-ready products found"}
            </p>
          </div>

          {/* Search + Mobile Filter Button + Sort Select */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            {/* Search Input */}
            <form onSubmit={handleSearchSubmit} style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                backgroundColor: 'var(--bg-input)',
                border: '1px solid var(--border-medium)',
                borderRadius: 'var(--radius-sm)',
                paddingInlineStart: '10px',
                height: '38px',
                width: '200px'
              }}>
                <Search size={14} color="var(--text-muted)" style={{ flexShrink: 0 }} />
                <input 
                  type="text"
                  placeholder={t('searchPlaceholder')}
                  value={localSearch}
                  onChange={(e) => setLocalSearch(e.target.value)}
                  style={{
                    background: 'none',
                    border: 'none',
                    outline: 'none',
                    color: 'var(--text-primary)',
                    fontSize: '13px',
                    paddingInlineStart: '6px',
                    width: '100%'
                  }}
                />
              </div>
            </form>

            {/* Mobile Filter Toggle */}
            <button 
              type="button"
              onClick={() => setMobileFilterOpen(true)} 
              className="btn btn-secondary btn-sm mobile-filter-btn"
              style={{ gap: '6px' }}
            >
              <SlidersHorizontal size={15} />
              <span>{t('filters')}</span>
            </button>

            {/* Sort Select */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <select
                value={sort}
                onChange={(e) => updateParam('sort', e.target.value)}
                style={{
                  height: '38px',
                  paddingInlineStart: '12px',
                  paddingInlineEnd: '12px',
                  backgroundColor: 'var(--bg-input)',
                  border: '1px solid var(--border-medium)',
                  borderRadius: 'var(--radius-sm)',
                  color: 'var(--text-primary)',
                  fontWeight: 700,
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
                <option value="newest">{isRtl ? "الأحدث" : "Newest"}</option>
              </select>
            </div>
          </div>
        </div>

        {/* Main Layout: Desktop Sidebar + Product Grid */}
        <div style={{ display: 'flex', gap: '30px', alignItems: 'flex-start' }}>
          {/* Desktop Filters Sidebar */}
          <aside className="filters-sidebar" style={{
            width: '260px',
            flexShrink: 0,
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: '22px',
            position: 'sticky',
            top: '90px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '15px', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Filter size={16} color="var(--brand-red)" />
                <span>{t('filters')}</span>
              </h3>
              <button 
                type="button" 
                onClick={clearAllFilters} 
                style={{ fontSize: '12px', color: 'var(--brand-red)', fontWeight: 700 }}
              >
                {t('clearFilters')}
              </button>
            </div>

            {renderFilterContent()}
          </aside>

          {/* Product Grid & States */}
          <div style={{ flex: 1, minWidth: 0 }}>
            {loading ? (
              <div style={{ padding: '80px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
                {isRtl ? "جارٍ تحميل المنتجات..." : "Loading pitch products..."}
              </div>
            ) : products.length === 0 ? (
              <div className="card" style={{ padding: '60px 20px', textAlign: 'center' }}>
                <Search size={42} color="var(--text-muted)" style={{ margin: '0 auto 16px' }} />
                <h3 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '8px' }}>
                  {t('noProductsFound')}
                </h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '20px' }}>
                  {isRtl ? "جرّب مسح الفلاتر أو تغيير كلمة البحث." : "Try clearing your filters or search keyword."}
                </p>
                <button type="button" onClick={clearAllFilters} className="btn btn-primary btn-sm">
                  <RotateCcw size={14} />
                  <span>{t('clearFilters')}</span>
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
                    marginTop: '44px'
                  }}>
                    <button
                      type="button"
                      disabled={page <= 1}
                      onClick={() => updateParam('page', page - 1)}
                      className="btn btn-secondary btn-sm"
                      style={{ opacity: page <= 1 ? 0.4 : 1 }}
                    >
                      {isRtl ? <ChevronRight size={15} /> : <ChevronLeft size={15} />}
                      <span>{isRtl ? "السابق" : "Previous"}</span>
                    </button>

                    <span style={{ fontSize: '13px', fontWeight: 800, color: 'var(--text-secondary)' }}>
                      {page} / {pagination.totalPages}
                    </span>

                    <button
                      type="button"
                      disabled={page >= pagination.totalPages}
                      onClick={() => updateParam('page', page + 1)}
                      className="btn btn-secondary btn-sm"
                      style={{ opacity: page >= pagination.totalPages ? 0.4 : 1 }}
                    >
                      <span>{isRtl ? "التالي" : "Next"}</span>
                      {isRtl ? <ChevronLeft size={15} /> : <ChevronRight size={15} />}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Filter Drawer Modal */}
      {mobileFilterOpen && (
        <div className="modal-overlay" onClick={() => setMobileFilterOpen(false)} style={{ zIndex: 1200 }}>
          <div 
            className="modal-content" 
            onClick={(e) => e.stopPropagation()} 
            style={{ maxWidth: '400px', maxHeight: '85vh', overflowY: 'auto' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Filter size={18} color="var(--brand-red)" />
                <span>{t('filters')}</span>
              </h3>
              <button 
                type="button" 
                onClick={() => setMobileFilterOpen(false)}
                style={{ padding: '4px', color: 'var(--text-muted)' }}
              >
                <X size={20} />
              </button>
            </div>

            {renderFilterContent()}

            <div style={{ display: 'flex', gap: '10px', marginTop: '24px' }}>
              <button 
                type="button" 
                onClick={clearAllFilters} 
                className="btn btn-secondary" 
                style={{ flex: 1 }}
              >
                {t('clearFilters')}
              </button>
              <button 
                type="button" 
                onClick={() => setMobileFilterOpen(false)} 
                className="btn btn-primary" 
                style={{ flex: 1 }}
              >
                {isRtl ? "عرض النتائج" : "Show Results"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Responsive Breakpoint CSS */}
      <style>{`
        .mobile-filter-btn { display: none !important; }
        @media (max-width: 860px) {
          .filters-sidebar { display: none !important; }
          .mobile-filter-btn { display: inline-flex !important; }
        }
      `}</style>
    </div>
  );
};

export default ProductsPage;
