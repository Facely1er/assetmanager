import { Asset } from '../types/asset';
import { EnrichmentData } from './dataEnrichmentService';
import { logError } from '../utils/errorHandling';

export interface ExternalDataSource {
  id: string;
  name: string;
  type: 'vulnerability' | 'threat_intelligence' | 'compliance' | 'asset_discovery' | 'cost_analysis' | 'performance_monitoring';
  description: string;
  baseUrl: string;
  apiKey?: string;
  isActive: boolean;
  lastSync?: Date;
  syncFrequency: 'realtime' | 'hourly' | 'daily' | 'weekly';
  config: Record<string, any>;
  metadata: {
    version: string;
    supportedFeatures: string[];
    rateLimit: {
      requests: number;
      period: 'minute' | 'hour' | 'day';
    };
  };
}

export interface VulnerabilityData {
  cveId: string;
  title: string;
  description: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  cvssScore: number;
  publishedDate: Date;
  lastModifiedDate: Date;
  affectedProducts: string[];
  references: string[];
  exploitAvailable: boolean;
  patchAvailable: boolean;
  assetIds: string[];
}

export interface ThreatIntelligenceData {
  threatId: string;
  title: string;
  description: string;
  category: 'malware' | 'phishing' | 'exploit' | 'vulnerability' | 'attack_pattern';
  severity: 'critical' | 'high' | 'medium' | 'low';
  confidence: number; // 0-100
  source: string;
  publishedDate: Date;
  lastSeen: Date;
  indicators: {
    ipAddresses: string[];
    domains: string[];
    fileHashes: string[];
    urls: string[];
  };
  mitigation: string[];
  assetIds: string[];
}

export interface ComplianceData {
  frameworkId: string;
  frameworkName: string;
  controlId: string;
  controlTitle: string;
  controlDescription: string;
  requirement: string;
  implementation: string;
  evidence: string[];
  status: 'compliant' | 'non_compliant' | 'partial' | 'not_applicable';
  lastAssessed: Date;
  nextAssessment: Date;
  assessor: string;
  assetIds: string[];
}

export interface AssetDiscoveryData {
  assetId: string;
  discoveredAt: Date;
  source: string;
  attributes: {
    hostname?: string;
    ipAddress?: string;
    macAddress?: string;
    operatingSystem?: string;
    openPorts?: number[];
    services?: string[];
    installedSoftware?: string[];
    networkSegment?: string;
    physicalLocation?: string;
  };
  confidence: number; // 0-100
  isNew: boolean;
  isChanged: boolean;
  changes: Record<string, any>;
}

export interface CostAnalysisData {
  assetId: string;
  costCategory: 'licensing' | 'infrastructure' | 'maintenance' | 'security' | 'compliance' | 'personnel';
  amount: number;
  currency: string;
  period: 'monthly' | 'quarterly' | 'annually';
  startDate: Date;
  endDate: Date;
  provider: string;
  description: string;
  isRecurring: boolean;
  tags: string[];
}

export interface PerformanceMonitoringData {
  assetId: string;
  metricName: string;
  metricValue: number;
  unit: string;
  timestamp: Date;
  category: 'cpu' | 'memory' | 'disk' | 'network' | 'application' | 'security';
  threshold: {
    warning: number;
    critical: number;
  };
  status: 'normal' | 'warning' | 'critical';
  trend: 'increasing' | 'decreasing' | 'stable';
}

export interface IntegrationResult {
  success: boolean;
  dataCount: number;
  errors: string[];
  warnings: string[];
  lastSync: Date;
  nextSync: Date;
  metadata: {
    source: string;
    version: string;
    processingTime: number;
  };
}

export interface EnrichmentRule {
  id: string;
  name: string;
  description: string;
  source: string;
  targetField: string;
  condition: {
    field: string;
    operator: 'equals' | 'contains' | 'starts_with' | 'ends_with' | 'regex' | 'in' | 'not_in';
    value: any;
  };
  transformation: {
    type: 'direct' | 'mapping' | 'calculation' | 'lookup';
    config: any;
  };
  isActive: boolean;
  priority: number;
  createdAt: Date;
  updatedAt: Date;
}

