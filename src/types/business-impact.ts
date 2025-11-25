// Business Impact Analysis (BIA) types

export type BusinessPriority = 'Critical' | 'High' | 'Medium' | 'Low';

export interface BusinessFunction {
  readonly id: string;
  name: string;
  description: string;
  owner: string;
  department: string;
  priority: BusinessPriority;
  mtd: number; // Maximum Tolerable Downtime in hours
  rto: number; // Recovery Time Objective in hours
  rpo: number; // Recovery Point Objective in hours
  annualRevenue?: number;
  regulatoryRequirements: string[];
  dependencies: string[]; // Asset IDs
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface BusinessImpact {
  readonly id: string;
  assetId: string;
  businessFunctionId: string;
  financialImpact: {
    hourlyRevenueLoss: number;
    recoveryCosts: number;
    reputationalCosts: number;
    penalties: number;
  };
  operationalImpact: {
    affectedUsers: number;
    affectedProcesses: number;
    workaroundAvailable: boolean;
    workaroundCost: number;
  };
  regulatoryImpact: {
    regulations: string[];
    penaltiesPerDay: number;
    reportingRequired: boolean;
  };
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface ContinuityPlan {
  readonly id: string;
  name: string;
  description: string;
  businessFunctionId: string;
  assetIds: string[];
  rto: number;
  rpo: number;
  steps: {
    readonly id: string;
    order: number;
    description: string;
    owner: string;
    estimatedDuration: number; // in hours
    dependencies: string[]; // Step IDs
  }[];
  contacts: {
    role: string;
    name: string;
    contact: string;
    priority: number;
  }[];
  resources: {
    type: string;
    description: string;
    quantity: number;
    location: string;
  }[];
  testSchedule: {
    lastTest: Date | string;
    nextTest: Date | string;
    frequency: number; // days
  };
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

