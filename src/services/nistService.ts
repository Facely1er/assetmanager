import { supabase, handleSupabaseError, isSupabaseEnabled } from '../lib/supabase';
import { NISTControl, NISTMapping, NISTAssessment } from '../types/nist';
import { logError } from '../utils/errorHandling';

export const nistService = {
  // NIST Controls
  async getControls(organizationId: string = ''): Promise<NISTControl[]> {
    if (!isSupabaseEnabled()) {
      return [];
    }

    try {
      const { data, error } = await supabase!
        .from('nist_controls')
        .select('*')
        .eq('organization_id', organizationId)
        .order('family', { ascending: true })
        .order('number', { ascending: true });

      if (error) throw error;
      return (data || []).map(mapRowToNISTControl);
    } catch (error) {
      logError('Failed to fetch NIST controls', error);
      handleSupabaseError(error);
      return [];
    }
  },

  async createControl(control: Omit<NISTControl, 'id' | 'createdAt' | 'updatedAt'>): Promise<NISTControl | null> {
    if (!isSupabaseEnabled()) {
      return null;
    }

    try {
      const { data, error } = await supabase!
        .from('nist_controls')
        .insert({
          family: control.family,
          number: control.number,
          title: control.title,
          description: control.description,
          priority: control.priority,
          baseline_impact: control.baselineImpact,
          related_controls: control.relatedControls,
          status: control.status,
          implementation_details: control.implementationDetails,
          last_assessment: control.lastAssessment,
          organization_id: '',
        })
        .select()
        .single();

      if (error) throw error;
      return data ? mapRowToNISTControl(data) : null;
    } catch (error) {
      logError('Failed to create NIST control', error);
      handleSupabaseError(error);
      return null;
    }
  },

  // NIST Mappings
  async getMappings(organizationId: string = ''): Promise<NISTMapping[]> {
    if (!isSupabaseEnabled()) {
      return [];
    }

    try {
      const { data, error } = await supabase!
        .from('nist_mappings')
        .select('*')
        .eq('organization_id', organizationId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []).map(mapRowToNISTMapping);
    } catch (error) {
      logError('Failed to fetch NIST mappings', error);
      handleSupabaseError(error);
      return [];
    }
  },

  async createMapping(mapping: Omit<NISTMapping, 'id' | 'createdAt' | 'updatedAt'>): Promise<NISTMapping | null> {
    if (!isSupabaseEnabled()) {
      return null;
    }

    try {
      const { data, error } = await supabase!
        .from('nist_mappings')
        .insert({
          asset_id: mapping.assetId,
          functions: mapping.functions,
          controls: mapping.controls,
          security_categorization: mapping.securityCategorization,
          supply_chain_tier: mapping.supplyChainTier,
          last_review: mapping.lastReview,
          next_review: mapping.nextReview,
          organization_id: '',
        })
        .select()
        .single();

      if (error) throw error;
      return data ? mapRowToNISTMapping(data) : null;
    } catch (error) {
      logError('Failed to create NIST mapping', error);
      handleSupabaseError(error);
      return null;
    }
  },

  // NIST Assessments
  async getAssessments(organizationId: string = ''): Promise<NISTAssessment[]> {
    if (!isSupabaseEnabled()) {
      return [];
    }

    try {
      const { data, error } = await supabase!
        .from('nist_assessments')
        .select('*')
        .eq('organization_id', organizationId)
        .order('date', { ascending: false });

      if (error) throw error;
      return (data || []).map(mapRowToNISTAssessment);
    } catch (error) {
      logError('Failed to fetch NIST assessments', error);
      handleSupabaseError(error);
      return [];
    }
  },

  async createAssessment(assessment: Omit<NISTAssessment, 'id' | 'createdAt' | 'updatedAt'>): Promise<NISTAssessment | null> {
    if (!isSupabaseEnabled()) {
      return null;
    }

    try {
      const { data, error } = await supabase!
        .from('nist_assessments')
        .insert({
          asset_id: assessment.assetId,
          date: assessment.date,
          assessor: assessment.assessor,
          overall_score: assessment.overallScore,
          function_scores: assessment.functionScores,
          findings: assessment.findings,
          organization_id: '',
        })
        .select()
        .single();

      if (error) throw error;
      return data ? mapRowToNISTAssessment(data) : null;
    } catch (error) {
      logError('Failed to create NIST assessment', error);
      handleSupabaseError(error);
      return null;
    }
  },
};

function mapRowToNISTControl(row: any): NISTControl {
  return {
    id: row.id,
    family: row.family,
    number: row.number,
    title: row.title,
    description: row.description,
    priority: row.priority,
    baselineImpact: row.baseline_impact || [],
    relatedControls: row.related_controls || [],
    status: row.status,
    implementationDetails: row.implementation_details,
    lastAssessment: row.last_assessment,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapRowToNISTMapping(row: any): NISTMapping {
  return {
    id: row.id,
    assetId: row.asset_id,
    functions: row.functions || [],
    controls: row.controls || [],
    securityCategorization: row.security_categorization || {
      confidentiality: 'low',
      integrity: 'low',
      availability: 'low',
    },
    supplyChainTier: row.supply_chain_tier || 1,
    lastReview: row.last_review,
    nextReview: row.next_review,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapRowToNISTAssessment(row: any): NISTAssessment {
  return {
    id: row.id,
    assetId: row.asset_id,
    date: row.date,
    assessor: row.assessor,
    overallScore: row.overall_score,
    functionScores: row.function_scores || {
      identify: 0,
      protect: 0,
      detect: 0,
      respond: 0,
      recover: 0,
    },
    findings: row.findings || [],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

