import React from 'react';
import { Lock, Shield, Zap } from 'lucide-react';
import { NISTMapping, SecurityImpact } from '../../types/nist';

interface SecurityCategorizationWidgetProps {
  mapping: NISTMapping;
}

export const SecurityCategorizationWidget: React.FC<SecurityCategorizationWidgetProps> = ({ mapping }) => {
  const getImpactColor = (impact: SecurityImpact) => {
    switch (impact) {
      case 'high': return 'text-red-600';
      case 'moderate': return 'text-yellow-600';
      case 'low': return 'text-green-600';
    }
  };

  const getImpactBg = (impact: SecurityImpact) => {
    switch (impact) {
      case 'high': return 'bg-red-100';
      case 'moderate': return 'bg-yellow-100';
      case 'low': return 'bg-green-100';
    }
  };

  const renderImpactSection = (
    title: string,
    impact: SecurityImpact,
    icon: React.ReactNode
  ) => (
    <div className={`p-4 rounded-lg ${getImpactBg(impact)}`}>
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <h3 className="font-medium">{title}</h3>
      </div>
      <div className={`text-2xl font-bold ${getImpactColor(impact)} capitalize`}>
        {impact}
      </div>
    </div>
  );

  const lastReview = mapping.lastReview instanceof Date 
    ? mapping.lastReview 
    : new Date(mapping.lastReview);
  const nextReview = mapping.nextReview instanceof Date 
    ? mapping.nextReview 
    : new Date(mapping.nextReview);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold mb-4">FIPS 199 Security Categorization</h3>
      <div className="space-y-4">
        {renderImpactSection(
          'Confidentiality',
          mapping.securityCategorization.confidentiality,
          <Lock size={20} className={getImpactColor(mapping.securityCategorization.confidentiality)} />
        )}
        
        {renderImpactSection(
          'Integrity',
          mapping.securityCategorization.integrity,
          <Shield size={20} className={getImpactColor(mapping.securityCategorization.integrity)} />
        )}
        
        {renderImpactSection(
          'Availability',
          mapping.securityCategorization.availability,
          <Zap size={20} className={getImpactColor(mapping.securityCategorization.availability)} />
        )}
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex justify-between text-sm text-gray-500">
          <span>Last Review: {lastReview.toLocaleDateString()}</span>
          <span>Next Review: {nextReview.toLocaleDateString()}</span>
        </div>
      </div>
    </div>
  );
};

