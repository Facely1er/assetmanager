import { Asset, Vulnerability } from '../types/asset';
import { logError } from '../utils/errorHandling';

export interface EnrichmentData {
  riskInsights: RiskInsights;
  complianceScore: ComplianceScore;
  lifecycleStage: LifecycleStage;
  performanceMetrics: PerformanceMetrics;
  threatIntelligence: ThreatIntelligence;
  costAnalysis: CostAnalysis;
  dependencies: DependencyAnalysis;
  recommendations: Recommendation[];
}

export interface RiskInsights {
  overallRiskLevel: 'Low' | 'Medium' | 'High' | 'Critical';
  riskFactors: RiskFactor[];
  riskTrend: 'Improving' | 'Stable' | 'Deteriorating';
  riskScore: number;
  lastAssessment: Date;
}

export interface RiskFactor {
  factor: string;
  impact: 'Low' | 'Medium' | 'High' | 'Critical';
  probability: number; // 0-1
  description: string;
  mitigation?: string;
}

export interface ComplianceScore {
  overallScore: number; // 0-100
  frameworkScores: Record<string, number>;
  gaps: ComplianceGap[];
  lastAudit: Date;
  nextAudit: Date;
}

export interface ComplianceGap {
  framework: string;
  requirement: string;
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  description: string;
  remediation: string;
}

export interface LifecycleStage {
  currentStage: 'Planning' | 'Development' | 'Testing' | 'Production' | 'Maintenance' | 'Retirement';
  stageProgress: number; // 0-100
  estimatedEndOfLife: Date;
  replacementRecommendation?: string;
  maintenanceSchedule: MaintenanceEvent[];
}

export interface MaintenanceEvent {
  type: 'Routine' | 'Critical' | 'Upgrade' | 'Security';
  scheduledDate: Date;
  description: string;
  estimatedDuration: number; // hours
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
}

export interface PerformanceMetrics {
  availability: number; // percentage
  responseTime: number; // milliseconds
  throughput: number; // requests per second
  errorRate: number; // percentage
  uptime: number; // percentage
  lastMeasurement: Date;
}

export interface ThreatIntelligence {
  threatLevel: 'Low' | 'Medium' | 'High' | 'Critical';
  knownThreats: KnownThreat[];
  securityAdvisories: SecurityAdvisory[];
  lastUpdate: Date;
}

export interface KnownThreat {
  threatId: string;
  name: string;
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  description: string;
  source: string;
  discovered: Date;
  status: 'Active' | 'Mitigated' | 'False Positive';
}

export interface SecurityAdvisory {
  advisoryId: string;
  title: string;
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  description: string;
  affectedVersions: string[];
  published: Date;
  patched: boolean;
}

export interface CostAnalysis {
  totalCost: number;
  costBreakdown: CostBreakdown;
  costTrend: 'Decreasing' | 'Stable' | 'Increasing';
  optimizationOpportunities: OptimizationOpportunity[];
}

export interface CostBreakdown {
  infrastructure: number;
  licensing: number;
  maintenance: number;
  security: number;
  personnel: number;
  other: number;
}

export interface OptimizationOpportunity {
  category: string;
  description: string;
  potentialSavings: number;
  effort: 'Low' | 'Medium' | 'High';
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
}

export interface DependencyAnalysis {
  dependencies: Dependency[];
  dependents: Dependency[];
  criticalPath: boolean;
  impactAnalysis: ImpactAnalysis;
}

export interface Dependency {
  assetId: string;
  assetName: string;
  relationshipType: string;
  strength: 'Weak' | 'Medium' | 'Strong';
  criticality: 'Low' | 'Medium' | 'High' | 'Critical';
}

export interface ImpactAnalysis {
  businessImpact: 'Low' | 'Medium' | 'High' | 'Critical';
  technicalImpact: 'Low' | 'Medium' | 'High' | 'Critical';
  financialImpact: 'Low' | 'Medium' | 'High' | 'Critical';
  recoveryTime: number; // hours
}

export interface Recommendation {
  id: string;
  type: 'Security' | 'Performance' | 'Cost' | 'Compliance' | 'Maintenance';
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  title: string;
  description: string;
  impact: string;
  effort: 'Low' | 'Medium' | 'High';
  timeline: string;
  cost?: number;
  benefits: string[];
}

