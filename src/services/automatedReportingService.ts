import { Asset } from '../types/asset';
import { EnrichmentData } from './dataEnrichmentService';
import { AnalyticsInsights } from './analyticsService';
import { dataEnrichmentService } from './dataEnrichmentService';
import { analyticsService } from './analyticsService';
import { logError } from '../utils/errorHandling';

export interface ReportSchedule {
  id: string;
  name: string;
  description: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly';
  time: string; // HH:MM format
  dayOfWeek?: number; // 0-6 for weekly
  dayOfMonth?: number; // 1-31 for monthly
  recipients: string[];
  reportTypes: ReportType[];
  filters: ReportFilters;
  isActive: boolean;
  lastRun?: Date;
  nextRun?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface ReportType {
  id: string;
  name: string;
  description: string;
  template: string;
  format: 'pdf' | 'excel' | 'csv' | 'html';
  sections: ReportSection[];
}

export interface ReportSection {
  id: string;
  name: string;
  type: 'summary' | 'chart' | 'table' | 'insights' | 'recommendations';
  data: any;
  config: any;
}

export interface ReportFilters {
  assetTypes?: string[];
  criticalityLevels?: string[];
  owners?: string[];
  locations?: string[];
  complianceFrameworks?: string[];
  riskScoreRange?: [number, number];
  dateRange?: {
    start: Date;
    end: Date;
  };
}

export interface GeneratedReport {
  id: string;
  scheduleId: string;
  name: string;
  description: string;
  generatedAt: Date;
  format: string;
  filePath: string;
  fileSize: number;
  recipients: string[];
  status: 'generating' | 'completed' | 'failed';
  error?: string;
  metadata: ReportMetadata;
}

export interface ReportMetadata {
  totalAssets: number;
  filteredAssets: number;
  generationTime: number; // milliseconds
  sections: string[];
  charts: string[];
  insights: number;
  recommendations: number;
}

export interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  category: 'executive' | 'technical' | 'compliance' | 'security' | 'cost';
  sections: ReportSectionTemplate[];
  defaultFormat: 'pdf' | 'excel' | 'csv' | 'html';
}

export interface ReportSectionTemplate {
  id: string;
  name: string;
  type: 'summary' | 'chart' | 'table' | 'insights' | 'recommendations';
  title: string;
  description: string;
  config: any;
  required: boolean;
}

class AutomatedReportingService {
  private schedules: Map<string, ReportSchedule> = new Map();
  private reports: Map<string, GeneratedReport> = new Map();
  private templates: Map<string, ReportTemplate> = new Map();
  private isRunning = false;

  constructor() {
    this.initializeTemplates();
    this.startScheduler();
  }

