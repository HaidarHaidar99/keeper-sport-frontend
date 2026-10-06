import React, { useState, useEffect } from 'react';
import { Mail, Phone, MapPin, Send, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { contentApi } from '../api/contentApi';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function ContactPage() {
  const [siteSettings, setSiteSettings] = useState(null);
  const [categories, setCategories] = useState([]);
  const [userCounts, setUserCounts] = useState({});

  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    message: ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverSuccess, setServerSuccess] = useState('');
  const [serverError, setServerError] = useState('');

  useEffect(() => {
    let isMounted = true;
    Promise.all([
      contentApi.getSiteSettings(),
      contentApi.getCategories(),
      contentApi.getUserCounts()
    ]).then(([settingsRes, catsRes, countsRes]) => {
      if (!isMounted) return;
      if (settingsRes?.success) setSiteSettings(settingsRes.settings);
      if (catsRes?.success) setCategories(catsRes.categories || []);
      if (countsRes?.success) setUserCounts(countsRes.counts || {});
    });

    return () => {
      isMounted = false;
    };
  }, []);

  const validate = () => {
    const errs = {};
    if (!formData.full_name.trim()) errs.full_name = 'Full name is required.';
    if (!formData.email.trim()) errs.email = 'Email address is required.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      errs.email = 'Please enter a valid email address.';
    }
    if (!formData.phone.trim()) errs.phone = 'Phone number is required.';
    if (!formData.message.trim()) errs.message = 'Please provide a message or inquiry.';
    return errs;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
    if (serverError) setServerError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerSuccess('');
    setServerError('');

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await contentApi.submitContact(formData);
      if (res && res.success) {
        setServerSuccess(res.message || 'Your inquiry has been submitted successfully.');
        setFormData({ full_name: '', email: '', phone: '', message: '' });
      } else {
        setServerError(res.message || 'Failed to send inquiry. Please try again.');
      }
    } catch {
      setServerError('Network error submitting inquiry.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="ks-page-canvas">
      <Navbar siteSettings={siteSettings} categories={categories} counts={userCounts} />

      <main className="ks-catalog-page-container">
        <header className="ks-catalog-header">
          <div className="ks-catalog-header-badge">
            <Mail size={13} style={{ color: 'var(--ks-accent-red)' }} />
            <span>GET IN TOUCH</span>
          </div>
          <h1 className="ks-catalog-title">Contact Us</h1>
          <p className="ks-catalog-subtitle">
            Have questions about products, sizing, or custom kit printing? We're here to help.
          </p>
        </header>

        <div className="ks-contact-grid">
          {/* Left: Contact Info */}
          <div className="ks-contact-info-card">
            <h2 className="ks-contact-section-title">Store Information</h2>
            <p className="ks-contact-section-desc">
              Reach out directly or send us an inquiry through the form.
            </p>

            <div className="ks-contact-items-list">
              {siteSettings?.phone_number && (
                <div className="ks-contact-detail-row">
                  <div className="ks-contact-icon-box">
                    <Phone size={18} />
                  </div>
                  <div>
                    <span className="ks-contact-label">Phone</span>
                    <a href={`tel:${siteSettings.phone_number}`} className="ks-contact-value">
                      {siteSettings.phone_number}
                    </a>
                  </div>
                </div>
              )}

              {siteSettings?.email && (
                <div className="ks-contact-detail-row">
                  <div className="ks-contact-icon-box">
                    <Mail size={18} />
                  </div>
                  <div>
                    <span className="ks-contact-label">Email</span>
                    <a href={`mailto:${siteSettings.email}`} className="ks-contact-value">
                      {siteSettings.email}
                    </a>
                  </div>
                </div>
              )}

              {siteSettings?.location_name && (
                <div className="ks-contact-detail-row">
                  <div className="ks-contact-icon-box">
                    <MapPin size={18} />
                  </div>
                  <div>
                    <span className="ks-contact-label">Location</span>
                    <span className="ks-contact-value">{siteSettings.location_name}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right: Contact Form */}
          <div className="ks-contact-form-card">
            <h2 className="ks-contact-section-title">Send a Message</h2>

            {serverSuccess && (
              <div className="ks-alert ks-alert-success" role="status">
                <CheckCircle2 size={16} />
                <span>{serverSuccess}</span>
              </div>
            )}

            {serverError && (
              <div className="ks-alert ks-alert-error" role="alert">
                <AlertCircle size={16} />
                <span>{serverError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate>
              <div className="ks-form-group">
                <label className="ks-label" htmlFor="contact-name">
                  FULL NAME
                </label>
                <input
                  id="contact-name"
                  name="full_name"
                  type="text"
                  placeholder="Full Name"
                  className={`ks-input ${errors.full_name ? 'has-error' : ''}`}
                  value={formData.full_name}
                  onChange={handleChange}
                  disabled={isSubmitting}
                />
                {errors.full_name && <div className="ks-field-error">{errors.full_name}</div>}
              </div>

              <div className="ks-form-row">
                <div className="ks-form-group">
                  <label className="ks-label" htmlFor="contact-email">
                    EMAIL
                  </label>
                  <input
                    id="contact-email"
                    name="email"
                    type="email"
                    placeholder="Your email"
                    className={`ks-input ${errors.email ? 'has-error' : ''}`}
                    value={formData.email}
                    onChange={handleChange}
                    disabled={isSubmitting}
                  />
                  {errors.email && <div className="ks-field-error">{errors.email}</div>}
                </div>

                <div className="ks-form-group">
                  <label className="ks-label" htmlFor="contact-phone">
                    PHONE NUMBER
                  </label>
                  <input
                    id="contact-phone"
                    name="phone"
                    type="tel"
                    placeholder="+961 70 123 456"
                    className={`ks-input ${errors.phone ? 'has-error' : ''}`}
                    value={formData.phone}
                    onChange={handleChange}
                    disabled={isSubmitting}
                  />
                  {errors.phone && <div className="ks-field-error">{errors.phone}</div>}
                </div>
              </div>

              <div className="ks-form-group">
                <label className="ks-label" htmlFor="contact-message">
                  MESSAGE
                </label>
                <textarea
                  id="contact-message"
                  name="message"
                  rows={4}
                  placeholder="How can we assist you?"
                  className={`ks-input ks-textarea ${errors.message ? 'has-error' : ''}`}
                  value={formData.message}
                  onChange={handleChange}
                  disabled={isSubmitting}
                />
                {errors.message && <div className="ks-field-error">{errors.message}</div>}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="ks-btn-primary"
                style={{ width: '100%', marginTop: '8px' }}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={16} className="ks-spinner-icon" />
                    <span>SENDING MESSAGE...</span>
                  </>
                ) : (
                  <>
                    <Send size={16} style={{ marginRight: '6px' }} />
                    <span>SEND MESSAGE</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </main>

      <Footer siteSettings={siteSettings} categories={categories} />
    </div>
  );
}
