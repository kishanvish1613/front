import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { StatementProvider } from './context/StatementContext';
import LoginPage from './pages/LoginPage';
import AdminDashboard from './pages/AdminDashboard';
import StatementWizard from './pages/StatementWizard';
import TemplateCalibrator from './pages/TemplateCalibrator';
import { ShieldCheck } from 'lucide-react';

function AppContent() {
  const { user, loading, isAuthenticated, isAdmin } = useAuth();
  const [currentView, setCurrentView] = useState('dashboard'); // 'dashboard' | 'studio' | 'calibrator'
  const [calibratorBlob, setCalibratorBlob] = useState(null);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30 animate-pulse">
          <ShieldCheck className="w-6 h-6 text-white" />
        </div>
        <div className="text-xs text-slate-400 font-medium tracking-wide">
          Verifying session & device security...
        </div>
      </div>
    );
  }

  // Not logged in -> Show Login Page
  if (!isAuthenticated) {
    return <LoginPage />;
  }

  // Global Calibrator View
  if (currentView === 'calibrator') {
    return (
      <TemplateCalibrator
        initialGeneratedBlob={calibratorBlob}
        onBack={() => {
          setCalibratorBlob(null);
          setCurrentView(isAdmin ? 'dashboard' : 'studio');
        }}
      />
    );
  }

  // Logged in as Admin
  if (isAdmin) {
    if (currentView === 'studio') {
      return (
        <StatementWizard
          onOpenAdmin={() => setCurrentView('dashboard')}
          onOpenCalibrator={(blob) => {
            setCalibratorBlob(blob || null);
            setCurrentView('calibrator');
          }}
        />
      );
    }
    return (
      <AdminDashboard
        onOpenStudio={() => setCurrentView('studio')}
        onOpenCalibrator={() => {
          setCalibratorBlob(null);
          setCurrentView('calibrator');
        }}
      />
    );
  }

  // Logged in as Normal User
  return (
    <StatementWizard
      onOpenCalibrator={(blob) => {
        setCalibratorBlob(blob || null);
        setCurrentView('calibrator');
      }}
    />
  );
}

export default function App() {
  return (
    <AuthProvider>
      <StatementProvider>
        <AppContent />
      </StatementProvider>
    </AuthProvider>
  );
}
