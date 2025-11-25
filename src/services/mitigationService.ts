import { supabase, handleSupabaseError, isSupabaseEnabled } from '../lib/supabase';
import { MitigationAction } from '../types/mitigation';
import { logError } from '../utils/errorHandling';

// Type for database row (since mitigation_actions is not yet in Database type)
type MitigationActionRow = {
  id: string;
  risk_id: string;
  asset_id?: string | null;
  dependency_id?: string | null;
  name: string;
  description: string;
  assignee: string;
  due_date: string | Date;
  status: MitigationAction['status'];
  progress: number;
  priority?: MitigationAction['priority'] | null;
  estimated_cost?: number | null;
  actual_cost?: number | null;
  notes?: string | null;
  organization_id: string;
  created_at: string | Date;
  updated_at: string | Date;
};

export const mitigationService = {
  async getAll(organizationId: string = ''): Promise<MitigationAction[]> {
    if (!isSupabaseEnabled) {
      return [];
    }

    try {
      const { data, error } = await supabase!
        .from('mitigation_actions')
        .select('*')
        .eq('organization_id', organizationId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return (data || []).map(mapRowToMitigationAction);
    } catch (error) {
      logError(error, 'Failed to fetch mitigation actions');
      handleSupabaseError(error);
      return [];
    }
  },

  async getById(id: string): Promise<MitigationAction | null> {
    if (!isSupabaseEnabled) {
      return null;
    }

    try {
      const { data, error } = await supabase!
        .from('mitigation_actions')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data ? mapRowToMitigationAction(data) : null;
    } catch (error) {
      logError(error, 'Failed to fetch mitigation action');
      handleSupabaseError(error);
      return null;
    }
  },

  async create(action: Omit<MitigationAction, 'id' | 'createdAt' | 'updatedAt'>): Promise<MitigationAction | null> {
    if (!isSupabaseEnabled) {
      return null;
    }

    try {
      const insertData = {
        risk_id: action.riskId,
        asset_id: action.assetId,
        dependency_id: action.dependencyId,
        name: action.name,
        description: action.description,
        assignee: action.assignee,
        due_date: action.dueDate,
        status: action.status,
        progress: action.progress,
        priority: action.priority,
        estimated_cost: action.estimatedCost,
        actual_cost: action.actualCost,
        notes: action.notes,
        organization_id: '',
      };
      
      const { data, error } = await supabase!
        .from('mitigation_actions')
        // @ts-expect-error - mitigation_actions table not yet in Database type definition
        .insert(insertData)
        .select()
        .single();

      if (error) throw error;
      return data ? mapRowToMitigationAction(data) : null;
    } catch (error) {
      logError(error, 'Failed to create mitigation action');
      handleSupabaseError(error);
      return null;
    }
  },

  async update(id: string, updates: Partial<MitigationAction>): Promise<MitigationAction | null> {
    if (!isSupabaseEnabled) {
      return null;
    }

    try {
      const updateData: Record<string, unknown> = {};
      if (updates.name !== undefined) updateData['name'] = updates.name;
      if (updates.description !== undefined) updateData['description'] = updates.description;
      if (updates.assignee !== undefined) updateData['assignee'] = updates.assignee;
      if (updates.dueDate !== undefined) updateData['due_date'] = updates.dueDate;
      if (updates.status !== undefined) updateData['status'] = updates.status;
      if (updates.progress !== undefined) updateData['progress'] = updates.progress;
      if (updates.priority !== undefined) updateData['priority'] = updates.priority;
      if (updates.estimatedCost !== undefined) updateData['estimated_cost'] = updates.estimatedCost;
      if (updates.actualCost !== undefined) updateData['actual_cost'] = updates.actualCost;
      if (updates.notes !== undefined) updateData['notes'] = updates.notes;

      const { data, error } = await supabase!
        .from('mitigation_actions')
        // @ts-expect-error - mitigation_actions table not yet in Database type definition
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data ? mapRowToMitigationAction(data) : null;
    } catch (error) {
      logError(error, 'Failed to update mitigation action');
      handleSupabaseError(error);
      return null;
    }
  },

  async delete(id: string): Promise<boolean> {
    if (!isSupabaseEnabled) {
      return false;
    }

    try {
      const { error } = await supabase!
        .from('mitigation_actions')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      logError(error, 'Failed to delete mitigation action');
      handleSupabaseError(error);
      return false;
    }
  },
};

function mapRowToMitigationAction(row: MitigationActionRow): MitigationAction {
  const result: MitigationAction = {
    id: row.id,
    riskId: row.risk_id,
    name: row.name,
    description: row.description,
    assignee: row.assignee,
    dueDate: row.due_date,
    status: row.status,
    progress: row.progress,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
  
  if (row.asset_id !== null && row.asset_id !== undefined) {
    result.assetId = row.asset_id;
  }
  
  if (row.dependency_id !== null && row.dependency_id !== undefined) {
    result.dependencyId = row.dependency_id;
  }
  
  if (row.priority !== null && row.priority !== undefined) {
    result.priority = row.priority;
  }
  
  if (row.estimated_cost !== null && row.estimated_cost !== undefined) {
    result.estimatedCost = row.estimated_cost;
  }
  
  if (row.actual_cost !== null && row.actual_cost !== undefined) {
    result.actualCost = row.actual_cost;
  }
  
  if (row.notes !== null && row.notes !== undefined) {
    result.notes = row.notes;
  }
  
  return result;
}

