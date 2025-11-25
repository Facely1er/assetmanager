import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Risk } from '../../types/risk';
import { Asset } from '../../types/asset';

interface RiskFormProps {
  risk?: Risk;
  assets: Asset[];
  dependencies?: Array<{ id: string; name: string }>; // Simplified dependency structure
  onSave: (risk: Risk) => void;
  onCancel: () => void;
  isOpen: boolean;
}

export const RiskForm: React.FC<RiskFormProps> = ({
  risk,
  assets,
  dependencies = [],
  onSave,
  onCancel,
  isOpen,
}) => {
  const [formData, setFormData] = useState<Partial<Risk>>({
    assetId: '',
    dependencyId: '',
    name: '',
    description: '',
    likelihood: 1,
    impact: 1,
    riskScore: 0,
    level: 'Low',
    category: '',
    source: '',
    mitigationStatus: 'Not Mitigated',
  });

  useEffect(() => {
    if (risk) {
      setFormData({
        ...risk,
      });
    } else {
      setFormData({
        assetId: assets.length > 0 ? assets[0].id : '',
        dependencyId: '',
        name: '',
        description: '',
        likelihood: 1,
        impact: 1,
        riskScore: 0,
        level: 'Low',
        category: '',
        source: '',
        mitigationStatus: 'Not Mitigated',
      });
    }
  }, [risk, assets]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleLikelihoodChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const likelihood = parseInt(e.target.value, 10);
    const impact = formData.impact || 1;
    const riskScore = likelihood * impact * 4; // Scale to 0-100 (1-5 * 1-5 * 4)
    const level = riskScore >= 80 ? 'Critical' :
                  riskScore >= 60 ? 'High' :
                  riskScore >= 40 ? 'Medium' : 'Low';

    setFormData(prev => ({
      ...prev,
      likelihood,
      riskScore,
      level,
    }));
  };

  const handleImpactChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const impact = parseInt(e.target.value, 10);
    const likelihood = formData.likelihood || 1;
    const riskScore = likelihood * impact * 4; // Scale to 0-100
    const level = riskScore >= 80 ? 'Critical' :
                  riskScore >= 60 ? 'High' :
                  riskScore >= 40 ? 'Medium' : 'Low';

    setFormData(prev => ({
      ...prev,
      impact,
      riskScore,
      level,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.assetId || !formData.name) {
      alert('Please fill in all required fields.');
      return;
    }
    
    const now = new Date().toISOString();
    
    onSave({
      id: risk?.id || `risk-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      assetId: formData.assetId || '',
      dependencyId: formData.dependencyId,
      name: formData.name || '',
      description: formData.description || '',
      likelihood: formData.likelihood || 1,
      impact: formData.impact || 1,
      riskScore: formData.riskScore || 0,
      level: formData.level || 'Low',
      category: formData.category,
      source: formData.source,
      mitigationStatus: formData.mitigationStatus || 'Not Mitigated',
      createdAt: risk?.createdAt || now,
      updatedAt: now,
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center border-b border-gray-200 px-6 py-4">
          <h2 className="text-xl font-semibold text-gray-800">
            {risk ? 'Edit Risk' : 'Add New Risk'}
          </h2>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="col-span-2">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Risk Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            
            <div>
              <label htmlFor="assetId" className="block text-sm font-medium text-gray-700 mb-1">
                Asset *
              </label>
              <select
                id="assetId"
                name="assetId"
                value={formData.assetId}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="" disabled>Select an asset</option>
                {assets.map((asset) => (
                  <option key={asset.id} value={asset.id}>{asset.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="dependencyId" className="block text-sm font-medium text-gray-700 mb-1">
                Dependency (Optional)
              </label>
              <select
                id="dependencyId"
                name="dependencyId"
                value={formData.dependencyId || ''}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">No dependency</option>
                {dependencies.map((dep) => (
                  <option key={dep.id} value={dep.id}>{dep.name}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label htmlFor="likelihood" className="block text-sm font-medium text-gray-700 mb-1">
                Likelihood: {formData.likelihood} (1-5)
              </label>
              <input
                type="range"
                id="likelihood"
                name="likelihood"
                min="1"
                max="5"
                value={formData.likelihood}
                onChange={handleLikelihoodChange}
                className="w-full"
              />
            </div>
            
            <div>
              <label htmlFor="impact" className="block text-sm font-medium text-gray-700 mb-1">
                Impact: {formData.impact} (1-5)
              </label>
              <input
                type="range"
                id="impact"
                name="impact"
                min="1"
                max="5"
                value={formData.impact}
                onChange={handleImpactChange}
                className="w-full"
              />
            </div>

            <div>
              <label htmlFor="level" className="block text-sm font-medium text-gray-700 mb-1">
                Risk Level
              </label>
              <select
                id="level"
                name="level"
                value={formData.level}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Critical">Critical</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>

            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <input
                type="text"
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Security, Operational"
              />
            </div>
            
            <div className="col-span-2">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="col-span-2">
              <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                <div className="text-sm">
                  <div className="font-medium text-blue-900 mb-1">Calculated Risk Score: {formData.riskScore}/100</div>
                  <div className="text-blue-700">Risk Level: <span className="font-medium">{formData.level}</span></div>
                </div>
              </div>
            </div>
          </div>
          
          {risk && (
            <div className="flex justify-between mb-4 text-xs text-gray-500">
              <div>Created: {new Date(risk.createdAt).toLocaleString()}</div>
              <div>Updated: {new Date(risk.updatedAt).toLocaleString()}</div>
            </div>
          )}
          
          <div className="flex justify-end gap-2 mt-6">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              {risk ? 'Update Risk' : 'Add Risk'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

