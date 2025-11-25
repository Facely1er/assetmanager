import React, { useState, useEffect } from 'react';
import { DependenciesMappingDashboard } from './DependenciesMappingDashboard';
import { DependencyList } from './DependencyList';
import { DependencyForm } from './DependencyForm';
import { Dependency, extractDependenciesFromAssets } from '../../types/dependency';
import { Asset, AssetRelationship } from '../../types/asset';
import { useAssetInventory } from '../../contexts/AssetInventoryContext';
import { assetService } from '../../services/assetService';
import toast from 'react-hot-toast';

export const DependenciesPage: React.FC = () => {
  const { assets, refreshAssets } = useAssetInventory();
  const [dependencies, setDependencies] = useState<Dependency[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedDependency, setSelectedDependency] = useState<Dependency | undefined>(undefined);
  const [activeTab, setActiveTab] = useState<'graph' | 'list'>('graph');

  // Extract dependencies from assets
  useEffect(() => {
    const extractedDeps = extractDependenciesFromAssets(assets);
    setDependencies(extractedDeps);
  }, [assets]);

  const handleAddDependency = () => {
    setSelectedDependency(undefined);
    setIsFormOpen(true);
  };

  const handleEditDependency = (dependency: Dependency) => {
    setSelectedDependency(dependency);
    setIsFormOpen(true);
  };

  const handleDeleteDependency = async (dependency: Dependency) => {
    if (!window.confirm(`Are you sure you want to delete the dependency between ${dependency.sourceName} and ${dependency.targetName}?`)) {
      return;
    }

    try {
      // Find the source asset and remove the relationship
      const sourceAsset = assets.find(a => a.id === dependency.sourceId);
      if (sourceAsset) {
        const updatedRelationships = sourceAsset.relationships.filter(
          rel => rel.id !== dependency.id
        );
        
        const updatedAsset = {
          ...sourceAsset,
          relationships: updatedRelationships,
        };

        await assetService.updateAsset(updatedAsset);
        await refreshAssets();
        toast.success('Dependency deleted successfully');
      }
    } catch (error) {
      console.error('Error deleting dependency:', error);
      toast.error('Failed to delete dependency');
    }
  };

  const handleSaveDependency = async (dependency: Dependency) => {
    try {
      const sourceAsset = assets.find(a => a.id === dependency.sourceId);
      const targetAsset = assets.find(a => a.id === dependency.targetId);

      if (!sourceAsset || !targetAsset) {
        toast.error('Invalid asset selection');
        return;
      }

      // Map strength back to AssetRelationship format
      const mapStrength = (strength: string): 'Strong' | 'Medium' | 'Weak' => {
        const s = strength.toLowerCase();
        if (s === 'critical' || s === 'high') return 'Strong';
        if (s === 'low') return 'Weak';
        return 'Medium';
      };

      const relationship: AssetRelationship = {
        id: dependency.id,
        relatedAssetId: dependency.targetId,
        relatedAssetName: dependency.targetName,
        relationshipType: dependency.type as AssetRelationship['relationshipType'],
        strength: mapStrength(dependency.strength),
        dataFlowDirection: dependency.dataFlowDirection || 'None',
        isPersonalData: dependency.isPersonalData || false,
        purpose: dependency.description || dependency.purpose || '',
      };

      // Check if this is an update or new relationship
      const existingIndex = sourceAsset.relationships.findIndex(r => r.id === dependency.id);
      
      let updatedRelationships: AssetRelationship[];
      if (existingIndex >= 0) {
        // Update existing relationship
        updatedRelationships = [...sourceAsset.relationships];
        updatedRelationships[existingIndex] = relationship;
      } else {
        // Add new relationship
        updatedRelationships = [...sourceAsset.relationships, relationship];
      }

      const updatedAsset = {
        ...sourceAsset,
        relationships: updatedRelationships,
      };

      await assetService.updateAsset(updatedAsset);
      await refreshAssets();
      setIsFormOpen(false);
      toast.success(`Dependency ${existingIndex >= 0 ? 'updated' : 'created'} successfully`);
    } catch (error) {
      console.error('Error saving dependency:', error);
      toast.error('Failed to save dependency');
    }
  };

  const handleCancel = () => {
    setIsFormOpen(false);
    setSelectedDependency(undefined);
  };

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center space-x-4 border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setActiveTab('graph')}
            className={`px-4 py-2 font-medium text-sm transition-colors ${
              activeTab === 'graph'
                ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            Graph View
          </button>
          <button
            onClick={() => setActiveTab('list')}
            className={`px-4 py-2 font-medium text-sm transition-colors ${
              activeTab === 'list'
                ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            List View
          </button>
        </div>
      </div>

      {/* Content */}
      {activeTab === 'graph' && (
        <DependenciesMappingDashboard />
      )}

      {activeTab === 'list' && (
        <>
          <DependencyList
            dependencies={dependencies}
            assets={assets}
            onAddDependency={handleAddDependency}
            onEditDependency={handleEditDependency}
            onDeleteDependency={handleDeleteDependency}
          />
        </>
      )}

      {/* Form Modal */}
      <DependencyForm
        dependency={selectedDependency}
        assets={assets}
        onSave={handleSaveDependency}
        onCancel={handleCancel}
        isOpen={isFormOpen}
      />
    </div>
  );
};

