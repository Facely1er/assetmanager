import { useState, useEffect, useMemo, useCallback } from 'react';
import { Asset, AssetFilters, AssetInventoryState, SortConfig } from '../types/asset';
import { filterAssets, sortAssets, calculateAssetStats } from '../utils/assetUtils';
import { validateSearchQuery } from '../utils/validation';
import { APP_CONFIG } from '../utils/constants';
import { logError } from '../utils/errorHandling';
import { assetService } from '../services/assetService';
import { sampleAssets } from '../data/sampleAssets';
import toast from 'react-hot-toast';

const initialFilters: AssetFilters = {
  search: '',
  types: [],
  criticalities: [],
  owners: [],
  locations: [],
  complianceFrameworks: [],
  status: [],
  tags: [],
  riskScoreRange: [0, 100],
};

const initialSortConfig: SortConfig = {
  key: null,
  direction: 'asc',
};

export const useAssetInventory = () => {
  const [state, setState] = useState<AssetInventoryState>({
    assets: [],
    filteredAssets: [],
    selectedAssets: [],
    filters: initialFilters,
    sortConfig: initialSortConfig,
    currentPage: 1,
    itemsPerPage: APP_CONFIG.PAGINATION.DEFAULT_PAGE_SIZE,
    loading: false,
    selectedAsset: null,
    showDetailModal: false,
    showImportModal: false,
    searchDebounce: 0,
  });

  // Load assets on mount
  useEffect(() => {
    const loadAssets = async () => {
      setState(prev => ({ ...prev, loading: true }));
      try {
        const assets = await assetService.getAssets();
        setState(prev => ({ ...prev, assets, loading: false }));
      } catch (error) {
        logError(error, 'useAssetInventory.loadAssets');
        setState(prev => ({ ...prev, assets: sampleAssets, loading: false }));
        toast('Using demo data - Database connection unavailable', {
          icon: 'ℹ️',
          duration: 3000
        });
      }
    };

    loadAssets();
  }, []);

  // Debounced search effect with validation
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      try {
        // Validate search query for security
        if (state.filters.search && !validateSearchQuery(state.filters.search)) {
          logError(new Error('Invalid search query'), 'useAssetInventory.searchValidation');
          return;
        }

        setState(prev => ({ ...prev, loading: true }));
        
        const filtered = filterAssets(state.assets, state.filters);
        const sorted = sortAssets(filtered, state.sortConfig);
        
        setState(prev => ({
          ...prev,
          filteredAssets: sorted,
          currentPage: 1, // Reset to first page when filtering
          loading: false,
        }));
      } catch (error) {
        logError(error, 'useAssetInventory.filterAssets');
        setState(prev => ({ ...prev, loading: false }));
      }
    }, APP_CONFIG.SEARCH.DEBOUNCE_DELAY);

    return () => clearTimeout(timeoutId);
  }, [state.filters, state.assets, state.sortConfig]);

  // Calculate statistics with error handling
  const stats = useMemo(() => {
    try {
      return calculateAssetStats(state.assets);
    } catch (error) {
      logError(error, 'useAssetInventory.calculateStats');
      return {
        total: 0,
        critical: 0,
        untagged: 0,
        recentlyAdded: 0,
        byType: {},
        byCriticality: {},
        byStatus: {},
      };
    }
  }, [state.assets]);

  // Get paginated assets with bounds checking
  const paginatedAssets = useMemo(() => {
    const startIndex = (state.currentPage - 1) * state.itemsPerPage;
    const endIndex = startIndex + state.itemsPerPage;
    return state.filteredAssets.slice(startIndex, endIndex);
  }, [state.filteredAssets, state.currentPage, state.itemsPerPage]);

  // Get unique filter options with memoization
  const filterOptions = useMemo(() => ({
    owners: [...new Set(state.assets.map(asset => asset.owner))].sort(),
    locations: [...new Set(state.assets.map(asset => asset.location))].sort(),
    tags: [...new Set(state.assets.flatMap(asset => asset.tags))].sort(),
  }), [state.assets]);

  const updateFilters = useCallback((newFilters: Partial<AssetFilters>) => {
    setState(prev => ({
      ...prev,
      filters: { ...prev.filters, ...newFilters },
    }));
  }, []);

  const updateSort = useCallback((key: keyof Asset) => {
    setState(prev => ({
      ...prev,
      sortConfig: {
        key,
        direction: prev.sortConfig.key === key && prev.sortConfig.direction === 'asc' ? 'desc' : 'asc',
      },
    }));
  }, []);

  const setCurrentPage = useCallback((page: number) => {
    const totalPages = Math.ceil(state.filteredAssets.length / state.itemsPerPage);
    const validPage = Math.max(1, Math.min(page, totalPages));
    setState(prev => ({ ...prev, currentPage: validPage }));
  }, [state.filteredAssets.length, state.itemsPerPage]);

  const setItemsPerPage = useCallback((itemsPerPage: number) => {
    const validItemsPerPage = Math.min(itemsPerPage, APP_CONFIG.PAGINATION.MAX_PAGE_SIZE);
    setState(prev => ({ ...prev, itemsPerPage: validItemsPerPage, currentPage: 1 }));
  }, []);

  const selectAsset = useCallback((assetId: string) => {
    setState(prev => ({
      ...prev,
      selectedAssets: prev.selectedAssets.includes(assetId)
        ? prev.selectedAssets.filter(id => id !== assetId)
        : [...prev.selectedAssets, assetId],
    }));
  }, []);

  const selectAllAssets = useCallback(() => {
    setState(prev => ({
      ...prev,
      selectedAssets: prev.selectedAssets.length === paginatedAssets.length 
        ? [] 
        : paginatedAssets.map(asset => asset.id),
    }));
  }, [paginatedAssets]);

  const showAssetDetail = useCallback((asset: Asset) => {
    setState(prev => ({
      ...prev,
      selectedAsset: asset,
      showDetailModal: true,
    }));
  }, []);

  const hideAssetDetail = useCallback(() => {
    setState(prev => ({
      ...prev,
      selectedAsset: null,
      showDetailModal: false,
    }));
  }, []);

  const showImportModal = useCallback(() => {
    setState(prev => ({ ...prev, showImportModal: true }));
  }, []);

  const hideImportModal = useCallback(() => {
    setState(prev => ({ ...prev, showImportModal: false }));
  }, []);

  const deleteAssets = useCallback(async (assetIds: string[]) => {
    try {
      await assetService.deleteAssets(assetIds);
      
      setState(prev => {
        const updatedAssets = prev.assets.filter(asset => !assetIds.includes(asset.id));
        return {
          ...prev,
          assets: updatedAssets,
          selectedAssets: [],
        };
      });
      
      toast.success(`${assetIds.length} asset${assetIds.length > 1 ? 's' : ''} deleted successfully`);
    } catch (error) {
      logError(error, 'useAssetInventory.deleteAssets');
      toast.error('Failed to delete assets');
      throw error;
    }
  }, []);

  const addAsset = useCallback(async (asset: Asset) => {
    try {
      const newAsset = await assetService.createAsset(asset);
      
      setState(prev => ({
        ...prev,
        assets: [newAsset, ...prev.assets],
      }));
      
      toast.success('Asset created successfully');
      return newAsset;
    } catch (error) {
      logError(error, 'useAssetInventory.addAsset');
      toast.error('Failed to create asset');
      throw error;
    }
  }, []);

  const updateAsset = useCallback(async (assetId: string, updates: Partial<Asset>) => {
    try {
      // Handle bulk edit addTags field
      if ('addTags' in updates && updates.addTags) {
        const currentAsset = state.assets.find(a => a.id === assetId);
        if (currentAsset) {
          const newTags = (updates.addTags as string).split(',').map(tag => tag.trim()).filter(tag => tag);
          updates.tags = [...new Set([...currentAsset.tags, ...newTags])];
          delete (updates as Record<string, unknown>).addTags;
        }
      }
      
      const updatedAsset = await assetService.updateAsset(assetId, updates);
      
      setState(prev => ({
        ...prev,
        assets: prev.assets.map(asset => 
          asset.id === assetId ? updatedAsset : asset
        ),
      }));
      
      toast.success('Asset updated successfully');
    } catch (error) {
      logError(error, 'useAssetInventory.updateAsset');
      toast.error('Failed to update asset');
      throw error;
    }
  }, [state.assets]);

  const replaceAssets = useCallback((newAssets: Asset[]) => {
    try {
      // For generated inventories, we replace the local state
      // In a real app, you might want to clear the database first
      setState(prev => ({
        ...prev,
        assets: newAssets,
        selectedAssets: [],
        currentPage: 1,
      }));
    } catch (error) {
      logError(error, 'useAssetInventory.replaceAssets');
      throw error;
    }
  }, []);

  return {
    ...state,
    stats,
    paginatedAssets,
    filterOptions,
    totalPages: Math.ceil(state.filteredAssets.length / state.itemsPerPage),
    updateFilters,
    updateSort,
    setCurrentPage,
    setItemsPerPage,
    selectAsset,
    selectAllAssets,
    showAssetDetail,
    hideAssetDetail,
    showImportModal,
    hideImportModal,
    deleteAssets,
    addAsset,
    updateAsset,
    replaceAssets,
  };
};