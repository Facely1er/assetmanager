import { Asset, AssetStats } from '../types/asset';
import { EnrichmentData } from './dataEnrichmentService';
import { logError } from '../utils/errorHandling';

export interface AnalyticsInsights {
  trends: TrendAnalysis;
  forecasts: ForecastData;
  anomalies: AnomalyDetection;
  correlations: CorrelationAnalysis;
  recommendations: AnalyticsRecommendation[];
  summary: AnalyticsSummary;
}

export interface TrendAnalysis {
  assetGrowth: TrendData;
  riskTrends: TrendData;
  complianceTrends: TrendData;
  costTrends: TrendData;
  vulnerabilityTrends: TrendData;
}

export interface TrendData {
  direction: 'Increasing' | 'Decreasing' | 'Stable';
  rate: number; // percentage change per period
  confidence: number; // 0-1
  dataPoints: DataPoint[];
  prediction: DataPoint[];
}

export interface DataPoint {
  date: Date;
  value: number;
  metadata?: Record<string, unknown>;
}

export interface ForecastData {
  assetInventory: Forecast;
  riskProjection: Forecast;
  costProjection: Forecast;
  complianceProjection: Forecast;
  maintenanceSchedule: Forecast;
}

export interface Forecast {
  horizon: number; // days
  confidence: number; // 0-1
  predictions: ForecastPoint[];
  scenarios: ForecastScenario[];
}

export interface ForecastPoint {
  date: Date;
  value: number;
  lowerBound: number;
  upperBound: number;
  probability: number;
}

export interface ForecastScenario {
  name: string;
  description: string;
  probability: number;
  impact: 'Low' | 'Medium' | 'High' | 'Critical';
  predictions: ForecastPoint[];
}

export interface AnomalyDetection {
  anomalies: Anomaly[];
  patterns: Pattern[];
  alerts: Alert[];
}

export interface Anomaly {
  id: string;
  type: 'Risk' | 'Performance' | 'Cost' | 'Compliance' | 'Security';
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  description: string;
  detectedAt: Date;
  affectedAssets: string[];
  confidence: number;
  recommendations: string[];
}

export interface Pattern {
  id: string;
  name: string;
  description: string;
  frequency: number;
  confidence: number;
  affectedAssets: string[];
  insights: string[];
}

export interface Alert {
  id: string;
  type: 'Threshold' | 'Anomaly' | 'Trend' | 'Forecast';
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  title: string;
  description: string;
  triggeredAt: Date;
  affectedAssets: string[];
  acknowledged: boolean;
  resolved: boolean;
}

export interface CorrelationAnalysis {
  correlations: Correlation[];
  insights: string[];
  recommendations: string[];
}

export interface Correlation {
  variable1: string;
  variable2: string;
  strength: number; // -1 to 1
  significance: number; // 0-1
  description: string;
  implications: string[];
}

export interface AnalyticsRecommendation {
  id: string;
  category: 'Optimization' | 'Risk' | 'Cost' | 'Performance' | 'Compliance';
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  title: string;
  description: string;
  impact: string;
  effort: 'Low' | 'Medium' | 'High';
  timeline: string;
  cost: number;
  benefits: string[];
  affectedAssets: string[];
  confidence: number;
}

export interface AnalyticsSummary {
  totalAssets: number;
  riskDistribution: Record<string, number>;
  complianceStatus: Record<string, number>;
  costAnalysis: CostSummary;
  performanceMetrics: PerformanceSummary;
  keyInsights: string[];
  actionItems: string[];
}

export interface CostSummary {
  totalCost: number;
  costPerAsset: number;
  costTrend: 'Increasing' | 'Decreasing' | 'Stable';
  optimizationPotential: number;
  topCostDrivers: string[];
}

export interface PerformanceSummary {
  averageRiskScore: number;
  averageComplianceScore: number;
  vulnerabilityCount: number;
  criticalIssues: number;
  performanceTrend: 'Improving' | 'Stable' | 'Deteriorating';
}

class AnalyticsService {
  private historicalData: Map<string, DataPoint[]> = new Map();
  private readonly MAX_HISTORICAL_POINTS = 1000;