class ExternalDataIntegrationService {
  private dataSources: Map<string, ExternalDataSource> = new Map();
  private enrichmentRules: Map<string, EnrichmentRule> = new Map();
  private syncIntervals: Map<string, NodeJS.Timeout> = new Map();

  constructor() {
    this.initializeDefaultDataSources();
    this.initializeDefaultEnrichmentRules();
  }

  private initializeDefaultDataSources() {
    const defaultSources: ExternalDataSource[] = [
      {
        id: 'nvd',
        name: 'National Vulnerability Database',
        type: 'vulnerability',
        description: 'NIST National Vulnerability Database for CVE data',
        baseUrl: 'https://services.nvd.nist.gov/rest/json/cves/2.0',
        isActive: true,
        syncFrequency: 'daily',
        config: {
          maxResults: 1000,
          includeRejected: false,
          includeRejectedCve: false
        },
        metadata: {
          version: '2.0',
          supportedFeatures: ['cve_search', 'cve_history', 'cpe_matching'],
          rateLimit: {
            requests: 50,
            period: 'minute'
          }
        }
      },
      {
        id: 'mitre_attack',
        name: 'MITRE ATT&CK',
        type: 'threat_intelligence',
        description: 'MITRE ATT&CK framework for threat intelligence',
        baseUrl: 'https://attack.mitre.org/api',
        isActive: true,
        syncFrequency: 'weekly',
        config: {
          includeDeprecated: false,
          includeRevoked: false
        },
        metadata: {
          version: '1.0',
          supportedFeatures: ['techniques', 'tactics', 'mitigations', 'groups'],
          rateLimit: {
            requests: 100,
            period: 'hour'
          }
        }
      },
      {
        id: 'cis_controls',
        name: 'CIS Controls',
        type: 'compliance',
        description: 'Center for Internet Security Controls',
        baseUrl: 'https://api.cisecurity.org',
        isActive: true,
        syncFrequency: 'monthly',
        config: {
          version: '8.0',
          includeImplementation: true
        },
        metadata: {
          version: '8.0',
          supportedFeatures: ['controls', 'safeguards', 'implementation_guides'],
          rateLimit: {
            requests: 1000,
            period: 'day'
          }
        }
      },
      {
        id: 'nmap_scanner',
        name: 'Nmap Network Scanner',
        type: 'asset_discovery',
        description: 'Network discovery and port scanning',
        baseUrl: import.meta.env.VITE_NMAP_SCANNER_URL || 'http://localhost:8080/api',
        isActive: false,
        syncFrequency: 'daily',
        config: {
          scanRange: '192.168.1.0/24',
          scanType: 'syn_scan',
          portRange: '1-65535'
        },
        metadata: {
          version: '1.0',
          supportedFeatures: ['port_scan', 'os_detection', 'service_detection'],
          rateLimit: {
            requests: 10,
            period: 'minute'
          }
        }
      },
      {
        id: 'aws_cost_explorer',
        name: 'AWS Cost Explorer',
        type: 'cost_analysis',
        description: 'AWS cost and usage data',
        baseUrl: 'https://ce.us-east-1.amazonaws.com',
        isActive: false,
        syncFrequency: 'daily',
        config: {
          region: 'us-east-1',
          granularity: 'DAILY',
          metrics: ['BlendedCost', 'UnblendedCost']
        },
        metadata: {
          version: '1.0',
          supportedFeatures: ['cost_analysis', 'usage_reports', 'forecasting'],
          rateLimit: {
            requests: 100,
            period: 'hour'
          }
        }
      },
      {
        id: 'prometheus',
        name: 'Prometheus Monitoring',
        type: 'performance_monitoring',
        description: 'System and application performance metrics',
        baseUrl: import.meta.env.VITE_PROMETHEUS_URL || 'http://localhost:9090/api/v1',
        isActive: false,
        syncFrequency: 'realtime',
        config: {
          queryInterval: '5m',
          retentionPeriod: '30d'
        },
        metadata: {
          version: '2.0',
          supportedFeatures: ['metrics_query', 'alerts', 'recording_rules'],
          rateLimit: {
            requests: 1000,
            period: 'minute'
          }
        }
      }
    ];

    defaultSources.forEach(source => {
      this.dataSources.set(source.id, source);
    });
  }

