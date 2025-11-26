import React, { useState, useEffect } from 'react';
import { 
  externalDataIntegrationService, 
  ExternalDataSource, 
  EnrichmentRule,
  IntegrationResult 
} from '../../services/externalDataIntegrationService';
import { useAssetInventory } from '../../contexts/AssetInventoryContext';
import { logger } from '../../utils/logger';

interface ExternalDataIntegrationManagerProps {
  onClose: () => void;
}

export const ExternalDataIntegrationManager: React.FC<ExternalDataIntegrationManagerProps> = ({ onClose }) => {
  const { loading } = useAssetInventory();
  const [activeTab, setActiveTab] = useState<'sources' | 'rules' | 'status'>('sources');
  const [sources, setSources] = useState<ExternalDataSource[]>([]);
  const [rules, setRules] = useState<EnrichmentRule[]>([]);
  const [integrationStatus, setIntegrationStatus] = useState<{
    totalSources: number;
    activeSources: number;
    lastSync: Date | null;
    nextSync: Date | null;
    syncErrors: number;
  } | null>(null);
  const [showCreateSource, setShowCreateSource] = useState(false);
  const [showCreateRule, setShowCreateRule] = useState(false);
  const [editingSource, setEditingSource] = useState<ExternalDataSource | null>(null);
  const [editingRule, setEditingRule] = useState<EnrichmentRule | null>(null);
  const [testingConnection, setTestingConnection] = useState<string | null>(null);
  const [syncResults, setSyncResults] = useState<Map<string, IntegrationResult>>(new Map());

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [sourcesData, rulesData, statusData] = await Promise.all([
        Promise.resolve(externalDataIntegrationService.getDataSources()),
        Promise.resolve(externalDataIntegrationService.getEnrichmentRules()),
        Promise.resolve(externalDataIntegrationService.getIntegrationStatus())
      ]);
      
      setSources(sourcesData);
      setRules(rulesData);
      setIntegrationStatus(statusData);
    } catch (error) {
      logger.error('Error loading integration data', error instanceof Error ? error : undefined);
    }
  };

  const handleCreateSource = async (sourceData: Omit<ExternalDataSource, 'id'>) => {
    try {
      const newSource = await externalDataIntegrationService.addDataSource(sourceData);
      setSources(prev => [...prev, newSource]);
      setShowCreateSource(false);
    } catch (error) {
      logger.error('Error creating data source', error instanceof Error ? error : undefined);
    }
  };

  const handleUpdateSource = async (id: string, updates: Partial<ExternalDataSource>) => {
    try {
      const updatedSource = await externalDataIntegrationService.updateDataSource(id, updates);
      if (updatedSource) {
        setSources(prev => prev.map(s => s.id === id ? updatedSource : s));
        setEditingSource(null);
      }
    } catch (error) {
      logger.error('Error updating data source', error instanceof Error ? error : undefined);
    }
  };

  const handleDeleteSource = async (id: string) => {
    try {
      const success = await externalDataIntegrationService.deleteDataSource(id);
      if (success) {
        setSources(prev => prev.filter(s => s.id !== id));
      }
    } catch (error) {
      logger.error('Error deleting data source', error instanceof Error ? error : undefined);
    }
  };

  const handleTestConnection = async (sourceId: string) => {
    setTestingConnection(sourceId);
    try {
      const result = await externalDataIntegrationService.testDataSourceConnection(sourceId);
      // Show result in UI (could be a toast notification)
      logger.debug('Connection test result:', result);
    } catch (error) {
      logger.error('Error testing connection', error instanceof Error ? error : undefined);
    } finally {
      setTestingConnection(null);
    }
  };

  const handleSyncSource = async (sourceId: string) => {
    try {
      const result = await externalDataIntegrationService.syncDataSource(sourceId);
      setSyncResults(prev => new Map(prev.set(sourceId, result)));
    } catch (error) {
      logger.error('Error syncing data source', error instanceof Error ? error : undefined);
    }
  };

  const handleCreateRule = async (ruleData: Omit<EnrichmentRule, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const newRule = await externalDataIntegrationService.addEnrichmentRule(ruleData);
      setRules(prev => [...prev, newRule]);
      setShowCreateRule(false);
    } catch (error) {
      logger.error('Error creating enrichment rule', error instanceof Error ? error : undefined);
    }
  };

  const handleUpdateRule = async (id: string, updates: Partial<EnrichmentRule>) => {
    try {
      const updatedRule = await externalDataIntegrationService.updateEnrichmentRule(id, updates);
      if (updatedRule) {
        setRules(prev => prev.map(r => r.id === id ? updatedRule : r));
        setEditingRule(null);
      }
    } catch (error) {
      logger.error('Error updating enrichment rule', error instanceof Error ? error : undefined);
    }
  };

  const handleDeleteRule = async (id: string) => {
    try {
      const success = await externalDataIntegrationService.deleteEnrichmentRule(id);
      if (success) {
        setRules(prev => prev.filter(r => r.id !== id));
      }
    } catch (error) {
      logger.error('Error deleting enrichment rule', error instanceof Error ? error : undefined);
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const getSourceTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      'vulnerability': 'bg-red-100 text-red-800',
      'threat_intelligence': 'bg-orange-100 text-orange-800',
      'compliance': 'bg-green-100 text-green-800',
      'asset_discovery': 'bg-blue-100 text-blue-800',
      'cost_analysis': 'bg-yellow-100 text-yellow-800',
      'performance_monitoring': 'bg-purple-100 text-purple-800'
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-7xl h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900">External Data Integration</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
            aria-label="Close modal"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b">
          {[
            { id: 'sources', label: 'Data Sources', count: sources.length },
            { id: 'rules', label: 'Enrichment Rules', count: rules.length },
            { id: 'status', label: 'Integration Status', count: null }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as 'sources' | 'rules' | 'status')}
              className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label} {tab.count !== null && `(${tab.count})`}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          {activeTab === 'sources' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">External Data Sources</h3>
                <button
                  onClick={() => setShowCreateSource(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Add Data Source
                </button>
              </div>

              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {sources.map(source => (
                  <div key={source.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-gray-900">{source.name}</h4>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 text-xs rounded-full ${getSourceTypeColor(source.type)}`}>
                          {source.type.replace('_', ' ')}
                        </span>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          source.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {source.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>
                    <p className="text-gray-600 text-sm mb-3">{source.description}</p>
                    <div className="text-sm text-gray-500 mb-3">
                      <p>Frequency: {source.syncFrequency}</p>
                      <p>Last Sync: {source.lastSync ? formatDate(source.lastSync) : 'Never'}</p>
                      <p>Rate Limit: {source.metadata.rateLimit.requests}/{source.metadata.rateLimit.period}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleTestConnection(source.id)}
                        disabled={testingConnection === source.id}
                        className="text-blue-600 hover:text-blue-800 text-sm disabled:opacity-50"
                      >
                        {testingConnection === source.id ? 'Testing...' : 'Test Connection'}
                      </button>
                      <button
                        onClick={() => handleSyncSource(source.id)}
                        className="text-green-600 hover:text-green-800 text-sm"
                      >
                        Sync Now
                      </button>
                      <button
                        onClick={() => setEditingSource(source)}
                        className="text-gray-600 hover:text-gray-800 text-sm"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteSource(source.id)}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        Delete
                      </button>
                    </div>
                    {syncResults.has(source.id) && (
                      <div className="mt-2 p-2 bg-gray-50 rounded text-xs">
                        <p className={syncResults.get(source.id)?.success ? 'text-green-600' : 'text-red-600'}>
                          {syncResults.get(source.id)?.success ? 'Sync successful' : 'Sync failed'}
                        </p>
                        <p>Data count: {syncResults.get(source.id)?.dataCount}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'rules' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">Enrichment Rules</h3>
                <button
                  onClick={() => setShowCreateRule(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Add Rule
                </button>
              </div>

              <div className="grid gap-4">
                {rules.map(rule => (
                  <div key={rule.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-gray-900">{rule.name}</h4>
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            rule.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                            {rule.isActive ? 'Active' : 'Inactive'}
                          </span>
                          <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                            Priority: {rule.priority}
                          </span>
                        </div>
                        <p className="text-gray-600 text-sm mt-1">{rule.description}</p>
                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                          <span>Source: {rule.source}</span>
                          <span>Target: {rule.targetField}</span>
                          <span>Condition: {rule.condition.field} {rule.condition.operator} {String(rule.condition.value)}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setEditingRule(rule)}
                          className="text-gray-600 hover:text-gray-800 text-sm"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteRule(rule.id)}
                          className="text-red-600 hover:text-red-800 text-sm"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'status' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Integration Status</h3>
              
              {integrationStatus && (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-blue-900">Total Sources</h4>
                    <p className="text-2xl font-bold text-blue-600">{integrationStatus.totalSources}</p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-green-900">Active Sources</h4>
                    <p className="text-2xl font-bold text-green-600">{integrationStatus.activeSources}</p>
                  </div>
                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-yellow-900">Last Sync</h4>
                    <p className="text-sm text-yellow-600">
                      {integrationStatus.lastSync ? formatDate(integrationStatus.lastSync) : 'Never'}
                    </p>
                  </div>
                  <div className="bg-red-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-red-900">Sync Errors</h4>
                    <p className="text-2xl font-bold text-red-600">{integrationStatus.syncErrors}</p>
                  </div>
                </div>
              )}

              <div className="bg-white border rounded-lg p-6">
                <h4 className="font-semibold text-gray-900 mb-4">Data Source Status</h4>
                <div className="space-y-3">
                  {sources.map(source => (
                    <div key={source.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${
                          source.isActive ? 'bg-green-500' : 'bg-gray-400'
                        }`}></div>
                        <span className="font-medium">{source.name}</span>
                        <span className="text-sm text-gray-500">({source.type})</span>
                      </div>
                      <div className="text-sm text-gray-500">
                        {source.lastSync ? formatDate(source.lastSync) : 'Never synced'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Create Source Modal */}
      {showCreateSource && (
        <CreateSourceModal
          onClose={() => setShowCreateSource(false)}
          onSave={handleCreateSource}
        />
      )}

      {/* Edit Source Modal */}
      {editingSource && (
        <EditSourceModal
          source={editingSource}
          onClose={() => setEditingSource(null)}
          onSave={(updates) => handleUpdateSource(editingSource.id, updates)}
        />
      )}

      {/* Create Rule Modal */}
      {showCreateRule && (
        <CreateRuleModal
          sources={sources}
          onClose={() => setShowCreateRule(false)}
          onSave={handleCreateRule}
        />
      )}

      {/* Edit Rule Modal */}
      {editingRule && (
        <EditRuleModal
          rule={editingRule}
          sources={sources}
          onClose={() => setEditingRule(null)}
          onSave={(updates) => handleUpdateRule(editingRule.id, updates)}
        />
      )}
    </div>
  );
};

// Create Source Modal Component
interface CreateSourceModalProps {
  onClose: () => void;
  onSave: (source: Omit<ExternalDataSource, 'id'>) => void;
}

const CreateSourceModal: React.FC<CreateSourceModalProps> = ({ onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    type: 'vulnerability' as ExternalDataSource['type'],
    description: '',
    baseUrl: '',
    apiKey: '',
    isActive: true,
    syncFrequency: 'daily' as ExternalDataSource['syncFrequency'],
    config: {} as Record<string, unknown>,
    metadata: {
      version: '1.0',
      supportedFeatures: [] as string[],
      rateLimit: {
        requests: 100,
        period: 'hour' as const
      }
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h3 className="text-lg font-semibold text-gray-900">Add Data Source</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600" aria-label="Close modal">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter data source name"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
            <select
              value={formData.type}
              onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as ExternalDataSource['type'] }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Data source type"
            >
              <option value="vulnerability">Vulnerability</option>
              <option value="threat_intelligence">Threat Intelligence</option>
              <option value="compliance">Compliance</option>
              <option value="asset_discovery">Asset Discovery</option>
              <option value="cost_analysis">Cost Analysis</option>
              <option value="performance_monitoring">Performance Monitoring</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter description"
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Base URL</label>
            <input
              type="url"
              value={formData.baseUrl}
              onChange={(e) => setFormData(prev => ({ ...prev, baseUrl: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="https://api.example.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">API Key (optional)</label>
            <input
              type="password"
              value={formData.apiKey}
              onChange={(e) => setFormData(prev => ({ ...prev, apiKey: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter API key (optional)"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sync Frequency</label>
              <select
                value={formData.syncFrequency}
                onChange={(e) => setFormData(prev => ({ ...prev, syncFrequency: e.target.value as ExternalDataSource['syncFrequency'] }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label="Sync frequency"
              >
                <option value="realtime">Real-time</option>
                <option value="hourly">Hourly</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
              </select>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
                Active
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Create Source
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Edit Source Modal Component
interface EditSourceModalProps {
  source: ExternalDataSource;
  onClose: () => void;
  onSave: (updates: Partial<ExternalDataSource>) => void;
}

const EditSourceModal: React.FC<EditSourceModalProps> = ({ source, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: source.name,
    description: source.description,
    baseUrl: source.baseUrl,
    apiKey: source.apiKey || '',
    isActive: source.isActive,
    syncFrequency: source.syncFrequency,
    config: source.config
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h3 className="text-lg font-semibold text-gray-900">Edit Data Source</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600" aria-label="Close modal">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter data source name"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter description"
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Base URL</label>
            <input
              type="url"
              value={formData.baseUrl}
              onChange={(e) => setFormData(prev => ({ ...prev, baseUrl: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="https://api.example.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">API Key (optional)</label>
            <input
              type="password"
              value={formData.apiKey}
              onChange={(e) => setFormData(prev => ({ ...prev, apiKey: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter API key (optional)"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sync Frequency</label>
              <select
                value={formData.syncFrequency}
                onChange={(e) => setFormData(prev => ({ ...prev, syncFrequency: e.target.value as ExternalDataSource['syncFrequency'] }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label="Sync frequency"
              >
                <option value="realtime">Real-time</option>
                <option value="hourly">Hourly</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
              </select>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
                Active
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Create Rule Modal Component
interface CreateRuleModalProps {
  sources: ExternalDataSource[];
  onClose: () => void;
  onSave: (rule: Omit<EnrichmentRule, 'id' | 'createdAt' | 'updatedAt'>) => void;
}

const CreateRuleModal: React.FC<CreateRuleModalProps> = ({ sources, onClose, onSave }) => {
  const [formData, setFormData] = useState<{
    name: string;
    description: string;
    source: string;
    targetField: string;
    condition: {
      field: string;
      operator: EnrichmentRule['condition']['operator'];
      value: string;
    };
    transformation: {
      type: 'direct' | 'mapping' | 'calculation' | 'lookup';
      config: Record<string, unknown>;
    };
    isActive: boolean;
    priority: number;
  }>({
    name: '',
    description: '',
    source: '',
    targetField: '',
    condition: {
      field: '',
      operator: 'equals',
      value: ''
    },
    transformation: {
      type: 'direct',
      config: {}
    },
    isActive: true,
    priority: 1
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h3 className="text-lg font-semibold text-gray-900">Add Enrichment Rule</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600" aria-label="Close modal">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter data source name"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter description"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Source</label>
              <select
                value={formData.source}
                onChange={(e) => setFormData(prev => ({ ...prev, source: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label="Data source"
                required
              >
                <option value="">Select source</option>
                {sources.map(source => (
                  <option key={source.id} value={source.id}>{source.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Target Field</label>
              <input
                type="text"
                value={formData.targetField}
                onChange={(e) => setFormData(prev => ({ ...prev, targetField: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., vulnerabilities"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Condition Field</label>
              <input
                type="text"
                value={formData.condition.field}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  condition: { ...prev.condition, field: e.target.value }
                }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., type"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Operator</label>
              <select
                value={formData.condition.operator}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  condition: { ...prev.condition, operator: e.target.value as EnrichmentRule['condition']['operator'] }
                }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label="Condition operator"
              >
                <option value="equals">Equals</option>
                <option value="contains">Contains</option>
                <option value="starts_with">Starts With</option>
                <option value="ends_with">Ends With</option>
                <option value="regex">Regex</option>
                <option value="in">In</option>
                <option value="not_in">Not In</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Value</label>
              <input
                type="text"
                value={String(formData.condition.value)}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  condition: { ...prev.condition, value: e.target.value }
                }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., server"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
              <input
                type="number"
                value={formData.priority}
                onChange={(e) => setFormData(prev => ({ ...prev, priority: parseInt(e.target.value) }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="1-10"
                min="1"
                max="10"
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
                Active
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Create Rule
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Edit Rule Modal Component
interface EditRuleModalProps {
  rule: EnrichmentRule;
  sources: ExternalDataSource[];
  onClose: () => void;
  onSave: (updates: Partial<EnrichmentRule>) => void;
}

const EditRuleModal: React.FC<EditRuleModalProps> = ({ rule, sources, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: rule.name,
    description: rule.description,
    source: rule.source,
    targetField: rule.targetField,
    condition: rule.condition,
    transformation: rule.transformation,
    isActive: rule.isActive,
    priority: rule.priority
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h3 className="text-lg font-semibold text-gray-900">Edit Enrichment Rule</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600" aria-label="Close modal">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter data source name"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter description"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Source</label>
              <select
                value={formData.source}
                onChange={(e) => setFormData(prev => ({ ...prev, source: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label="Data source"
                required
              >
                {sources.map(source => (
                  <option key={source.id} value={source.id}>{source.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Target Field</label>
              <input
                type="text"
                value={formData.targetField}
                onChange={(e) => setFormData(prev => ({ ...prev, targetField: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., vulnerabilities"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Condition Field</label>
              <input
                type="text"
                value={formData.condition.field}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  condition: { ...prev.condition, field: e.target.value }
                }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., type"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Operator</label>
              <select
                value={formData.condition.operator}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  condition: { ...prev.condition, operator: e.target.value as EnrichmentRule['condition']['operator'] }
                }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label="Condition operator"
              >
                <option value="equals">Equals</option>
                <option value="contains">Contains</option>
                <option value="starts_with">Starts With</option>
                <option value="ends_with">Ends With</option>
                <option value="regex">Regex</option>
                <option value="in">In</option>
                <option value="not_in">Not In</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Value</label>
              <input
                type="text"
                value={String(formData.condition.value)}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  condition: { ...prev.condition, value: e.target.value }
                }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., server"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
              <input
                type="number"
                value={formData.priority}
                onChange={(e) => setFormData(prev => ({ ...prev, priority: parseInt(e.target.value) }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="1-10"
                min="1"
                max="10"
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
                Active
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};