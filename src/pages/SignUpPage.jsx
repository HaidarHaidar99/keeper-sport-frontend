import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';

export default function SignUpPage() {
  const { register, googleLogin } = useAuth();
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

  const validate = () => {
    const errs = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formData.full_name.trim()) {
      errs.full_name = 'Full name is required.';
    } else if (formData.full_name.trim().length < 2) {
      errs.full_name = 'At least 2 characters.';
    }

    if (!formData.email.trim()) {
      errs.email = 'Email address is required.';
    } else if (!emailRegex.test(formData.email.trim())) {
      errs.email = 'Please enter a valid email address.';
    }

    if (!formData.password) {
      errs.password = 'Password is required.';
    } else if (formData.password.length < 8) {
      errs.password = 'Minimum 8 characters.';
    }

    if (!formData.confirm_password) {
      errs.confirm_password = 'Confirm your password.';
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
    if (serverError) {
      setServerError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');
    setSuccessMessage('');

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await register({
        full_name: formData.full_name.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        confirm_password: formData.confirm_password
      });

      if (response.success) {
        setSuccessMessage('Account created successfully. Please verify your email before logging in.');
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      }
    } catch (err) {
      setServerError(err.message || 'Registration failed. Please check your details.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleClick = () => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (!clientId) {
      setServerError('Google Sign-In is configured. Please provide VITE_GOOGLE_CLIENT_ID in your Vercel environment.');
      return;
    }

    if (typeof window === 'undefined' || !window.google?.accounts?.id) {
      setServerError('Google authentication service is initializing. Please try again.');
      return;
    }

    try {
      setGoogleLoading(true);
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: async (response) => {
          try {
            if (response.credential) {
              const data = await googleLogin(response.credential);
              if (data.success) {
                navigate('/login');
              }
            }
          } catch (err) {
            setServerError(err.message || 'Google registration failed.');
          } finally {
            setGoogleLoading(false);
          }
        }
      });

      window.google.accounts.id.prompt((notification) => {
        if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
          setGoogleLoading(false);
        }
      });
    } catch (err) {
      setGoogleLoading(false);
      setServerError(err.message || 'Could not launch Google authentication.');
    }
  };

  return (
    <div className="ks-auth-canvas">
      <div className="ks-auth-card">
        {/* Title & Subtitle */}
        <h1 className="ks-auth-title">Sign Up</h1>
        <p className="ks-auth-subtitle">Create an account. Please enter your details.</p>

        {/* Server Alert */}
        {serverError && (
          <div className="ks-alert ks-alert-error" role="alert">
            <AlertCircle size={15} style={{ flexShrink: 0 }} />
            <div>{serverError}</div>
          </div>
        )}

        {/* Success Alert */}
        {successMessage && (
          <div className="ks-alert ks-alert-success" role="status">
            <CheckCircle2 size={15} style={{ flexShrink: 0 }} />
            <div>{successMessage}</div>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          {/* Full Name */}
          <div className="ks-form-group">
            <label className="ks-label" htmlFor="signup-name">
              FULL NAME
            </label>
            <input
              id="signup-name"
              name="full_name"
              type="text"
              autoComplete="name"
              placeholder="Your Name"
              className={`ks-input ${errors.full_name ? 'has-error' : ''}`}
              value={formData.full_name}
              onChange={handleChange}
              disabled={isSubmitting}
            />
            {errors.full_name && <div className="ks-field-error">{errors.full_name}</div>}
          </div>

          {/* Email Address */}
          <div className="ks-form-group">
            <label className="ks-label" htmlFor="signup-email">
              EMAIL ADDRESS
            </label>
            <input
              id="signup-email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="your.email@example.com"
              className={`ks-input ${errors.email ? 'has-error' : ''}`}
              value={formData.email}
              onChange={handleChange}
              disabled={isSubmitting}
            />
            {errors.email && <div className="ks-field-error">{errors.email}</div>}
          </div>

          {/* Password */}
          <div className="ks-form-group">
            <label className="ks-label" htmlFor="signup-password">
              PASSWORD
            </label>
            <div className="ks-input-container">
              <input
                id="signup-password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                placeholder="At least 8 characters"
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
          <div className="ks-form-group" style={{ marginBottom: '24px' }}>
            <label className="ks-label" htmlFor="signup-confirm-password">
              CONFIRM PASSWORD
            </label>
            <div className="ks-input-container">
              <input
                id="signup-confirm-password"
                name="confirm_password"
                type={showConfirmPassword ? 'text' : 'password'}
                autoComplete="new-password"
                placeholder="Re-enter password"
                className={`ks-input ks-input-has-eye ${errors.confirm_password ? 'has-error' : ''}`}
                value={formData.confirm_password}
                onChange={handleChange}
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
            {errors.confirm_password && <div className="ks-field-error">{errors.confirm_password}</div>}
          </div>

          {/* CREATE ACCOUNT Button */}
          <button
            type="submit"
            className="ks-btn-primary"
            disabled={isSubmitting}
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

        {/* Switch Link: Already have an account? Sign In (Red) */}
        <div className="ks-switch-text">
          <span>Already have an account?</span>
          <Link to="/login" className="ks-switch-link">
            Sign In
          </Link>
        </div>

        {/* Divider */}
        <div className="ks-divider">
          <span>OR CONTINUE WITH EMAIL</span>
        </div>

        {/* CONTINUE WITH GOOGLE */}
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
              d="M9 18c2.43 0 4.4673-.806 5.9564-2.1805l-2.9087-2.2581c-.8059.54-1.8368.859-3.0477.859-2.3441 0-4.3282-1.5831-5.036-3.7104H.9573v2.3318C2.4382 15.9832 5.4818 18 9 18z"
              fill="#34A853"
            />
            <path
              d="M3.964 10.71c-.18-.54-.2822-1.1168-.2822-1.71s.1022-1.17.2822-1.71V4.9582H.9573A8.9965 8.9965 0 0 0 0 9c0 1.4523.3477 2.8268.9573 4.0418L3.964 10.71z"
              fill="#FBBC05"
            />
            <path
              d="M9 3.5795c1.3214 0 2.5077.4541 3.4405 1.346l2.5813-2.5814C13.4632.9245 11.4259 0 9 0 5.4818 0 2.4382 2.0168.9573 4.9582L3.964 7.29C4.6718 5.1627 6.6559 3.5795 9 3.5795z"
              fill="#EA4335"
            />
          </svg>
          <span>{googleLoading ? 'CONNECTING...' : 'CONTINUE WITH GOOGLE'}</span>
        </button>
      </div>
    </div>
  );
}
