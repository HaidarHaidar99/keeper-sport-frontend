import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Eye, EyeOff, AlertCircle, CheckCircle2, Loader2, ArrowLeft } from 'lucide-react';

export default function SignUpPage() {
  const { register, googleLogin } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    password: '',
    confirm_password: ''
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const nameRef = useRef(null);
  const emailRef = useRef(null);
  const passwordRef = useRef(null);
  const confirmPasswordRef = useRef(null);
  const googleAnchorRef = useRef(null);

  // Google Identity Services Setup
  useEffect(() => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (!clientId) return;

    const initGsi = () => {
      if (typeof window === 'undefined' || !window.google?.accounts?.id) return false;

      try {
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: async (response) => {
            if (response.credential) {
              setGoogleLoading(true);
              setServerError('');
              try {
                const data = await googleLogin(response.credential);
                if (data.success) {
                  navigate('/');
                }
              } catch (err) {
                setServerError(err.message || 'Google registration failed.');
              } finally {
                setGoogleLoading(false);
              }
            }
          }
        });

        if (googleAnchorRef.current) {
          googleAnchorRef.current.innerHTML = '';
          window.google.accounts.id.renderButton(googleAnchorRef.current, {
            type: 'standard',
            theme: theme === 'dark' ? 'filled_black' : 'outline',
            size: 'large',
            text: 'signup_with',
            shape: 'rectangular',
            width: googleAnchorRef.current.offsetWidth || 340
          });
        }
        return true;
      } catch (err) {
        console.warn('GSI Init warning:', err);
        return false;
      }
    };

    if (!initGsi()) {
      const interval = setInterval(() => {
        if (initGsi()) clearInterval(interval);
      }, 250);
      return () => clearInterval(interval);
    }
  }, [googleLogin, navigate, theme]);

  const validate = () => {
    const errs = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formData.full_name.trim()) {
      errs.full_name = 'Full name is required.';
    } else if (formData.full_name.trim().length < 2) {
      errs.full_name = 'Full name must be at least 2 characters.';
    }

    if (!formData.email.trim()) {
      errs.email = 'Email address is required.';
    } else if (!emailRegex.test(formData.email.trim())) {
      errs.email = 'Please enter a valid email address.';
    }

    if (!formData.password) {
      errs.password = 'Password is required.';
    } else if (formData.password.length < 8) {
      errs.password = 'Password must be at least 8 characters long.';
    }

    if (!formData.confirm_password) {
      errs.confirm_password = 'Confirm password is required.';
    } else if (formData.password !== formData.confirm_password) {
      errs.confirm_password = 'Passwords do not match.';
    }

    return errs;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
    if (serverError) setServerError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');
    setSuccessMessage('');

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      const firstField = Object.keys(validationErrors)[0];
      if (firstField === 'full_name') nameRef.current?.focus();
      else if (firstField === 'email') emailRef.current?.focus();
      else if (firstField === 'password') passwordRef.current?.focus();
      else if (firstField === 'confirm_password') confirmPasswordRef.current?.focus();
      return;
    }

    setIsSubmitting(true);

    try {
      const data = await register(formData);

      if (data && data.success) {
        setSuccessMessage('Account created successfully! Please check your email to verify your account (link expires in 5 minutes).');
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } else {
        setServerError(data?.message || 'Could not complete registration.');
      }
    } catch (err) {
      setServerError(err.message || 'An error occurred during account creation.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleClick = () => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (!clientId) {
      setServerError('Google registration is currently being initialized.');
      return;
    }

    if (window.google?.accounts?.id) {
      window.google.accounts.id.prompt((notification) => {
        if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
          const btn = googleAnchorRef.current?.querySelector('div[role="button"]') ||
                      googleAnchorRef.current?.querySelector('iframe');
          if (btn) btn.click();
        }
      });
    }
  };

  return (
    <div className="ks-auth-canvas">
      <div className="ks-auth-card">
        {/* Title & Subtitle */}
        <h1 className="ks-auth-title">Create Account</h1>
        <p className="ks-auth-subtitle">Join Keeper Sports for exclusive gear drops, tracking, and express checkout.</p>

        {/* Server Alert */}
        {serverError && (
          <div className="ks-alert ks-alert-error" role="alert">
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
            <div>{serverError}</div>
          </div>
        )}

        {/* Success Alert */}
        {successMessage && (
          <div className="ks-alert ks-alert-success" role="status">
            <CheckCircle2 size={16} style={{ flexShrink: 0 }} />
            <div>{successMessage}</div>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          {/* Full Name */}
          <div className="ks-form-group">
            <label className="ks-label" htmlFor="reg-name">
              FULL NAME
            </label>
            <div className="ks-input-container">
              <input
                id="reg-name"
                ref={nameRef}
                name="full_name"
                type="text"
                autoComplete="name"
                placeholder="Full Name"
                className={`ks-input ${errors.full_name ? 'has-error' : ''}`}
                value={formData.full_name}
                onChange={handleChange}
                disabled={isSubmitting}
              />
            </div>
            {errors.full_name && <div className="ks-field-error">{errors.full_name}</div>}
          </div>

          {/* Email Address */}
          <div className="ks-form-group">
            <label className="ks-label" htmlFor="reg-email">
              EMAIL ADDRESS
            </label>
            <div className="ks-input-container">
              <input
                id="reg-email"
                ref={emailRef}
                name="email"
                type="email"
                autoComplete="email"
                placeholder="Your email"
                className={`ks-input ${errors.email ? 'has-error' : ''}`}

                value={formData.email}
                onChange={handleChange}
                disabled={isSubmitting}
              />
            </div>
            {errors.email && <div className="ks-field-error">{errors.email}</div>}
          </div>

          {/* Password */}
          <div className="ks-form-group">
            <label className="ks-label" htmlFor="reg-password">
              PASSWORD (MIN. 8 CHARACTERS)
            </label>
            <div className="ks-input-container">
              <input
                id="reg-password"
                ref={passwordRef}
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                placeholder="Create strong password"
                className={`ks-input ks-input-has-eye ${errors.password ? 'has-error' : ''}`}
                value={formData.password}
                onChange={handleChange}
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
            {errors.password && <div className="ks-field-error">{errors.password}</div>}
          </div>

          {/* Confirm Password */}
          <div className="ks-form-group" style={{ marginBottom: '20px' }}>
            <label className="ks-label" htmlFor="reg-confirm-password">
              CONFIRM PASSWORD
            </label>
            <div className="ks-input-container">
              <input
                id="reg-confirm-password"
                ref={confirmPasswordRef}
                name="confirm_password"
                type={showConfirmPassword ? 'text' : 'password'}
                autoComplete="new-password"
                placeholder="Repeat password"
                className={`ks-input ks-input-has-eye ${errors.confirm_password ? 'has-error' : ''}`}
                value={formData.confirm_password}
                onChange={handleChange}
                disabled={isSubmitting}
              />
              <button
                type="button"
                className="ks-eye-btn"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                tabIndex={-1}
              >
                {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.confirm_password && <div className="ks-field-error">{errors.confirm_password}</div>}
          </div>

          {/* CREATE ACCOUNT BUTTON (RED) */}
          <button
            type="submit"
            className="ks-btn-primary"
            disabled={isSubmitting}
            style={{ width: '100%' }}
          >
            {isSubmitting ? (
              <>
                <Loader2 size={16} className="ks-spinner-icon" />
                <span>CREATING ACCOUNT...</span>
              </>
            ) : (
              <span>CREATE ACCOUNT</span>
            )}
          </button>
        </form>

        {/* Link to Sign In */}
        <div className="ks-switch-text">
          <span>Already have an account?</span>
          <Link to="/login" className="ks-switch-link">
            Sign In
          </Link>
        </div>

        {/* Clean "OR" Divider */}
        <div className="ks-divider">
          <span>OR</span>
        </div>

        {/* Continue with Google */}
        <div className="ks-google-wrapper">
          <div ref={googleAnchorRef} className="ks-google-native-anchor" />
          <button
            type="button"
            className="ks-btn-google"
            onClick={handleGoogleClick}
            disabled={googleLoading || isSubmitting}
          >
            <svg width="17" height="17" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M17.64 9.2045c0-.6381-.0573-1.2518-.1636-1.8409H9v3.4814h4.8436c-.2086 1.125-.8427 2.0782-1.7959 2.7164v2.2581h2.9087c1.7018-1.5668 2.6836-3.874 2.6836-6.615z"
                fill="#4285F4"
              />
              <path
                d="M9 18c2.43 0 4.4673-.806 5.9564-2.1805l-2.9087-2.2581c-.8059.54-1.8368.859-3.0477.859-2.344 0-4.3282-1.5831-5.036-3.7104H.9573v2.3318C2.4382 15.9832 5.4818 18 9 18z"
                fill="#34A853"
              />
              <path
                d="M3.964 10.71c-.18-.54-.2822-1.1168-.2822-1.71s.1023-1.17.2823-1.71V4.9582H.9573A8.9965 8.9965 0 000 9c0 1.4523.3477 2.8268.9573 4.0418L3.964 10.71z"
                fill="#FBBC05"
              />
              <path
                d="M9 3.5795c1.3214 0 2.5077.4541 3.4405 1.346l2.5813-2.5814C13.4632.9205 11.426 0 9 0 5.4818 0 2.4382 2.0168.9573 4.9582L3.964 7.29C4.6718 5.1627 6.656 3.5795 9 3.5795z"
                fill="#EA4335"
              />
            </svg>
            <span>{googleLoading ? 'Connecting to Google...' : 'Continue with Google'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

