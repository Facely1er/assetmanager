export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      assets: {
        Row: {
          id: string
          name: string
          type: 'Server' | 'Database' | 'Application' | 'Network' | 'Endpoint' | 'Cloud Service'
          criticality: 'Critical' | 'High' | 'Medium' | 'Low'
          owner: string
          location: string
          ip_address: string | null
          description: string
          compliance_frameworks: string[]
          risk_score: number
          tags: string[]
          status: 'Active' | 'Inactive' | 'Retired' | 'Planned'
          last_assessed: string
          created_at: string
          updated_at: string
          user_id: string
        }
        Insert: {
          id?: string
          name: string
          type: 'Server' | 'Database' | 'Application' | 'Network' | 'Endpoint' | 'Cloud Service'
          criticality: 'Critical' | 'High' | 'Medium' | 'Low'
          owner: string
          location: string
          ip_address?: string | null
          description: string
          compliance_frameworks?: string[]
          risk_score?: number
          tags?: string[]
          status?: 'Active' | 'Inactive' | 'Retired' | 'Planned'
          last_assessed?: string
          created_at?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          id?: string
          name?: string
          type?: 'Server' | 'Database' | 'Application' | 'Network' | 'Endpoint' | 'Cloud Service'
          criticality?: 'Critical' | 'High' | 'Medium' | 'Low'
          owner?: string
          location?: string
          ip_address?: string | null
          description?: string
          compliance_frameworks?: string[]
          risk_score?: number
          tags?: string[]
          status?: 'Active' | 'Inactive' | 'Retired' | 'Planned'
          last_assessed?: string
          created_at?: string
          updated_at?: string
          user_id?: string
        }
      }
      asset_relationships: {
        Row: {
          id: string
          asset_id: string
          related_asset_id: string
          relationship_type: 'Depends On' | 'Connects To' | 'Hosts' | 'Manages' | 'Accesses'
          strength: 'Strong' | 'Medium' | 'Weak'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          asset_id: string
          related_asset_id: string
          relationship_type: 'Depends On' | 'Connects To' | 'Hosts' | 'Manages' | 'Accesses'
          strength?: 'Strong' | 'Medium' | 'Weak'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          asset_id?: string
          related_asset_id?: string
          relationship_type?: 'Depends On' | 'Connects To' | 'Hosts' | 'Manages' | 'Accesses'
          strength?: 'Strong' | 'Medium' | 'Weak'
          created_at?: string
          updated_at?: string
        }
      }
      asset_vulnerabilities: {
        Row: {
          id: string
          asset_id: string
          cve_id: string | null
          severity: 'Critical' | 'High' | 'Medium' | 'Low'
          title: string
          description: string
          discovered_at: string
          status: 'Open' | 'In Progress' | 'Resolved' | 'Accepted Risk'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          asset_id: string
          cve_id?: string | null
          severity: 'Critical' | 'High' | 'Medium' | 'Low'
          title: string
          description: string
          discovered_at?: string
          status?: 'Open' | 'In Progress' | 'Resolved' | 'Accepted Risk'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          asset_id?: string
          cve_id?: string | null
          severity?: 'Critical' | 'High' | 'Medium' | 'Low'
          title?: string
          description?: string
          discovered_at?: string
          status?: 'Open' | 'In Progress' | 'Resolved' | 'Accepted Risk'
          created_at?: string
          updated_at?: string
        }
      }
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          organization: string | null
          role: string | null
          current_organization_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          organization?: string | null
          role?: string | null
          current_organization_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          organization?: string | null
          role?: string | null
          current_organization_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      organizations: {
        Row: {
          id: string
          name: string
          slug: string
          description: string
          logo_url: string | null
          settings: Json
          plan: 'free' | 'pro' | 'enterprise'
          created_by: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          description?: string
          logo_url?: string | null
          settings?: Json
          plan?: 'free' | 'pro' | 'enterprise'
          created_by: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          description?: string
          logo_url?: string | null
          settings?: Json
          plan?: 'free' | 'pro' | 'enterprise'
          created_by?: string
          created_at?: string
          updated_at?: string
        }
      }
      organization_members: {
        Row: {
          id: string
          organization_id: string
          user_id: string
          role: 'owner' | 'admin' | 'editor' | 'viewer' | 'member'
          invited_by: string | null
          joined_at: string
          created_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          user_id: string
          role?: 'owner' | 'admin' | 'editor' | 'viewer' | 'member'
          invited_by?: string | null
          joined_at?: string
          created_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          user_id?: string
          role?: 'owner' | 'admin' | 'editor' | 'viewer' | 'member'
          invited_by?: string | null
          joined_at?: string
          created_at?: string
        }
      }
      invitations: {
        Row: {
          id: string
          organization_id: string
          email: string
          role: 'admin' | 'editor' | 'viewer' | 'member'
          token: string
          invited_by: string
          expires_at: string
          accepted_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          email: string
          role: 'admin' | 'editor' | 'viewer' | 'member'
          token: string
          invited_by: string
          expires_at: string
          accepted_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          email?: string
          role?: 'admin' | 'editor' | 'viewer' | 'member'
          token?: string
          invited_by?: string
          expires_at?: string
          accepted_at?: string | null
          created_at?: string
        }
      }
      audit_logs: {
        Row: {
          id: string
          organization_id: string | null
          user_id: string | null
          action: string
          resource_type: string
          resource_id: string | null
          old_values: Json | null
          new_values: Json | null
          ip_address: string | null
          user_agent: string | null
          created_at: string
        }
        Insert: {
          id?: string
          organization_id?: string | null
          user_id?: string | null
          action: string
          resource_type: string
          resource_id?: string | null
          old_values?: Json | null
          new_values?: Json | null
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          organization_id?: string | null
          user_id?: string | null
          action?: string
          resource_type?: string
          resource_id?: string | null
          old_values?: Json | null
          new_values?: Json | null
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}