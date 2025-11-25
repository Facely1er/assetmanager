import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Dependency } from '../../types/dependency';
import { Asset } from '../../types/asset';
import toast from 'react-hot-toast';

interface DependencyFormProps {
  dependency?: Dependency;
  assets: Asset[];
  onSave: (dependency: Dependency) => void;
  onCancel: () => void;
  isOpen: boolean;
}

export const DependencyForm: React.FC<DependencyFormProps> = ({ 
  dependency, 
  assets,
  onSave, 
  onCancel, 
  isOpen 
}) => {
  const [formData, setFormData] = useState<Partial<Dependency>>({
    sourceId: '',
    targetId: '',
    description: '',
    type: 'Depends On',
    strength: 'medium',
  });

  // Relationship types matching AssetRelationship
  const dependencyTypes = [
    'Depends On',
    'Connects To',
    'Hosts',
    'Manages',
    'Accesses',
    'Processes',
    'Stores',
    'Transmits',
    'Shares',
    'Backs Up',
    'Replicates',
    'Synchronizes',
  ];

  useEffect(() => {
    if (dependency) {
      setFormData(dependency);
    } else {
      setFormData({
        sourceId: assets.length > 0 ? assets[0].id : '',
        targetId: assets.length > 1 ? assets[1].id : assets.length > 0 ? assets[0].id : '',
        description: '',
        type: 'Depends On',
        strength: 'medium',
      });
    }
  }, [dependency, assets]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.sourceId || !formData.targetId || !formData.type) {
      toast.error('Please fill in all required fields.');
      return;
    }
    
    // Validate source and target are different
    if (formData.sourceId === formData.targetId) {
      toast.error('Source and target assets must be different.');
      return;
    }

    const sourceAsset = assets.find(a => a.id === formData.sourceId);
    const targetAsset = assets.find(a => a.id === formData.targetId);
    
    if (!sourceAsset || !targetAsset) {
      toast.error('Invalid asset selection.');
      return;
    }
    
    onSave({
      id: dependency?.id || `dep-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      sourceId: formData.sourceId || '',
      sourceName: sourceAsset.name,
      targetId: formData.targetId || '',
      targetName: targetAsset.name,
      description: formData.description || '',
      type: formData.type || 'Depends On',
      strength: (formData.strength || 'medium') as 'critical' | 'high' | 'medium' | 'low',
      dataFlowDirection: formData.dataFlowDirection,
      isPersonalData: formData.isPersonalData,
      purpose: formData.description,
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-700 px-6 py-4">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
            {dependency ? 'Edit Dependency' : 'Add New Dependency'}
          </h2>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label htmlFor="sourceId" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Source Asset *
              </label>
              <select
                id="sourceId"
                name="sourceId"
                value={formData.sourceId}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                required
              >
                <option value="" disabled>Select source asset</option>
                {assets.map((asset) => (
                  <option key={asset.id} value={asset.id}>{asset.name}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label htmlFor="targetId" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Target Asset *
              </label>
              <select
                id="targetId"
                name="targetId"
                value={formData.targetId}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                required
              >
                <option value="" disabled>Select target asset</option>
                {assets.map((asset) => (
                  <option key={asset.id} value={asset.id}>{asset.name}</option>
                ))}
              </select>
              {formData.sourceId === formData.targetId && formData.sourceId && (
                <p className="text-red-500 text-xs mt-1">Source and target cannot be the same asset</p>
              )}
            </div>
            
            <div>
              <label htmlFor="type" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Dependency Type *
              </label>
              <select
                id="type"
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                required
              >
                <option value="" disabled>Select dependency type</option>
                {dependencyTypes.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label htmlFor="strength" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Dependency Strength *
              </label>
              <select
                id="strength"
                name="strength"
                value={formData.strength}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                required
              >
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>

            <div>
              <label htmlFor="dataFlowDirection" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Data Flow Direction
              </label>
              <select
                id="dataFlowDirection"
                name="dataFlowDirection"
                value={formData.dataFlowDirection || 'None'}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="None">None</option>
                <option value="Inbound">Inbound</option>
                <option value="Outbound">Outbound</option>
                <option value="Bidirectional">Bidirectional</option>
              </select>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="isPersonalData"
                name="isPersonalData"
                checked={formData.isPersonalData || false}
                onChange={(e) => setFormData({ ...formData, isPersonalData: e.target.checked })}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <label htmlFor="isPersonalData" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                Contains Personal Data
              </label>
            </div>
            
            <div className="col-span-2">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Description / Purpose
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description || ''}
                onChange={handleChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                placeholder="Describe the purpose and nature of this dependency..."
              />
            </div>
          </div>
          
          <div className="flex justify-end gap-2 mt-6">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
            >
              {dependency ? 'Update Dependency' : 'Add Dependency'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

