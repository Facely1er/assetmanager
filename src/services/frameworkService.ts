import { supabase, handleSupabaseError, isSupabaseEnabled } from '../lib/supabase';
import { FrameworkPhase } from '../types/framework';
import { logError } from '../utils/errorHandling';

export const frameworkService = {
  async getPhases(organizationId: string = ''): Promise<FrameworkPhase[]> {
    if (!isSupabaseEnabled()) {
      // Return default phases if Supabase is not enabled
      return [
        {
          id: 'foundation',
          name: 'foundation',
          progress: 0,
          tasks: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: 'development',
          name: 'development',
          progress: 0,
          tasks: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: 'maturity',
          name: 'maturity',
          progress: 0,
          tasks: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: 'optimization',
          name: 'optimization',
          progress: 0,
          tasks: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];
    }

    try {
      const { data, error } = await supabase!
        .from('framework_phases')
        .select('*')
        .eq('organization_id', organizationId)
        .order('name', { ascending: true });

      if (error) throw error;
      
      if (!data || data.length === 0) {
        // Initialize phases if they don't exist
        return await this.initializePhases(organizationId);
      }
      
      return data.map(mapRowToFrameworkPhase);
    } catch (error) {
      logError('Failed to fetch framework phases', error);
      handleSupabaseError(error);
      return [];
    }
  },

  async initializePhases(organizationId: string = ''): Promise<FrameworkPhase[]> {
    const phases: FrameworkPhase[] = [
      {
        id: 'foundation',
        name: 'foundation',
        progress: 0,
        tasks: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'development',
        name: 'development',
        progress: 0,
        tasks: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'maturity',
        name: 'maturity',
        progress: 0,
        tasks: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'optimization',
        name: 'optimization',
        progress: 0,
        tasks: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    if (!isSupabaseEnabled()) {
      return phases;
    }

    try {
      const { data, error } = await supabase!
        .from('framework_phases')
        .insert(
          phases.map(phase => ({
            name: phase.name,
            progress: phase.progress,
            tasks: phase.tasks,
            organization_id: organizationId,
          }))
        )
        .select();

      if (error) throw error;
      return (data || []).map(mapRowToFrameworkPhase);
    } catch (error) {
      logError('Failed to initialize framework phases', error);
      handleSupabaseError(error);
      return phases;
    }
  },

  async updatePhase(id: string, updates: Partial<FrameworkPhase>): Promise<FrameworkPhase | null> {
    if (!isSupabaseEnabled()) {
      return null;
    }

    try {
      const updateData: Record<string, unknown> = {};
      if (updates.progress !== undefined) updateData.progress = updates.progress;
      if (updates.tasks !== undefined) updateData.tasks = updates.tasks;

      const { data, error } = await supabase!
        .from('framework_phases')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data ? mapRowToFrameworkPhase(data) : null;
    } catch (error) {
      logError('Failed to update framework phase', error);
      handleSupabaseError(error);
      return null;
    }
  },
};

function mapRowToFrameworkPhase(row: any): FrameworkPhase {
  return {
    id: row.id,
    name: row.name,
    progress: row.progress,
    tasks: row.tasks || [],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

