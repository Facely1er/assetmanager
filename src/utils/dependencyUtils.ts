import { Asset } from '../types/asset';

/**
 * Extract dependencies from assets for use in risk forms and other components
 */
export const extractDependenciesFromAssets = (assets: Asset[]): Array<{ id: string; name: string }> => {
  const dependencies: Array<{ id: string; name: string }> = [];
  const seen = new Set<string>();

  assets.forEach(asset => {
    asset.relationships.forEach(relationship => {
      if (!seen.has(relationship.relatedAssetId)) {
        seen.add(relationship.relatedAssetId);
        dependencies.push({
          id: relationship.relatedAssetId,
          name: relationship.relatedAssetName || 'Unknown Asset',
        });
      }
    });

    asset.dependencies.forEach(dependency => {
      if (!seen.has(dependency.dependentAssetId)) {
        seen.add(dependency.dependentAssetId);
        dependencies.push({
          id: dependency.dependentAssetId,
          name: dependency.dependentAssetName || 'Unknown Asset',
        });
      }
    });
  });

  return dependencies;
};

/**
 * Get asset name by ID
 */
export const getAssetNameById = (assets: Asset[], assetId: string): string => {
  const asset = assets.find(a => a.id === assetId);
  return asset?.name || 'Unknown Asset';
};

