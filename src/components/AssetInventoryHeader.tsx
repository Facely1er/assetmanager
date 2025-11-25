import React from 'react';
import { Search, Download, Upload, Plus, Trash2, Edit3, Shield, Building2, Filter, BarChart3, TrendingUp, FileText, Database } from 'lucide-react';
import { AssetFilters } from '../types/asset';

interface AssetInventoryHeaderProps {
  filters: AssetFilters;
  updateFilters: (filters: Partial<AssetFilters>) => void;
  selectedAssets: string[];
  onBulkDelete: () => void;
  onBulkEdit: () => void;
  onExport: () => void;
  onImport: () => void;
  onAddAsset: () => void;
  onGenerateInventory?: () => void;
  onAdvancedFilters?: () => void;
  onInsightsDashboard?: () => void;
  onAdvancedVisualization?: () => void;
  onAutomatedReporting?: () => void;
  onExternalIntegration?: () => void;
}

export const AssetInventoryHeader: React.FC<AssetInventoryHeaderProps> = ({
  filters,
  updateFilters,
  selectedAssets,
  onBulkDelete,
  onBulkEdit,
  onExport,
  onImport,
  onAddAsset,
  onGenerateInventory,
  onAdvancedFilters,
  onInsightsDashboard,
  onAdvancedVisualization,
  onAutomatedReporting,
  onExternalIntegration,
}) => {
  return (
    <div className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <Shield className="h-8 w-8 text-command-blue-600" />
          <div>
            <h1 className="text-2xl font-outfit font-bold text-gray-900 leading-tight">
              CyberSoluce<sup className="text-lg">™</sup>
            </h1>
            <p className="text-sm font-semibold text-gray-700">Asset Manager</p>
            <p className="text-xs text-gray-500">by ERMITS</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          {onInsightsDashboard && (
            <button
              onClick={onInsightsDashboard}
              className="inline-flex items-center px-4 py-2 border border-green-300 rounded-lg text-sm font-medium text-green-700 bg-green-50 hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              Insights
            </button>
          )}
          
          {onAdvancedVisualization && (
            <button
              onClick={onAdvancedVisualization}
              className="inline-flex items-center px-4 py-2 border border-indigo-300 rounded-lg text-sm font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
            >
              <TrendingUp className="h-4 w-4 mr-2" />
              Analytics
            </button>
          )}
          
          {onAutomatedReporting && (
            <button
              onClick={onAutomatedReporting}
              className="inline-flex items-center px-4 py-2 border border-orange-300 rounded-lg text-sm font-medium text-orange-700 bg-orange-50 hover:bg-orange-100 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
            >
              <FileText className="h-4 w-4 mr-2" />
              Reports
            </button>
          )}
          
          {onExternalIntegration && (
            <button
              onClick={onExternalIntegration}
              className="inline-flex items-center px-4 py-2 border border-cyan-300 rounded-lg text-sm font-medium text-cyan-700 bg-cyan-50 hover:bg-cyan-100 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors"
            >
              <Database className="h-4 w-4 mr-2" />
              Integrations
            </button>
          )}
          
          {onAdvancedFilters && (
            <button
              onClick={onAdvancedFilters}
              className="inline-flex items-center px-4 py-2 border border-purple-300 rounded-lg text-sm font-medium text-purple-700 bg-purple-50 hover:bg-purple-100 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
            >
              <Filter className="h-4 w-4 mr-2" />
              Advanced Filters
            </button>
          )}
          
          {onGenerateInventory && (
            <button
              onClick={onGenerateInventory}
              className="inline-flex items-center px-4 py-2 border border-command-blue-300 rounded-lg text-sm font-medium text-command-blue-700 bg-command-blue-50 hover:bg-command-blue-100 focus:outline-none focus:ring-2 focus:ring-command-blue-500 focus:border-command-blue-500 transition-colors"
            >
              <Building2 className="h-4 w-4 mr-2" />
              Generate Inventory
            </button>
          )}
          
          <button
            onClick={onExport}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-command-blue-500 focus:border-command-blue-500 transition-colors"
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </button>
          
          <button
            onClick={onImport}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-command-blue-500 focus:border-command-blue-500 transition-colors"
          >
            <Upload className="h-4 w-4 mr-2" />
            Import
          </button>
          
          <button
            onClick={onAddAsset}
            className="inline-flex items-center px-4 py-2 bg-command-blue-600 border border-transparent rounded-lg text-sm font-medium text-white hover:bg-command-blue-700 focus:outline-none focus:ring-2 focus:ring-command-blue-500 focus:ring-offset-2 transition-colors"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Asset
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex-1 max-w-lg">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search assets by name, description, owner, location, tags..."
              value={filters.search}
              onChange={(e) => updateFilters({ search: e.target.value })}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-command-blue-500 focus:border-command-blue-500 sm:text-sm transition-colors"
            />
          </div>
        </div>

        {selectedAssets.length > 0 && (
          <div className="flex items-center space-x-3 ml-6">
            <span className="text-sm text-gray-700">
              {selectedAssets.length} asset{selectedAssets.length !== 1 ? 's' : ''} selected
            </span>
            
            <button
              onClick={onBulkEdit}
              className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-command-blue-500 focus:border-command-blue-500 transition-colors"
            >
              <Edit3 className="h-4 w-4 mr-2" />
              Edit
            </button>
            
            <button
              onClick={onBulkDelete}
              className="inline-flex items-center px-3 py-2 border border-red-300 rounded-lg text-sm font-medium text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </button>
          </div>
        )}
      </div>
    </div>
  );
};