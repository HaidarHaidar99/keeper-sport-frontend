import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  User,
  Mail,
  ShieldCheck,
  Calendar,
  Lock,
  LogOut,
  Package,
  Heart,
  ShoppingBag,
  Bell,
  CheckCircle2,
  AlertCircle,
  Save,
  KeyRound,
  Store,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSite } from '../context/SiteContext';
import { useToast } from '../context/ToastContext';
import { authApi } from '../api/authApi';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function ProfilePage() {
  const { user, loading: authLoading, logout, updateUser } = useAuth();
  const { siteSettings, categories, counts } = useSite();
  const { showToast } = useToast();
  const navigate = useNavigate();

  // Tab State
  const [activeTab, setActiveTab] = useState('details'); // 'details' | 'security' | 'quicklinks'

  // Name form state
  const [fullName, setFullName] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);

  // Password form state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);

  useEffect(() => {
    if (user?.full_name) {
      setFullName(user.full_name);
    }
  }, [user?.full_name]);

  // Handle Profile Update
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (user?.auth_provider === 'google') {
      showToast('Name cannot be modified for Google authentication accounts.');
      return;
    }
    const cleanName = fullName.trim();
    if (!cleanName || cleanName.length < 2) {
      showToast('Full name must be at least 2 characters.');
      return;
    }

    setSavingProfile(true);
    try {
      const res = await authApi.updateProfile({ full_name: cleanName });
      if (res?.success) {
        showToast(res.message || 'Profile updated successfully!');
        if (res.user) {
          updateUser(res.user);
        } else {
          updateUser({ full_name: cleanName });
        }
      } else {
        showToast(res?.message || 'Failed to update profile.');
      }
    } catch (err) {
      showToast(err.message || 'Error updating profile.');
    } finally {
      setSavingProfile(false);
    }
  };

  // Handle Password Change
  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) {
      showToast('Please fill in both current and new passwords.');
      return;
    }
    if (newPassword.length < 8) {
      showToast('New password must be at least 8 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast('New passwords do not match.');
      return;
    }

    setSavingPassword(true);
    try {
      const res = await authApi.changePassword({
        current_password: currentPassword,
        new_password: newPassword,
        confirm_password: confirmPassword
      });
      if (res?.success) {
        showToast(res.message || 'Password changed successfully!');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        showToast(res?.message || 'Failed to change password.');
      }
    } catch (err) {
      showToast(err.message || 'Error changing password.');
    } finally {
      setSavingPassword(false);
    }
  };

  // Handle Logout
  const handleLogout = async () => {
    try {
      await logout();
      showToast('You have been signed out successfully.');
      navigate('/');
    } catch {
      showToast('Signed out.');
      navigate('/');
    }
  };

  // Initials generator
  const getInitials = (name) => {
    if (!name) return 'KS';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  // Format member date
  const memberSince = user?.created_at
    ? new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : 'Recently';

  if (authLoading) {
    return (
      <div className="ks-page-canvas">
        <Navbar siteSettings={siteSettings} categories={categories} />
        <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ width: 36, height: 36, border: '3px solid rgba(225,6,0,0.2)', borderTopColor: 'var(--ks-accent-red, #e10600)', borderRadius: '50%', animation: 'ksSpinAnim 0.75s linear infinite' }} />
        </div>
        <Footer siteSettings={siteSettings} categories={categories} />
      </div>
    );
  }

  // Guest view - not logged in
  if (!user) {
    return (
      <div className="ks-page-canvas">
        <Navbar siteSettings={siteSettings} categories={categories} />
        <main className="ks-catalog-page-container">
          <div
            style={{
              maxWidth: '520px',
              margin: '60px auto',
              textAlign: 'center',
              backgroundColor: 'var(--ks-bg-card, #121212)',
              border: '1px solid var(--ks-border-card, #262626)',
              borderRadius: '24px',
              padding: '48px 32px',
              boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
            }}
          >
            <div
              style={{
                width: 68,
                height: 68,
                borderRadius: '50%',
                backgroundColor: 'rgba(225, 6, 0, 0.12)',
                color: '#E10600',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px'
              }}
            >
              <User size={34} />
            </div>
            <h1 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.8rem', fontWeight: 900, margin: '0 0 10px', color: 'var(--ks-text-title, #fff)' }}>
              Sign In to Your Account
            </h1>
            <p style={{ color: 'var(--ks-text-secondary, #999)', fontSize: '0.95rem', lineHeight: '1.6', marginBottom: '28px' }}>
              Access your saved favorites, track active orders, receive notifications, and manage your customer profile.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <Link to="/login" className="ks-btn-primary" style={{ width: '100%', boxSizing: 'border-box' }}>
                <span>SIGN IN</span>
              </Link>
              <Link
                to="/signup"
                style={{
                  padding: '12px',
                  borderRadius: '12px',
                  border: '1px solid var(--ks-border-card, #333)',
                  backgroundColor: 'transparent',
                  color: 'inherit',
                  textDecoration: 'none',
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  display: 'block'
                }}
              >
                Create New Account
              </Link>
            </div>
          </div>
        </main>
        <Footer siteSettings={siteSettings} categories={categories} />
      </div>
    );
  }

  return (
    <div className="ks-page-canvas">
      <Navbar siteSettings={siteSettings} categories={categories} />

      <main className="ks-catalog-page-container" style={{ maxWidth: '1180px', margin: '0 auto', padding: '20px 20px 80px' }}>
        {/* TOP PROFILE HERO CARD */}
        <div
          style={{
            backgroundColor: 'var(--ks-bg-card, #111111)',
            border: '1px solid var(--ks-border-card, #242424)',
            borderRadius: '24px',
            padding: '36px 32px',
            marginBottom: '32px',
            boxShadow: '0 10px 40px rgba(0,0,0,0.2)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '24px' }}>
            {/* Left: Avatar + Details */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '24px', flexWrap: 'wrap' }}>
              <div
                style={{
                  width: '84px',
                  height: '84px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(225, 6, 0, 0.15)',
                  border: '3px solid #E10600',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '2rem',
                  fontWeight: 900,
                  fontFamily: 'Outfit, sans-serif',
                  boxShadow: '0 0 24px rgba(225, 6, 0, 0.3)'
                }}
              >
                {getInitials(user.full_name)}
              </div>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '6px' }}>
                  <h1 style={{ fontFamily: 'Outfit, sans-serif', fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: 900, margin: 0, color: 'var(--ks-text-title, #fff)' }}>
                    {user.full_name || 'Valued Athlete'}
                  </h1>
                  {user.is_verified ? (
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        padding: '3px 10px',
                        borderRadius: '12px',
                        backgroundColor: 'rgba(22, 163, 74, 0.15)',
                        color: '#22c55e',
                        fontSize: '0.75rem',
                        fontWeight: 800,
                        border: '1px solid rgba(22, 163, 74, 0.3)'
                      }}
                    >
                      <ShieldCheck size={13} />
                      Verified
                    </span>
                  ) : (
                    <span
                      style={{
                        padding: '3px 10px',
                        borderRadius: '12px',
                        backgroundColor: 'rgba(234, 179, 8, 0.15)',
                        color: '#eab308',
                        fontSize: '0.75rem',
                        fontWeight: 800
                      }}
                    >
                      Unverified
                    </span>
                  )}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '18px', flexWrap: 'wrap', color: 'var(--ks-text-secondary, #888)', fontSize: '0.9rem' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                    <Mail size={15} />
                    {user.email}
                  </span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                    <Calendar size={15} />
                    Member since {memberSince}
                  </span>
                </div>
              </div>
            </div>

            {/* Right: Quick Sign Out Button */}
            <button
              type="button"
              onClick={handleLogout}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 22px',
                borderRadius: '12px',
                backgroundColor: 'rgba(225, 6, 0, 0.08)',
                border: '1px solid rgba(225, 6, 0, 0.3)',
                color: '#E10600',
                fontSize: '0.9rem',
                fontWeight: 800,
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              <LogOut size={16} />
              <span>SIGN OUT</span>
            </button>
          </div>
        </div>

        {/* 4 FAST COMMERCE HUBS (Orders, Favorites, Cart, Notifications) */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '16px',
            marginBottom: '36px'
          }}
        >
          <Link
            to="/orders"
            style={{
              textDecoration: 'none',
              padding: '24px 20px',
              backgroundColor: 'var(--ks-bg-card, #111)',
              border: '1px solid var(--ks-border-card, #242424)',
              borderRadius: '18px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              color: 'inherit',
              transition: 'transform 0.15s ease, border-color 0.15s ease'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{ width: 44, height: 44, borderRadius: '12px', backgroundColor: 'rgba(225,6,0,0.1)', color: '#E10600', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Package size={22} />
              </div>
              <div>
                <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#888', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  MY ORDERS
                </div>
                <div style={{ fontSize: '1.2rem', fontWeight: 900, color: 'var(--ks-text-title, #fff)' }}>
                  {counts?.orders || 0} Orders
                </div>
              </div>
            </div>
            <ChevronRight size={18} style={{ color: '#888' }} />
          </Link>

          <Link
            to="/favorites"
            style={{
              textDecoration: 'none',
              padding: '24px 20px',
              backgroundColor: 'var(--ks-bg-card, #111)',
              border: '1px solid var(--ks-border-card, #242424)',
              borderRadius: '18px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              color: 'inherit'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{ width: 44, height: 44, borderRadius: '12px', backgroundColor: 'rgba(225,6,0,0.1)', color: '#E10600', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Heart size={22} />
              </div>
              <div>
                <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#888', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  FAVORITES
                </div>
                <div style={{ fontSize: '1.2rem', fontWeight: 900, color: 'var(--ks-text-title, #fff)' }}>
                  {counts?.favorites || 0} Items
                </div>
              </div>
            </div>
            <ChevronRight size={18} style={{ color: '#888' }} />
          </Link>

          <Link
            to="/cart"
            style={{
              textDecoration: 'none',
              padding: '24px 20px',
              backgroundColor: 'var(--ks-bg-card, #111)',
              border: '1px solid var(--ks-border-card, #242424)',
              borderRadius: '18px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              color: 'inherit'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{ width: 44, height: 44, borderRadius: '12px', backgroundColor: 'rgba(225,6,0,0.1)', color: '#E10600', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ShoppingBag size={22} />
              </div>
              <div>
                <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#888', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  SHOPPING CART
                </div>
                <div style={{ fontSize: '1.2rem', fontWeight: 900, color: 'var(--ks-text-title, #fff)' }}>
                  {counts?.cart || 0} Items
                </div>
              </div>
            </div>
            <ChevronRight size={18} style={{ color: '#888' }} />
          </Link>

          <Link
            to="/notifications"
            style={{
              textDecoration: 'none',
              padding: '24px 20px',
              backgroundColor: 'var(--ks-bg-card, #111)',
              border: '1px solid var(--ks-border-card, #242424)',
              borderRadius: '18px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              color: 'inherit'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{ width: 44, height: 44, borderRadius: '12px', backgroundColor: 'rgba(225,6,0,0.1)', color: '#E10600', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Bell size={22} />
              </div>
              <div>
                <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#888', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  NOTIFICATIONS
                </div>
                <div style={{ fontSize: '1.2rem', fontWeight: 900, color: 'var(--ks-text-title, #fff)' }}>
                  {counts?.notifications || 0} Alerts
                </div>
              </div>
            </div>
            <ChevronRight size={18} style={{ color: '#888' }} />
          </Link>
        </div>

        {/* TABS HEADER */}
        <div
          style={{
            display: 'flex',
            gap: '12px',
            borderBottom: '1px solid var(--ks-border-card, #262626)',
            marginBottom: '28px'
          }}
        >
          <button
            type="button"
            onClick={() => setActiveTab('details')}
            style={{
              padding: '12px 20px',
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              fontSize: '0.95rem',
              fontWeight: 800,
              fontFamily: 'Outfit, sans-serif',
              letterSpacing: '0.04em',
              color: activeTab === 'details' ? '#E10600' : 'var(--ks-text-secondary, #888)',
              borderBottom: activeTab === 'details' ? '3px solid #E10600' : '3px solid transparent',
              transition: 'all 0.15s ease'
            }}
          >
            PERSONAL DETAILS
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('security')}
            style={{
              padding: '12px 20px',
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              fontSize: '0.95rem',
              fontWeight: 800,
              fontFamily: 'Outfit, sans-serif',
              letterSpacing: '0.04em',
              color: activeTab === 'security' ? '#E10600' : 'var(--ks-text-secondary, #888)',
              borderBottom: activeTab === 'security' ? '3px solid #E10600' : '3px solid transparent',
              transition: 'all 0.15s ease'
            }}
          >
            SECURITY &amp; PASSWORD
          </button>
        </div>

        {/* TAB 1: PERSONAL DETAILS */}
        {activeTab === 'details' && (
          <div
            style={{
              backgroundColor: 'var(--ks-bg-card, #111)',
              border: '1px solid var(--ks-border-card, #242424)',
              borderRadius: '20px',
              padding: '32px 28px',
              maxWidth: '680px'
            }}
          >
            <h3 style={{ margin: '0 0 6px', fontSize: '1.25rem', fontWeight: 900, fontFamily: 'Outfit, sans-serif' }}>
              Edit Profile Information
            </h3>
            <p style={{ margin: '0 0 24px', fontSize: '0.88rem', color: '#888' }}>
              Update your display name across orders and reviews.
            </p>

            {user.auth_provider === 'google' ? (
              <div>
                <div
                  style={{
                    padding: '20px',
                    borderRadius: '14px',
                    backgroundColor: 'rgba(255,255,255,0.03)',
                    border: '1px solid var(--ks-border-card, #2c2c2c)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '14px',
                    marginBottom: '24px'
                  }}
                >
                  <ShieldCheck size={28} style={{ color: '#22c55e', flexShrink: 0 }} />
                  <div>
                    <div style={{ fontWeight: 800, marginBottom: '4px', color: 'var(--ks-text-title, #fff)' }}>
                      Managed via Google Authentication
                    </div>
                    <div style={{ fontSize: '0.85rem', color: '#888', lineHeight: '1.5' }}>
                      Your profile identity and name are synchronized with your Google account and cannot be modified here.
                    </div>
                  </div>
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px', color: '#888' }}>
                    FULL NAME (LOCKED)
                  </label>
                  <input
                    type="text"
                    value={user.full_name || ''}
                    disabled
                    style={{
                      width: '100%',
                      padding: '14px 16px',
                      borderRadius: '12px',
                      backgroundColor: 'rgba(255,255,255,0.02)',
                      border: '1px solid var(--ks-border-card, #242424)',
                      color: '#777',
                      fontSize: '0.95rem',
                      boxSizing: 'border-box',
                      cursor: 'not-allowed'
                    }}
                  />
                  <span style={{ display: 'block', marginTop: '6px', fontSize: '0.78rem', color: '#666' }}>
                    Name is managed and verified by your Google account.
                  </span>
                </div>

                <div style={{ marginBottom: '24px' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px', color: '#888' }}>
                    EMAIL ADDRESS (PRIMARY)
                  </label>
                  <input
                    type="email"
                    value={user.email}
                    disabled
                    style={{
                      width: '100%',
                      padding: '14px 16px',
                      borderRadius: '12px',
                      backgroundColor: 'rgba(255,255,255,0.02)',
                      border: '1px solid var(--ks-border-card, #242424)',
                      color: '#777',
                      fontSize: '0.95rem',
                      boxSizing: 'border-box',
                      cursor: 'not-allowed'
                    }}
                  />
                  <span style={{ display: 'block', marginTop: '6px', fontSize: '0.78rem', color: '#666' }}>
                    Email address is locked to your Google account.
                  </span>
                </div>
              </div>
            ) : (
              <form onSubmit={handleUpdateProfile}>
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px', color: '#888' }}>
                    FULL NAME *
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Ali Haidar"
                    required
                    style={{
                      width: '100%',
                      padding: '14px 16px',
                      borderRadius: '12px',
                      backgroundColor: 'rgba(255,255,255,0.04)',
                      border: '1px solid var(--ks-border-card, #333)',
                      color: 'inherit',
                      fontSize: '0.95rem',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                <div style={{ marginBottom: '24px' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px', color: '#888' }}>
                    EMAIL ADDRESS (PRIMARY)
                  </label>
                  <input
                    type="email"
                    value={user.email}
                    disabled
                    style={{
                      width: '100%',
                      padding: '14px 16px',
                      borderRadius: '12px',
                      backgroundColor: 'rgba(255,255,255,0.02)',
                      border: '1px solid var(--ks-border-card, #242424)',
                      color: '#777',
                      fontSize: '0.95rem',
                      boxSizing: 'border-box',
                      cursor: 'not-allowed'
                    }}
                  />
                  <span style={{ display: 'block', marginTop: '6px', fontSize: '0.78rem', color: '#666' }}>
                    Email address is locked to your account identity.
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={savingProfile}
                  className="ks-btn-primary"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '14px 28px',
                    cursor: savingProfile ? 'not-allowed' : 'pointer'
                  }}
                >
                  <Save size={16} />
                  <span>{savingProfile ? 'SAVING...' : 'SAVE CHANGES'}</span>
                </button>
              </form>
            )}
          </div>
        )}

        {/* TAB 2: SECURITY & PASSWORD */}
        {activeTab === 'security' && (
          <div
            style={{
              backgroundColor: 'var(--ks-bg-card, #111)',
              border: '1px solid var(--ks-border-card, #242424)',
              borderRadius: '20px',
              padding: '32px 28px',
              maxWidth: '680px'
            }}
          >
            <h3 style={{ margin: '0 0 6px', fontSize: '1.25rem', fontWeight: 900, fontFamily: 'Outfit, sans-serif' }}>
              Change Password
            </h3>
            <p style={{ margin: '0 0 24px', fontSize: '0.88rem', color: '#888' }}>
              Enhance account security by updating your password regularly.
            </p>

            {user.auth_provider === 'google' ? (
              <div
                style={{
                  padding: '20px',
                  borderRadius: '14px',
                  backgroundColor: 'rgba(255,255,255,0.03)',
                  border: '1px solid var(--ks-border-card, #2c2c2c)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px'
                }}
              >
                <ShieldCheck size={28} style={{ color: '#22c55e' }} />
                <div>
                  <div style={{ fontWeight: 800, marginBottom: '4px' }}>Google Authentication</div>
                  <div style={{ fontSize: '0.85rem', color: '#888' }}>
                    Your account is securely managed and signed in via Google OAuth. You do not need a separate password.
                  </div>
                </div>
              </div>
            ) : (
              <form onSubmit={handleChangePassword}>
                <div style={{ marginBottom: '18px' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px', color: '#888' }}>
                    CURRENT PASSWORD *
                  </label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter existing password"
                    required
                    style={{
                      width: '100%',
                      padding: '14px 16px',
                      borderRadius: '12px',
                      backgroundColor: 'rgba(255,255,255,0.04)',
                      border: '1px solid var(--ks-border-card, #333)',
                      color: 'inherit',
                      fontSize: '0.95rem',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                <div style={{ marginBottom: '18px' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px', color: '#888' }}>
                    NEW PASSWORD (MIN 8 CHARACTERS) *
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                    minLength={8}
                    required
                    style={{
                      width: '100%',
                      padding: '14px 16px',
                      borderRadius: '12px',
                      backgroundColor: 'rgba(255,255,255,0.04)',
                      border: '1px solid var(--ks-border-card, #333)',
                      color: 'inherit',
                      fontSize: '0.95rem',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                <div style={{ marginBottom: '24px' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px', color: '#888' }}>
                    CONFIRM NEW PASSWORD *
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter new password"
                    minLength={8}
                    required
                    style={{
                      width: '100%',
                      padding: '14px 16px',
                      borderRadius: '12px',
                      backgroundColor: 'rgba(255,255,255,0.04)',
                      border: '1px solid var(--ks-border-card, #333)',
                      color: 'inherit',
                      fontSize: '0.95rem',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                <button
                  type="submit"
                  disabled={savingPassword}
                  className="ks-btn-primary"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '14px 28px',
                    cursor: savingPassword ? 'not-allowed' : 'pointer'
                  }}
                >
                  <KeyRound size={16} />
                  <span>{savingPassword ? 'UPDATING...' : 'UPDATE PASSWORD'}</span>
                </button>
              </form>
            )}
          </div>
        )}
      </main>

      <Footer siteSettings={siteSettings} categories={categories} />
    </div>
  );
}
