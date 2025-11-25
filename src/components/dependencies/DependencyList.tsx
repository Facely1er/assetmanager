import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Filter, Plus, Edit, Trash2 } from 'lucide-react';
import { Dependency } from '../../types/dependency';
import { Asset } from '../../types/asset';

interface DependencyListProps {
  dependencies: Dependency[];
  assets: Asset[];
  onAddDependency: () => void;
  onEditDependency: (dependency: Dependency) => void;
  onDeleteDependency?: (dependency: Dependency) => void;
}

export const DependencyList: React.FC<DependencyListProps> = ({ 
  dependencies, 
  assets, 
  onAddDependency,
  onEditDependency,
  onDeleteDependency
}) => {
  const [sortField, setSortField] = useState<keyof Dependency>('id');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [filters, setFilters] = useState({
    sourceId: '',
    targetId: '',
    strength: '',
    type: '',
  });
  const [showFilters, setShowFilters] = useState(false);

  const handleSort = (field: keyof Dependency) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getStrengthClass = (strength: string) => {
    const normalizedStrength = strength.toLowerCase();
    switch (normalizedStrength) {
      case 'critical':
      case 'strong':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
      case 'weak':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const filteredDependencies = dependencies.filter((dependency) => {
    const matchesSourceId = filters.sourceId ? dependency.sourceId === filters.sourceId : true;
    const matchesTargetId = filters.targetId ? dependency.targetId === filters.targetId : true;
    const matchesStrength = filters.strength 
      ? dependency.strength.toLowerCase() === filters.strength.toLowerCase() 
      : true;
    const matchesType = filters.type ? dependency.type === filters.type : true;
    
    return matchesSourceId && matchesTargetId && matchesStrength && matchesType;
  });

  const sortedDependencies = [...filteredDependencies].sort((a, b) => {
    // Special case for source and target which need to be sorted by name
    if (sortField === 'sourceId' || sortField === 'sourceName') {
      const aName = a.sourceName;
      const bName = b.sourceName;
      return sortDirection === 'asc' 
        ? aName.localeCompare(bName)
        : bName.localeCompare(aName);
    }
    
    if (sortField === 'targetId' || sortField === 'targetName') {
      const aName = a.targetName;
      const bName = b.targetName;
      return sortDirection === 'asc' 
        ? aName.localeCompare(bName)
        : bName.localeCompare(aName);
    }
    
    // Default sorting
    const aValue = a[sortField];
    const bValue = b[sortField];
    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  const getSortIcon = (field: keyof Dependency) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? <ChevronUp size={16} /> : <ChevronDown size={16} />;
  };

  // Get unique types and strengths for filter dropdowns
  const uniqueTypes = Array.from(new Set(dependencies.map(d => d.type))).sort();
  const uniqueStrengths = Array.from(new Set(dependencies.map(d => {
    const s = d.strength.toLowerCase();
    if (s === 'strong') return 'critical';
    if (s === 'weak') return 'low';
    return s;
  }))).sort();

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
        <div className="w-full md:w-auto">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Dependencies</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Manage relationships between technology assets
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-1 px-3 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-md text-sm transition-colors"
          >
            <Filter size={16} />
            Filters
          </button>
          <button
            onClick={onAddDependency}
            className="flex items-center gap-1 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-sm transition-colors"
          >
            <Plus size={16} />
            Add Dependency
          </button>
        </div>
      </div>
      
      {showFilters && (
        <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-md flex flex-wrap gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Source Asset</label>
            <select
              value={filters.sourceId}
              onChange={(e) => setFilters({ ...filters, sourceId: e.target.value })}
              className="w-full sm:w-auto px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-800 dark:text-white"
            >
              <option value="">All Sources</option>
              {assets.map((asset) => (
                <option key={asset.id} value={asset.id}>{asset.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Target Asset</label>
            <select
              value={filters.targetId}
              onChange={(e) => setFilters({ ...filters, targetId: e.target.value })}
              className="w-full sm:w-auto px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-800 dark:text-white"
            >
              <option value="">All Targets</option>
              {assets.map((asset) => (
                <option key={asset.id} value={asset.id}>{asset.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Type</label>
            <select
              value={filters.type}
              onChange={(e) => setFilters({ ...filters, type: e.target.value })}
              className="w-full sm:w-auto px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-800 dark:text-white"
            >
              <option value="">All Types</option>
              {uniqueTypes.map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Strength</label>
            <select
              value={filters.strength}
              onChange={(e) => setFilters({ ...filters, strength: e.target.value })}
              className="w-full sm:w-auto px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-800 dark:text-white"
            >
              <option value="">All Strengths</option>
              <option value="critical">Critical/Strong</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low/Weak</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={() => setFilters({ sourceId: '', targetId: '', strength: '', type: '' })}
              className="px-3 py-2 text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
            >
              Clear Filters
            </button>
          </div>
        </div>
      )}
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={() => handleSort('sourceName')}
              >
                <div className="flex items-center gap-1">
                  Source {getSortIcon('sourceName')}
                </div>
              </th>
              <th
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={() => handleSort('targetName')}
              >
                <div className="flex items-center gap-1">
                  Target {getSortIcon('targetName')}
                </div>
              </th>
              <th
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={() => handleSort('type')}
              >
                <div className="flex items-center gap-1">
                  Type {getSortIcon('type')}
                </div>
              </th>
              <th
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={() => handleSort('strength')}
              >
                <div className="flex items-center gap-1">
                  Strength {getSortIcon('strength')}
                </div>
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Description
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {sortedDependencies.map((dependency) => (
              <tr 
                key={dependency.id} 
                className="hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                  {dependency.sourceName}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                  {dependency.targetName}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 capitalize">
                  {dependency.type}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStrengthClass(dependency.strength)}`}>
                    {dependency.strength}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400 truncate max-w-xs">
                  {dependency.description || dependency.purpose || '-'}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onEditDependency(dependency)}
                      className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                      title="Edit dependency"
                    >
                      <Edit size={16} />
                    </button>
                    {onDeleteDependency && (
                      <button
                        onClick={() => onDeleteDependency(dependency)}
                        className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                        title="Delete dependency"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {sortedDependencies.length === 0 && (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            No dependencies found matching your criteria.
          </div>
        )}
      </div>
      <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
        Showing {sortedDependencies.length} of {dependencies.length} dependencies
      </div>
    </div>
  );
};

