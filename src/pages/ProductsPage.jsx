import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Search,
  SlidersHorizontal,
  X,
  RotateCcw,
  PackageX,
  AlertTriangle,
  Loader2,
  ChevronDown
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSite } from '../context/SiteContext';
import { contentApi } from '../api/contentApi';
import { productApi } from '../api/productApi';
import Navbar from '../components/Navbar';
import OffersBar from '../components/OffersBar';
import ProductCard from '../components/ProductCard';
import FeaturedRail from '../components/FeaturedRail';
import ProductFilterDrawer from '../components/ProductFilterDrawer';
import Footer from '../components/Footer';

export default function ProductsPage() {
  const { user } = useAuth();
  const { siteSettings, categories, counts, refreshCounts: refreshUserCounts } = useSite();
  const [searchParams, setSearchParams] = useSearchParams();

  // Global Page Data
  const [offerBars, setOfferBars] = useState([]);

  // Featured Products Rail State
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [featuredLoading, setFeaturedLoading] = useState(true);

  // Catalog Products State
  const [products, setProducts] = useState([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [apiError, setApiError] = useState(null);

  // Filter Drawer State
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);

  // Filter & Search Values initialized from URL query params
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [selectedSort, setSelectedSort] = useState(searchParams.get('sort') || 'featured');
  const [inStockOnly, setInStockOnly] = useState(searchParams.get('in_stock') === 'true');
  const [onSaleOnly, setOnSaleOnly] = useState(searchParams.get('on_sale') === 'true');
  const [minPrice, setMinPrice] = useState(searchParams.get('min_price') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('max_price') || '');

  // 1. Fetch Offers on Mount
  useEffect(() => {
    let isMounted = true;
    contentApi.getOfferBars().then((res) => {
      if (isMounted && res.success && res.offers) setOfferBars(res.offers);
    });
    return () => {
      isMounted = false;
    };
  }, []);

  // 3. Fetch Featured Products Rail
  useEffect(() => {
    let isMounted = true;
    setFeaturedLoading(true);

    productApi.getFeaturedProducts(8).then((res) => {
      if (isMounted) {
        if (res && res.success && Array.isArray(res.products)) {
          setFeaturedProducts(res.products);
        } else {
          setFeaturedProducts([]);
        }
        setFeaturedLoading(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  // 4. Fetch Products Catalog Function
  const fetchCatalogProducts = useCallback(
    async (targetPage = 1, append = false) => {
      if (append) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }
      setApiError(null);

      try {
        const res = await productApi.getProducts({
          page: targetPage,
          limit: 12,
          category: selectedCategory || undefined,
          search: searchTerm ? searchTerm.trim() : undefined,
          sort: selectedSort || 'featured',
          in_stock: inStockOnly || undefined,
          on_sale: onSaleOnly || undefined,
          min_price: minPrice || undefined,
          max_price: maxPrice || undefined
        });

        if (res && res.success) {
          const fetchedItems = res.products || [];
          if (append) {
            setProducts((prev) => [...prev, ...fetchedItems]);
          } else {
            setProducts(fetchedItems);
          }
          setTotalProducts(res.total || 0);
          setPage(res.page || targetPage);
          setTotalPages(res.totalPages || 1);
          setHasMore(Boolean(res.hasMore));
        } else {
          setApiError(res.message || 'Unable to retrieve catalog products.');
        }
      } catch (err) {
        setApiError('Network error connecting to products server.');
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [selectedCategory, searchTerm, selectedSort, inStockOnly, onSaleOnly, minPrice, maxPrice]
  );

  // Sync state to URL Query Params whenever filters change
  useEffect(() => {
    const params = new URLSearchParams();
    if (searchTerm) params.set('search', searchTerm);
    if (selectedCategory) params.set('category', selectedCategory);
    if (selectedSort && selectedSort !== 'featured') params.set('sort', selectedSort);
    if (inStockOnly) params.set('in_stock', 'true');
    if (onSaleOnly) params.set('on_sale', 'true');
    if (minPrice) params.set('min_price', minPrice);
    if (maxPrice) params.set('max_price', maxPrice);

    setSearchParams(params, { replace: true });
    fetchCatalogProducts(1, false);
  }, [selectedCategory, searchTerm, selectedSort, inStockOnly, onSaleOnly, minPrice, maxPrice, fetchCatalogProducts, setSearchParams]);

  // Handle Search Input Form
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchCatalogProducts(1, false);
  };

  // Handle Filter Change from Drawer
  const handleFilterDrawerChange = (field, value) => {
    if (field === 'category') setSelectedCategory(value);
    if (field === 'sort') setSelectedSort(value);
    if (field === 'in_stock') setInStockOnly(value);
    if (field === 'on_sale') setOnSaleOnly(value);
    if (field === 'min_price') setMinPrice(value);
    if (field === 'max_price') setMaxPrice(value);
  };

  // Reset All Filters
  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedCategory('');
    setSelectedSort('featured');
    setInStockOnly(false);
    setOnSaleOnly(false);
    setMinPrice('');
    setMaxPrice('');
  };

  // Load More Products
  const handleLoadMore = () => {
    if (hasMore && !loadingMore) {
      fetchCatalogProducts(page + 1, true);
    }
  };

  // Callback when a product is added to cart
  const handleCartUpdated = () => {
    if (typeof refreshUserCounts === 'function') {
      refreshUserCounts();
    }
  };

  // Callback when a product favorite is toggled
  const handleFavoriteToggled = (productId, isFav) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, isFavorited: isFav } : p))
    );
    setFeaturedProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, isFavorited: isFav } : p))
    );
    if (typeof refreshUserCounts === 'function') {
      refreshUserCounts();
    }
  };

  const hasActiveFilters = Boolean(
    selectedCategory ||
      searchTerm ||
      inStockOnly ||
      onSaleOnly ||
      minPrice ||
      maxPrice ||
      (selectedSort && selectedSort !== 'featured')
  );

  return (
    <div className="ks-page-wrapper">
      {/* Top Dynamic Offers Bar */}
      <OffersBar offers={offerBars} />

      {/* Main Luxury Navbar (PRODUCTS is active route) */}
      <Navbar
        siteSettings={siteSettings}
        categories={categories}
        counts={counts}
      />

      <main className="ks-products-page-container">
        {/* SHOP HEADER & CONTROLS */}
        <section className="ks-shop-header-section" aria-label="Shop Header">
          <div className="ks-shop-header-top">
            <div className="ks-shop-header-titles">
              <span className="ks-shop-eyebrow">EQUIPMENT &amp; APPAREL</span>
              <h1 className="ks-shop-heading">PRODUCTS</h1>
            </div>

            <div className="ks-shop-header-stats">
              <span className="ks-shop-count-badge">
                {totalProducts} {totalProducts === 1 ? 'PRODUCT' : 'PRODUCTS'}
              </span>
            </div>
          </div>

          {/* Shop Search, Filters, and Sort Toolbar */}
          <div className="ks-shop-toolbar">
            {/* Search Input Form */}
            <form onSubmit={handleSearchSubmit} className="ks-shop-search-form" role="search">
              <Search size={16} className="ks-search-icon" aria-hidden="true" />
              <input
                type="search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search products, brands, or styles..."
                className="ks-shop-search-input"
                aria-label="Search catalog products"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="ks-search-clear-btn"
                  aria-label="Clear search text"
                >
                  <X size={15} />
                </button>
              )}
            </form>

            <div className="ks-shop-toolbar-actions">
              {/* Filter Button (Opens Filter Drawer) */}
              <button
                type="button"
                onClick={() => setFilterDrawerOpen(true)}
                className={`ks-toolbar-filter-btn ${hasActiveFilters ? 'is-filtered' : ''}`}
                aria-label="Open product filters"
              >
                <SlidersHorizontal size={15} />
                <span>FILTERS</span>
                {hasActiveFilters && <span className="ks-filter-active-dot" />}
              </button>

              {/* Desktop Quick Sort Dropdown */}
              <div className="ks-toolbar-sort-wrap">
                <select
                  value={selectedSort}
                  onChange={(e) => setSelectedSort(e.target.value)}
                  className="ks-toolbar-sort-select"
                  aria-label="Sort products"
                >
                  <option value="featured">Sort: Featured</option>
                  <option value="newest">Sort: Newest</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                </select>
                <ChevronDown size={14} className="ks-sort-arrow" aria-hidden="true" />
              </div>
            </div>
          </div>

          {/* Active Filter Chips / Badges */}
          {hasActiveFilters && (
            <div className="ks-active-filters-bar" aria-label="Active filters">
              <span className="ks-active-filters-label">Active:</span>

              {searchTerm && (
                <span className="ks-filter-chip">
                  Search: "{searchTerm}"
                  <button type="button" onClick={() => setSearchTerm('')} aria-label="Remove search filter">
                    <X size={12} />
                  </button>
                </span>
              )}

              {selectedCategory && (
                <span className="ks-filter-chip">
                  Category:{' '}
                  {categories.find((c) => (c.slug || c.id) === selectedCategory)?.name || selectedCategory}
                  <button type="button" onClick={() => setSelectedCategory('')} aria-label="Remove category filter">
                    <X size={12} />
                  </button>
                </span>
              )}

              {inStockOnly && (
                <span className="ks-filter-chip">
                  In Stock Only
                  <button type="button" onClick={() => setInStockOnly(false)} aria-label="Remove in stock filter">
                    <X size={12} />
                  </button>
                </span>
              )}

              {onSaleOnly && (
                <span className="ks-filter-chip">
                  On Sale
                  <button type="button" onClick={() => setOnSaleOnly(false)} aria-label="Remove on sale filter">
                    <X size={12} />
                  </button>
                </span>
              )}

              {(minPrice || maxPrice) && (
                <span className="ks-filter-chip">
                  Price: ${minPrice || '0'} - ${maxPrice || '∞'}
                  <button
                    type="button"
                    onClick={() => {
                      setMinPrice('');
                      setMaxPrice('');
                    }}
                    aria-label="Remove price range filter"
                  >
                    <X size={12} />
                  </button>
                </span>
              )}

              <button
                type="button"
                onClick={handleResetFilters}
                className="ks-filter-clear-all-btn"
              >
                <RotateCcw size={12} />
                <span>Clear All</span>
              </button>
            </div>
          )}
        </section>

        {/* SECTION A: FEATURED / SELECTED PRODUCT RAIL */}
        {/* On mobile: 1 horizontal row with swipe. On desktop: multi-card row */}
        <FeaturedRail
          products={featuredProducts}
          loading={featuredLoading}
          onCartUpdated={handleCartUpdated}
          onFavoriteToggled={handleFavoriteToggled}
        />

        {/* TRANSITION: VIEW ALL PRODUCTS DIVIDER */}
        <section className="ks-catalog-transition-section" aria-label="Catalog Transition">
          <div className="ks-catalog-divider-line" />
          <div className="ks-catalog-divider-badge">
            <h2 className="ks-catalog-divider-title">ALL PRODUCTS</h2>
          </div>
          <div className="ks-catalog-divider-line" />
        </section>

        {/* SECTION B: ALL PRODUCTS CATALOG */}
        {/* Mobile: EXACTLY 2 COLUMNS vertically continuing. Tablet/Desktop: 2-5 columns */}
        <section className="ks-catalog-grid-section" aria-label="All Products Catalog">
          {/* Loading State Skeleton */}
          {loading ? (
            <div className="ks-catalog-grid">
              {Array.from({ length: 8 }).map((_, idx) => (
                <div key={idx} className="ks-product-card-skeleton" aria-hidden="true">
                  <div className="ks-skeleton-img" />
                  <div className="ks-skeleton-line short" />
                  <div className="ks-skeleton-line title" />
                  <div className="ks-skeleton-line price" />
                  <div className="ks-skeleton-actions" />
                </div>
              ))}
            </div>
          ) : apiError ? (
            /* Error State with Retry */
            <div className="ks-catalog-error-state" role="alert">
              <AlertTriangle size={36} className="ks-state-icon-error" />
              <h3 className="ks-state-title">Unable to Load Products</h3>
              <p className="ks-state-text">{apiError}</p>
              <button
                type="button"
                onClick={() => fetchCatalogProducts(1, false)}
                className="ks-btn-state-action"
              >
                TRY AGAIN
              </button>
            </div>
          ) : products.length === 0 ? (
            /* Empty State */
            <div className="ks-catalog-empty-state">
              <PackageX size={44} className="ks-state-icon-empty" />
              <h3 className="ks-state-title">
                {hasActiveFilters ? 'No Products Found' : 'Catalog Coming Soon'}
              </h3>
              <p className="ks-state-text">
                {hasActiveFilters
                  ? 'No products match your current search and filter criteria.'
                  : 'Products are currently being loaded into the catalog. Check back shortly.'}
              </p>
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="ks-btn-state-action"
                >
                  CLEAR ALL FILTERS
                </button>
              )}
            </div>
          ) : (
            /* Real Products Catalog Grid */
            <>
              <div className="ks-catalog-grid">
                {products.map((prod) => (
                  <ProductCard
                    key={prod.id}
                    product={prod}
                    onCartUpdated={handleCartUpdated}
                    onFavoriteToggled={handleFavoriteToggled}
                  />
                ))}
              </div>

              {/* Pagination / Load More Footer */}
              <div className="ks-catalog-pagination-wrap">
                <div className="ks-catalog-counts-info">
                  Showing {products.length} of {totalProducts} products
                </div>

                {hasMore && (
                  <button
                    type="button"
                    onClick={handleLoadMore}
                    disabled={loadingMore}
                    className="ks-btn-load-more"
                  >
                    {loadingMore ? (
                      <>
                        <Loader2 size={16} className="ks-spin-icon" />
                        <span>LOADING PRODUCTS...</span>
                      </>
                    ) : (
                      <span>LOAD MORE PRODUCTS</span>
                    )}
                  </button>
                )}
              </div>
            </>
          )}
        </section>
      </main>

      {/* Accessible Filter & Sort Drawer for Mobile & Desktop */}
      <ProductFilterDrawer
        isOpen={filterDrawerOpen}
        onClose={() => setFilterDrawerOpen(false)}
        categories={categories}
        filters={{
          category: selectedCategory,
          sort: selectedSort,
          in_stock: inStockOnly,
          on_sale: onSaleOnly,
          min_price: minPrice,
          max_price: maxPrice
        }}
        onFilterChange={handleFilterDrawerChange}
        onResetFilters={handleResetFilters}
        onApply={() => fetchCatalogProducts(1, false)}
      />

      {/* Comprehensive Store Footer */}
      <Footer siteSettings={siteSettings} categories={categories} />
    </div>
  );
}