  async generateInsights(
    assets: Asset[], 
    enrichmentData: Map<string, EnrichmentData>
  ): Promise<AnalyticsInsights> {
    try {
      const insights: AnalyticsInsights = {
        trends: await this.analyzeTrends(assets, enrichmentData),
        forecasts: await this.generateForecasts(assets, enrichmentData),
        anomalies: await this.detectAnomalies(assets, enrichmentData),
        correlations: await this.analyzeCorrelations(assets, enrichmentData),
        recommendations: await this.generateAnalyticsRecommendations(assets, enrichmentData),
        summary: await this.generateSummary(assets, enrichmentData)
      };

      return insights;
    } catch (error) {
      logError(error, 'AnalyticsService.generateInsights');
      throw error;
    }
  }

  private async analyzeTrends(
    assets: Asset[], 
    enrichmentData: Map<string, EnrichmentData>
  ): Promise<TrendAnalysis> {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    // Asset Growth Trend
    const assetGrowthData = this.generateHistoricalData('asset_count', assets.length, 30);
    const assetGrowthTrend = this.calculateTrend(assetGrowthData);
    
    // Risk Trends
    const riskData = assets.map(asset => ({
      date: asset.updatedAt,
      value: asset.riskScore
    }));
    const riskTrend = this.calculateTrend(riskData);
    
    // Compliance Trends
    const complianceData = Array.from(enrichmentData.values()).map(data => ({
      date: data.complianceScore.lastAudit,
      value: data.complianceScore.overallScore
    }));
    const complianceTrend = this.calculateTrend(complianceData);
    
    // Cost Trends
    const costData = Array.from(enrichmentData.values()).map(data => ({
      date: now,
      value: data.costAnalysis.totalCost
    }));
    const costTrend = this.calculateTrend(costData);
    
    // Vulnerability Trends
    const vulnerabilityData = assets.flatMap(asset => 
      asset.vulnerabilities.map(vuln => ({
        date: vuln.discoveredAt,
        value: 1
      }))
    );
    const vulnerabilityTrend = this.calculateTrend(vulnerabilityData);

    return {
      assetGrowth: assetGrowthTrend,
      riskTrends: riskTrend,
      complianceTrends: complianceTrend,
      costTrends: costTrend,
      vulnerabilityTrends: vulnerabilityTrend
    };
  }

  private async generateForecasts(
    assets: Asset[], 
    enrichmentData: Map<string, EnrichmentData>
  ): Promise<ForecastData> {
    const horizon = 90; // 90 days
    
    return {
      assetInventory: await this.forecastAssetInventory(assets, horizon),
      riskProjection: await this.forecastRiskProjection(assets, enrichmentData, horizon),
      costProjection: await this.forecastCostProjection(enrichmentData, horizon),
      complianceProjection: await this.forecastComplianceProjection(enrichmentData, horizon),
      maintenanceSchedule: await this.forecastMaintenanceSchedule(enrichmentData, horizon)
    };
  }

