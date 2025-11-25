/**
 * Component exports optimized for tree-shaking and code splitting
 * Import components directly from their source files when possible
 * to enable better tree-shaking and reduce bundle size
 */

// Core components - frequently used, can be eagerly loaded
export { ErrorBoundary } from './ErrorBoundary';
export { LoadingSpinner, TableLoadingSkeleton } from './LoadingSpinner';

// Main layout components - loaded early
export { StartScreen } from './StartScreen';
export { MainLayout } from './MainLayout';
export { NavigationSidebar } from './NavigationSidebar';
export { DashboardHome } from './DashboardHome';

// Dashboard components - lazily loaded in MainLayout
export { AssetInventoryDashboard } from './AssetInventoryDashboard';
export { AssetInventoryHeader } from './AssetInventoryHeader';
export { AssetStatsOverview } from './AssetStatsOverview';
export { AssetFiltersPanel } from './AssetFiltersPanel';
export { AssetDataTable } from './AssetDataTable';
export { AssetTablePagination } from './AssetTablePagination';

// Modal components - should be lazily loaded when used
// These are re-exported for convenience but prefer lazy loading
export { AssetDetailModal } from './AssetDetailModal';
export { AssetFormModal } from './AssetFormModal';
export { AssetImportModal } from './AssetImportModal';
export { InventoryGenerator } from './InventoryGenerator';
export { BulkEditModal } from './BulkEditModal';
export { AdvancedFiltersModal } from './AdvancedFiltersModal';
export { AssetRelationshipModal } from './AssetRelationshipModal';
export { VulnerabilityManagementModal } from './VulnerabilityManagementModal';

// Secondary components
export { UserManualPage } from './UserManualPage';
export { GuidedWorkflow } from './GuidedWorkflow';

// Feature components - already lazily loaded in MainLayout
export { ComplianceManagement } from './compliance/ComplianceManagement';
export { VulnerabilityDashboard } from './vulnerabilities/VulnerabilityDashboard';
export { OrganizationManagement } from './organizations/OrganizationManagement';
export { UserManagement } from './users/UserManagement';
export { ActivityLog } from './activity/ActivityLog';
export { SystemSettings } from './settings/SystemSettings';

// DependencyManager features - lazily loaded in MainLayout
export { MitigationPage } from './mitigation/MitigationPage';
export { MitigationPageWrapper } from './mitigation/MitigationPageWrapper';
export { BusinessImpactPage } from './business-impact/BusinessImpactPage';
export { BusinessImpactPageWrapper } from './business-impact/BusinessImpactPageWrapper';
export { NISTPage } from './nist/NISTPage';
export { NISTPageWrapper } from './nist/NISTPageWrapper';
export { FrameworkPage } from './framework/FrameworkPage';
export { FrameworkPageWrapper } from './framework/FrameworkPageWrapper';
export { RiskForm } from './risks/RiskForm';