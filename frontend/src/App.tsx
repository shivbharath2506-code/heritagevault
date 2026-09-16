import React, { useState } from 'react';
import { useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { ProtectedRoute } from './components/ProtectedRoute';

// Pages
import { PublicLandingPage } from './pages/PublicLandingPage';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { ArtifactsPage } from './pages/ArtifactsPage';
import { ConservationPage } from './pages/ConservationPage';
import { ExhibitionsPage } from './pages/ExhibitionsPage';
import { RestorationPage } from './pages/RestorationPage';
import { VisitorsPage } from './pages/VisitorsPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { ReportsPage } from './pages/ReportsPage';

export const App: React.FC = () => {
  const { isAuthenticated, user, isLoading } = useAuth();
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLoginView, setIsLoginView] = useState(true);

  if (isLoading) {
    return (
      <div className="page-loader-container" style={{ height: '100vh' }}>
        <div className="spinner" />
        <p>Initializing HeritageVault Digital Museum System...</p>
      </div>
    );
  }

  // Not authenticated view
  if (!isAuthenticated || !user) {
    if (isLoginView) {
      return (
        <LoginPage
          onBackToPublic={() => setIsLoginView(false)}
          onLoginSuccess={() => {
            setIsLoginView(false);
            setCurrentTab('dashboard');
          }}
        />
      );
    }
    return <PublicLandingPage onGoToLogin={() => setIsLoginView(true)} />;
  }

  // If authenticated user clicks "Public View Portal"
  if (currentTab === 'public') {
    return (
      <div className="relative">
        <div className="no-print" style={{ position: 'fixed', top: '15px', right: '20px', zIndex: 9999 }}>
          <button className="btn btn-gold" onClick={() => setCurrentTab('dashboard')}>
            ← Back to Staff Dashboard
          </button>
        </div>
        <PublicLandingPage onGoToLogin={() => setCurrentTab('dashboard')} />
      </div>
    );
  }

  return (
    <div className="app-layout">
      {/* Dynamic Sidebar */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={(tab) => setCurrentTab(tab)}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* Main App Canvas */}
      <div className="main-content-wrapper">
        <Navbar
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          isSidebarOpen={isSidebarOpen}
        />

        <main className="page-body-container">
          {currentTab === 'dashboard' && (
            <ProtectedRoute allowedRoles={['admin', 'curator', 'conservator', 'staff']}>
              <DashboardPage onNavigateTab={(tab) => setCurrentTab(tab)} user={user} />
            </ProtectedRoute>
          )}

          {currentTab === 'artifacts' && (
            <ProtectedRoute allowedRoles={['admin', 'curator', 'conservator', 'staff']}>
              <ArtifactsPage />
            </ProtectedRoute>
          )}

          {currentTab === 'conservation' && (
            <ProtectedRoute allowedRoles={['admin', 'curator', 'conservator', 'staff']}>
              <ConservationPage />
            </ProtectedRoute>
          )}

          {currentTab === 'exhibitions' && (
            <ProtectedRoute allowedRoles={['admin', 'curator', 'conservator', 'staff']}>
              <ExhibitionsPage />
            </ProtectedRoute>
          )}

          {currentTab === 'restoration' && (
            <ProtectedRoute allowedRoles={['admin', 'curator', 'conservator', 'staff']}>
              <RestorationPage />
            </ProtectedRoute>
          )}

          {currentTab === 'visitors' && (
            <ProtectedRoute allowedRoles={['admin', 'curator', 'conservator', 'staff']}>
              <VisitorsPage />
            </ProtectedRoute>
          )}

          {currentTab === 'analytics' && (
            <ProtectedRoute allowedRoles={['admin', 'curator', 'conservator', 'staff']}>
              <AnalyticsPage />
            </ProtectedRoute>
          )}

          {currentTab === 'reports' && (
            <ProtectedRoute allowedRoles={['admin', 'curator', 'conservator', 'staff']}>
              <ReportsPage />
            </ProtectedRoute>
          )}
        </main>
      </div>
    </div>
  );
};
