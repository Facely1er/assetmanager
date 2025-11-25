import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Filter, Plus } from 'lucide-react';
import { MitigationAction } from '../../types/mitigation';
import { Risk } from '../../types/risk';
import { Asset } from '../../types/asset';
import { ProgressBar } from './ProgressBar';

interface MitigationListProps {
  mitigationActions: MitigationAction[];
  risks: Risk[];
  assets?: Asset[];
  onAddAction: () => void;
  onEditAction: (action: MitigationAction) => void;
}

export const MitigationList: React.FC<MitigationListProps> = ({ 
  mitigationActions, 
  risks,
  assets = [],
  onAddAction,
  onEditAction
}) => {
  const [sortField, setSortField] = useState<keyof MitigationAction>('dueDate');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [filters, setFilters] = useState({
    riskId: '',
    status: '',
  });
  const [showFilters, setShowFilters] = useState(false);

  const handleSort = (field: keyof MitigationAction) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getRiskName = (id: string) => {
    const risk = risks.find(r => r.id === id);
    return risk ? risk.name : 'Unknown Risk';
  };

  const getAssetForRisk = (riskId: string) => {
    const risk = risks.find(r => r.id === riskId);
    if (!risk) return 'Unknown Asset';
    
    const asset = assets.find(a => a.id === risk.assetId);
    return asset ? asset.name : 'Unknown Asset';
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'in-progress': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDate = (dateString: string | Date) => {
    const date = dateString instanceof Date ? dateString : new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const filteredActions = mitigationActions.filter((action) => {
    const matchesRisk = filters.riskId ? action.riskId === filters.riskId : true;
    const matchesStatus = filters.status ? action.status === filters.status : true;
    
    return matchesRisk && matchesStatus;
  });

  const sortedActions = [...filteredActions].sort((a, b) => {
    if (sortField === 'dueDate') {
      const aDate = new Date(a.dueDate).getTime();
      const bDate = new Date(b.dueDate).getTime();
      return sortDirection === 'asc' ? aDate - bDate : bDate - aDate;
    }
    
    const aValue = a[sortField];
    const bValue = b[sortField];
    
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortDirection === 'asc' 
        ? aValue.localeCompare(bValue) 
        : bValue.localeCompare(aValue);
    }
    
    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
    }
    
    return 0;
  });

  const getSortIcon = (field: keyof MitigationAction) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? <ChevronUp size={16} /> : <ChevronDown size={16} />;
  };

  const isOverdue = (action: MitigationAction) => {
    if (action.status === 'completed' || action.status === 'cancelled') return false;
    const dueDate = new Date(action.dueDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return dueDate < today;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
        <div className="w-full md:w-auto">
          <h3 className="text-lg font-semibold text-gray-900">Mitigation Actions</h3>
          <p className="text-sm text-gray-500">
            Track and manage risk mitigation efforts
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-1 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-md text-sm transition-colors"
          >
            <Filter size={16} />
            Filters
          </button>
          <button
            onClick={onAddAction}
            className="flex items-center gap-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm transition-colors"
          >
            <Plus size={16} />
            Add Action
          </button>
        </div>
      </div>
      
      {showFilters && (
        <div className="mb-4 p-4 bg-gray-50 rounded-md flex flex-wrap gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Related Risk</label>
            <select
              value={filters.riskId}
              onChange={(e) => setFilters({ ...filters, riskId: e.target.value })}
              className="w-full sm:w-auto px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Risks</option>
              {risks.map((risk) => (
                <option key={risk.id} value={risk.id}>{risk.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="w-full sm:w-auto px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={() => setFilters({ riskId: '', status: '' })}
              className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        </div>
      )}
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('name')}
              >
                <div className="flex items-center gap-1">
                  Action {getSortIcon('name')}
                </div>
              </th>
              <th
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('riskId')}
              >
                <div className="flex items-center gap-1">
                  Risk / Asset {getSortIcon('riskId')}
                </div>
              </th>
              <th
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('assignee')}
              >
                <div className="flex items-center gap-1">
                  Assignee {getSortIcon('assignee')}
                </div>
              </th>
              <th
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('dueDate')}
              >
                <div className="flex items-center gap-1">
                  Due Date {getSortIcon('dueDate')}
                </div>
              </th>
              <th
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('status')}
              >
                <div className="flex items-center gap-1">
                  Status {getSortIcon('status')}
                </div>
              </th>
              <th
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('progress')}
              >
                <div className="flex items-center gap-1">
                  Progress {getSortIcon('progress')}
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedActions.map((action) => (
              <tr 
                key={action.id} 
                className={`hover:bg-gray-50 cursor-pointer transition-colors ${
                  isOverdue(action) ? 'bg-red-50' : ''
                }`}
                onClick={() => onEditAction(action)}
              >
                <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                  {action.name}
                  {isOverdue(action) && (
                    <span className="ml-2 text-xs text-red-600 font-medium">OVERDUE</span>
                  )}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                  <div>{getRiskName(action.riskId)}</div>
                  <div className="text-xs text-gray-400">{getAssetForRisk(action.riskId)}</div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                  {action.assignee}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                  {formatDate(action.dueDate)}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusClass(action.status)}`}>
                    {action.status}
                  </span>
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                  <div className="flex items-center">
                    <div className="w-24 mr-2">
                      <ProgressBar progress={action.progress} />
                    </div>
                    <span>{action.progress}%</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {sortedActions.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No mitigation actions found matching your criteria.
          </div>
        )}
      </div>
      <div className="mt-4 text-sm text-gray-500">
        Showing {sortedActions.length} of {mitigationActions.length} actions
      </div>
    </div>
  );
};

