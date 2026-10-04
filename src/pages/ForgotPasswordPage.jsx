import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { authApi } from '../api/authApi';
import { AlertCircle, CheckCircle2, Loader2, Sun, Moon } from 'lucide-react';

export default function ForgotPasswordPage() {
  const { theme, toggleTheme } = useTheme();

  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      setError('Email address is required.');
      return;
    }
    if (!emailRegex.test(email.trim())) {
      setError('Please enter a valid email address.');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await authApi.forgotPassword(email.trim().toLowerCase());
      setSuccessMessage(response.message || 'If an account exists for this email, a password reset link has been sent.');
    } catch (err) {
      setError(err.message || 'Unable to request password reset. Please try again.');
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
        <h1 className="ks-auth-title">Forgot Password</h1>
        <p className="ks-auth-subtitle">
          Enter your email address to receive a secure password reset link.
        </p>

        {/* Error Alert */}
        {error && (
          <div className="ks-alert ks-alert-error" role="alert">
            <AlertCircle size={15} style={{ flexShrink: 0 }} />
            <div>{error}</div>
          </div>
        )}

        {/* Success Alert */}
        {successMessage && (
          <div className="ks-alert ks-alert-success" role="status">
            <CheckCircle2 size={15} style={{ flexShrink: 0 }} />
            <div>{successMessage}</div>
          </div>
        )}

        {!successMessage ? (
          <form onSubmit={handleSubmit} noValidate>
            <div className="ks-form-group" style={{ marginBottom: '24px' }}>
              <label className="ks-label" htmlFor="forgot-email">
                EMAIL ADDRESS
              </label>
              <input
                id="forgot-email"
                type="email"
                autoComplete="email"
                placeholder="your.email@example.com"
                className={`ks-input ${error ? 'has-error' : ''}`}
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (error) setError('');
                }}
                disabled={isSubmitting}
              />
            </div>

            <button
              type="submit"
              className="ks-btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className="ks-spinner-icon" />
                  <span>SENDING LINK...</span>
                </>
              ) : (
                <span>SEND RESET LINK</span>
              )}
            </button>
          </form>
        ) : (
          <div style={{ marginTop: '16px' }}>
            <Link to="/login" className="ks-btn-primary" style={{ textDecoration: 'none' }}>
              RETURN TO SIGN IN
            </Link>
          </div>
        )}

        <div className="ks-switch-text" style={{ marginTop: '24px', marginBottom: 0 }}>
          <span>Remember your password?</span>
          <Link to="/login" className="ks-switch-link">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
