import React, { useState, useEffect, useRef } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './ui';
import { Button } from './ui';
import { useDataNormalizationStorage, DataTemplate, TransformationRule, StandardField } from '../hooks/useDataNormalizationStorage';
import toast from 'react-hot-toast';
import { logger } from '../utils/logger';
import { 
  FileJson, 
  Loader, 
  Grid, 
  ArrowRight, 
  FileWarning,
  Plus,
  Edit,
  Trash2,
  Download,
  Upload,
  Save,
  HardDrive,
  Info,
  CheckCircle,
  AlertTriangle,
  Database,
  Code,
  Settings,
  Play,
  Eye,
  X,
  RefreshCw,
  Search,
  Copy,
  Filter,
  ChevronDown,
  ChevronUp,
  HelpCircle,
  Zap,
  BarChart3,
  FileCheck
} from 'lucide-react';

interface DataNormalizationEngineProps {
  onViewChange?: (view: string) => void;
}

const DataNormalizationEngine: React.FC<DataNormalizationEngineProps> = ({ onViewChange }) => {
  // Use localStorage hook for data management
  const {
    templates,
    normalizedData,
    dataQualityMetrics,
    isSaving,
    lastSaved,
    saveError,
    addTemplate,
    updateTemplate,
    deleteTemplate,
    processData,
    exportData,
    importData,
    clearAllData,
    getStorageInfo,
    initializeWithDemoData
  } = useDataNormalizationStorage();

  // Local UI state
  const [activeTemplate, setActiveTemplate] = useState<DataTemplate | null>(null);
  const [sourceData, setSourceData] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Array<{ errorMessage?: string }>>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<DataTemplate | null>(null);
  const [showStorageInfo, setShowStorageInfo] = useState(false);
  const [activeTab, setActiveTab] = useState('templates');
  
  // Enhanced UI state
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'date' | 'type'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [filterType, setFilterType] = useState<string>('all');
  const [showDataPreview, setShowDataPreview] = useState(false);
  const [dataPreview, setDataPreview] = useState<Record<string, unknown> | Record<string, unknown>[] | null>(null);
  const [showHelp, setShowHelp] = useState(false);
  const [expandedTemplates, setExpandedTemplates] = useState<Set<string>>(new Set());
  const [processingHistory, setProcessingHistory] = useState<Array<{
    timestamp: string;
    templateName: string;
    recordsProcessed: number;
    success: boolean;
  }>>([]);

  // File input ref for import
  const fileInputRef = useRef<HTMLInputElement>(null);

  const dataTypes = [
    { id: 'security_event', name: 'Security Events', icon: AlertTriangle, color: 'red' },
    { id: 'vulnerability', name: 'Vulnerabilities', icon: FileWarning, color: 'orange' },
    { id: 'asset', name: 'Assets', icon: Database, color: 'blue' },
    { id: 'user', name: 'User Data', icon: Settings, color: 'green' },
    { id: 'network', name: 'Network Data', icon: Grid, color: 'purple' },
    { id: 'log', name: 'Log Data', icon: FileJson, color: 'gray' }
  ];

  // Initialize component
  useEffect(() => {
    const initializeDataNormalizationEngine = async () => {
      try {
        setIsLoading(true);
        
        // Initialize with demo data if no templates exist
        if (templates.length === 0) {
          initializeWithDemoData();
        }
        
        setIsLoading(false);
      } catch (err) {
        logger.error('Failed to initialize Data Normalization Engine', err instanceof Error ? err : undefined);
        setError('Failed to load templates');
        setIsLoading(false);
      }
    };
    
    initializeDataNormalizationEngine();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Ctrl/Cmd + K for search
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        document.getElementById('template-search')?.focus();
      }
      // Ctrl/Cmd + N for new template
      if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault();
        setShowCreateModal(true);
      }
      // Ctrl/Cmd + P for process
      if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
        e.preventDefault();
        if (activeTemplate && sourceData.trim()) {
          handleProcessData();
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [activeTemplate, sourceData]);

  // Template operations
  const handleCreateTemplate = (templateData: Omit<DataTemplate, 'id' | 'createdAt' | 'updatedAt'>, openEditor = false) => {
    addTemplate(templateData);
    setShowCreateModal(false);
    
    if (openEditor) {
      // Wait for template to be added, then find and edit it
      setTimeout(() => {
        // Find the most recently created template with matching name
        const createdTemplate = [...templates]
          .filter(t => t.name === templateData.name)
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
        
        if (createdTemplate) {
          setEditingTemplate(createdTemplate);
          setShowEditModal(true);
        } else {
          // Fallback: create a temporary template structure for editing
          const tempTemplate: DataTemplate = {
            ...templateData,
            id: `temp_${Date.now()}`,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
          setEditingTemplate(tempTemplate);
          setShowEditModal(true);
        }
      }, 100);
    }
    
    toast.success('Template created successfully' + (openEditor ? ' - Opening editor...' : ''));
  };

  const handleUpdateTemplate = (id: string, updates: Partial<DataTemplate>) => {
    updateTemplate(id, updates);
    toast.success('Template updated successfully');
  };

  const handleDeleteTemplate = (id: string) => {
    if (confirm('Are you sure you want to delete this template? This action cannot be undone.')) {
      deleteTemplate(id);
      if (activeTemplate?.id === id) {
        setActiveTemplate(null);
      }
      toast.success('Template deleted successfully');
    }
  };

  // Enhanced: Duplicate template
  const handleDuplicateTemplate = (template: DataTemplate) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id, createdAt, updatedAt, ...templateWithoutMeta } = template;
    const duplicated = {
      ...templateWithoutMeta,
      name: `${template.name} (Copy)`,
    };
    addTemplate(duplicated);
    toast.success('Template duplicated successfully');
  };

  // Open template editor
  const handleEditTemplate = (template: DataTemplate) => {
    setEditingTemplate({ ...template });
    setShowEditModal(true);
  };

  // Save edited template
  const handleSaveEditedTemplate = () => {
    if (!editingTemplate) return;
    
    if (!editingTemplate.name.trim()) {
      toast.error('Template name is required');
      return;
    }

    // Check if this is a temporary template (created but not yet in the list)
    if (editingTemplate.id.startsWith('temp_')) {
      // Create new template with the edited data
      const { id, createdAt, updatedAt, ...templateData } = editingTemplate;
      addTemplate(templateData);
      toast.success('Template created and saved successfully');
    } else {
      // Update existing template
      const existingTemplate = templates.find(t => t.id === editingTemplate.id);
      if (existingTemplate) {
        handleUpdateTemplate(editingTemplate.id, editingTemplate);
      } else {
        // Template not found, create it
        const { id, createdAt, updatedAt, ...templateData } = editingTemplate;
        addTemplate(templateData);
        toast.success('Template created successfully');
      }
    }
    
    setShowEditModal(false);
    setEditingTemplate(null);
  };

  // Add transformation rule
  const handleAddTransformationRule = () => {
    if (!editingTemplate) return;
    
    const newRule: TransformationRule = {
      id: `rule_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      sourceField: '',
      targetField: '',
      transformationType: 'direct',
      parameters: {},
      isRequired: false,
      description: ''
    };
    
    setEditingTemplate({
      ...editingTemplate,
      transformationRules: [...editingTemplate.transformationRules, newRule]
    });
  };

  // Update transformation rule
  const handleUpdateTransformationRule = (ruleId: string, updates: Partial<TransformationRule>) => {
    if (!editingTemplate) return;
    
    setEditingTemplate({
      ...editingTemplate,
      transformationRules: editingTemplate.transformationRules.map(rule =>
        rule.id === ruleId ? { ...rule, ...updates } : rule
      )
    });
  };

  // Delete transformation rule
  const handleDeleteTransformationRule = (ruleId: string) => {
    if (!editingTemplate) return;
    
    setEditingTemplate({
      ...editingTemplate,
      transformationRules: editingTemplate.transformationRules.filter(rule => rule.id !== ruleId)
    });
  };

  // Add standard field
  const handleAddStandardField = () => {
    if (!editingTemplate) return;
    
    const newField: StandardField = {
      id: `field_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: '',
      dataType: 'string',
      description: '',
      isRequired: false,
      validationRules: [],
      examples: []
    };
    
    setEditingTemplate({
      ...editingTemplate,
      standardFields: [...editingTemplate.standardFields, newField]
    });
  };

  // Update standard field
  const handleUpdateStandardField = (fieldId: string, updates: Partial<StandardField>) => {
    if (!editingTemplate) return;
    
    setEditingTemplate({
      ...editingTemplate,
      standardFields: editingTemplate.standardFields.map(field =>
        field.id === fieldId ? { ...field, ...updates } : field
      )
    });
  };

  // Delete standard field
  const handleDeleteStandardField = (fieldId: string) => {
    if (!editingTemplate) return;
    
    setEditingTemplate({
      ...editingTemplate,
      standardFields: editingTemplate.standardFields.filter(field => field.id !== fieldId)
    });
  };

  // Enhanced: Preview data before processing
  const handlePreviewData = () => {
    try {
      const parsed = JSON.parse(sourceData);
      setDataPreview(parsed);
      setShowDataPreview(true);
      setError(null);
    } catch {
      setError('Invalid JSON format. Please check your input.');
      toast.error('Invalid JSON format');
    }
  };

  // Data processing
  const handleProcessData = async () => {
    if (!activeTemplate || !sourceData.trim()) {
      setError('Please select a template and provide source data');
      toast.error('Please select a template and provide source data');
      return;
    }

    try {
      setIsProcessing(true);
      setError(null);
      setValidationErrors([]);

      // Parse source data
      let parsedData: Record<string, unknown>[];
      try {
        parsedData = JSON.parse(sourceData);
        if (!Array.isArray(parsedData)) {
          parsedData = [parsedData];
        }
      } catch {
        throw new Error('Invalid JSON format in source data');
      }

      // Process data using the template
      const processed = processData(activeTemplate.id, parsedData);
      
      // Update UI with results
      const successCount = processed.filter(p => p.processingStatus === 'completed').length;
      const failCount = processed.filter(p => p.processingStatus === 'failed').length;
      
      // Add to processing history
      setProcessingHistory(prev => [{
        timestamp: new Date().toISOString(),
        templateName: activeTemplate.name,
        recordsProcessed: successCount,
        success: failCount === 0
      }, ...prev.slice(0, 9)]); // Keep last 10 entries
      
      if (failCount > 0) {
        setValidationErrors(processed.filter(p => p.processingStatus === 'failed'));
        toast.error(`Processed ${successCount} records successfully, ${failCount} failed`);
      } else {
        toast.success(`Processed ${successCount} records successfully`);
      }

    } catch (err) {
      logger.error('Error processing data', err instanceof Error ? err : undefined);
      const errorMessage = err instanceof Error ? err.message : 'Failed to process data';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  // Import/Export functions
  const handleExport = () => {
    const success = exportData();
    if (success) {
      toast.success('Data exported successfully');
    } else {
      toast.error('Failed to export data');
    }
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const success = await importData(file);
      if (success) {
        toast.success('Data imported successfully');
      } else {
        toast.error('Failed to import data');
      }
    }
  };

  const handleClearData = () => {
    if (confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
      clearAllData();
      setProcessingHistory([]);
      toast.success('All data cleared');
    }
  };

  // Get storage information
  const storageInfo = getStorageInfo();

  // Enhanced: Filter and sort templates
  const getFilteredAndSortedTemplates = () => {
    let filtered = templates;

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(t => 
        t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply type filter
    if (filterType !== 'all') {
      filtered = filtered.filter(t => t.dataType === filterType);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'date':
          comparison = new Date(a.updatedAt || a.createdAt).getTime() - 
                      new Date(b.updatedAt || b.createdAt).getTime();
          break;
        case 'type':
          comparison = (a.dataType || '').localeCompare(b.dataType || '');
          break;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  };

  // Toggle template expansion
  const toggleTemplateExpansion = (templateId: string) => {
    setExpandedTemplates(prev => {
      const newSet = new Set(prev);
      if (newSet.has(templateId)) {
        newSet.delete(templateId);
      } else {
        newSet.add(templateId);
      }
      return newSet;
    });
  };

  // Render functions
  const renderSaveIndicator = () => {
    if (isSaving) {
      return (
        <div className="flex items-center text-blue-600 text-sm">
          <Loader className="w-4 h-4 mr-2 animate-spin" />
          Saving...
        </div>
      );
    }
    
    if (lastSaved) {
      return (
        <div className="flex items-center text-green-600 text-sm">
          <Save className="w-4 h-4 mr-2" />
          Saved {lastSaved}
        </div>
      );
    }
    
    return null;
  };

  const renderHelp = () => {
    if (!showHelp) return null;

    return (
      <Card className="mb-6 bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center text-blue-900 dark:text-blue-100">
              <HelpCircle className="w-5 h-5 mr-2" />
              Quick Help & Keyboard Shortcuts
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowHelp(false)}
            >
              <X className="w-4 h-4" />
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Keyboard Shortcuts</h4>
              <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
                <li><kbd className="px-2 py-1 bg-blue-100 dark:bg-blue-800 rounded">Ctrl/Cmd + K</kbd> - Focus search</li>
                <li><kbd className="px-2 py-1 bg-blue-100 dark:bg-blue-800 rounded">Ctrl/Cmd + N</kbd> - New template</li>
                <li><kbd className="px-2 py-1 bg-blue-100 dark:bg-blue-800 rounded">Ctrl/Cmd + P</kbd> - Process data</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Tips</h4>
              <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
                <li>• Use search to quickly find templates</li>
                <li>• Preview data before processing</li>
                <li>• Duplicate templates for quick variants</li>
                <li>• Export/import for backup and sharing</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderStorageInfo = () => {
    if (!showStorageInfo) return null;

    return (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <HardDrive className="w-5 h-5 mr-2" />
              Storage Information
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowStorageInfo(false)}
            >
              <X className="w-4 h-4" />
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{storageInfo.totalTemplates}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Templates</div>
            </div>
            <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">{storageInfo.totalNormalizedRecords}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Records</div>
            </div>
            <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{storageInfo.storageUsed}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Storage Used</div>
            </div>
            <div className="text-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
              <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">{storageInfo.lastUpdate}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Last Updated</div>
            </div>
          </div>
          
          {processingHistory.length > 0 && (
            <div className="mt-6">
              <h4 className="font-semibold mb-3 flex items-center">
                <BarChart3 className="w-4 h-4 mr-2" />
                Recent Processing History
              </h4>
              <div className="space-y-2">
                {processingHistory.slice(0, 5).map((entry, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded">
                    <div className="flex items-center gap-2">
                      {entry.success ? (
                        <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400" />
                      )}
                      <span className="text-sm font-medium">{entry.templateName}</span>
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {entry.recordsProcessed} records • {new Date(entry.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  const renderToolbar = () => (
    <Card>
      <CardContent className="p-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            {renderSaveIndicator()}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowHelp(!showHelp)}
              title="Show keyboard shortcuts and help"
            >
              <HelpCircle className="w-4 h-4" />
            </Button>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowStorageInfo(!showStorageInfo)}
              title="View storage information"
            >
              <Info className="w-4 h-4 mr-2" />
              Info
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (templates.length === 0) {
                  initializeWithDemoData();
                }
              }}
              title="Refresh templates"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleImport}
              className="hidden"
              aria-label="Import templates file"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              title="Import templates"
            >
              <Upload className="w-4 h-4 mr-2" />
              Import
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExport}
              title="Export templates"
            >
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button
              size="sm"
              onClick={() => setShowCreateModal(true)}
              title="Create new template (Ctrl/Cmd + N)"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Template
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderSearchAndFilters = () => (
    <Card>
      <CardContent className="p-4">
        <div className="grid md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              id="template-search"
              type="text"
              placeholder="Search templates... (Ctrl/Cmd + K)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            />
          </div>
          
          {/* Filter by type */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              title="Filter by data type"
            >
              <option value="all">All Types</option>
              {dataTypes.map(type => (
                <option key={type.id} value={type.id}>{type.name}</option>
              ))}
            </select>
          </div>
          
          {/* Sort */}
          <div className="flex gap-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'name' | 'date' | 'type')}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              title="Sort templates"
            >
              <option value="date">Sort by Date</option>
              <option value="name">Sort by Name</option>
              <option value="type">Sort by Type</option>
            </select>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
              title={`Sort ${sortOrder === 'asc' ? 'descending' : 'ascending'}`}
            >
              {sortOrder === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderTemplatesList = () => {
    const filteredTemplates = getFilteredAndSortedTemplates();

    return (
      <div className="space-y-4">
        {renderSearchAndFilters()}
        
        {filteredTemplates.map(template => {
          const typeInfo = dataTypes.find(t => t.id === template.dataType);
          const TypeIcon = typeInfo?.icon || FileJson;
          const isExpanded = expandedTemplates.has(template.id);
          
          return (
            <Card 
              key={template.id}
              className={`transition-all ${activeTemplate?.id === template.id ? 'ring-2 ring-blue-500' : ''}`}
            >
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className={`p-2 rounded-lg bg-${typeInfo?.color || 'gray'}-100 dark:bg-${typeInfo?.color || 'gray'}-900/30`}>
                          <TypeIcon className={`w-5 h-5 text-${typeInfo?.color || 'gray'}-600 dark:text-${typeInfo?.color || 'gray'}-400`} />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{template.name}</h3>
                          {template.description && (
                            <p className="text-sm text-gray-600 dark:text-gray-400">{template.description}</p>
                          )}
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toggleTemplateExpansion(template.id)}
                          title="Show details"
                        >
                          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </Button>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                        <span className="flex items-center gap-1">
                          <Database className="w-4 h-4" />
                          {typeInfo?.name || 'Unknown Type'}
                        </span>
                        <span>•</span>
                        <span>{template.format} → Standard</span>
                        <span>•</span>
                        <span>Updated {new Date(template.updatedAt || template.createdAt).toLocaleDateString()}</span>
                        {template.isActive && (
                          <>
                            <span>•</span>
                            <span className="flex items-center gap-1 text-green-600 dark:text-green-400">
                              <CheckCircle className="w-4 h-4" />
                              Active
                            </span>
                          </>
                        )}
                      </div>

                      {isExpanded && (
                        <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <h4 className="text-sm font-semibold mb-2">Template Details</h4>
                          <div className="grid md:grid-cols-2 gap-3 text-sm">
                            <div>
                              <span className="font-medium">Transformation Rules:</span> {template.transformationRules?.length || 0}
                            </div>
                            <div>
                              <span className="font-medium">Standard Fields:</span> {template.standardFields?.length || 0}
                            </div>
                            <div>
                              <span className="font-medium">Created:</span> {new Date(template.createdAt).toLocaleString()}
                            </div>
                            <div>
                              <span className="font-medium">ID:</span> <code className="text-xs">{template.id}</code>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2 ml-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setActiveTemplate(template)}
                        title="Use this template"
                        className={activeTemplate?.id === template.id ? 'bg-blue-50 dark:bg-blue-900/30' : ''}
                      >
                        {activeTemplate?.id === template.id ? <Zap className="w-4 h-4 text-blue-600 dark:text-blue-400" /> : <Eye className="w-4 h-4" />}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDuplicateTemplate(template)}
                        title="Duplicate template"
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditTemplate(template)}
                        title="Edit template"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleUpdateTemplate(template.id, { isActive: !template.isActive })}
                        title="Toggle active status"
                        className={template.isActive ? 'bg-green-50 dark:bg-green-900/30' : ''}
                      >
                        {template.isActive ? (
                          <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                        ) : (
                          <X className="w-4 h-4" />
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteTemplate(template.id)}
                        className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                        title="Delete template"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      
      {filteredTemplates.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <FileJson className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              {searchQuery || filterType !== 'all' ? 'No templates match your filters' : 'No templates found'}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {searchQuery || filterType !== 'all' 
                ? 'Try adjusting your search or filter criteria.'
                : 'Get started by creating your first data normalization template.'}
            </p>
            {!searchQuery && filterType === 'all' && (
              <Button onClick={() => setShowCreateModal(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create Template
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

  const renderDataProcessing = () => (
    <div className="space-y-6">
      {activeTemplate ? (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center">
                  <FileJson className="w-5 h-5 mr-2" />
                  Process Data with {activeTemplate.name}
                </div>
                {sourceData && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handlePreviewData}
                    title="Preview your data"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Preview
                  </Button>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Source Data (JSON)</label>
                  <textarea
                    value={sourceData}
                    onChange={(e) => setSourceData(e.target.value)}
                    placeholder='Enter your source data in JSON format...
Example:
[
  {"id": 1, "name": "Item 1"},
  {"id": 2, "name": "Item 2"}
]'
                    className="w-full h-48 p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  />
                  <div className="flex items-center justify-between mt-2">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {sourceData.length} characters
                    </p>
                    {sourceData && (
                      <button
                        onClick={() => {
                          try {
                            const formatted = JSON.stringify(JSON.parse(sourceData), null, 2);
                            setSourceData(formatted);
                          } catch {
                            setError('Invalid JSON - cannot format');
                            toast.error('Invalid JSON - cannot format');
                          }
                        }}
                        className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                      >
                        Format JSON
                      </button>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <Button
                    onClick={handleProcessData}
                    disabled={isProcessing || !sourceData.trim()}
                    className="flex items-center"
                    title="Process data (Ctrl/Cmd + P)"
                  >
                    {isProcessing ? (
                      <Loader className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Play className="w-4 h-4 mr-2" />
                    )}
                    {isProcessing ? 'Processing...' : 'Process Data'}
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={() => setSourceData('')}
                    disabled={isProcessing}
                  >
                    <X className="w-4 h-4 mr-2" />
                    Clear
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={() => {
                      const sample = [
                        { id: 1, name: 'Sample Item 1', status: 'active' },
                        { id: 2, name: 'Sample Item 2', status: 'inactive' }
                      ];
                      setSourceData(JSON.stringify(sample, null, 2));
                    }}
                    disabled={isProcessing}
                  >
                    <FileCheck className="w-4 h-4 mr-2" />
                    Load Sample
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {showDataPreview && dataPreview && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Eye className="w-5 h-5 mr-2" />
                    Data Preview
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowDataPreview(false)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg overflow-auto max-h-96 text-sm">
                  {JSON.stringify(dataPreview, null, 2)}
                </pre>
                <div className="mt-3 text-sm text-gray-600 dark:text-gray-400">
                  Records to process: {Array.isArray(dataPreview) ? dataPreview.length : 1}
                </div>
              </CardContent>
            </Card>
          )}

          {validationErrors.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-red-600 dark:text-red-400">
                  <AlertTriangle className="w-5 h-5 mr-2" />
                  Processing Errors ({validationErrors.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {validationErrors.map((errorItem, index) => {
                    const error = errorItem as { errorMessage?: string };
                    return (
                      <div key={index} className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                        <p className="text-sm font-medium text-red-800 dark:text-red-200">Record {index + 1}</p>
                        <p className="text-sm text-red-700 dark:text-red-300">{error.errorMessage || 'Processing error'}</p>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {dataQualityMetrics && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CheckCircle className="w-5 h-5 mr-2" />
                  Data Quality Metrics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{dataQualityMetrics.totalRecords}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Total Records</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">{dataQualityMetrics.processedRecords}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Processed</div>
                  </div>
                  <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                    <div className="text-2xl font-bold text-red-600 dark:text-red-400">{dataQualityMetrics.failedRecords}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Failed</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{dataQualityMetrics.qualityScore}%</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Quality Score</div>
                  </div>
                </div>
                
                {dataQualityMetrics.qualityScore < 100 && (
                  <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                      <div className="text-sm text-yellow-800 dark:text-yellow-200">
                        <p className="font-medium">Quality score is below 100%</p>
                        <p>Review the processing errors above to improve data quality.</p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </>
      ) : (
        <Card>
          <CardContent className="p-8 text-center">
            <Settings className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">Select a Template</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Choose a template from the Templates tab to start processing data.
            </p>
            <Button onClick={() => setActiveTab('templates')}>
              <ArrowRight className="w-4 h-4 mr-2" />
              Go to Templates
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );

  if (isLoading) {
    return (
      <div className="h-full overflow-auto">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <Loader className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">Loading templates...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2 text-gray-900 dark:text-gray-100">Data Normalization Engine</h1>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Transform and standardize security data from multiple sources into consistent formats
          </p>
        </div>

        {(error || saveError) && (
          <Card className="mb-6 border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20">
            <CardContent className="p-4">
              <div className="flex items-center text-red-600 dark:text-red-400">
                <AlertTriangle className="w-5 h-5 mr-2" />
                {error || saveError}
              </div>
            </CardContent>
          </Card>
        )}

        <div className="space-y-6">
          {/* Help Section */}
          {renderHelp()}

          {/* Storage Info */}
          {renderStorageInfo()}

          {/* Create Template Modal */}
          {showCreateModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50" onClick={() => setShowCreateModal(false)}>
              <Card className="max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <CardTitle>Create New Template</CardTitle>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowCreateModal(false)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Template Name</label>
                      <input
                        type="text"
                        id="template-name"
                        className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                        placeholder="Enter template name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Description</label>
                      <textarea
                        id="template-description"
                        className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                        placeholder="Enter template description"
                        rows={3}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Data Type</label>
                      <select
                        id="template-data-type"
                        className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                        title="Select data type"
                      >
                        {dataTypes.map(type => (
                          <option key={type.id} value={type.id}>{type.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="flex gap-2 justify-end">
                      <Button
                        variant="outline"
                        onClick={() => setShowCreateModal(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={() => {
                          const nameInput = document.getElementById('template-name') as HTMLInputElement;
                          const descInput = document.getElementById('template-description') as HTMLTextAreaElement;
                          const typeInput = document.getElementById('template-data-type') as HTMLSelectElement;
                          
                          if (nameInput?.value) {
                            const newTemplate = {
                              name: nameInput.value,
                              description: descInput?.value || '',
                              dataType: typeInput?.value || 'security_event',
                              format: 'json',
                              sourceSystem: 'Manual',
                              transformationRules: [],
                              standardFields: [],
                              isActive: true,
                              metadata: {}
                            };
                            handleCreateTemplate(newTemplate, true); // Open editor after creation
                          }
                        }}
                      >
                        Create Template
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Edit Template Modal */}
          {showEditModal && editingTemplate && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50" onClick={() => { setShowEditModal(false); setEditingTemplate(null); }}>
              <Card className="max-w-5xl w-full mx-4 max-h-[90vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
                <CardHeader className="flex-shrink-0">
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Edit className="w-5 h-5 mr-2" />
                      Edit Template: {editingTemplate.name}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => { setShowEditModal(false); setEditingTemplate(null); }}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex-1 overflow-y-auto p-6">
                  <div className="space-y-6">
                    {/* Basic Information */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold flex items-center">
                        <Settings className="w-5 h-5 mr-2" />
                        Basic Information
                      </h3>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-1">Template Name *</label>
                          <input
                            type="text"
                            value={editingTemplate.name}
                            onChange={(e) => setEditingTemplate({ ...editingTemplate, name: e.target.value })}
                            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                            placeholder="Enter template name"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Data Type</label>
                          <select
                            value={editingTemplate.dataType}
                            onChange={(e) => setEditingTemplate({ ...editingTemplate, dataType: e.target.value })}
                            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                          >
                            {dataTypes.map(type => (
                              <option key={type.id} value={type.id}>{type.name}</option>
                            ))}
                          </select>
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium mb-1">Description</label>
                          <textarea
                            value={editingTemplate.description}
                            onChange={(e) => setEditingTemplate({ ...editingTemplate, description: e.target.value })}
                            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                            placeholder="Enter template description"
                            rows={3}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Format</label>
                          <select
                            value={editingTemplate.format}
                            onChange={(e) => setEditingTemplate({ ...editingTemplate, format: e.target.value })}
                            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                          >
                            <option value="json">JSON</option>
                            <option value="csv">CSV</option>
                            <option value="xml">XML</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Source System</label>
                          <input
                            type="text"
                            value={editingTemplate.sourceSystem}
                            onChange={(e) => setEditingTemplate({ ...editingTemplate, sourceSystem: e.target.value })}
                            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                            placeholder="e.g., SIEM, Manual, API"
                          />
                        </div>
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            id="template-active"
                            checked={editingTemplate.isActive}
                            onChange={(e) => setEditingTemplate({ ...editingTemplate, isActive: e.target.checked })}
                            className="w-4 h-4 mr-2"
                          />
                          <label htmlFor="template-active" className="text-sm font-medium">Active Template</label>
                        </div>
                      </div>
                    </div>

                    {/* Transformation Rules */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold flex items-center">
                          <Code className="w-5 h-5 mr-2" />
                          Transformation Rules ({editingTemplate.transformationRules.length})
                        </h3>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleAddTransformationRule}
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Add Rule
                        </Button>
                      </div>
                      {editingTemplate.transformationRules.length === 0 ? (
                        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg text-center text-gray-600 dark:text-gray-400">
                          No transformation rules defined. Click "Add Rule" to create one.
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {editingTemplate.transformationRules.map((rule, index) => (
                            <Card key={rule.id} className="border-l-4 border-l-blue-500">
                              <CardContent className="p-4">
                                <div className="flex items-start justify-between mb-4">
                                  <h4 className="font-semibold">Rule {index + 1}</h4>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleDeleteTransformationRule(rule.id)}
                                    className="text-red-600 hover:text-red-700 dark:text-red-400"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                                <div className="grid md:grid-cols-2 gap-4">
                                  <div>
                                    <label className="block text-sm font-medium mb-1">Source Field *</label>
                                    <input
                                      type="text"
                                      value={rule.sourceField}
                                      onChange={(e) => handleUpdateTransformationRule(rule.id, { sourceField: e.target.value })}
                                      className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                                      placeholder="e.g., event_id"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-sm font-medium mb-1">Target Field *</label>
                                    <input
                                      type="text"
                                      value={rule.targetField}
                                      onChange={(e) => handleUpdateTransformationRule(rule.id, { targetField: e.target.value })}
                                      className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                                      placeholder="e.g., eventId"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-sm font-medium mb-1">Transformation Type *</label>
                                    <select
                                      value={rule.transformationType}
                                      onChange={(e) => handleUpdateTransformationRule(rule.id, { 
                                        transformationType: e.target.value as TransformationRule['transformationType'],
                                        parameters: e.target.value === 'mapping' ? { mapping: {} } : 
                                                   e.target.value === 'calculation' ? { formula: '' } :
                                                   e.target.value === 'format' ? { format: '' } : {}
                                      })}
                                      className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                                    >
                                      <option value="direct">Direct Mapping</option>
                                      <option value="mapping">Value Mapping</option>
                                      <option value="calculation">Calculation</option>
                                      <option value="validation">Validation</option>
                                      <option value="format">Format</option>
                                    </select>
                                  </div>
                                  <div className="flex items-center">
                                    <input
                                      type="checkbox"
                                      checked={rule.isRequired}
                                      onChange={(e) => handleUpdateTransformationRule(rule.id, { isRequired: e.target.checked })}
                                      className="w-4 h-4 mr-2"
                                    />
                                    <label className="text-sm font-medium">Required Field</label>
                                  </div>
                                  {rule.transformationType === 'mapping' && (
                                    <div className="md:col-span-2">
                                      <label className="block text-sm font-medium mb-1">Value Mapping (JSON)</label>
                                      <textarea
                                        value={JSON.stringify(rule.parameters.mapping || {}, null, 2)}
                                        onChange={(e) => {
                                          try {
                                            const mapping = JSON.parse(e.target.value);
                                            handleUpdateTransformationRule(rule.id, { parameters: { mapping } });
                                          } catch {
                                            // Invalid JSON, ignore
                                          }
                                        }}
                                        className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 font-mono text-sm"
                                        rows={4}
                                        placeholder='{"high": "critical", "medium": "warning", "low": "info"}'
                                      />
                                    </div>
                                  )}
                                  {rule.transformationType === 'calculation' && (
                                    <div className="md:col-span-2">
                                      <label className="block text-sm font-medium mb-1">Formula</label>
                                      <input
                                        type="text"
                                        value={String(rule.parameters.formula || '')}
                                        onChange={(e) => handleUpdateTransformationRule(rule.id, { parameters: { formula: e.target.value } })}
                                        className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 font-mono"
                                        placeholder='e.g., {field1} + {field2}'
                                      />
                                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Use {"{fieldName}"} to reference source fields</p>
                                    </div>
                                  )}
                                  {rule.transformationType === 'format' && (
                                    <div className="md:col-span-2">
                                      <label className="block text-sm font-medium mb-1">Format</label>
                                      <select
                                        value={String(rule.parameters.format || '')}
                                        onChange={(e) => handleUpdateTransformationRule(rule.id, { parameters: { format: e.target.value } })}
                                        className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                                      >
                                        <option value="">Select format</option>
                                        <option value="date">Date (ISO)</option>
                                        <option value="uppercase">Uppercase</option>
                                        <option value="lowercase">Lowercase</option>
                                        <option value="number">Number</option>
                                        <option value="boolean">Boolean</option>
                                      </select>
                                    </div>
                                  )}
                                  <div className="md:col-span-2">
                                    <label className="block text-sm font-medium mb-1">Description</label>
                                    <input
                                      type="text"
                                      value={rule.description}
                                      onChange={(e) => handleUpdateTransformationRule(rule.id, { description: e.target.value })}
                                      className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                                      placeholder="Describe this transformation rule"
                                    />
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Standard Fields */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold flex items-center">
                          <Database className="w-5 h-5 mr-2" />
                          Standard Fields ({editingTemplate.standardFields.length})
                        </h3>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleAddStandardField}
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Add Field
                        </Button>
                      </div>
                      {editingTemplate.standardFields.length === 0 ? (
                        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg text-center text-gray-600 dark:text-gray-400">
                          No standard fields defined. Click "Add Field" to create one.
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {editingTemplate.standardFields.map((field, index) => (
                            <Card key={field.id} className="border-l-4 border-l-green-500">
                              <CardContent className="p-4">
                                <div className="flex items-start justify-between mb-4">
                                  <h4 className="font-semibold">Field {index + 1}</h4>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleDeleteStandardField(field.id)}
                                    className="text-red-600 hover:text-red-700 dark:text-red-400"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                                <div className="grid md:grid-cols-2 gap-4">
                                  <div>
                                    <label className="block text-sm font-medium mb-1">Field Name *</label>
                                    <input
                                      type="text"
                                      value={field.name}
                                      onChange={(e) => handleUpdateStandardField(field.id, { name: e.target.value })}
                                      className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                                      placeholder="e.g., eventId"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-sm font-medium mb-1">Data Type *</label>
                                    <select
                                      value={field.dataType}
                                      onChange={(e) => handleUpdateStandardField(field.id, { dataType: e.target.value })}
                                      className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                                    >
                                      <option value="string">String</option>
                                      <option value="number">Number</option>
                                      <option value="boolean">Boolean</option>
                                      <option value="date">Date</option>
                                      <option value="object">Object</option>
                                      <option value="array">Array</option>
                                    </select>
                                  </div>
                                  <div className="md:col-span-2">
                                    <label className="block text-sm font-medium mb-1">Description</label>
                                    <textarea
                                      value={field.description}
                                      onChange={(e) => handleUpdateStandardField(field.id, { description: e.target.value })}
                                      className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                                      placeholder="Describe this standard field"
                                      rows={2}
                                    />
                                  </div>
                                  <div className="flex items-center">
                                    <input
                                      type="checkbox"
                                      checked={field.isRequired}
                                      onChange={(e) => handleUpdateStandardField(field.id, { isRequired: e.target.checked })}
                                      className="w-4 h-4 mr-2"
                                    />
                                    <label className="text-sm font-medium">Required Field</label>
                                  </div>
                                  <div>
                                    <label className="block text-sm font-medium mb-1">Validation Rules (comma-separated)</label>
                                    <input
                                      type="text"
                                      value={field.validationRules.join(', ')}
                                      onChange={(e) => handleUpdateStandardField(field.id, { 
                                        validationRules: e.target.value.split(',').map(r => r.trim()).filter(r => r) 
                                      })}
                                      className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                                      placeholder="e.g., not_empty, min_length:5, max_length:100"
                                    />
                                  </div>
                                  <div className="md:col-span-2">
                                    <label className="block text-sm font-medium mb-1">Examples (comma-separated)</label>
                                    <input
                                      type="text"
                                      value={field.examples.join(', ')}
                                      onChange={(e) => handleUpdateStandardField(field.id, { 
                                        examples: e.target.value.split(',').map(e => e.trim()).filter(e => e) 
                                      })}
                                      className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                                      placeholder="e.g., evt_12345, log_67890"
                                    />
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
                <div className="flex-shrink-0 border-t border-gray-200 dark:border-gray-700 p-4 flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => { setShowEditModal(false); setEditingTemplate(null); }}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSaveEditedTemplate}
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </Button>
                </div>
              </Card>
            </div>
          )}

          {/* Toolbar */}
          {renderToolbar()}

          {/* Tabs */}
          <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
            <button
              onClick={() => setActiveTab('templates')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'templates'
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
              }`}
            >
              Templates ({templates.length})
            </button>
            <button
              onClick={() => setActiveTab('processing')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'processing'
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
              }`}
            >
              <div className="flex items-center gap-2">
                Data Processing
                {activeTemplate && <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-xs">Active</span>}
              </div>
            </button>
          </div>

          {/* Content */}
          {activeTab === 'templates' && renderTemplatesList()}
          {activeTab === 'processing' && renderDataProcessing()}

          {/* Footer Actions */}
          <div className="flex justify-between items-center pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {templates.length} template{templates.length !== 1 ? 's' : ''} • 
              {normalizedData.length} normalized record{normalizedData.length !== 1 ? 's' : ''}
            </div>
            <Button
              variant="outline"
              onClick={handleClearData}
              className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Clear All Data
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataNormalizationEngine;

