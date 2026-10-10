import React, { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { AdminAuthProvider } from './context/AdminAuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { SiteProvider } from './context/SiteContext';
import ErrorBoundary from './components/ErrorBoundary';

if (typeof window !== 'undefined' && 'scrollRestoration' in window.history) {
  window.history.scrollRestoration = 'manual';
}

function ScrollToTop() {
  const { pathname, search } = useLocation();

  useEffect(() => {
    const resetScroll = () => {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
      const containers = document.querySelectorAll('.ks-page-canvas, .ks-catalog-page-container, #root, main, body');
      containers.forEach((el) => {
        if (el && el.scrollTop) el.scrollTop = 0;
      });
    };

    // Immediate instant reset
    resetScroll();

    // Enforce after paint
    const rafId = requestAnimationFrame(() => {
      resetScroll();
    });

    const timer = setTimeout(resetScroll, 60);

    return () => {
      cancelAnimationFrame(rafId);
      clearTimeout(timer);
    };
  }, [pathname, search]);

  return null;
}

// Core Public Storefront Pages (Bundled with entry for fast initial navigation)
import HomePage from './pages/HomePage';
import ProductsPage from './pages/ProductsPage';
import ProductDetailsPage from './pages/ProductDetailsPage';
import CategoriesPage from './pages/CategoriesPage';
import CartPage from './pages/CartPage';
import FavoritesPage from './pages/FavoritesPage';

// Secondary Public Storefront Pages (Code-split)
const OffersPage = lazy(() => import('./pages/OffersPage'));
const ReviewsPage = lazy(() => import('./pages/ReviewsPage'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
const ContactPage = lazy(() => import('./pages/ContactPage'));
const OrdersPage = lazy(() => import('./pages/OrdersPage'));
const NotificationsPage = lazy(() => import('./pages/NotificationsPage'));
const CheckoutPage = lazy(() => import('./pages/CheckoutPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));

// Customer Authentication Pages (Code-split)
const LoginPage = lazy(() => import('./pages/LoginPage'));
const SignUpPage = lazy(() => import('./pages/SignUpPage'));
const ForgotPasswordPage = lazy(() => import('./pages/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('./pages/ResetPasswordPage'));
const VerifyEmailPage = lazy(() => import('./pages/VerifyEmailPage'));

// Admin Components & Pages (Code-split into isolated chunks)
const AdminGuard = lazy(() => import('./components/admin/AdminGuard'));
const AdminLayout = lazy(() => import('./components/admin/AdminLayout'));
const AdminLoginPage = lazy(() => import('./pages/admin/AdminLoginPage'));
const AdminDashboardPage = lazy(() => import('./pages/admin/AdminDashboardPage'));
const AdminHomePage = lazy(() => import('./pages/admin/AdminHomePage'));
const AdminProductsPage = lazy(() => import('./pages/admin/AdminProductsPage'));
const AdminCategoriesPage = lazy(() => import('./pages/admin/AdminCategoriesPage'));
const AdminOrdersPage = lazy(() => import('./pages/admin/AdminOrdersPage'));
const AdminUsersPage = lazy(() => import('./pages/admin/AdminUsersPage'));
const AdminReviewsPage = lazy(() => import('./pages/admin/AdminReviewsPage'));
const AdminNotificationsPage = lazy(() => import('./pages/admin/AdminNotificationsPage'));
const AdminFormsPage = lazy(() => import('./pages/admin/AdminFormsPage'));
const AdminSettingsPage = lazy(() => import('./pages/admin/AdminSettingsPage'));

const PageFallback = () => (
  <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    <div style={{ width: 32, height: 32, border: '3px solid rgba(225,6,0,0.2)', borderTopColor: 'var(--ks-accent-red, #e10600)', borderRadius: '50%', animation: 'ksSpinAnim 0.75s linear infinite' }} />
  </div>
);

export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <AdminAuthProvider>
            <SiteProvider>
              <BrowserRouter>
                <ScrollToTop />
                <Suspense fallback={<PageFallback />}>
                  <Routes>
                    {/* Dedicated Public Storefront Routes */}
                    <Route path="/" element={<HomePage />} />
                    <Route path="/products" element={<ProductsPage />} />
                    <Route path="/products/:slugOrId" element={<ProductDetailsPage />} />
                    <Route path="/shop" element={<ProductsPage />} />
                    <Route path="/categories" element={<CategoriesPage />} />
                    <Route path="/offers" element={<OffersPage />} />
                    <Route path="/reviews" element={<ReviewsPage />} />
                    <Route path="/about" element={<AboutPage />} />
                    <Route path="/contact" element={<ContactPage />} />
                    <Route path="/cart" element={<CartPage />} />
                    <Route path="/favorites" element={<FavoritesPage />} />
                    <Route path="/orders" element={<OrdersPage />} />
                    <Route path="/notifications" element={<NotificationsPage />} />
                    <Route path="/checkout" element={<CheckoutPage />} />
                    
                    {/* Dedicated Admin Login */}
                    <Route path="/admin/login" element={<AdminLoginPage />} />
                    
                    {/* Protected Admin Panel Routes */}
                    <Route
                      path="/admin"
                      element={
                        <AdminGuard>
                          <AdminLayout />
                        </AdminGuard>
                      }
                    >
                      <Route index element={<AdminDashboardPage />} />
                      <Route path="home" element={<AdminHomePage />} />
                      <Route path="hero" element={<AdminHomePage />} />
                      <Route path="products" element={<AdminProductsPage />} />
                      <Route path="categories" element={<AdminCategoriesPage />} />
                      <Route path="orders" element={<AdminOrdersPage />} />
                      <Route path="users" element={<AdminUsersPage />} />
                      <Route path="reviews" element={<AdminReviewsPage />} />
                      <Route path="forms" element={<AdminFormsPage />} />
                      <Route path="notifications" element={<AdminNotificationsPage />} />
                      <Route path="settings" element={<AdminSettingsPage />} />
                    </Route>
                    
                    {/* Customer Authentication Routes */}
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/signup" element={<SignUpPage />} />
                    <Route path="/register" element={<SignUpPage />} />
                    <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                    <Route path="/reset-password" element={<ResetPasswordPage />} />
                    <Route path="/verify-email" element={<VerifyEmailPage />} />
                    
                    {/* 404 Not Found Page */}
                    <Route path="*" element={<NotFoundPage />} />
                  </Routes>
                </Suspense>
              </BrowserRouter>
            </SiteProvider>
          </AdminAuthProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
