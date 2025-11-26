import { Asset } from '../types/asset';
import { DemoScenario, getDemoScenario } from './demoScenarios';
import { generateAssetInventory } from './assetGenerators';

export interface DemoDataPackage {
  scenario: DemoScenario;
  assets: Asset[];
  metadata: {
    generatedAt: Date;
    assetCount: number;
    vulnerabilityCount: number;
    complianceFrameworks: string[];
    riskDistribution: Record<string, number>;
  };
}

export function generateDemoDataPackage(scenarioId: string): DemoDataPackage {
  const scenario = getDemoScenario(scenarioId);
  if (!scenario) {
    throw new Error(`Demo scenario not found: ${scenarioId}`);
  }

  // Generate assets using the existing generator
  const assets = generateAssetInventory(scenarioId);
  
  // Calculate metadata
  const vulnerabilityCount = assets.reduce((total, asset) => total + asset.vulnerabilities.length, 0);
  const complianceFrameworks = [...new Set(assets.flatMap(asset => asset.complianceFrameworks))];
  
  const riskDistribution = assets.reduce((dist, asset) => {
    dist[asset.criticality] = (dist[asset.criticality] || 0) + 1;
    return dist;
  }, {} as Record<string, number>);

  return {
    scenario,
    assets,
    metadata: {
      generatedAt: new Date(),
      assetCount: assets.length,
      vulnerabilityCount,
      complianceFrameworks,
      riskDistribution
    }
  };
}

export function generateAllDemoPackages(): Record<string, DemoDataPackage> {
  const scenarios = [
    'healthcare-hospital',
    'financial-bank',
    'tech-startup',
    'manufacturing-plant',
    'government-agency',
    'education-university'
  ];

  const packages: Record<string, DemoDataPackage> = {};
  
  scenarios.forEach(scenarioId => {
    try {
      packages[scenarioId] = generateDemoDataPackage(scenarioId);
    } catch (error) {
      console.error(`Failed to generate demo package for ${scenarioId}:`, error);
    }
  });

  return packages;
}


// Enhanced demo data with realistic relationships and dependencies
export function createRealisticDemoAssets(scenarioId: string): Asset[] {
  const baseAssets = generateAssetInventory(scenarioId);
  
  // Add realistic relationships between assets
  return baseAssets.map(asset => {
    const relationships = generateRealisticRelationships(asset, baseAssets);
    return {
      ...asset,
      relationships
    };
  });
}

function generateRealisticRelationships(asset: Asset, allAssets: Asset[]): Asset['relationships'] {
  const relationships: Asset['relationships'] = [];
  const maxRelationships = Math.min(3, allAssets.length - 1);
  const relationshipCount = Math.floor(Math.random() * maxRelationships) + 1;
  
  const potentialRelated = allAssets.filter(a => a.id !== asset.id);
  const shuffled = [...potentialRelated].sort(() => 0.5 - Math.random());
  
  for (let i = 0; i < relationshipCount && i < shuffled.length; i++) {
    const relatedAsset = shuffled[i];
    const relationshipTypes = getRelationshipTypes(asset.type, relatedAsset.type);
    const relationshipType = relationshipTypes[Math.floor(Math.random() * relationshipTypes.length)];
    
    relationships.push({
      id: `rel-${asset.id}-${relatedAsset.id}`,
      relatedAssetId: relatedAsset.id,
      relatedAssetName: relatedAsset.name,
      relationshipType,
      strength: getRandomStrength()
    });
  }
  
  return relationships;
}

