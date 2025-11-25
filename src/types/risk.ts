// Risk assessment types

export type RiskLevel = 'Critical' | 'High' | 'Medium' | 'Low';

export interface Risk {
  readonly id: string;
  assetId: string;
  dependencyId?: string; // Link to dependency (new feature)
  name: string;
  description: string;
  likelihood: number; // 1-5 scale
  impact: number; // 1-5 scale
  riskScore: number; // calculated from likelihood and impact (0-100)
  level: RiskLevel;
  category?: string;
  source?: string;
  mitigationStatus?: 'Not Mitigated' | 'Partially Mitigated' | 'Fully Mitigated';
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface RiskFilters {
  assetId?: string;
  dependencyId?: string;
  level?: RiskLevel;
  category?: string;
  mitigationStatus?: string;
}

