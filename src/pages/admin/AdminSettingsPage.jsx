import { Settings, Upload, Save, Loader2, Image as ImageIcon } from 'lucide-react';
import { adminApi } from '../../api/adminApi';
import { useSite } from '../../context/SiteContext';

export default function AdminSettingsPage() {
  const { refreshSettings } = useSite();
  const [formData, setFormData] = useState({
    site_name: 'Keeper Sports',
    logo_path: '',
    phone_number: '',
    email: '',
    whatsapp_number: '',
    instagram_url: '',
    facebook_url: '',
    tiktok_url: '',
    x_url: '',
    location_name: '',
    location_url: '',
    about_us: '',
    delivery_fee: 0
  });

  const [loading, setLoading] = useState(true);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [saving, setSaving] = useState(false);

  // Toast
  const [toastMessage, setToastMessage] = useState(null);
  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  useEffect(() => {
    adminApi.getSettings().then((res) => {
      if (res && res.success && res.settings) {
        setFormData((prev) => ({
          ...prev,
          ...res.settings
        }));
      }
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
        // Immediately persist logo to site_settings so it is never lost on refresh
        const saveRes = await adminApi.updateSettings({ logo_path: res.url });
        if (saveRes?.success) {
          refreshSettings();
          showToast('Logo uploaded and saved! Storefront updated in real time.');
        } else {
          showToast('Logo uploaded to storage. Click "Save Settings" to persist.');
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
      showToast('Store logo removed. Neutral brand mark will be used.');
    } catch {
      showToast('Error removing store logo.');
    }
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await adminApi.updateSettings({
        ...formData,
        delivery_fee: parseFloat(formData.delivery_fee) || 0
      });

      if (res && res.success) {
        if (res.settings) {
          setFormData((prev) => ({ ...prev, ...res.settings }));
        }
        refreshSettings();
        showToast('Store settings updated. Public website updated in real time.');
      } else {
        showToast(res.message || 'Failed to save settings.');
      }
    } catch {
      showToast('Network error saving settings.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="ks-admin-page-container">
        <div className="ks-admin-table-loading">Loading site settings...</div>
      </div>
    );
  }

  return (
    <div className="ks-admin-page-container">
      {toastMessage && (
        <div className="ks-admin-toast" role="status">
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="ks-admin-header-row">
        <div>
          <span className="ks-admin-header-eyebrow">CONFIGURATION &amp; BRANDING</span>
          <h1 className="ks-admin-page-title">Store Settings</h1>
        </div>
      </div>

      <form onSubmit={handleSaveSettings}>
        {/* SECTION 1: BRANDING & LOGO */}
        <section className="ks-admin-panel" style={{ marginBottom: '28px' }} aria-label="Branding">
          <div className="ks-admin-panel-header">
            <div>
              <h2 className="ks-admin-panel-title">Brand Identity &amp; Logo</h2>
              <p className="ks-admin-panel-desc">
                The logo uploaded here will immediately display in the public Navbar and Footer.
              </p>
            </div>
          </div>

          <div className="ks-admin-panel-body">
            <div className="ks-form-row">
              <div className="ks-form-group">
                <label className="ks-form-label">Store Name</label>
                <input
                  type="text"
                  value={formData.site_name || ''}
                  onChange={(e) => setFormData({ ...formData, site_name: e.target.value })}
                  className="ks-admin-input"
                  required
                />
              </div>

              <div className="ks-form-group">
                <label className="ks-form-label">Store Logo Upload</label>
                <div className="ks-admin-upload-field">
                  <input
                    type="file"
                    accept="image/*"
                    id="settings-logo-input"
                    onChange={handleLogoUpload}
                    style={{ display: 'none' }}
                  />
                  <label htmlFor="settings-logo-input" className="ks-admin-btn-secondary" style={{ cursor: 'pointer' }}>
                    {uploadingLogo ? (
                      <>
                        <Loader2 size={15} className="ks-spin-icon" />
                        <span>Uploading...</span>
                      </>
                    ) : (
                      <>
                        <Upload size={15} />
                        <span>Upload Logo to Storage</span>
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
                  <span className="ks-preview-tag">CURRENT STORE LOGO PREVIEW:</span>
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
          </div>
        </section>

        {/* SECTION 2: INVENTORY & COMMERCE RULES */}
        <section className="ks-admin-panel" style={{ marginBottom: '28px' }} aria-label="Commerce Rules">
          <div className="ks-admin-panel-header">
            <div>
              <h2 className="ks-admin-panel-title">Inventory &amp; Shipping Rules</h2>
              <p className="ks-admin-panel-desc">
                Threshold triggers low-stock badges across both Storefront cards and the Admin dashboard.
              </p>
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
            </div>
          </div>
        </section>

        {/* SECTION 3: CONTACT & SOCIAL LINKS */}
        <section className="ks-admin-panel" style={{ marginBottom: '28px' }} aria-label="Contact Information">
          <div className="ks-admin-panel-header">
            <div>
              <h2 className="ks-admin-panel-title">Contact &amp; Social Links</h2>
              <p className="ks-admin-panel-desc">Displayed on customer support touchpoints and footer.</p>
            </div>
          </div>

          <div className="ks-admin-panel-body">
            <div className="ks-form-row">
              <div className="ks-form-group">
                <label className="ks-form-label">Phone Number</label>
                <input
                  type="text"
                  placeholder="+961 70 000 000"
                  value={formData.phone_number || ''}
                  onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                  className="ks-admin-input"
                />
              </div>

              <div className="ks-form-group">
                <label className="ks-form-label">WhatsApp Number</label>
                <input
                  type="text"
                  placeholder="+961 70 000 000"
                  value={formData.whatsapp_number || ''}
                  onChange={(e) => setFormData({ ...formData, whatsapp_number: e.target.value })}
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

            <div className="ks-form-row">
              <div className="ks-form-group">
                <label className="ks-form-label">Instagram URL</label>
                <input
                  type="text"
                  placeholder="https://instagram.com/keepersportlb"
                  value={formData.instagram_url || ''}
                  onChange={(e) => setFormData({ ...formData, instagram_url: e.target.value })}
                  className="ks-admin-input"
                />
              </div>

              <div className="ks-form-group">
                <label className="ks-form-label">TikTok URL</label>
                <input
                  type="text"
                  placeholder="https://tiktok.com/@keepersportlb"
                  value={formData.tiktok_url || ''}
                  onChange={(e) => setFormData({ ...formData, tiktok_url: e.target.value })}
                  className="ks-admin-input"
                />
              </div>

              <div className="ks-form-group">
                <label className="ks-form-label">Facebook URL</label>
                <input
                  type="text"
                  placeholder="https://facebook.com/keepersportlb"
                  value={formData.facebook_url || ''}
                  onChange={(e) => setFormData({ ...formData, facebook_url: e.target.value })}
                  className="ks-admin-input"
                />
              </div>
            </div>

            <div className="ks-form-group">
              <label className="ks-form-label">Store Location Description</label>
              <input
                type="text"
                placeholder="Beirut, Lebanon"
                value={formData.location_name || ''}
                onChange={(e) => setFormData({ ...formData, location_name: e.target.value })}
                className="ks-admin-input"
              />
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
                <span>Saving Settings...</span>
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
