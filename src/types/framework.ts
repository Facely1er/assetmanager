// Framework implementation tracking types

import { Asset, Risk, MitigationAction } from './index';
import { BusinessFunction, ContinuityPlan } from './business-impact';

export type FrameworkPhaseName = 'foundation' | 'development' | 'maturity' | 'optimization';
export type TaskStatus = 'pending' | 'in-progress' | 'completed';

export interface FrameworkPhase {
  readonly id: string;
  name: FrameworkPhaseName;
  progress: number; // 0-100
  tasks: {
    readonly id: string;
    name: string;
    status: TaskStatus;
    dueDate: Date | string;
    description?: string;
    assignedTo?: string;
  }[];
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface FrameworkMetrics {
  dependencyCoverageRatio: number; // 0-1
  riskMitigationRate: number; // 0-1
  meanTimeToRecovery: number; // hours
  dependencyVisibilityIndex: number; // 0-1
  technologyResilienceScore: number; // 0-100
}

export const calculateFrameworkMetrics = (
  assets: Asset[],
  risks: Risk[],
  mitigationActions: MitigationAction[],
  businessFunctions: BusinessFunction[],
  continuityPlans: ContinuityPlan[]
): FrameworkMetrics => {
  // Calculate Dependency Coverage Ratio
  const totalAssets = assets.length;
  const assetsWithDependencies = new Set(
    businessFunctions.flatMap(bf => bf.dependencies)
  ).size;
  const dependencyCoverageRatio = totalAssets > 0 ? assetsWithDependencies / totalAssets : 0;

  // Calculate Risk Mitigation Rate
  const highRisks = risks.filter(r => 
    r.level === 'Critical' || r.level === 'High' || 
    (r as any).criticality === 'Critical' || (r as any).criticality === 'High'
  );
  const mitigatedRisks = highRisks.filter(r => 
    mitigationActions.some(m => m.riskId === r.id && m.status === 'completed')
  );
  const riskMitigationRate = highRisks.length > 0 ? mitigatedRisks.length / highRisks.length : 1;

  // Calculate Mean Time To Recovery (based on continuity plans)
  const rtos = continuityPlans.map(p => p.rto);
  const meanTimeToRecovery = rtos.length > 0 
    ? rtos.reduce((sum, rto) => sum + rto, 0) / rtos.length 
    : 0;

  // Calculate Dependency Visibility Index
  const criticalAssets = assets.filter(a => a.criticality === 'Critical');
  const documentedCriticalAssets = criticalAssets.filter(a =>
    businessFunctions.some(bf => bf.dependencies.includes(a.id))
  );
  const dependencyVisibilityIndex = criticalAssets.length > 0 
    ? documentedCriticalAssets.length / criticalAssets.length 
    : 0;

  // Calculate Technology Resilience Score
  const resilienceScore = Math.round(
    (dependencyCoverageRatio * 25) +
    (riskMitigationRate * 25) +
    (Math.min(1, 24 / (meanTimeToRecovery || 24)) * 25) +
    (dependencyVisibilityIndex * 25)
  );

  return {
    dependencyCoverageRatio,
    riskMitigationRate,
    meanTimeToRecovery,
    dependencyVisibilityIndex,
    technologyResilienceScore: resilienceScore
  };
};

