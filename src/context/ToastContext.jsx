import React, { createContext, useContext, useState, useCallback } from 'react';
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback((message, type = 'error', duration = 4500) => {
    if (!message) return;
    const id = Date.now() + Math.random().toString(36).substring(2, 9);
    const newToast = { id, message, type };

    setToasts((prev) => {
      // Avoid duplicate consecutive identical messages
      if (prev.length > 0 && prev[prev.length - 1].message === message) {
        return prev;
      }
      return [...prev.slice(-3), newToast]; // Keep at most 4 active toasts
    });

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }

    return id;
  }, [removeToast]);

  return (
    <ToastContext.Provider value={{ showToast, removeToast }}>
      {children}

      {/* Floating Screen Alert Container — Always in Viewport regardless of scroll */}
      <div
        className="ks-toast-floating-container"
        style={{
          position: 'fixed',
          top: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 999999,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '10px',
          pointerEvents: 'none',
          maxWidth: '92vw',
          width: 'max-content',
          minWidth: '300px'
        }}
        aria-live="assertive"
      >
        {toasts.map((toast) => {
          const isError = toast.type === 'error';
          const isSuccess = toast.type === 'success';

          return (
            <div
              key={toast.id}
              role="alert"
              className={`ks-screen-toast-pill ${isError ? 'is-error' : isSuccess ? 'is-success' : 'is-info'}`}
              style={{
                pointerEvents: 'auto',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 18px',
                borderRadius: '16px',
                background: isError
                  ? 'rgba(26, 10, 10, 0.94)'
                  : isSuccess
                  ? 'rgba(10, 26, 15, 0.94)'
                  : 'rgba(15, 15, 20, 0.94)',
                border: isError
                  ? '1px solid rgba(225, 6, 0, 0.7)'
                  : isSuccess
                  ? '1px solid rgba(37, 211, 102, 0.7)'
                  : '1px solid rgba(255, 255, 255, 0.2)',
                boxShadow: isError
                  ? '0 10px 30px rgba(225, 6, 0, 0.35), 0 2px 8px rgba(0, 0, 0, 0.5)'
                  : isSuccess
                  ? '0 10px 30px rgba(37, 211, 102, 0.3), 0 2px 8px rgba(0, 0, 0, 0.5)'
                  : '0 10px 30px rgba(0, 0, 0, 0.5)',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                color: '#FFFFFF',
                animation: 'ksToastPop 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards',
                maxWidth: '600px'
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  background: isError
                    ? 'rgba(225, 6, 0, 0.2)'
                    : isSuccess
                    ? 'rgba(37, 211, 102, 0.2)'
                    : 'rgba(255, 255, 255, 0.1)',
                  color: isError ? '#FF4D4D' : isSuccess ? '#25D366' : '#FFFFFF'
                }}
              >
                {isError ? (
                  <AlertCircle size={18} strokeWidth={2.5} />
                ) : isSuccess ? (
                  <CheckCircle2 size={18} strokeWidth={2.5} />
                ) : (
                  <Info size={18} strokeWidth={2.5} />
                )}
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <span
                  style={{
                    display: 'block',
                    fontSize: '0.92rem',
                    fontWeight: 700,
                    lineHeight: '1.4',
                    color: '#FFFFFF',
                    wordBreak: 'break-word'
                  }}
                >
                  {toast.message}
                </span>
              </div>

              <button
                type="button"
                onClick={() => removeToast(toast.id)}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: '4px',
                  color: 'rgba(255, 255, 255, 0.7)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '6px',
                  marginLeft: '4px',
                  transition: 'color 0.15s ease'
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#FFFFFF')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255, 255, 255, 0.7)')}
                aria-label="Close notification"
              >
                <X size={16} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    // Graceful fallback if called outside provider
    return {
      showToast: (msg) => {
        if (typeof window !== 'undefined') window.alert?.(msg);
      },
      removeToast: () => {}
    };
  }
  return context;
}
