import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, CheckCircle2, AlertCircle } from 'lucide-react';
import apiClient from '../services/apiClient';
import { useLanguage } from '../context/LanguageContext';

const ContactPage = () => {
  const { t, isRtl } = useLanguage();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg('');
    try {
      await apiClient('/content/contact', {
        method: 'POST',
        body: JSON.stringify({ name, email, phone, message })
      });
      setSuccessMsg(isRtl ? "تم إرسال رسالتك بنجاح! سيتواصل فريقنا معك بأقرب وقت." : "Message sent successfully! Our customer team will reach out to you shortly.");
      setName('');
      setEmail('');
      setPhone('');
      setMessage('');
    } catch (err) {
      setErrorMsg(err.message || "Failed to send message. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ padding: '60px 0 100px' }}>
      <div className="container" style={{ maxWidth: '960px' }}>
        <div style={{ textAlign: 'center', marginBottom: '50px' }}>
          <span className="badge badge-cyan" style={{ marginBottom: '12px' }}>{t('contact')}</span>
          <h1 style={{ fontSize: '38px', fontWeight: 900, marginBottom: '14px' }}>
            {isRtl ? "تواصل مع فريق كيبر سبورتس" : "Get in Touch With Keeper Sports"}
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '15px' }}>
            {isRtl 
              ? "هل لديك استفسار حول مقاس معين، طلب أطقم جماعية، أو استبدال؟ يسعدنا مساعدتك."
              : "Have questions regarding sizing, custom team kits, or exchange procedures? We are here to help."}
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '40px',
          alignItems: 'flex-start'
        }}>
          {/* Contact Details Col */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="glass-card" style={{ padding: '28px', display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
              <MapPin size={24} color="var(--accent-cyan)" style={{ flexShrink: 0, marginTop: '4px' }} />
              <div>
                <h4 style={{ fontSize: '16px', fontWeight: 800, marginBottom: '4px' }}>{isRtl ? "موقع المعرض" : "Store Location"}</h4>
                <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: 1.5 }}>
                  Palestine Street, Near Main Sports Arena, Baghdad, Iraq
                </p>
              </div>
            </div>

            <div className="glass-card" style={{ padding: '28px', display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
              <Phone size={24} color="var(--accent-cyan)" style={{ flexShrink: 0, marginTop: '4px' }} />
              <div>
                <h4 style={{ fontSize: '16px', fontWeight: 800, marginBottom: '4px' }}>{isRtl ? "الهاتف وواتساب" : "Phone & WhatsApp"}</h4>
                <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>+964 770 000 0000</p>
                <span style={{ fontSize: '12px', color: 'var(--accent-green)', fontWeight: 600 }}>Daily 10:00 AM – 11:00 PM</span>
              </div>
            </div>

            <div className="glass-card" style={{ padding: '28px', display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
              <Mail size={24} color="var(--accent-cyan)" style={{ flexShrink: 0, marginTop: '4px' }} />
              <div>
                <h4 style={{ fontSize: '16px', fontWeight: 800, marginBottom: '4px' }}>{isRtl ? "البريد الإلكتروني" : "Direct Email"}</h4>
                <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>support@keepersports.com</p>
              </div>
            </div>
          </div>

          {/* Form Col */}
          <div className="glass-card" style={{ padding: '36px' }}>
            <h3 style={{ fontSize: '20px', fontWeight: 900, marginBottom: '20px' }}>
              {isRtl ? "أرسل رسالة مباشرة" : "Send Us a Direct Message"}
            </h3>

            {successMsg && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '14px',
                backgroundColor: 'rgba(0, 229, 153, 0.12)',
                border: '1px solid rgba(0, 229, 153, 0.3)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--accent-green)',
                fontSize: '14px',
                marginBottom: '20px'
              }}>
                <CheckCircle2 size={18} />
                <span>{successMsg}</span>
              </div>
            )}

            {errorMsg && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '14px',
                backgroundColor: 'rgba(255, 59, 48, 0.12)',
                border: '1px solid rgba(255, 59, 48, 0.3)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--accent-red)',
                fontSize: '14px',
                marginBottom: '20px'
              }}>
                <AlertCircle size={18} />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">{t('fullName')}</label>
                <input
                  type="text"
                  required
                  className="form-input"
                  placeholder="Omar Hassan"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Email Address</label>
                <input
                  type="email"
                  required
                  className="form-input"
                  placeholder="omar@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">{t('phone')}</label>
                <input
                  type="tel"
                  className="form-input"
                  placeholder="0770 000 0000"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">{isRtl ? "نص الرسالة" : "Your Message"}</label>
                <textarea
                  required
                  rows={4}
                  className="form-input"
                  placeholder={isRtl ? "اكتب تفاصيل استفسارك أو طلبك الخاص..." : "Type your inquiry or custom order question..."}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="btn btn-primary btn-lg"
                style={{ gap: '10px', marginTop: '10px' }}
              >
                <span>{submitting ? "Sending..." : (isRtl ? "إرسال الرسالة" : "Send Message")}</span>
                <Send size={16} />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
