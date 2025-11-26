import React, { useState, useEffect } from 'react';
import { 
  X, 
  Save, 
  Building2, 
  Shield, 
  Bell, 
  Plug, 
  CreditCard,
  Upload,
  Trash2,
  AlertTriangle,
  Settings
} from 'lucide-react';
import { Organization, OrganizationSettings } from '../../types/organization';
import { logger } from '../../utils/logger';
import { organizationService } from '../../services/organizationService';
import toast from 'react-hot-toast';
import { Card, CardHeader, CardTitle, CardContent } from '../ui';

interface OrganizationSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  organization: Organization;
  onUpdate?: (updatedOrg: Organization) => void;
}

export const OrganizationSettingsModal: React.FC<OrganizationSettingsModalProps> = ({
  isOpen,
  onClose,
  organization,
  onUpdate
}) => {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'general' | 'security' | 'notifications' | 'integrations' | 'billing'>('general');
  
  // General settings
  const [name, setName] = useState(organization.name);
  const [slug, setSlug] = useState(organization.slug);
  const [description, setDescription] = useState(organization.description || '');
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(organization.logo_url || null);

  // Security settings
  const [settings, setSettings] = useState<OrganizationSettings>({
    notifications: {
      email_enabled: ((organization.settings?.['notifications'] as OrganizationSettings['notifications'])?.email_enabled) ?? true,
      slack_enabled: ((organization.settings?.['notifications'] as OrganizationSettings['notifications'])?.slack_enabled) ?? false,
      in_app_enabled: ((organization.settings?.['notifications'] as OrganizationSettings['notifications'])?.in_app_enabled) ?? true,
      asset_changes: ((organization.settings?.['notifications'] as OrganizationSettings['notifications'])?.asset_changes) ?? true,
      vulnerability_alerts: ((organization.settings?.['notifications'] as OrganizationSettings['notifications'])?.vulnerability_alerts) ?? true,
      compliance_reports: ((organization.settings?.['notifications'] as OrganizationSettings['notifications'])?.compliance_reports) ?? true,
    },
    security: {
      require_mfa: ((organization.settings?.['security'] as OrganizationSettings['security'])?.require_mfa) ?? false,
      session_timeout: ((organization.settings?.['security'] as OrganizationSettings['security'])?.session_timeout) ?? 3600,
      ip_restrictions: ((organization.settings?.['security'] as OrganizationSettings['security'])?.ip_restrictions) ?? [],
    },
    integrations: {
      api_enabled: ((organization.settings?.['integrations'] as OrganizationSettings['integrations'])?.api_enabled) ?? false,
      webhook_url: ((organization.settings?.['integrations'] as OrganizationSettings['integrations'])?.webhook_url) || '',
      allowed_domains: ((organization.settings?.['integrations'] as OrganizationSettings['integrations'])?.allowed_domains) ?? [],
    }
  });

  useEffect(() => {
    if (isOpen) {
      setName(organization.name);
      setSlug(organization.slug);
      setDescription(organization.description || '');
      setLogoPreview(organization.logo_url || null);
      setSettings({
        notifications: {
          email_enabled: ((organization.settings?.['notifications'] as OrganizationSettings['notifications'])?.email_enabled) ?? true,
          slack_enabled: ((organization.settings?.['notifications'] as OrganizationSettings['notifications'])?.slack_enabled) ?? false,
          in_app_enabled: ((organization.settings?.['notifications'] as OrganizationSettings['notifications'])?.in_app_enabled) ?? true,
          asset_changes: ((organization.settings?.['notifications'] as OrganizationSettings['notifications'])?.asset_changes) ?? true,
          vulnerability_alerts: ((organization.settings?.['notifications'] as OrganizationSettings['notifications'])?.vulnerability_alerts) ?? true,
          compliance_reports: ((organization.settings?.['notifications'] as OrganizationSettings['notifications'])?.compliance_reports) ?? true,
        },
        security: {
          require_mfa: ((organization.settings?.['security'] as OrganizationSettings['security'])?.require_mfa) ?? false,
          session_timeout: ((organization.settings?.['security'] as OrganizationSettings['security'])?.session_timeout) ?? 3600,
          ip_restrictions: ((organization.settings?.['security'] as OrganizationSettings['security'])?.ip_restrictions) ?? [],
        },
        integrations: {
          api_enabled: ((organization.settings?.['integrations'] as OrganizationSettings['integrations'])?.api_enabled) ?? false,
          webhook_url: ((organization.settings?.['integrations'] as OrganizationSettings['integrations'])?.webhook_url) || '',
          allowed_domains: ((organization.settings?.['integrations'] as OrganizationSettings['integrations'])?.allowed_domains) ?? [],
        }
      });
    }
  }, [isOpen, organization]);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Logo file size must be less than 5MB');
        return;
      }
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }
      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const updates: Partial<Organization> = {
        name,
        slug,
        description,
        settings: {
          ...organization.settings,
          ...settings
        }
      };

      // Handle logo upload if a new file was selected
      if (logoFile && logoPreview) {
        // In a real implementation, you would upload the file to storage
        // For now, we'll just use the preview URL
        updates.logo_url = logoPreview;
      }

      const updatedOrg = await organizationService.updateOrganization(organization.id, updates);
      
      if (onUpdate) {
        onUpdate(updatedOrg);
      }
      
      toast.success('Organization settings updated successfully');
      onClose();
    } catch (error) {
      logger.error('Error updating organization', error instanceof Error ? error : undefined);
      toast.error('Failed to update organization settings');
    } finally {
      setLoading(false);
    }
  };

  const handleAddIpRestriction = () => {
    const ip = prompt('Enter IP address or CIDR block:');
    if (ip && ip.trim()) {
      setSettings(prev => ({
        ...prev,
        security: {
          ...prev.security,
          ip_restrictions: [...prev.security.ip_restrictions, ip.trim()]
        }
      }));
    }
  };

  const handleRemoveIpRestriction = (ip: string) => {
    setSettings(prev => ({
      ...prev,
      security: {
        ...prev.security,
        ip_restrictions: prev.security.ip_restrictions.filter(i => i !== ip)
      }
    }));
  };

  const handleAddAllowedDomain = () => {
    const domain = prompt('Enter allowed domain:');
    if (domain && domain.trim()) {
      setSettings(prev => ({
        ...prev,
        integrations: {
          ...prev.integrations,
          allowed_domains: [...prev.integrations.allowed_domains, domain.trim()]
        }
      }));
    }
  };

  const handleRemoveAllowedDomain = (domain: string) => {
    setSettings(prev => ({
      ...prev,
      integrations: {
        ...prev.integrations,
        allowed_domains: prev.integrations.allowed_domains.filter(d => d !== domain)
      }
    }));
  };

  if (!isOpen) return null;

  const tabs = [
    { id: 'general', label: 'General', icon: Building2 },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'integrations', label: 'Integrations', icon: Plug },
    { id: 'billing', label: 'Billing', icon: CreditCard },
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={onClose}>
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center">
            <Settings className="h-6 w-6 mr-3" />
            <h2 className="text-xl font-outfit font-bold">Organization Settings</h2>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-white hover:bg-opacity-20 rounded-lg p-1 transition-colors"
            aria-label="Close settings modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 dark:border-gray-700 px-6">
          <div className="flex space-x-1 overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as typeof activeTab)}
                  className={`flex items-center px-4 py-3 border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                  }`}
                >
                  <Icon className="h-4 w-4 mr-2" />
                  <span className="whitespace-nowrap">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'general' && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Organization Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Organization Name *</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      required
                      aria-label="Organization name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">URL Slug *</label>
                    <input
                      type="text"
                      value={slug}
                      onChange={(e) => setSlug(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      required
                      aria-label="URL slug"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Description</label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      rows={3}
                      aria-label="Organization description"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Logo</label>
                    <div className="flex items-center space-x-4">
                      {logoPreview && (
                        <img src={logoPreview} alt="Logo preview" className="w-16 h-16 rounded-lg object-cover" />
                      )}
                      <div>
                        <label className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer">
                          <Upload className="h-4 w-4 mr-2" />
                          Upload Logo
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleLogoChange}
                            className="hidden"
                            aria-label="Upload organization logo"
                          />
                        </label>
                        {logoPreview && (
                          <button
                            onClick={() => {
                              setLogoPreview(null);
                              setLogoFile(null);
                            }}
                            className="ml-2 inline-flex items-center px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                            aria-label="Remove logo"
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Remove
                          </button>
                        )}
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Max file size: 5MB. Recommended: 256x256px</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Security Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="block text-sm font-medium mb-1">Require Multi-Factor Authentication</label>
                      <p className="text-xs text-gray-500 dark:text-gray-400">All members must use MFA to access this organization</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.security.require_mfa}
                        onChange={(e) => setSettings(prev => ({
                          ...prev,
                          security: { ...prev.security, require_mfa: e.target.checked }
                        }))}
                        className="sr-only peer"
                        aria-label="Require Multi-Factor Authentication"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Session Timeout (seconds)</label>
                    <input
                      type="number"
                      value={settings.security.session_timeout}
                      onChange={(e) => setSettings(prev => ({
                        ...prev,
                        security: { ...prev.security, session_timeout: parseInt(e.target.value) || 3600 }
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      min={300}
                      max={86400}
                      aria-label="Session timeout in seconds"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Default: 3600 seconds (1 hour)</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">IP Restrictions</label>
                    <div className="space-y-2">
                      {settings.security.ip_restrictions.map((ip) => (
                        <div key={ip} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded">
                          <span className="text-sm font-mono">{ip}</span>
                          <button
                            onClick={() => handleRemoveIpRestriction(ip)}
                            className="text-red-600 hover:text-red-700"
                            aria-label={`Remove IP restriction ${ip}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                      <button
                        onClick={handleAddIpRestriction}
                        className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400"
                      >
                        + Add IP Restriction
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Restrict access to specific IP addresses or CIDR blocks</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Notification Channels</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="block text-sm font-medium mb-1">Email Notifications</label>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Send notifications via email</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.notifications.email_enabled}
                        onChange={(e) => setSettings(prev => ({
                          ...prev,
                          notifications: { ...prev.notifications, email_enabled: e.target.checked }
                        }))}
                        className="sr-only peer"
                        aria-label="Enable email notifications"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="block text-sm font-medium mb-1">Slack Notifications</label>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Send notifications to Slack</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.notifications.slack_enabled}
                        onChange={(e) => setSettings(prev => ({
                          ...prev,
                          notifications: { ...prev.notifications, slack_enabled: e.target.checked }
                        }))}
                        className="sr-only peer"
                        aria-label="Enable Slack notifications"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="block text-sm font-medium mb-1">In-App Notifications</label>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Show notifications in the application</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.notifications.in_app_enabled}
                        onChange={(e) => setSettings(prev => ({
                          ...prev,
                          notifications: { ...prev.notifications, in_app_enabled: e.target.checked }
                        }))}
                        className="sr-only peer"
                        aria-label="Enable in-app notifications"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Notification Types</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="block text-sm font-medium mb-1">Asset Changes</label>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Notify when assets are created, updated, or deleted</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.notifications.asset_changes}
                        onChange={(e) => setSettings(prev => ({
                          ...prev,
                          notifications: { ...prev.notifications, asset_changes: e.target.checked }
                        }))}
                        className="sr-only peer"
                        aria-label="Notify on asset changes"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="block text-sm font-medium mb-1">Vulnerability Alerts</label>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Notify when new vulnerabilities are detected</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.notifications.vulnerability_alerts}
                        onChange={(e) => setSettings(prev => ({
                          ...prev,
                          notifications: { ...prev.notifications, vulnerability_alerts: e.target.checked }
                        }))}
                        className="sr-only peer"
                        aria-label="Notify on vulnerability alerts"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="block text-sm font-medium mb-1">Compliance Reports</label>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Notify when compliance reports are generated</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.notifications.compliance_reports}
                        onChange={(e) => setSettings(prev => ({
                          ...prev,
                          notifications: { ...prev.notifications, compliance_reports: e.target.checked }
                        }))}
                        className="sr-only peer"
                        aria-label="Notify on compliance reports"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === 'integrations' && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>API & Webhooks</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="block text-sm font-medium mb-1">Enable API Access</label>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Allow programmatic access via API</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.integrations.api_enabled}
                        onChange={(e) => setSettings(prev => ({
                          ...prev,
                          integrations: { ...prev.integrations, api_enabled: e.target.checked }
                        }))}
                        className="sr-only peer"
                        aria-label="Enable API access"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Webhook URL</label>
                    <input
                      type="url"
                      value={settings.integrations.webhook_url}
                      onChange={(e) => setSettings(prev => ({
                        ...prev,
                        integrations: { ...prev.integrations, webhook_url: e.target.value }
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      placeholder="https://example.com/webhook"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Receive real-time events at this URL</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Allowed Domains</label>
                    <div className="space-y-2">
                      {settings.integrations.allowed_domains.map((domain) => (
                        <div key={domain} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded">
                          <span className="text-sm">{domain}</span>
                          <button
                            onClick={() => handleRemoveAllowedDomain(domain)}
                            className="text-red-600 hover:text-red-700"
                            aria-label={`Remove allowed domain ${domain}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                      <button
                        onClick={handleAddAllowedDomain}
                        className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400"
                      >
                        + Add Domain
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Restrict API access to specific domains</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === 'billing' && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Billing & Plan</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <div className="flex items-start">
                      <AlertTriangle className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-2 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-1">Current Plan: {organization.plan.toUpperCase()}</h4>
                        <p className="text-sm text-blue-800 dark:text-blue-200">
                          Billing management is coming soon. Contact support to upgrade or modify your plan.
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Plan</span>
                      <span className="font-medium capitalize">{organization.plan}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Created</span>
                      <span className="font-medium">{new Date(organization.created_at).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Last Updated</span>
                      <span className="font-medium">{new Date(organization.updated_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 dark:border-gray-700 px-6 py-4 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={loading || !name.trim() || !slug.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

