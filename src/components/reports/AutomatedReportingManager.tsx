import React, { useState, useEffect } from 'react';
import { 
  automatedReportingService, 
  ReportSchedule, 
  ReportTemplate, 
  GeneratedReport 
} from '../../services/automatedReportingService';
import { Asset } from '../../types/asset';
import { useAssetInventory } from '../../contexts/AssetInventoryContext';
import { dataEnrichmentService } from '../../services/dataEnrichmentService';
import { analyticsService } from '../../services/analyticsService';
import { logger } from '../../utils/logger';

interface AutomatedReportingManagerProps {
  onClose: () => void;
}

export const AutomatedReportingManager: React.FC<AutomatedReportingManagerProps> = ({ onClose }) => {
  const { assets, loading } = useAssetInventory();
  const [activeTab, setActiveTab] = useState<'schedules' | 'templates' | 'reports'>('schedules');
  const [schedules, setSchedules] = useState<ReportSchedule[]>([]);
  const [templates, setTemplates] = useState<ReportTemplate[]>([]);
  const [reports, setReports] = useState<GeneratedReport[]>([]);
  const [showCreateSchedule, setShowCreateSchedule] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<ReportSchedule | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [schedulesData, templatesData, reportsData] = await Promise.all([
        Promise.resolve(automatedReportingService.getSchedules()),
        Promise.resolve(automatedReportingService.getTemplates()),
        Promise.resolve(automatedReportingService.getReports())
      ]);
      
      setSchedules(schedulesData);
      setTemplates(templatesData);
      setReports(reportsData);
    } catch (error) {
      logger.error('Error loading automated reporting data', error instanceof Error ? error : undefined);
    }
  };

  const handleCreateSchedule = async (scheduleData: Omit<ReportSchedule, 'id' | 'createdAt' | 'updatedAt' | 'nextRun'>) => {
    try {
      const newSchedule = await automatedReportingService.createSchedule(scheduleData);
      setSchedules(prev => [...prev, newSchedule]);
      setShowCreateSchedule(false);
    } catch (error) {
      logger.error('Error creating schedule', error instanceof Error ? error : undefined);
    }
  };

  const handleUpdateSchedule = async (id: string, updates: Partial<ReportSchedule>) => {
    try {
      const updatedSchedule = await automatedReportingService.updateSchedule(id, updates);
      if (updatedSchedule) {
        setSchedules(prev => prev.map(s => s.id === id ? updatedSchedule : s));
        setEditingSchedule(null);
      }
    } catch (error) {
      logger.error('Error updating schedule', error instanceof Error ? error : undefined);
    }
  };

  const handleDeleteSchedule = async (id: string) => {
    try {
      const success = await automatedReportingService.deleteSchedule(id);
      if (success) {
        setSchedules(prev => prev.filter(s => s.id !== id));
      }
    } catch (error) {
      logger.error('Error deleting schedule', error instanceof Error ? error : undefined);
    }
  };

  const handleGenerateReport = async (schedule: ReportSchedule) => {
    try {
      // Enrich assets
      const enrichmentData = new Map();
      for (const asset of assets) {
        const enriched = await dataEnrichmentService.enrichAsset(asset);
        enrichmentData.set(asset.id, enriched);
      }

      // Generate analytics
      const analyticsInsights = await analyticsService.generateAnalytics(assets, enrichmentData);

      // Generate report
      const report = await automatedReportingService.generateReport(
        schedule,
        assets,
        enrichmentData,
        analyticsInsights
      );

      setReports(prev => [report, ...prev]);
    } catch (error) {
      logger.error('Error generating report', error instanceof Error ? error : undefined);
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

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
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
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900">Automated Reporting</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b">
          {[
            { id: 'schedules', label: 'Schedules', count: schedules.length },
            { id: 'templates', label: 'Templates', count: templates.length },
            { id: 'reports', label: 'Generated Reports', count: reports.length }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          {activeTab === 'schedules' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">Report Schedules</h3>
                <button
                  onClick={() => setShowCreateSchedule(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Create Schedule
                </button>
              </div>

              <div className="grid gap-4">
                {schedules.map(schedule => (
                  <div key={schedule.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-gray-900">{schedule.name}</h4>
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            schedule.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                            {schedule.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                        <p className="text-gray-600 text-sm mt-1">{schedule.description}</p>
                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                          <span>Frequency: {schedule.frequency}</span>
                          <span>Time: {schedule.time}</span>
                          <span>Recipients: {schedule.recipients.length}</span>
                          {schedule.nextRun && (
                            <span>Next Run: {formatDate(schedule.nextRun)}</span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleGenerateReport(schedule)}
                          className="text-blue-600 hover:text-blue-800 text-sm"
                        >
                          Generate Now
                        </button>
                        <button
                          onClick={() => setEditingSchedule(schedule)}
                          className="text-gray-600 hover:text-gray-800 text-sm"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteSchedule(schedule.id)}
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

          {activeTab === 'templates' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Report Templates</h3>
              
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {templates.map(template => (
                  <div key={template.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-gray-900">{template.name}</h4>
                      <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                        {template.category}
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm mb-3">{template.description}</p>
                    <div className="text-sm text-gray-500">
                      <p>Sections: {template.sections.length}</p>
                      <p>Format: {template.defaultFormat.toUpperCase()}</p>
                    </div>
                    <button
                      onClick={() => setSelectedTemplate(template.id)}
                      className="mt-3 w-full bg-gray-100 text-gray-700 px-3 py-2 rounded text-sm hover:bg-gray-200 transition-colors"
                    >
                      Use Template
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'reports' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Generated Reports</h3>
              
              <div className="grid gap-4">
                {reports.map(report => (
                  <div key={report.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-gray-900">{report.name}</h4>
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            report.status === 'completed' ? 'bg-green-100 text-green-800' :
                            report.status === 'generating' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {report.status}
                          </span>
                        </div>
                        <p className="text-gray-600 text-sm mt-1">{report.description}</p>
                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                          <span>Generated: {formatDate(report.generatedAt)}</span>
                          <span>Format: {report.format.toUpperCase()}</span>
                          <span>Size: {formatFileSize(report.fileSize)}</span>
                          <span>Recipients: {report.recipients.length}</span>
                        </div>
                        {report.error && (
                          <p className="text-red-600 text-sm mt-2">Error: {report.error}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {report.status === 'completed' && (
                          <button className="text-blue-600 hover:text-blue-800 text-sm">
                            Download
                          </button>
                        )}
                        <button className="text-gray-600 hover:text-gray-800 text-sm">
                          View Details
                        </button>
                        <button className="text-red-600 hover:text-red-800 text-sm">
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Create Schedule Modal */}
      {showCreateSchedule && (
        <CreateScheduleModal
          templates={templates}
          onClose={() => setShowCreateSchedule(false)}
          onSave={handleCreateSchedule}
        />
      )}

      {/* Edit Schedule Modal */}
      {editingSchedule && (
        <EditScheduleModal
          schedule={editingSchedule}
          templates={templates}
          onClose={() => setEditingSchedule(null)}
          onSave={(updates) => handleUpdateSchedule(editingSchedule.id, updates)}
        />
      )}
    </div>
  );
};

// Create Schedule Modal Component
interface CreateScheduleModalProps {
  templates: ReportTemplate[];
  onClose: () => void;
  onSave: (schedule: Omit<ReportSchedule, 'id' | 'createdAt' | 'updatedAt' | 'nextRun'>) => void;
}

const CreateScheduleModal: React.FC<CreateScheduleModalProps> = ({ templates, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    frequency: 'daily' as const,
    time: '09:00',
    dayOfWeek: 0,
    dayOfMonth: 1,
    recipients: [] as string[],
    reportTypes: [] as any[],
    filters: {} as any,
    isActive: true
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h3 className="text-lg font-semibold text-gray-900">Create Report Schedule</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
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
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Frequency</label>
              <select
                value={formData.frequency}
                onChange={(e) => setFormData(prev => ({ ...prev, frequency: e.target.value as any }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
              <input
                type="time"
                value={formData.time}
                onChange={(e) => setFormData(prev => ({ ...prev, time: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Recipients (comma-separated emails)</label>
            <input
              type="text"
              value={formData.recipients.join(', ')}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                recipients: e.target.value.split(',').map(email => email.trim()).filter(Boolean)
              }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="user1@example.com, user2@example.com"
            />
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
              Create Schedule
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Edit Schedule Modal Component
interface EditScheduleModalProps {
  schedule: ReportSchedule;
  templates: ReportTemplate[];
  onClose: () => void;
  onSave: (updates: Partial<ReportSchedule>) => void;
}

const EditScheduleModal: React.FC<EditScheduleModalProps> = ({ schedule, templates, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: schedule.name,
    description: schedule.description,
    frequency: schedule.frequency,
    time: schedule.time,
    dayOfWeek: schedule.dayOfWeek || 0,
    dayOfMonth: schedule.dayOfMonth || 1,
    recipients: schedule.recipients,
    reportTypes: schedule.reportTypes,
    filters: schedule.filters,
    isActive: schedule.isActive
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h3 className="text-lg font-semibold text-gray-900">Edit Report Schedule</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
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
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Frequency</label>
              <select
                value={formData.frequency}
                onChange={(e) => setFormData(prev => ({ ...prev, frequency: e.target.value as any }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
              <input
                type="time"
                value={formData.time}
                onChange={(e) => setFormData(prev => ({ ...prev, time: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Recipients (comma-separated emails)</label>
            <input
              type="text"
              value={formData.recipients.join(', ')}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                recipients: e.target.value.split(',').map(email => email.trim()).filter(Boolean)
              }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="user1@example.com, user2@example.com"
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