  private initializeDefaultEnrichmentRules() {
    const defaultRules: EnrichmentRule[] = [
      {
        id: 'cve_enrichment',
        name: 'CVE Vulnerability Enrichment',
        description: 'Enrich assets with CVE data based on software versions',
        source: 'nvd',
        targetField: 'vulnerabilities',
        condition: {
          field: 'software',
          operator: 'contains',
          value: ''
        },
        transformation: {
          type: 'lookup',
          config: {
            lookupField: 'software',
            matchField: 'affectedProducts'
          }
        },
        isActive: true,
        priority: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'threat_intelligence_enrichment',
        name: 'Threat Intelligence Enrichment',
        description: 'Enrich assets with threat intelligence data',
        source: 'mitre_attack',
        targetField: 'threatIntelligence',
        condition: {
          field: 'type',
          operator: 'in',
          value: ['server', 'workstation', 'network_device']
        },
        transformation: {
          type: 'mapping',
          config: {
            assetTypeMapping: {
              'server': 'enterprise',
              'workstation': 'endpoint',
              'network_device': 'infrastructure'
            }
          }
        },
        isActive: true,
        priority: 2,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'compliance_enrichment',
        name: 'Compliance Framework Enrichment',
        description: 'Enrich assets with compliance framework data',
        source: 'cis_controls',
        targetField: 'complianceFrameworks',
        condition: {
          field: 'criticality',
          operator: 'in',
          value: ['critical', 'high']
        },
        transformation: {
          type: 'mapping',
          config: {
            criticalityMapping: {
              'critical': ['CIS_Controls_v8'],
              'high': ['CIS_Controls_v8', 'NIST_CSF']
            }
          }
        },
        isActive: true,
        priority: 3,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    defaultRules.forEach(rule => {
      this.enrichmentRules.set(rule.id, rule);
    });
  }

  async addDataSource(source: Omit<ExternalDataSource, 'id'>): Promise<ExternalDataSource> {
    const newSource: ExternalDataSource = {
      ...source,
      id: `source-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    };

    this.dataSources.set(newSource.id, newSource);
    
    if (newSource.isActive) {
      this.startSync(newSource.id);
    }

    return newSource;
  }

  async updateDataSource(id: string, updates: Partial<ExternalDataSource>): Promise<ExternalDataSource | null> {
    const source = this.dataSources.get(id);
    if (!source) return null;

    const updatedSource = { ...source, ...updates };
    this.dataSources.set(id, updatedSource);

    // Restart sync if active status changed
    if (updates.isActive !== undefined) {
      if (updates.isActive) {
        this.startSync(id);
      } else {
        this.stopSync(id);
      }
    }

    return updatedSource;
  }

  async deleteDataSource(id: string): Promise<boolean> {
    this.stopSync(id);
    return this.dataSources.delete(id);
  }

  getDataSources(): ExternalDataSource[] {
    return Array.from(this.dataSources.values());
  }

  getDataSource(id: string): ExternalDataSource | null {
    return this.dataSources.get(id) || null;
  }

  async syncDataSource(id: string): Promise<IntegrationResult> {
    const source = this.dataSources.get(id);
    if (!source) {
      throw new Error(`Data source not found: ${id}`);
    }

    const startTime = Date.now();
    const result: IntegrationResult = {
      success: true,
      dataCount: 0,
      errors: [],
      warnings: [],
      lastSync: new Date(),
      nextSync: this.calculateNextSync(source),
      metadata: {
        source: source.name,
        version: source.metadata.version,
        processingTime: 0
      }
    };

    try {
      switch (source.type) {
        case 'vulnerability':
          await this.syncVulnerabilityData(source);
          break;
        case 'threat_intelligence':
          await this.syncThreatIntelligenceData(source);
          break;
        case 'compliance':
          await this.syncComplianceData(source);
          break;
        case 'asset_discovery':
          await this.syncAssetDiscoveryData(source);
          break;
        case 'cost_analysis':
          await this.syncCostAnalysisData(source);
          break;
        case 'performance_monitoring':
          await this.syncPerformanceMonitoringData(source);
          break;
        default:
          throw new Error(`Unsupported data source type: ${source.type}`);
      }

      result.dataCount = await this.getDataCount(source.type);
      result.metadata.processingTime = Date.now() - startTime;
      
      // Update last sync time
      source.lastSync = result.lastSync;
      this.dataSources.set(id, source);

    } catch (error) {
      result.success = false;
      result.errors.push(error instanceof Error ? error.message : 'Unknown error');
      logError(error, 'ExternalDataIntegrationService.syncDataSource', { sourceId: id });
    }

    return result;
  }

  private async syncVulnerabilityData(source: ExternalDataSource): Promise<void> {
    // Mock implementation - in real scenario, this would call the NVD API
    if (import.meta.env.DEV) {
      console.log(`Syncing vulnerability data from ${source.name}`);
    }

    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Mock vulnerability data
    const mockVulnerabilities: VulnerabilityData[] = [
      {
        cveId: 'CVE-2023-1234',
        title: 'Remote Code Execution Vulnerability',
        description: 'A critical vulnerability that allows remote code execution',
        severity: 'critical',
        cvssScore: 9.8,
        publishedDate: new Date('2023-01-15'),
        lastModifiedDate: new Date('2023-01-20'),
        affectedProducts: ['Windows Server 2019', 'Windows Server 2022'],
        references: ['https://example.com/cve-2023-1234'],
        exploitAvailable: true,
        patchAvailable: true,
        assetIds: []
      }
    ];

    // Store vulnerabilities (in real implementation, this would be stored in database)
    if (import.meta.env.DEV) {
      console.log(`Synced ${mockVulnerabilities.length} vulnerabilities`);
    }
  }

  private async syncThreatIntelligenceData(source: ExternalDataSource): Promise<void> {
    // Mock implementation - in real scenario, this would call the MITRE ATT&CK API
    if (import.meta.env.DEV) {
      console.log(`Syncing threat intelligence data from ${source.name}`);
    }

    await new Promise(resolve => setTimeout(resolve, 1000));

    const mockThreats: ThreatIntelligenceData[] = [
      {
        threatId: 'T1055',
        title: 'Process Injection',
        description: 'Adversaries may inject code into processes to evade detection',
        category: 'attack_pattern',
        severity: 'high',
        confidence: 85,
        source: 'MITRE ATT&CK',
        publishedDate: new Date('2023-01-01'),
        lastSeen: new Date('2023-01-15'),
        indicators: {
          ipAddresses: [],
          domains: [],
          fileHashes: [],
          urls: []
        },
        mitigation: ['Use process monitoring', 'Implement application whitelisting'],
        assetIds: []
      }
    ];

    if (import.meta.env.DEV) {
      console.log(`Synced ${mockThreats.length} threat intelligence entries`);
    }
  }

  private async syncComplianceData(source: ExternalDataSource): Promise<void> {
    // Mock implementation - in real scenario, this would call the CIS Controls API
    if (import.meta.env.DEV) {
      console.log(`Syncing compliance data from ${source.name}`);
    }

    await new Promise(resolve => setTimeout(resolve, 1000));

    const mockCompliance: ComplianceData[] = [
      {
        frameworkId: 'cis_controls_v8',
        frameworkName: 'CIS Controls v8',
        controlId: 'CIS-1',
        controlTitle: 'Inventory and Control of Enterprise Assets',
        controlDescription: 'Actively manage all enterprise assets',
        requirement: 'Maintain an inventory of all enterprise assets',
        implementation: 'Deploy automated asset discovery tools',
        evidence: ['Asset inventory report', 'Discovery tool logs'],
        status: 'compliant',
        lastAssessed: new Date('2023-01-10'),
        nextAssessment: new Date('2023-04-10'),
        assessor: 'Security Team',
        assetIds: []
      }
    ];

    if (import.meta.env.DEV) {
      console.log(`Synced ${mockCompliance.length} compliance controls`);
    }
  }

  private async syncAssetDiscoveryData(source: ExternalDataSource): Promise<void> {
    // Mock implementation - in real scenario, this would call the Nmap scanner API
    if (import.meta.env.DEV) {
      console.log(`Syncing asset discovery data from ${source.name}`);
    }

    await new Promise(resolve => setTimeout(resolve, 2000));

    const mockAssets: AssetDiscoveryData[] = [
      {
        assetId: 'discovered-001',
        discoveredAt: new Date(),
        source: 'nmap_scanner',
        attributes: {
          hostname: 'server-01.local',
          ipAddress: '192.168.1.100',
          macAddress: '00:11:22:33:44:55',
          operatingSystem: 'Linux Ubuntu 20.04',
          openPorts: [22, 80, 443, 3306],
          services: ['ssh', 'http', 'https', 'mysql'],
          networkSegment: '192.168.1.0/24',
          physicalLocation: 'Data Center A'
        },
        confidence: 95,
        isNew: true,
        isChanged: false,
        changes: {}
      }
    ];

    if (import.meta.env.DEV) {
      console.log(`Synced ${mockAssets.length} discovered assets`);
    }
  }

  private async syncCostAnalysisData(source: ExternalDataSource): Promise<void> {
    // Mock implementation - in real scenario, this would call the AWS Cost Explorer API
    if (import.meta.env.DEV) {
      console.log(`Syncing cost analysis data from ${source.name}`);
    }

    await new Promise(resolve => setTimeout(resolve, 1500));

    const mockCosts: CostAnalysisData[] = [
      {
        assetId: 'aws-ec2-001',
        costCategory: 'infrastructure',
        amount: 150.00,
        currency: 'USD',
        period: 'monthly',
        startDate: new Date('2023-01-01'),
        endDate: new Date('2023-01-31'),
        provider: 'AWS',
        description: 'EC2 instance running costs',
        isRecurring: true,
        tags: ['production', 'web-server']
      }
    ];

    if (import.meta.env.DEV) {
      console.log(`Synced ${mockCosts.length} cost records`);
    }
  }

  private async syncPerformanceMonitoringData(source: ExternalDataSource): Promise<void> {
    // Mock implementation - in real scenario, this would call the Prometheus API
    if (import.meta.env.DEV) {
      console.log(`Syncing performance monitoring data from ${source.name}`);
    }

    await new Promise(resolve => setTimeout(resolve, 500));

    const mockMetrics: PerformanceMonitoringData[] = [
      {
        assetId: 'server-001',
        metricName: 'cpu_usage_percent',
        metricValue: 75.5,
        unit: 'percent',
        timestamp: new Date(),
        category: 'cpu',
        threshold: {
          warning: 80,
          critical: 90
        },
        status: 'normal',
        trend: 'stable'
      }
    ];

    if (import.meta.env.DEV) {
      console.log(`Synced ${mockMetrics.length} performance metrics`);
    }
  }

  private async getDataCount(type: string): Promise<number> {
    // Mock implementation - in real scenario, this would query the database
    const mockCounts: Record<string, number> = {
      'vulnerability': 1500,
      'threat_intelligence': 500,
      'compliance': 200,
      'asset_discovery': 50,
      'cost_analysis': 100,
      'performance_monitoring': 10000
    };
    
    return mockCounts[type] || 0;
  }

  private calculateNextSync(source: ExternalDataSource): Date {
    const now = new Date();
    const nextSync = new Date(now);

    switch (source.syncFrequency) {
      case 'realtime':
        return new Date(now.getTime() + 60000); // 1 minute
      case 'hourly':
        return new Date(now.getTime() + 60 * 60 * 1000); // 1 hour
      case 'daily':
        return new Date(now.getTime() + 24 * 60 * 60 * 1000); // 1 day
      case 'weekly':
        return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 1 week
      default:
        return new Date(now.getTime() + 24 * 60 * 60 * 1000); // Default to daily
    }
  }

  private startSync(sourceId: string) {
    const source = this.dataSources.get(sourceId);
    if (!source) return;

    // Clear existing interval
    this.stopSync(sourceId);

    const interval = setInterval(async () => {
      try {
        await this.syncDataSource(sourceId);
      } catch (error) {
        logError(error, 'ExternalDataIntegrationService.startSync', { sourceId });
      }
    }, this.getSyncInterval(source.syncFrequency));

    this.syncIntervals.set(sourceId, interval);
  }

  private stopSync(sourceId: string) {
    const interval = this.syncIntervals.get(sourceId);
    if (interval) {
      clearInterval(interval);
      this.syncIntervals.delete(sourceId);
    }
  }

  private getSyncInterval(frequency: string): number {
    switch (frequency) {
      case 'realtime':
        return 60000; // 1 minute
      case 'hourly':
        return 60 * 60 * 1000; // 1 hour
      case 'daily':
        return 24 * 60 * 60 * 1000; // 1 day
      case 'weekly':
        return 7 * 24 * 60 * 60 * 1000; // 1 week
      default:
        return 24 * 60 * 60 * 1000; // Default to daily
    }
  }

  async enrichAssets(assets: Asset[]): Promise<Map<string, EnrichmentData>> {
    const enrichmentData = new Map<string, EnrichmentData>();

    for (const asset of assets) {
      try {
        const enriched = await this.enrichAsset(asset);
        enrichmentData.set(asset.id, enriched);
      } catch (error) {
        logError(error, 'ExternalDataIntegrationService.enrichAssets', { assetId: asset.id });
      }
    }

    return enrichmentData;
  }

  private async enrichAsset(asset: Asset): Promise<EnrichmentData> {
    const enriched: EnrichmentData = {
      assetId: asset.id,
      enrichedAt: new Date(),
      riskInsights: {
        riskScore: asset.riskScore,
        riskFactors: [],
        riskTrend: 'stable',
        lastAssessed: new Date()
      },
      complianceScore: {
        overallScore: 0,
        frameworkScores: new Map(),
        lastAssessed: new Date(),
        gaps: [],
        recommendations: []
      },
      lifecycleStage: {
        stage: 'active',
        stageProgress: 50,
        estimatedEndOfLife: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
        maintenanceSchedule: []
      },
      performanceMetrics: {
        availability: 99.9,
        responseTime: 100,
        throughput: 1000,
        errorRate: 0.1,
        lastMeasured: new Date()
      },
      threatIntelligence: {
        threatLevel: 'low',
        knownThreats: [],
        indicators: [],
        lastUpdated: new Date()
      },
      costAnalysis: {
        totalCost: 0,
        costBreakdown: new Map(),
        costTrend: 'stable',
        lastUpdated: new Date()
      },
      dependencyAnalysis: {
        dependencies: [],
        dependents: [],
        criticality: 'low',
        lastAnalyzed: new Date()
      },
      recommendations: []
    };

    // Apply enrichment rules
    for (const rule of this.enrichmentRules.values()) {
      if (!rule.isActive) continue;
      
      if (this.evaluateCondition(asset, rule.condition)) {
        await this.applyTransformation(asset, enriched, rule);
      }
    }

    return enriched;
  }

  private evaluateCondition(asset: Asset, condition: any): boolean {
    const fieldValue = this.getFieldValue(asset, condition.field);
    
    switch (condition.operator) {
      case 'equals':
        return fieldValue === condition.value;
      case 'contains':
        return String(fieldValue).toLowerCase().includes(String(condition.value).toLowerCase());
      case 'starts_with':
        return String(fieldValue).startsWith(condition.value);
      case 'ends_with':
        return String(fieldValue).endsWith(condition.value);
      case 'regex':
        return new RegExp(condition.value).test(String(fieldValue));
      case 'in':
        return Array.isArray(condition.value) && condition.value.includes(fieldValue);
      case 'not_in':
        return Array.isArray(condition.value) && !condition.value.includes(fieldValue);
      default:
        return false;
    }
  }

  private getFieldValue(asset: Asset, field: string): any {
    const fields = field.split('.');
    let value: any = asset;
    
    for (const f of fields) {
      value = value?.[f];
    }
    
    return value;
  }

  private async applyTransformation(asset: Asset, enriched: EnrichmentData, rule: EnrichmentRule): Promise<void> {
    // Mock implementation - in real scenario, this would apply the actual transformation
    if (import.meta.env.DEV) {
      console.log(`Applying transformation rule: ${rule.name} to asset: ${asset.id}`);
    }
  }

  async addEnrichmentRule(rule: Omit<EnrichmentRule, 'id' | 'createdAt' | 'updatedAt'>): Promise<EnrichmentRule> {
    const newRule: EnrichmentRule = {
      ...rule,
      id: `rule-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.enrichmentRules.set(newRule.id, newRule);
    return newRule;
  }

  async updateEnrichmentRule(id: string, updates: Partial<EnrichmentRule>): Promise<EnrichmentRule | null> {
    const rule = this.enrichmentRules.get(id);
    if (!rule) return null;

    const updatedRule = { ...rule, ...updates, updatedAt: new Date() };
    this.enrichmentRules.set(id, updatedRule);
    return updatedRule;
  }

  async deleteEnrichmentRule(id: string): Promise<boolean> {
    return this.enrichmentRules.delete(id);
  }

  getEnrichmentRules(): EnrichmentRule[] {
    return Array.from(this.enrichmentRules.values());
  }

  getEnrichmentRule(id: string): EnrichmentRule | null {
    return this.enrichmentRules.get(id) || null;
  }

  async testDataSourceConnection(sourceId: string): Promise<{ success: boolean; message: string; latency: number }> {
    const source = this.dataSources.get(sourceId);
    if (!source) {
      return { success: false, message: 'Data source not found', latency: 0 };
    }

    const startTime = Date.now();
    
    try {
      // Mock connection test - in real scenario, this would make an actual API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const latency = Date.now() - startTime;
      return { success: true, message: 'Connection successful', latency };
    } catch (error) {
      const latency = Date.now() - startTime;
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Connection failed', 
        latency 
      };
    }
  }

  async getIntegrationStatus(): Promise<{
    totalSources: number;
    activeSources: number;
    lastSync: Date | null;
    nextSync: Date | null;
    syncErrors: number;
  }> {
    const sources = Array.from(this.dataSources.values());
    const activeSources = sources.filter(s => s.isActive);
    const lastSync = sources.reduce((latest, source) => {
      if (!source.lastSync) return latest;
      return !latest || source.lastSync > latest ? source.lastSync : latest;
    }, null as Date | null);
    
    const nextSync = sources.reduce((earliest, source) => {
      const next = this.calculateNextSync(source);
      return !earliest || next < earliest ? next : earliest;
    }, null as Date | null);

    return {
      totalSources: sources.length,
      activeSources: activeSources.length,
      lastSync,
      nextSync,
      syncErrors: 0 // Mock value
    };
  }
}

export const externalDataIntegrationService = new ExternalDataIntegrationService();