  private async detectAnomalies(
    assets: Asset[], 
    enrichmentData: Map<string, EnrichmentData>
  ): Promise<AnomalyDetection> {
    const anomalies: Anomaly[] = [];
    const patterns: Pattern[] = [];
    const alerts: Alert[] = [];

    // Detect risk anomalies
    const highRiskAssets = assets.filter(asset => asset.riskScore > 80);
    if (highRiskAssets.length > assets.length * 0.2) {
      anomalies.push({
        id: `anomaly-risk-${Date.now()}`,
        type: 'Risk',
        severity: 'High',
        description: `Unusually high number of high-risk assets: ${highRiskAssets.length}`,
        detectedAt: new Date(),
        affectedAssets: highRiskAssets.map(a => a.id),
        confidence: 0.8,
        recommendations: ['Review risk assessment criteria', 'Implement additional controls']
      });
    }

    // Detect cost anomalies
    const totalCost = Array.from(enrichmentData.values())
      .reduce((sum, data) => sum + data.costAnalysis.totalCost, 0);
    const avgCostPerAsset = totalCost / assets.length;
    
    const expensiveAssets = assets.filter(asset => {
      const enrichment = enrichmentData.get(asset.id);
      return enrichment && enrichment.costAnalysis.totalCost > avgCostPerAsset * 2;
    });

    if (expensiveAssets.length > 0) {
      anomalies.push({
        id: `anomaly-cost-${Date.now()}`,
        type: 'Cost',
        severity: 'Medium',
        description: `${expensiveAssets.length} assets with unusually high costs`,
        detectedAt: new Date(),
        affectedAssets: expensiveAssets.map(a => a.id),
        confidence: 0.7,
        recommendations: ['Review cost allocation', 'Optimize resource usage']
      });
    }

    // Detect security patterns
    const vulnerabilityCount = assets.reduce((sum, asset) => sum + asset.vulnerabilities.length, 0);
    if (vulnerabilityCount > assets.length * 2) {
      patterns.push({
        id: `pattern-security-${Date.now()}`,
        name: 'High Vulnerability Pattern',
        description: 'Assets show consistently high vulnerability counts',
        frequency: 0.8,
        confidence: 0.9,
        affectedAssets: assets.filter(a => a.vulnerabilities.length > 2).map(a => a.id),
        insights: ['Security posture needs improvement', 'Regular patching required']
      });
    }

    // Generate alerts
    if (anomalies.length > 0) {
      alerts.push({
        id: `alert-anomalies-${Date.now()}`,
        type: 'Anomaly',
        severity: 'High',
        title: 'Multiple Anomalies Detected',
        description: `${anomalies.length} anomalies detected in asset inventory`,
        triggeredAt: new Date(),
        affectedAssets: anomalies.flatMap(a => a.affectedAssets),
        acknowledged: false,
        resolved: false
      });
    }

    return { anomalies, patterns, alerts };
  }

  private async analyzeCorrelations(
    assets: Asset[], 
    enrichmentData: Map<string, EnrichmentData>
  ): Promise<CorrelationAnalysis> {
    const correlations: Correlation[] = [];
    const insights: string[] = [];
    const recommendations: string[] = [];

    // Risk vs Compliance correlation
    const riskComplianceData = assets.map(asset => {
      const enrichment = enrichmentData.get(asset.id);
      return {
        risk: asset.riskScore,
        compliance: enrichment?.complianceScore.overallScore || 0
      };
    });

    const riskComplianceCorr = this.calculateCorrelation(
      riskComplianceData.map(d => d.risk),
      riskComplianceData.map(d => d.compliance)
    );

    if (Math.abs(riskComplianceCorr) > 0.5) {
      correlations.push({
        variable1: 'Risk Score',
        variable2: 'Compliance Score',
        strength: riskComplianceCorr,
        significance: 0.8,
        description: 'Strong correlation between risk and compliance scores',
        implications: ['Higher compliance generally correlates with lower risk', 'Focus on compliance to reduce risk']
      });
    }

    // Asset type vs cost correlation
    const typeCostData = assets.map(asset => {
      const enrichment = enrichmentData.get(asset.id);
      return {
        type: asset.type,
        cost: enrichment?.costAnalysis.totalCost || 0
      };
    });

    const typeCostInsights = this.analyzeTypeCostCorrelation(typeCostData);
    insights.push(...typeCostInsights);

    // Generate recommendations based on correlations
    if (riskComplianceCorr < -0.5) {
      recommendations.push('Focus on improving compliance scores to reduce overall risk');
    }

    return { correlations, insights, recommendations };
  }

