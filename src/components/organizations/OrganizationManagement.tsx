import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Users, 
  Settings, 
  Plus, 
  Edit, 
  Trash2,
  Crown,
  Shield,
  Calendar,
  Activity,
  BarChart3,
  UserPlus
} from 'lucide-react';
import { Organization, OrganizationMember } from '../../types/organization';
import { organizationService } from '../../services/organizationService';
import { useAuth } from '../../hooks/useAuth';
import { TeamManagementModal } from '../team/TeamManagementModal';
import toast from 'react-hot-toast';

export const OrganizationManagement: React.FC = () => {
  const { user } = useAuth();
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null);
  const [showTeamModal, setShowTeamModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [newOrgData, setNewOrgData] = useState({
    name: '',
    slug: '',
    description: ''
  });

  useEffect(() => {
    loadOrganizations();
  }, []);

  const loadOrganizations = async () => {
    setLoading(true);
    try {
      const orgs = await organizationService.getUserOrganizations();
      setOrganizations(orgs);
    } catch (error) {
      console.error('Error loading organizations:', error);
      // Demo mode - show sample organization
      setOrganizations([
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
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOrganization = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOrgData.name.trim() || !newOrgData.slug.trim()) {
      toast.error('Name and slug are required');
      return;
    }

    try {
      const newOrg = await organizationService.createOrganization(newOrgData);
      setOrganizations([newOrg, ...organizations]);
      setShowCreateModal(false);
      setNewOrgData({ name: '', slug: '', description: '' });
      toast.success('Organization created successfully');
    } catch (error) {
      toast.error('Failed to create organization');
    }
  };

  const handleManageTeam = (org: Organization) => {
    setSelectedOrg(org);
    setShowTeamModal(true);
  };

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case 'enterprise': return 'text-purple-600 bg-purple-50 border-purple-200';
      case 'pro': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'free': return 'text-gray-600 bg-gray-50 border-gray-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const generateSlug = (name: string) => {
    return name.toLowerCase()
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-outfit font-bold mb-2 flex items-center">
              <Building2 className="h-8 w-8 mr-3" />
              Organization Management
            </h1>
            <p className="text-lg opacity-90 mb-4">
              Manage your organizations, teams, and access controls
            </p>
            <div className="flex items-center space-x-6 text-sm">
              <div className="flex items-center">
                <Building2 className="h-4 w-4 mr-2" />
                <span>{organizations.length} Organizations</span>
              </div>
              <div className="flex items-center">
                <Users className="h-4 w-4 mr-2" />
                <span>Team Management</span>
              </div>
              <div className="flex items-center">
                <Shield className="h-4 w-4 mr-2" />
                <span>Role-based Access</span>
              </div>
            </div>
          </div>
          <div className="hidden lg:block">
            <div className="w-24 h-24 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
              <Building2 className="h-12 w-12 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-outfit font-semibold text-gray-900 mb-2">Organizations</h2>
            <p className="text-gray-600">Manage your organizational structure and team access</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Organization
          </button>
        </div>
      </div>

      {/* Organizations Grid */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {organizations.map((org) => (
            <div key={org.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Building2 className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{org.name}</h3>
                    <p className="text-sm text-gray-500">@{org.slug}</p>
                  </div>
                </div>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getPlanColor(org.plan)}`}>
                  {org.plan}
                </span>
              </div>

              {org.description && (
                <p className="text-sm text-gray-600 mb-4">{org.description}</p>
              )}

              <div className="space-y-3 mb-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Created</span>
                  <span className="font-medium">{new Date(org.created_at).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Plan</span>
                  <span className="font-medium capitalize">{org.plan}</span>
                </div>
              </div>

              <div className="flex space-x-2">
                <button
                  onClick={() => handleManageTeam(org)}
                  className="flex-1 inline-flex items-center justify-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Users className="h-4 w-4 mr-2" />
                  Manage Team
                </button>
                <button
                  onClick={() => {
                    // TODO: Implement organization settings
                    toast.info('Organization settings coming soon');
                  }}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <Settings className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Organization Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4 text-white rounded-t-xl">
              <h2 className="text-xl font-outfit font-bold">Create Organization</h2>
            </div>
            <form onSubmit={handleCreateOrganization} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Organization Name *
                </label>
                <input
                  type="text"
                  value={newOrgData.name}
                  onChange={(e) => {
                    setNewOrgData({ 
                      ...newOrgData, 
                      name: e.target.value,
                      slug: generateSlug(e.target.value)
                    });
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter organization name"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  URL Slug *
                </label>
                <input
                  type="text"
                  value={newOrgData.slug}
                  onChange={(e) => setNewOrgData({ ...newOrgData, slug: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="organization-slug"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={newOrgData.description}
                  onChange={(e) => setNewOrgData({ ...newOrgData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Optional description"
                />
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Create Organization
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Team Management Modal */}
      {selectedOrg && showTeamModal && (
        <TeamManagementModal
          isOpen={showTeamModal}
          onClose={() => {
            setShowTeamModal(false);
            setSelectedOrg(null);
          }}
          organization={selectedOrg}
        />
      )}
    </div>
  );
};