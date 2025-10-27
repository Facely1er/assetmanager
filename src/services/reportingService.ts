import { supabase, handleSupabaseError, isSupabaseEnabled } from '../lib/supabase';
import { Report } from '../types/organization';
import { Asset } from '../types/asset';

// Dynamic imports for heavy libraries - only loaded when needed
// This significantly reduces initial bundle size

export const reportingService = {
  // Get saved reports
  async getReports(): Promise<Report[]> {
    // Demo mode - return empty array if Supabase is not configured
    if (!isSupabaseEnabled || !supabase) {
      console.log('Running in demo mode - returning empty reports array');
      return Promise.resolve([]);
    }
    
    try {
      // Test connectivity first
      const { checkSupabaseConnectivity } = await import('../lib/supabase');
      const isConnected = await checkSupabaseConnectivity();
      
      if (!isConnected) {
        console.log('Supabase not connected, returning empty reports');
        return [];
      }
      
      const { data, error } = await supabase
        .from('reports')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw new Error(handleSupabaseError(error));
      return data || [];
    } catch (error) {
      // Check for network errors and fail gracefully
      if (error instanceof Error && (
        error.message.includes('Failed to fetch') ||
        error.message.includes('fetch') ||
        error.message.includes('network') ||
        error.message.includes('NetworkError')
      )) {
        console.warn('Network error fetching reports, returning empty array:', error.message);
        return [];
      }
      
      console.error('Error fetching reports:', error);
      return []; // Return empty array instead of throwing
    }
  },

  // Create report
  async createReport(reportData: Partial<Report>): Promise<Report> {
    // Demo mode - simulate report creation
    if (!isSupabaseEnabled || !supabase) {
      const mockReport: Report = {
        id: `demo-report-${Date.now()}`,
        organization_id: 'demo-org',
        created_by: 'demo-user',
        name: reportData.name || 'Demo Report',
        description: reportData.description,
        type: reportData.type || 'asset_summary',
        filters: reportData.filters || {},
        schedule: reportData.schedule || {},
        format: reportData.format || 'pdf',
        is_public: reportData.is_public || false,
        created_at: new Date(),
        updated_at: new Date(),
      };
      return Promise.resolve(mockReport);
    }
    
    try {
      const user = await supabase.auth.getUser();
      if (!user.data.user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('reports')
        .insert({
          ...reportData,
          created_by: user.data.user.id,
        })
        .select()
        .single();

      if (error) throw new Error(handleSupabaseError(error));
      return data;
    } catch (error) {
      console.error('Error creating report:', error);
      throw error;
    }
  },

  // Generate asset summary report
  async generateAssetSummaryReport(assets: Asset[], format: 'pdf' | 'excel' | 'csv' = 'pdf'): Promise<void> {
    try {
      const stats = this.calculateReportStats(assets);

      switch (format) {
        case 'pdf':
          await this.generatePDFReport(assets, stats);
          break;
        case 'excel':
          await this.generateExcelReport(assets, stats);
          break;
        case 'csv':
          await this.generateCSVReport(assets);
          break;
      }
    } catch (error) {
      console.error('Error generating report:', error);
      throw error;
    }
  },

  // Generate compliance report
  async generateComplianceReport(assets: Asset[], framework: string): Promise<void> {
    try {
      // Dynamically import jsPDF only when needed
      const jsPDF = (await import('jspdf')).default;
      
      const complianceAssets = assets.filter(asset => 
        asset.complianceFrameworks.includes(framework)
      );
      
      const doc = new jsPDF();
      const pageHeight = doc.internal.pageSize.height;
      let yPosition = 20;

      // Title
      doc.setFontSize(20);
      doc.text(`${framework} Compliance Report`, 20, yPosition);
      yPosition += 20;

      // Summary
      doc.setFontSize(12);
      doc.text(`Total Assets: ${assets.length}`, 20, yPosition);
      yPosition += 10;
      doc.text(`Compliant Assets: ${complianceAssets.length}`, 20, yPosition);
      yPosition += 10;
      doc.text(`Compliance Rate: ${Math.round((complianceAssets.length / assets.length) * 100)}%`, 20, yPosition);
      yPosition += 20;

      // Assets table
      doc.text('Compliant Assets:', 20, yPosition);
      yPosition += 10;

      complianceAssets.forEach((asset, index) => {
        if (yPosition > pageHeight - 30) {
          doc.addPage();
          yPosition = 20;
        }
        
        doc.text(`${index + 1}. ${asset.name} (${asset.type}) - ${asset.criticality}`, 25, yPosition);
        yPosition += 8;
      });

      // Save
      doc.save(`${framework}_compliance_report_${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
      console.error('Error generating compliance report:', error);
      throw error;
    }
  },

  // Generate risk assessment report
  async generateRiskAssessmentReport(assets: Asset[]): Promise<void> {
    try {
      // Dynamically import jsPDF only when needed
      const jsPDF = (await import('jspdf')).default;
      
      const riskStats = {
        critical: assets.filter(a => a.riskScore >= 80).length,
        high: assets.filter(a => a.riskScore >= 60 && a.riskScore < 80).length,
        medium: assets.filter(a => a.riskScore >= 40 && a.riskScore < 60).length,
        low: assets.filter(a => a.riskScore < 40).length,
        average: Math.round(assets.reduce((sum, a) => sum + a.riskScore, 0) / assets.length),
      };

      const doc = new jsPDF();
      let yPosition = 20;

      // Title
      doc.setFontSize(20);
      doc.text('Risk Assessment Report', 20, yPosition);
      yPosition += 30;

      // Risk Summary
      doc.setFontSize(14);
      doc.text('Risk Distribution:', 20, yPosition);
      yPosition += 15;

      doc.setFontSize(12);
      doc.setTextColor(220, 38, 127); // Critical - Red
      doc.text(`Critical Risk (80-100): ${riskStats.critical} assets`, 25, yPosition);
      yPosition += 10;

      doc.setTextColor(251, 146, 60); // High - Orange
      doc.text(`High Risk (60-79): ${riskStats.high} assets`, 25, yPosition);
      yPosition += 10;

      doc.setTextColor(250, 204, 21); // Medium - Yellow
      doc.text(`Medium Risk (40-59): ${riskStats.medium} assets`, 25, yPosition);
      yPosition += 10;

      doc.setTextColor(34, 197, 94); // Low - Green
      doc.text(`Low Risk (0-39): ${riskStats.low} assets`, 25, yPosition);
      yPosition += 20;

      doc.setTextColor(0, 0, 0); // Reset to black
      doc.text(`Average Risk Score: ${riskStats.average}`, 25, yPosition);

      // Save
      doc.save(`risk_assessment_report_${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
      console.error('Error generating risk assessment report:', error);
      throw error;
    }
  },

  // Private helper methods
  calculateReportStats(assets: Asset[]) {
    return {
      total: assets.length,
      byType: assets.reduce((acc, asset) => {
        acc[asset.type] = (acc[asset.type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      byCriticality: assets.reduce((acc, asset) => {
        acc[asset.criticality] = (acc[asset.criticality] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      byStatus: assets.reduce((acc, asset) => {
        acc[asset.status] = (acc[asset.status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      vulnerabilities: assets.reduce((sum, asset) => sum + asset.vulnerabilities.length, 0),
      avgRiskScore: Math.round(assets.reduce((sum, asset) => sum + asset.riskScore, 0) / assets.length),
    };
  },

  async generatePDFReport(assets: Asset[], stats: Record<string, unknown>): Promise<void> {
    // Dynamically import jsPDF only when needed
    const jsPDF = (await import('jspdf')).default;
    const doc = new jsPDF();
    let yPosition = 20;

    // Title
    doc.setFontSize(20);
    doc.text('Asset Inventory Report', 20, yPosition);
    yPosition += 30;

    // Summary
    doc.setFontSize(14);
    doc.text('Summary', 20, yPosition);
    yPosition += 15;

    doc.setFontSize(12);
    doc.text(`Total Assets: ${stats.total}`, 25, yPosition);
    yPosition += 10;
    doc.text(`Average Risk Score: ${stats.avgRiskScore}`, 25, yPosition);
    yPosition += 10;
    doc.text(`Total Vulnerabilities: ${stats.vulnerabilities}`, 25, yPosition);
    yPosition += 20;

    // Asset Type Distribution
    doc.setFontSize(14);
    doc.text('Asset Type Distribution', 20, yPosition);
    yPosition += 15;

    Object.entries(stats.byType).forEach(([type, count]) => {
      doc.setFontSize(12);
      doc.text(`${type}: ${count}`, 25, yPosition);
      yPosition += 10;
    });

    // Save
    doc.save(`asset_inventory_report_${new Date().toISOString().split('T')[0]}.pdf`);
  },

  async generateExcelReport(assets: Asset[], stats: Record<string, unknown>): Promise<void> {
    // Dynamically import xlsx only when needed
    const XLSX = await import('xlsx');
    const workbook = XLSX.utils.book_new();

    // Summary sheet
    const summaryData = [
      ['Asset Inventory Report'],
      ['Generated:', new Date().toLocaleDateString()],
      [''],
      ['Summary'],
      ['Total Assets', stats.total],
      ['Average Risk Score', stats.avgRiskScore],
      ['Total Vulnerabilities', stats.vulnerabilities],
      [''],
      ['Asset Type Distribution'],
      ...Object.entries(stats.byType).map(([type, count]) => [type, count]),
    ];

    const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');

    // Assets sheet
    const assetsData = [
      ['Name', 'Type', 'Criticality', 'Owner', 'Location', 'Risk Score', 'Status', 'Last Assessed'],
      ...assets.map(asset => [
        asset.name,
        asset.type,
        asset.criticality,
        asset.owner,
        asset.location,
        asset.riskScore,
        asset.status,
        asset.lastAssessed.toLocaleDateString(),
      ]),
    ];

    const assetsSheet = XLSX.utils.aoa_to_sheet(assetsData);
    XLSX.utils.book_append_sheet(workbook, assetsSheet, 'Assets');

    // Save
    XLSX.writeFile(workbook, `asset_inventory_report_${new Date().toISOString().split('T')[0]}.xlsx`);
  },

  async generateCSVReport(assets: Asset[]): Promise<void> {
    const csvData = [
      ['Name', 'Type', 'Criticality', 'Owner', 'Location', 'Risk Score', 'Status', 'Last Assessed', 'Tags', 'Compliance Frameworks'],
      ...assets.map(asset => [
        asset.name,
        asset.type,
        asset.criticality,
        asset.owner,
        asset.location,
        asset.riskScore,
        asset.status,
        asset.lastAssessed.toLocaleDateString(),
        asset.tags.join('; '),
        asset.complianceFrameworks.join('; '),
      ]),
    ];

    const csvContent = csvData.map(row => row.map(field => `"${field}"`).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `asset_inventory_report_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
  },
};