import React, { useState } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import { useAssetInventory } from '../contexts/AssetInventoryContext';
import { AssetInventoryHeader } from './AssetInventoryHeader';
import { AssetStatsOverview } from './AssetStatsOverview';
import { AssetFiltersPanel } from './AssetFiltersPanel';
import { AssetDataTable } from './AssetDataTable';
import { AssetDetailModal } from './AssetDetailModal';
import { AssetFormModal } from './AssetFormModal';
import { AssetImportModal } from './AssetImportModal';
import { AssetTablePagination } from './AssetTablePagination';
import { InventoryGenerator } from './InventoryGenerator';
import { BulkEditModal } from './BulkEditModal';
import { AdvancedFiltersModal } from './AdvancedFiltersModal';
import { AssetRelationshipModal } from './AssetRelationshipModal';
import { VulnerabilityManagementModal } from './VulnerabilityManagementModal';
import { ErrorBoundary } from './ErrorBoundary';
import { InsightsDashboard } from './InsightsDashboard';
import { AdvancedDataVisualization } from './AdvancedDataVisualization';
import { AutomatedReportingManager } from './reports/AutomatedReportingManager';
import { ExternalDataIntegrationManager } from './integrations/ExternalDataIntegrationManager';
import { exportToCSV } from '../utils/assetUtils';
import { handleApiError, logError } from '../utils/errorHandling';
import { SUCCESS_MESSAGES } from '../utils/constants';
import { Asset } from '../types/asset';

