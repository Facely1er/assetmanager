import React, { useState } from 'react';
import { X, Save, Users, MapPin, Tag, Shield, AlertCircle } from 'lucide-react';
import { Asset } from '../types/asset';
import { criticalityLevels, statusOptions } from '../data/sampleAssets';
import { logger } from '../utils/logger';

interface BulkEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedAssets: Asset[];
  onSave: (updates: Partial<Asset>) => void;
}

export const BulkEditModal: React.FC<BulkEditModalProps> = ({
  isOpen,
  onClose,
  selectedAssets,
  onSave,
}) => {
  const [updates, setUpdates] = useState<Partial<Asset & { addTags?: string }>>({});
  const [fieldsToUpdate, setFieldsToUpdate] = useState<Set<string>>(new Set());
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFieldToggle = (field: string) => {
    const newFields = new Set(fieldsToUpdate);
    if (newFields.has(field)) {
      newFields.delete(field);
      const newUpdates = { ...updates };
      delete newUpdates[field as keyof typeof updates];
      setUpdates(newUpdates);
    } else {
      newFields.add(field);
    }
    setFieldsToUpdate(newFields);
  };

  const handleSave = async () => {
    if (fieldsToUpdate.size === 0) return;
    
    setIsSubmitting(true);
    try {
      const filteredUpdates = Object.fromEntries(
        Object.entries(updates).filter(([key]) => fieldsToUpdate.has(key))
      );
      await onSave(filteredUpdates);
      onClose();
      setUpdates({});
      setFieldsToUpdate(new Set());
    } catch (error) {
      logger.error('Error saving bulk updates', error instanceof Error ? error : undefined);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    onClose();
    setUpdates({});
    setFieldsToUpdate(new Set());
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-command-blue-600 to-action-cyan-500 px-6 py-4 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-white bg-opacity-20 rounded-lg">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-xl font-outfit font-bold">Bulk Edit Assets</h2>
                <p className="text-sm opacity-90">Update {selectedAssets.length} selected assets</p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {selectedAssets.length === 0 ? (
            <div className="text-center py-8">
              <AlertCircle className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-600">No assets selected for bulk editing</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Selected Assets Preview */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-medium text-blue-900 mb-2">Selected Assets ({selectedAssets.length})</h3>
                <div className="max-h-32 overflow-y-auto">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {selectedAssets.slice(0, 10).map(asset => (
                      <div key={asset.id} className="text-sm text-blue-800 truncate">
                        • {asset.name} ({asset.type})
                      </div>
                    ))}
                    {selectedAssets.length > 10 && (
                      <div className="text-sm text-blue-600 italic">
                        ... and {selectedAssets.length - 10} more assets
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Owner */}
              <div className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  checked={fieldsToUpdate.has('owner')}
                  onChange={() => handleFieldToggle('owner')}
                  className="mt-2 h-4 w-4 text-command-blue-600 focus:ring-command-blue-500 border-gray-300 rounded"
                />
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <Users className="h-4 w-4 inline mr-1" />
                    Owner
                  </label>
                  <input
                    type="text"
                    value={updates.owner || ''}
                    onChange={(e) => setUpdates({ ...updates, owner: e.target.value })}
                    disabled={!fieldsToUpdate.has('owner')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-command-blue-500 disabled:bg-gray-100"
                    placeholder="Enter new owner"
                  />
                </div>
              </div>

              {/* Location */}
              <div className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  checked={fieldsToUpdate.has('location')}
                  onChange={() => handleFieldToggle('location')}
                  className="mt-2 h-4 w-4 text-command-blue-600 focus:ring-command-blue-500 border-gray-300 rounded"
                />
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <MapPin className="h-4 w-4 inline mr-1" />
                    Location
                  </label>
                  <input
                    type="text"
                    value={updates.location || ''}
                    onChange={(e) => setUpdates({ ...updates, location: e.target.value })}
                    disabled={!fieldsToUpdate.has('location')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-command-blue-500 disabled:bg-gray-100"
                    placeholder="Enter new location"
                  />
                </div>
              </div>

              {/* Criticality */}
              <div className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  checked={fieldsToUpdate.has('criticality')}
                  onChange={() => handleFieldToggle('criticality')}
                  className="mt-2 h-4 w-4 text-command-blue-600 focus:ring-command-blue-500 border-gray-300 rounded"
                />
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <Shield className="h-4 w-4 inline mr-1" />
                    Criticality
                  </label>
                  <select
                    value={updates.criticality || ''}
                    onChange={(e) => setUpdates({ ...updates, criticality: e.target.value as Asset['criticality'] })}
                    disabled={!fieldsToUpdate.has('criticality')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-command-blue-500 disabled:bg-gray-100"
                  >
                    <option value="">Select criticality</option>
                    {criticalityLevels.map(level => (
                      <option key={level} value={level}>{level}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Status */}
              <div className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  checked={fieldsToUpdate.has('status')}
                  onChange={() => handleFieldToggle('status')}
                  className="mt-2 h-4 w-4 text-command-blue-600 focus:ring-command-blue-500 border-gray-300 rounded"
                />
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    value={updates.status || ''}
                    onChange={(e) => setUpdates({ ...updates, status: e.target.value as Asset['status'] })}
                    disabled={!fieldsToUpdate.has('status')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-command-blue-500 disabled:bg-gray-100"
                  >
                    <option value="">Select status</option>
                    {statusOptions.map(status => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Add Tags */}
              <div className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  checked={fieldsToUpdate.has('addTags')}
                  onChange={() => handleFieldToggle('addTags')}
                  className="mt-2 h-4 w-4 text-command-blue-600 focus:ring-command-blue-500 border-gray-300 rounded"
                />
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <Tag className="h-4 w-4 inline mr-1" />
                    Add Tags
                  </label>
                  <input
                    type="text"
                    value={updates.addTags || ''}
                    onChange={(e) => setUpdates({ ...updates, addTags: e.target.value })}
                    disabled={!fieldsToUpdate.has('addTags')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-command-blue-500 disabled:bg-gray-100"
                    placeholder="Enter tags separated by commas"
                  />
                  <p className="text-xs text-gray-500 mt-1">Tags will be added to existing tags</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 flex justify-end space-x-3">
          <button
            onClick={handleClose}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={fieldsToUpdate.size === 0 || selectedAssets.length === 0 || isSubmitting}
            className="inline-flex items-center px-4 py-2 bg-command-blue-600 border border-transparent rounded-lg text-sm font-medium text-white hover:bg-command-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Updating...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Update {selectedAssets.length} Assets
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};