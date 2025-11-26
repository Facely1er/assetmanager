import { supabase, handleSupabaseError, isSupabaseEnabled } from '../lib/supabase';
import { Organization, OrganizationMember, Invitation, AuditLog } from '../types/organization';
import { logError } from '../utils/errorHandling';
import { withFallback, isServiceAvailable } from '../utils/serviceFallback';

type InvitationRole = Invitation['role'];

// Demo fallback data
const getDemoOrganizations = (): Organization[] => [
  {
    id: 'demo-org-1',
    name: 'Demo Organization',
    slug: 'demo-org',
    description: 'Sample organization for demonstration',
    logo_url: null,
    settings: {},
    plan: 'pro',
    created_at: new Date(),
    updated_at: new Date(),
    created_by: 'demo-user'
  }
];

export const organizationService = {
  // Get user's organizations
  async getUserOrganizations(): Promise<Organization[]> {
    if (!isSupabaseEnabled || !supabase || !isServiceAvailable()) {
      return getDemoOrganizations();
    }

    return withFallback(
      async () => {
        const { data, error } = await supabase!
          .from('organizations')
          .select(`
            *,
            organization_members!inner(role)
          `)
          .order('created_at', { ascending: false });

        if (error) throw new Error(handleSupabaseError(error));
        return data || [];
      },
      getDemoOrganizations,
      'organizationService.getUserOrganizations',
      { throwOnError: false }
    );
  },

  // Create organization
  async createOrganization(orgData: {
    name: string;
    slug: string;
    description?: string;
  }): Promise<Organization> {
    if (!isSupabaseEnabled || !supabase || !isServiceAvailable()) {
      throw new Error('Organization creation not available in demo mode');
    }

    try {
      const user = await supabase.auth.getUser();
      if (!user.data.user) throw new Error('User not authenticated');

      // Create organization
      const { data: org, error: orgError } = await supabase
        .from('organizations')
        .insert({
          name: orgData.name,
          slug: orgData.slug,
          description: orgData.description,
          created_by: user.data.user.id,
        })
        .select()
        .single();

      if (orgError) throw new Error(handleSupabaseError(orgError));

      // Add creator as owner
      const { error: memberError } = await supabase
        .from('organization_members')
        .insert({
          organization_id: org.id,
          user_id: user.data.user.id,
          role: 'owner',
        });

      if (memberError) throw new Error(handleSupabaseError(memberError));

      // Update user's current organization
      await supabase
        .from('profiles')
        .update({ current_organization_id: org.id })
        .eq('id', user.data.user.id);

      return org;
    } catch (error) {
      logError(error, 'organizationService.createOrganization');
      throw error;
    }
  },

  // Update organization
  async updateOrganization(id: string, updates: Partial<Organization>): Promise<Organization> {
    if (!isSupabaseEnabled || !supabase || !isServiceAvailable()) {
      // In demo mode, return updated demo organization
      const demoOrg = getDemoOrganizations().find(org => org.id === id);
      if (demoOrg) {
        return { ...demoOrg, ...updates, updated_at: new Date() } as Organization;
      }
      throw new Error('Organization not found');
    }

    return withFallback(
      async () => {
        const { data, error } = await supabase!
          .from('organizations')
          .update(updates)
          .eq('id', id)
          .select()
          .single();

        if (error) throw new Error(handleSupabaseError(error));
        return data;
      },
      () => {
        const demoOrg = getDemoOrganizations().find(org => org.id === id);
        if (demoOrg) {
          return { ...demoOrg, ...updates, updated_at: new Date() } as Organization;
        }
        throw new Error('Organization not found and service unavailable');
      },
      'organizationService.updateOrganization',
      { throwOnError: true }
    );
  },

  // Get organization members
  async getOrganizationMembers(organizationId: string): Promise<OrganizationMember[]> {
    if (!isSupabaseEnabled || !supabase || !isServiceAvailable()) {
      return [];
    }

    try {
      const { data, error } = await supabase
        .from('organization_members')
        .select(`
          *,
          user:profiles(id, email, full_name)
        `)
        .eq('organization_id', organizationId)
        .order('joined_at', { ascending: true });

      if (error) throw new Error(handleSupabaseError(error));
      return data || [];
    } catch (error) {
      logError(error, 'organizationService.getOrganizationMembers');
      throw error;
    }
  },

  // Invite user to organization
  async inviteUser(organizationId: string, email: string, role: string): Promise<Invitation> {
    if (!isSupabaseEnabled || !supabase || !isServiceAvailable()) {
      // Demo mode - return mock invitation
      return Promise.resolve({
        id: `demo-invite-${Date.now()}`,
        organization_id: organizationId,
        email,
        role: role as InvitationRole,
        invited_by: 'demo-user',
        token: 'demo-token',
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        created_at: new Date()
      });
    }

    try {
      const user = await supabase.auth.getUser();
      if (!user.data.user) throw new Error('User not authenticated');

      const token = crypto.randomUUID();
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7); // 7 days expiry

      const { data, error } = await supabase
        .from('invitations')
        .insert({
          organization_id: organizationId,
          email,
          role,
          invited_by: user.data.user.id,
          token,
          expires_at: expiresAt.toISOString(),
        })
        .select()
        .single();

      if (error) throw new Error(handleSupabaseError(error));
      return data;
    } catch (error) {
      logError(error, 'organizationService.inviteUser');
      throw error;
    }
  },

  async inviteMember(invitation: Partial<Invitation>): Promise<Invitation> {
    if (!isSupabaseEnabled || !supabase || !isServiceAvailable()) {
      throw new Error('Team features not available in demo mode');
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('invitations')
        .insert(invitation)
        .select()
        .single();

      if (error) throw new Error(handleSupabaseError(error));
      return data;
    } catch (error) {
      logError(error, 'organizationService.inviteMember');
      throw error;
    }
  },

  // Accept invitation
  async acceptInvitation(token: string): Promise<void> {
    if (!isSupabaseEnabled || !supabase || !isServiceAvailable()) {
      throw new Error('Team features not available in demo mode');
    }

    try {
      const user = await supabase.auth.getUser();
      if (!user.data.user) throw new Error('User not authenticated');

      // Get invitation
      const { data: invitation, error: invError } = await supabase
        .from('invitations')
        .select('*')
        .eq('token', token)
        .eq('email', user.data.user.email || '')
        .is('accepted_at', null)
        .gte('expires_at', new Date().toISOString())
        .single();

      if (invError || !invitation) {
        throw new Error('Invalid or expired invitation');
      }

      // Add user to organization
      const { error: memberError } = await supabase
        .from('organization_members')
        .insert({
          organization_id: invitation.organization_id,
          user_id: user.data.user.id,
          role: invitation.role,
          invited_by: invitation.invited_by,
        });

      if (memberError) throw new Error(handleSupabaseError(memberError));

      // Mark invitation as accepted
      await supabase
        .from('invitations')
        .update({ accepted_at: new Date().toISOString() })
        .eq('id', invitation.id);
    } catch (error) {
      logError(error, 'organizationService.acceptInvitation');
      throw error;
    }
  },

  // Update member role
  async updateMemberRole(organizationId: string, userId: string, role: string): Promise<void> {
    if (!isSupabaseEnabled || !supabase || !isServiceAvailable()) {
      throw new Error('Team features not available in demo mode');
    }

    try {
      const { error } = await supabase
        .from('organization_members')
        .update({ role })
        .eq('organization_id', organizationId)
        .eq('user_id', userId);

      if (error) throw new Error(handleSupabaseError(error));
    } catch (error) {
      logError(error, 'organizationService.updateMemberRole');
      throw error;
    }
  },

  // Remove member
  async removeMember(organizationId: string, userId: string): Promise<void> {
    if (!isSupabaseEnabled || !supabase || !isServiceAvailable()) {
      throw new Error('Team features not available in demo mode');
    }

    try {
      const { error } = await supabase
        .from('organization_members')
        .delete()
        .eq('organization_id', organizationId)
        .eq('user_id', userId);

      if (error) throw new Error(handleSupabaseError(error));
    } catch (error) {
      logError(error, 'organizationService.removeMember');
      throw error;
    }
  },

  // Get audit logs
  async getAuditLogs(organizationId: string, limit = 100): Promise<AuditLog[]> {
    if (!isSupabaseEnabled || !supabase || !isServiceAvailable()) {
      return [];
    }

    try {
      const { data, error } = await supabase
        .from('audit_logs')
        .select(`
          *,
          user:profiles(full_name, email)
        `)
        .eq('organization_id', organizationId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw new Error(handleSupabaseError(error));
      return data || [];
    } catch (error) {
      logError(error, 'organizationService.getAuditLogs');
      throw error;
    }
  },

  // Switch current organization
  async switchOrganization(organizationId: string): Promise<void> {
    if (!isSupabaseEnabled || !supabase || !isServiceAvailable()) {
      throw new Error('Organization switching not available in demo mode');
    }

    try {
      const user = await supabase.auth.getUser();
      if (!user.data.user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('profiles')
        .update({ current_organization_id: organizationId })
        .eq('id', user.data.user.id);

      if (error) throw new Error(handleSupabaseError(error));
    } catch (error) {
      logError(error, 'organizationService.switchOrganization');
      throw error;
    }
  },
};