  private initializeTemplates() {
    const templates: ReportTemplate[] = [
      {
        id: 'executive-summary',
        name: 'Executive Summary',
        description: 'High-level overview for executives and stakeholders',
        category: 'executive',
        defaultFormat: 'pdf',
        sections: [
          {
            id: 'overview',
            name: 'Overview',
            type: 'summary',
            title: 'Asset Inventory Overview',
            description: 'Key metrics and summary statistics',
            config: { showKPIs: true, showTrends: true },
            required: true
          },
          {
            id: 'risk-summary',
            name: 'Risk Summary',
            type: 'chart',
            title: 'Risk Distribution',
            description: 'Risk levels across the asset portfolio',
            config: { chartType: 'pie', showPercentages: true },
            required: true
          },
          {
            id: 'recommendations',
            name: 'Key Recommendations',
            type: 'recommendations',
            title: 'Strategic Recommendations',
            description: 'High-priority recommendations for management',
            config: { maxItems: 5, priority: 'high' },
            required: true
          }
        ]
      },
      {
        id: 'technical-detail',
        name: 'Technical Detail Report',
        description: 'Detailed technical analysis for IT teams',
        category: 'technical',
        defaultFormat: 'excel',
        sections: [
          {
            id: 'asset-list',
            name: 'Asset List',
            type: 'table',
            title: 'Complete Asset Inventory',
            description: 'Detailed list of all assets with technical specifications',
            config: { includeAllFields: true, sortBy: 'riskScore' },
            required: true
          },
          {
            id: 'vulnerability-analysis',
            name: 'Vulnerability Analysis',
            type: 'table',
            title: 'Vulnerability Details',
            description: 'Detailed vulnerability analysis and remediation status',
            config: { groupBy: 'severity', includeRemediation: true },
            required: true
          },
          {
            id: 'performance-metrics',
            name: 'Performance Metrics',
            type: 'chart',
            title: 'Performance Analysis',
            description: 'Performance metrics and trends',
            config: { chartType: 'line', timeRange: '30d' },
            required: false
          }
        ]
      },
      {
        id: 'compliance-report',
        name: 'Compliance Report',
        description: 'Compliance status and gap analysis',
        category: 'compliance',
        defaultFormat: 'pdf',
        sections: [
          {
            id: 'compliance-overview',
            name: 'Compliance Overview',
            type: 'summary',
            title: 'Compliance Status Summary',
            description: 'Overall compliance status across all frameworks',
            config: { showFrameworks: true, showGaps: true },
            required: true
          },
          {
            id: 'framework-details',
            name: 'Framework Details',
            type: 'table',
            title: 'Framework Compliance Details',
            description: 'Detailed compliance status for each framework',
            config: { groupBy: 'framework', showGaps: true },
            required: true
          },
          {
            id: 'compliance-trends',
            name: 'Compliance Trends',
            type: 'chart',
            title: 'Compliance Trends Over Time',
            description: 'Compliance score trends and improvements',
            config: { chartType: 'line', showTargets: true },
            required: false
          }
        ]
      },
      {
        id: 'security-assessment',
        name: 'Security Assessment',
        description: 'Security posture and vulnerability assessment',
        category: 'security',
        defaultFormat: 'pdf',
        sections: [
          {
            id: 'security-overview',
            name: 'Security Overview',
            type: 'summary',
            title: 'Security Posture Summary',
            description: 'Overall security status and key metrics',
            config: { showThreats: true, showControls: true },
            required: true
          },
          {
            id: 'vulnerability-summary',
            name: 'Vulnerability Summary',
            type: 'chart',
            title: 'Vulnerability Distribution',
            description: 'Vulnerability severity distribution and trends',
            config: { chartType: 'bar', groupBy: 'severity' },
            required: true
          },
          {
            id: 'threat-intelligence',
            name: 'Threat Intelligence',
            type: 'table',
            title: 'Threat Intelligence Summary',
            description: 'Known threats and security advisories',
            config: { includeAdvisories: true, showStatus: true },
            required: false
          }
        ]
      },
      {
        id: 'cost-analysis',
        name: 'Cost Analysis Report',
        description: 'Cost analysis and optimization opportunities',
        category: 'cost',
        defaultFormat: 'excel',
        sections: [
          {
            id: 'cost-overview',
            name: 'Cost Overview',
            type: 'summary',
            title: 'Cost Summary',
            description: 'Total costs and cost per asset analysis',
            config: { showBreakdown: true, showTrends: true },
            required: true
          },
          {
            id: 'cost-breakdown',
            name: 'Cost Breakdown',
            type: 'chart',
            title: 'Cost Distribution',
            description: 'Cost breakdown by category and asset type',
            config: { chartType: 'pie', showPercentages: true },
            required: true
          },
          {
            id: 'optimization-opportunities',
            name: 'Optimization Opportunities',
            type: 'recommendations',
            title: 'Cost Optimization Opportunities',
            description: 'Recommendations for cost reduction',
            config: { category: 'cost', maxItems: 10 },
            required: true
          }
        ]
      }
    ];

    templates.forEach(template => {
      this.templates.set(template.id, template);
    });
  }

  private startScheduler() {
    if (this.isRunning) return;
    
    this.isRunning = true;
    setInterval(() => {
      this.checkScheduledReports();
    }, 60000); // Check every minute
  }

  private async checkScheduledReports() {
    const now = new Date();
    
    for (const schedule of this.schedules.values()) {
      if (!schedule.isActive) continue;
      
      const nextRun = this.calculateNextRun(schedule);
      if (nextRun && nextRun <= now) {
        try {
          await this.executeScheduledReport(schedule);
          schedule.lastRun = now;
          schedule.nextRun = this.calculateNextRun(schedule);
        } catch (error) {
          logError(error, 'AutomatedReportingService.checkScheduledReports', { scheduleId: schedule.id });
        }
      }
    }
  }

