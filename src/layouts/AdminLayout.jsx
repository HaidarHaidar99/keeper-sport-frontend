import React from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Package, 
  Layers, 
  Store, 
  MessageSquare, 
  RefreshCw, 
  Sliders, 
  Settings, 
  Users, 
  LogOut,
  ExternalLink,
  ShieldAlert
} from 'lucide-react';
import { useAdminAuth } from '../context/AdminAuthContext';
import { useLanguage } from '../context/LanguageContext';

const AdminLayout = () => {
  const { admin, isAdmin, isSuperAdmin, logout, loading } = useAdminAuth();
  const { isRtl } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();

  if (loading) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--bg-primary)' }}>
        <div className="badge badge-cyan" style={{ padding: '12px 24px', fontSize: '15px' }}>
          Verifying Admin Session...
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div style={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '16px',
        backgroundColor: 'var(--bg-primary)'
      }}>
        <ShieldAlert size={48} color="var(--accent-red)" />
        <h2 style={{ fontSize: '22px', fontWeight: 900 }}>Admin Access Required</h2>
        <p style={{ color: 'var(--text-secondary)' }}>You must be logged in as an administrator to view this area.</p>
        <button onClick={() => navigate('/admin/login')} className="btn btn-primary">
          Go to Admin Login
        </button>
      </div>
    );
  }

  const navItems = [
    { label: "Dashboard", path: "/admin", icon: LayoutDashboard },
    { label: "Orders", path: "/admin/orders", icon: ShoppingBag },
    { label: "Products", path: "/admin/products", icon: Package },
    { label: "Categories", path: "/admin/categories", icon: Layers },
    { label: "Inventory & POS", path: "/admin/inventory", icon: Store },
    { label: "Reviews", path: "/admin/reviews", icon: MessageSquare },
    { label: "Exchanges", path: "/admin/exchanges", icon: RefreshCw },
    { label: "Offers & Slides", path: "/admin/content", icon: Sliders },
    { label: "Settings", path: "/admin/settings", icon: Settings },
    ...(isSuperAdmin ? [{ label: "Team / Admins", path: "/admin/team", icon: Users }] : [])
  ];

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--bg-primary)' }}>
      {/* ── Admin Sidebar ── */}
      <aside style={{
        width: '260px',
        backgroundColor: 'var(--bg-surface)',
        borderRight: isRtl ? 'none' : '1px solid var(--border-subtle)',
        borderLeft: isRtl ? '1px solid var(--border-subtle)' : 'none',
        display: 'flex',
        flexDirection: 'column',
        position: 'sticky',
        top: 0,
        height: '100vh'
      }}>
        {/* Sidebar Header */}
        <div style={{
          padding: '24px 20px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '8px',
            background: 'linear-gradient(135deg, var(--accent-cyan) 0%, #0077B6 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <span style={{ fontWeight: 900, color: '#040914' }}>K</span>
          </div>
          <div>
            <div style={{ fontSize: '15px', fontWeight: 900, color: '#fff' }}>KEEPER ADMIN</div>
            <div style={{ fontSize: '11px', color: 'var(--accent-gold)', fontWeight: 700 }}>
              {admin?.role === 'super_admin' ? 'Super Administrator' : 'Staff Admin'}
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav style={{ flex: 1, padding: '16px 12px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: isActive ? 'var(--accent-cyan)' : 'var(--text-secondary)',
                  backgroundColor: isActive ? 'rgba(0, 240, 255, 0.08)' : 'transparent',
                  border: isActive ? '1px solid rgba(0, 240, 255, 0.25)' : '1px solid transparent',
                  transition: 'all var(--transition-fast)'
                }}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div style={{ padding: '16px', borderTop: '1px solid var(--border-subtle)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <Link
            to="/"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '8px 12px',
              fontSize: '12px',
              color: 'var(--text-secondary)',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-subtle)'
            }}
          >
            <span>Visit Live Store</span>
            <ExternalLink size={13} />
          </Link>

          <button
            onClick={handleLogout}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 12px',
              fontSize: '12px',
              color: 'var(--accent-red)',
              fontWeight: 700
            }}
          >
            <LogOut size={15} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* ── Admin Main Content ── */}
      <main style={{ flex: 1, padding: '32px', overflowY: 'auto' }}>
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
