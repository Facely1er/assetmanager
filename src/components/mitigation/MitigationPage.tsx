import React, { useState } from 'react';
import { MitigationForm } from './MitigationForm';
import { MitigationList } from './MitigationList';
import { MitigationAction } from '../../types/mitigation';
import { Risk } from '../../types/risk';
import { Asset } from '../../types/asset';

interface MitigationPageProps {
  mitigationActions: MitigationAction[];
  risks: Risk[];
  assets?: Asset[];
  onAddAction: (action: MitigationAction) => void;
  onUpdateAction: (action: MitigationAction) => void;
}

export const MitigationPage: React.FC<MitigationPageProps> = ({
  mitigationActions,
  risks,
  assets = [],
  onAddAction,
  onUpdateAction,
}) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedAction, setSelectedAction] = useState<MitigationAction | undefined>(undefined);

  const handleAddAction = () => {
    setSelectedAction(undefined);
    setIsFormOpen(true);
  };

  const handleEditAction = (action: MitigationAction) => {
    setSelectedAction(action);
    setIsFormOpen(true);
  };

  const handleSaveAction = (action: MitigationAction) => {
    if (selectedAction) {
      onUpdateAction(action);
    } else {
      onAddAction(action);
    }
    setIsFormOpen(false);
  };

  const handleCancel = () => {
    setIsFormOpen(false);
  };

  // Calculate statistics
  const stats = {
    total: mitigationActions.length,
    pending: mitigationActions.filter(a => a.status === 'pending').length,
    inProgress: mitigationActions.filter(a => a.status === 'in-progress').length,
    completed: mitigationActions.filter(a => a.status === 'completed').length,
    overdue: mitigationActions.filter(a => {
      if (a.status === 'completed' || a.status === 'cancelled') return false;
      const dueDate = new Date(a.dueDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return dueDate < today;
    }).length,
    averageProgress: mitigationActions.length > 0
      ? Math.round(mitigationActions.reduce((sum, a) => sum + a.progress, 0) / mitigationActions.length)
      : 0,
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mitigation Planning</h1>
          <p className="text-gray-500">Plan and track risk mitigation actions</p>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Actions</p>
              <p className="text-3xl font-bold text-blue-600">{stats.total}</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">In Progress</p>
              <p className="text-3xl font-bold text-yellow-600">{stats.inProgress}</p>
            </div>
            <div className="p-3 bg-yellow-50 rounded-lg">
              <svg className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Completed</p>
              <p className="text-3xl font-bold text-green-600">{stats.completed}</p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Overdue</p>
              <p className="text-3xl font-bold text-red-600">{stats.overdue}</p>
            </div>
            <div className="p-3 bg-red-50 rounded-lg">
              <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <MitigationList
        mitigationActions={mitigationActions}
        risks={risks}
        assets={assets}
        onAddAction={handleAddAction}
        onEditAction={handleEditAction}
      />

      <MitigationForm
        action={selectedAction}
        risks={risks}
        assets={assets}
        onSave={handleSaveAction}
        onCancel={handleCancel}
        isOpen={isFormOpen}
      />
    </div>
  );
};

