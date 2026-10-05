import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Compass } from 'lucide-react';

export default function NotFoundPage() {
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
        maxWidth: '460px',
        width: '100%',
        backgroundColor: 'var(--ks-bg-card, #FFFFFF)',
        border: '1px solid var(--ks-border-card, #EAE6DF)',
        borderRadius: '16px',
        padding: '40px 28px',
        textAlign: 'center',
        boxShadow: '0 8px 30px rgba(0,0,0,0.06)'
      }}>
        <div style={{
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          backgroundColor: 'rgba(225, 6, 0, 0.08)',
          color: '#E10600',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '18px'
        }}>
          <Compass size={30} />
        </div>
        <h1 style={{ fontSize: '1.6rem', fontWeight: 700, marginBottom: '10px' }}>
          Page Not Found
        </h1>
        <p style={{ color: 'var(--ks-text-subtitle, #555555)', fontSize: '0.92rem', marginBottom: '24px', lineHeight: 1.5 }}>
          The requested page could not be located on Keeper Sports.
        </p>
        <Link
          to="/"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '12px 24px',
            backgroundColor: '#E10600',
            color: '#FFFFFF',
            textDecoration: 'none',
            borderRadius: '10px',
            fontWeight: 600,
            fontSize: '0.92rem'
          }}
        >
          <ArrowLeft size={16} />
          <span>Return to Storefront</span>
        </Link>
      </div>
    </div>
  );
}
