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
  });

  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newTag, setNewTag] = useState('');
  const [newFramework, setNewFramework] = useState('');

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

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {errors.find(e => e.field === 'general') && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center">
              <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
              <span className="text-red-700">{getFieldError('general')}</span>
            </div>
          )}

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
          </div>
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