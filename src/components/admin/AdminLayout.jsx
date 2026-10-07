import React, { useState, useEffect, useRef } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Home,
  Sparkles,
  Package,
  Tags,
  ShoppingBag,
  Users,
  Star,
  Bell,
  MessageSquare,
  Settings,
  Sun,
  Moon,
  LogOut,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  User as UserIcon
} from 'lucide-react';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useSite } from '../../context/SiteContext';
import { adminApi } from '../../api/adminApi';

export default function AdminLayout() {
  const { adminUser: user, adminLogout } = useAdminAuth();
  const { theme, toggleTheme } = useTheme();
  const { siteSettings } = useSite();
  const location = useLocation();
  const navigate = useNavigate();

  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [unreadForms, setUnreadForms] = useState(0);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [accountDropdownOpen, setAccountDropdownOpen] = useState(false);

  const accountDropdownRef = useRef(null);

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setAccountDropdownOpen(false);
  }, [location.pathname]);

  // Fetch Unread Notifications and Forms on Mount
  useEffect(() => {
    let isMounted = true;

    adminApi.getNotifications().then((res) => {
      if (isMounted && res.success && res.stats) {
        setUnreadNotifications(res.stats.unread || 0);
      }
    });

    adminApi.getForms({ limit: 1 }).then((res) => {
      if (isMounted && res.success && res.stats) {
        setUnreadForms(res.stats.unread || 0);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [location.pathname]);

  // Close account dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (accountDropdownRef.current && !accountDropdownRef.current.contains(e.target)) {
        setAccountDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await adminLogout();
    navigate('/admin/login', { replace: true });
  };

  // Compute user avatar initial
  const getUserInitial = () => {
    if (!user) return 'A';
    if (user.full_name && user.full_name.trim()) {
      return user.full_name.trim().charAt(0).toUpperCase();
    }
    if (user.email) {
      return user.email.charAt(0).toUpperCase();
    }
    return 'A';
  };

  const navItems = [
    { label: 'Dashboard', path: '/admin', icon: LayoutDashboard, exact: true },
    { label: 'Hero', path: '/admin/home', icon: Sparkles },
    { label: 'Products', path: '/admin/products', icon: Package },
    { label: 'Categories', path: '/admin/categories', icon: Tags },
    { label: 'Orders', path: '/admin/orders', icon: ShoppingBag },
    { label: 'Users', path: '/admin/users', icon: Users },
    { label: 'Reviews', path: '/admin/reviews', icon: Star },
    {
      label: 'Forms',
      path: '/admin/forms',
      icon: MessageSquare,
      badge: unreadForms > 0 ? unreadForms : null
    },
    {
      label: 'Notifications',
      path: '/admin/notifications',
      icon: Bell,
      badge: unreadNotifications > 0 ? unreadNotifications : null
    },
    { label: 'Settings', path: '/admin/settings', icon: Settings }
  ];

  return (
    <div className={`ks-admin-root ${sidebarCollapsed ? 'is-sidebar-collapsed' : ''}`}>
      {/* Mobile Drawer Backdrop */}
      {mobileMenuOpen && (
        <div
          className="ks-admin-mobile-backdrop"
          onClick={() => setMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* LEFT SIDEBAR */}
      <aside className={`ks-admin-sidebar ${mobileMenuOpen ? 'is-mobile-open' : ''}`}>
        {/* Top Branding Section */}
        <div className="ks-admin-sidebar-header">
          <Link to="/admin" className="ks-admin-brand-link" aria-label="Keeper Sports Admin">
            {siteSettings?.logo_path ? (
              <img
                src={siteSettings.logo_path}
                alt={siteSettings?.site_name || 'Keeper Sports'}
                className="ks-admin-logo-img"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  const fallback = e.currentTarget.parentElement?.querySelector('.ks-admin-logo-fallback');
                  if (fallback) fallback.style.display = 'flex';
                }}
              />
            ) : null}

            {/* Neutral fallback logo */}
            <div
              className="ks-admin-logo-fallback"
              style={{ display: siteSettings?.logo_path ? 'none' : 'flex' }}
            >
              <svg className="ks-admin-logo-mark" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <path d="M20 4L34 11V21C34 29.5 28 35.5 20 38C12 35.5 6 29.5 6 21V11L20 4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M20 13V27M13 20H27" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" opacity="0.6" />
              </svg>
            </div>

            {!sidebarCollapsed && (
              <div className="ks-admin-brand-texts">
                <span className="ks-admin-brand-title">{siteSettings?.site_name || 'KEEPER SPORTS'}</span>
                <span className="ks-admin-brand-badge">ADMIN PANEL</span>
              </div>
            )}
          </Link>

          {/* Close button for mobile */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(false)}
            className="ks-admin-mobile-close-btn"
            aria-label="Close sidebar"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="ks-admin-sidebar-nav" aria-label="Admin Navigation">
          <ul className="ks-admin-nav-list">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = item.exact
                ? location.pathname === item.path
                : location.pathname.startsWith(item.path);

              return (
                <li key={item.path} className="ks-admin-nav-li">
                  <NavLink
                    to={item.path}
                    className={`ks-admin-nav-link ${isActive ? 'is-active' : ''}`}
                    title={sidebarCollapsed ? item.label : undefined}
                  >
                    <Icon size={18} className="ks-admin-nav-icon" />
                    {!sidebarCollapsed && (
                      <span className="ks-admin-nav-label">{item.label}</span>
                    )}
                    {item.badge && (
                      <span className="ks-admin-nav-badge">{item.badge}</span>
                    )}
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Sidebar Collapse/Expand Toggle on Desktop */}
        <div className="ks-admin-sidebar-footer">
          <button
            type="button"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="ks-admin-collapse-btn"
            aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {sidebarCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
            {!sidebarCollapsed && <span>Collapse Sidebar</span>}
          </button>
        </div>
      </aside>

      {/* RIGHT MAIN CONTENT AREA */}
      <div className="ks-admin-main-wrap">
        {/* TOP BAR */}
        <header className="ks-admin-topbar">
          <div className="ks-admin-topbar-left">
            {/* Mobile Hamburger Trigger */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="ks-admin-mobile-hamburger"
              aria-label="Open navigation menu"
            >
              <Menu size={20} />
            </button>

            {/* Quick Link to Public Storefront */}
            <Link to="/" className="ks-admin-topbar-store-link" title="Open Public Storefront">
              <ExternalLink size={15} />
              <span>View Store</span>
            </Link>
          </div>

          <div className="ks-admin-topbar-right">
            {/* Notifications Button */}
            <Link
              to="/admin/notifications"
              className="ks-admin-topbar-action-btn"
              aria-label="Admin Notifications"
              title="Admin Notifications"
            >
              <Bell size={18} />
              {unreadNotifications > 0 && (
                <span className="ks-admin-topbar-badge">{unreadNotifications}</span>
              )}
            </Link>

            {/* Light / Dark Mode Toggle */}
            <button
              type="button"
              onClick={toggleTheme}
              className="ks-admin-topbar-action-btn"
              aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {/* Current Admin Account Display & Dropdown */}
            <div className="ks-admin-account-wrap" ref={accountDropdownRef}>
              <button
                type="button"
                onClick={() => setAccountDropdownOpen(!accountDropdownOpen)}
                className="ks-admin-account-btn"
                aria-expanded={accountDropdownOpen}
                aria-haspopup="true"
              >
                <div className="ks-admin-avatar-circle" aria-hidden="true">
                  {getUserInitial()}
                </div>
                <div className="ks-admin-account-meta">
                  <span className="ks-admin-account-name">
                    {user?.full_name || 'Administrator'}
                  </span>
                  <span className="ks-admin-role-badge">
                    {user?.role === 'super_admin' ? 'SUPER ADMIN' : 'ADMIN'}
                  </span>
                </div>
              </button>

              {/* Compact Account Dropdown */}
              {accountDropdownOpen && (
                <div className="ks-admin-account-dropdown" role="menu">
                  <div className="ks-dropdown-header">
                    <div className="ks-dropdown-name">{user?.full_name || 'Admin'}</div>
                    <div className="ks-dropdown-email">{user?.email}</div>
                  </div>

                  <div className="ks-dropdown-divider" />

                  <Link
                    to="/"
                    className="ks-dropdown-item"
                    role="menuitem"
                    onClick={() => setAccountDropdownOpen(false)}
                  >
                    <ExternalLink size={15} />
                    <span>View Public Store</span>
                  </Link>

                  <div className="ks-dropdown-divider" />

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="ks-dropdown-item is-logout"
                    role="menuitem"
                  >
                    <LogOut size={15} />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content Outlet */}
        <main className="ks-admin-page-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