  private async generateAnalyticsRecommendations(
    assets: Asset[], 
    enrichmentData: Map<string, EnrichmentData>
  ): Promise<AnalyticsRecommendation[]> {
    const recommendations: AnalyticsRecommendation[] = [];

    // Risk-based recommendations
    const highRiskAssets = assets.filter(asset => asset.riskScore > 70);
    if (highRiskAssets.length > 0) {
      recommendations.push({
        id: `rec-risk-${Date.now()}`,
        category: 'Risk',
        priority: 'High',
        title: 'Address High-Risk Assets',
        description: `${highRiskAssets.length} assets have risk scores above 70`,
        impact: 'Reduces overall portfolio risk',
        effort: 'High',
        timeline: '4-6 weeks',
        cost: highRiskAssets.length * 5000,
        benefits: ['Reduced risk exposure', 'Better compliance', 'Improved security'],
        affectedAssets: highRiskAssets.map(a => a.id),
        confidence: 0.9
      });
    }

    // Cost optimization recommendations
    const totalCost = Array.from(enrichmentData.values())
      .reduce((sum, data) => sum + data.costAnalysis.totalCost, 0);
    const avgCost = totalCost / assets.length;

    const expensiveAssets = assets.filter(asset => {
      const enrichment = enrichmentData.get(asset.id);
      return enrichment && enrichment.costAnalysis.totalCost > avgCost * 1.5;
    });

    if (expensiveAssets.length > 0) {
      recommendations.push({
        id: `rec-cost-${Date.now()}`,
        category: 'Cost',
        priority: 'Medium',
        title: 'Optimize High-Cost Assets',
        description: `${expensiveAssets.length} assets have above-average costs`,
        impact: 'Reduces operational costs',
        effort: 'Medium',
        timeline: '2-4 weeks',
        cost: expensiveAssets.length * 2000,
        benefits: ['Cost reduction', 'Resource optimization', 'Better ROI'],
        affectedAssets: expensiveAssets.map(a => a.id),
        confidence: 0.7
      });
    }

    return recommendations;
  }

  private async generateSummary(
    assets: Asset[], 
    enrichmentData: Map<string, EnrichmentData>
  ): Promise<AnalyticsSummary> {
    const totalAssets = assets.length;
    
    const riskDistribution = {
      'Low': assets.filter(a => a.riskScore < 40).length,
      'Medium': assets.filter(a => a.riskScore >= 40 && a.riskScore < 70).length,
      'High': assets.filter(a => a.riskScore >= 70 && a.riskScore < 90).length,
      'Critical': assets.filter(a => a.riskScore >= 90).length
    };

    const complianceStatus = {
      'Compliant': Array.from(enrichmentData.values())
        .filter(data => data.complianceScore.overallScore >= 80).length,
      'Partially Compliant': Array.from(enrichmentData.values())
        .filter(data => data.complianceScore.overallScore >= 60 && data.complianceScore.overallScore < 80).length,
      'Non-Compliant': Array.from(enrichmentData.values())
        .filter(data => data.complianceScore.overallScore < 60).length
    };

    const totalCost = Array.from(enrichmentData.values())
      .reduce((sum, data) => sum + data.costAnalysis.totalCost, 0);

    const costAnalysis: CostSummary = {
      totalCost,
      costPerAsset: totalCost / totalAssets,
      costTrend: 'Stable',
      optimizationPotential: totalCost * 0.15,
      topCostDrivers: ['Infrastructure', 'Licensing', 'Maintenance']
    };

    const avgRiskScore = assets.reduce((sum, asset) => sum + asset.riskScore, 0) / totalAssets;
    const avgComplianceScore = Array.from(enrichmentData.values())
      .reduce((sum, data) => sum + data.complianceScore.overallScore, 0) / totalAssets;
    const vulnerabilityCount = assets.reduce((sum, asset) => sum + asset.vulnerabilities.length, 0);
    const criticalIssues = assets.filter(asset => asset.riskScore > 80).length;

    const performanceMetrics: PerformanceSummary = {
      averageRiskScore: Math.round(avgRiskScore),
      averageComplianceScore: Math.round(avgComplianceScore),
      vulnerabilityCount,
      criticalIssues,
      performanceTrend: avgRiskScore > 60 ? 'Deteriorating' : 'Stable'
    };

    const keyInsights = [
      `${totalAssets} assets managed with ${Math.round(avgRiskScore)} average risk score`,
      `${complianceStatus.Compliant} assets are fully compliant`,
      `Total operational cost: $${totalCost.toLocaleString()}`,
      `${vulnerabilityCount} vulnerabilities require attention`
    ];

    const actionItems = [
      'Review high-risk assets and implement mitigation strategies',
      'Address compliance gaps in non-compliant assets',
      'Optimize costs for expensive assets',
      'Schedule maintenance for assets approaching end-of-life'
    ];

    return {
      totalAssets,
      riskDistribution,
      complianceStatus,
      costAnalysis,
      performanceMetrics,
      keyInsights,
      actionItems
    };
  }

