import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { MitigationAction } from '../../types/mitigation';
import { Risk } from '../../types/risk';
import { Asset } from '../../types/asset';

interface MitigationFormProps {
  action?: MitigationAction;
  risks: Risk[];
  assets?: Asset[];
  onSave: (action: MitigationAction) => void;
  onCancel: () => void;
  isOpen: boolean;
}

export const MitigationForm: React.FC<MitigationFormProps> = ({
  action,
  risks,
  assets = [],
  onSave,
  onCancel,
  isOpen,
}) => {
  const [formData, setFormData] = useState<Partial<MitigationAction>>({
    riskId: '',
    name: '',
    description: '',
    assignee: '',
    dueDate: '',
    status: 'pending',
    progress: 0,
    priority: 'Medium',
  });

  useEffect(() => {
    if (action) {
      const dueDate = action.dueDate instanceof Date 
        ? action.dueDate.toISOString().split('T')[0]
        : new Date(action.dueDate).toISOString().split('T')[0];
      
      setFormData({
        ...action,
        dueDate,
      });
    } else {
      const today = new Date();
      const oneMonthLater = new Date();
      oneMonthLater.setMonth(today.getMonth() + 1);
      
      setFormData({
        riskId: risks.length > 0 ? risks[0].id : '',
        name: '',
        description: '',
        assignee: '',
        dueDate: oneMonthLater.toISOString().split('T')[0],
        status: 'pending',
        progress: 0,
        priority: 'Medium',
      });
    }
  }, [action, risks]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    
    if (name === 'progress') {
      const numValue = Math.min(100, Math.max(0, parseInt(value, 10) || 0));
      setFormData(prev => ({
        ...prev,
        [name]: numValue,
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const status = e.target.value as MitigationAction['status'];
    let progress = formData.progress || 0;
    
    if (status === 'pending') progress = 0;
    else if (status === 'completed') progress = 100;
    
    setFormData(prev => ({
      ...prev,
      status,
      progress,
    }));
  };

  const getRiskName = (id: string) => {
    const risk = risks.find(r => r.id === id);
    return risk ? risk.name : 'Unknown Risk';
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.riskId || !formData.name || !formData.assignee || !formData.dueDate) {
      alert('Please fill in all required fields.');
      return;
    }
    
    const dueDate = new Date(formData.dueDate || '');
    dueDate.setHours(23, 59, 59);
    
    const now = new Date().toISOString();
    
    onSave({
      id: action?.id || `mitigation-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      riskId: formData.riskId || '',
      assetId: formData.assetId,
      dependencyId: formData.dependencyId,
      name: formData.name || '',
      description: formData.description || '',
      assignee: formData.assignee || '',
      dueDate: dueDate.toISOString(),
      status: formData.status || 'pending',
      progress: formData.progress || 0,
      priority: formData.priority || 'Medium',
      estimatedCost: formData.estimatedCost,
      actualCost: formData.actualCost,
      notes: formData.notes,
      createdAt: action?.createdAt || now,
      updatedAt: now,
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center border-b border-gray-200 px-6 py-4">
          <h2 className="text-xl font-semibold text-gray-800">
            {action ? 'Edit Mitigation Action' : 'Add New Mitigation Action'}
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
                Action Name *
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
              <label htmlFor="riskId" className="block text-sm font-medium text-gray-700 mb-1">
                Related Risk *
              </label>
              <select
                id="riskId"
                name="riskId"
                value={formData.riskId}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="" disabled>Select a risk</option>
                {risks.map((risk) => (
                  <option key={risk.id} value={risk.id}>{risk.name}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label htmlFor="assignee" className="block text-sm font-medium text-gray-700 mb-1">
                Assignee *
              </label>
              <input
                type="text"
                id="assignee"
                name="assignee"
                value={formData.assignee}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            
            <div>
              <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700 mb-1">
                Due Date *
              </label>
              <input
                type="date"
                id="dueDate"
                name="dueDate"
                value={formData.dueDate}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                Status *
              </label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleStatusChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="pending">Pending</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <div>
              <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-1">
                Priority
              </label>
              <select
                id="priority"
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Critical">Critical</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
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
              <label htmlFor="progress" className="block text-sm font-medium text-gray-700 mb-1">
                Progress: {formData.progress}%
              </label>
              <input
                type="range"
                id="progress"
                name="progress"
                min="0"
                max="100"
                step="5"
                value={formData.progress}
                onChange={handleChange}
                className="w-full"
              />
              <div className="mt-1 flex justify-between text-xs text-gray-500">
                <span>0%</span>
                <span>50%</span>
                <span>100%</span>
              </div>
            </div>
          </div>
          
          {action && (
            <div className="flex justify-between mb-4 text-xs text-gray-500">
              <div>Created: {new Date(action.createdAt).toLocaleString()}</div>
              <div>Updated: {new Date(action.updatedAt).toLocaleString()}</div>
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
              {action ? 'Update Action' : 'Add Action'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

