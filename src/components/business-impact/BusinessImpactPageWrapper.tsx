import React, { useState, useEffect } from 'react';
import { BusinessImpactPage } from './BusinessImpactPage';
import { businessImpactService } from '../../services/businessImpactService';
import { BusinessFunction, BusinessImpact } from '../../types/business-impact';
import { useAssetInventory } from '../../contexts/AssetInventoryContext';
import { LoadingSpinner } from '../LoadingSpinner';

export const BusinessImpactPageWrapper: React.FC = () => {
  const { assets } = useAssetInventory();
  const [businessFunctions, setBusinessFunctions] = useState<BusinessFunction[]>([]);
  const [businessImpacts, setBusinessImpacts] = useState<BusinessImpact[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [functions, impacts] = await Promise.all([
        businessImpactService.getBusinessFunctions(),
        businessImpactService.getBusinessImpacts(),
      ]);
      setBusinessFunctions(functions);
      setBusinessImpacts(impacts);
    } catch (error) {
      console.error('Failed to load business impact data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" text="Loading business impact data..." />
      </div>
    );
  }

  return (
    <BusinessImpactPage
      assets={assets}
      businessFunctions={businessFunctions}
      businessImpacts={businessImpacts}
    />
  );
};

