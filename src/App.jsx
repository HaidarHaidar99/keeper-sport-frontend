import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import LoginPage from './pages/LoginPage';
import SignUpPage from './pages/SignUpPage';

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* If opening root URL, nothing appears */}
            <Route path="/" element={<div style={{ minHeight: '100vh', background: 'var(--ks-bg-canvas)' }} />} />
            
            {/* Customer Authentication Routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignUpPage />} />
            <Route path="/register" element={<SignUpPage />} />
            
            {/* Any unknown route renders nothing */}
            <Route path="*" element={<div style={{ minHeight: '100vh', background: 'var(--ks-bg-canvas)' }} />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
