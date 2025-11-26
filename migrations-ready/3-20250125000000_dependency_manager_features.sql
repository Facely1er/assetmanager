-- Migration 3
-- Source: 20250125000000_dependency_manager_features.sql
-- Copy this entire file to Supabase SQL Editor
-- URL: https://app.supabase.com/project/uvdrwbmhmtgacwzujfzc/sql/new

/*
  # DependencyManager Features Migration

  This migration adds tables for:
  1. Mitigation Actions
  2. Business Impact Analysis (Business Functions, Business Impacts, Continuity Plans)
  3. NIST Framework (Controls, Mappings, Assessments)
  4. Framework Phases
  5. Risks (with dependency_id)
*/

-- Mitigation Actions Table
CREATE TABLE IF NOT EXISTS mitigation_actions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id text DEFAULT '',
  risk_id text NOT NULL,
  asset_id text,
  dependency_id text,
  name text NOT NULL,
  description text DEFAULT '',
  assignee text NOT NULL,
  due_date timestamptz NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in-progress', 'completed', 'cancelled')),
  progress integer DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  priority text DEFAULT 'Medium' CHECK (priority IN ('Critical', 'High', 'Medium', 'Low')),
  estimated_cost numeric,
  actual_cost numeric,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Business Functions Table
CREATE TABLE IF NOT EXISTS business_functions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id text DEFAULT '',
  name text NOT NULL,
  description text DEFAULT '',
  owner text NOT NULL,
  department text NOT NULL,
  priority text NOT NULL DEFAULT 'Medium' CHECK (priority IN ('Critical', 'High', 'Medium', 'Low')),
  mtd integer NOT NULL DEFAULT 24, -- Maximum Tolerable Downtime in hours
  rto integer NOT NULL DEFAULT 4, -- Recovery Time Objective in hours
  rpo integer NOT NULL DEFAULT 1, -- Recovery Point Objective in hours
  annual_revenue numeric,
  regulatory_requirements text[] DEFAULT '{}',
  dependencies text[] DEFAULT '{}', -- Asset IDs
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Business Impacts Table
CREATE TABLE IF NOT EXISTS business_impacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id text DEFAULT '',
  asset_id text NOT NULL,
  business_function_id uuid NOT NULL REFERENCES business_functions(id) ON DELETE CASCADE,
  financial_impact jsonb DEFAULT '{
    "hourlyRevenueLoss": 0,
    "recoveryCosts": 0,
    "reputationalCosts": 0,
    "penalties": 0
  }',
  operational_impact jsonb DEFAULT '{
    "affectedUsers": 0,
    "affectedProcesses": 0,
    "workaroundAvailable": false,
    "workaroundCost": 0
  }',
  regulatory_impact jsonb DEFAULT '{
    "regulations": [],
    "penaltiesPerDay": 0,
    "reportingRequired": false
  }',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Continuity Plans Table
CREATE TABLE IF NOT EXISTS continuity_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id text DEFAULT '',
  name text NOT NULL,
  description text DEFAULT '',
  business_function_id uuid NOT NULL REFERENCES business_functions(id) ON DELETE CASCADE,
  asset_ids text[] DEFAULT '{}',
  rto integer NOT NULL DEFAULT 4,
  rpo integer NOT NULL DEFAULT 1,
  steps jsonb DEFAULT '[]',
  contacts jsonb DEFAULT '[]',
  resources jsonb DEFAULT '[]',
  test_schedule jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- NIST Controls Table
CREATE TABLE IF NOT EXISTS nist_controls (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id text DEFAULT '',
  family text NOT NULL,
  number text NOT NULL,
  title text NOT NULL,
  description text DEFAULT '',
  priority integer DEFAULT 0,
  baseline_impact text[] DEFAULT '{}',
  related_controls text[] DEFAULT '{}',
  status text NOT NULL DEFAULT 'not-implemented' CHECK (status IN ('implemented', 'partially-implemented', 'planned', 'not-implemented')),
  implementation_details text,
  last_assessment timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(family, number, organization_id)
);

-- NIST Mappings Table
CREATE TABLE IF NOT EXISTS nist_mappings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id text DEFAULT '',
  asset_id text NOT NULL,
  functions text[] DEFAULT '{}',
  controls text[] DEFAULT '{}',
  security_categorization jsonb DEFAULT '{
    "confidentiality": "low",
    "integrity": "low",
    "availability": "low"
  }',
  supply_chain_tier integer DEFAULT 1,
  last_review timestamptz DEFAULT now(),
  next_review timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- NIST Assessments Table
