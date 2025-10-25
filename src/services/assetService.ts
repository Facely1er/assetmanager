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

// Simplified cache implementation
class SimpleCache<T> {
  private cache = new Map<string, { data: T; timestamp: number }>();
  private readonly ttl: number;

  constructor(ttl = APP_CONFIG.CACHE.DEFAULT_TTL) {
    this.ttl = ttl;
  }

  set(key: string, data: T): void {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  get(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    if (Date.now() - entry.timestamp > this.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  clear(): void {
    this.cache.clear();
  }
}

const assetCache = new SimpleCache<Asset>();

// Convert database row to Asset interface
const mapRowToAsset = async (row: AssetRow): Promise<Asset> => {
  const cacheKey = `asset_${row.id}`;
  const cached = assetCache.get(cacheKey);
  if (cached) return cached;

  try {
    // Get relationships and vulnerabilities in parallel
    const [relationshipsData, vulnerabilitiesData] = await Promise.all([
      retryRequest(() => supabase!
        .from('asset_relationships')
        .select(`
          id,
          relationship_type,
          strength,
          related_asset:assets!asset_relationships_target_asset_id_fkey(id, name)
        `)
        .eq('source_asset_id', row.id)
      ),
      retryRequest(() => supabase!
        .from('asset_vulnerabilities')
        .select('*')
        .eq('asset_id', row.id)
      )
    ]);

    const relationships: AssetRelationship[] = relationshipsData?.data?.map(rel => ({
      id: rel.id,
      relatedAssetId: (rel.related_asset as { id: string })?.id || '',
      relatedAssetName: (rel.related_asset as { name: string })?.name || '',
      relationshipType: rel.relationship_type as AssetRelationship['relationshipType'],
      strength: rel.strength as AssetRelationship['strength'],
    })) || [];

    const vulnerabilities: Vulnerability[] = vulnerabilitiesData?.data?.map(vuln => ({
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

    assetCache.set(cacheKey, asset);
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

// Simplified asset service with better error handling
export const assetService = {
  // Get all assets for the current user
  async getAssets(): Promise<Asset[]> {
    if (!isSupabaseEnabled || !supabase) {
      return sampleAssets;
    }
    
    try {
      const { checkSupabaseConnectivity } = await import('../lib/supabase');
      const isConnected = await checkSupabaseConnectivity();
      
      if (!isConnected) {
        return sampleAssets;
      }
      
      const { data, error } = await supabase
        .from('assets')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1000);
      
      if (error) {
        logError(error, 'assetService.getAssets');
        return sampleAssets;
      }

      const assets = await Promise.all((data || []).map(row => mapRowToAsset(row)));
      return assets;
      
    } catch (error) {
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
    if (!isSupabaseEnabled || !supabase) {
      const newAsset: Asset = {
        ...assetData,
        id: `demo-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      return newAsset;
    }
    
    try {
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

      // Handle relationships and vulnerabilities in parallel
      await Promise.all([
        assetData.relationships?.length ? this.updateAssetRelationships(newAsset.id, assetData.relationships) : Promise.resolve(),
        assetData.vulnerabilities?.length ? this.updateAssetVulnerabilities(newAsset.id, assetData.vulnerabilities) : Promise.resolve()
      ]);

      return await this.getAsset(newAsset.id) || newAsset;
    } catch (error) {
      console.error('Error creating asset:', error);
      throw error;
    }
  },

  // Update an existing asset
  async updateAsset(id: string, updates: Partial<Asset>): Promise<Asset> {
    if (!isSupabaseEnabled || !supabase) {
      const existingAsset = sampleAssets.find(asset => asset.id === id);
      if (!existingAsset) throw new Error('Asset not found');
      
      const updatedAsset: Asset = {
        ...existingAsset,
        ...updates,
        updatedAt: new Date(),
      };
      return updatedAsset;
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

      // Handle relationships and vulnerabilities updates in parallel
      await Promise.all([
        updates.relationships !== undefined ? this.updateAssetRelationships(id, updates.relationships) : Promise.resolve(),
        updates.vulnerabilities !== undefined ? this.updateAssetVulnerabilities(id, updates.vulnerabilities) : Promise.resolve()
      ]);

      return await this.getAsset(id) || await mapRowToAsset(data);
    } catch (error) {
      console.error('Error updating asset:', error);
      throw error;
    }
  },

  // Delete assets
  async deleteAssets(ids: string[]): Promise<void> {
    if (!isSupabaseEnabled || !supabase) {
      return;
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
    if (!supabase) return;

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
    if (!supabase) return;

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

  // Clear cache
  clearCache(): void {
    assetCache.clear();
  }
};