  private calculateNextRun(schedule: ReportSchedule): Date | null {
    const now = new Date();
    const [hours, minutes] = schedule.time.split(':').map(Number);
    
    const nextRun = new Date(now);
    nextRun.setHours(hours, minutes, 0, 0);
    
    if (nextRun <= now) {
      nextRun.setDate(nextRun.getDate() + 1);
    }
    
    switch (schedule.frequency) {
      case 'daily':
        return nextRun;
        
      case 'weekly':
        const targetDay = schedule.dayOfWeek || 0;
        const currentDay = nextRun.getDay();
        const daysUntilTarget = (targetDay - currentDay + 7) % 7;
        nextRun.setDate(nextRun.getDate() + daysUntilTarget);
        return nextRun;
        
      case 'monthly':
        const targetDayOfMonth = schedule.dayOfMonth || 1;
        nextRun.setDate(targetDayOfMonth);
        if (nextRun <= now) {
          nextRun.setMonth(nextRun.getMonth() + 1);
        }
        return nextRun;
        
      case 'quarterly':
        const quarter = Math.floor(now.getMonth() / 3);
        const nextQuarter = (quarter + 1) % 4;
        nextRun.setMonth(nextQuarter * 3, 1);
        return nextRun;
        
      default:
        return null;
    }
  }

