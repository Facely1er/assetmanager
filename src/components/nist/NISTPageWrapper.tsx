import React, { useState, useEffect } from 'react';
import { NISTPage } from './NISTPage';
import { nistService } from '../../services/nistService';
import { NISTControl, NISTMapping, NISTAssessment } from '../../types/nist';
import { useAssetInventory } from '../../contexts/AssetInventoryContext';
import { LoadingSpinner } from '../LoadingSpinner';

export const NISTPageWrapper: React.FC = () => {
  const { assets } = useAssetInventory();
  const [controls, setControls] = useState<NISTControl[]>([]);
  const [mapping, setMapping] = useState<NISTMapping | null>(null);
  const [assessment, setAssessment] = useState<NISTAssessment | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [controlsData, mappingsData, assessmentsData] = await Promise.all([
        nistService.getControls(),
        nistService.getMappings(),
        nistService.getAssessments(),
      ]);
      
      setControls(controlsData);
      
      // Use first mapping and assessment, or create defaults
      if (mappingsData.length > 0) {
        setMapping(mappingsData[0]);
      } else if (assets.length > 0) {
        // Create default mapping for first asset
        const defaultMapping: NISTMapping = {
          id: 'default',
          assetId: assets[0].id,
          functions: ['identify', 'protect', 'detect', 'respond', 'recover'],
          controls: [],
          securityCategorization: {
            confidentiality: 'low',
            integrity: 'low',
            availability: 'low',
          },
          supplyChainTier: 1,
          lastReview: new Date().toISOString(),
          nextReview: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        setMapping(defaultMapping);
      }
      
      if (assessmentsData.length > 0) {
        setAssessment(assessmentsData[0]);
      } else if (assets.length > 0) {
        // Create default assessment
        const defaultAssessment: NISTAssessment = {
          id: 'default',
          assetId: assets[0].id,
          date: new Date().toISOString(),
          assessor: 'Security Team',
          overallScore: 0,
          functionScores: {
            identify: 0,
            protect: 0,
            detect: 0,
            respond: 0,
            recover: 0,
          },
          findings: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        setAssessment(defaultAssessment);
      }
    } catch (error) {
      console.error('Failed to load NIST data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" text="Loading NIST framework data..." />
      </div>
    );
  }

  if (!mapping || !assessment) {
    return (
      <div className="p-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">NIST Framework</h2>
          <p className="text-gray-600 mb-6">
            No assets available. Please add assets first to use NIST framework features.
          </p>
        </div>
      </div>
    );
  }

  return (
    <NISTPage
      assessment={assessment}
      mapping={mapping}
      controls={controls}
    />
  );
};

