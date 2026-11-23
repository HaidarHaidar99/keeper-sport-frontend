import React from 'react';
import { Loader2 } from 'lucide-react';

export default function AdminLoader({ message = 'Loading...', fullScreen = false }) {
  return (
    <div
      className={fullScreen ? 'ks-admin-loading-screen' : 'ks-admin-center-loader'}
      role="status"
      aria-live="polite"
    >
      <div className="ks-admin-loader-card">
        <div className="ks-admin-loader-ring">
          <Loader2 size={26} className="ks-spin-icon" />
        </div>
        <span className="ks-admin-loader-text">{message}</span>
      </div>
    </div>
  );
}