class DataEnrichmentService {
  private enrichmentCache = new Map<string, EnrichmentData>();
  private readonly CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

  async enrichAsset(asset: Asset): Promise<EnrichmentData> {
    const cacheKey = `enrichment_${asset.id}`;
    const cached = this.enrichmentCache.get(cacheKey);
    
    if (cached && this.isCacheValid(cacheKey)) {
      return cached;
    }

    try {
      const enrichmentData: EnrichmentData = {
        riskInsights: await this.analyzeRisk(asset),
        complianceScore: await this.calculateComplianceScore(asset),
        lifecycleStage: await this.determineLifecycleStage(asset),
        performanceMetrics: await this.gatherPerformanceMetrics(asset),
        threatIntelligence: await this.gatherThreatIntelligence(asset),
        costAnalysis: await this.analyzeCosts(asset),
        dependencies: await this.analyzeDependencies(asset),
        recommendations: await this.generateRecommendations(asset)
      };

      this.enrichmentCache.set(cacheKey, enrichmentData);
      return enrichmentData;
    } catch (error) {
      logError(error, 'DataEnrichmentService.enrichAsset', { assetId: asset.id });
      throw error;
    }
  }

  async enrichAssets(assets: Asset[]): Promise<Map<string, EnrichmentData>> {
    const enrichmentMap = new Map<string, EnrichmentData>();
    
    // Process assets in parallel for better performance
    const enrichmentPromises = assets.map(async (asset) => {
      try {
        const enrichment = await this.enrichAsset(asset);
        enrichmentMap.set(asset.id, enrichment);
      } catch (error) {
        logError(error, 'DataEnrichmentService.enrichAssets', { assetId: asset.id });
        // Continue processing other assets even if one fails
      }
    });

    await Promise.all(enrichmentPromises);
    return enrichmentMap;
  }

  private async analyzeRisk(asset: Asset): Promise<RiskInsights> {
    const vulnerabilities = asset.vulnerabilities || [];
    const criticalVulns = vulnerabilities.filter(v => v.severity === 'Critical').length;
    const highVulns = vulnerabilities.filter(v => v.severity === 'High').length;
    const mediumVulns = vulnerabilities.filter(v => v.severity === 'Medium').length;
    
    // Calculate risk score based on multiple factors
    let riskScore = asset.riskScore;
    
    // Adjust based on vulnerabilities
    riskScore += criticalVulns * 15;
    riskScore += highVulns * 10;
    riskScore += mediumVulns * 5;
    
    // Adjust based on criticality
    const criticalityMultiplier = {
      'Critical': 1.2,
      'High': 1.1,
      'Medium': 1.0,
      'Low': 0.9
    };
    
    riskScore *= criticalityMultiplier[asset.criticality];
    
    // Cap at 100
    riskScore = Math.min(100, Math.max(0, riskScore));
    
    const riskFactors: RiskFactor[] = [];
    
    if (criticalVulns > 0) {
      riskFactors.push({
        factor: 'Critical Vulnerabilities',
        impact: 'Critical',
        probability: 0.9,
        description: `${criticalVulns} critical vulnerabilities detected`,
        mitigation: 'Apply security patches immediately'
      });
    }
    
    if (asset.riskScore > 80) {
      riskFactors.push({
        factor: 'High Base Risk Score',
        impact: 'High',
        probability: 0.7,
        description: 'Asset has inherently high risk profile',
        mitigation: 'Implement additional security controls'
      });
    }
    
    if (asset.complianceFrameworks.length === 0) {
      riskFactors.push({
        factor: 'No Compliance Framework',
        impact: 'Medium',
        probability: 0.6,
        description: 'Asset not covered by any compliance framework',
        mitigation: 'Assign appropriate compliance framework'
      });
    }

    const riskTrend = this.calculateRiskTrend(asset);
    
    return {
      overallRiskLevel: this.getRiskLevel(riskScore),
      riskFactors,
      riskTrend,
      riskScore: Math.round(riskScore),
      lastAssessment: new Date()
    };
  }

