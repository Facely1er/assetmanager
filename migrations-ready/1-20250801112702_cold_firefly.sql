-- Migration 1
-- Source: 20250801112702_cold_firefly.sql
-- Copy this entire file to Supabase SQL Editor
-- URL: https://app.supabase.com/project/uvdrwbmhmtgacwzujfzc/sql/new

/*
  # Create reports table for team management

  1. New Tables
    - `reports`
      - `id` (uuid, primary key)
      - `organization_id` (text)
      - `created_by` (uuid, foreign key to profiles)
      - `name` (text)
      - `description` (text, optional)
      - `type` (text, report type)
      - `filters` (jsonb, report filters)
      - `schedule` (jsonb, scheduling options)
      - `format` (text, output format)
      - `is_public` (boolean)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `reports` table
    - Add policy for authenticated users to read/write their own reports
*/

CREATE TABLE IF NOT EXISTS reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id text DEFAULT '',
  created_by uuid REFERENCES profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text DEFAULT '',
  type text NOT NULL DEFAULT 'asset_summary',
  filters jsonb DEFAULT '{}',
  schedule jsonb DEFAULT '{}',
  format text NOT NULL DEFAULT 'pdf',
  is_public boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own reports"
  ON reports
  FOR SELECT
  TO authenticated
  USING (auth.uid() = created_by);

CREATE POLICY "Users can create own reports"
  ON reports
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update own reports"
  ON reports
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = created_by);

CREATE POLICY "Users can delete own reports"
  ON reports
  FOR DELETE
  TO authenticated
  USING (auth.uid() = created_by);

-- Add updated_at trigger
CREATE TRIGGER handle_reports_updated_at
  BEFORE UPDATE ON reports
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_reports_created_by ON reports(created_by);
CREATE INDEX IF NOT EXISTS idx_reports_organization_id ON reports(organization_id);
CREATE INDEX IF NOT EXISTS idx_reports_created_at ON reports(created_at);
