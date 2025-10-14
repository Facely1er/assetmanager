import { supabase, handleSupabaseError, isSupabaseEnabled } from '../lib/supabase';
import { retryRequest } from '../lib/supabase';
import { Asset, AssetRelationship, Vulnerability } from '../types/asset';
import { Database } from '../types/database';
import { sampleAssets } from '../data/sampleAssets';
import { logError } from '../utils/errorHandling';
import { APP_CONFIG } from '../utils/constants';

type AssetRow = Database['public']['Tables']['assets']['Row'];
type AssetInsert = Database['public']['Tables']['assets']['Insert'];
type AssetUpdate = Database['public']['Tables']['assets']['Update'];

// Enhanced caching for better performance
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

class AssetCache {
  private cache = new Map<string, CacheEntry<unknown>>();
  private maxSize = 100;

  set<T>(key: string, data: T, ttl = APP_CONFIG.CACHE.DEFAULT_TTL): void {
    // Prevent cache from growing too large
    if (this.cache.size >= this.maxSize) {
      const oldestKey = this.cache.keys().next().value;
      this.cache.delete(oldestKey);
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    // Check if entry has expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  clear(): void {
    this.cache.clear();
  }

  size(): number {
    return this.cache.size;
  }
}

const assetCache = new AssetCache();

// Convert database row to Asset interface
const mapRowToAsset = async (row: AssetRow, useCache = true): Promise<Asset> => {
  const cacheKey = `asset_${row.id}`;
  
  if (useCache) {
    const cached = assetCache.get<Asset>(cacheKey);
    if (cached) return cached;
  }

  try {
  // Get relationships
    const { data: relationshipsData } = await retryRequest(() => supabase!
    .from('asset_relationships')
    .select(`
      id,
      relationship_type,
      strength,
        related_asset:assets!asset_relationships_target_asset_id_fkey(id, name)
    `)
      .eq('source_asset_id', row.id)
    );

  // Get vulnerabilities
    const { data: vulnerabilitiesData } = await retryRequest(() => supabase!
    .from('asset_vulnerabilities')
    .select('*')
      .eq('asset_id', row.id)
    );

  const relationships: AssetRelationship[] = relationshipsData?.map(rel => ({
    id: rel.id,
    relatedAssetId: (rel.related_asset as { id: string })?.id || '',
    relatedAssetName: (rel.related_asset as { name: string })?.name || '',
    relationshipType: rel.relationship_type as AssetRelationship['relationshipType'],
    strength: rel.strength as AssetRelationship['strength'],
  })) || [];

  const vulnerabilities: Vulnerability[] = vulnerabilitiesData?.map(vuln => ({
    id: vuln.id,
    cveId: vuln.cve_id,
    severity: vuln.severity as Vulnerability['severity'],
    title: vuln.title,
    description: vuln.description,
    discoveredAt: new Date(vuln.discovered_at),
    status: vuln.status as Vulnerability['status'],
  })) || [];

    const asset: Asset = {
    id: row.id,
    name: row.name,
    type: row.type as Asset['type'],
    criticality: row.criticality as Asset['criticality'],
    owner: row.owner,
    location: row.location,
    ipAddress: row.ip_address,
    description: row.description,
    complianceFrameworks: row.compliance_frameworks,
    riskScore: row.risk_score,
    tags: row.tags,
    status: row.status as Asset['status'],
    lastAssessed: new Date(row.last_assessed),
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
    relationships,
    vulnerabilities,
  };

    // Cache the result
    if (useCache) {
      assetCache.set(cacheKey, asset);
    }

    return asset;
  } catch (error) {
    logError(error, 'mapRowToAsset', { assetId: row.id });
    throw error;
  }
};

// Convert Asset to database insert format
const mapAssetToInsert = (asset: Omit<Asset, 'id' | 'createdAt' | 'updatedAt'>, userId?: string): AssetInsert => ({
  name: asset.name,
  type: asset.type,
  criticality: asset.criticality,
  owner: asset.owner,
  location: asset.location,
  ip_address: asset.ipAddress || null,
  description: asset.description,
  compliance_frameworks: asset.complianceFrameworks,
  risk_score: asset.riskScore,
  tags: asset.tags,
  status: asset.status,
  last_assessed: asset.lastAssessed.toISOString(),
  user_id: userId || 'demo-user',
});

// Convert Asset to database update format
const mapAssetToUpdate = (asset: Partial<Asset>): AssetUpdate => ({
  ...(asset.name && { name: asset.name }),
  ...(asset.type && { type: asset.type }),
  ...(asset.criticality && { criticality: asset.criticality }),
  ...(asset.owner && { owner: asset.owner }),
  ...(asset.location && { location: asset.location }),
  ...(asset.ipAddress !== undefined && { ip_address: asset.ipAddress }),
  ...(asset.description && { description: asset.description }),
  ...(asset.complianceFrameworks && { compliance_frameworks: asset.complianceFrameworks }),
  ...(asset.riskScore !== undefined && { risk_score: asset.riskScore }),
  ...(asset.tags && { tags: asset.tags }),
  ...(asset.status && { status: asset.status }),
  ...(asset.lastAssessed && { last_assessed: asset.lastAssessed.toISOString() }),
  updated_at: new Date().toISOString(),
});

export const assetService = {
  // Get all assets for the current user
  async getAssets(): Promise<Asset[]> {
    // Demo mode - return sample assets
    if (!isSupabaseEnabled || !supabase) {
      return Promise.resolve(sampleAssets);
    }
    
    try {
      // Test connectivity before making requests
      const { checkSupabaseConnectivity } = await import('../lib/supabase');
      const isConnected = await checkSupabaseConnectivity();
      
      if (!isConnected) {
        return sampleAssets;
      }
      
      const result = await supabase!
        .from('assets')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1000);
      
      if (result.error) {
        logError(result.error, 'assetService.getAssets');
        return sampleAssets;
      }

      const assets = await Promise.all((result.data || []).map(row => mapRowToAsset(row)));

      return assets;
      
    } catch (error) {
      // Check if it's a network error
      if (error instanceof Error && (
        error.message.includes('fetch') || 
        error.message.includes('network') ||
        error.message.includes('Failed to fetch') ||
        error.message.includes('NetworkError') ||
        error.name === 'TypeError'
      )) {
        return sampleAssets;
      }
      
      return sampleAssets;
    }
  },