  private calculateTrend(dataPoints: DataPoint[]): TrendData {
    if (dataPoints.length < 2) {
      return {
        direction: 'Stable',
        rate: 0,
        confidence: 0,
        dataPoints,
        prediction: []
      };
    }

    // Simple linear regression for trend calculation
    const n = dataPoints.length;
    const x = dataPoints.map((_, i) => i);
    const y = dataPoints.map(dp => dp.value);

    const sumX = x.reduce((sum, val) => sum + val, 0);
    const sumY = y.reduce((sum, val) => sum + val, 0);
    const sumXY = x.reduce((sum, val, i) => sum + val * y[i], 0);
    const sumXX = x.reduce((sum, val) => sum + val * val, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    const rate = slope * 100; // Convert to percentage
    const direction = rate > 5 ? 'Increasing' : rate < -5 ? 'Decreasing' : 'Stable';
    const confidence = Math.min(1, Math.abs(rate) / 50); // Higher rate = higher confidence

    // Generate prediction for next 7 days
    const prediction: DataPoint[] = [];
    for (let i = 0; i < 7; i++) {
      const futureX = n + i;
      const predictedValue = slope * futureX + intercept;
      prediction.push({
        date: new Date(Date.now() + i * 24 * 60 * 60 * 1000),
        value: Math.max(0, predictedValue)
      });
    }

    return {
      direction,
      rate: Math.round(rate * 100) / 100,
      confidence: Math.round(confidence * 100) / 100,
      dataPoints,
      prediction
    };
  }

  private calculateCorrelation(x: number[], y: number[]): number {
    if (x.length !== y.length || x.length < 2) return 0;

    const n = x.length;
    const sumX = x.reduce((sum, val) => sum + val, 0);
    const sumY = y.reduce((sum, val) => sum + val, 0);
    const sumXY = x.reduce((sum, val, i) => sum + val * y[i], 0);
    const sumXX = x.reduce((sum, val) => sum + val * val, 0);
    const sumYY = y.reduce((sum, val) => sum + val * val, 0);

    const numerator = n * sumXY - sumX * sumY;
    const denominator = Math.sqrt((n * sumXX - sumX * sumX) * (n * sumYY - sumY * sumY));

    return denominator === 0 ? 0 : numerator / denominator;
  }

  private analyzeTypeCostCorrelation(data: { type: string; cost: number }[]): string[] {
    const typeCosts = data.reduce((acc, item) => {
      if (!acc[item.type]) {
        acc[item.type] = { total: 0, count: 0 };
      }
      acc[item.type].total += item.cost;
      acc[item.type].count += 1;
      return acc;
    }, {} as Record<string, { total: number; count: number }>);

    const avgCosts = Object.entries(typeCosts).map(([type, data]) => ({
      type,
      avgCost: data.total / data.count
    })).sort((a, b) => b.avgCost - a.avgCost);

    return [
      `${avgCosts[0].type} assets have the highest average cost ($${Math.round(avgCosts[0].avgCost)})`,
      `Consider optimizing ${avgCosts[0].type} assets for cost reduction`
    ];
  }

  private generateHistoricalData(key: string, currentValue: number, days: number): DataPoint[] {
    const data: DataPoint[] = [];
    const now = new Date();
    
    for (let i = days; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const value = currentValue + (Math.random() - 0.5) * currentValue * 0.1; // Add some variance
      data.push({ date, value: Math.max(0, value) });
    }
    
    return data;
  }

  private async forecastAssetInventory(assets: Asset[], horizon: number): Promise<Forecast> {
    const currentCount = assets.length;
    const growthRate = 0.05; // 5% monthly growth
    
    const predictions: ForecastPoint[] = [];
    for (let i = 1; i <= horizon; i++) {
      const date = new Date(Date.now() + i * 24 * 60 * 60 * 1000);
      const predictedValue = currentCount * (1 + growthRate * (i / 30)); // Monthly growth
      const variance = predictedValue * 0.1; // 10% variance
      
      predictions.push({
        date,
        value: Math.round(predictedValue),
        lowerBound: Math.round(predictedValue - variance),
        upperBound: Math.round(predictedValue + variance),
        probability: 0.7
      });
    }

    return {
      horizon,
      confidence: 0.7,
      predictions,
      scenarios: [
        {
          name: 'Conservative',
          description: 'Slow growth scenario',
          probability: 0.3,
          impact: 'Low',
          predictions: predictions.map(p => ({ ...p, value: Math.round(p.value * 0.8) }))
        },
        {
          name: 'Optimistic',
          description: 'Fast growth scenario',
          probability: 0.2,
          impact: 'High',
          predictions: predictions.map(p => ({ ...p, value: Math.round(p.value * 1.3) }))
        }
      ]
    };
  }

  private async forecastRiskProjection(
    assets: Asset[], 
    enrichmentData: Map<string, EnrichmentData>, 
    horizon: number
  ): Promise<Forecast> {
    const avgRisk = assets.reduce((sum, asset) => sum + asset.riskScore, 0) / assets.length;
    
    const predictions: ForecastPoint[] = [];
    for (let i = 1; i <= horizon; i++) {
      const date = new Date(Date.now() + i * 24 * 60 * 60 * 1000);
      const predictedValue = avgRisk + (Math.random() - 0.5) * 10; // Some variance
      
      predictions.push({
        date,
        value: Math.max(0, Math.min(100, Math.round(predictedValue))),
        lowerBound: Math.max(0, Math.round(predictedValue - 5)),
        upperBound: Math.min(100, Math.round(predictedValue + 5)),
        probability: 0.6
      });
    }

    return {
      horizon,
      confidence: 0.6,
      predictions,
      scenarios: []
    };
  }

  private async forecastCostProjection(enrichmentData: Map<string, EnrichmentData>, horizon: number): Promise<Forecast> {
    const totalCost = Array.from(enrichmentData.values())
      .reduce((sum, data) => sum + data.costAnalysis.totalCost, 0);
    
    const predictions: ForecastPoint[] = [];
    for (let i = 1; i <= horizon; i++) {
      const date = new Date(Date.now() + i * 24 * 60 * 60 * 1000);
      const growthRate = 0.02; // 2% monthly growth
      const predictedValue = totalCost * (1 + growthRate * (i / 30));
      
      predictions.push({
        date,
        value: Math.round(predictedValue),
        lowerBound: Math.round(predictedValue * 0.9),
        upperBound: Math.round(predictedValue * 1.1),
        probability: 0.8
      });
    }

    return {
      horizon,
      confidence: 0.8,
      predictions,
      scenarios: []
    };
  }

  private async forecastComplianceProjection(enrichmentData: Map<string, EnrichmentData>, horizon: number): Promise<Forecast> {
    const avgCompliance = Array.from(enrichmentData.values())
      .reduce((sum, data) => sum + data.complianceScore.overallScore, 0) / enrichmentData.size;
    
    const predictions: ForecastPoint[] = [];
    for (let i = 1; i <= horizon; i++) {
      const date = new Date(Date.now() + i * 24 * 60 * 60 * 1000);
      const improvement = 0.5; // Gradual improvement
      const predictedValue = Math.min(100, avgCompliance + improvement * (i / 30));
      
      predictions.push({
        date,
        value: Math.round(predictedValue),
        lowerBound: Math.max(0, Math.round(predictedValue - 5)),
        upperBound: Math.min(100, Math.round(predictedValue + 5)),
        probability: 0.7
      });
    }

    return {
      horizon,
      confidence: 0.7,
      predictions,
      scenarios: []
    };
  }

  private async forecastMaintenanceSchedule(enrichmentData: Map<string, EnrichmentData>, horizon: number): Promise<Forecast> {
    const maintenanceEvents = Array.from(enrichmentData.values())
      .flatMap(data => data.lifecycleStage.maintenanceSchedule);
    
    const predictions: ForecastPoint[] = [];
    for (let i = 1; i <= horizon; i++) {
      const date = new Date(Date.now() + i * 24 * 60 * 60 * 1000);
      const eventsOnDate = maintenanceEvents.filter(event => 
        Math.abs(event.scheduledDate.getTime() - date.getTime()) < 24 * 60 * 60 * 1000
      ).length;
      
      predictions.push({
        date,
        value: eventsOnDate,
        lowerBound: Math.max(0, eventsOnDate - 1),
        upperBound: eventsOnDate + 1,
        probability: 0.9
      });
    }

    return {
      horizon,
      confidence: 0.9,
      predictions,
      scenarios: []
    };
  }
}

export const analyticsService = new AnalyticsService();