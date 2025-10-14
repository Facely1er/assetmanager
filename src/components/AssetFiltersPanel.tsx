import React from 'react';
import { Filter, X } from 'lucide-react';
import { AssetFilters } from '../types/asset';
import { assetTypes, criticalityLevels, statusOptions } from '../data/sampleAssets';

interface AssetFiltersPanelProps {
  filters: AssetFilters;
  updateFilters: (filters: Partial<AssetFilters>) => void;
  filterOptions: {
    owners: string[];
    locations: string[];
    tags: string[];
  };
  isOpen: boolean;
  onToggle: () => void;
}

export const AssetFiltersPanel: React.FC<AssetFiltersPanelProps> = ({
  filters,
  updateFilters,
  filterOptions,
  isOpen,
  onToggle,
}) => {
  const activeFiltersCount = [
    filters.types.length,
    filters.criticalities.length,
    filters.owners.length,
    filters.locations.length,
    filters.complianceFrameworks.length,
    filters.status.length,
    filters.tags.length,
  ].reduce((sum, count) => sum + count, 0);

  const clearAllFilters = () => {
    updateFilters({
      types: [],
      criticalities: [],
      owners: [],
      locations: [],
      complianceFrameworks: [],
      status: [],
      tags: [],
      riskScoreRange: [0, 100],
    });
  };

  if (!isOpen) {
    return (
      <button
        onClick={onToggle}
        className="fixed left-0 top-1/2 transform -translate-y-1/2 bg-command-blue-600 text-white p-3 rounded-r-lg shadow-lg hover:bg-command-blue-700 transition-colors z-50"
      >
        <Filter className="h-5 w-5" />
        {activeFiltersCount > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {activeFiltersCount}
          </span>
        )}
      </button>
    );
  }

  return (
    <div className="fixed inset-y-0 left-0 w-80 bg-white shadow-xl z-50 overflow-y-auto">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <Filter className="h-5 w-5 text-command-blue-600 mr-2" />
            <h2 className="text-lg font-outfit font-semibold text-gray-900">Filters</h2>
            {activeFiltersCount > 0 && (
              <span className="ml-2 bg-command-blue-100 text-command-blue-600 text-xs px-2 py-1 rounded-full">
                {activeFiltersCount}
              </span>
            )}
          </div>
          <div className="flex items-center space-x-2">
            {activeFiltersCount > 0 && (
              <button
                onClick={clearAllFilters}
                className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
              >
                Clear all
              </button>
            )}
            <button
              onClick={onToggle}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="space-y-6">
          {/* Asset Types */}
          <div>
            <h3 className="text-sm font-medium text-gray-900 mb-3">Asset Types</h3>
            <div className="space-y-2">
              {assetTypes.map((type) => (
                <label key={type} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={filters.types.includes(type)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        updateFilters({ types: [...filters.types, type] });
                      } else {
                        updateFilters({ types: filters.types.filter(t => t !== type) });
                      }
                    }}
                    className="h-4 w-4 text-command-blue-600 focus:ring-command-blue-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">{type}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Criticality */}
          <div>
            <h3 className="text-sm font-medium text-gray-900 mb-3">Criticality</h3>
            <div className="space-y-2">
              {criticalityLevels.map((level) => (
                <label key={level} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={filters.criticalities.includes(level)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        updateFilters({ criticalities: [...filters.criticalities, level] });
                      } else {
                        updateFilters({ criticalities: filters.criticalities.filter(c => c !== level) });
                      }
                    }}
                    className="h-4 w-4 text-command-blue-600 focus:ring-command-blue-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">{level}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Status */}
          <div>
            <h3 className="text-sm font-medium text-gray-900 mb-3">Status</h3>
            <div className="space-y-2">
              {statusOptions.map((status) => (
                <label key={status} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={filters.status.includes(status)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        updateFilters({ status: [...filters.status, status] });
                      } else {
                        updateFilters({ status: filters.status.filter(s => s !== status) });
                      }
                    }}
                    className="h-4 w-4 text-command-blue-600 focus:ring-command-blue-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">{status}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Owners */}
          <div>
            <h3 className="text-sm font-medium text-gray-900 mb-3">Owners</h3>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {filterOptions.owners.map((owner) => (
                <label key={owner} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={filters.owners.includes(owner)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        updateFilters({ owners: [...filters.owners, owner] });
                      } else {
                        updateFilters({ owners: filters.owners.filter(o => o !== owner) });
                      }
                    }}
                    className="h-4 w-4 text-command-blue-600 focus:ring-command-blue-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">{owner}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Locations */}
          <div>
            <h3 className="text-sm font-medium text-gray-900 mb-3">Locations</h3>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {filterOptions.locations.map((location) => (
                <label key={location} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={filters.locations.includes(location)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        updateFilters({ locations: [...filters.locations, location] });
                      } else {
                        updateFilters({ locations: filters.locations.filter(l => l !== location) });
                      }
                    }}
                    className="h-4 w-4 text-command-blue-600 focus:ring-command-blue-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">{location}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Risk Score Range */}
          <div>
            <h3 className="text-sm font-medium text-gray-900 mb-3">Risk Score Range</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={filters.riskScoreRange[0]}
                  onChange={(e) => updateFilters({ 
                    riskScoreRange: [parseInt(e.target.value), filters.riskScoreRange[1]] 
                  })}
                  className="w-20 px-3 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-command-blue-500 focus:border-command-blue-500"
                />
                <span className="text-gray-500">to</span>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={filters.riskScoreRange[1]}
                  onChange={(e) => updateFilters({ 
                    riskScoreRange: [filters.riskScoreRange[0], parseInt(e.target.value)] 
                  })}
                  className="w-20 px-3 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-command-blue-500 focus:border-command-blue-500"
                />
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={filters.riskScoreRange[1]}
                onChange={(e) => updateFilters({ 
                  riskScoreRange: [filters.riskScoreRange[0], parseInt(e.target.value)] 
                })}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};