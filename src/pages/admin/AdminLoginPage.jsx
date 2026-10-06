import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { Shield, Lock, Mail, Eye, EyeOff, AlertCircle, Loader2 } from 'lucide-react';

export default function AdminLoginPage() {
  const { adminUser, adminLogin } = useAdminAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const emailRef = useRef(null);
  const passwordRef = useRef(null);

  // If already authenticated with active admin privileges, navigate directly to dashboard
  useEffect(() => {
    if (adminUser && (adminUser.role === 'admin' || adminUser.role === 'super_admin')) {
      const destination = location.state?.from?.pathname || '/admin';
      navigate(destination, { replace: true });
    }
  }, [adminUser, navigate, location.state]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email.trim() || !formData.password) {
      setError('Please enter both email and password.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const data = await adminLogin({
        email: formData.email.trim(),
        password: formData.password
      });

      if (data && data.success && data.user) {
        // Authenticated admin state committed
        const destination = location.state?.from?.pathname || '/admin';
        navigate(destination, { replace: true });
      } else {
        setError(data?.message || 'Invalid administrator credentials.');
      }
    } catch (err) {
      setError(err.message || 'Authentication failed. Please verify your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="ks-auth-canvas">
      <div className="ks-auth-card ks-admin-auth-card">
        {/* Admin Emblem & Header */}
        <div className="ks-admin-auth-header">
          <div className="ks-admin-auth-emblem">
            <Shield size={28} />
          </div>
          <span className="ks-admin-auth-badge">KEEPER SPORTS STAFF</span>
          <h1 className="ks-auth-title">Administrator Sign In</h1>
          <p className="ks-auth-subtitle">Restricted access portal for authorized store administrators.</p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="ks-alert ks-alert-error" role="alert">
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
            <div>{error}</div>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          {/* Email Address */}
          <div className="ks-form-group">
            <label className="ks-label" htmlFor="admin-email">
              ADMINISTRATOR EMAIL
            </label>
            <div className="ks-input-container">
              <input
                id="admin-email"
                ref={emailRef}
                name="email"
                type="email"
                autoComplete="email"
                placeholder="admin@keepersportlb.com"
                className="ks-input"
                value={formData.email}
                onChange={handleChange}
                disabled={isSubmitting}
                required
              />
            </div>
          </div>

          {/* Password */}
          <div className="ks-form-group" style={{ marginBottom: '12px' }}>
            <label className="ks-label" htmlFor="admin-password">
              PASSWORD
            </label>
            <div className="ks-input-container">
              <input
                id="admin-password"
                ref={passwordRef}
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                placeholder="Enter admin password"
                className="ks-input ks-input-has-eye"
                value={formData.password}
                onChange={handleChange}
                disabled={isSubmitting}
                required
              />
              <button
                type="button"
                className="ks-eye-btn"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Forgot Password Link */}
          <div className="ks-forgot-row" style={{ marginBottom: '20px' }}>
            <Link to="/forgot-password?redirect=/admin/login" className="ks-forgot-link">
              Forgot Password?
            </Link>
          </div>

          {/* SIGN IN BUTTON */}
          <button
            type="submit"
            className="ks-btn-primary"
            disabled={isSubmitting}
            style={{ width: '100%' }}
          >
            {isSubmitting ? (
              <>
                <Loader2 size={16} className="ks-spinner-icon" />
                <span>VERIFYING PRIVILEGES...</span>
              </>
            ) : (
              <span>SIGN IN TO ADMIN</span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

