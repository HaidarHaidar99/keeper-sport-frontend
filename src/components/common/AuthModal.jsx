import React, { useState } from 'react';
import { X, Lock, Mail, AlertCircle, ArrowRight, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';

const AuthModal = () => {
  const { isAuthModalOpen, closeAuthModal, authModalMode, setAuthModalMode, login, register } = useAuth();
  const { t, isRtl } = useLanguage();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSubmitting(true);

    try {
      if (authModalMode === 'login') {
        await login(email, password);
      } else {
        await register(email, password);
      }
      setEmail('');
      setPassword('');
    } catch (err) {
      setErrorMsg(err.message || "Authentication failed. Please check your credentials.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 300,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      backdropFilter: 'blur(8px)',
      WebkitBackdropFilter: 'blur(8px)',
      padding: '20px'
    }}>
      <div 
        onClick={closeAuthModal} 
        style={{ position: 'absolute', inset: 0 }} 
      />

      <div style={{
        position: 'relative',
        width: '100%',
        maxWidth: '420px',
        backgroundColor: 'var(--bg-surface)',
        border: '1px solid var(--border-medium)',
        borderRadius: 'var(--radius-xl)',
        padding: '32px',
        boxShadow: 'var(--shadow-lg)',
        zIndex: 1
      }}>
        {/* Close Button */}
        <button 
          onClick={closeAuthModal}
          style={{ position: 'absolute', top: '16px', right: isRtl ? 'auto' : '16px', left: isRtl ? '16px' : 'auto', color: 'var(--text-muted)' }}
        >
          <X size={20} />
        </button>

        {/* Tab Switcher */}
        <div style={{
          display: 'flex',
          backgroundColor: 'var(--bg-input)',
          borderRadius: 'var(--radius-md)',
          padding: '4px',
          marginBottom: '24px'
        }}>
          <button
            onClick={() => { setAuthModalMode('login'); setErrorMsg(''); }}
            style={{
              flex: 1,
              padding: '8px',
              borderRadius: 'var(--radius-sm)',
              fontWeight: 700,
              fontSize: '13px',
              backgroundColor: authModalMode === 'login' ? 'var(--bg-card)' : 'transparent',
              color: authModalMode === 'login' ? 'var(--accent-cyan)' : 'var(--text-secondary)',
              boxShadow: authModalMode === 'login' ? 'var(--shadow-sm)' : 'none',
              transition: 'all var(--transition-fast)'
            }}
          >
            {t('login')}
          </button>
          <button
            onClick={() => { setAuthModalMode('register'); setErrorMsg(''); }}
            style={{
              flex: 1,
              padding: '8px',
              borderRadius: 'var(--radius-sm)',
              fontWeight: 700,
              fontSize: '13px',
              backgroundColor: authModalMode === 'register' ? 'var(--bg-card)' : 'transparent',
              color: authModalMode === 'register' ? 'var(--accent-cyan)' : 'var(--text-secondary)',
              boxShadow: authModalMode === 'register' ? 'var(--shadow-sm)' : 'none',
              transition: 'all var(--transition-fast)'
            }}
          >
            {t('register')}
          </button>
        </div>

        <h3 style={{ fontSize: '20px', fontWeight: 900, marginBottom: '6px' }}>
          {authModalMode === 'login' ? (isRtl ? "مرحباً بك مجدداً!" : "Welcome Back!") : (isRtl ? "إنشاء حساب جديد" : "Create Customer Account")}
        </h3>
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '20px' }}>
          {isRtl 
            ? "سجل بريدك الإلكتروني لحفظ مفضلتك وتتبع مشترياتك بسهولة." 
            : "Sign in to sync your wishlist and view your order history."}
        </p>

        {/* Error Alert */}
        {errorMsg && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 14px',
            backgroundColor: 'rgba(255, 59, 48, 0.12)',
            border: '1px solid rgba(255, 59, 48, 0.3)',
            borderRadius: 'var(--radius-md)',
            color: 'var(--accent-red)',
            fontSize: '13px',
            marginBottom: '16px'
          }}>
            <AlertCircle size={16} />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">{isRtl ? "البريد الإلكتروني" : "Email Address"}</label>
            <div style={{ position: 'relative' }}>
              <input
                type="email"
                required
                className="form-input"
                style={{ paddingInlineStart: '38px' }}
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <Mail size={16} style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', insetInlineStart: '12px', color: 'var(--text-muted)' }} />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">{isRtl ? "كلمة المرور" : "Password"}</label>
            <div style={{ position: 'relative' }}>
              <input
                type="password"
                required
                className="form-input"
                style={{ paddingInlineStart: '38px' }}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <Lock size={16} style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', insetInlineStart: '12px', color: 'var(--text-muted)' }} />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="btn btn-primary btn-lg"
            style={{ width: '100%', marginTop: '10px' }}
          >
            <span>{submitting ? (isRtl ? "جاري المعالجة..." : "Processing...") : (authModalMode === 'login' ? t('login') : t('register'))}</span>
            {isRtl ? <ArrowLeft size={16} /> : <ArrowRight size={16} />}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AuthModal;
