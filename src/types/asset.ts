// Enhanced Asset type with better validation and constraints
export interface Asset {
  readonly id: string;
  name: string;
  type: AssetType;
  criticality: CriticalityLevel;
  owner: string;
  location: string;
  ipAddress?: string;
  description: string;
  complianceFrameworks: readonly string[];
  riskScore: number; // 0-100
  lastAssessed: Date;
  tags: readonly string[];
  relationships: readonly AssetRelationship[];
  vulnerabilities: readonly Vulnerability[];
  status: AssetStatus;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  // Temporary field for bulk editing
  addTags?: string;
}

// Extract enums for better type safety
export type AssetType = 'Server' | 'Database' | 'Application' | 'Network' | 'Endpoint' | 'Cloud Service';
export type CriticalityLevel = 'Critical' | 'High' | 'Medium' | 'Low';
export type AssetStatus = 'Active' | 'Inactive' | 'Retired' | 'Planned';

export interface AssetRelationship {
  readonly id: string;
  relatedAssetId: string;
  relatedAssetName: string;
  relationshipType: RelationshipType;
  strength: RelationshipStrength;
}

export type RelationshipType = 'Depends On' | 'Connects To' | 'Hosts' | 'Manages' | 'Accesses';
export type RelationshipStrength = 'Strong' | 'Medium' | 'Weak';

export interface Vulnerability {
  readonly id: string;
  cveId?: string;
  severity: VulnerabilitySeverity;
  title: string;
  description: string;
  discoveredAt: Date;
  status: VulnerabilityStatus;
}

export type VulnerabilitySeverity = 'Critical' | 'High' | 'Medium' | 'Low';
export type VulnerabilityStatus = 'Open' | 'In Progress' | 'Resolved' | 'Accepted Risk';

export interface AssetFilters {
  search: string;
  types: AssetType[];
  criticalities: CriticalityLevel[];
  owners: string[];
  locations: string[];
  complianceFrameworks: string[];
  status: AssetStatus[];
  tags: string[];
  riskScoreRange: [number, number];
}

export interface SortConfig {
  key: keyof Asset | null;
  direction: SortDirection;
}

export type SortDirection = 'asc' | 'desc';

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

export interface AssetStats {
  total: number;
  critical: number;
  untagged: number;
  recentlyAdded: number;
  byType: Record<string, number>;
  byCriticality: Record<string, number>;
  byStatus: Record<string, number>;
}