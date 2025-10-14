import React from 'react';
import { ChevronUp, ChevronDown, Eye, Edit, Trash2, Network, AlertTriangle } from 'lucide-react';
import { Asset, SortConfig } from '../types/asset';
import { getCriticalityColor, getStatusColor, getRiskScoreColor } from '../utils/assetUtils';
import { format } from 'date-fns';
import { TableLoadingSkeleton } from './LoadingSpinner';

interface AssetDataTableProps {
  assets: Asset[];
  selectedAssets: string[];
  sortConfig: SortConfig;
  loading?: boolean;
  onSort: (key: keyof Asset) => void;
  onSelectAsset: (assetId: string) => void;
  onSelectAll: () => void;
  onViewAsset: (asset: Asset) => void;
  onEditAsset: (asset: Asset) => void;
  onDeleteAsset: (assetId: string) => void;
  onManageRelationships?: (asset: Asset) => void;
  onManageVulnerabilities?: (asset: Asset) => void;
}

export const AssetDataTable: React.FC<AssetDataTableProps> = ({
  assets,
  selectedAssets,
  sortConfig,
  loading = false,
  onSort,
  onSelectAsset,
  onSelectAll,
  onViewAsset,
  onEditAsset,
  onDeleteAsset,
  onManageRelationships,
  onManageVulnerabilities,
}) => {
  const [expandedRow] = React.useState<string | null>(null);
  const [contextMenu, setContextMenu] = React.useState<{ x: number; y: number; assetId: string } | null>(null);

  const handleContextMenu = (e: React.MouseEvent, assetId: string) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, assetId });
  };

  const closeContextMenu = React.useCallback(() => {
    setContextMenu(null);
  }, []);

  React.useEffect(() => {
    const handleClick = () => closeContextMenu();
    const handleScroll = () => closeContextMenu();
    
    document.addEventListener('click', handleClick);
    document.addEventListener('scroll', handleScroll);
    
    return () => {
      document.removeEventListener('click', handleClick);
      document.removeEventListener('scroll', handleScroll);
    };
  }, [closeContextMenu]);

  const SortableHeader: React.FC<{ sortKey: keyof Asset; children: React.ReactNode; className?: string }> = ({
    sortKey,
    children,
    className = '',
  }) => (
    <th
      className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-50 transition-colors select-none ${className}`}
      onClick={() => onSort(sortKey)}
      role="columnheader"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSort(sortKey);
        }
      }}
    >
      <div className="flex items-center space-x-1">
        <span>{children}</span>
        {sortConfig.key === sortKey && (
          sortConfig.direction === 'asc' ? 
            <ChevronUp className="h-4 w-4" aria-label="Sorted ascending" /> :
            <ChevronDown className="h-4 w-4" aria-label="Sorted descending" />
        )}
      </div>
    </th>
  );

  if (loading) {
    return <TableLoadingSkeleton />;
  }

  if (assets.length === 0) {
    return (
      <div className="bg-white shadow-sm rounded-lg p-8 text-center">
        <p className="text-gray-500">No assets found matching your criteria.</p>
      </div>
    );
  }

  return (
    <div className="bg-white shadow-sm rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200" role="table">
          <thead className="bg-gray-50 sticky top-0 z-10">
            <tr role="row">
              <th className="px-6 py-3 text-left" role="columnheader">
                <input
                  type="checkbox"
                  checked={selectedAssets.length === assets.length && assets.length > 0}
                  onChange={onSelectAll}
                  className="h-4 w-4 text-command-blue-600 focus:ring-command-blue-500 border-gray-300 rounded"
                  aria-label="Select all assets"
                />
              </th>
              <SortableHeader sortKey="name">Name</SortableHeader>
              <SortableHeader sortKey="type">Type</SortableHeader>
              <SortableHeader sortKey="criticality">Criticality</SortableHeader>
              <SortableHeader sortKey="owner">Owner</SortableHeader>
              <SortableHeader sortKey="location">Location</SortableHeader>
              <SortableHeader sortKey="riskScore">Risk Score</SortableHeader>
              <SortableHeader sortKey="status">Status</SortableHeader>
              <SortableHeader sortKey="lastAssessed">Last Assessed</SortableHeader>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" role="columnheader">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {assets.map((asset) => (
              <React.Fragment key={asset.id}>
                <tr
                  className={`hover:bg-gray-50 transition-colors ${
                    selectedAssets.includes(asset.id) ? 'bg-command-blue-50' : ''
                  }`}
                  onContextMenu={(e) => handleContextMenu(e, asset.id)}
                  role="row"
                >
                  <td className="px-6 py-4 whitespace-nowrap" role="gridcell">
                    <input
                      type="checkbox"
                      checked={selectedAssets.includes(asset.id)}
                      onChange={() => onSelectAsset(asset.id)}
                      className="h-4 w-4 text-command-blue-600 focus:ring-command-blue-500 border-gray-300 rounded"
                      aria-label={`Select ${asset.name}`}
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap" role="gridcell">
                    <div className="flex items-center">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{asset.name}</div>
                        <div className="text-sm text-gray-500 truncate max-w-xs" title={asset.description}>
                          {asset.description}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap" role="gridcell">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      {asset.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap" role="gridcell">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getCriticalityColor(asset.criticality)}`}>
                      {asset.criticality}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900" role="gridcell">{asset.owner}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900" role="gridcell">{asset.location}</td>
                  <td className="px-6 py-4 whitespace-nowrap" role="gridcell">
                    <div className="flex items-center">
                      <div className={`text-sm font-medium px-2 py-1 rounded ${getRiskScoreColor(asset.riskScore)}`}>
                        {asset.riskScore}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap" role="gridcell">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(asset.status)}`}>
                      {asset.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900" role="gridcell">
                    {format(asset.lastAssessed, 'MMM dd, yyyy')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium" role="gridcell">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => onViewAsset(asset)}
                        className="text-command-blue-600 hover:text-command-blue-900 transition-colors focus:outline-none focus:ring-2 focus:ring-command-blue-500 focus:ring-offset-2 rounded"
                        title="View details"
                        aria-label={`View details for ${asset.name}`}
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => onEditAsset(asset)}
                        className="text-gray-600 hover:text-gray-900 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 rounded"
                        title="Edit asset"
                        aria-label={`Edit ${asset.name}`}
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      {onManageRelationships && (
                        <button
                          onClick={() => onManageRelationships(asset)}
                          className="text-indigo-600 hover:text-indigo-900 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 rounded"
                          title="Manage relationships"
                          aria-label={`Manage relationships for ${asset.name}`}
                        >
                          <Network className="h-4 w-4" />
                        </button>
                      )}
                      {onManageVulnerabilities && (
                        <button
                          onClick={() => onManageVulnerabilities(asset)}
                          className="text-red-600 hover:text-red-900 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 rounded"
                          title="Manage vulnerabilities"
                          aria-label={`Manage vulnerabilities for ${asset.name}`}
                        >
                          <AlertTriangle className="h-4 w-4" />
                        </button>
                      )}
                      <button
                        onClick={() => onDeleteAsset(asset.id)}
                        className="text-red-600 hover:text-red-900 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 rounded"
                        title="Delete asset"
                        aria-label={`Delete ${asset.name}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
                {expandedRow === asset.id && (
                  <tr className="bg-gray-50" role="row">
                    <td colSpan={10} className="px-6 py-4" role="gridcell">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div>
                          <h4 className="text-sm font-medium text-gray-900 mb-2">Tags</h4>
                          <div className="flex flex-wrap gap-1">
                            {asset.tags.map((tag) => (
                              <span
                                key={tag}
                                className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-gray-900 mb-2">Compliance</h4>
                          <div className="flex flex-wrap gap-1">
                            {asset.complianceFrameworks.map((framework) => (
                              <span
                                key={framework}
                                className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-green-100 text-green-800"
                              >
                                {framework}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-gray-900 mb-2">Vulnerabilities</h4>
                          <p className="text-sm text-gray-600">
                            {asset.vulnerabilities.length} vulnerabilities found
                          </p>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

      {/* Context Menu */}
      {contextMenu && (
        <div
          className="fixed bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50"
          style={{ 
            top: Math.min(contextMenu.y, window.innerHeight - 200), 
            left: Math.min(contextMenu.x, window.innerWidth - 200) 
          }}
          role="menu"
        >
          <button
            onClick={() => {
              const asset = assets.find(a => a.id === contextMenu.assetId);
              if (asset) onViewAsset(asset);
              closeContextMenu();
            }}
            className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center text-sm focus:outline-none focus:bg-gray-50"
            role="menuitem"
          >
            <Eye className="h-4 w-4 mr-2" />
            View Details
          </button>
          <button
            onClick={() => {
              const asset = assets.find(a => a.id === contextMenu.assetId);
              if (asset) onEditAsset(asset);
              closeContextMenu();
            }}
            className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center text-sm focus:outline-none focus:bg-gray-50"
            role="menuitem"
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit Asset
          </button>
          {onManageRelationships && (
            <button
              onClick={() => {
                const asset = assets.find(a => a.id === contextMenu.assetId);
                if (asset) onManageRelationships(asset);
                closeContextMenu();
              }}
              className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center text-sm focus:outline-none focus:bg-gray-50"
              role="menuitem"
            >
              <Network className="h-4 w-4 mr-2" />
              Manage Relationships
            </button>
          )}
          {onManageVulnerabilities && (
            <button
              onClick={() => {
                const asset = assets.find(a => a.id === contextMenu.assetId);
                if (asset) onManageVulnerabilities(asset);
                closeContextMenu();
              }}
              className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center text-sm focus:outline-none focus:bg-gray-50"
              role="menuitem"
            >
              <AlertTriangle className="h-4 w-4 mr-2" />
              Manage Vulnerabilities
            </button>
          )}
          <button
            onClick={() => {
              onDeleteAsset(contextMenu.assetId);
              closeContextMenu();
            }}
            className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center text-sm text-red-600 focus:outline-none focus:bg-gray-50"
            role="menuitem"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete Asset
          </button>
        </div>
      )}
    </div>
  );
};