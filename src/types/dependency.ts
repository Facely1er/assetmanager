import { Asset, AssetRelationship } from './asset';

/**
 * Unified Dependency interface that works with AssetManager's structure
 * Can be converted from/to AssetRelationship
 */
export interface Dependency {
  id: string;
  sourceId: string;
  sourceName: string;
  targetId: string;
  targetName: string;
  type: string; // Relationship type
  strength: 'critical' | 'high' | 'medium' | 'low' | 'Strong' | 'Medium' | 'Weak';
  description?: string;
  dataFlowDirection?: 'Inbound' | 'Outbound' | 'Bidirectional' | 'None';
  isPersonalData?: boolean;
  purpose?: string;
}

/**
 * Convert AssetRelationship to Dependency format
 */
export const relationshipToDependency = (
  relationship: AssetRelationship,
  sourceAssetId: string,
  sourceAssetName: string,
  targetAssetId: string,
  targetAssetName: string
): Dependency => {
  // Map strength from AssetRelationship to Dependency format
  const mapStrength = (strength: 'Strong' | 'Medium' | 'Weak'): 'critical' | 'high' | 'medium' | 'low' => {
    switch (strength) {
      case 'Strong': return 'critical';
      case 'Medium': return 'medium';
      case 'Weak': return 'low';
      default: return 'medium';
    }
  };

  return {
    id: relationship.id,
    sourceId: sourceAssetId,
    sourceName: sourceAssetName,
    targetId: targetAssetId,
    targetName: targetAssetName,
    type: relationship.relationshipType,
    strength: mapStrength(relationship.strength),
    description: relationship.purpose,
    dataFlowDirection: relationship.dataFlowDirection,
    isPersonalData: relationship.isPersonalData,
    purpose: relationship.purpose,
  };
};

/**
 * Extract all dependencies from assets
 */
export const extractDependenciesFromAssets = (assets: Asset[]): Dependency[] => {
  const dependencies: Dependency[] = [];

  assets.forEach(asset => {
    // Process relationships
    asset.relationships?.forEach((relationship: AssetRelationship) => {
      const dep = relationshipToDependency(
        relationship,
        asset.id,
        asset.name,
        relationship.relatedAssetId,
        relationship.relatedAssetName
      );
      dependencies.push(dep);
    });
  });

  return dependencies;
};

