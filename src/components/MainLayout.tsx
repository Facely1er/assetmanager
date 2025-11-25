import React, { useState, Suspense, lazy, useCallback } from 'react';
import { NavigationSidebar } from './NavigationSidebar';
import { DashboardHome } from './DashboardHome';
import { LoadingSpinner } from './LoadingSpinner';
import { useAuth } from '../contexts/AuthContext';
import { useAssetInventory } from '../contexts/AssetInventoryContext';

// Lazy load components for better performance
const AssetInventoryDashboard = lazy(() => import('./AssetInventoryDashboard'));
const UserManualPage = lazy(() => import('./UserManualPage'));
const GuidedWorkflow = lazy(() => import('./GuidedWorkflow'));
const AdvancedReportingDashboard = lazy(() => import('./reports/AdvancedReportingDashboard'));
const ComplianceManagement = lazy(() => import('./compliance/ComplianceManagement'));
const PrivacyComplianceDashboard = lazy(() => import('./privacy/PrivacyComplianceDashboard'));
const DependenciesPage = lazy(() => import('./dependencies/DependenciesPage'));
const DataProtectionDashboard = lazy(() => import('./protection/DataProtectionDashboard'));
const VulnerabilityDashboard = lazy(() => import('./vulnerabilities/VulnerabilityDashboard'));
const OrganizationManagement = lazy(() => import('./organizations/OrganizationManagement'));
const UserManagement = lazy(() => import('./users/UserManagement'));
const ActivityLog = lazy(() => import('./activity/ActivityLog'));
const SystemSettings = lazy(() => import('./settings/SystemSettings'));
const DemoShowcase = lazy(() => import('./DemoShowcase'));
const MitigationPageWrapper = lazy(() => import('./mitigation/MitigationPageWrapper'));
const BusinessImpactPageWrapper = lazy(() => import('./business-impact/BusinessImpactPageWrapper'));
const NISTPageWrapper = lazy(() => import('./nist/NISTPageWrapper'));
const FrameworkPageWrapper = lazy(() => import('./framework/FrameworkPageWrapper'));

