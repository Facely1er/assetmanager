import React, { useState } from 'react';
import { Building2, Download, RefreshCw, Info, CheckCircle } from 'lucide-react';
import { INVENTORY_SCENARIOS, generateAssetInventory } from '../data/assetGenerators';
import { Asset } from '../types/asset';
import { exportToCSV } from '../utils/assetUtils';
import { toast } from 'react-hot-toast';
import { logger } from '../utils/logger';

interface InventoryGeneratorProps {
  onInventoryGenerated: (assets: Asset[], scenarioName: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

export const InventoryGenerator: React.FC<InventoryGeneratorProps> = ({
  onInventoryGenerated,
  isOpen,
  onClose
}) => {
  const [selectedScenario, setSelectedScenario] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedAssets, setGeneratedAssets] = useState<Asset[]>([]);

  const handleGenerate = async () => {
    if (!selectedScenario) {
      toast.error('Please select a scenario');
      return;
    }

    setIsGenerating(true);
    try {
      // Add a small delay to show loading state
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const assets = generateAssetInventory(selectedScenario);
      const scenario = INVENTORY_SCENARIOS.find(s => s.id === selectedScenario);
      
      setGeneratedAssets(assets);
      onInventoryGenerated(assets, scenario?.name || selectedScenario);
      
      toast.success(`Generated ${assets.length} assets for ${scenario?.name}`);
    } catch (error) {
      toast.error('Failed to generate inventory');
      logger.error('Generation error', error instanceof Error ? error : undefined);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleExport = async () => {
    if (generatedAssets.length === 0) {
      toast.error('No assets to export');
      return;
    }

    try {
      await exportToCSV(generatedAssets);
      toast.success('Inventory exported successfully');
    } catch {
      toast.error('Failed to export inventory');
    }
  };

  const handleLoadToInventory = () => {
    if (generatedAssets.length === 0) {
      toast.error('No assets to load');
      return;
    }

    const scenario = INVENTORY_SCENARIOS.find(s => s.id === selectedScenario);
    onInventoryGenerated(generatedAssets, scenario?.name || selectedScenario);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-command-blue-600 to-action-cyan-500 px-6 py-4 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-white bg-opacity-20 rounded-lg">
                <Building2 className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-xl font-outfit font-bold">Asset Inventory Generator</h2>
                <p className="text-sm opacity-90">Generate realistic asset inventories for different scenarios</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
            >
              ×
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Scenario Selection */}
            <div>
              <h3 className="text-lg font-outfit font-semibold text-gray-900 mb-4">
                Select Scenario
              </h3>
              <div className="space-y-3">
                {INVENTORY_SCENARIOS.map((scenario) => (
                  <div
                    key={scenario.id}
                    className={`p-5 border-2 rounded-xl cursor-pointer transition-all ${
                      selectedScenario === scenario.id
                        ? 'border-command-blue-500 bg-command-blue-50 shadow-md'
                        : 'border-gray-200 hover:border-gray-300 hover:shadow-sm bg-white'
                    }`}
                    onClick={() => setSelectedScenario(scenario.id)}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-start space-x-3 flex-1">
                      <input
                        type="radio"
                        checked={selectedScenario === scenario.id}
                        onChange={() => setSelectedScenario(scenario.id)}
                        className="mt-1 h-5 w-5 text-command-blue-600 focus:ring-command-blue-500 cursor-pointer"
                        aria-label={`Select ${scenario.name} scenario`}
                      />
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 mb-1">{scenario.name}</h4>
                          <p className="text-sm text-gray-600 leading-relaxed">{scenario.description}</p>
                          <div className="flex items-center mt-3">
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">
                              ~{scenario.assetCount} assets
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="flex flex-wrap gap-2">
                        {scenario.characteristics.map((char) => (
                          <span
                            key={char}
                            className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200"
                          >
                            {char}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Preview and Actions */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <h3 className="text-lg font-outfit font-semibold text-gray-900 mb-6">
                Preview & Actions
              </h3>
              
              {selectedScenario && (
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-5 mb-6 border border-blue-100">
                  <div className="flex items-center mb-3">
                    <div className="p-2 bg-blue-100 rounded-lg mr-3">
                      <Info className="h-5 w-5 text-blue-600" />
                    </div>
                    <span className="text-sm font-semibold text-gray-900">Scenario Details</span>
                  </div>
                  {(() => {
                    const scenario = INVENTORY_SCENARIOS.find(s => s.id === selectedScenario);
                    return scenario ? (
                      <div className="text-sm text-gray-700 space-y-2">
                        <p className="leading-relaxed">{scenario.description}</p>
                        <div className="pt-2 border-t border-blue-200 space-y-1">
                          <p><span className="font-semibold">Expected Assets:</span> ~{scenario.assetCount}</p>
                          <p><span className="font-semibold">Characteristics:</span> {scenario.characteristics.join(', ')}</p>
                        </div>
                      </div>
                    ) : null;
                  })()}
                </div>
              )}

              <div className="space-y-4">
                <button
                  onClick={handleGenerate}
                  disabled={!selectedScenario || isGenerating}
                  className="w-full flex items-center justify-center px-6 py-4 bg-command-blue-600 text-white rounded-xl hover:bg-command-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg font-semibold text-base"
                >
                  {isGenerating ? (
                    <>
                      <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="h-5 w-5 mr-2" />
                      Generate Inventory
                    </>
                  )}
                </button>

                {generatedAssets.length > 0 && (
                  <>
                    <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4">
                      <div className="flex items-center">
                        <div className="p-2 bg-green-100 rounded-lg mr-3">
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-green-900">
                            Generated {generatedAssets.length} assets successfully
                          </p>
                          <p className="text-xs text-green-700 mt-0.5">Ready to load into inventory</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex space-x-3">
                      <button
                        onClick={handleExport}
                        className="flex-1 flex items-center justify-center px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all font-medium"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Export CSV
                      </button>
                      
                      <button
                        onClick={handleLoadToInventory}
                        className="flex-1 flex items-center justify-center px-4 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all shadow-md hover:shadow-lg font-semibold"
                      >
                        Load to Inventory
                      </button>
                    </div>
                  </>
                )}
              </div>

              {generatedAssets.length > 0 && (
                <div className="mt-6">
                  <h4 className="text-sm font-medium text-gray-900 mb-3">Asset Summary</h4>
                  <div className="space-y-2">
                    {(() => {
                      const summary = generatedAssets.reduce((acc, asset) => {
                        acc[asset.type] = (acc[asset.type] || 0) + 1;
                        return acc;
                      }, {} as Record<string, number>);

                      return Object.entries(summary).map(([type, count]) => (
                        <div key={type} className="flex justify-between text-sm">
                          <span className="text-gray-600">{type}</span>
                          <span className="font-medium">{count}</span>
                        </div>
                      ));
                    })()}
                  </div>
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
            Close
          </button>
        </div>
      </div>
    </div>
  );
};