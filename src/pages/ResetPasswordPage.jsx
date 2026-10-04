import React, { useState, useEffect, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { authApi } from '../api/authApi';
import { Eye, EyeOff, AlertCircle, CheckCircle2, Loader2, Sun, Moon } from 'lucide-react';

export default function ResetPasswordPage() {
  const { theme, toggleTheme } = useTheme();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [isVerifyingToken, setIsVerifyingToken] = useState(true);
  const [tokenError, setTokenError] = useState('');
  const [formError, setFormError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const passwordRef = useRef(null);
  const confirmPasswordRef = useRef(null);

  // 1. Verify token validity on mount
  useEffect(() => {
    if (!token) {
      setTokenError('Missing password reset token. Please request a new reset link.');
      setIsVerifyingToken(false);
      return;
    }

    authApi.verifyResetToken(token)
      .then((data) => {
        if (!data.valid) {
          setTokenError(data.message || 'Invalid or expired password reset link.');
        }
      })
      .catch((err) => {
        setTokenError(err.message || 'Invalid or expired password reset link.');
      })
      .finally(() => {
        setIsVerifyingToken(false);
      });
  }, [token]);

  const handlePasswordKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      confirmPasswordRef.current?.focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!password) {
      setFormError('New password is required.');
      return;
    }

    if (password.length < 8) {
      setFormError('Password must be at least 8 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setFormError('Passwords do not match.');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await authApi.resetPassword({
        token,
        password,
        confirm_password: confirmPassword
      });

      if (response.success) {
        setSuccessMessage('Password changed successfully.');
      }
    } catch (err) {
      setFormError(err.message || 'Failed to reset password. Please request a new link.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="ks-auth-canvas">
      {/* Theme Toggle Button (Square) */}
      <button
        type="button"
        className="ks-theme-toggle"
        onClick={toggleTheme}
        aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      >
        {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
      </button>

      <div className="ks-auth-card">
        <h1 className="ks-auth-title">Reset Password</h1>
        <p className="ks-auth-subtitle">
          Choose a strong new password for your Keeper Sports account.
        </p>

        {isVerifyingToken ? (
          <div style={{ textAlign: 'center', padding: '30px 0', color: 'var(--ks-text-subtitle)' }}>
            <Loader2 size={24} className="ks-spinner-icon" style={{ margin: '0 auto 12px' }} />
            <div>Verifying reset token...</div>
          </div>
        ) : tokenError ? (
          <div>
            <div className="ks-alert ks-alert-error" role="alert">
              <AlertCircle size={15} style={{ flexShrink: 0 }} />
              <div>{tokenError}</div>
            </div>
            <div style={{ marginTop: '20px' }}>
              <Link to="/forgot-password" className="ks-btn-primary" style={{ textDecoration: 'none' }}>
                REQUEST NEW RESET LINK
              </Link>
            </div>
            <div className="ks-switch-text" style={{ marginTop: '20px', marginBottom: 0 }}>
              <Link to="/login" className="ks-switch-link">
                Return to Sign In
              </Link>
            </div>
          </div>
        ) : successMessage ? (
          <div>
            <div className="ks-alert ks-alert-success" role="status">
              <CheckCircle2 size={15} style={{ flexShrink: 0 }} />
              <div>{successMessage}</div>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--ks-text-subtitle)', marginBottom: '24px' }}>
              You can now sign in with your new password.
            </p>
            <Link to="/login" className="ks-btn-primary" style={{ textDecoration: 'none' }}>
              SIGN IN
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate>
            {formError && (
              <div className="ks-alert ks-alert-error" role="alert">
                <AlertCircle size={15} style={{ flexShrink: 0 }} />
                <div>{formError}</div>
              </div>
            )}

            {/* New Password */}
            <div className="ks-form-group">
              <label className="ks-label" htmlFor="reset-new-password">
                NEW PASSWORD
              </label>
              <div className="ks-input-container">
                <input
                  id="reset-new-password"
                  ref={passwordRef}
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  placeholder="At least 8 characters"
                  className={`ks-input ks-input-has-eye ${formError ? 'has-error' : ''}`}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (formError) setFormError('');
                  }}
                  onKeyDown={handlePasswordKeyDown}
                  disabled={isSubmitting}
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

            {/* Confirm New Password */}
            <div className="ks-form-group" style={{ marginBottom: '24px' }}>
              <label className="ks-label" htmlFor="reset-confirm-password">
                CONFIRM NEW PASSWORD
              </label>
              <div className="ks-input-container">
                <input
                  id="reset-confirm-password"
                  ref={confirmPasswordRef}
                  type={showConfirmPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  placeholder="Re-enter new password"
                  className={`ks-input ks-input-has-eye ${formError ? 'has-error' : ''}`}
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    if (formError) setFormError('');
                  }}
                  disabled={isSubmitting}
                />
                <button
                  type="button"
                  className="ks-eye-btn"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                  tabIndex={-1}
                >
                  {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="ks-btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className="ks-spinner-icon" />
                  <span>UPDATING PASSWORD...</span>
                </>
              ) : (
                <span>UPDATE PASSWORD</span>
              )}
            </button>

            <div className="ks-switch-text" style={{ marginTop: '22px', marginBottom: 0 }}>
              <Link to="/login" className="ks-switch-link">
                Back to Sign In
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
