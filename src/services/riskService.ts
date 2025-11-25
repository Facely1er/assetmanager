import { supabase, handleSupabaseError, isSupabaseEnabled } from '../lib/supabase';
import { Risk } from '../types/risk';
import { logError } from '../utils/errorHandling';

export const riskService = {
  async getAll(organizationId: string = ''): Promise<Risk[]> {
    if (!isSupabaseEnabled()) {
      return [];
    }

    try {
      const { data, error } = await supabase!
        .from('risks')
        .select('*')
        .eq('organization_id', organizationId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []).map(mapRowToRisk);
    } catch (error) {
      logError('Failed to fetch risks', error);
      handleSupabaseError(error);
      return [];
    }
  },

  async getById(id: string): Promise<Risk | null> {
    if (!isSupabaseEnabled()) {
      return null;
    }

    try {
      const { data, error } = await supabase!
        .from('risks')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data ? mapRowToRisk(data) : null;
    } catch (error) {
      logError('Failed to fetch risk', error);
      handleSupabaseError(error);
      return null;
    }
  },

  async getByAssetId(assetId: string): Promise<Risk[]> {
    if (!isSupabaseEnabled()) {
      return [];
    }

    try {
      const { data, error } = await supabase!
        .from('risks')
        .select('*')
        .eq('asset_id', assetId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []).map(mapRowToRisk);
    } catch (error) {
      logError('Failed to fetch risks by asset', error);
      handleSupabaseError(error);
      return [];
    }
  },

  async getByDependencyId(dependencyId: string): Promise<Risk[]> {
    if (!isSupabaseEnabled()) {
      return [];
    }

    try {
      const { data, error } = await supabase!
        .from('risks')
        .select('*')
        .eq('dependency_id', dependencyId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []).map(mapRowToRisk);
    } catch (error) {
      logError('Failed to fetch risks by dependency', error);
      handleSupabaseError(error);
      return [];
    }
  },

  async create(risk: Omit<Risk, 'id' | 'createdAt' | 'updatedAt'>): Promise<Risk | null> {
    if (!isSupabaseEnabled()) {
      return null;
    }

    try {
      const { data, error } = await supabase!
        .from('risks')
        .insert({
          asset_id: risk.assetId,
          dependency_id: risk.dependencyId,
          name: risk.name,
          description: risk.description,
          likelihood: risk.likelihood,
          impact: risk.impact,
          risk_score: risk.riskScore,
          level: risk.level,
          category: risk.category,
          source: risk.source,
          mitigation_status: risk.mitigationStatus,
          organization_id: '',
        })
        .select()
        .single();

      if (error) throw error;
      return data ? mapRowToRisk(data) : null;
    } catch (error) {
      logError('Failed to create risk', error);
      handleSupabaseError(error);
      return null;
    }
  },

  async update(id: string, updates: Partial<Risk>): Promise<Risk | null> {
    if (!isSupabaseEnabled()) {
      return null;
    }

    try {
      const updateData: Record<string, unknown> = {};
      if (updates.assetId !== undefined) updateData.asset_id = updates.assetId;
      if (updates.dependencyId !== undefined) updateData.dependency_id = updates.dependencyId;
      if (updates.name !== undefined) updateData.name = updates.name;
      if (updates.description !== undefined) updateData.description = updates.description;
      if (updates.likelihood !== undefined) updateData.likelihood = updates.likelihood;
      if (updates.impact !== undefined) updateData.impact = updates.impact;
      if (updates.riskScore !== undefined) updateData.risk_score = updates.riskScore;
      if (updates.level !== undefined) updateData.level = updates.level;
      if (updates.category !== undefined) updateData.category = updates.category;
      if (updates.source !== undefined) updateData.source = updates.source;
      if (updates.mitigationStatus !== undefined) updateData.mitigation_status = updates.mitigationStatus;

      const { data, error } = await supabase!
        .from('risks')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data ? mapRowToRisk(data) : null;
    } catch (error) {
      logError('Failed to update risk', error);
      handleSupabaseError(error);
      return null;
    }
  },

  async delete(id: string): Promise<boolean> {
    if (!isSupabaseEnabled()) {
      return false;
    }

    try {
      const { error } = await supabase!
        .from('risks')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      logError('Failed to delete risk', error);
      handleSupabaseError(error);
      return false;
    }
  },
};

function mapRowToRisk(row: any): Risk {
  return {
    id: row.id,
    assetId: row.asset_id,
    dependencyId: row.dependency_id,
    name: row.name,
    description: row.description,
    likelihood: row.likelihood,
    impact: row.impact,
    riskScore: row.risk_score,
    level: row.level,
    category: row.category,
    source: row.source,
    mitigationStatus: row.mitigation_status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