function getRelationshipTypes(assetType: string, relatedType: string): string[] {
  const relationshipMap: Record<string, Record<string, string[]>> = {
    'Database': {
      'Application': ['Serves', 'Accessed By'],
      'Server': ['Hosted On', 'Backs Up To'],
      'Cloud Service': ['Stored In', 'Backed Up To']
    },
    'Application': {
      'Database': ['Accesses', 'Connects To'],
      'Server': ['Runs On', 'Hosted On'],
      'Network': ['Routes Through', 'Behind'],
      'Cloud Service': ['Deployed On', 'Uses']
    },
    'Server': {
      'Database': ['Hosts', 'Runs'],
      'Application': ['Hosts', 'Runs'],
      'Network': ['Connected Via', 'Routes Through'],
      'Endpoint': ['Manages', 'Serves']
    },
    'Network': {
      'Server': ['Connects', 'Routes To'],
      'Application': ['Routes To', 'Load Balances'],
      'Endpoint': ['Connects', 'Provides Access To']
    },
    'Cloud Service': {
      'Application': ['Hosts', 'Provides Service To'],
      'Database': ['Stores', 'Manages'],
      'Server': ['Replaces', 'Provides Alternative To']
    }
  };
  
  return relationshipMap[assetType]?.[relatedType] || ['Relates To', 'Depends On'];
}

function getRandomStrength(): 'Strong' | 'Medium' | 'Weak' {
  const strengths = ['Strong', 'Medium', 'Weak'];
  return strengths[Math.floor(Math.random() * strengths.length)] as 'Strong' | 'Medium' | 'Weak';
}

// Demo scenario quick start functions
export function getQuickStartScenarios() {
  return [
    {
      id: 'healthcare-quick',
      name: 'Healthcare Quick Start',
      description: '5-minute demo of HIPAA compliance features',
      duration: '5 minutes',
      difficulty: 'Easy',
      steps: [
        'Load healthcare scenario',
        'Show asset categorization',
        'Generate compliance report',
        'Review vulnerability dashboard'
      ]
    },
    {
      id: 'financial-quick',
      name: 'Financial Services Quick Start',
      description: '5-minute demo of PCI DSS compliance features',
      duration: '5 minutes',
      difficulty: 'Easy',
      steps: [
        'Load financial scenario',
        'Show payment system tracking',
        'Generate PCI DSS report',
        'Review risk assessment'
      ]
    },
    {
      id: 'startup-quick',
      name: 'Startup Quick Start',
      description: '5-minute demo of cloud asset management',
      duration: '5 minutes',
      difficulty: 'Easy',
      steps: [
        'Load startup scenario',
        'Show cloud resource discovery',
        'Demonstrate microservices mapping',
        'Review security scanning'
      ]
    }
  ];
}

export function getIndustryScenarios() {
  return [
    {
      industry: 'Healthcare',
      scenarios: [
        { id: 'healthcare-hospital', name: 'Regional Hospital Network' },
        { id: 'healthcare-clinic', name: 'Medical Clinic Chain' },
        { id: 'healthcare-research', name: 'Medical Research Institute' }
      ]
    },
    {
      industry: 'Financial Services',
      scenarios: [
        { id: 'financial-bank', name: 'Regional Bank & Trust' },
        { id: 'financial-credit-union', name: 'Credit Union' },
        { id: 'financial-fintech', name: 'Fintech Startup' }
      ]
    },
    {
      industry: 'Technology',
      scenarios: [
        { id: 'tech-startup', name: 'Cloud-Native Startup' },
        { id: 'tech-enterprise', name: 'Enterprise Software Company' },
        { id: 'tech-saas', name: 'SaaS Platform Provider' }
      ]
    },
    {
      industry: 'Manufacturing',
      scenarios: [
        { id: 'manufacturing-plant', name: 'Industrial Manufacturing Plant' },
        { id: 'manufacturing-automotive', name: 'Automotive Manufacturer' },
        { id: 'manufacturing-pharma', name: 'Pharmaceutical Company' }
      ]
    },
    {
      industry: 'Government',
      scenarios: [
        { id: 'government-agency', name: 'Federal Government Agency' },
        { id: 'government-state', name: 'State Government Department' },
        { id: 'government-local', name: 'Local Government Municipality' }
      ]
    },
    {
      industry: 'Education',
      scenarios: [
        { id: 'education-university', name: 'Major University' },
        { id: 'education-school-district', name: 'School District' },
        { id: 'education-research', name: 'Research University' }
      ]
    }
  ];
}