  private async calculateComplianceScore(asset: Asset): Promise<ComplianceScore> {
    const frameworks = asset.complianceFrameworks;
    const frameworkScores: Record<string, number> = {};
    const gaps: ComplianceGap[] = [];
    
    // Calculate scores for each framework
    for (const framework of frameworks) {
      let score = 80; // Base score
      
      // Adjust based on asset characteristics
      if (asset.criticality === 'Critical') score += 10;
      if (asset.tags.includes('encrypted')) score += 5;
      if (asset.vulnerabilities.length === 0) score += 5;
      if (asset.riskScore < 50) score += 5;
      
      // Add some randomness for demo purposes
      score += Math.random() * 10 - 5;
      score = Math.min(100, Math.max(0, Math.round(score)));
      
      frameworkScores[framework] = score;
      
      // Generate gaps for scores below 90
      if (score < 90) {
        gaps.push({
          framework,
          requirement: 'Security Controls',
          severity: score < 70 ? 'High' : 'Medium',
          description: `Insufficient security controls for ${framework} compliance`,
          remediation: 'Implement additional security measures'
        });
      }
    }
    
    const overallScore = frameworks.length > 0 
      ? Math.round(Object.values(frameworkScores).reduce((sum, score) => sum + score, 0) / frameworks.length)
      : 0;
    
    return {
      overallScore,
      frameworkScores,
      gaps,
      lastAudit: asset.lastAssessed,
      nextAudit: new Date(asset.lastAssessed.getTime() + 90 * 24 * 60 * 60 * 1000) // 90 days from last audit
    };
  }

  private async determineLifecycleStage(asset: Asset): Promise<LifecycleStage> {
    const ageInDays = (Date.now() - asset.createdAt.getTime()) / (1000 * 60 * 60 * 24);
    const lastUpdateDays = (Date.now() - asset.updatedAt.getTime()) / (1000 * 60 * 60 * 24);
    
    let currentStage: LifecycleStage['currentStage'];
    let stageProgress: number;
    let estimatedEndOfLife: Date;
    
    if (asset.status === 'Retired') {
      currentStage = 'Retirement';
      stageProgress = 100;
      estimatedEndOfLife = new Date(asset.updatedAt.getTime() + 30 * 24 * 60 * 60 * 1000);
    } else if (ageInDays < 30) {
      currentStage = 'Development';
      stageProgress = Math.min(100, (ageInDays / 30) * 100);
      estimatedEndOfLife = new Date(asset.createdAt.getTime() + 3 * 365 * 24 * 60 * 60 * 1000);
    } else if (ageInDays < 90) {
      currentStage = 'Testing';
      stageProgress = Math.min(100, ((ageInDays - 30) / 60) * 100);
      estimatedEndOfLife = new Date(asset.createdAt.getTime() + 3 * 365 * 24 * 60 * 60 * 1000);
    } else if (ageInDays < 365) {
      currentStage = 'Production';
      stageProgress = Math.min(100, ((ageInDays - 90) / 275) * 100);
      estimatedEndOfLife = new Date(asset.createdAt.getTime() + 3 * 365 * 24 * 60 * 60 * 1000);
    } else {
      currentStage = 'Maintenance';
      stageProgress = Math.min(100, ((ageInDays - 365) / 730) * 100);
      estimatedEndOfLife = new Date(asset.createdAt.getTime() + 3 * 365 * 24 * 60 * 60 * 1000);
    }
    
    const maintenanceSchedule: MaintenanceEvent[] = [
      {
        type: 'Routine',
        scheduledDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        description: 'Regular maintenance check',
        estimatedDuration: 2,
        priority: 'Medium'
      }
    ];
    
    if (asset.vulnerabilities.length > 0) {
      maintenanceSchedule.push({
        type: 'Security',
        scheduledDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        description: 'Security patch application',
        estimatedDuration: 4,
        priority: 'High'
      });
    }
    
    return {
      currentStage,
      stageProgress: Math.round(stageProgress),
      estimatedEndOfLife,
      replacementRecommendation: ageInDays > 1000 ? 'Consider replacement with newer technology' : undefined,
      maintenanceSchedule
    };
  }

