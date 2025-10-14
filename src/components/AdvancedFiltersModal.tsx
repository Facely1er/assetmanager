import React, { useState, useEffect } from 'react';
import { X, Filter, Calendar, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';
import { AssetFilters } from '../types/asset';

interface AdvancedFiltersModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyFilters: (filters: Partial<AssetFilters>) => void;
}

interface AdvancedFilterState {
  createdAfter?: string;
  lastAssessedBefore?: string;
  minRiskScore: number;
  hasVulnerabilities?: 'yes' | 'no' | '';
  missingCompliance: boolean;
  overdueAssessment: boolean;
  multipleFrameworks: boolean;
  hasDependencies: boolean;
  isolatedAssets: boolean;
  criticalPathAssets: boolean;
}

export const AdvancedFiltersModal: React.FC<AdvancedFiltersModalProps> = ({
  isOpen,
  onClose,
  onApplyFilters,
}) => {
  const [localFilters, setLocalFilters] = useState<AdvancedFilterState>({
    minRiskScore: 0,
    hasVulnerabilities: '',
    missingCompliance: false,
    overdueAssessment: false,
    multipleFrameworks: false,
    hasDependencies: false,
    isolatedAssets: false,
    criticalPathAssets: false,
  });

  const [activeFiltersCount, setActiveFiltersCount] = useState(0);

  useEffect(() => {
    // Count active filters
    let count = 0;
    if (localFilters.createdAfter) count++;
    if (localFilters.lastAssessedBefore) count++;
    if (localFilters.minRiskScore > 0) count++;
    if (localFilters.hasVulnerabilities) count++;
    if (localFilters.missingCompliance) count++;
    if (localFilters.overdueAssessment) count++;
    if (localFilters.multipleFrameworks) count++;
    if (localFilters.hasDependencies) count++;
    if (localFilters.isolatedAssets) count++;
    if (localFilters.criticalPathAssets) count++;
    
    setActiveFiltersCount(count);
  }, [localFilters]);

  const handleApply = () => {
    // Convert advanced filters to basic filter format
    const updatedFilters: Partial<AssetFilters> = {};
    
    // Apply risk score filter
    if (localFilters.minRiskScore > 0) {
      updatedFilters.riskScoreRange = [localFilters.minRiskScore, 100];
    }
    
    // Note: Other advanced filters would require backend support
    // For now, we'll just apply what we can with the current filter system
    
    onApplyFilters(updatedFilters);
    onClose();
  };

  const handleReset = () => {
    setLocalFilters({
      minRiskScore: 0,
      hasVulnerabilities: '',
      missingCompliance: false,
      overdueAssessment: false,
      multipleFrameworks: false,
      hasDependencies: false,
      isolatedAssets: false,
      criticalPathAssets: false,
    });
    
    onApplyFilters({
      types: [],
      criticalities: [],
      owners: [],
      locations: [],
      complianceFrameworks: [],
      status: [],
      tags: [],
      riskScoreRange: [0, 100],
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-4 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-white bg-opacity-20 rounded-lg">
                <Filter className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-xl font-outfit font-bold">Advanced Filters</h2>
                <p className="text-sm opacity-90">
                  Apply complex filtering criteria
                  {activeFiltersCount > 0 && (
                    <span className="ml-2 bg-white bg-opacity-20 px-2 py-1 rounded-full text-xs">
                      {activeFiltersCount} active
                    </span>
                  )}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Date Range Filters */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Calendar className="h-5 w-5 mr-2" />
                Date Filters
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Created After
                  </label>
                  <input
                    type="date"
                    value={localFilters.createdAfter || ''}
                    onChange={(e) => setLocalFilters({ ...localFilters, createdAfter: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Last Assessed Before
                  </label>
                  <input
                    type="date"
                    value={localFilters.lastAssessedBefore || ''}
                    onChange={(e) => setLocalFilters({ ...localFilters, lastAssessedBefore: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>
            </div>

            {/* Risk Assessment */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <TrendingUp className="h-5 w-5 mr-2" />
                Risk Assessment
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Minimum Risk Score: {localFilters.minRiskScore}
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={localFilters.minRiskScore}
                    onChange={(e) => setLocalFilters({ ...localFilters, minRiskScore: parseInt(e.target.value) })}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>0</span>
                    <span>50</span>
                    <span>100</span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Has Vulnerabilities
                  </label>
                  <select 
                    value={localFilters.hasVulnerabilities}
                    onChange={(e) => setLocalFilters({ ...localFilters, hasVulnerabilities: e.target.value as 'yes' | 'no' | '' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="">Any</option>
                    <option value="yes">Yes</option>
                    <option value="no">No</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Compliance Status */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <AlertTriangle className="h-5 w-5 mr-2" />
                Compliance Status
              </h3>
              <div className="space-y-3">
                <label className="flex items-center">
                  <input 
                    type="checkbox" 
                    checked={localFilters.missingCompliance}
                    onChange={(e) => setLocalFilters({ ...localFilters, missingCompliance: e.target.checked })}
                    className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded" 
                  />
                  <span className="ml-2 text-sm text-gray-700">Missing compliance frameworks</span>
                </label>
                <label className="flex items-center">
                  <input 
                    type="checkbox" 
                    checked={localFilters.overdueAssessment}
                    onChange={(e) => setLocalFilters({ ...localFilters, overdueAssessment: e.target.checked })}
                    className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded" 
                  />
                  <span className="ml-2 text-sm text-gray-700">Overdue for assessment</span>
                </label>
                <label className="flex items-center">
                  <input 
                    type="checkbox" 
                    checked={localFilters.multipleFrameworks}
                    onChange={(e) => setLocalFilters({ ...localFilters, multipleFrameworks: e.target.checked })}
                    className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded" 
                  />
                  <span className="ml-2 text-sm text-gray-700">Multiple frameworks</span>
                </label>
              </div>
            </div>

            {/* Asset Relationships */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Asset Relationships
              </h3>
              <div className="space-y-3">
                <label className="flex items-center">
                  <input 
                    type="checkbox" 
                    checked={localFilters.hasDependencies}
                    onChange={(e) => setLocalFilters({ ...localFilters, hasDependencies: e.target.checked })}
                    className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded" 
                  />
                  <span className="ml-2 text-sm text-gray-700">Has dependencies</span>
                </label>
                <label className="flex items-center">
                  <input 
                    type="checkbox" 
                    checked={localFilters.isolatedAssets}
                    onChange={(e) => setLocalFilters({ ...localFilters, isolatedAssets: e.target.checked })}
                    className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded" 
                  />
                  <span className="ml-2 text-sm text-gray-700">Isolated assets</span>
                </label>
                <label className="flex items-center">
                  <input 
                    type="checkbox" 
                    checked={localFilters.criticalPathAssets}
                    onChange={(e) => setLocalFilters({ ...localFilters, criticalPathAssets: e.target.checked })}
                    className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded" 
                  />
                  <span className="ml-2 text-sm text-gray-700">Critical path assets</span>
                </label>
              </div>
            </div>
          </div>

          {/* Filter Preview */}
          {activeFiltersCount > 0 && (
            <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center mb-2">
                <CheckCircle className="h-5 w-5 text-blue-600 mr-2" />
                <h4 className="font-medium text-blue-900">Active Filters Preview</h4>
              </div>
              <div className="text-sm text-blue-800">
                {activeFiltersCount} advanced filter{activeFiltersCount !== 1 ? 's' : ''} will be applied to your asset search.
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 flex justify-between">
          <button
            onClick={handleReset}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
          >
            Reset All Filters
          </button>
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleApply}
              className="inline-flex items-center px-4 py-2 bg-purple-600 border border-transparent rounded-lg text-sm font-medium text-white hover:bg-purple-700 transition-colors"
            >
              <Filter className="h-4 w-4 mr-2" />
              Apply Filters
              {activeFiltersCount > 0 && (
                <span className="ml-2 bg-white bg-opacity-20 px-2 py-1 rounded-full text-xs">
                  {activeFiltersCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};