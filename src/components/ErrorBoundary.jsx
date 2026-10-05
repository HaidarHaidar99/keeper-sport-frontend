import React from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Unhandled React Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'var(--ks-bg-canvas, #FCFAF5)',
          color: 'var(--ks-text-title, #111111)',
          padding: '24px',
          fontFamily: "'Inter', sans-serif"
        }}>
          <div style={{
            maxWidth: '480px',
            width: '100%',
            backgroundColor: 'var(--ks-bg-card, #FFFFFF)',
            border: '1px solid var(--ks-border-card, #EAE6DF)',
            borderRadius: '16px',
            padding: '36px 28px',
            textAlign: 'center',
            boxShadow: '0 8px 30px rgba(0,0,0,0.06)'
          }}>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              backgroundColor: 'rgba(225, 6, 0, 0.1)',
              color: '#E10600',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '18px'
            }}>
              <AlertTriangle size={28} />
            </div>
            <h1 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '10px' }}>
              Something went wrong
            </h1>
            <p style={{ color: 'var(--ks-text-subtitle, #555555)', fontSize: '0.92rem', marginBottom: '24px', lineHeight: 1.5 }}>
              The application encountered an unexpected issue. Please reload the page to restore your session.
            </p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 24px',
                backgroundColor: '#E10600',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '10px',
                fontWeight: 600,
                fontSize: '0.92rem',
                cursor: 'pointer'
              }}
            >
              <RotateCcw size={16} />
              <span>Reload Page</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
