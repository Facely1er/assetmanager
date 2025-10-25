import React, { useState, useEffect } from 'react';
import { X, Save, AlertCircle } from 'lucide-react';
import { Asset } from '../types/asset';
import { validateAsset, ValidationError } from '../utils/validation';
import { assetTypes, criticalityLevels, statusOptions, complianceFrameworks } from '../data/sampleAssets';

interface AssetFormModalProps {
  asset?: Asset | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (asset: Omit<Asset, 'id' | 'createdAt' | 'updatedAt'>) => void;
}

export const AssetFormModal: React.FC<AssetFormModalProps> = ({
  asset,
  isOpen,
  onClose,
  onSave,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    type: 'Server' as Asset['type'],
    criticality: 'Medium' as Asset['criticality'],
    owner: '',
    location: '',
    ipAddress: '',
    description: '',
    complianceFrameworks: [] as string[],
    riskScore: 50,
    tags: [] as string[],
    status: 'Active' as Asset['status'],
    relationships: [],
    vulnerabilities: [],
    lastAssessed: new Date(),
    // Privacy and compliance fields
    dataClassification: 'Internal' as Asset['dataClassification'],
    dataTypes: [] as string[],
    retentionPeriod: undefined as number | undefined,
    legalBasis: [] as string[],
    dataSubjectRights: [] as string[],
    crossBorderTransfer: false,
    thirdPartySharing: false,
    encryptionStatus: 'Unknown' as Asset['encryptionStatus'],
    accessControls: [] as Asset['accessControls'],
    privacyImpactAssessment: null as Asset['privacyImpactAssessment'],
    dataBreachHistory: [] as Asset['dataBreachHistory'],
    dependencies: [] as Asset['dependencies'],
    requirements: [] as Asset['requirements'],
  });

  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newTag, setNewTag] = useState('');
  const [newFramework, setNewFramework] = useState('');
  const [newDataType, setNewDataType] = useState('');
  const [newLegalBasis, setNewLegalBasis] = useState('');
  const [newDataSubjectRight, setNewDataSubjectRight] = useState('');
  const [activeTab, setActiveTab] = useState<'basic' | 'privacy' | 'compliance' | 'dependencies'>('basic');

  useEffect(() => {
    if (asset) {
      setFormData({
        name: asset.name,
        type: asset.type,
        criticality: asset.criticality,
        owner: asset.owner,
        location: asset.location,
        ipAddress: asset.ipAddress || '',
        description: asset.description,
        complianceFrameworks: [...asset.complianceFrameworks],
        riskScore: asset.riskScore,
        tags: [...asset.tags],
        status: asset.status,
        relationships: asset.relationships,
        vulnerabilities: asset.vulnerabilities,
        lastAssessed: asset.lastAssessed,
        dataClassification: asset.dataClassification || 'Internal',
        dataTypes: asset.dataTypes || [],
        retentionPeriod: asset.retentionPeriod,
        legalBasis: asset.legalBasis || [],
        dataSubjectRights: asset.dataSubjectRights || [],
        crossBorderTransfer: asset.crossBorderTransfer || false,
        thirdPartySharing: asset.thirdPartySharing || false,
        encryptionStatus: asset.encryptionStatus || 'Unknown',
        accessControls: asset.accessControls || [],
        privacyImpactAssessment: asset.privacyImpactAssessment || null,
        dataBreachHistory: asset.dataBreachHistory || [],
        dependencies: asset.dependencies || [],
        requirements: asset.requirements || [],
      });
    } else {
      // Reset form for new asset
      setFormData({
        name: '',
        type: 'Server',
        criticality: 'Medium',
        owner: '',
        location: '',
        ipAddress: '',
        description: '',
        complianceFrameworks: [],
        riskScore: 50,
        tags: [],
        status: 'Active',
        relationships: [],
        vulnerabilities: [],
        lastAssessed: new Date(),
        dataClassification: 'Internal',
        dataTypes: [],
        retentionPeriod: undefined,
        legalBasis: [],
        dataSubjectRights: [],
        crossBorderTransfer: false,
        thirdPartySharing: false,
        encryptionStatus: 'Unknown',
        accessControls: [],
        privacyImpactAssessment: null,
        dataBreachHistory: [],
        dependencies: [],
        requirements: [],
      });
    }
    setErrors([]);
  }, [asset, isOpen]);

  const handleInputChange = (field: string, value: string | number | string[] | Date) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear errors for this field
    setErrors(prev => prev.filter(error => error.field !== field));
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const addComplianceFramework = () => {
    if (newFramework && !formData.complianceFrameworks.includes(newFramework)) {
      setFormData(prev => ({
        ...prev,
        complianceFrameworks: [...prev.complianceFrameworks, newFramework]
      }));
      setNewFramework('');
    }
  };

  const removeComplianceFramework = (frameworkToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      complianceFrameworks: prev.complianceFrameworks.filter(framework => framework !== frameworkToRemove)
    }));
  };

  const addDataType = () => {
    if (newDataType.trim() && !formData.dataTypes.includes(newDataType.trim())) {
      setFormData(prev => ({
        ...prev,
        dataTypes: [...prev.dataTypes, newDataType.trim()]
      }));
      setNewDataType('');
    }
  };

  const removeDataType = (dataTypeToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      dataTypes: prev.dataTypes.filter(dataType => dataType !== dataTypeToRemove)
    }));
  };

  const addLegalBasis = () => {
    if (newLegalBasis.trim() && !formData.legalBasis.includes(newLegalBasis.trim())) {
      setFormData(prev => ({
        ...prev,
        legalBasis: [...prev.legalBasis, newLegalBasis.trim()]
      }));
      setNewLegalBasis('');
    }
  };

  const removeLegalBasis = (legalBasisToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      legalBasis: prev.legalBasis.filter(legalBasis => legalBasis !== legalBasisToRemove)
    }));
  };

  const addDataSubjectRight = () => {
    if (newDataSubjectRight.trim() && !formData.dataSubjectRights.includes(newDataSubjectRight.trim())) {
      setFormData(prev => ({
        ...prev,
        dataSubjectRights: [...prev.dataSubjectRights, newDataSubjectRight.trim()]
      }));
      setNewDataSubjectRight('');
    }
  };

  const removeDataSubjectRight = (rightToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      dataSubjectRights: prev.dataSubjectRights.filter(right => right !== rightToRemove)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const validationErrors = validateAsset(formData);
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      setIsSubmitting(false);
      return;
    }

    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error('Error saving asset:', error);
      setErrors([{ field: 'general', message: 'Failed to save asset. Please try again.' }]);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getFieldError = (field: string) => {
    return errors.find(error => error.field === field)?.message;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-command-blue-600 to-action-cyan-500 px-6 py-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-outfit font-bold">
                {asset ? 'Edit Asset' : 'Add New Asset'}
              </h2>
              <p className="text-sm opacity-90">
                {asset ? 'Update asset information' : 'Create a new asset in your inventory'}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'basic', label: 'Basic Info' },
              { id: 'privacy', label: 'Privacy & Data' },
              { id: 'compliance', label: 'Compliance' },
              { id: 'dependencies', label: 'Dependencies' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-command-blue-500 text-command-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {errors.find(e => e.field === 'general') && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center">
              <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
              <span className="text-red-700">{getFieldError('general')}</span>
            </div>
          )}

          {/* Basic Information Tab */}
          {activeTab === 'basic' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-outfit font-semibold text-gray-900">Basic Information</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Asset Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-command-blue-500 ${
                    getFieldError('name') ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Enter asset name"
                />
                {getFieldError('name') && (
                  <p className="mt-1 text-sm text-red-600">{getFieldError('name')}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Asset Type *
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => handleInputChange('type', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-command-blue-500"
                >
                  {assetTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Criticality *
                </label>
                <select
                  value={formData.criticality}
                  onChange={(e) => handleInputChange('criticality', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-command-blue-500"
                >
                  {criticalityLevels.map(level => (
                    <option key={level} value={level}>{level}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Owner *
                </label>
                <input
                  type="text"
                  value={formData.owner}
                  onChange={(e) => handleInputChange('owner', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-command-blue-500 ${
                    getFieldError('owner') ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Enter asset owner"
                />
                {getFieldError('owner') && (
                  <p className="mt-1 text-sm text-red-600">{getFieldError('owner')}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Location *
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-command-blue-500 ${
                    getFieldError('location') ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Enter asset location"
                />
                {getFieldError('location') && (
                  <p className="mt-1 text-sm text-red-600">{getFieldError('location')}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  IP Address
                </label>
                <input
                  type="text"
                  value={formData.ipAddress}
                  onChange={(e) => handleInputChange('ipAddress', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-command-blue-500 ${
                    getFieldError('ipAddress') ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="192.168.1.100"
                />
                {getFieldError('ipAddress') && (
                  <p className="mt-1 text-sm text-red-600">{getFieldError('ipAddress')}</p>
                )}
              </div>
            </div>

            {/* Additional Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-outfit font-semibold text-gray-900">Additional Information</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={3}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-command-blue-500 ${
                    getFieldError('description') ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Enter asset description"
                />
                {getFieldError('description') && (
                  <p className="mt-1 text-sm text-red-600">{getFieldError('description')}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Risk Score (0-100)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={formData.riskScore}
                  onChange={(e) => handleInputChange('riskScore', parseInt(e.target.value) || 0)}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-command-blue-500 ${
                    getFieldError('riskScore') ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {getFieldError('riskScore') && (
                  <p className="mt-1 text-sm text-red-600">{getFieldError('riskScore')}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => handleInputChange('status', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-command-blue-500"
                >
                  {statusOptions.map(status => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tags
                </label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {formData.tags.map(tag => (
                    <span
                      key={tag}
                      className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-command-blue-100 text-command-blue-800"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="ml-1 text-command-blue-600 hover:text-command-blue-800"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex">
                  <input
                    type="text"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-command-blue-500"
                    placeholder="Add tag"
                  />
                  <button
                    type="button"
                    onClick={addTag}
                    className="px-4 py-2 bg-command-blue-600 text-white rounded-r-lg hover:bg-command-blue-700"
                  >
                    Add
                  </button>
                </div>
              </div>

              {/* Compliance Frameworks */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Compliance Frameworks
                </label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {formData.complianceFrameworks.map(framework => (
                    <span
                      key={framework}
                      className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800"
                    >
                      {framework}
                      <button
                        type="button"
                        onClick={() => removeComplianceFramework(framework)}
                        className="ml-1 text-green-600 hover:text-green-800"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex">
                  <select
                    value={newFramework}
                    onChange={(e) => setNewFramework(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-command-blue-500"
                  >
                    <option value="">Select framework</option>
                    {complianceFrameworks
                      .filter(framework => !formData.complianceFrameworks.includes(framework))
                      .map(framework => (
                        <option key={framework} value={framework}>{framework}</option>
                      ))}
                  </select>
                  <button
                    type="button"
                    onClick={addComplianceFramework}
                    disabled={!newFramework}
                    className="px-4 py-2 bg-green-600 text-white rounded-r-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Privacy & Data Tab */}
          {activeTab === 'privacy' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Data Classification *
                  </label>
                  <select
                    value={formData.dataClassification}
                    onChange={(e) => handleInputChange('dataClassification', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-command-blue-500"
                  >
                    <option value="Public">Public</option>
                    <option value="Internal">Internal</option>
                    <option value="Confidential">Confidential</option>
                    <option value="Restricted">Restricted</option>
                    <option value="Top Secret">Top Secret</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Encryption Status
                  </label>
                  <select
                    value={formData.encryptionStatus}
                    onChange={(e) => handleInputChange('encryptionStatus', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-command-blue-500"
                  >
                    <option value="Unknown">Unknown</option>
                    <option value="Encrypted">Encrypted</option>
                    <option value="Not Encrypted">Not Encrypted</option>
                    <option value="Partially Encrypted">Partially Encrypted</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Data Types
                </label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {formData.dataTypes.map(dataType => (
                    <span
                      key={dataType}
                      className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800"
                    >
                      {dataType}
                      <button
                        type="button"
                        onClick={() => removeDataType(dataType)}
                        className="ml-1 text-purple-600 hover:text-purple-800"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex">
                  <input
                    type="text"
                    value={newDataType}
                    onChange={(e) => setNewDataType(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addDataType())}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-command-blue-500"
                    placeholder="Add data type (e.g., PII, PHI, Financial)"
                  />
                  <button
                    type="button"
                    onClick={addDataType}
                    className="px-4 py-2 bg-purple-600 text-white rounded-r-lg hover:bg-purple-700"
                  >
                    Add
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Retention Period (days)
                  </label>
                  <input
                    type="number"
                    value={formData.retentionPeriod || ''}
                    onChange={(e) => handleInputChange('retentionPeriod', e.target.value ? parseInt(e.target.value) : undefined)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-command-blue-500"
                    placeholder="Enter retention period in days"
                  />
                </div>

                <div className="space-y-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.crossBorderTransfer}
                      onChange={(e) => handleInputChange('crossBorderTransfer', e.target.checked)}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700">Cross-Border Transfer</span>
                  </label>

                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.thirdPartySharing}
                      onChange={(e) => handleInputChange('thirdPartySharing', e.target.checked)}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700">Third Party Sharing</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Legal Basis for Processing
                </label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {formData.legalBasis.map(basis => (
                    <span
                      key={basis}
                      className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                    >
                      {basis}
                      <button
                        type="button"
                        onClick={() => removeLegalBasis(basis)}
                        className="ml-1 text-blue-600 hover:text-blue-800"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex">
                  <input
                    type="text"
                    value={newLegalBasis}
                    onChange={(e) => setNewLegalBasis(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addLegalBasis())}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-command-blue-500"
                    placeholder="Add legal basis (e.g., Consent, Contract, Legal Obligation)"
                  />
                  <button
                    type="button"
                    onClick={addLegalBasis}
                    className="px-4 py-2 bg-blue-600 text-white rounded-r-lg hover:bg-blue-700"
                  >
                    Add
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Data Subject Rights
                </label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {formData.dataSubjectRights.map(right => (
                    <span
                      key={right}
                      className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800"
                    >
                      {right}
                      <button
                        type="button"
                        onClick={() => removeDataSubjectRight(right)}
                        className="ml-1 text-green-600 hover:text-green-800"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex">
                  <input
                    type="text"
                    value={newDataSubjectRight}
                    onChange={(e) => setNewDataSubjectRight(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addDataSubjectRight())}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-command-blue-500"
                    placeholder="Add data subject right (e.g., Access, Rectification, Erasure)"
                  />
                  <button
                    type="button"
                    onClick={addDataSubjectRight}
                    className="px-4 py-2 bg-green-600 text-white rounded-r-lg hover:bg-green-700"
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Compliance Tab */}
          {activeTab === 'compliance' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-outfit font-semibold text-gray-900 mb-4">Compliance Frameworks</h3>
                <div className="flex flex-wrap gap-2 mb-2">
                  {formData.complianceFrameworks.map(framework => (
                    <span
                      key={framework}
                      className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800"
                    >
                      {framework}
                      <button
                        type="button"
                        onClick={() => removeComplianceFramework(framework)}
                        className="ml-1 text-green-600 hover:text-green-800"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex">
                  <select
                    value={newFramework}
                    onChange={(e) => setNewFramework(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-command-blue-500"
                  >
                    <option value="">Select framework</option>
                    {complianceFrameworks
                      .filter(framework => !formData.complianceFrameworks.includes(framework))
                      .map(framework => (
                        <option key={framework} value={framework}>{framework}</option>
                      ))}
                  </select>
                  <button
                    type="button"
                    onClick={addComplianceFramework}
                    disabled={!newFramework}
                    className="px-4 py-2 bg-green-600 text-white rounded-r-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Add
                  </button>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-outfit font-semibold text-gray-900 mb-4">Risk Assessment</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Risk Score (0-100)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={formData.riskScore}
                      onChange={(e) => handleInputChange('riskScore', parseInt(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-command-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Last Assessed
                    </label>
                    <input
                      type="date"
                      value={formData.lastAssessed.toISOString().split('T')[0]}
                      onChange={(e) => handleInputChange('lastAssessed', new Date(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-command-blue-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Dependencies Tab */}
          {activeTab === 'dependencies' && (
            <div className="space-y-6">
              <div className="text-center py-8 text-gray-500">
                <p>Dependency management will be implemented in the next phase.</p>
                <p className="text-sm">This will include visual dependency mapping and relationship management.</p>
              </div>
            </div>
          )}
        </form>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 flex justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="inline-flex items-center px-4 py-2 bg-command-blue-600 border border-transparent rounded-lg text-sm font-medium text-white hover:bg-command-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                {asset ? 'Update Asset' : 'Create Asset'}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};