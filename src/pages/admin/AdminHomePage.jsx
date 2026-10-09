import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Sliders,
  Plus,
  Edit2,
  Trash2,
  Upload,
  Check,
  X,
  Eye,
  Loader2,
  Image as ImageIcon,
  Video
} from 'lucide-react';
import { adminApi } from '../../api/adminApi';
import ConfirmModal from '../../components/admin/ConfirmModal';

export default function AdminHomePage() {
  const [stats, setStats] = useState({ totalSlides: 0, activeSlides: 0, totalOffers: 0, activeOffers: 0 });
  const [slides, setSlides] = useState([]);
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Hero Slide Modal State
  const [slideModalOpen, setSlideModalOpen] = useState(false);
  const [editingSlide, setEditingSlide] = useState(null);
  const [slideFormData, setSlideFormData] = useState({
    title: '',
    subtitle: '',
    media_type: 'image',
    media_path: '',
    fallback_image_path: '',
    primary_button_text: '',
    primary_button_route: '',
    secondary_button_text: '',
    secondary_button_route: '',
    duration_seconds: 5,
    sort_order: 0,
    is_active: true
  });
  const [uploadingSlideMedia, setUploadingSlideMedia] = useState(false);
  const [slideSaveLoading, setSlideSaveLoading] = useState(false);

  // Offer Bar Modal State
  const [offerModalOpen, setOfferModalOpen] = useState(false);
  const [editingOffer, setEditingOffer] = useState(null);
  const [offerFormData, setOfferFormData] = useState({
    text: '',
    route: '',
    duration_seconds: 4,
    sort_order: 0,
    is_active: true,
    starts_at: '',
    ends_at: ''
  });
  const [offerSaveLoading, setOfferSaveLoading] = useState(false);

  // Homepage Story State
  const [storyData, setStoryData] = useState({
    is_active: true,
    image_url: '',
    heading: '',
    subheading: '',
    button_text: 'Shop Collection',
    button_link: '/products'
  });
  const [storySaving, setStorySaving] = useState(false);
  const [uploadingStoryMedia, setUploadingStoryMedia] = useState(false);

  // Store Offers State
  const [storeOffers, setStoreOffers] = useState([]);
  const [storeOfferModalOpen, setStoreOfferModalOpen] = useState(false);
  const [editingStoreOffer, setEditingStoreOffer] = useState(null);
  const [storeOfferFormData, setStoreOfferFormData] = useState({
    title: '',
    description: '',
    discount_type: 'percentage',
    discount_value: 10,
    free_delivery: false,
    starts_at: '',
    ends_at: '',
    is_visible: true
  });
  const [storeOfferSaving, setStoreOfferSaving] = useState(false);

  // Confirm Delete Modal State
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    type: null, // 'slide', 'offer', 'storeOffer'
    id: null,
    title: '',
    message: ''
  });
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Toast Notice State
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Load All Home Data
  const loadData = async () => {
    setLoading(true);
    try {
      const [overviewRes, slidesRes, offersRes, storyRes, storeOffersRes] = await Promise.all([
        adminApi.getHomeOverview(),
        adminApi.getHeroSlides(),
        adminApi.getOfferBars(),
        adminApi.getHomepageStory().catch(() => null),
        adminApi.getOffers().catch(() => null)
      ]);

      if (overviewRes?.success) setStats(overviewRes.stats);
      if (slidesRes?.success) setSlides(slidesRes.slides);
      if (offersRes?.success) setOffers(offersRes.offers);
      if (storyRes?.success && storyRes.story) setStoryData(storyRes.story);
      if (storeOffersRes?.success && Array.isArray(storeOffersRes.offers)) setStoreOffers(storeOffersRes.offers);
    } catch (err) {
      console.error('Error loading home data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Handle Hero Slide File Upload
  const handleSlideFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingSlideMedia(true);
    try {
      const res = await adminApi.uploadMedia(file);
      if (res && res.success && res.url) {
        const isVid = file.type.startsWith('video/');
        setSlideFormData((prev) => ({
          ...prev,
          media_path: res.url,
          media_type: isVid ? 'video' : 'image'
        }));
        showToast('Hero media uploaded successfully.');
      } else {
        showToast(res.message || 'Media upload failed.');
      }
    } catch {
      showToast('Network error during upload.');
    } finally {
      setUploadingSlideMedia(false);
    }
  };

  // Open Hero Slide Modal for Create or Edit
  const openSlideModal = (slide = null) => {
    if (slide) {
      setEditingSlide(slide);
      setSlideFormData({
        title: slide.title || '',
        subtitle: slide.subtitle || '',
        media_type: slide.media_type || 'image',
        media_path: slide.media_path || '',
        fallback_image_path: slide.fallback_image_path || '',
        primary_button_text: slide.primary_button_text || '',
        primary_button_route: slide.primary_button_route || '',
        secondary_button_text: slide.secondary_button_text || '',
        secondary_button_route: slide.secondary_button_route || '',
        duration_seconds: slide.duration_seconds || 5,
        sort_order: slide.sort_order || 0,
        is_active: Boolean(slide.is_active)
      });
    } else {
      setEditingSlide(null);
      setSlideFormData({
        title: '',
        subtitle: '',
        media_type: 'image',
        media_path: '',
        fallback_image_path: '',
        primary_button_text: '',
        primary_button_route: '',
        secondary_button_text: '',
        secondary_button_route: '',
        duration_seconds: 5,
        sort_order: slides.length,
        is_active: true
      });
    }
    setSlideModalOpen(true);
  };

  // Save Hero Slide
  const handleSaveSlide = async (e) => {
    e.preventDefault();
    if (!slideFormData.media_path.trim()) {
      showToast('Media file or URL is required for hero slide.');
      return;
    }

    setSlideSaveLoading(true);
    try {
      let res;
      if (editingSlide) {
        res = await adminApi.updateHeroSlide(editingSlide.id, slideFormData);
      } else {
        res = await adminApi.createHeroSlide(slideFormData);
      }

      if (res && res.success) {
        showToast(res.message || 'Hero slide saved successfully.');
        setSlideModalOpen(false);
        loadData();
      } else {
        showToast(res.message || 'Failed to save slide.');
      }
    } catch {
      showToast('Network error saving hero slide.');
    } finally {
      setSlideSaveLoading(false);
    }
  };

  // Toggle Slide Active State
  const handleToggleSlide = async (slide) => {
    try {
      const res = await adminApi.updateHeroSlide(slide.id, { is_active: !slide.is_active });
      if (res && res.success) {
        setSlides((prev) =>
          prev.map((s) => (s.id === slide.id ? { ...s, is_active: !s.is_active } : s))
        );
        setStats((prev) => ({
          ...prev,
          activeSlides: !slide.is_active ? prev.activeSlides + 1 : prev.activeSlides - 1
        }));
        showToast(`Slide ${!slide.is_active ? 'activated' : 'deactivated'}.`);
      }
    } catch {
      showToast('Error toggling slide status.');
    }
  };

  // Open Offer Modal
  const openOfferModal = (offer = null) => {
    if (offer) {
      setEditingOffer(offer);
      setOfferFormData({
        text: offer.text || '',
        route: offer.route || '',
        duration_seconds: offer.duration_seconds || 4,
        sort_order: offer.sort_order || 0,
        is_active: Boolean(offer.is_active),
        starts_at: offer.starts_at ? offer.starts_at.slice(0, 16) : '',
        ends_at: offer.ends_at ? offer.ends_at.slice(0, 16) : ''
      });
    } else {
      setEditingOffer(null);
      setOfferFormData({
        text: '',
        route: '',
        duration_seconds: 4,
        sort_order: offers.length,
        is_active: true,
        starts_at: '',
        ends_at: ''
      });
    }
    setOfferModalOpen(true);
  };

  // Save Offer Bar
  const handleSaveOffer = async (e) => {
    e.preventDefault();
    if (!offerFormData.text.trim()) {
      showToast('Offer announcement text is required.');
      return;
    }

    setOfferSaveLoading(true);
    try {
      let res;
      if (editingOffer) {
        res = await adminApi.updateOfferBar(editingOffer.id, offerFormData);
      } else {
        res = await adminApi.createOfferBar(offerFormData);
      }

      if (res && res.success) {
        showToast(res.message || 'Offer saved successfully.');
        setOfferModalOpen(false);
        loadData();
      } else {
        showToast(res.message || 'Failed to save offer.');
      }
    } catch {
      showToast('Network error saving offer.');
    } finally {
      setOfferSaveLoading(false);
    }
  };

  // Toggle Offer Active State
  const handleToggleOffer = async (offer) => {
    try {
      const res = await adminApi.updateOfferBar(offer.id, { is_active: !offer.is_active });
      if (res && res.success) {
        setOffers((prev) =>
          prev.map((o) => (o.id === offer.id ? { ...o, is_active: !o.is_active } : o))
        );
        setStats((prev) => ({
          ...prev,
          activeOffers: !offer.is_active ? prev.activeOffers + 1 : prev.activeOffers - 1
        }));
        showToast(`Offer ${!offer.is_active ? 'activated' : 'deactivated'}.`);
      }
    } catch {
      showToast('Error toggling offer status.');
    }
  };

  // Homepage Story File Upload
  const handleStoryImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingStoryMedia(true);
    try {
      const res = await adminApi.uploadMedia(file);
      if (res && res.success && res.url) {
        setStoryData((prev) => ({ ...prev, image_url: res.url }));
        showToast('Story image uploaded successfully.');
      } else {
        showToast(res.message || 'Media upload failed.');
      }
    } catch {
      showToast('Network error uploading image.');
    } finally {
      setUploadingStoryMedia(false);
    }
  };

  // Save Homepage Story
  const handleSaveStory = async (e) => {
    e.preventDefault();
    setStorySaving(true);
    try {
      const res = await adminApi.updateHomepageStory(storyData);
      if (res && res.success) {
        showToast('Homepage Story saved successfully! Public storefront updated in real time.');
      } else {
        showToast(res.message || 'Failed to save Homepage Story.');
      }
    } catch {
      showToast('Network error saving story.');
    } finally {
      setStorySaving(false);
    }
  };

  // Store Offer Handlers
  const openStoreOfferModal = (offer = null) => {
    setEditingStoreOffer(offer);
    if (offer) {
      setStoreOfferFormData({
        title: offer.title || '',
        description: offer.description || '',
        discount_type: offer.discount_type || 'percentage',
        discount_value: offer.discount_value !== null ? offer.discount_value : 10,
        free_delivery: Boolean(offer.free_delivery),
        starts_at: offer.starts_at || '',
        ends_at: offer.ends_at || '',
        is_visible: offer.is_visible !== false
      });
    } else {
      setStoreOfferFormData({
        title: '',
        description: '',
        discount_type: 'percentage',
        discount_value: 10,
        free_delivery: false,
        starts_at: '',
        ends_at: '',
        is_visible: true
      });
    }
    setStoreOfferModalOpen(true);
  };

  const handleSaveStoreOffer = async (e) => {
    e.preventDefault();
    setStoreOfferSaving(true);
    try {
      let res;
      if (editingStoreOffer) {
        res = await adminApi.updateOffer(editingStoreOffer.id, storeOfferFormData);
      } else {
        res = await adminApi.createOffer(storeOfferFormData);
      }

      if (res && res.success) {
        showToast(res.message || 'Store offer saved successfully.');
        setStoreOfferModalOpen(false);
        loadData();
      } else {
        showToast(res.message || 'Failed to save offer.');
      }
    } catch {
      showToast('Network error saving offer.');
    } finally {
      setStoreOfferSaving(false);
    }
  };

  const handleToggleStoreOffer = async (offer) => {
    try {
      const res = await adminApi.updateOffer(offer.id, { is_visible: !offer.is_visible });
      if (res && res.success) {
        showToast(`Offer ${!offer.is_visible ? 'activated' : 'deactivated'}.`);
        loadData();
      }
    } catch {
      showToast('Error toggling offer visibility.');
    }
  };

  // Confirm Delete Action
  const handleConfirmDelete = async () => {
    setDeleteLoading(true);
    try {
      let res;
      if (deleteModal.type === 'slide') {
        res = await adminApi.deleteHeroSlide(deleteModal.id);
      } else if (deleteModal.type === 'offer') {
        res = await adminApi.deleteOfferBar(deleteModal.id);
      } else if (deleteModal.type === 'storeOffer') {
        res = await adminApi.deleteOffer(deleteModal.id);
      }

      if (res && res.success) {
        showToast(res.message || 'Deleted successfully.');
        setDeleteModal({ isOpen: false, type: null, id: null, title: '', message: '' });
        loadData();
      } else {
        showToast(res.message || 'Failed to delete.');
      }
    } catch {
      showToast('Network error during delete.');
    } finally {
      setDeleteLoading(false);
    }
  };

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
          <span className="ks-admin-header-eyebrow">STOREFRONT HERO SHOWCASE</span>
          <h1 className="ks-admin-page-title">Hero &amp; Announcement Banners</h1>
        </div>
      </div>

      {/* OVERVIEW STAT CARDS */}
      <div className="ks-admin-stats-grid">
        <div className="ks-admin-stat-card">
          <div className="ks-stat-card-icon-wrap is-neutral">
            <Sliders size={20} />
          </div>
          <div className="ks-stat-card-content">
            <span className="ks-stat-card-label">HERO SLIDES</span>
            <div className="ks-stat-card-value">{loading ? '—' : stats.totalSlides}</div>
            <div className="ks-stat-card-subtext">{stats.activeSlides} Active</div>
          </div>
        </div>

        <div className="ks-admin-stat-card">
          <div className="ks-stat-card-icon-wrap is-neutral">
            <Sparkles size={20} />
          </div>
          <div className="ks-stat-card-content">
            <span className="ks-stat-card-label">OFFERS BAR</span>
            <div className="ks-stat-card-value">{loading ? '—' : stats.totalOffers}</div>
            <div className="ks-stat-card-subtext">{stats.activeOffers} Active</div>
          </div>
        </div>
      </div>

      {/* SECTION 1: HERO SLIDES MANAGEMENT */}
      <section className="ks-admin-panel" style={{ marginBottom: '32px' }} aria-label="Hero Slides">
        <div className="ks-admin-panel-header">
          <div>
            <h2 className="ks-admin-panel-title">Hero Carousel Slides</h2>
            <p className="ks-admin-panel-desc">Controls the main rotating hero banner on the public storefront.</p>
          </div>

          <button
            type="button"
            onClick={() => openSlideModal(null)}
            className="ks-admin-btn-primary"
          >
            <Plus size={15} />
            <span>Add Hero Slide</span>
          </button>
        </div>

        <div className="ks-admin-panel-body">
          {loading ? (
            <div className="ks-admin-table-loading">Loading hero slides...</div>
          ) : slides.length === 0 ? (
            <div className="ks-admin-empty-notice">
              <span>No hero slides created yet. Add your first slide to display on the storefront.</span>
            </div>
          ) : (
            <div className="ks-admin-table-responsive">
              <table className="ks-admin-table">
                <thead>
                  <tr>
                    <th>Media</th>
                    <th>Title &amp; Subtitle</th>
                    <th>Actions</th>
                    <th>Sort</th>
                    <th>Status</th>
                    <th>Controls</th>
                  </tr>
                </thead>
                <tbody>
                  {slides.map((s) => (
                    <tr key={s.id}>
                      <td style={{ width: '80px' }}>
                        <div className="ks-table-media-thumb">
                          {s.media_type === 'video' ? (
                            <Video size={20} className="ks-media-type-icon" />
                          ) : (
                            <img src={s.media_path} alt={s.title || 'Slide'} onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                          )}
                        </div>
                      </td>
                      <td>
                        <div className="ks-table-strong">{s.title || '(No Title)'}</div>
                        <div className="ks-table-subtext">{s.subtitle || '—'}</div>
                      </td>
                      <td>
                        <div className="ks-table-subtext">
                          Primary: {s.primary_button_text ? `${s.primary_button_text} (${s.primary_button_route})` : 'None'}
                        </div>
                        {s.secondary_button_text && (
                          <div className="ks-table-subtext">
                            Sec: {s.secondary_button_text} ({s.secondary_button_route})
                          </div>
                        )}
                      </td>
                      <td>{s.sort_order}</td>
                      <td>
                        <button
                          type="button"
                          onClick={() => handleToggleSlide(s)}
                          className={`ks-toggle-switch ${s.is_active ? 'is-active' : ''}`}
                          aria-label={s.is_active ? 'Deactivate slide' : 'Activate slide'}
                        >
                          <span className="ks-toggle-slider" />
                        </button>
                      </td>
                      <td>
                        <div className="ks-table-actions-cell">
                          <button
                            type="button"
                            onClick={() => openSlideModal(s)}
                            className="ks-table-icon-btn"
                            title="Edit Slide"
                          >
                            <Edit2 size={15} />
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              setDeleteModal({
                                isOpen: true,
                                type: 'slide',
                                id: s.id,
                                title: 'Delete Hero Slide',
                                message: `Are you sure you want to delete slide "${s.title || 'Untitled'}"?`
                              })
                            }
                            className="ks-table-icon-btn is-danger"
                            title="Delete Slide"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>

      {/* SECTION 2: OFFERS BAR MANAGEMENT */}
      <section className="ks-admin-panel" aria-label="Offers Bar Announcements">
        <div className="ks-admin-panel-header">
          <div>
            <h2 className="ks-admin-panel-title">Top Offers Bar Announcements</h2>
            <p className="ks-admin-panel-desc">Controls the black &amp; red ticker banner displayed above the public Navbar.</p>
          </div>

          <button
            type="button"
            onClick={() => openOfferModal(null)}
            className="ks-admin-btn-primary"
          >
            <Plus size={15} />
            <span>Add Announcement</span>
          </button>
        </div>

        <div className="ks-admin-panel-body">
          {loading ? (
            <div className="ks-admin-table-loading">Loading offers...</div>
          ) : offers.length === 0 ? (
            <div className="ks-admin-empty-notice">
              <span>No top announcements configured yet.</span>
            </div>
          ) : (
            <div className="ks-admin-table-responsive">
              <table className="ks-admin-table">
                <thead>
                  <tr>
                    <th>Announcement Text</th>
                    <th>Target Route</th>
                    <th>Sort</th>
                    <th>Status</th>
                    <th>Controls</th>
                  </tr>
                </thead>
                <tbody>
                  {offers.map((o) => (
                    <tr key={o.id}>
                      <td>
                        <div className="ks-table-strong">{o.text}</div>
                      </td>
                      <td>{o.route || '—'}</td>
                      <td>{o.sort_order}</td>
                      <td>
                        <button
                          type="button"
                          onClick={() => handleToggleOffer(o)}
                          className={`ks-toggle-switch ${o.is_active ? 'is-active' : ''}`}
                          aria-label={o.is_active ? 'Deactivate announcement' : 'Activate announcement'}
                        >
                          <span className="ks-toggle-slider" />
                        </button>
                      </td>
                      <td>
                        <div className="ks-table-actions-cell">
                          <button
                            type="button"
                            onClick={() => openOfferModal(o)}
                            className="ks-table-icon-btn"
                            title="Edit Announcement"
                          >
                            <Edit2 size={15} />
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              setDeleteModal({
                                isOpen: true,
                                type: 'offer',
                                id: o.id,
                                title: 'Delete Announcement',
                                message: `Are you sure you want to delete announcement "${o.text}"?`
                              })
                            }
                            className="ks-table-icon-btn is-danger"
                            title="Delete Announcement"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>

      {/* SECTION 3: HOMEPAGE STORY (AFTER-HERO CINEMATIC SECTION) */}
      <section className="ks-admin-panel" style={{ marginBottom: '32px' }} aria-label="Homepage Story">
        <div className="ks-admin-panel-header">
          <div>
            <h2 className="ks-admin-panel-title">Homepage Story (After-Hero Showcase)</h2>
            <p className="ks-admin-panel-desc">
              Cinematic brand storytelling section displayed immediately below the hero carousel.
            </p>
          </div>

          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}>
            <input
              type="checkbox"
              checked={storyData.is_active}
              onChange={(e) => setStoryData({ ...storyData, is_active: e.target.checked })}
            />
            <span>Active on Storefront</span>
          </label>
        </div>

        <form onSubmit={handleSaveStory} className="ks-admin-panel-body">
          <div className="ks-form-row">
            <div className="ks-form-group">
              <label className="ks-form-label">Headline</label>
              <input
                type="text"
                placeholder="e.g. CRAFTED FOR MATCHDAY EXCELLENCE"
                value={storyData.heading || ''}
                onChange={(e) => setStoryData({ ...storyData, heading: e.target.value })}
                className="ks-admin-input"
              />
            </div>

            <div className="ks-form-group">
              <label className="ks-form-label">Story Image</label>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <label className="ks-admin-btn-secondary" style={{ cursor: 'pointer', flexShrink: 0 }}>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleStoryImageUpload}
                    style={{ display: 'none' }}
                    disabled={uploadingStoryMedia}
                  />
                  {uploadingStoryMedia ? (
                    <>
                      <Loader2 size={15} className="ks-spin-icon" />
                      <span>Uploading...</span>
                    </>
                  ) : (
                    <>
                      <Upload size={15} />
                      <span>Upload Photo</span>
                    </>
                  )}
                </label>

                <input
                  type="text"
                  placeholder="or enter image CDN URL"
                  value={storyData.image_url || ''}
                  onChange={(e) => setStoryData({ ...storyData, image_url: e.target.value })}
                  className="ks-admin-input"
                  style={{ flex: 1 }}
                />
              </div>
            </div>
          </div>

          <div className="ks-form-group">
            <label className="ks-form-label">Supporting Text / Paragraph</label>
            <textarea
              rows={3}
              placeholder="e.g. Engineered with championship durability and high-performance ergonomics. Designed for athletes who command the field."
              value={storyData.subheading || ''}
              onChange={(e) => setStoryData({ ...storyData, subheading: e.target.value })}
              className="ks-admin-input"
            />
          </div>

          <div className="ks-form-row">
            <div className="ks-form-group">
              <label className="ks-form-label">Call to Action Button Label</label>
              <input
                type="text"
                placeholder="e.g. Explore Collection"
                value={storyData.button_text || ''}
                onChange={(e) => setStoryData({ ...storyData, button_text: e.target.value })}
                className="ks-admin-input"
              />
            </div>

            <div className="ks-form-group">
              <label className="ks-form-label">Button Target Route</label>
              <input
                type="text"
                placeholder="e.g. /products?category=jerseys"
                value={storyData.button_link || ''}
                onChange={(e) => setStoryData({ ...storyData, button_link: e.target.value })}
                className="ks-admin-input"
              />
            </div>
          </div>

          {/* Live Preview Card */}
          {storyData.image_url && (
            <div style={{ marginTop: '16px', padding: '16px', background: '#0A0A0A', color: '#FFF', position: 'relative', overflow: 'hidden' }}>
              <span style={{ fontSize: '11px', fontWeight: 800, letterSpacing: '0.1em', color: '#E10600', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>
                LIVE PREVIEW
              </span>
              <div style={{ position: 'relative', minHeight: '180px', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: '24px', background: `linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.85)), url(${storyData.image_url}) center/cover no-repeat` }}>
                <h3 style={{ fontSize: '1.4rem', fontWeight: 900, textTransform: 'uppercase', margin: '0 0 6px' }}>
                  {storyData.heading || 'HEADLINE'}
                </h3>
                <p style={{ fontSize: '0.88rem', color: '#CCC', margin: '0 0 12px', maxWidth: '500px' }}>
                  {storyData.subheading || 'Supporting narrative text...'}
                </p>
                <div style={{ display: 'inline-block' }}>
                  <span style={{ background: '#E10600', color: '#FFF', padding: '6px 14px', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase' }}>
                    {storyData.button_text || 'Button'} &rarr;
                  </span>
                </div>
              </div>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
            <button
              type="submit"
              disabled={storySaving}
              className="ks-admin-btn-primary"
            >
              {storySaving ? 'Saving Story...' : 'Save Homepage Story'}
            </button>
          </div>
        </form>
      </section>

      {/* SECTION 4: STORE OFFERS & PROMOTIONS */}
      <section className="ks-admin-panel" style={{ marginBottom: '32px' }} aria-label="Store Offers">
        <div className="ks-admin-panel-header">
          <div>
            <h2 className="ks-admin-panel-title">Active Offers &amp; Promotions</h2>
            <p className="ks-admin-panel-desc">
              Customer offers linked to actual products or categories. Displayed in the storefront Offers section.
            </p>
          </div>

          <button
            type="button"
            onClick={() => openStoreOfferModal(null)}
            className="ks-admin-btn-primary"
          >
            <Plus size={15} />
            <span>Add Store Offer</span>
          </button>
        </div>

        <div className="ks-admin-panel-body">
          {storeOffers.length === 0 ? (
            <div className="ks-admin-empty-notice">
              <span>No store promotions created yet. Add an offer to display in the homepage Offers section.</span>
            </div>
          ) : (
            <div className="ks-admin-table-responsive">
              <table className="ks-admin-table">
                <thead>
                  <tr>
                    <th>Title &amp; Description</th>
                    <th>Discount</th>
                    <th>Free Delivery</th>
                    <th>Visibility</th>
                    <th>Controls</th>
                  </tr>
                </thead>
                <tbody>
                  {storeOffers.map((o) => (
                    <tr key={o.id}>
                      <td>
                        <div className="ks-table-strong">{o.title}</div>
                        {o.description && <div className="ks-table-subtext">{o.description}</div>}
                      </td>
                      <td>
                        <span className="ks-badge ks-badge-sale">
                          {o.discount_type === 'percentage' ? `${o.discount_value}% OFF` : `$${o.discount_value} OFF`}
                        </span>
                      </td>
                      <td>{o.free_delivery ? 'Yes' : 'No'}</td>
                      <td>
                        <button
                          type="button"
                          onClick={() => handleToggleStoreOffer(o)}
                          className={`ks-toggle-switch ${o.is_visible ? 'is-active' : ''}`}
                          aria-label={o.is_visible ? 'Deactivate offer' : 'Activate offer'}
                        >
                          <span className="ks-toggle-slider" />
                        </button>
                      </td>
                      <td>
                        <div className="ks-table-actions-cell">
                          <button
                            type="button"
                            onClick={() => openStoreOfferModal(o)}
                            className="ks-table-icon-btn"
                            title="Edit Offer"
                          >
                            <Edit2 size={15} />
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              setDeleteModal({
                                isOpen: true,
                                type: 'storeOffer',
                                id: o.id,
                                title: 'Delete Store Offer',
                                message: `Are you sure you want to delete offer "${o.title}"?`
                              })
                            }
                            className="ks-table-icon-btn is-danger"
                            title="Delete Offer"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>

      {/* CREATE / EDIT HERO SLIDE MODAL */}
      {slideModalOpen && (
        <div className="ks-admin-modal-backdrop" onClick={() => setSlideModalOpen(false)} role="dialog" aria-modal="true">
          <div className="ks-admin-modal-box is-wide" onClick={(e) => e.stopPropagation()}>
            <div className="ks-admin-modal-header">
              <h3 className="ks-admin-modal-title">
                {editingSlide ? 'Edit Hero Slide' : 'New Hero Slide'}
              </h3>
              <button type="button" onClick={() => setSlideModalOpen(false)} className="ks-admin-modal-close-btn" aria-label="Close">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveSlide} className="ks-admin-form">
              <div className="ks-admin-modal-body">
                <div className="ks-form-row">
                  <div className="ks-form-group">
                    <label className="ks-form-label">Slide Title</label>
                    <input
                      type="text"
                      placeholder="e.g. MATCHDAY PRECISION"
                      value={slideFormData.title}
                      onChange={(e) => setSlideFormData({ ...slideFormData, title: e.target.value })}
                      className="ks-admin-input"
                    />
                  </div>

                  <div className="ks-form-group">
                    <label className="ks-form-label">Subtitle / Description</label>
                    <input
                      type="text"
                      placeholder="e.g. Official Goalkeeper Gloves & Kits"
                      value={slideFormData.subtitle}
                      onChange={(e) => setSlideFormData({ ...slideFormData, subtitle: e.target.value })}
                      className="ks-admin-input"
                    />
                  </div>
                </div>

                {/* Media File Upload & URL */}
                <div className="ks-form-group">
                  <label className="ks-form-label">Media File (Image or Video) *</label>
                  <div className="ks-admin-upload-field">
                    <input
                      type="file"
                      accept="image/*,video/*"
                      id="hero-file-input"
                      onChange={handleSlideFileUpload}
                      style={{ display: 'none' }}
                    />
                    <label htmlFor="hero-file-input" className="ks-admin-btn-secondary" style={{ cursor: 'pointer' }}>
                      {uploadingSlideMedia ? (
                        <>
                          <Loader2 size={15} className="ks-spin-icon" />
                          <span>Uploading to Storage...</span>
                        </>
                      ) : (
                        <>
                          <Upload size={15} />
                          <span>Upload File to Supabase</span>
                        </>
                      )}
                    </label>

                    <input
                      type="text"
                      placeholder="or enter CDN / Media URL directly"
                      value={slideFormData.media_path}
                      onChange={(e) => setSlideFormData({ ...slideFormData, media_path: e.target.value })}
                      className="ks-admin-input"
                      style={{ flex: 1 }}
                    />
                  </div>

                  {slideFormData.media_path && (
                    <div className="ks-upload-preview-wrap">
                      {slideFormData.media_type === 'video' ? (
                        <video src={slideFormData.media_path} className="ks-upload-preview-img" controls muted />
                      ) : (
                        <img src={slideFormData.media_path} alt="Preview" className="ks-upload-preview-img" />
                      )}
                    </div>
                  )}
                </div>

                <div className="ks-form-row">
                  <div className="ks-form-group">
                    <label className="ks-form-label">Primary Button Text</label>
                    <input
                      type="text"
                      placeholder="e.g. EXPLORE PRODUCTS"
                      value={slideFormData.primary_button_text}
                      onChange={(e) => setSlideFormData({ ...slideFormData, primary_button_text: e.target.value })}
                      className="ks-admin-input"
                    />
                  </div>

                  <div className="ks-form-group">
                    <label className="ks-form-label">Primary Button Route</label>
                    <input
                      type="text"
                      placeholder="e.g. /products"
                      value={slideFormData.primary_button_route}
                      onChange={(e) => setSlideFormData({ ...slideFormData, primary_button_route: e.target.value })}
                      className="ks-admin-input"
                    />
                  </div>
                </div>

                <div className="ks-form-row">
                  <div className="ks-form-group">
                    <label className="ks-form-label">Secondary Button Text</label>
                    <input
                      type="text"
                      placeholder="e.g. VIEW OFFERS"
                      value={slideFormData.secondary_button_text}
                      onChange={(e) => setSlideFormData({ ...slideFormData, secondary_button_text: e.target.value })}
                      className="ks-admin-input"
                    />
                  </div>

                  <div className="ks-form-group">
                    <label className="ks-form-label">Secondary Button Route</label>
                    <input
                      type="text"
                      placeholder="e.g. /offers"
                      value={slideFormData.secondary_button_route}
                      onChange={(e) => setSlideFormData({ ...slideFormData, secondary_button_route: e.target.value })}
                      className="ks-admin-input"
                    />
                  </div>
                </div>

                <div className="ks-form-row">
                  <div className="ks-form-group">
                    <label className="ks-form-label">Duration (Seconds)</label>
                    <input
                      type="number"
                      min="2"
                      max="30"
                      value={slideFormData.duration_seconds}
                      onChange={(e) => setSlideFormData({ ...slideFormData, duration_seconds: e.target.value })}
                      className="ks-admin-input"
                    />
                  </div>

                  <div className="ks-form-group">
                    <label className="ks-form-label">Sort Order</label>
                    <input
                      type="number"
                      min="0"
                      value={slideFormData.sort_order}
                      onChange={(e) => setSlideFormData({ ...slideFormData, sort_order: e.target.value })}
                      className="ks-admin-input"
                    />
                  </div>

                  <div className="ks-form-group" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <label className="ks-form-label">Active on Public Home</label>
                    <label className="ks-checkbox-wrap">
                      <input
                        type="checkbox"
                        checked={slideFormData.is_active}
                        onChange={(e) => setSlideFormData({ ...slideFormData, is_active: e.target.checked })}
                      />
                      <span className="ks-checkbox-custom" />
                      <span>Display on Home Page</span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="ks-admin-modal-footer">
                <button
                  type="button"
                  onClick={() => setSlideModalOpen(false)}
                  className="ks-admin-btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={slideSaveLoading}
                  className="ks-admin-btn-primary"
                >
                  {slideSaveLoading ? 'Saving Slide...' : 'Save Hero Slide'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE / EDIT OFFER BAR MODAL */}
      {offerModalOpen && (
        <div className="ks-admin-modal-backdrop" onClick={() => setOfferModalOpen(false)} role="dialog" aria-modal="true">
          <div className="ks-admin-modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="ks-admin-modal-header">
              <h3 className="ks-admin-modal-title">
                {editingOffer ? 'Edit Announcement' : 'New Announcement'}
              </h3>
              <button type="button" onClick={() => setOfferModalOpen(false)} className="ks-admin-modal-close-btn" aria-label="Close">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveOffer} className="ks-admin-form">
              <div className="ks-admin-modal-body">
                <div className="ks-form-group">
                  <label className="ks-form-label">Announcement Text *</label>
                  <input
                    type="text"
                    placeholder="e.g. FREE DELIVERY ON ORDERS OVER $50"
                    value={offerFormData.text}
                    onChange={(e) => setOfferFormData({ ...offerFormData, text: e.target.value })}
                    className="ks-admin-input"
                    required
                  />
                </div>

                <div className="ks-form-row">
                  <div className="ks-form-group">
                    <label className="ks-form-label">Click Route (Optional)</label>
                    <input
                      type="text"
                      placeholder="e.g. /products or /offers"
                      value={offerFormData.route}
                      onChange={(e) => setOfferFormData({ ...offerFormData, route: e.target.value })}
                      className="ks-admin-input"
                    />
                  </div>

                  <div className="ks-form-group">
                    <label className="ks-form-label">Sort Order</label>
                    <input
                      type="number"
                      min="0"
                      value={offerFormData.sort_order}
                      onChange={(e) => setOfferFormData({ ...offerFormData, sort_order: e.target.value })}
                      className="ks-admin-input"
                    />
                  </div>
                </div>

                <div className="ks-form-group">
                  <label className="ks-checkbox-wrap">
                    <input
                      type="checkbox"
                      checked={offerFormData.is_active}
                      onChange={(e) => setOfferFormData({ ...offerFormData, is_active: e.target.checked })}
                    />
                    <span className="ks-checkbox-custom" />
                    <span>Active on Public Offers Bar</span>
                  </label>
                </div>
              </div>

              <div className="ks-admin-modal-footer">
                <button
                  type="button"
                  onClick={() => setOfferModalOpen(false)}
                  className="ks-admin-btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={offerSaveLoading}
                  className="ks-admin-btn-primary"
                >
                  {offerSaveLoading ? 'Saving...' : 'Save Announcement'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE / EDIT STORE OFFER MODAL */}
      {storeOfferModalOpen && (
        <div className="ks-admin-modal-backdrop" onClick={() => setStoreOfferModalOpen(false)} role="dialog" aria-modal="true">
          <div className="ks-admin-modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="ks-admin-modal-header">
              <h3 className="ks-admin-modal-title">
                {editingStoreOffer ? 'Edit Store Offer' : 'New Store Offer'}
              </h3>
              <button type="button" onClick={() => setStoreOfferModalOpen(false)} className="ks-admin-modal-close-btn" aria-label="Close">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveStoreOffer} className="ks-admin-form">
              <div className="ks-admin-modal-body">
                <div className="ks-form-group">
                  <label className="ks-form-label">Offer Title</label>
                  <input
                    type="text"
                    placeholder="e.g. 20% Off Matchday Kits"
                    value={storeOfferFormData.title}
                    onChange={(e) => setStoreOfferFormData({ ...storeOfferFormData, title: e.target.value })}
                    className="ks-admin-input"
                    required
                  />
                </div>

                <div className="ks-form-group">
                  <label className="ks-form-label">Description (Optional)</label>
                  <textarea
                    rows={2}
                    placeholder="e.g. Save on all official jerseys this week."
                    value={storeOfferFormData.description}
                    onChange={(e) => setStoreOfferFormData({ ...storeOfferFormData, description: e.target.value })}
                    className="ks-admin-input"
                  />
                </div>

                <div className="ks-form-row">
                  <div className="ks-form-group">
                    <label className="ks-form-label">Discount Type</label>
                    <select
                      value={storeOfferFormData.discount_type}
                      onChange={(e) => setStoreOfferFormData({ ...storeOfferFormData, discount_type: e.target.value })}
                      className="ks-admin-input"
                    >
                      <option value="percentage">Percentage (%)</option>
                      <option value="fixed">Fixed Amount ($ USD)</option>
                    </select>
                  </div>

                  <div className="ks-form-group">
                    <label className="ks-form-label">Discount Value</label>
                    <input
                      type="number"
                      step="0.5"
                      min="0"
                      value={storeOfferFormData.discount_value}
                      onChange={(e) => setStoreOfferFormData({ ...storeOfferFormData, discount_value: parseFloat(e.target.value) || 0 })}
                      className="ks-admin-input"
                      required
                    />
                  </div>
                </div>

                <div className="ks-form-group">
                  <label className="ks-checkbox-wrap">
                    <input
                      type="checkbox"
                      checked={storeOfferFormData.free_delivery}
                      onChange={(e) => setStoreOfferFormData({ ...storeOfferFormData, free_delivery: e.target.checked })}
                    />
                    <span className="ks-checkbox-custom" />
                    <span>Includes Free Delivery</span>
                  </label>
                </div>

                <div className="ks-form-group">
                  <label className="ks-checkbox-wrap">
                    <input
                      type="checkbox"
                      checked={storeOfferFormData.is_visible}
                      onChange={(e) => setStoreOfferFormData({ ...storeOfferFormData, is_visible: e.target.checked })}
                    />
                    <span className="ks-checkbox-custom" />
                    <span>Visible in Active Offers section on storefront</span>
                  </label>
                </div>
              </div>

              <div className="ks-admin-modal-footer">
                <button
                  type="button"
                  onClick={() => setStoreOfferModalOpen(false)}
                  className="ks-admin-btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={storeOfferSaving}
                  className="ks-admin-btn-primary"
                >
                  {storeOfferSaving ? 'Saving...' : 'Save Offer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Modal for Delete */}
      <ConfirmModal
        isOpen={deleteModal.isOpen}
        title={deleteModal.title}
        message={deleteModal.message}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteModal({ isOpen: false, type: null, id: null, title: '', message: '' })}
        loading={deleteLoading}
      />
    </div>
  );
}
