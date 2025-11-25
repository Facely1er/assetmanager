// NIST Cybersecurity Framework types

import { Asset } from './asset';

export type NISTFunction = 'identify' | 'protect' | 'detect' | 'respond' | 'recover';
export type SecurityImpact = 'low' | 'moderate' | 'high';
export type ControlStatus = 'implemented' | 'partially-implemented' | 'planned' | 'not-implemented';
export type ComplianceStatus = 'compliant' | 'non-compliant' | 'partially-compliant';

export interface NISTControl {
  readonly id: string;
  family: string;
  number: string;
  title: string;
  description: string;
  priority: number;
  baselineImpact: SecurityImpact[];
  relatedControls: string[]; // Control IDs
  status: ControlStatus;
  implementationDetails?: string;
  lastAssessment?: Date | string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export interface NISTMapping {
  readonly id: string;
  assetId: string;
  functions: NISTFunction[];
  controls: string[]; // Control IDs
  securityCategorization: {
    confidentiality: SecurityImpact;
    integrity: SecurityImpact;
    availability: SecurityImpact;
  };
  supplyChainTier: number;
  lastReview: Date | string;
  nextReview: Date | string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface NISTAssessment {
  readonly id: string;
  assetId: string;
  date: Date | string;
  assessor: string;
  overallScore: number; // 0-100
  functionScores: Record<NISTFunction, number>;
  findings: {
    controlId: string;
    status: ComplianceStatus;
    evidence: string;
    remediation?: string;
  }[];
  createdAt: Date | string;
  updatedAt: Date | string;
}

// Helper functions
export const calculateSecurityCategorization = (
  asset: Asset,
  mapping: NISTMapping
): SecurityImpact => {
  const { confidentiality, integrity, availability } = mapping.securityCategorization;
  const impacts = [confidentiality, integrity, availability];
  
  if (impacts.includes('high')) return 'high';
  if (impacts.includes('moderate')) return 'moderate';
  return 'low';
};

export const calculateNISTComplianceScore = (
  assessment: NISTAssessment,
  controls: NISTControl[]
): number => {
  const implementedControls = assessment.findings.filter(
    f => f.status === 'compliant'
  ).length;
  
  const partialControls = assessment.findings.filter(
    f => f.status === 'partially-compliant'
  ).length;
  
  const totalControls = controls.length;
  
  if (totalControls === 0) return 0;
  
  return Math.round(
    ((implementedControls + (partialControls * 0.5)) / totalControls) * 100
  );
};

