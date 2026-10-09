import React, { useState, useEffect } from 'react';
import { Settings, Upload, Save, Loader2, MapPin, Share2, Globe, Image as ImageIcon } from 'lucide-react';
import { adminApi } from '../../api/adminApi';
import { useSite } from '../../context/SiteContext';

export default function AdminSettingsPage() {
  const { refreshSettings } = useSite();
  const [formData, setFormData] = useState({
    site_name: 'Keeper Sports',
    logo_path: '',
    logo_light_path: '',
    phone_number: '',
    email: '',
    whatsapp_number: '',
    instagram_url: '',
    facebook_url: '',
    tiktok_url: '',
    x_url: '',
    youtube_url: '',
    location_name: '',
    location_address: '',
    location_url: '',
    location_description: '',
    location_is_visible: true,
    about_us: '',
    delivery_fee: 0
  });

  const [loading, setLoading] = useState(true);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingLightLogo, setUploadingLightLogo] = useState(false);
  const [saving, setSaving] = useState(false);

  // Toast feedback
  const [toastMessage, setToastMessage] = useState(null);
  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  useEffect(() => {
    Promise.all([
      adminApi.getSettings(),
      adminApi.getLocationSettings().catch(() => null),
      adminApi.getSocialSettings().catch(() => null)
    ]).then(([settingsRes, locRes, socRes]) => {
      const s = settingsRes?.settings || {};
      const loc = locRes?.location || {};
      const soc = socRes?.social || {};

      setFormData({
        site_name: s.site_name || 'Keeper Sports',
        logo_path: s.logo_path || '',
        logo_light_path: s.logo_light_path || s.favicon_path || '',
        phone_number: s.phone_number || '',
        email: s.email || '',
        whatsapp_number: s.whatsapp_number || '',
        instagram_url: soc.instagram?.url || s.instagram_url || '',
        facebook_url: soc.facebook?.url || s.facebook_url || '',
        tiktok_url: soc.tiktok?.url || s.tiktok_url || '',
        x_url: soc.x?.url || s.x_url || '',
        youtube_url: soc.youtube?.url || s.youtube_url || '',
        location_name: loc.store_name || s.location_name || '',
        location_address: loc.full_address || s.full_address || s.location_name || '',
        location_url: loc.google_maps_url || s.location_url || '',
        location_description: loc.description || '',
        location_is_visible: loc.is_visible !== undefined ? loc.is_visible : true,
        about_us: s.about_us || '',
        delivery_fee: s.delivery_fee || 0
      });
      setLoading(false);
    });
  }, []);

  const handleLogoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingLogo(true);
    try {
      const res = await adminApi.uploadMedia(file);
      if (res && res.success && res.url) {
        setFormData((prev) => ({ ...prev, logo_path: res.url }));
        const saveRes = await adminApi.updateSettings({ logo_path: res.url });
        if (saveRes?.success) {
          refreshSettings();
          showToast('Dark/Default logo uploaded and saved!');
        } else {
          showToast('Logo uploaded. Click "Save Settings" to persist.');
        }
      } else {
        showToast(res.message || 'Logo upload failed.');
      }
    } catch {
      showToast('Network error uploading logo.');
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleRemoveLogo = async () => {
    setFormData((prev) => ({ ...prev, logo_path: '' }));
    try {
      await adminApi.updateSettings({ logo_path: null });
      refreshSettings();
      showToast('Store logo removed.');
    } catch {
      showToast('Error removing store logo.');
    }
  };

  const handleLightLogoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingLightLogo(true);
    try {
      const res = await adminApi.uploadMedia(file);
      if (res && res.success && res.url) {
        setFormData((prev) => ({ ...prev, logo_light_path: res.url }));
        const saveRes = await adminApi.updateSettings({ logo_light_path: res.url });
        if (saveRes?.success) {
          refreshSettings();
          showToast('Light mode logo uploaded and saved! Storefront updated in real time.');
        } else {
          showToast('Light logo uploaded. Click "Save Settings" to persist.');
        }
      } else {
        showToast(res.message || 'Light logo upload failed.');
      }
    } catch {
      showToast('Network error uploading light logo.');
    } finally {
      setUploadingLightLogo(false);
    }
  };

  const handleRemoveLightLogo = async () => {
    setFormData((prev) => ({ ...prev, logo_light_path: '' }));
    try {
      await adminApi.updateSettings({ logo_light_path: null });
      refreshSettings();
      showToast('Light mode logo removed.');
    } catch {
      showToast('Error removing light mode logo.');
    }
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      // 1. Update core site settings
      const settingsPayload = {
        site_name: formData.site_name,
        logo_path: formData.logo_path,
        logo_light_path: formData.logo_light_path,
        phone_number: formData.phone_number,
        email: formData.email,
        whatsapp_number: formData.whatsapp_number,
        instagram_url: formData.instagram_url,
        facebook_url: formData.facebook_url,
        tiktok_url: formData.tiktok_url,
        x_url: formData.x_url,
        youtube_url: formData.youtube_url,
        location_name: formData.location_name,
        location_url: formData.location_url,
        about_us: formData.about_us,
        delivery_fee: parseFloat(formData.delivery_fee) || 0
      };

      // 2. Update dedicated Location config
      const locationPayload = {
        store_name: formData.location_name,
        full_address: formData.location_address || formData.location_name,
        google_maps_url: formData.location_url,
        description: formData.location_description,
        is_visible: Boolean(formData.location_is_visible)
      };

      // 3. Update dedicated Social config
      const socialPayload = {
        instagram: { url: formData.instagram_url, is_enabled: Boolean(formData.instagram_url) },
        facebook: { url: formData.facebook_url, is_enabled: Boolean(formData.facebook_url) },
        whatsapp: { url: formData.whatsapp_number ? `https://wa.me/${formData.whatsapp_number.replace(/[^0-9]/g, '')}` : '', is_enabled: Boolean(formData.whatsapp_number) },
        x: { url: formData.x_url, is_enabled: Boolean(formData.x_url) },
        youtube: { url: formData.youtube_url, is_enabled: Boolean(formData.youtube_url) },
        tiktok: { url: formData.tiktok_url, is_enabled: Boolean(formData.tiktok_url) }
      };

      await Promise.all([
        adminApi.updateSettings(settingsPayload),
        adminApi.updateLocationSettings(locationPayload).catch(() => null),
        adminApi.updateSocialSettings(socialPayload).catch(() => null)
      ]);

      refreshSettings();
      showToast('Store settings updated! Public storefront updated in real time.');
    } catch {
      showToast('Network error saving settings.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="ks-admin-content-loading">
        <Loader2 size={24} className="ks-spin-icon" />
        <span>Loading store settings...</span>
      </div>
    );
  }

  return (
    <div className="ks-admin-page-container">
      {/* Toast Feedback */}
      {toastMessage && (
        <div className="ks-admin-toast" role="status">
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="ks-admin-header-row">
        <div>
          <span className="ks-admin-header-eyebrow">STORE CONFIGURATION</span>
          <h1 className="ks-admin-page-title">Global Site Settings</h1>
        </div>
      </div>

      <form onSubmit={handleSaveSettings} className="ks-admin-form">
        {/* SECTION 1: BRAND IDENTITY & LOGO */}
        <section className="ks-admin-panel" style={{ marginBottom: '28px' }} aria-label="Brand Identity">
          <div className="ks-admin-panel-header">
            <div>
              <h2 className="ks-admin-panel-title">Brand Identity &amp; Logo</h2>
              <p className="ks-admin-panel-desc">Visual identity displayed in header, footer, and checkout.</p>
            </div>
          </div>

          <div className="ks-admin-panel-body">
            <div className="ks-form-row">
              <div className="ks-form-group">
                <label className="ks-form-label">Store Brand Name</label>
                <input
                  type="text"
                  value={formData.site_name}
                  onChange={(e) => setFormData({ ...formData, site_name: e.target.value })}
                  className="ks-admin-input"
                  required
                />
              </div>

              <div className="ks-form-group">
                <label className="ks-form-label">Store Logo</label>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <label className="ks-admin-btn-secondary" style={{ cursor: 'pointer', flexShrink: 0 }}>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      style={{ display: 'none' }}
                      disabled={uploadingLogo}
                    />
                    {uploadingLogo ? (
                      <>
                        <Loader2 size={15} className="ks-spin-icon" />
                        <span>Uploading...</span>
                      </>
                    ) : (
                      <>
                        <Upload size={15} />
                        <span>Upload File</span>
                      </>
                    )}
                  </label>

                  <input
                    type="text"
                    placeholder="or enter Logo CDN URL"
                    value={formData.logo_path || ''}
                    onChange={(e) => setFormData({ ...formData, logo_path: e.target.value })}
                    className="ks-admin-input"
                    style={{ flex: 1 }}
                  />
                </div>
              </div>
            </div>

            {formData.logo_path && (
              <div className="ks-settings-logo-preview">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span className="ks-preview-tag">STORE LOGO PREVIEW (DARK / DEFAULT):</span>
                  <button
                    type="button"
                    onClick={handleRemoveLogo}
                    className="ks-admin-btn-secondary"
                    style={{ fontSize: '0.8rem', padding: '4px 10px', height: 'auto', color: 'var(--ks-error-red)' }}
                  >
                    Remove Logo
                  </button>
                </div>
                <div className="ks-logo-box">
                  <img src={formData.logo_path} alt="Store Logo Preview" className="ks-logo-preview-img" />
                </div>
              </div>
            )}

            {/* Light Mode Specific Logo Field */}
            <div className="ks-form-row" style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px solid var(--ks-divider-line, #222)' }}>
              <div className="ks-form-group" style={{ width: '100%' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <label className="ks-form-label" style={{ margin: 0 }}>Store Logo (Light Mode)</label>
                  <span style={{ fontSize: '12px', color: 'var(--ks-text-muted)' }}>
                    Switches automatically when visitor toggles to Light Mode
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <label className="ks-admin-btn-secondary" style={{ cursor: 'pointer', flexShrink: 0 }}>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLightLogoUpload}
                      style={{ display: 'none' }}
                      disabled={uploadingLightLogo}
                    />
                    {uploadingLightLogo ? (
                      <>
                        <Loader2 size={15} className="ks-spin-icon" />
                        <span>Uploading...</span>
                      </>
                    ) : (
                      <>
                        <Upload size={15} />
                        <span>Upload Light Logo</span>
                      </>
                    )}
                  </label>

                  <input
                    type="text"
                    placeholder="or enter Light Mode Logo CDN URL"
                    value={formData.logo_light_path || ''}
                    onChange={(e) => setFormData({ ...formData, logo_light_path: e.target.value })}
                    className="ks-admin-input"
                    style={{ flex: 1 }}
                  />
                </div>
              </div>
            </div>

            {formData.logo_light_path && (
              <div className="ks-settings-logo-preview" style={{ marginTop: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span className="ks-preview-tag">LIGHT MODE LOGO PREVIEW (ON WHITE CANVAS):</span>
                  <button
                    type="button"
                    onClick={handleRemoveLightLogo}
                    className="ks-admin-btn-secondary"
                    style={{ fontSize: '0.8rem', padding: '4px 10px', height: 'auto', color: 'var(--ks-error-red)' }}
                  >
                    Remove Light Logo
                  </button>
                </div>
                <div className="ks-logo-box" style={{ backgroundColor: '#FFFFFF', padding: '16px', borderRadius: '12px', border: '1px solid #E5E5E5' }}>
                  <img src={formData.logo_light_path} alt="Light Mode Logo Preview" className="ks-logo-preview-img" style={{ maxHeight: '56px' }} />
                </div>
              </div>
            )}
          </div>
        </section>

        {/* SECTION 2: STORE LOCATION & GOOGLE MAPS */}
        <section className="ks-admin-panel" style={{ marginBottom: '28px' }} aria-label="Store Location">
          <div className="ks-admin-panel-header">
            <div>
              <h2 className="ks-admin-panel-title">Store Location &amp; Google Maps</h2>
              <p className="ks-admin-panel-desc">Controls the dedicated Location section and directions link on the storefront.</p>
            </div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}>
              <input
                type="checkbox"
                checked={formData.location_is_visible}
                onChange={(e) => setFormData({ ...formData, location_is_visible: e.target.checked })}
              />
              <span>Visible on Storefront</span>
            </label>
          </div>

          <div className="ks-admin-panel-body">
            <div className="ks-form-row">
              <div className="ks-form-group">
                <label className="ks-form-label">Store Location Name</label>
                <input
                  type="text"
                  placeholder="e.g. Keeper Sports Flagship"
                  value={formData.location_name || ''}
                  onChange={(e) => setFormData({ ...formData, location_name: e.target.value })}
                  className="ks-admin-input"
                />
              </div>

              <div className="ks-form-group">
                <label className="ks-form-label">Full Street Address</label>
                <input
                  type="text"
                  placeholder="e.g. Mar Elias Street, Commercial District, Beirut, Lebanon"
                  value={formData.location_address || ''}
                  onChange={(e) => setFormData({ ...formData, location_address: e.target.value })}
                  className="ks-admin-input"
                />
              </div>
            </div>

            <div className="ks-form-row">
              <div className="ks-form-group">
                <label className="ks-form-label">Google Maps URL</label>
                <input
                  type="url"
                  placeholder="https://maps.google.com/?q=..."
                  value={formData.location_url || ''}
                  onChange={(e) => setFormData({ ...formData, location_url: e.target.value })}
                  className="ks-admin-input"
                />
              </div>

              <div className="ks-form-group">
                <label className="ks-form-label">Location Description / Store Hours</label>
                <input
                  type="text"
                  placeholder="e.g. Open Monday – Saturday: 10:00 AM – 8:00 PM"
                  value={formData.location_description || ''}
                  onChange={(e) => setFormData({ ...formData, location_description: e.target.value })}
                  className="ks-admin-input"
                />
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 3: SOCIAL MEDIA CHANNELS */}
        <section className="ks-admin-panel" style={{ marginBottom: '28px' }} aria-label="Social Media">
          <div className="ks-admin-panel-header">
            <div>
              <h2 className="ks-admin-panel-title">Social Media Platforms</h2>
              <p className="ks-admin-panel-desc">Configures the animated Social Media cards section before the footer.</p>
            </div>
          </div>

          <div className="ks-admin-panel-body">
            <div className="ks-form-row">
              <div className="ks-form-group">
                <label className="ks-form-label">WhatsApp Number / Link</label>
                <input
                  type="text"
                  placeholder="+961 70 000 000"
                  value={formData.whatsapp_number || ''}
                  onChange={(e) => setFormData({ ...formData, whatsapp_number: e.target.value })}
                  className="ks-admin-input"
                />
              </div>

              <div className="ks-form-group">
                <label className="ks-form-label">Instagram Profile URL</label>
                <input
                  type="text"
                  placeholder="https://instagram.com/keepersportlb"
                  value={formData.instagram_url || ''}
                  onChange={(e) => setFormData({ ...formData, instagram_url: e.target.value })}
                  className="ks-admin-input"
                />
              </div>
            </div>

            <div className="ks-form-row">
              <div className="ks-form-group">
                <label className="ks-form-label">Facebook Page URL</label>
                <input
                  type="text"
                  placeholder="https://facebook.com/keepersportlb"
                  value={formData.facebook_url || ''}
                  onChange={(e) => setFormData({ ...formData, facebook_url: e.target.value })}
                  className="ks-admin-input"
                />
              </div>

              <div className="ks-form-group">
                <label className="ks-form-label">YouTube Channel URL</label>
                <input
                  type="text"
                  placeholder="https://youtube.com/@keepersportlb"
                  value={formData.youtube_url || ''}
                  onChange={(e) => setFormData({ ...formData, youtube_url: e.target.value })}
                  className="ks-admin-input"
                />
              </div>
            </div>

            <div className="ks-form-row">
              <div className="ks-form-group">
                <label className="ks-form-label">X (Twitter) Profile URL</label>
                <input
                  type="text"
                  placeholder="https://x.com/keepersportlb"
                  value={formData.x_url || ''}
                  onChange={(e) => setFormData({ ...formData, x_url: e.target.value })}
                  className="ks-admin-input"
                />
              </div>

              <div className="ks-form-group">
                <label className="ks-form-label">TikTok Profile URL</label>
                <input
                  type="text"
                  placeholder="https://tiktok.com/@keepersportlb"
                  value={formData.tiktok_url || ''}
                  onChange={(e) => setFormData({ ...formData, tiktok_url: e.target.value })}
                  className="ks-admin-input"
                />
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 4: COMMERCE & SUPPORT RULES */}
        <section className="ks-admin-panel" style={{ marginBottom: '28px' }} aria-label="Commerce Rules">
          <div className="ks-admin-panel-header">
            <div>
              <h2 className="ks-admin-panel-title">Commerce &amp; Support Contact</h2>
              <p className="ks-admin-panel-desc">Shipping rates and primary support lines.</p>
            </div>
          </div>

          <div className="ks-admin-panel-body">
            <div className="ks-form-row">
              <div className="ks-form-group">
                <label className="ks-form-label">Flat Delivery Fee ($ USD)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.delivery_fee || 0}
                  onChange={(e) => setFormData({ ...formData, delivery_fee: e.target.value })}
                  className="ks-admin-input"
                  required
                />
              </div>

              <div className="ks-form-group">
                <label className="ks-form-label">Customer Support Phone</label>
                <input
                  type="text"
                  placeholder="+961 70 000 000"
                  value={formData.phone_number || ''}
                  onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                  className="ks-admin-input"
                />
              </div>

              <div className="ks-form-group">
                <label className="ks-form-label">Support Email</label>
                <input
                  type="email"
                  placeholder="contact@keepersportlb.com"
                  value={formData.email || ''}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="ks-admin-input"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Save Bar */}
        <div className="ks-admin-save-bar">
          <button
            type="submit"
            disabled={saving}
            className="ks-admin-btn-primary is-large"
          >
            {saving ? (
              <>
                <Loader2 size={16} className="ks-spin-icon" />
                <span>Saving All Settings...</span>
              </>
            ) : (
              <>
                <Save size={16} />
                <span>Save All Settings</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
