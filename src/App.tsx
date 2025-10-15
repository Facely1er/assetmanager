import React, { useState, Suspense } from 'react';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import { AuthGuard } from './components/auth/AuthGuard';
import { StartScreen } from './components/StartScreen';
import { MainLayout } from './components/MainLayout';
import { LoadingSpinner } from './components/LoadingSpinner';

// Enhanced App component with production optimizations
const App: React.FC = () => {
  const [showStartScreen, setShowStartScreen] = useState(true);

  const handleGetStarted = React.useCallback(() => {
    setShowStartScreen(false);
  }, []);

  const handleLoadDemo = React.useCallback(() => {
    setShowStartScreen(false);
  }, []);

  const handleShowStartScreen = React.useCallback(() => {
    setShowStartScreen(true);
  }, []);

  return (
    <ErrorBoundary>
      <AuthProvider>
        <div className="min-h-screen" role="main">
          {/* Global Toaster */}
          <Toaster 
            position="top-right"
            toastOptions={{
              duration: 4000,
              // Enhanced styling for better accessibility
              style: {
                background: '#363636',
                color: '#fff',
                fontSize: '14px',
                maxWidth: '400px',
                padding: '12px 16px',
                borderRadius: '8px',
                boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1), 0 4px 6px rgba(0, 0, 0, 0.05)'
              },
              success: {
                duration: 3000,
                iconTheme: {
                  primary: '#10B981',
                  secondary: '#fff',
                },
                style: {
                  background: '#065F46',
                  color: '#D1FAE5'
                }
              },
              error: {
                duration: 5000,
                iconTheme: {
                  primary: '#EF4444',
                  secondary: '#fff',
                },
                style: {
                  background: '#7F1D1D',
                  color: '#FEE2E2'
                }
              },
              loading: {
                duration: Infinity,
                style: {
                  background: '#1F2937',
                  color: '#F3F4F6'
                }
              },
            }}
            // Accessibility improvements
            containerStyle={{
              top: '1rem',
              right: '1rem'
            }}
          />
          
          {/* Application Content with Suspense */}
          <Suspense fallback={
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
              <LoadingSpinner size="lg" text="Loading ERMITS CyberSoluce®..." />
            </div>
          }>
            {showStartScreen ? (
              <StartScreen 
                onGetStarted={handleGetStarted}
                onLoadDemo={handleLoadDemo}
              />
            ) : (
              <AuthGuard 
                requireAuth={false}
                fallback={
                  <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                    <LoadingSpinner size="lg" text="Initializing..." />
                  </div>
                }
              >
                <MainLayout onShowStartScreen={handleShowStartScreen} />
              </AuthGuard>
            )}
          </Suspense>
        </div>
      </AuthProvider>
    </ErrorBoundary>
  );
};

export default App;