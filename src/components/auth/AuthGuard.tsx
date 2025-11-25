import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { AuthModal } from './AuthModal';
import { LoadingSpinner } from '../LoadingSpinner';
import { Shield, Lock } from 'lucide-react';

interface AuthGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  fallback?: React.ReactNode;
  redirectTo?: string;
}

export const AuthGuard: React.FC<AuthGuardProps> = ({
  children,
  requireAuth = false,
  fallback,
  redirectTo,
}) => {
  const { user, loading } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);

  useEffect(() => {
    if (!loading && requireAuth && !user) {
      if (redirectTo) {
        window.location.href = redirectTo;
      } else {
        setShowAuthModal(true);
      }
    }
  }, [user, loading, requireAuth, redirectTo]);

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="mb-4">
            <Shield className="h-12 w-12 mx-auto text-command-blue-600 animate-pulse" />
          </div>
          <LoadingSpinner size="lg" text="Loading CyberSoluce™ Asset Manager..." />
        </div>
      </div>
    );
  }

  // Show authentication required state
  if (requireAuth && !user) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
            <div className="mb-6">
              <div className="mx-auto w-16 h-16 bg-command-blue-100 rounded-full flex items-center justify-center mb-4">
                <Lock className="h-8 w-8 text-command-blue-600" />
              </div>
              <h2 className="text-2xl font-outfit font-bold text-gray-900 mb-2">
                Authentication Required
              </h2>
              <p className="text-gray-600">
                Please sign in to access this protected area of the application.
              </p>
            </div>
            <button
              onClick={() => setShowAuthModal(true)}
              className="w-full py-3 bg-command-blue-600 text-white rounded-lg hover:bg-command-blue-700 transition-colors font-medium"
            >
              Sign In to Continue
            </button>
            <div className="mt-4 text-sm text-gray-500">
              <p>Don't have an account? You can create one during sign in.</p>
            </div>
          </div>
        </div>

        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
        />
      </>
    );
  }

  // Render children if authenticated or auth not required
  return <>{children}</>;
};

// Higher-order component for route protection
export const withAuthGuard = <P extends object>(
  Component: React.ComponentType<P>,
  options: {
    requireAuth?: boolean;
    roles?: string[];
    permissions?: string[];
    fallback?: React.ComponentType;
  } = {}
) => {
  const WrappedComponent: React.FC<P> = (props) => {
    const { user } = useAuth();

    // Check role-based access if specified
    if (options.roles && user) {
      const userRole = user.user_metadata?.role || 'member';
      if (!options.roles.includes(userRole)) {
        return (
          <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
              <div className="mb-6">
                <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                  <Shield className="h-8 w-8 text-red-600" />
                </div>
                <h2 className="text-2xl font-outfit font-bold text-gray-900 mb-2">
                  Access Denied
                </h2>
                <p className="text-gray-600">
                  You don't have permission to access this area. Contact your administrator if you need access.
                </p>
              </div>
              <button
                onClick={() => window.history.back()}
                className="w-full py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
              >
                Go Back
              </button>
            </div>
          </div>
        );
      }
    }

    return (
      <AuthGuard requireAuth={options.requireAuth} fallback={options.fallback ? <options.fallback /> : undefined}>
        <Component {...props} />
      </AuthGuard>
    );
  };

  WrappedComponent.displayName = `withAuthGuard(${Component.displayName || Component.name})`;
  return WrappedComponent;
};