  private async gatherPerformanceMetrics(asset: Asset): Promise<PerformanceMetrics> {
    // Simulate performance metrics based on asset characteristics
    const baseAvailability = asset.criticality === 'Critical' ? 99.9 : 99.5;
    const baseResponseTime = asset.type === 'Database' ? 50 : 100;
    const baseThroughput = asset.type === 'Server' ? 1000 : 500;
    
    // Add some realistic variance
    const availability = baseAvailability + (Math.random() - 0.5) * 0.5;
    const responseTime = baseResponseTime + (Math.random() - 0.5) * 20;
    const throughput = baseThroughput + (Math.random() - 0.5) * 200;
    const errorRate = Math.random() * 0.1;
    const uptime = availability - errorRate;
    
    return {
      availability: Math.round(availability * 100) / 100,
      responseTime: Math.round(responseTime),
      throughput: Math.round(throughput),
      errorRate: Math.round(errorRate * 100) / 100,
      uptime: Math.round(uptime * 100) / 100,
      lastMeasurement: new Date()
    };
  }

  private async gatherThreatIntelligence(asset: Asset): Promise<ThreatIntelligence> {
    const vulnerabilities = asset.vulnerabilities || [];
    const threatLevel = this.calculateThreatLevel(vulnerabilities);
    
    const knownThreats: KnownThreat[] = vulnerabilities.map(vuln => ({
      threatId: vuln.id,
      name: vuln.title,
      severity: vuln.severity,
      description: vuln.description,
      source: 'Internal Scan',
      discovered: vuln.discoveredAt,
      status: vuln.status === 'Resolved' ? 'Mitigated' : 'Active'
    }));
    
    const securityAdvisories: SecurityAdvisory[] = [];
    
    // Add some mock security advisories
    if (asset.type === 'Server' && Math.random() > 0.7) {
      securityAdvisories.push({
        advisoryId: `ADV-${Date.now()}`,
        title: 'Security Advisory for Server Components',
        severity: 'High',
        description: 'Critical security update available for server components',
        affectedVersions: ['1.0.0', '1.1.0'],
        published: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        patched: false
      });
    }
    
    return {
      threatLevel,
      knownThreats,
      securityAdvisories,
      lastUpdate: new Date()
    };
  }

  private async analyzeCosts(asset: Asset): Promise<CostAnalysis> {
    // Simulate cost analysis based on asset characteristics
    const baseCost = this.getBaseCost(asset);
    const costBreakdown: CostBreakdown = {
      infrastructure: baseCost * 0.4,
      licensing: baseCost * 0.2,
      maintenance: baseCost * 0.15,
      security: baseCost * 0.1,
      personnel: baseCost * 0.1,
      other: baseCost * 0.05
    };
    
    const totalCost = Object.values(costBreakdown).reduce((sum, cost) => sum + cost, 0);
    
    const optimizationOpportunities: OptimizationOpportunity[] = [];
    
    if (asset.riskScore > 70) {
      optimizationOpportunities.push({
        category: 'Security',
        description: 'Reduce security costs through better risk management',
        potentialSavings: totalCost * 0.1,
        effort: 'Medium',
        priority: 'High'
      });
    }
    
    if (asset.status === 'Retired') {
      optimizationOpportunities.push({
        category: 'Infrastructure',
        description: 'Decommission retired asset to reduce costs',
        potentialSavings: totalCost * 0.8,
        effort: 'Low',
        priority: 'Critical'
      });
    }
    
    return {
      totalCost: Math.round(totalCost),
      costBreakdown,
      costTrend: 'Stable',
      optimizationOpportunities
    };
  }

  private async analyzeDependencies(asset: Asset): Promise<DependencyAnalysis> {
    const dependencies: Dependency[] = asset.relationships?.map(rel => ({
      assetId: rel.relatedAssetId,
      assetName: rel.relatedAssetName,
      relationshipType: rel.relationshipType,
      strength: rel.strength,
      criticality: 'Medium' // This would be determined by the related asset
    })) || [];
    
    const dependents: Dependency[] = []; // This would be calculated by finding assets that depend on this one
    
    const criticalPath = dependencies.some(dep => dep.criticality === 'Critical');
    
    const impactAnalysis: ImpactAnalysis = {
      businessImpact: asset.criticality,
      technicalImpact: asset.riskScore > 70 ? 'High' : asset.riskScore > 40 ? 'Medium' : 'Low',
      financialImpact: asset.criticality === 'Critical' ? 'High' : 'Medium',
      recoveryTime: asset.criticality === 'Critical' ? 4 : asset.criticality === 'High' ? 8 : 24
    };
    
    return {
      dependencies,
      dependents,
      criticalPath,
      impactAnalysis
    };
  }