  async createSchedule(scheduleData: Omit<ReportSchedule, 'id' | 'createdAt' | 'updatedAt' | 'nextRun'>): Promise<ReportSchedule> {
    const schedule: ReportSchedule = {
      ...scheduleData,
      id: `schedule-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
      updatedAt: new Date(),
      nextRun: this.calculateNextRun(scheduleData as ReportSchedule)
    };
    
    this.schedules.set(schedule.id, schedule);
    return schedule;
  }

  async updateSchedule(id: string, updates: Partial<ReportSchedule>): Promise<ReportSchedule | null> {
    const schedule = this.schedules.get(id);
    if (!schedule) return null;
    
    const updatedSchedule = {
      ...schedule,
      ...updates,
      updatedAt: new Date(),
      nextRun: this.calculateNextRun({ ...schedule, ...updates } as ReportSchedule)
    };
    
    this.schedules.set(id, updatedSchedule);
    return updatedSchedule;
  }

  async deleteSchedule(id: string): Promise<boolean> {
    return this.schedules.delete(id);
  }

  getSchedules(): ReportSchedule[] {
    return Array.from(this.schedules.values());
  }

  getSchedule(id: string): ReportSchedule | null {
    return this.schedules.get(id) || null;
  }

  getTemplates(): ReportTemplate[] {
    return Array.from(this.templates.values());
  }

  getTemplate(id: string): ReportTemplate | null {
    return this.templates.get(id) || null;
  }

  async generateReport(
    schedule: ReportSchedule,
    assets: Asset[],
    enrichmentData: Map<string, EnrichmentData>,
    analyticsInsights: AnalyticsInsights
  ): Promise<GeneratedReport> {
    const startTime = Date.now();
    const reportId = `report-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const report: GeneratedReport = {
      id: reportId,
      scheduleId: schedule.id,
      name: schedule.name,
      description: schedule.description,
      generatedAt: new Date(),
      format: schedule.reportTypes[0]?.format || 'pdf',
      filePath: '',
      fileSize: 0,
      recipients: schedule.recipients,
      status: 'generating',
      metadata: {
        totalAssets: assets.length,
        filteredAssets: 0,
        generationTime: 0,
        sections: [],
        charts: [],
        insights: 0,
        recommendations: 0
      }
    };

    try {
      // Filter assets based on schedule filters
      const filteredAssets = this.filterAssets(assets, schedule.filters);
      report.metadata.filteredAssets = filteredAssets.length;

      // Generate report content
      const reportContent = await this.generateReportContent(
        schedule,
        filteredAssets,
        enrichmentData,
        analyticsInsights
      );

      // Generate file
      const fileData = await this.generateReportFile(reportContent, report.format);
      report.filePath = fileData.path;
      report.fileSize = fileData.size;

      // Update metadata
      report.metadata.generationTime = Date.now() - startTime;
      report.status = 'completed';

      this.reports.set(reportId, report);
      return report;

    } catch (error) {
      report.status = 'failed';
      report.error = error instanceof Error ? error.message : 'Unknown error';
      this.reports.set(reportId, report);
      throw error;
    }
  }

  private filterAssets(assets: Asset[], filters: ReportFilters): Asset[] {
    return assets.filter(asset => {
      if (filters.assetTypes && !filters.assetTypes.includes(asset.type)) return false;
      if (filters.criticalityLevels && !filters.criticalityLevels.includes(asset.criticality)) return false;
      if (filters.owners && !filters.owners.includes(asset.owner)) return false;
      if (filters.locations && !filters.locations.includes(asset.location)) return false;
      if (filters.complianceFrameworks && !asset.complianceFrameworks.some(fw => filters.complianceFrameworks!.includes(fw))) return false;
      if (filters.riskScoreRange && (asset.riskScore < filters.riskScoreRange[0] || asset.riskScore > filters.riskScoreRange[1])) return false;
      if (filters.dateRange && (asset.createdAt < filters.dateRange.start || asset.createdAt > filters.dateRange.end)) return false;
      return true;
    });
  }

  private async generateReportContent(
    schedule: ReportSchedule,
    assets: Asset[],
    enrichmentData: Map<string, EnrichmentData>,
    analyticsInsights: AnalyticsInsights
  ): Promise<any> {
    const content: any = {
      metadata: {
        generatedAt: new Date(),
        scheduleName: schedule.name,
        totalAssets: assets.length,
        filters: schedule.filters
      },
      sections: []
    };

    for (const reportType of schedule.reportTypes) {
      const template = this.templates.get(reportType.template);
      if (!template) continue;

      for (const sectionTemplate of template.sections) {
        const section = await this.generateSection(
          sectionTemplate,
          assets,
          enrichmentData,
          analyticsInsights
        );
        content.sections.push(section);
      }
    }

    return content;
  }

  private async generateSection(
    sectionTemplate: ReportSectionTemplate,
    assets: Asset[],
    enrichmentData: Map<string, EnrichmentData>,
    analyticsInsights: AnalyticsInsights
  ): Promise<ReportSection> {
    const section: ReportSection = {
      id: sectionTemplate.id,
      name: sectionTemplate.name,
      type: sectionTemplate.type,
      data: {},
      config: sectionTemplate.config
    };

    switch (sectionTemplate.type) {
      case 'summary':
        section.data = this.generateSummaryData(assets, enrichmentData, analyticsInsights);
        break;
      case 'chart':
        section.data = this.generateChartData(sectionTemplate, assets, enrichmentData, analyticsInsights);
        break;
      case 'table':
        section.data = this.generateTableData(sectionTemplate, assets, enrichmentData);
        break;
      case 'insights':
        section.data = analyticsInsights.summary.keyInsights;
        break;
      case 'recommendations':
        section.data = analyticsInsights.recommendations.filter(rec => 
          sectionTemplate.config.priority ? rec.priority === sectionTemplate.config.priority : true
        );
        break;
    }

    return section;
  }

  private generateSummaryData(assets: Asset[], enrichmentData: Map<string, EnrichmentData>, analyticsInsights: AnalyticsInsights) {
    return {
      totalAssets: assets.length,
      averageRiskScore: analyticsInsights.summary.performanceMetrics.averageRiskScore,
      averageComplianceScore: analyticsInsights.summary.performanceMetrics.averageComplianceScore,
      totalCost: analyticsInsights.summary.costAnalysis.totalCost,
      vulnerabilityCount: analyticsInsights.summary.performanceMetrics.vulnerabilityCount,
      criticalIssues: analyticsInsights.summary.performanceMetrics.criticalIssues,
      riskDistribution: analyticsInsights.summary.riskDistribution,
      complianceStatus: analyticsInsights.summary.complianceStatus
    };
  }

  private generateChartData(sectionTemplate: ReportSectionTemplate, assets: Asset[], enrichmentData: Map<string, EnrichmentData>, analyticsInsights: AnalyticsInsights) {
    // This would generate chart data based on the section template configuration
    // For now, return mock data
    return {
      chartType: sectionTemplate.config.chartType || 'bar',
      data: [],
      title: sectionTemplate.title,
      description: sectionTemplate.description
    };
  }

  private generateTableData(sectionTemplate: ReportSectionTemplate, assets: Asset[], enrichmentData: Map<string, EnrichmentData>) {
    // This would generate table data based on the section template configuration
    // For now, return mock data
    return {
      columns: [],
      rows: [],
      title: sectionTemplate.title,
      description: sectionTemplate.description
    };
  }

  private async generateReportFile(content: any, format: string): Promise<{ path: string; size: number }> {
    // This would generate the actual file based on the format
    // For now, return mock data
    const mockData = JSON.stringify(content, null, 2);
    const blob = new Blob([mockData], { type: 'application/json' });
    
    return {
      path: `reports/report-${Date.now()}.${format}`,
      size: blob.size
    };
  }

  private async executeScheduledReport(schedule: ReportSchedule) {
    // This would be called by the scheduler to execute a scheduled report
    // It would load the current asset data, enrich it, generate analytics, and create the report
    if (import.meta.env.DEV) {
      console.log(`Executing scheduled report: ${schedule.name}`);
    }
  }

  getReports(): GeneratedReport[] {
    return Array.from(this.reports.values());
  }

  getReport(id: string): GeneratedReport | null {
    return this.reports.get(id) || null;
  }

  async deleteReport(id: string): Promise<boolean> {
    return this.reports.delete(id);
  }
}

export const automatedReportingService = new AutomatedReportingService();