// Demo data validation and quality checks
export function validateDemoData(assets: Asset[]): {
  isValid: boolean;
  issues: string[];
  recommendations: string[];
} {
  const issues: string[] = [];
  const recommendations: string[] = [];

  // Check for required fields
  assets.forEach((asset, index) => {
    if (!asset.name) issues.push(`Asset ${index + 1}: Missing name`);
    if (!asset.type) issues.push(`Asset ${index + 1}: Missing type`);
    if (!asset.criticality) issues.push(`Asset ${index + 1}: Missing criticality`);
    if (!asset.owner) issues.push(`Asset ${index + 1}: Missing owner`);
    if (!asset.location) issues.push(`Asset ${index + 1}: Missing location`);
    if (asset.complianceFrameworks.length === 0) {
      recommendations.push(`Asset ${index + 1}: Consider adding compliance frameworks`);
    }
    if (asset.tags.length === 0) {
      recommendations.push(`Asset ${index + 1}: Consider adding tags for better organization`);
    }
  });

  // Check for realistic data distribution
  const criticalityDistribution = assets.reduce((dist, asset) => {
    dist[asset.criticality] = (dist[asset.criticality] || 0) + 1;
    return dist;
  }, {} as Record<string, number>);

  const totalAssets = assets.length;
  const criticalCount = criticalityDistribution.Critical || 0;
  const criticalPercentage = (criticalCount / totalAssets) * 100;

  if (criticalPercentage > 50) {
    recommendations.push('Consider reducing the percentage of Critical assets for more realistic distribution');
  }

  if (criticalPercentage < 5) {
    recommendations.push('Consider adding more Critical assets for comprehensive risk assessment');
  }

  // Check for vulnerability distribution
  const assetsWithVulnerabilities = assets.filter(asset => asset.vulnerabilities.length > 0);
  const vulnerabilityPercentage = (assetsWithVulnerabilities.length / totalAssets) * 100;

  if (vulnerabilityPercentage < 20) {
    recommendations.push('Consider adding more vulnerabilities for realistic security assessment');
  }

  if (vulnerabilityPercentage > 80) {
    recommendations.push('Consider reducing vulnerabilities for more realistic security posture');
  }

  return {
    isValid: issues.length === 0,
    issues,
    recommendations
  };
}

// Export demo data statistics
export function getDemoDataStatistics(assets: Asset[]): {
  totalAssets: number;
  byType: Record<string, number>;
  byCriticality: Record<string, number>;
  byStatus: Record<string, number>;
  byComplianceFramework: Record<string, number>;
  vulnerabilityCount: number;
  relationshipCount: number;
  averageRiskScore: number;
} {
  const totalAssets = assets.length;
  
  const byType = assets.reduce((dist, asset) => {
    dist[asset.type] = (dist[asset.type] || 0) + 1;
    return dist;
  }, {} as Record<string, number>);

  const byCriticality = assets.reduce((dist, asset) => {
    dist[asset.criticality] = (dist[asset.criticality] || 0) + 1;
    return dist;
  }, {} as Record<string, number>);

  const byStatus = assets.reduce((dist, asset) => {
    dist[asset.status] = (dist[asset.status] || 0) + 1;
    return dist;
  }, {} as Record<string, number>);

  const byComplianceFramework = assets.reduce((dist, asset) => {
    asset.complianceFrameworks.forEach(framework => {
      dist[framework] = (dist[framework] || 0) + 1;
    });
    return dist;
  }, {} as Record<string, number>);

  const vulnerabilityCount = assets.reduce((total, asset) => total + asset.vulnerabilities.length, 0);
  const relationshipCount = assets.reduce((total, asset) => total + asset.relationships.length, 0);
  const averageRiskScore = assets.reduce((sum, asset) => sum + asset.riskScore, 0) / totalAssets;

  return {
    totalAssets,
    byType,
    byCriticality,
    byStatus,
    byComplianceFramework,
    vulnerabilityCount,
    relationshipCount,
    averageRiskScore: Math.round(averageRiskScore * 100) / 100
  };
}