import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Network, ArrowRight, AlertCircle } from 'lucide-react';
import { Asset, AssetRelationship } from '../types/asset';

interface AssetRelationshipModalProps {
  isOpen: boolean;
  onClose: () => void;
  asset: Asset;
  allAssets: Asset[];
  onSave: (relationships: AssetRelationship[]) => void;
}

export const AssetRelationshipModal: React.FC<AssetRelationshipModalProps> = ({
  isOpen,
  onClose,
  asset,
  allAssets,
  onSave,
}) => {
  const [relationships, setRelationships] = useState<AssetRelationship[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const relationshipTypes = ['Depends On', 'Connects To', 'Hosts', 'Manages', 'Accesses'];
  const strengthLevels = ['Strong', 'Medium', 'Weak'];

  useEffect(() => {
    if (asset) {
      setRelationships(asset.relationships || []);
    }
  }, [asset]);

  const addRelationship = () => {
    const newRelationship: AssetRelationship = {
      id: `rel-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      relatedAssetId: '',
      relatedAssetName: '',
      relationshipType: 'Depends On' as AssetRelationship['relationshipType'],
      strength: 'Medium' as AssetRelationship['strength'],
    };
    setRelationships([...relationships, newRelationship]);
  };

  const updateRelationship = (index: number, updates: Partial<AssetRelationship>) => {
    const updated = [...relationships];
    updated[index] = { ...updated[index], ...updates };
    
    // Update related asset name when asset ID changes
    if (updates.relatedAssetId) {
      const relatedAsset = allAssets.find(a => a.id === updates.relatedAssetId);
      if (relatedAsset) {
        updated[index].relatedAssetName = relatedAsset.name;
      }
    }
    
    setRelationships(updated);
  };

  const removeRelationship = (index: number) => {
    setRelationships(relationships.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    setIsSubmitting(true);
    try {
      const validRelationships = relationships.filter(rel => 
        rel.relatedAssetId && 
        rel.relatedAssetName && 
        rel.relatedAssetId !== asset.id // Prevent self-references
      );
      await onSave(validRelationships);
      onClose();
    } catch (error) {
      console.error('Error saving relationships:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const availableAssets = allAssets.filter(a => a.id !== asset.id);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-white bg-opacity-20 rounded-lg">
                <Network className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-xl font-outfit font-bold">Asset Relationships</h2>
                <p className="text-sm opacity-90">Manage relationships for {asset.name}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          <div className="space-y-6">
            {/* Current Asset Info */}
            <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
              <h3 className="font-medium text-indigo-900 mb-2">Current Asset</h3>
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-indigo-600 rounded-full"></div>
                <span className="font-medium text-indigo-800">{asset.name}</span>
                <span className="text-sm text-indigo-600">({asset.type})</span>
                <span className="text-sm text-indigo-600">• {asset.location}</span>
              </div>
            </div>

            {/* Available Assets Info */}
            {availableAssets.length === 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center">
                  <AlertCircle className="h-5 w-5 text-yellow-600 mr-2" />
                  <span className="text-yellow-800">No other assets available to create relationships with.</span>
                </div>
              </div>
            )}

            {/* Relationships List */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Relationships ({relationships.length})
                </h3>
                <button
                  onClick={addRelationship}
                  disabled={availableAssets.length === 0}
                  className="inline-flex items-center px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Relationship
                </button>
              </div>

              {relationships.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Network className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No relationships defined</p>
                  {availableAssets.length > 0 ? (
                    <p className="text-sm">Click "Add Relationship" to get started</p>
                  ) : (
                    <p className="text-sm">Add more assets to create relationships</p>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {relationships.map((relationship, index) => (
                    <div key={relationship.id || index} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                        {/* Related Asset */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Related Asset *
                          </label>
                          <select
                            value={relationship.relatedAssetId}
                            onChange={(e) => updateRelationship(index, { relatedAssetId: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          >
                            <option value="">Select asset</option>
                            {availableAssets.map(a => (
                              <option key={a.id} value={a.id}>
                                {a.name} ({a.type})
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Relationship Type */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Relationship Type *
                          </label>
                          <select
                            value={relationship.relationshipType}
                            onChange={(e) => updateRelationship(index, { relationshipType: e.target.value as AssetRelationship['relationshipType'] })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          >
                            {relationshipTypes.map(type => (
                              <option key={type} value={type}>{type}</option>
                            ))}
                          </select>
                        </div>

                        {/* Strength */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Strength
                          </label>
                          <select
                            value={relationship.strength}
                            onChange={(e) => updateRelationship(index, { strength: e.target.value as AssetRelationship['strength'] })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          >
                            {strengthLevels.map(strength => (
                              <option key={strength} value={strength}>{strength}</option>
                            ))}
                          </select>
                        </div>

                        {/* Actions */}
                        <div>
                          <button
                            onClick={() => removeRelationship(index)}
                            className="w-full px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center"
                            title="Remove relationship"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>

                      {/* Relationship Visualization */}
                      {relationship.relatedAssetName && (
                        <div className="mt-4 flex items-center justify-center space-x-3 text-sm text-gray-600 bg-white rounded-lg p-3 border">
                          <span className="font-medium text-indigo-600">{asset.name}</span>
                          <ArrowRight className="h-4 w-4 text-gray-400" />
                          <span className="text-indigo-600 font-medium">{relationship.relationshipType}</span>
                          <ArrowRight className="h-4 w-4 text-gray-400" />
                          <span className="font-medium text-indigo-600">{relationship.relatedAssetName}</span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            relationship.strength === 'Strong' ? 'bg-red-100 text-red-800' :
                            relationship.strength === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {relationship.strength}
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSubmitting}
            className="inline-flex items-center px-4 py-2 bg-indigo-600 border border-transparent rounded-lg text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Saving...
              </>
            ) : (
              <>
                <Network className="h-4 w-4 mr-2" />
                Save Relationships
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};