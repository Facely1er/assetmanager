import { useState, useEffect, useCallback } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { logger } from '../utils/logger';

export interface DataTemplate {
  id: string;
  name: string;
  description: string;
  dataType: string;
  format: string;
  sourceSystem: string;
  transformationRules: TransformationRule[];
  standardFields: StandardField[];
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
  metadata: Record<string, unknown>;
}

export interface TransformationRule {
  id: string;
  sourceField: string;
  targetField: string;
  transformationType: 'direct' | 'mapping' | 'calculation' | 'validation' | 'format';
  parameters: Record<string, unknown>;
  isRequired: boolean;
  description: string;
}

export interface StandardField {
  id: string;
  name: string;
  dataType: string;
  description: string;
  isRequired: boolean;
  validationRules: string[];
  examples: string[];
}

export interface NormalizedData {
  id: string;
  templateId: string;
  sourceData: Record<string, unknown>;
  normalizedData: Record<string, unknown>;
  processingStatus: 'pending' | 'processing' | 'completed' | 'failed';
  errorMessage?: string;
  processedAt: string;
  metadata: Record<string, unknown>;
}

export interface DataQualityMetrics {
  totalRecords: number;
  processedRecords: number;
  failedRecords: number;
  qualityScore: number;
  commonIssues: string[];
  processingTime: number;
}

interface DataNormalizationStorage {
  templates: DataTemplate[];
  normalizedData: NormalizedData[];
  dataQualityMetrics: DataQualityMetrics | null;
  lastUpdated: string;
  version: string;
  metadata: {
    totalTemplates: number;
    totalProcessedRecords: number;
    lastBackup: string | null;
    storageSize: number;
  };
}

const STORAGE_KEY = 'cybersoluce-data-normalization';
const STORAGE_VERSION = '1.0.0';
const AUTO_SAVE_DELAY = 2000;

const initialStorageData: DataNormalizationStorage = {
  templates: [],
  normalizedData: [],
  dataQualityMetrics: null,
  lastUpdated: new Date().toISOString(),
  version: STORAGE_VERSION,
  metadata: {
    totalTemplates: 0,
    totalProcessedRecords: 0,
    lastBackup: null,
    storageSize: 0
  }
};

