import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

export default function ConfirmModal({
  isOpen,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed?',
  confirmLabel = 'Delete',
  isDestructive = true,
  onConfirm,
  onCancel,
  loading = false
}) {
  if (!isOpen) return null;

  return (
    <div className="ks-admin-modal-backdrop" onClick={onCancel} role="dialog" aria-modal="true">
      <div className="ks-admin-modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="ks-admin-modal-header">
          <div className="ks-modal-title-wrap">
            {isDestructive && <AlertTriangle size={20} className="ks-modal-warn-icon" />}
            <h3 className="ks-admin-modal-title">{title}</h3>
          </div>
          <button type="button" onClick={onCancel} className="ks-admin-modal-close-btn" aria-label="Close">
            <X size={18} />
          </button>
        </div>

        <div className="ks-admin-modal-body">
          <p className="ks-admin-modal-text">{message}</p>
        </div>

        <div className="ks-admin-modal-footer">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="ks-admin-btn-secondary"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={isDestructive ? 'ks-admin-btn-danger' : 'ks-admin-btn-primary'}
          >
            {loading ? 'Processing...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
