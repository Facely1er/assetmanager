import { supabase, handleSupabaseError, isSupabaseEnabled } from '../lib/supabase';
import { BusinessFunction, BusinessImpact, ContinuityPlan } from '../types/business-impact';
import { logError } from '../utils/errorHandling';

export const businessImpactService = {
  // Business Functions
  async getBusinessFunctions(organizationId: string = ''): Promise<BusinessFunction[]> {
    if (!isSupabaseEnabled()) {
      return [];
    }

    try {
      const { data, error } = await supabase!
        .from('business_functions')
        .select('*')
        .eq('organization_id', organizationId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []).map(mapRowToBusinessFunction);
    } catch (error) {
      logError('Failed to fetch business functions', error);
      handleSupabaseError(error);
      return [];
    }
  },

  async createBusinessFunction(func: Omit<BusinessFunction, 'id' | 'createdAt' | 'updatedAt'>): Promise<BusinessFunction | null> {
    if (!isSupabaseEnabled()) {
      return null;
    }

    try {
      const { data, error } = await supabase!
        .from('business_functions')
        .insert({
          name: func.name,
          description: func.description,
          owner: func.owner,
          department: func.department,
          priority: func.priority,
          mtd: func.mtd,
          rto: func.rto,
          rpo: func.rpo,
          annual_revenue: func.annualRevenue,
          regulatory_requirements: func.regulatoryRequirements,
          dependencies: func.dependencies,
          organization_id: '',
        })
        .select()
        .single();

      if (error) throw error;
      return data ? mapRowToBusinessFunction(data) : null;
    } catch (error) {
      logError('Failed to create business function', error);
      handleSupabaseError(error);
      return null;
    }
  },

  // Business Impacts
  async getBusinessImpacts(organizationId: string = ''): Promise<BusinessImpact[]> {
    if (!isSupabaseEnabled()) {
      return [];
    }

    try {
      const { data, error } = await supabase!
        .from('business_impacts')
        .select('*')
        .eq('organization_id', organizationId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []).map(mapRowToBusinessImpact);
    } catch (error) {
      logError('Failed to fetch business impacts', error);
      handleSupabaseError(error);
      return [];
    }
  },

  async createBusinessImpact(impact: Omit<BusinessImpact, 'id' | 'createdAt' | 'updatedAt'>): Promise<BusinessImpact | null> {
    if (!isSupabaseEnabled()) {
      return null;
    }

    try {
      const { data, error } = await supabase!
        .from('business_impacts')
        .insert({
          asset_id: impact.assetId,
          business_function_id: impact.businessFunctionId,
          financial_impact: impact.financialImpact,
          operational_impact: impact.operationalImpact,
          regulatory_impact: impact.regulatoryImpact,
          organization_id: '',
        })
        .select()
        .single();

      if (error) throw error;
      return data ? mapRowToBusinessImpact(data) : null;
    } catch (error) {
      logError('Failed to create business impact', error);
      handleSupabaseError(error);
      return null;
    }
  },

  // Continuity Plans
  async getContinuityPlans(organizationId: string = ''): Promise<ContinuityPlan[]> {
    if (!isSupabaseEnabled()) {
      return [];
    }

    try {
      const { data, error } = await supabase!
        .from('continuity_plans')
        .select('*')
        .eq('organization_id', organizationId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []).map(mapRowToContinuityPlan);
    } catch (error) {
      logError('Failed to fetch continuity plans', error);
      handleSupabaseError(error);
      return [];
    }
  },

  async createContinuityPlan(plan: Omit<ContinuityPlan, 'id' | 'createdAt' | 'updatedAt'>): Promise<ContinuityPlan | null> {
    if (!isSupabaseEnabled()) {
      return null;
    }

    try {
      const { data, error } = await supabase!
        .from('continuity_plans')
        .insert({
          name: plan.name,
          description: plan.description,
          business_function_id: plan.businessFunctionId,
          asset_ids: plan.assetIds,
          rto: plan.rto,
          rpo: plan.rpo,
          steps: plan.steps,
          contacts: plan.contacts,
          resources: plan.resources,
          test_schedule: plan.testSchedule,
          organization_id: '',
        })
        .select()
        .single();

      if (error) throw error;
      return data ? mapRowToContinuityPlan(data) : null;
    } catch (error) {
      logError('Failed to create continuity plan', error);
      handleSupabaseError(error);
      return null;
    }
  },
};

function mapRowToBusinessFunction(row: any): BusinessFunction {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    owner: row.owner,
    department: row.department,
    priority: row.priority,
    mtd: row.mtd,
    rto: row.rto,
    rpo: row.rpo,
    annualRevenue: row.annual_revenue,
    regulatoryRequirements: row.regulatory_requirements || [],
    dependencies: row.dependencies || [],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapRowToBusinessImpact(row: any): BusinessImpact {
  return {
    id: row.id,
    assetId: row.asset_id,
    businessFunctionId: row.business_function_id,
    financialImpact: row.financial_impact || {
      hourlyRevenueLoss: 0,
      recoveryCosts: 0,
      reputationalCosts: 0,
      penalties: 0,
    },
    operationalImpact: row.operational_impact || {
      affectedUsers: 0,
      affectedProcesses: 0,
      workaroundAvailable: false,
      workaroundCost: 0,
    },
    regulatoryImpact: row.regulatory_impact || {
      regulations: [],
      penaltiesPerDay: 0,
      reportingRequired: false,
    },
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapRowToContinuityPlan(row: any): ContinuityPlan {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    businessFunctionId: row.business_function_id,
    assetIds: row.asset_ids || [],
    rto: row.rto,
    rpo: row.rpo,
    steps: row.steps || [],
    contacts: row.contacts || [],
    resources: row.resources || [],
    testSchedule: row.test_schedule || {
      lastTest: new Date().toISOString(),
      nextTest: new Date().toISOString(),
      frequency: 365,
    },
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