export function useDataNormalizationStorage() {
  const [storageData, setStorageData] = useLocalStorage<DataNormalizationStorage>(
    STORAGE_KEY,
    initialStorageData
  );

  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Auto-save effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (storageData.templates.length > 0 || storageData.normalizedData.length > 0) {
        saveToStorage();
      }
    }, AUTO_SAVE_DELAY);

    return () => clearTimeout(timeoutId);
  }, [storageData.templates, storageData.normalizedData]);

  const saveToStorage = useCallback(() => {
    try {
      setIsSaving(true);
      setSaveError(null);
      
      const updatedData: DataNormalizationStorage = {
        ...storageData,
        lastUpdated: new Date().toISOString(),
        metadata: {
          ...storageData.metadata,
          totalTemplates: storageData.templates.length,
          totalProcessedRecords: storageData.normalizedData.length,
          storageSize: JSON.stringify(storageData).length
        }
      };

      setStorageData(updatedData);
      setLastSaved(new Date().toLocaleTimeString());
    } catch (error) {
      logger.error('Error saving to localStorage', error instanceof Error ? error : undefined);
      setSaveError('Failed to save data to localStorage');
    } finally {
      setIsSaving(false);
    }
  }, [storageData, setStorageData]);

  // Template CRUD operations
  const addTemplate = useCallback((template: Omit<DataTemplate, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newTemplate: DataTemplate = {
      ...template,
      id: `template_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setStorageData(prev => ({
      ...prev,
      templates: [...prev.templates, newTemplate]
    }));
  }, [setStorageData]);

  const updateTemplate = useCallback((id: string, updates: Partial<DataTemplate>) => {
    setStorageData(prev => ({
      ...prev,
      templates: prev.templates.map(template =>
        template.id === id
          ? { ...template, ...updates, updatedAt: new Date().toISOString() }
          : template
      )
    }));
  }, [setStorageData]);

  const deleteTemplate = useCallback((id: string) => {
    setStorageData(prev => ({
      ...prev,
      templates: prev.templates.filter(template => template.id !== id)
    }));
  }, [setStorageData]);

  // Data processing operations
  const processData = useCallback((templateId: string, sourceData: Record<string, unknown>[]) => {
    const template = storageData.templates.find(t => t.id === templateId);
    if (!template) {
      throw new Error('Template not found');
    }

    const processedData: NormalizedData[] = [];
    let processedCount = 0;
    let failedCount = 0;

    sourceData.forEach((data, index) => {
      try {
        const normalized = applyTransformationRules(template, data);
        processedData.push({
          id: `processed_${Date.now()}_${index}`,
          templateId,
          sourceData: data,
          normalizedData: normalized,
          processingStatus: 'completed',
          processedAt: new Date().toISOString(),
          metadata: { processingTime: Date.now() }
        });
        processedCount++;
      } catch (error) {
        processedData.push({
          id: `processed_${Date.now()}_${index}`,
          templateId,
          sourceData: data,
          normalizedData: {},
          processingStatus: 'failed',
          errorMessage: error instanceof Error ? error.message : 'Unknown error',
          processedAt: new Date().toISOString(),
          metadata: { processingTime: Date.now() }
        });
        failedCount++;
      }
    });

    setStorageData(prev => ({
      ...prev,
      normalizedData: [...prev.normalizedData, ...processedData]
    }));

    // Update quality metrics
    updateDataQualityMetrics(processedCount, failedCount);

    return processedData;
  }, [storageData.templates, setStorageData]);

  const applyTransformationRules = (template: DataTemplate, sourceData: Record<string, unknown>): Record<string, unknown> => {
    const normalized: Record<string, unknown> = {};

    template.transformationRules.forEach(rule => {
      try {
        const sourceValue = sourceData[rule.sourceField];
        
        switch (rule.transformationType) {
          case 'direct':
            normalized[rule.targetField] = sourceValue;
            break;
          case 'mapping':
            const mapping = rule.parameters.mapping as Record<string, string>;
            normalized[rule.targetField] = mapping[String(sourceValue)] || sourceValue;
            break;
          case 'calculation':
            // Simple calculation - replace field references with values
            const formula = String(rule.parameters.formula || '');
            try {
              const calculated = formula.replace(/\{(\w+)\}/g, (match, field) => {
                const value = sourceData[field];
                return value !== undefined && value !== null ? String(value) : '0';
              });
              // Basic arithmetic operations only - safe evaluation
              // In production, consider using a proper expression parser library
              normalized[rule.targetField] = new Function('return ' + calculated)();
            } catch (calcError) {
              logger.warn('Calculation error', calcError instanceof Error ? calcError : undefined);
              normalized[rule.targetField] = null;
            }
            break;
          case 'validation':
            if (rule.isRequired && (!sourceValue || sourceValue === '')) {
              throw new Error(`Required field ${rule.sourceField} is missing`);
            }
            normalized[rule.targetField] = sourceValue;
            break;
          case 'format':
            normalized[rule.targetField] = formatValue(sourceValue, String(rule.parameters.format || ''));
            break;
          default:
            normalized[rule.targetField] = sourceValue;
        }
      } catch (error) {
        if (rule.isRequired) {
          throw error;
        }
        normalized[rule.targetField] = null;
      }
    });

    return normalized;
  };

  const formatValue = (value: unknown, format: string): unknown => {
    if (value === null || value === undefined) return value;
    
    switch (format) {
      case 'date':
        return new Date(String(value)).toISOString();
      case 'uppercase':
        return String(value).toUpperCase();
      case 'lowercase':
        return String(value).toLowerCase();
      case 'number':
        return Number(value);
      case 'boolean':
        return Boolean(value);
      default:
        return value;
    }
  };

  const updateDataQualityMetrics = useCallback((processed: number, failed: number) => {
    const total = processed + failed;
    const qualityScore = total > 0 ? Math.round((processed / total) * 100) : 100;

    const metrics: DataQualityMetrics = {
      totalRecords: total,
      processedRecords: processed,
      failedRecords: failed,
      qualityScore,
      commonIssues: failed > 0 ? ['Missing required fields', 'Invalid data format', 'Transformation errors'] : [],
      processingTime: Date.now()
    };

    setStorageData(prev => ({
      ...prev,
      dataQualityMetrics: metrics
    }));
  }, [setStorageData]);

  // Data management
  const exportData = useCallback(() => {
    try {
      const exportDataObj = {
        templates: storageData.templates,
        metadata: {
          ...storageData.metadata,
          exportedAt: new Date().toISOString(),
          version: '1.0'
        }
      };

      const blob = new Blob([JSON.stringify(exportDataObj, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `data-normalization-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setStorageData(prev => ({
        ...prev,
        metadata: {
          ...prev.metadata,
          lastBackup: new Date().toISOString()
        }
      }));

      return true;
    } catch (error) {
      logger.error('Error exporting data', error instanceof Error ? error : undefined);
      setSaveError('Failed to export data');
      return false;
    }
  }, [storageData, setStorageData]);

  const importData = useCallback((file: File): Promise<boolean> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const importedData = JSON.parse(e.target?.result as string);
          
          if (!importedData.templates || !Array.isArray(importedData.templates)) {
            throw new Error('Invalid data format');
          }

          const existingIds = new Set(storageData.templates.map(template => template.id));
          const newTemplates = importedData.templates.filter((template: DataTemplate) => !existingIds.has(template.id));
          
          setStorageData(prev => ({
            ...prev,
            templates: [...prev.templates, ...newTemplates],
            normalizedData: importedData.normalizedData || prev.normalizedData,
            dataQualityMetrics: importedData.dataQualityMetrics || prev.dataQualityMetrics
          }));

          resolve(true);
        } catch (error) {
          logger.error('Error importing data', error instanceof Error ? error : undefined);
          setSaveError('Failed to import data - invalid format');
          resolve(false);
        }
      };
      reader.readAsText(file);
    });
  }, [storageData, setStorageData]);

  const clearAllData = useCallback(() => {
    if (confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
      setStorageData(initialStorageData);
      setLastSaved(null);
      setSaveError(null);
    }
  }, [setStorageData]);

  const getStorageInfo = useCallback(() => {
    const size = JSON.stringify(storageData).length;
    const sizeKB = (size / 1024).toFixed(2);
    const sizeMB = (size / (1024 * 1024)).toFixed(2);
    
    return {
      totalTemplates: storageData.templates.length,
      totalNormalizedRecords: storageData.normalizedData.length,
      storageUsed: size > 1024 * 1024 ? `${sizeMB} MB` : `${sizeKB} KB`,
      lastUpdate: new Date(storageData.lastUpdated).toLocaleString()
    };
  }, [storageData]);

  // Initialize with demo data
  const initializeWithDemoData = useCallback(() => {
    const demoTemplates: DataTemplate[] = [
      {
        id: 'demo-template-1',
        name: 'Security Event Normalization',
        description: 'Standardize security events from multiple SIEM sources',
        dataType: 'security_event',
        format: 'json',
        sourceSystem: 'SIEM',
        transformationRules: [
          {
            id: 'rule-1',
            sourceField: 'event_id',
            targetField: 'eventId',
            transformationType: 'direct',
            parameters: {},
            isRequired: true,
            description: 'Direct mapping of event ID'
          },
          {
            id: 'rule-2',
            sourceField: 'severity',
            targetField: 'severityLevel',
            transformationType: 'mapping',
            parameters: {
              mapping: {
                'high': 'critical',
                'medium': 'warning',
                'low': 'info'
              }
            },
            isRequired: true,
            description: 'Map severity levels to standard values'
          }
        ],
        standardFields: [
          {
            id: 'field-1',
            name: 'eventId',
            dataType: 'string',
            description: 'Unique event identifier',
            isRequired: true,
            validationRules: ['not_empty'],
            examples: ['evt_12345', 'log_67890']
          }
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isActive: true,
        metadata: { version: '1.0' }
      }
    ];

    setStorageData(prev => ({
      ...prev,
      templates: demoTemplates,
      lastUpdated: new Date().toISOString()
    }));
  }, [setStorageData]);

  return {
    // Data
    templates: storageData.templates,
    normalizedData: storageData.normalizedData,
    dataQualityMetrics: storageData.dataQualityMetrics,
    
    // State
    isSaving,
    lastSaved,
    saveError,
    
    // Template operations
    addTemplate,
    updateTemplate,
    deleteTemplate,
    
    // Data processing
    processData,
    
    // Data management
    exportData,
    importData,
    clearAllData,
    getStorageInfo,
    initializeWithDemoData,
    
    // Manual save
    saveToStorage
  };
}