export const AssetInventoryDashboard: React.FC = () => {
  const {
    assets,
    filteredAssets,
    selectedAssets,
    filters,
    sortConfig,
    currentPage,
    itemsPerPage,
    selectedAsset,
    showDetailModal,
    stats,
    paginatedAssets,
    filterOptions,
    totalPages,
    loading,
    updateFilters,
    updateSort,
    setCurrentPage,
    setItemsPerPage,
    selectAsset,
    selectAllAssets,
    showAssetDetail,
    hideAssetDetail,
    deleteAssets,
    addAsset,
    updateAsset,
    replaceAssets,
  } = useAssetInventory();

  const [isFiltersPanelOpen, setIsFiltersPanelOpen] = useState(false);
  const [showInventoryGenerator, setShowInventoryGenerator] = useState(false);
  const [showAssetForm, setShowAssetForm] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showBulkEditModal, setShowBulkEditModal] = useState(false);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [showRelationshipModal, setShowRelationshipModal] = useState(false);
  const [showVulnerabilityModal, setShowVulnerabilityModal] = useState(false);
  const [showInsightsDashboard, setShowInsightsDashboard] = useState(false);
  const [showAdvancedVisualization, setShowAdvancedVisualization] = useState(false);
  const [showAutomatedReporting, setShowAutomatedReporting] = useState(false);
  const [showExternalIntegration, setShowExternalIntegration] = useState(false);
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);
  const [relationshipAsset, setRelationshipAsset] = useState<Asset | null>(null);
  const [vulnerabilityAsset, setVulnerabilityAsset] = useState<Asset | null>(null);

  const handleBulkDelete = async () => {
    if (selectedAssets.length === 0) {
      toast.error('No assets selected');
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to delete ${selectedAssets.length} asset${selectedAssets.length !== 1 ? 's' : ''}?`
    );

    if (confirmed) {
      try {
        await deleteAssets(selectedAssets);
        toast.success(`${selectedAssets.length} asset${selectedAssets.length !== 1 ? 's' : ''} deleted successfully`);
      } catch (error) {
        const errorMessage = handleApiError(error);
        toast.error(errorMessage);
        logError(error, 'AssetInventoryDashboard.handleBulkDelete');
      }
    }
  };

  const handleBulkEdit = () => {
    if (selectedAssets.length === 0) {
      toast.error('No assets selected');
      return;
    }
    setShowBulkEditModal(true);
  };

  const handleBulkEditSave = async (updates: Partial<Asset>) => {
    try {
      for (const assetId of selectedAssets) {
        await updateAsset(assetId, updates);
      }
      toast.success(`${selectedAssets.length} assets updated successfully`);
      setShowBulkEditModal(false);
    } catch (error) {
      const errorMessage = handleApiError(error);
      toast.error(errorMessage);
      logError(error, 'AssetInventoryDashboard.handleBulkEditSave');
    }
  };

  const handleExport = async () => {
    try {
      const assetsToExport = selectedAssets.length > 0 
        ? assets.filter(asset => selectedAssets.includes(asset.id))
        : filteredAssets;
      
      if (assetsToExport.length === 0) {
        toast.error('No assets to export');
        return;
      }
      
      await exportToCSV(assetsToExport);
      toast.success(`${SUCCESS_MESSAGES.ASSETS_EXPORTED} (${assetsToExport.length} assets)`);
    } catch (error) {
      const errorMessage = handleApiError(error);
      toast.error(errorMessage);
      logError(error, 'AssetInventoryDashboard.handleExport');
    }
  };

  const handleImport = () => {
    setShowImportModal(true);
  };

  const handleAddAsset = () => {
    setEditingAsset(null);
    setShowAssetForm(true);
  };

  const handleGenerateInventory = () => {
    setShowInventoryGenerator(true);
  };

  const handleInventoryGenerated = (newAssets: Asset[], scenarioName: string) => {
    try {
      replaceAssets(newAssets);
      toast.success(`Loaded ${newAssets.length} assets from ${scenarioName} scenario`);
      setShowInventoryGenerator(false);
    } catch (error) {
      const errorMessage = handleApiError(error);
      toast.error(errorMessage);
      logError(error, 'AssetInventoryDashboard.handleInventoryGenerated');
    }
  };

  const handleViewAsset = (asset: Asset) => {
    try {
      showAssetDetail(asset);
    } catch (error) {
      const errorMessage = handleApiError(error);
      toast.error(errorMessage);
      logError(error, 'AssetInventoryDashboard.handleViewAsset');
    }
  };

  const handleEditAsset = (asset: Asset) => {
    setEditingAsset(asset);
    setShowAssetForm(true);
  };

  const handleDeleteAsset = async (assetId: string) => {
    const asset = assets.find(a => a.id === assetId);
    if (!asset) return;

    const confirmed = window.confirm(`Are you sure you want to delete "${asset.name}"?`);
    if (confirmed) {
      try {
        await deleteAssets([assetId]);
        toast.success(`"${asset.name}" deleted successfully`);
      } catch (error) {
        const errorMessage = handleApiError(error);
        toast.error(errorMessage);
        logError(error, 'AssetInventoryDashboard.handleDeleteAsset');
      }
    }
  };

  const handleManageRelationships = (asset: Asset) => {
    setRelationshipAsset(asset);
    setShowRelationshipModal(true);
  };

  const handleManageVulnerabilities = (asset: Asset) => {
    setVulnerabilityAsset(asset);
    setShowVulnerabilityModal(true);
  };

  const handleSaveAsset = async (assetData: Omit<Asset, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      if (editingAsset) {
        const updatedAsset: Asset = {
          ...assetData,
          id: editingAsset.id,
          createdAt: editingAsset.createdAt,
          updatedAt: new Date(),
        };
        await updateAsset(editingAsset.id, updatedAsset);
        toast.success(SUCCESS_MESSAGES.ASSET_UPDATED);
      } else {
        const newAsset: Asset = {
          ...assetData,
          id: `asset-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        await addAsset(newAsset);
        toast.success(SUCCESS_MESSAGES.ASSET_CREATED);
      }
      setShowAssetForm(false);
      setEditingAsset(null);
    } catch (error) {
      const errorMessage = handleApiError(error);
      toast.error(errorMessage);
      logError(error, 'AssetInventoryDashboard.handleSaveAsset');
      throw error;
    }
  };

  const handleImportAssets = (importedAssets: Asset[]) => {
    try {
      importedAssets.forEach(asset => {
        addAsset(asset);
      });
      
      toast.success(`${SUCCESS_MESSAGES.ASSETS_IMPORTED} (${importedAssets.length} assets)`);
      setShowImportModal(false);
    } catch (error) {
      const errorMessage = handleApiError(error);
      toast.error(errorMessage);
      logError(error, 'AssetInventoryDashboard.handleImportAssets');
    }
  };

  const handleSaveRelationships = async (relationships: Asset['relationships']) => {
    if (!relationshipAsset) return;
    
    try {
      await updateAsset(relationshipAsset.id, { relationships });
      toast.success('Relationships updated successfully');
      setShowRelationshipModal(false);
      setRelationshipAsset(null);
    } catch (error) {
      const errorMessage = handleApiError(error);
      toast.error(errorMessage);
      logError(error, 'AssetInventoryDashboard.handleSaveRelationships');
    }
  };

  const handleSaveVulnerabilities = async (vulnerabilities: Asset['vulnerabilities']) => {
    if (!vulnerabilityAsset) return;
    
    try {
      await updateAsset(vulnerabilityAsset.id, { vulnerabilities });
      toast.success('Vulnerabilities updated successfully');
      setShowVulnerabilityModal(false);
      setVulnerabilityAsset(null);
    } catch (error) {
      const errorMessage = handleApiError(error);
      toast.error(errorMessage);
      logError(error, 'AssetInventoryDashboard.handleSaveVulnerabilities');
    }
  };

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-50 font-inter">
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
            success: {
              duration: 3000,
              iconTheme: {
                primary: '#10B981',
                secondary: '#fff',
              },
            },
            error: {
              duration: 5000,
              iconTheme: {
                primary: '#EF4444',
                secondary: '#fff',
              },
            },
          }}
        />
        
        {/* Header */}
        <AssetInventoryHeader
          filters={filters}
          updateFilters={updateFilters}
          selectedAssets={selectedAssets}
          onBulkDelete={handleBulkDelete}
          onBulkEdit={handleBulkEdit}
          onExport={handleExport}
          onImport={handleImport}
          onAddAsset={handleAddAsset}
          onGenerateInventory={handleGenerateInventory}
          onAdvancedFilters={() => setShowAdvancedFilters(true)}
          onInsightsDashboard={() => setShowInsightsDashboard(true)}
          onAdvancedVisualization={() => setShowAdvancedVisualization(true)}
          onAutomatedReporting={() => setShowAutomatedReporting(true)}
          onExternalIntegration={() => setShowExternalIntegration(true)}
        />

        {/* Stats Overview */}
        <AssetStatsOverview stats={stats} />

        {/* Main Content */}
        <div className="relative">
          {/* Filters Panel */}
          <AssetFiltersPanel
            filters={filters}
            updateFilters={updateFilters}
            filterOptions={filterOptions}
            isOpen={isFiltersPanelOpen}
            onToggle={() => setIsFiltersPanelOpen(!isFiltersPanelOpen)}
          />

          {/* Data Table */}
          <div className={`transition-all duration-300 ${isFiltersPanelOpen ? 'ml-80' : 'ml-0'}`}>
            <div className="p-6">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-outfit font-semibold text-gray-900">
                  Assets ({filteredAssets.length})
                </h2>
              </div>

              <AssetDataTable
                assets={paginatedAssets}
                selectedAssets={selectedAssets}
                sortConfig={sortConfig}
                loading={loading}
                onSort={updateSort}
                onSelectAsset={selectAsset}
                onSelectAll={selectAllAssets}
                onViewAsset={handleViewAsset}
                onEditAsset={handleEditAsset}
                onDeleteAsset={handleDeleteAsset}
                onManageRelationships={handleManageRelationships}
                onManageVulnerabilities={handleManageVulnerabilities}
              />

              <AssetTablePagination
                currentPage={currentPage}
                totalPages={totalPages}
                itemsPerPage={itemsPerPage}
                totalItems={filteredAssets.length}
                onPageChange={setCurrentPage}
                onItemsPerPageChange={setItemsPerPage}
              />
            </div>
          </div>
        </div>

        {/* Modals */}
        <AssetDetailModal
          asset={selectedAsset}
          isOpen={showDetailModal}
          onClose={hideAssetDetail}
        />

        <AssetFormModal
          asset={editingAsset}
          isOpen={showAssetForm}
          onClose={() => {
            setShowAssetForm(false);
            setEditingAsset(null);
          }}
          onSave={handleSaveAsset}
        />

        <AssetImportModal
          isOpen={showImportModal}
          onClose={() => setShowImportModal(false)}
          onImport={handleImportAssets}
        />

        <InventoryGenerator
          isOpen={showInventoryGenerator}
          onClose={() => setShowInventoryGenerator(false)}
          onInventoryGenerated={handleInventoryGenerated}
        />

        <BulkEditModal
          isOpen={showBulkEditModal}
          onClose={() => setShowBulkEditModal(false)}
          selectedAssets={assets.filter(a => selectedAssets.includes(a.id))}
          onSave={handleBulkEditSave}
        />

        <AdvancedFiltersModal
          isOpen={showAdvancedFilters}
          onClose={() => setShowAdvancedFilters(false)}
          filters={filters}
          onApplyFilters={updateFilters}
        />

        {relationshipAsset && (
          <AssetRelationshipModal
            isOpen={showRelationshipModal}
            onClose={() => {
              setShowRelationshipModal(false);
              setRelationshipAsset(null);
            }}
            asset={relationshipAsset}
            allAssets={assets}
            onSave={handleSaveRelationships}
          />
        )}

        {vulnerabilityAsset && (
          <VulnerabilityManagementModal
            isOpen={showVulnerabilityModal}
            onClose={() => {
              setShowVulnerabilityModal(false);
              setVulnerabilityAsset(null);
            }}
            asset={vulnerabilityAsset}
            onSave={handleSaveVulnerabilities}
          />
        )}

        <InsightsDashboard
          isOpen={showInsightsDashboard}
          onClose={() => setShowInsightsDashboard(false)}
          assets={assets}
        />

        <AdvancedDataVisualization
          isOpen={showAdvancedVisualization}
          onClose={() => setShowAdvancedVisualization(false)}
          assets={assets}
        />

        <AutomatedReportingManager
          onClose={() => setShowAutomatedReporting(false)}
        />

        <ExternalDataIntegrationManager
          onClose={() => setShowExternalIntegration(false)}
        />

        {/* Overlay for filters panel */}
        {isFiltersPanelOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-25 z-40 lg:hidden"
            onClick={() => setIsFiltersPanelOpen(false)}
          />
        )}
      </div>
    </ErrorBoundary>
  );
};