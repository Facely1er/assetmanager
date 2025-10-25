export interface Asset {
  id: string;
  name: string;
  type: 'Server' | 'Database' | 'Application' | 'Network' | 'Endpoint' | 'Cloud Service' | 'Information Asset' | 'Data Repository' | 'API' | 'File System' | 'Document' | 'Personal Data' | 'Sensitive Data' | 'Business Process' | 'Third Party Service';
  criticality: 'Critical' | 'High' | 'Medium' | 'Low';
  owner: string;
  location: string;
  ipAddress?: string;
  description: string;
  complianceFrameworks: string[];
  riskScore: number;
  lastAssessed: Date;
  tags: string[];
  relationships: AssetRelationship[];
  vulnerabilities: Vulnerability[];
  status: 'Active' | 'Inactive' | 'Retired' | 'Planned';
  createdAt: Date;
  updatedAt: Date;
  // Privacy and compliance specific fields
  dataClassification: 'Public' | 'Internal' | 'Confidential' | 'Restricted' | 'Top Secret';
  dataTypes: string[]; // e.g., ['PII', 'PHI', 'Financial', 'Intellectual Property']
  retentionPeriod?: number; // in days
  legalBasis: string[]; // GDPR legal basis for processing
  dataSubjectRights: string[]; // Rights applicable to this data
  crossBorderTransfer: boolean;
  thirdPartySharing: boolean;
  encryptionStatus: 'Encrypted' | 'Not Encrypted' | 'Partially Encrypted' | 'Unknown';
  accessControls: AccessControl[];
  privacyImpactAssessment: PrivacyImpactAssessment | null;
  dataBreachHistory: DataBreach[];
  // Dependencies and requirements
  dependencies: AssetDependency[];
  requirements: ComplianceRequirement[];
  // Temporary field for bulk editing
  addTags?: string;
}

export interface AssetRelationship {
  id: string;
  relatedAssetId: string;
  relatedAssetName: string;
  relationshipType: 'Depends On' | 'Connects To' | 'Hosts' | 'Manages' | 'Accesses' | 'Processes' | 'Stores' | 'Transmits' | 'Shares' | 'Backs Up' | 'Replicates' | 'Synchronizes';
  strength: 'Strong' | 'Medium' | 'Weak';
  dataFlowDirection: 'Inbound' | 'Outbound' | 'Bidirectional' | 'None';
  isPersonalData: boolean;
  purpose: string; // Purpose of the relationship
}

export interface Vulnerability {
  id: string;
  cveId?: string;
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  title: string;
  description: string;
  discoveredAt: Date;
  status: 'Open' | 'In Progress' | 'Resolved' | 'Accepted Risk';
}

export interface AssetFilters {
  search: string;
  types: string[];
  criticalities: string[];
  owners: string[];
  locations: string[];
  complianceFrameworks: string[];
  status: string[];
  tags: string[];
  riskScoreRange: [number, number];
}

export interface SortConfig {
  key: keyof Asset | null;
  direction: 'asc' | 'desc';
}

export interface AssetInventoryState {
  assets: Asset[];
  filteredAssets: Asset[];
  selectedAssets: string[];
  filters: AssetFilters;
  sortConfig: SortConfig;
  currentPage: number;
  itemsPerPage: number;
  loading: boolean;
  selectedAsset: Asset | null;
  showDetailModal: boolean;
  showImportModal: boolean;
  searchDebounce: number;
}

// New interfaces for privacy and compliance
export interface AccessControl {
  id: string;
  type: 'Role-Based' | 'Attribute-Based' | 'Rule-Based' | 'Mandatory' | 'Discretionary';
  description: string;
  permissions: string[];
  isActive: boolean;
  lastReviewed: Date;
}

export interface PrivacyImpactAssessment {
  id: string;
  assessmentDate: Date;
  assessor: string;
  riskLevel: 'Low' | 'Medium' | 'High' | 'Critical';
  findings: string[];
  recommendations: string[];
  status: 'Draft' | 'Under Review' | 'Approved' | 'Needs Update';
  nextReviewDate: Date;
}

export interface DataBreach {
  id: string;
  incidentDate: Date;
  discoveryDate: Date;
  description: string;
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  affectedRecords: number;
  status: 'Open' | 'Under Investigation' | 'Resolved' | 'Closed';
  regulatoryNotification: boolean;
  notificationDate?: Date;
}

export interface AssetDependency {
  id: string;
  dependentAssetId: string;
  dependentAssetName: string;
  dependencyType: 'Technical' | 'Data' | 'Process' | 'Compliance' | 'Operational';
  criticality: 'Critical' | 'High' | 'Medium' | 'Low';
  description: string;
  isActive: boolean;
  lastValidated: Date;
  riskLevel: 'Low' | 'Medium' | 'High' | 'Critical';
}

export interface ComplianceRequirement {
  id: string;
  framework: string;
  requirementId: string;
  title: string;
  description: string;
  category: 'Technical' | 'Organizational' | 'Physical' | 'Administrative';
  priority: 'Critical' | 'High' | 'Medium' | 'Low';
  status: 'Not Started' | 'In Progress' | 'Completed' | 'Non-Applicable' | 'Exempt';
  dueDate?: Date;
  responsible: string;
  evidence: string[];
  lastReviewed: Date;
  nextReviewDate: Date;
}

export interface PrivacyRegulation {
  id: string;
  name: string;
  jurisdiction: string;
  effectiveDate: Date;
  description: string;
  requirements: ComplianceRequirement[];
  applicableTo: string[]; // Asset types this applies to
  penalties: {
    maxFine: number;
    currency: string;
    description: string;
  };
}

export interface DataSubjectRight {
  id: string;
  name: string;
  description: string;
  applicableRegulations: string[];
  responseTimeframe: number; // in days
  isAutomated: boolean;
  requiresVerification: boolean;
}

export interface AssetStats {
  total: number;
  critical: number;
  untagged: number;
  recentlyAdded: number;
  byType: Record<string, number>;
  byCriticality: Record<string, number>;
  byStatus: Record<string, number>;
  byDataClassification: Record<string, number>;
  byEncryptionStatus: Record<string, number>;
  privacyCompliant: number;
  withPIA: number;
  crossBorderTransfer: number;
  thirdPartySharing: number;
}