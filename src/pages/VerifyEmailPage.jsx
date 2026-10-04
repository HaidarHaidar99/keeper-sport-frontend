import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { authApi } from '../api/authApi';
import { CheckCircle2, AlertCircle, Loader2, Sun, Moon } from 'lucide-react';

export default function VerifyEmailPage() {
  const { theme, toggleTheme } = useTheme();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';

  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('verifying'); // 'verifying', 'success', 'error'
  const [message, setMessage] = useState('');

  // Resend form state
  const [resendEmail, setResendEmail] = useState('');
  const [resendLoading, setResendLoading] = useState(false);
  const [resendMessage, setResendMessage] = useState('');
  const [resendError, setResendError] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Missing email verification token.');
      setLoading(false);
      return;
    }

    authApi.verifyEmail(token)
      .then((data) => {
        setStatus('success');
        setMessage(data.message || 'Email verified successfully! You can now sign in.');
      })
      .catch((err) => {
        setStatus('error');
        setMessage(err.message || 'Invalid or expired verification link.');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [token]);

  const handleResend = async (e) => {
    e.preventDefault();
    setResendError('');
    setResendMessage('');

    if (!resendEmail.trim()) {
      setResendError('Email address is required.');
      return;
    }

    setResendLoading(true);

    try {
      const response = await authApi.resendVerification(resendEmail.trim().toLowerCase());
      setResendMessage(response.message || 'A new verification link has been sent. Please check your inbox.');
    } catch (err) {
      setResendError(err.message || 'Failed to resend verification email.');
    } finally {
      setResendLoading(false);
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
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--ks-text-subtitle)' }}>
            <Loader2 size={28} className="ks-spinner-icon" style={{ margin: '0 auto 16px' }} />
            <div style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--ks-text-title)' }}>
              Verifying Your Email
            </div>
            <div style={{ fontSize: '0.85rem', marginTop: '6px' }}>
              Please wait while we confirm your account...
            </div>
          </div>
        ) : status === 'success' ? (
          <div>
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <div style={{
                width: '52px',
                height: '52px',
                backgroundColor: 'var(--ks-success-bg)',
                border: '1px solid var(--ks-success-border)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '16px',
                color: 'var(--ks-success-green)'
              }}>
                <CheckCircle2 size={28} />
              </div>
              <h1 className="ks-auth-title" style={{ fontSize: '1.9rem', marginBottom: '8px' }}>
                Email Verified
              </h1>
              <p className="ks-auth-subtitle" style={{ marginBottom: '24px' }}>
                {message}
              </p>
            </div>

            <Link to="/login" className="ks-btn-primary" style={{ textDecoration: 'none' }}>
              SIGN IN TO YOUR ACCOUNT
            </Link>
          </div>
        ) : (
          <div>
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <div style={{
                width: '52px',
                height: '52px',
                backgroundColor: 'var(--ks-error-bg)',
                border: '1px solid var(--ks-error-border)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '16px',
                color: 'var(--ks-error-red)'
              }}>
                <AlertCircle size={28} />
              </div>
              <h1 className="ks-auth-title" style={{ fontSize: '1.8rem', marginBottom: '8px' }}>
                Verification Failed
              </h1>
              <p className="ks-auth-subtitle" style={{ marginBottom: '20px' }}>
                {message}
              </p>
            </div>

            {/* Resend Form */}
            <div style={{
              borderTop: '1px solid var(--ks-divider-line)',
              paddingTop: '20px',
              marginTop: '10px'
            }}>
              <p style={{
                fontSize: '0.8rem',
                color: 'var(--ks-text-subtitle)',
                marginBottom: '14px',
                fontWeight: 600
              }}>
                NEED A NEW VERIFICATION LINK?
              </p>

              {resendError && (
                <div className="ks-alert ks-alert-error" role="alert">
                  <AlertCircle size={15} style={{ flexShrink: 0 }} />
                  <div>{resendError}</div>
                </div>
              )}

              {resendMessage && (
                <div className="ks-alert ks-alert-success" role="status">
                  <CheckCircle2 size={15} style={{ flexShrink: 0 }} />
                  <div>{resendMessage}</div>
                </div>
              )}

              {!resendMessage && (
                <form onSubmit={handleResend} noValidate>
                  <div className="ks-form-group" style={{ marginBottom: '14px' }}>
                    <input
                      type="email"
                      placeholder="your.email@example.com"
                      className="ks-input"
                      value={resendEmail}
                      onChange={(e) => setResendEmail(e.target.value)}
                      disabled={resendLoading}
                    />
                  </div>
                  <button
                    type="submit"
                    className="ks-btn-primary"
                    disabled={resendLoading}
                  >
                    {resendLoading ? (
                      <>
                        <Loader2 size={16} className="ks-spinner-icon" />
                        <span>SENDING LINK...</span>
                      </>
                    ) : (
                      <span>RESEND VERIFICATION EMAIL</span>
                    )}
                  </button>
                </form>
              )}
            </div>

            <div className="ks-switch-text" style={{ marginTop: '22px', marginBottom: 0 }}>
              <Link to="/login" className="ks-switch-link">
                Back to Sign In
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