interface MainLayoutProps {
  onShowStartScreen: () => void;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ onShowStartScreen }) => {
  const [activeView, setActiveView] = useState('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { user, signOut } = useAuth();
  const { stats } = useAssetInventory();

  const handleNavigateToAssets = useCallback(() => {
    setActiveView('assets');
  }, []);

  const handleNavigateToReports = useCallback(() => {
    setActiveView('analytics');
  }, []);

  const handleNavigateToSettings = useCallback(() => {
    setActiveView('settings');
  }, []);

  const handleShowImport = useCallback(() => {
    setActiveView('assets');
  }, []);

  const handleShowInventoryGenerator = useCallback(() => {
    setActiveView('assets');
  }, []);

  const handleShowTeamManagement = useCallback(() => {
    setActiveView('users');
  }, []);

  const handleStartDemo = React.useCallback((scenarioId: string) => {
    // Load demo scenario and navigate to assets view
    setActiveView('assets');
    // TODO: Implement demo scenario loading
  }, []);

  const handleViewDemo = React.useCallback((scenarioId: string) => {
    // Show demo details
    setActiveView('demo-scenarios');
  }, []);

  const getCurrentStats = () => ({
    totalAssets: stats.total,
    hasAssets: stats.total > 0,
    hasTeam: false, // This would be determined by actual team data
    hasCompliance: Object.keys(stats.byType).length > 0 // Simple proxy for compliance setup
  });

  const renderContent = () => {
    const LoadingFallback = () => (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" text="Loading..." />
      </div>
    );

    switch (activeView) {
      case 'dashboard':
        return (
          <DashboardHome
            stats={stats}
            onNavigateToAssets={handleNavigateToAssets}
            onNavigateToReports={handleNavigateToReports}
            onNavigateToSettings={handleNavigateToSettings}
          />
        );
      case 'assets':
        return (
          <Suspense fallback={<LoadingFallback />}>
            <AssetInventoryDashboard />
          </Suspense>
        );
      case 'user-manual':
        return (
          <Suspense fallback={<LoadingFallback />}>
            <UserManualPage />
          </Suspense>
        );
      case 'analytics':
        return (
          <Suspense fallback={<LoadingFallback />}>
            <AdvancedReportingDashboard />
          </Suspense>
        );
      case 'workflow':
        return (
          <Suspense fallback={<LoadingFallback />}>
            <GuidedWorkflow
              onNavigate={setActiveView}
              onShowImport={handleShowImport}
              onShowInventoryGenerator={handleShowInventoryGenerator}
              onShowTeamManagement={handleShowTeamManagement}
              currentStats={getCurrentStats()}
            />
          </Suspense>
        );
      case 'compliance':
        return (
          <Suspense fallback={<LoadingFallback />}>
            <ComplianceManagement />
          </Suspense>
        );
      case 'privacy-compliance':
        return (
          <Suspense fallback={<LoadingFallback />}>
            <PrivacyComplianceDashboard />
          </Suspense>
        );
      case 'dependencies':
        return (
          <Suspense fallback={<LoadingFallback />}>
            <DependenciesPage />
          </Suspense>
        );
      case 'data-protection':
        return (
          <Suspense fallback={<LoadingFallback />}>
            <DataProtectionDashboard />
          </Suspense>
        );
      case 'vulnerabilities':
        return (
          <Suspense fallback={<LoadingFallback />}>
            <VulnerabilityDashboard />
          </Suspense>
        );
      case 'mitigation':
        return (
          <Suspense fallback={<LoadingFallback />}>
            <MitigationPageWrapper />
          </Suspense>
        );
      case 'business-impact':
        return (
          <Suspense fallback={<LoadingFallback />}>
            <BusinessImpactPageWrapper />
          </Suspense>
        );
      case 'nist':
        return (
          <Suspense fallback={<LoadingFallback />}>
            <NISTPageWrapper />
          </Suspense>
        );
      case 'framework':
        return (
          <Suspense fallback={<LoadingFallback />}>
            <FrameworkPageWrapper />
          </Suspense>
        );
      case 'organizations':
        return (
          <Suspense fallback={<LoadingFallback />}>
            <OrganizationManagement />
          </Suspense>
        );
      case 'users':
        return (
          <Suspense fallback={<LoadingFallback />}>
            <UserManagement />
          </Suspense>
        );
      case 'activity':
        return (
          <Suspense fallback={<LoadingFallback />}>
            <ActivityLog />
          </Suspense>
        );
      case 'settings':
        return (
          <Suspense fallback={<LoadingFallback />}>
            <SystemSettings />
          </Suspense>
        );
      case 'demo-scenarios':
        return (
          <Suspense fallback={<LoadingFallback />}>
            <DemoShowcase 
              onStartDemo={handleStartDemo}
              onViewDemo={handleViewDemo}
            />
          </Suspense>
        );
      case 'help':
        return (
          <div className="p-8">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8 text-center">
              <h2 className="text-2xl font-outfit font-bold text-gray-900 dark:text-white mb-4">
                Help & Support
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Additional support resources are under development.
              </p>
              <div className="space-y-4">
                <button
                  onClick={() => setActiveView('user-manual')}
                  className="px-6 py-3 bg-action-cyan-600 text-white rounded-lg hover:bg-action-cyan-700 transition-colors mr-4"
                >
                  View User Manual
                </button>
                <button
                  onClick={onShowStartScreen}
                  className="px-6 py-3 bg-command-blue-600 text-white rounded-lg hover:bg-command-blue-700 transition-colors mr-4"
                >
                  View Start Screen
                </button>
                <button
                  onClick={() => setActiveView('assets')}
                  className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  View Assets
                </button>
              </div>
            </div>
          </div>
        );
      default:
        return (
          <DashboardHome
            stats={stats}
            onNavigateToAssets={handleNavigateToAssets}
            onNavigateToReports={handleNavigateToReports}
            onNavigateToSettings={handleNavigateToSettings}
          />
        );
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <NavigationSidebar
        activeView={activeView}
        onViewChange={setActiveView}
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        user={user}
        onShowTeamManagement={handleShowTeamManagement}
        signOut={signOut}
      />
      
      <div className="flex-1 overflow-auto">
        <div className="p-6">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};