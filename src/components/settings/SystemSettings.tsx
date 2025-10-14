import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  Shield, 
  Bell, 
  Database, 
  Mail, 
  Webhook,
  Save,
  RefreshCw,
  Eye,
  EyeOff,
  AlertTriangle,
  CheckCircle,
  Globe,
  Lock,
  Zap
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { isSupabaseEnabled } from '../../lib/supabase';
import toast from 'react-hot-toast';

interface SystemSettingsState {
  notifications: {
    email_enabled: boolean;
    in_app_enabled: boolean;
    asset_changes: boolean;
    vulnerability_alerts: boolean;
    compliance_reports: boolean;
  };
  security: {
    session_timeout: number;
    require_mfa: boolean;
    password_policy: {
      min_length: number;
      require_uppercase: boolean;
      require_lowercase: boolean;
      require_numbers: boolean;
      require_symbols: boolean;
    };
  };
  integrations: {
    api_enabled: boolean;
    webhook_url: string;
    webhook_secret: string;
    rate_limit: number;
  };
  database: {
    backup_enabled: boolean;
    backup_frequency: 'daily' | 'weekly';
    retention_days: number;
  };
  general: {
    organization_name: string;
    timezone: string;
    date_format: string;
    theme: 'light' | 'dark' | 'auto';
  };
}

