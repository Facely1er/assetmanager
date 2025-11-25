// Mitigation Action types for risk mitigation planning and tracking

export type MitigationStatus = 'pending' | 'in-progress' | 'completed' | 'cancelled';

export interface MitigationAction {
  readonly id: string;
  riskId: string;
  assetId?: string; // Optional link to asset
  dependencyId?: string; // Optional link to dependency
  name: string;
  description: string;
  assignee: string;
  dueDate: Date | string;
  status: MitigationStatus;
  progress: number; // 0-100
  priority?: 'Critical' | 'High' | 'Medium' | 'Low';
  estimatedCost?: number;
  actualCost?: number;
  notes?: string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface MitigationFilters {
  riskId?: string;
  assetId?: string;
  status?: MitigationStatus;
  assignee?: string;
  priority?: string;
  overdue?: boolean;
}

