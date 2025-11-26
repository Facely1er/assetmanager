import React, { useState, useEffect } from 'react';
import { FrameworkPage } from './FrameworkPage';
import { frameworkService } from '../../services/frameworkService';
import { FrameworkPhase } from '../../types/framework';
import { LoadingSpinner } from '../LoadingSpinner';
import { logger } from '../../utils/logger';

export const FrameworkPageWrapper: React.FC = () => {
  const [phases, setPhases] = useState<FrameworkPhase[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const phasesData = await frameworkService.getPhases();
      setPhases(phasesData);
    } catch (error) {
      logger.error('Failed to load framework data', error instanceof Error ? error : undefined);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" text="Loading framework data..." />
      </div>
    );
  }

  return <FrameworkPage phases={phases} />;
};