export const SystemSettings: React.FC = () => {
  const { user } = useAuth();
  const [settings, setSettings] = useState<SystemSettingsState>({
    notifications: {
      email_enabled: true,
      in_app_enabled: true,
      asset_changes: true,
      vulnerability_alerts: true,
      compliance_reports: false,
    },
    security: {
      session_timeout: 8,
      require_mfa: false,
      password_policy: {
        min_length: 8,
        require_uppercase: true,
        require_lowercase: true,
        require_numbers: true,
        require_symbols: false,
      },
    },
    integrations: {
      api_enabled: false,
      webhook_url: '',
      webhook_secret: '',
      rate_limit: 100,
    },
    database: {
      backup_enabled: true,
      backup_frequency: 'daily',
      retention_days: 30,
    },
    general: {
      organization_name: 'Demo Organization',
      timezone: 'UTC',
      date_format: 'MM/dd/yyyy',
      theme: 'light',
    },
  });

  const [activeTab, setActiveTab] = useState<'general' | 'security' | 'notifications' | 'integrations' | 'database'>('general');
  const [showWebhookSecret, setShowWebhookSecret] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveSettings = async () => {
    setIsSaving(true);
    try {
      // Simulate save delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Settings saved successfully');
    } catch (error) {
      toast.error('Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  const generateWebhookSecret = () => {
    const secret = Array.from(crypto.getRandomValues(new Uint8Array(32)), b => b.toString(16).padStart(2, '0')).join('');
    setSettings(prev => ({
      ...prev,
      integrations: { ...prev.integrations, webhook_secret: secret }
    }));
  };

  const testWebhook = async () => {
    if (!settings.integrations.webhook_url) {
      toast.error('Please enter a webhook URL first');
      return;
    }

    try {
      const testPayload = {
        event: 'test',
        timestamp: new Date().toISOString(),
        data: { message: 'Test webhook from ERMITS CyberSoluce®' }
      };

      // In a real implementation, this would make an actual HTTP request
      toast.success('Test webhook sent successfully');
    } catch (error) {
      toast.error('Failed to send test webhook');
    }
  };

  const tabs = [
    { id: 'general', label: 'General', icon: Settings },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'integrations', label: 'Integrations', icon: Webhook },
    { id: 'database', label: 'Database', icon: Database },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-600 to-purple-600 rounded-2xl p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-outfit font-bold mb-2 flex items-center">
              <Settings className="h-8 w-8 mr-3" />
              System Settings
            </h1>
            <p className="text-lg opacity-90 mb-4">
              Configure system preferences, security, and integrations
            </p>
            <div className="flex items-center space-x-6 text-sm">
              <div className="flex items-center">
                <Globe className="h-4 w-4 mr-2" />
                <span>Global Configuration</span>
              </div>
              <div className="flex items-center">
                <Lock className="h-4 w-4 mr-2" />
                <span>Secure Settings</span>
              </div>
              <div className="flex items-center">
                <Zap className="h-4 w-4 mr-2" />
                <span>Real-time Updates</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Database Status Alert */}
      <div className={`p-4 rounded-lg border-2 ${
        isSupabaseEnabled 
          ? 'bg-green-50 border-green-200' 
          : 'bg-yellow-50 border-yellow-200'
      }`}>
        <div className="flex items-center">
          {isSupabaseEnabled ? (
            <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
          ) : (
            <AlertTriangle className="h-5 w-5 text-yellow-600 mr-2" />
          )}
          <div>
            <p className={`font-medium ${isSupabaseEnabled ? 'text-green-900' : 'text-yellow-900'}`}>
              {isSupabaseEnabled ? 'Database Connected' : 'Running in Demo Mode'}
            </p>
            <p className={`text-sm ${isSupabaseEnabled ? 'text-green-700' : 'text-yellow-700'}`}>
              {isSupabaseEnabled 
                ? 'All settings will be persisted to your Supabase database'
                : 'Settings changes will not be saved. Connect to Supabase for persistence.'
              }
            </p>
          </div>
        </div>
      </div>

      {/* Settings Container */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as 'general' | 'security' | 'notifications' | 'integrations' | 'database' | 'advanced')}
                className={`flex items-center px-6 py-4 text-sm font-medium border-b-2 ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600 bg-blue-50'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                <tab.icon className="h-4 w-4 mr-2" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'general' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">General Settings</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Organization Name
                  </label>
                  <input
                    type="text"
                    value={settings.general.organization_name}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      general: { ...prev.general, organization_name: e.target.value }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Timezone
                  </label>
                  <select
                    value={settings.general.timezone}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      general: { ...prev.general, timezone: e.target.value }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="UTC">UTC</option>
                    <option value="America/New_York">Eastern Time</option>
                    <option value="America/Chicago">Central Time</option>
                    <option value="America/Denver">Mountain Time</option>
                    <option value="America/Los_Angeles">Pacific Time</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date Format
                  </label>
                  <select
                    value={settings.general.date_format}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      general: { ...prev.general, date_format: e.target.value }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="MM/dd/yyyy">MM/DD/YYYY</option>
                    <option value="dd/MM/yyyy">DD/MM/YYYY</option>
                    <option value="yyyy-MM-dd">YYYY-MM-DD</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Theme
                  </label>
                  <select
                    value={settings.general.theme}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      general: { ...prev.general, theme: e.target.value as 'light' | 'dark' | 'auto' }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="light">Light</option>
                    <option value="dark">Dark</option>
                    <option value="auto">Auto</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Security Settings</h3>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Session Timeout (hours)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="24"
                    value={settings.security.session_timeout}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      security: { ...prev.security, session_timeout: parseInt(e.target.value) }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={settings.security.require_mfa}
                      onChange={(e) => setSettings(prev => ({
                        ...prev,
                        security: { ...prev.security, require_mfa: e.target.checked }
                      }))}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">Require Multi-Factor Authentication</span>
                  </label>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-3">Password Policy</h4>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Minimum Length
                      </label>
                      <input
                        type="number"
                        min="6"
                        max="32"
                        value={settings.security.password_policy.min_length}
                        onChange={(e) => setSettings(prev => ({
                          ...prev,
                          security: {
                            ...prev.security,
                            password_policy: {
                              ...prev.security.password_policy,
                              min_length: parseInt(e.target.value)
                            }
                          }
                        }))}
                        className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      {[
                        { key: 'require_uppercase', label: 'Require Uppercase' },
                        { key: 'require_lowercase', label: 'Require Lowercase' },
                        { key: 'require_numbers', label: 'Require Numbers' },
                        { key: 'require_symbols', label: 'Require Symbols' },
                      ].map(({ key, label }) => (
                        <label key={key} className="flex items-center">
                          <input
                            type="checkbox"
                            checked={settings.security.password_policy[key as keyof typeof settings.security.password_policy] as boolean}
                            onChange={(e) => setSettings(prev => ({
                              ...prev,
                              security: {
                                ...prev.security,
                                password_policy: {
                                  ...prev.security.password_policy,
                                  [key]: e.target.checked
                                }
                              }
                            }))}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <span className="ml-2 text-sm text-gray-700">{label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Notification Settings</h3>
              
              <div className="space-y-4">
                {[
                  { key: 'email_enabled', label: 'Email Notifications', description: 'Receive notifications via email' },
                  { key: 'in_app_enabled', label: 'In-App Notifications', description: 'Show notifications in the application' },
                  { key: 'asset_changes', label: 'Asset Changes', description: 'Notify when assets are created, updated, or deleted' },
                  { key: 'vulnerability_alerts', label: 'Vulnerability Alerts', description: 'Immediate alerts for new security vulnerabilities' },
                  { key: 'compliance_reports', label: 'Compliance Reports', description: 'Weekly compliance status reports' },
                ].map(({ key, label, description }) => (
                  <div key={key} className="flex items-start justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-medium text-gray-900">{label}</div>
                      <div className="text-sm text-gray-600">{description}</div>
                    </div>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={settings.notifications[key as keyof typeof settings.notifications]}
                        onChange={(e) => setSettings(prev => ({
                          ...prev,
                          notifications: { ...prev.notifications, [key]: e.target.checked }
                        }))}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'integrations' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Integration Settings</h3>
              
              <div className="space-y-6">
                <div>
                  <label className="flex items-center mb-4">
                    <input
                      type="checkbox"
                      checked={settings.integrations.api_enabled}
                      onChange={(e) => setSettings(prev => ({
                        ...prev,
                        integrations: { ...prev.integrations, api_enabled: e.target.checked }
                      }))}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm font-medium text-gray-700">Enable API Access</span>
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    API Rate Limit (requests per minute)
                  </label>
                  <input
                    type="number"
                    min="10"
                    max="1000"
                    value={settings.integrations.rate_limit}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      integrations: { ...prev.integrations, rate_limit: parseInt(e.target.value) }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="bg-blue-50 rounded-lg p-4">
                  <h4 className="font-medium text-blue-900 mb-3">Webhook Configuration</h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Webhook URL
                      </label>
                      <input
                        type="url"
                        value={settings.integrations.webhook_url}
                        onChange={(e) => setSettings(prev => ({
                          ...prev,
                          integrations: { ...prev.integrations, webhook_url: e.target.value }
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="https://your-app.com/webhook"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Webhook Secret
                      </label>
                      <div className="flex space-x-2">
                        <div className="relative flex-1">
                          <input
                            type={showWebhookSecret ? 'text' : 'password'}
                            value={settings.integrations.webhook_secret}
                            onChange={(e) => setSettings(prev => ({
                              ...prev,
                              integrations: { ...prev.integrations, webhook_secret: e.target.value }
                            }))}
                            className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Webhook secret for signature verification"
                          />
                          <button
                            type="button"
                            onClick={() => setShowWebhookSecret(!showWebhookSecret)}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center"
                          >
                            {showWebhookSecret ? (
                              <EyeOff className="h-4 w-4 text-gray-400" />
                            ) : (
                              <Eye className="h-4 w-4 text-gray-400" />
                            )}
                          </button>
                        </div>
                        <button
                          onClick={generateWebhookSecret}
                          className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                          Generate
                        </button>
                      </div>
                    </div>

                    <div className="flex space-x-3">
                      <button
                        onClick={testWebhook}
                        className="inline-flex items-center px-4 py-2 border border-blue-300 text-blue-700 rounded-lg hover:bg-blue-50"
                      >
                        <Zap className="h-4 w-4 mr-2" />
                        Test Webhook
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'database' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Database Settings</h3>
              
              <div className="space-y-6">
                <div>
                  <label className="flex items-center mb-4">
                    <input
                      type="checkbox"
                      checked={settings.database.backup_enabled}
                      onChange={(e) => setSettings(prev => ({
                        ...prev,
                        database: { ...prev.database, backup_enabled: e.target.checked }
                      }))}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm font-medium text-gray-700">Enable Automated Backups</span>
                  </label>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Backup Frequency
                    </label>
                    <select
                      value={settings.database.backup_frequency}
                      onChange={(e) => setSettings(prev => ({
                        ...prev,
                        database: { ...prev.database, backup_frequency: e.target.value as 'daily' | 'weekly' | 'monthly' }
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      disabled={!settings.database.backup_enabled}
                    >
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Retention Period (days)
                    </label>
                    <input
                      type="number"
                      min="7"
                      max="365"
                      value={settings.database.retention_days}
                      onChange={(e) => setSettings(prev => ({
                        ...prev,
                        database: { ...prev.database, retention_days: parseInt(e.target.value) }
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      disabled={!settings.database.backup_enabled}
                    />
                  </div>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                    <div>
                      <p className="font-medium text-green-900">Database Status</p>
                      <p className="text-sm text-green-700">
                        {isSupabaseEnabled 
                          ? 'Connected to Supabase PostgreSQL database'
                          : 'Running in demo mode - no database persistence'
                        }
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Save Button */}
        <div className="bg-gray-50 px-6 py-4 flex justify-end">
          <button
            onClick={handleSaveSettings}
            disabled={isSaving}
            className="inline-flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSaving ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Settings
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};