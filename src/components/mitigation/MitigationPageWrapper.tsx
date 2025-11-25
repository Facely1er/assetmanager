import React, { useState, useEffect } from 'react';
import { MitigationPage } from './MitigationPage';
import { mitigationService } from '../../services/mitigationService';
import { riskService } from '../../services/riskService';
import { MitigationAction } from '../../types/mitigation';
import { Risk } from '../../types/risk';
import { useAssetInventory } from '../../contexts/AssetInventoryContext';
import { LoadingSpinner } from '../LoadingSpinner';

export const MitigationPageWrapper: React.FC = () => {
  const { assets } = useAssetInventory();
  const [mitigationActions, setMitigationActions] = useState<MitigationAction[]>([]);
  const [risks, setRisks] = useState<Risk[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [actions, risksData] = await Promise.all([
        mitigationService.getAll(),
        riskService.getAll(),
      ]);
      setMitigationActions(actions);
      setRisks(risksData);
    } catch (error) {
      console.error('Failed to load mitigation data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddAction = async (action: MitigationAction) => {
    try {
      const created = await mitigationService.create(action);
      if (created) {
        setMitigationActions([...mitigationActions, created]);
      }
    } catch (error) {
      console.error('Failed to add mitigation action:', error);
    }
  };

  const handleUpdateAction = async (action: MitigationAction) => {
    try {
      const updated = await mitigationService.update(action.id, action);
      if (updated) {
        setMitigationActions(mitigationActions.map(a => a.id === action.id ? updated : a));
      }
    } catch (error) {
      console.error('Failed to update mitigation action:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" text="Loading mitigation actions..." />
      </div>
    );
  }

  return (
    <MitigationPage
      mitigationActions={mitigationActions}
      risks={risks}
      assets={assets}
      onAddAction={handleAddAction}
      onUpdateAction={handleUpdateAction}
    />
  );
};

