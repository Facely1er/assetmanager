import { Asset, AssetFilters, AssetStats } from '../types/asset';
import { sanitizeInput } from './validation';
import { APP_CONFIG } from './constants';
import { exportAssetsToCSV } from './csvUtils';

export const calculateAssetStats = (assets: Asset[]): AssetStats => {
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));

  // Use single pass for better performance
  let critical = 0;
  let untagged = 0;
  let recentlyAdded = 0;
  const byType: Record<string, number> = {};
  const byCriticality: Record<string, number> = {};
  const byStatus: Record<string, number> = {};

  for (const asset of assets) {
    // Count critical assets
    if (asset.criticality === 'Critical') critical++;
    
    // Count untagged assets
    if (asset.tags.length === 0) untagged++;
    
    // Count recently added assets
    if (asset.createdAt > thirtyDaysAgo) recentlyAdded++;
    
    // Count by type
    byType[asset.type] = (byType[asset.type] || 0) + 1;
    
    // Count by criticality
    byCriticality[asset.criticality] = (byCriticality[asset.criticality] || 0) + 1;
    
    // Count by status
    byStatus[asset.status] = (byStatus[asset.status] || 0) + 1;
  }

  return {
    total: assets.length,
    critical,
    untagged,
    recentlyAdded,
    byType,
    byCriticality,
    byStatus,
  };
};

export const filterAssets = (assets: Asset[], filters: AssetFilters): Asset[] => {
  return assets.filter(asset => {
    // Search filter with input sanitization
    if (filters.search) {
      const searchLower = sanitizeInput(filters.search).toLowerCase();
      if (searchLower.length < APP_CONFIG.SEARCH.MIN_SEARCH_LENGTH) {
        return true; // Don't filter if search is too short
      }
      
      const searchableFields = [
        asset.name,
        asset.description,
        asset.owner,
        asset.location,
        asset.ipAddress || '',
        ...asset.tags,
        ...asset.complianceFrameworks,
      ].join(' ').toLowerCase();
      
      if (!searchableFields.includes(searchLower)) {
        return false;
      }
    }

    // Type filter
    if (filters.types.length > 0 && !filters.types.includes(asset.type)) {
      return false;
    }

    // Criticality filter
    if (filters.criticalities.length > 0 && !filters.criticalities.includes(asset.criticality)) {
      return false;
    }

    // Owner filter
    if (filters.owners.length > 0 && !filters.owners.includes(asset.owner)) {
      return false;
    }

    // Location filter
    if (filters.locations.length > 0 && !filters.locations.includes(asset.location)) {
      return false;
    }

    // Compliance frameworks filter
    if (filters.complianceFrameworks.length > 0) {
      const hasMatchingFramework = filters.complianceFrameworks.some(framework =>
        asset.complianceFrameworks.includes(framework)
      );
      if (!hasMatchingFramework) {
        return false;
      }
    }

    // Status filter
    if (filters.status.length > 0 && !filters.status.includes(asset.status)) {
      return false;
    }

    // Tags filter
    if (filters.tags.length > 0) {
      const hasMatchingTag = filters.tags.some(tag =>
        asset.tags.includes(tag)
      );
      if (!hasMatchingTag) {
        return false;
      }
    }

    // Risk score range filter
    const [minRisk, maxRisk] = filters.riskScoreRange;
    if (asset.riskScore < minRisk || asset.riskScore > maxRisk) {
      return false;
    }

    return true;
  });
};

export const sortAssets = (assets: Asset[], sortConfig: { key: keyof Asset | null; direction: 'asc' | 'desc' }): Asset[] => {
  if (!sortConfig.key) return assets;

  return [...assets].sort((a, b) => {
    const aValue = a[sortConfig.key!];
    const bValue = b[sortConfig.key!];

    if (aValue === null || aValue === undefined) return 1;
    if (bValue === null || bValue === undefined) return -1;

    let comparison = 0;
    
    // Handle different data types
    if (aValue instanceof Date && bValue instanceof Date) {
      comparison = aValue.getTime() - bValue.getTime();
    } else if (typeof aValue === 'string' && typeof bValue === 'string') {
      comparison = aValue.localeCompare(bValue);
    } else if (typeof aValue === 'number' && typeof bValue === 'number') {
      comparison = aValue - bValue;
    } else {
      // Fallback to string comparison
      comparison = String(aValue).localeCompare(String(bValue));
    }

    return sortConfig.direction === 'desc' ? comparison * -1 : comparison;
  });
};

export const getCriticalityColor = (criticality: string): string => {
  switch (criticality) {
    case 'Critical': return 'text-red-600 bg-red-50 border-red-200';
    case 'High': return 'text-orange-600 bg-orange-50 border-orange-200';
    case 'Medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    case 'Low': return 'text-green-600 bg-green-50 border-green-200';
    default: return 'text-gray-600 bg-gray-50 border-gray-200';
  }
};

export const getStatusColor = (status: string): string => {
  switch (status) {
    case 'Active': return 'text-green-600 bg-green-50 border-green-200';
    case 'Inactive': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    case 'Retired': return 'text-gray-600 bg-gray-50 border-gray-200';
    case 'Planned': return 'text-blue-600 bg-blue-50 border-blue-200';
    default: return 'text-gray-600 bg-gray-50 border-gray-200';
  }
};

export const getRiskScoreColor = (score: number): string => {
  if (score >= 80) return 'text-red-600 bg-red-50';
  if (score >= 60) return 'text-orange-600 bg-orange-50';
  if (score >= 40) return 'text-yellow-600 bg-yellow-50';
  return 'text-green-600 bg-green-50';
};

// Use the new CSV utility function
export const exportToCSV = async (assets: Asset[]): Promise<void> => {
  return new Promise((resolve, reject) => {
    try {
      exportAssetsToCSV(assets);
      resolve();
    } catch (error) {
      reject(error);
    }
  });
};