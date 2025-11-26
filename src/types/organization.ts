export interface Organization {
  id: string;
  name: string;
  slug: string;
  description?: string;
  logo_url?: string | null;
  settings: Record<string, unknown>;
  plan: 'free' | 'pro' | 'enterprise';
  created_at: Date;
  updated_at: Date;
  created_by: string;
}

export interface OrganizationMember {
  id: string;
  organization_id: string;
  user_id: string;
  role: 'owner' | 'admin' | 'editor' | 'viewer' | 'member';
  permissions: Record<string, unknown>;
  joined_at: Date;
  invited_by?: string;
  user?: {
    id: string;
    email: string;
    full_name?: string;
  };
}

export interface Invitation {
  id: string;
  organization_id: string;
  email: string;
  role: 'admin' | 'editor' | 'viewer' | 'member';
  invited_by: string;
  token: string;
  expires_at: Date;
  accepted_at?: Date;
  created_at: Date;
  organization?: Organization;
  inviter?: {
    full_name?: string;
    email: string;
  };
}

export interface AuditLog {
  id: string;
  organization_id?: string;
  user_id?: string;
  action: string;
  resource_type: string;
  resource_id?: string;
  old_values?: Record<string, unknown>;
  new_values?: Record<string, unknown>;
  ip_address?: string;
  user_agent?: string;
  created_at: Date;
  user?: {
    full_name?: string;
    email: string;
  };
}

export interface Notification {
  id: string;
  user_id: string;
  organization_id?: string;
  type: string;
  title: string;
  message: string;
  data: Record<string, unknown>;
  read_at?: Date;
  created_at: Date;
}

export interface Report {
  id: string;
  organization_id: string;
  created_by: string;
  name: string;
  description?: string;
  type: 'asset_summary' | 'compliance' | 'risk_assessment' | 'vulnerability' | 'custom';
  filters: Record<string, unknown>;
  schedule: Record<string, unknown>;
  format: 'pdf' | 'excel' | 'csv';
  is_public: boolean;
  last_generated?: Date;
  created_at: Date;
  updated_at: Date;
}

export interface Integration {
  id: string;
  organization_id: string;
  name: string;
  type: 'email' | 'slack' | 'teams' | 'webhook' | 'api';
  config: Record<string, unknown>;
  is_active: boolean;
  last_sync?: Date;
  created_at: Date;
  updated_at: Date;
  created_by: string;
}

export interface OrganizationSettings {
  notifications: {
    email_enabled: boolean;
    slack_enabled: boolean;
    in_app_enabled: boolean;
    asset_changes: boolean;
    vulnerability_alerts: boolean;
    compliance_reports: boolean;
  };
  security: {
    require_mfa: boolean;
    session_timeout: number;
    ip_restrictions: string[];
  };
  integrations: {
    api_enabled: boolean;
    webhook_url?: string;
    allowed_domains: string[];
  };
}