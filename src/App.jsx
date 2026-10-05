import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { StatementProvider } from './context/StatementContext';
import LoginPage from './pages/LoginPage';
import AdminDashboard from './pages/AdminDashboard';
import StatementWizard from './pages/StatementWizard';
import { ShieldCheck } from 'lucide-react';

function AppRoutes() {
  const { user, loading, isAuthenticated, isAdmin } = useAuth();
  const navigate = useNavigate();

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

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return (
    <Routes>
      <Route
        path="/admin"
        element={
          isAdmin ? (
            <AdminDashboard
              onOpenStudio={() => navigate('/studio')}
            />
          ) : (
            <Navigate to="/studio" replace />
          )
        }
      />
      <Route
        path="/dashboard"
        element={
          isAdmin ? (
            <AdminDashboard
              onOpenStudio={() => navigate('/studio')}
            />
          ) : (
            <Navigate to="/studio" replace />
          )
        }
      />
      <Route
        path="/studio"
        element={
          <StatementWizard
            onOpenAdmin={() => navigate('/admin')}
          />
        }
      />
      <Route
        path="/generator"
        element={
          <StatementWizard
            onOpenAdmin={() => navigate('/admin')}
          />
        }
      />
      <Route
        path="/"
        element={<Navigate to={isAdmin ? '/admin' : '/studio'} replace />}
      />
      <Route
        path="*"
        element={<Navigate to={isAdmin ? '/admin' : '/studio'} replace />}
      />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <StatementProvider>
          <AppRoutes />
        </StatementProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