  private async generateRecommendations(asset: Asset): Promise<Recommendation[]> {
    const recommendations: Recommendation[] = [];
    
    // Security recommendations
    if (asset.vulnerabilities.length > 0) {
      recommendations.push({
        id: `rec-${asset.id}-security-1`,
        type: 'Security',
        priority: 'High',
        title: 'Address Security Vulnerabilities',
        description: `Asset has ${asset.vulnerabilities.length} open vulnerabilities that need attention`,
        impact: 'Reduces security risk and improves compliance posture',
        effort: 'Medium',
        timeline: '2-4 weeks',
        cost: 5000,
        benefits: ['Improved security', 'Better compliance', 'Reduced risk']
      });
    }
    
    // Performance recommendations
    if (asset.riskScore > 70) {
      recommendations.push({
        id: `rec-${asset.id}-performance-1`,
        type: 'Performance',
        priority: 'Medium',
        title: 'Optimize Asset Performance',
        description: 'High risk score indicates potential performance issues',
        impact: 'Improves reliability and reduces operational risk',
        effort: 'High',
        timeline: '4-6 weeks',
        cost: 10000,
        benefits: ['Better performance', 'Reduced downtime', 'Lower maintenance costs']
      });
    }
    
    // Compliance recommendations
    if (asset.complianceFrameworks.length === 0) {
      recommendations.push({
        id: `rec-${asset.id}-compliance-1`,
        type: 'Compliance',
        priority: 'Medium',
        title: 'Assign Compliance Framework',
        description: 'Asset is not covered by any compliance framework',
        impact: 'Ensures regulatory compliance and reduces audit risk',
        effort: 'Low',
        timeline: '1-2 weeks',
        benefits: ['Regulatory compliance', 'Audit readiness', 'Risk reduction']
      });
    }
    
    // Cost optimization recommendations
    if (asset.status === 'Retired') {
      recommendations.push({
        id: `rec-${asset.id}-cost-1`,
        type: 'Cost',
        priority: 'Critical',
        title: 'Decommission Retired Asset',
        description: 'Asset is marked as retired but still consuming resources',
        impact: 'Immediate cost savings and resource optimization',
        effort: 'Low',
        timeline: '1 week',
        benefits: ['Cost savings', 'Resource optimization', 'Simplified management']
      });
    }
    
    return recommendations;
  }

  private calculateRiskTrend(asset: Asset): 'Improving' | 'Stable' | 'Deteriorating' {
    // This would typically analyze historical data
    // For now, we'll use a simple heuristic
    const daysSinceLastUpdate = (Date.now() - asset.updatedAt.getTime()) / (1000 * 60 * 60 * 24);
    
    if (daysSinceLastUpdate > 30 && asset.vulnerabilities.length > 0) {
      return 'Deteriorating';
    } else if (asset.vulnerabilities.length === 0 && asset.riskScore < 50) {
      return 'Improving';
    } else {
      return 'Stable';
    }
  }

  private getRiskLevel(score: number): 'Low' | 'Medium' | 'High' | 'Critical' {
    if (score >= 80) return 'Critical';
    if (score >= 60) return 'High';
    if (score >= 40) return 'Medium';
    return 'Low';
  }

  private calculateThreatLevel(vulnerabilities: Vulnerability[]): 'Low' | 'Medium' | 'High' | 'Critical' {
    const criticalCount = vulnerabilities.filter(v => v.severity === 'Critical').length;
    const highCount = vulnerabilities.filter(v => v.severity === 'High').length;
    
    if (criticalCount > 0) return 'Critical';
    if (highCount > 2) return 'High';
    if (highCount > 0 || vulnerabilities.length > 5) return 'Medium';
    return 'Low';
  }

  private getBaseCost(asset: Asset): number {
    const baseCosts = {
      'Server': 2000,
      'Database': 3000,
      'Application': 1500,
      'Network': 1000,
      'Endpoint': 500,
      'Cloud Service': 800
    };
    
    return baseCosts[asset.type] || 1000;
  }

  private isCacheValid(cacheKey: string): boolean {
    // In a real implementation, this would check timestamps
    return true;
  }

  clearCache(): void {
    this.enrichmentCache.clear();
  }

  getCacheSize(): number {
    return this.enrichmentCache.size;
  }
}

export const dataEnrichmentService = new DataEnrichmentService();