  // Get a single asset by ID
  async getAsset(id: string): Promise<Asset | null> {
    // Demo mode - find in sample assets
    if (!isSupabaseEnabled || !supabase) {
      return Promise.resolve(sampleAssets.find(asset => asset.id === id) || null);
    }
    
    try {
      const { data, error } = await supabase
        .from('assets')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // Asset not found
        }
        throw new Error(handleSupabaseError(error));
      }

      return await mapRowToAsset(data);
    } catch (error) {
      console.error('Error fetching asset:', error);
      throw error;
    }
  },

  // Create a new asset
  async createAsset(assetData: Omit<Asset, 'id' | 'createdAt' | 'updatedAt'>): Promise<Asset> {
    // Demo mode - simulate creation
    if (!isSupabaseEnabled || !supabase) {
      const newAsset: Asset = {
        ...assetData,
        id: `demo-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      return Promise.resolve(newAsset);
    }
    
    try {
      // Try to get user, but don't require authentication for demo
      const user = await supabase.auth.getUser();
      const userId = user.data.user?.id;
      if (!userId) {
        throw new Error('User not authenticated');
      }

      const insertData = mapAssetToInsert(assetData, userId);

      const { data, error } = await supabase
        .from('assets')
        .insert(insertData)
        .select()
        .single();

      if (error) {
        throw new Error(handleSupabaseError(error));
      }

      const newAsset = await mapRowToAsset(data);

      // Handle relationships if provided
      if (assetData.relationships && assetData.relationships.length > 0) {
        await this.updateAssetRelationships(newAsset.id, assetData.relationships);
      }

      // Handle vulnerabilities if provided
      if (assetData.vulnerabilities && assetData.vulnerabilities.length > 0) {
        await this.updateAssetVulnerabilities(newAsset.id, assetData.vulnerabilities);
      }

      // Fetch the complete asset with relationships and vulnerabilities
      return await this.getAsset(newAsset.id) || newAsset;
    } catch (error) {
      console.error('Error creating asset:', error);
      throw error;
    }
  },

  // Update an existing asset
  async updateAsset(id: string, updates: Partial<Asset>): Promise<Asset> {
    // Demo mode - simulate update
    if (!isSupabaseEnabled || !supabase) {
      const existingAsset = sampleAssets.find(asset => asset.id === id);
      if (!existingAsset) throw new Error('Asset not found');
      
      const updatedAsset: Asset = {
        ...existingAsset,
        ...updates,
        updatedAt: new Date(),
      };
      return Promise.resolve(updatedAsset);
    }
    
    try {
      const updateData = mapAssetToUpdate(updates);

      const { data, error } = await supabase
        .from('assets')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw new Error(handleSupabaseError(error));
      }

      // Handle relationships update
      if (updates.relationships !== undefined) {
        await this.updateAssetRelationships(id, updates.relationships);
      }

      // Handle vulnerabilities update
      if (updates.vulnerabilities !== undefined) {
        await this.updateAssetVulnerabilities(id, updates.vulnerabilities);
      }

      // Fetch the complete updated asset
      return await this.getAsset(id) || await mapRowToAsset(data);
    } catch (error) {
      console.error('Error updating asset:', error);
      throw error;
    }
  },

  // Delete assets
  async deleteAssets(ids: string[]): Promise<void> {
    // Demo mode - simulate deletion
    if (!isSupabaseEnabled || !supabase) {
      return Promise.resolve();
    }
    
    try {
      const { error } = await supabase
        .from('assets')
        .delete()
        .in('id', ids);

      if (error) {
        throw new Error(handleSupabaseError(error));
      }
    } catch (error) {
      console.error('Error deleting assets:', error);
      throw error;
    }
  },

  // Update asset relationships
  async updateAssetRelationships(assetId: string, relationships: AssetRelationship[]): Promise<void> {
    try {
      // Delete existing relationships
      await supabase
        .from('asset_relationships')
        .delete()
        .eq('asset_id', assetId);

      // Insert new relationships
      if (relationships.length > 0) {
        const relationshipsData = relationships.map(rel => ({
          asset_id: assetId,
          related_asset_id: rel.relatedAssetId,
          relationship_type: rel.relationshipType,
          strength: rel.strength,
        }));

        const { error } = await supabase
          .from('asset_relationships')
          .insert(relationshipsData);

        if (error) {
          throw new Error(handleSupabaseError(error));
        }
      }
    } catch (error) {
      console.error('Error updating asset relationships:', error);
      throw error;
    }
  },

  // Update asset vulnerabilities
  async updateAssetVulnerabilities(assetId: string, vulnerabilities: Vulnerability[]): Promise<void> {
    try {
      // Delete existing vulnerabilities
      await supabase
        .from('asset_vulnerabilities')
        .delete()
        .eq('asset_id', assetId);

      // Insert new vulnerabilities
      if (vulnerabilities.length > 0) {
        const vulnerabilitiesData = vulnerabilities.map(vuln => ({
          asset_id: assetId,
          cve_id: vuln.cveId,
          severity: vuln.severity,
          title: vuln.title,
          description: vuln.description,
          discovered_at: vuln.discoveredAt.toISOString(),
          status: vuln.status,
        }));

        const { error } = await supabase
          .from('asset_vulnerabilities')
          .insert(vulnerabilitiesData);

        if (error) {
          throw new Error(handleSupabaseError(error));
        }
      }
    } catch (error) {
      console.error('Error updating asset vulnerabilities:', error);
      throw error;
    }
  },

  // Search assets
  async searchAssets(query: string): Promise<Asset[]> {
    if (!isSupabaseEnabled || !supabase) {
      // Return filtered demo data in demo mode
      const { sampleAssets } = await import('../data/sampleAssets');
      const lowercaseQuery = query.toLowerCase();
      return sampleAssets.filter(asset => 
        asset.name.toLowerCase().includes(lowercaseQuery) ||
        asset.type.toLowerCase().includes(lowercaseQuery) ||
        asset.description?.toLowerCase().includes(lowercaseQuery) ||
        asset.owner.toLowerCase().includes(lowercaseQuery)
      );
    }

    try {
      const { data, error } = await supabase
        .from('assets')
        .select('*')
        .or(`name.ilike.%${query}%,description.ilike.%${query}%,owner.ilike.%${query}%,location.ilike.%${query}%`)
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(handleSupabaseError(error));
      }

      const assets = await Promise.all(
        (data || []).map(row => mapRowToAsset(row))
      );

      return assets;
    } catch (error) {
      console.error('Error searching assets:', error);
      throw error;
    }
  },
};