CREATE TABLE IF NOT EXISTS nist_assessments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id text DEFAULT '',
  asset_id text NOT NULL,
  date timestamptz DEFAULT now(),
  assessor text NOT NULL,
  overall_score integer DEFAULT 0 CHECK (overall_score >= 0 AND overall_score <= 100),
  function_scores jsonb DEFAULT '{
    "identify": 0,
    "protect": 0,
    "detect": 0,
    "respond": 0,
    "recover": 0
  }',
  findings jsonb DEFAULT '[]',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Framework Phases Table
CREATE TABLE IF NOT EXISTS framework_phases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id text DEFAULT '',
  name text NOT NULL CHECK (name IN ('foundation', 'development', 'maturity', 'optimization')),
  progress integer DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  tasks jsonb DEFAULT '[]',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(name, organization_id)
);

-- Risks Table (if it doesn't exist, create it; otherwise add dependency_id column)
CREATE TABLE IF NOT EXISTS risks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id text DEFAULT '',
  asset_id text NOT NULL,
  dependency_id text,
  name text NOT NULL,
  description text DEFAULT '',
  likelihood integer DEFAULT 1 CHECK (likelihood >= 1 AND likelihood <= 5),
  impact integer DEFAULT 1 CHECK (impact >= 1 AND impact <= 5),
  risk_score integer DEFAULT 0 CHECK (risk_score >= 0 AND risk_score <= 100),
  level text NOT NULL DEFAULT 'Low' CHECK (level IN ('Critical', 'High', 'Medium', 'Low')),
  category text,
  source text,
  mitigation_status text DEFAULT 'Not Mitigated' CHECK (mitigation_status IN ('Not Mitigated', 'Partially Mitigated', 'Fully Mitigated')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add dependency_id to risks if table exists but column doesn't
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'risks') THEN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'risks' AND column_name = 'dependency_id') THEN
      ALTER TABLE risks ADD COLUMN dependency_id text;
    END IF;
  END IF;
END $$;

-- Enable RLS on all tables
ALTER TABLE mitigation_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_functions ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_impacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE continuity_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE nist_controls ENABLE ROW LEVEL SECURITY;
ALTER TABLE nist_mappings ENABLE ROW LEVEL SECURITY;
ALTER TABLE nist_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE framework_phases ENABLE ROW LEVEL SECURITY;
ALTER TABLE risks ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (basic policies - adjust based on your auth requirements)
-- Mitigation Actions
CREATE POLICY "Users can manage mitigation actions"
  ON mitigation_actions
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Business Functions
CREATE POLICY "Users can manage business functions"
  ON business_functions
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Business Impacts
CREATE POLICY "Users can manage business impacts"
  ON business_impacts
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Continuity Plans
CREATE POLICY "Users can manage continuity plans"
  ON continuity_plans
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- NIST Controls
CREATE POLICY "Users can manage nist controls"
  ON nist_controls
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- NIST Mappings
CREATE POLICY "Users can manage nist mappings"
  ON nist_mappings
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- NIST Assessments
CREATE POLICY "Users can manage nist assessments"
  ON nist_assessments
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Framework Phases
CREATE POLICY "Users can manage framework phases"
  ON framework_phases
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Risks
CREATE POLICY "Users can manage risks"
  ON risks
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_mitigation_actions_risk_id ON mitigation_actions(risk_id);
CREATE INDEX IF NOT EXISTS idx_mitigation_actions_asset_id ON mitigation_actions(asset_id);
CREATE INDEX IF NOT EXISTS idx_business_impacts_asset_id ON business_impacts(asset_id);
CREATE INDEX IF NOT EXISTS idx_business_impacts_function_id ON business_impacts(business_function_id);
CREATE INDEX IF NOT EXISTS idx_nist_mappings_asset_id ON nist_mappings(asset_id);
CREATE INDEX IF NOT EXISTS idx_nist_assessments_asset_id ON nist_assessments(asset_id);
CREATE INDEX IF NOT EXISTS idx_risks_asset_id ON risks(asset_id);
CREATE INDEX IF NOT EXISTS idx_risks_dependency_id ON risks(dependency_id);

-- Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers
CREATE TRIGGER update_mitigation_actions_updated_at BEFORE UPDATE ON mitigation_actions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_business_functions_updated_at BEFORE UPDATE ON business_functions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_business_impacts_updated_at BEFORE UPDATE ON business_impacts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_continuity_plans_updated_at BEFORE UPDATE ON continuity_plans
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_nist_controls_updated_at BEFORE UPDATE ON nist_controls
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_nist_mappings_updated_at BEFORE UPDATE ON nist_mappings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_nist_assessments_updated_at BEFORE UPDATE ON nist_assessments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_framework_phases_updated_at BEFORE UPDATE ON framework_phases
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_risks_updated_at BEFORE UPDATE ON risks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


