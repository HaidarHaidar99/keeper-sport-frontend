import React, { useState, useEffect, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { authApi } from '../api/authApi';
import { Eye, EyeOff, AlertCircle, CheckCircle2, Clock, Loader2, Sun, Moon } from 'lucide-react';

export default function ResetPasswordPage() {
  const { theme, toggleTheme } = useTheme();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const redirect = searchParams.get('redirect') || '/login';
  const isFromAdmin = redirect.startsWith('/admin');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // tokenState: 'verifying' | 'valid' | 'expired' | 'invalid'
  const [tokenState, setTokenState] = useState('verifying');
  const [tokenErrorMessage, setTokenErrorMessage] = useState('');
  const [formError, setFormError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const passwordRef = useRef(null);
  const confirmPasswordRef = useRef(null);

  // 1. Verify token validity on mount
  useEffect(() => {
    if (!token) {
      setTokenState('invalid');
      setTokenErrorMessage('Missing password reset token. Please request a new reset link.');
      return;
    }

    authApi.verifyResetToken(token)
      .then((data) => {
        if (data.valid) {
          setTokenState('valid');
        } else if (data.expired) {
          setTokenState('expired');
          setTokenErrorMessage(data.message || 'This password reset link has expired (5-minute limit).');
        } else {
          setTokenState('invalid');
          setTokenErrorMessage(data.message || 'Invalid or already used password reset link.');
        }
      })
      .catch((err) => {
        if (err.expired) {
          setTokenState('expired');
          setTokenErrorMessage(err.message || 'This password reset link has expired (5-minute limit).');
        } else {
          setTokenState('invalid');
          setTokenErrorMessage(err.message || 'Invalid or already used password reset link.');
        }
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

    if (password.length > 128) {
      setFormError('Password cannot exceed 128 characters.');
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
      if (err.expired) {
        setTokenState('expired');
        setTokenErrorMessage(err.message || 'This password reset link has expired.');
      } else {
        setFormError(err.message || 'Failed to reset password. Please request a new link.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="ks-auth-canvas">
      {/* Theme Toggle Button */}
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
        {tokenState === 'verifying' ? (
          <div style={{ textAlign: 'center', padding: '36px 0', color: 'var(--ks-text-subtitle)' }}>
            <Loader2 size={26} className="ks-spinner-icon" style={{ margin: '0 auto 14px' }} />
            <div style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--ks-text-title)' }}>
              Verifying Reset Token...
            </div>
            <div style={{ fontSize: '0.82rem', marginTop: '4px' }}>
              Checking security token status...
            </div>
          </div>
        ) : tokenState === 'expired' ? (
          <div>
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <div style={{
                width: '52px',
                height: '52px',
                backgroundColor: 'rgba(234, 179, 8, 0.1)',
                border: '1px solid rgba(234, 179, 8, 0.3)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '16px',
                color: '#eab308'
              }}>
                <Clock size={28} />
              </div>
              <h1 className="ks-auth-title" style={{ fontSize: '1.8rem', marginBottom: '8px' }}>
                Reset Link Expired
              </h1>
              <p className="ks-auth-subtitle" style={{ marginBottom: '20px' }}>
                {tokenErrorMessage || 'For your security, password reset links expire in exactly 5 minutes. Please request a fresh reset link below.'}
              </p>
            </div>

            <div style={{ marginTop: '20px' }}>
              <Link to="/forgot-password" className="ks-btn-primary" style={{ textDecoration: 'none' }}>
                REQUEST NEW RESET LINK
              </Link>
            </div>

            <div className="ks-switch-text" style={{ marginTop: '22px', marginBottom: 0 }}>
              <Link to={redirect} className="ks-switch-link">
                {isFromAdmin ? 'Return to Admin Sign In' : 'Return to Sign In'}
              </Link>
            </div>
          </div>
        ) : tokenState === 'invalid' ? (
          <div>
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <div style={{
                width: '52px',
                height: '52px',
                backgroundColor: 'var(--ks-error-bg, rgba(225,6,0,0.1))',
                border: '1px solid var(--ks-error-border, rgba(225,6,0,0.3))',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '16px',
                color: 'var(--ks-error-red, #e10600)'
              }}>
                <AlertCircle size={28} />
              </div>
              <h1 className="ks-auth-title" style={{ fontSize: '1.8rem', marginBottom: '8px' }}>
                Invalid or Used Link
              </h1>
              <p className="ks-auth-subtitle" style={{ marginBottom: '20px' }}>
                {tokenErrorMessage || 'This password reset link is invalid, malformed, or has already been used. Each link is strictly single-use.'}
              </p>
            </div>

            <div style={{ marginTop: '20px' }}>
              <Link to="/forgot-password" className="ks-btn-primary" style={{ textDecoration: 'none' }}>
                REQUEST NEW RESET LINK
              </Link>
            </div>

            <div className="ks-switch-text" style={{ marginTop: '22px', marginBottom: 0 }}>
              <Link to={redirect} className="ks-switch-link">
                {isFromAdmin ? 'Return to Admin Sign In' : 'Return to Sign In'}
              </Link>
            </div>
          </div>
        ) : successMessage ? (
          <div>
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <div style={{
                width: '52px',
                height: '52px',
                backgroundColor: 'var(--ks-success-bg, rgba(34,197,94,0.1))',
                border: '1px solid var(--ks-success-border, rgba(34,197,94,0.3))',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '16px',
                color: 'var(--ks-success-green, #22c55e)'
              }}>
                <CheckCircle2 size={28} />
              </div>
              <h1 className="ks-auth-title" style={{ fontSize: '1.8rem', marginBottom: '8px' }}>
                Password Updated
              </h1>
              <p className="ks-auth-subtitle" style={{ marginBottom: '24px' }}>
                Your password has been changed successfully. You can now sign in with your new password.
              </p>
            </div>

            <Link to={redirect} className="ks-btn-primary" style={{ textDecoration: 'none' }}>
              {isFromAdmin ? 'SIGN IN TO ADMIN' : 'SIGN IN TO YOUR ACCOUNT'}
            </Link>
          </div>
        ) : (
          <div>
            <h1 className="ks-auth-title">Reset Password</h1>
            <p className="ks-auth-subtitle">
              Choose a strong new password for your Keeper Sports account.
            </p>

            <form onSubmit={handleSubmit} noValidate>
              {formError && (
                <div className="ks-alert ks-alert-error" role="alert" style={{ marginBottom: '18px' }}>
                  <AlertCircle size={15} style={{ flexShrink: 0 }} />
                  <div>{formError}</div>
                </div>
              )}

              {/* New Password */}
              <div className="ks-form-group">
                <label className="ks-label" htmlFor="reset-new-password">
                  NEW PASSWORD (MIN. 8 CHARACTERS)
                </label>
                <div className="ks-input-container">
                  <input
                    id="reset-new-password"
                    ref={passwordRef}
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    placeholder="Enter new password"
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
                    placeholder="Repeat new password"
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
                <Link to={redirect} className="ks-switch-link">
                  {isFromAdmin ? 'Back to Admin Sign In' : 'Back to Sign In'}
                </Link>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
