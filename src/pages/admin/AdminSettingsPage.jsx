import React, { useState, useEffect } from 'react';
import { Settings, Save, CheckCircle2 } from 'lucide-react';
import apiClient from '../../services/apiClient';

const AdminSettingsPage = () => {
  const [settings, setSettings] = useState({
    site_name: 'Keeper Sports',
    contact_email: 'support@keepersports.com',
    contact_phone: '+964 770 000 0000',
    exchange_window_days: 3,
    announcement_text: 'Free shipping on orders over $100 across all cities!'
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    apiClient('/content/settings')
      .then((res) => {
        if (res?.data) setSettings(res.data);
      })
      .catch((e) => console.warn("Using default settings", e));
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    try {
      await apiClient('/content/settings', {
        method: 'PUT',
        body: JSON.stringify(settings)
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      alert(err.message || "Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ maxWidth: '680px' }}>
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 900 }}>Store Settings</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '4px' }}>
          Global website metadata, store contact numbers, and exchange policy rules.
        </p>
      </div>

      <div className="glass-card" style={{ padding: '36px' }}>
        {saved && (
          <div style={{ padding: '12px', backgroundColor: 'rgba(0,229,153,0.1)', color: 'var(--accent-green)', borderRadius: 'var(--radius-md)', display: 'flex', gap: '8px', marginBottom: '20px' }}>
            <CheckCircle2 size={18} />
            <span>Settings saved successfully!</span>
          </div>
        )}

        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Store Brand Name</label>
            <input
              type="text"
              required
              className="form-input"
              value={settings.site_name || ''}
              onChange={(e) => setSettings({ ...settings, site_name: e.target.value })}
            />
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Support Email</label>
            <input
              type="email"
              required
              className="form-input"
              value={settings.contact_email || ''}
              onChange={(e) => setSettings({ ...settings, contact_email: e.target.value })}
            />
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Support Phone & WhatsApp</label>
            <input
              type="text"
              required
              className="form-input"
              value={settings.contact_phone || ''}
              onChange={(e) => setSettings({ ...settings, contact_phone: e.target.value })}
            />
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Size Exchange Window (Days from Delivery)</label>
            <input
              type="number"
              min="1"
              max="30"
              required
              className="form-input"
              value={settings.exchange_window_days || 3}
              onChange={(e) => setSettings({ ...settings, exchange_window_days: parseInt(e.target.value, 10) })}
            />
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Top Banner Announcement Text</label>
            <input
              type="text"
              className="form-input"
              value={settings.announcement_text || ''}
              onChange={(e) => setSettings({ ...settings, announcement_text: e.target.value })}
            />
          </div>

          <button type="submit" disabled={saving} className="btn btn-primary btn-lg" style={{ gap: '8px', marginTop: '10px' }}>
            <Save size={18} />
            <span>{saving ? "Saving Changes..." : "Save Settings"}</span>
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminSettingsPage;
