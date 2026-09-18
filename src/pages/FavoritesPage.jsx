import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag } from 'lucide-react';
import ProductCard from '../components/common/ProductCard';
import { useFavorites } from '../context/FavoritesContext';
import { useLanguage } from '../context/LanguageContext';

const FavoritesPage = () => {
  const { favorites } = useFavorites();
  const { t, isRtl } = useLanguage();

  return (
    <div style={{ padding: '50px 0 80px' }}>
      <div className="container">
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontSize: '32px', fontWeight: 900 }}>{t('favorites')}</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '4px' }}>
            {favorites.length} {isRtl ? "منتجات محفوظة في قائمتك المفضلة" : "items saved in your wishlist"}
          </p>
        </div>

        {favorites.length === 0 ? (
          <div className="glass-card" style={{ padding: '60px 20px', textAlign: 'center', maxWidth: '500px', margin: '0 auto' }}>
            <Heart size={48} color="var(--border-medium)" style={{ margin: '0 auto 16px' }} />
            <h3 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '8px' }}>
              {isRtl ? "قائمة أمنياتك فارغة" : "Your Wishlist is Empty"}
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '20px' }}>
              {isRtl ? "استكشف أحدث قمصان وأحذية الموسم وأضفها للمفضلة." : "Browse our official kits and tap the heart icon to save your favorites."}
            </p>
            <Link to="/products" className="btn btn-primary">
              {t('allProducts')}
            </Link>
          </div>
        ) : (
          <div className="grid-products">
            {favorites.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FavoritesPage;
