import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  Database, 
  Lock, 
  AlertTriangle, 
  CheckCircle, 
  FileText, 
  Users, 
  Globe, 
  Eye,
  EyeOff,
  Download,
  Filter,
  TrendingUp,
  Calendar,
  Building2,
  Target,
  BarChart3,
  PieChart,
  Activity
} from 'lucide-react';
import { Asset, PrivacyRegulation, DataSubjectRight, ComplianceRequirement } from '../../types/asset';
import { useAssetInventory } from '../../contexts/AssetInventoryContext';
import { exportToCSV } from '../../utils/assetUtils';
import toast from 'react-hot-toast';

interface PrivacyComplianceStats {
  totalAssets: number;
  personalDataAssets: number;
  encryptedAssets: number;
  crossBorderTransfer: number;
  thirdPartySharing: number;
  withPIA: number;
  complianceRate: number;
  riskDistribution: Record<string, number>;
  dataClassificationDistribution: Record<string, number>;
  regulationCompliance: Record<string, number>;
}

interface ComplianceGap {
  assetId: string;
  assetName: string;
  missingRequirements: string[];
  riskLevel: 'Low' | 'Medium' | 'High' | 'Critical';
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
}

export const PrivacyComplianceDashboard: React.FC = () => {
  const { assets, updateFilters } = useAssetInventory();
  const [selectedRegulation, setSelectedRegulation] = useState<string>('');
  const [selectedDataClassification, setSelectedDataClassification] = useState<string>('');
  const [stats, setStats] = useState<PrivacyComplianceStats | null>(null);
  const [complianceGaps, setComplianceGaps] = useState<ComplianceGap[]>([]);
  const [showGapsOnly, setShowGapsOnly] = useState(false);

  // Privacy regulations data
  const privacyRegulations: PrivacyRegulation[] = [
    {
      id: 'gdpr',
      name: 'GDPR',
      jurisdiction: 'EU',
      effectiveDate: new Date('2018-05-25'),
      description: 'General Data Protection Regulation',
      requirements: [],
      applicableTo: ['Personal Data', 'Sensitive Data', 'Information Asset'],
      penalties: {
        maxFine: 20000000,
        currency: 'EUR',
        description: 'Up to 4% of annual global turnover or €20M'
      }
    },
    {
      id: 'ccpa',
      name: 'CCPA',
      jurisdiction: 'California',
      effectiveDate: new Date('2020-01-01'),
      description: 'California Consumer Privacy Act',
      requirements: [],
      applicableTo: ['Personal Data', 'Sensitive Data'],
      penalties: {
        maxFine: 7500,
        currency: 'USD',
        description: 'Up to $7,500 per intentional violation'
      }
    },
    {
      id: 'hipaa',
      name: 'HIPAA',
      jurisdiction: 'US',
      effectiveDate: new Date('1996-08-21'),
      description: 'Health Insurance Portability and Accountability Act',
      requirements: [],
      applicableTo: ['PHI', 'Sensitive Data', 'Health Data'],
      penalties: {
        maxFine: 1600000,
        currency: 'USD',
        description: 'Up to $1.6M per violation per year'
      }
    },
    {
      id: 'pipeda',
      name: 'PIPEDA',
      jurisdiction: 'Canada',
      effectiveDate: new Date('2000-04-13'),
      description: 'Personal Information Protection and Electronic Documents Act',
      requirements: [],
      applicableTo: ['Personal Data', 'Sensitive Data'],
      penalties: {
        maxFine: 100000,
        currency: 'CAD',
        description: 'Up to $100,000 per violation'
      }
    }
  ];

  const dataSubjectRights: DataSubjectRight[] = [
    {
      id: 'access',
      name: 'Right of Access',
      description: 'Right to obtain confirmation of processing and access to personal data',
      applicableRegulations: ['GDPR', 'CCPA', 'PIPEDA'],
      responseTimeframe: 30,
      isAutomated: false,
      requiresVerification: true
    },
    {
      id: 'rectification',
      name: 'Right to Rectification',
      description: 'Right to have inaccurate personal data corrected',
      applicableRegulations: ['GDPR', 'PIPEDA'],
      responseTimeframe: 30,
      isAutomated: false,
      requiresVerification: true
    },
    {
      id: 'erasure',
      name: 'Right to Erasure',
      description: 'Right to have personal data deleted',
      applicableRegulations: ['GDPR', 'CCPA'],
      responseTimeframe: 30,
      isAutomated: false,
      requiresVerification: true
    },
    {
      id: 'portability',
      name: 'Right to Data Portability',
      description: 'Right to receive personal data in a structured format',
      applicableRegulations: ['GDPR'],
      responseTimeframe: 30,
      isAutomated: true,
      requiresVerification: true
    },
    {
      id: 'objection',
      name: 'Right to Object',
      description: 'Right to object to processing of personal data',
      applicableRegulations: ['GDPR', 'PIPEDA'],
      responseTimeframe: 30,
      isAutomated: false,
      requiresVerification: false
    }
  ];

  useEffect(() => {
    calculateStats();
    identifyComplianceGaps();
  }, [assets]);

  const calculateStats = () => {
    const personalDataAssets = assets.filter(asset => 
      asset.dataTypes?.some(type => ['PII', 'PHI', 'Personal Data'].includes(type)) ||
      asset.type === 'Personal Data' ||
      asset.type === 'Sensitive Data'
    ).length;

    const encryptedAssets = assets.filter(asset => 
      asset.encryptionStatus === 'Encrypted'
    ).length;

    const crossBorderTransfer = assets.filter(asset => 
      asset.crossBorderTransfer
    ).length;

    const thirdPartySharing = assets.filter(asset => 
      asset.thirdPartySharing
    ).length;

    const withPIA = assets.filter(asset => 
      asset.privacyImpactAssessment !== null
    ).length;

    const complianceRate = assets.length > 0 
      ? Math.round((assets.filter(asset => 
          asset.complianceFrameworks.length > 0 && 
          asset.encryptionStatus === 'Encrypted' &&
          asset.privacyImpactAssessment !== null
        ).length / assets.length) * 100)
      : 0;

    const riskDistribution = assets.reduce((acc, asset) => {
      const risk = asset.riskScore >= 80 ? 'Critical' : 
                  asset.riskScore >= 60 ? 'High' : 
                  asset.riskScore >= 40 ? 'Medium' : 'Low';
      acc[risk] = (acc[risk] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const dataClassificationDistribution = assets.reduce((acc, asset) => {
      const classification = asset.dataClassification || 'Unknown';
      acc[classification] = (acc[classification] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const regulationCompliance = privacyRegulations.reduce((acc, regulation) => {
      const applicableAssets = assets.filter(asset => 
        regulation.applicableTo.some(type => asset.type === type) ||
        asset.dataTypes?.some(type => regulation.applicableTo.includes(type))
      );
      const compliantAssets = applicableAssets.filter(asset => 
        asset.complianceFrameworks.includes(regulation.name)
      );
      acc[regulation.name] = applicableAssets.length > 0 
        ? Math.round((compliantAssets.length / applicableAssets.length) * 100)
        : 0;
      return acc;
    }, {} as Record<string, number>);

    setStats({
      totalAssets: assets.length,
      personalDataAssets,
      encryptedAssets,
      crossBorderTransfer,
      thirdPartySharing,
      withPIA,
      complianceRate,
      riskDistribution,
      dataClassificationDistribution,
      regulationCompliance
    });
  };

  const identifyComplianceGaps = () => {
    const gaps: ComplianceGap[] = [];

    assets.forEach(asset => {
      const missingRequirements: string[] = [];
      let riskLevel: 'Low' | 'Medium' | 'High' | 'Critical' = 'Low';

      // Check encryption
      if (asset.encryptionStatus !== 'Encrypted') {
        missingRequirements.push('Data Encryption Required');
        riskLevel = 'High';
      }

      // Check PIA
      if (asset.privacyImpactAssessment === null && 
          (asset.dataTypes?.some(type => ['PII', 'PHI'].includes(type)) || 
           asset.type === 'Personal Data' || asset.type === 'Sensitive Data')) {
        missingRequirements.push('Privacy Impact Assessment Required');
        riskLevel = riskLevel === 'High' ? 'Critical' : 'High';
      }

      // Check data classification
      if (!asset.dataClassification) {
        missingRequirements.push('Data Classification Required');
        riskLevel = riskLevel === 'Low' ? 'Medium' : riskLevel;
      }

      // Check access controls
      if (!asset.accessControls || asset.accessControls.length === 0) {
        missingRequirements.push('Access Controls Required');
        riskLevel = riskLevel === 'Low' ? 'Medium' : riskLevel;
      }

      // Check compliance frameworks
      if (asset.complianceFrameworks.length === 0 && 
          (asset.dataTypes?.some(type => ['PII', 'PHI'].includes(type)) || 
           asset.type === 'Personal Data' || asset.type === 'Sensitive Data')) {
        missingRequirements.push('Compliance Framework Assignment Required');
        riskLevel = riskLevel === 'Low' ? 'Medium' : riskLevel;
      }

      if (missingRequirements.length > 0) {
        gaps.push({
          assetId: asset.id,
          assetName: asset.name,
          missingRequirements,
          riskLevel,
          priority: riskLevel === 'Critical' ? 'Critical' : 
                   riskLevel === 'High' ? 'High' : 
                   riskLevel === 'Medium' ? 'Medium' : 'Low'
        });
      }
    });

    setComplianceGaps(gaps.sort((a, b) => {
      const priorityOrder = { 'Critical': 4, 'High': 3, 'Medium': 2, 'Low': 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    }));
  };

  const handleRegulationFilter = (regulation: string) => {
    setSelectedRegulation(regulation);
    if (regulation) {
      updateFilters({ 
        complianceFrameworks: [regulation],
        search: ''
      });
    } else {
      updateFilters({ 
        complianceFrameworks: [],
        search: ''
      });
    }
  };

  const handleDataClassificationFilter = (classification: string) => {
    setSelectedDataClassification(classification);
    // This would need to be implemented in the filtering logic
  };

  const exportComplianceReport = async () => {
    try {
      const reportData = assets.map(asset => ({
        name: asset.name,
        type: asset.type,
        dataClassification: asset.dataClassification || 'Not Classified',
        encryptionStatus: asset.encryptionStatus || 'Unknown',
        complianceFrameworks: asset.complianceFrameworks.join(', '),
        hasPIA: asset.privacyImpactAssessment ? 'Yes' : 'No',
        crossBorderTransfer: asset.crossBorderTransfer ? 'Yes' : 'No',
        thirdPartySharing: asset.thirdPartySharing ? 'Yes' : 'No',
        riskScore: asset.riskScore,
        owner: asset.owner
      }));

      await exportToCSV(reportData);
      toast.success('Privacy compliance report exported successfully');
    } catch (error) {
      toast.error('Failed to export compliance report');
    }
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'Critical': return 'text-red-600 bg-red-50 border-red-200';
      case 'High': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'Medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'Low': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  if (!stats) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-outfit font-bold mb-2 flex items-center">
              <Shield className="h-8 w-8 mr-3" />
              Privacy Compliance Dashboard
            </h1>
            <p className="text-lg opacity-90 mb-4">
              Monitor and manage privacy compliance across information assets
            </p>
            <div className="flex items-center space-x-6 text-sm">
              <div className="flex items-center">
                <Target className="h-4 w-4 mr-2" />
                <span>{stats.complianceRate}% Overall Compliance</span>
              </div>
              <div className="flex items-center">
                <Database className="h-4 w-4 mr-2" />
                <span>{stats.personalDataAssets} Personal Data Assets</span>
              </div>
              <div className="flex items-center">
                <Lock className="h-4 w-4 mr-2" />
                <span>{stats.encryptedAssets} Encrypted Assets</span>
              </div>
            </div>
          </div>
          <div className="hidden lg:block">
            <div className="w-24 h-24 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
              <div className="text-3xl font-bold">{stats.complianceRate}%</div>
            </div>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Personal Data Assets</p>
              <p className="text-3xl font-outfit font-bold text-purple-600">{stats.personalDataAssets}</p>
              <p className="text-sm text-purple-600">
                {stats.totalAssets > 0 ? Math.round((stats.personalDataAssets / stats.totalAssets) * 100) : 0}% of total
              </p>
            </div>
            <div className="p-3 bg-purple-50 rounded-lg">
              <Database className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Encrypted Assets</p>
              <p className="text-3xl font-outfit font-bold text-green-600">{stats.encryptedAssets}</p>
              <p className="text-sm text-green-600">
                {stats.totalAssets > 0 ? Math.round((stats.encryptedAssets / stats.totalAssets) * 100) : 0}% encrypted
              </p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <Lock className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Privacy Impact Assessments</p>
              <p className="text-3xl font-outfit font-bold text-blue-600">{stats.withPIA}</p>
              <p className="text-sm text-blue-600">
                {stats.personalDataAssets > 0 ? Math.round((stats.withPIA / stats.personalDataAssets) * 100) : 0}% of personal data
              </p>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Cross-Border Transfers</p>
              <p className="text-3xl font-outfit font-bold text-orange-600">{stats.crossBorderTransfer}</p>
              <p className="text-sm text-orange-600">Requires special attention</p>
            </div>
            <div className="p-3 bg-orange-50 rounded-lg">
              <Globe className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Data Classification Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-outfit font-semibold text-gray-900 mb-4 flex items-center">
            <PieChart className="h-5 w-5 mr-2 text-blue-600" />
            Data Classification Distribution
          </h3>
          <div className="space-y-3">
            {Object.entries(stats.dataClassificationDistribution).map(([classification, count]) => (
              <div key={classification} className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">{classification}</span>
                <div className="flex items-center space-x-2">
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${(count / stats.totalAssets) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-gray-900 w-8">{count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-outfit font-semibold text-gray-900 mb-4 flex items-center">
            <BarChart3 className="h-5 w-5 mr-2 text-green-600" />
            Regulation Compliance
          </h3>
          <div className="space-y-3">
            {Object.entries(stats.regulationCompliance).map(([regulation, rate]) => (
              <div key={regulation} className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">{regulation}</span>
                <div className="flex items-center space-x-2">
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        rate >= 80 ? 'bg-green-600' : 
                        rate >= 60 ? 'bg-yellow-600' : 'bg-red-600'
                      }`}
                      style={{ width: `${rate}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-gray-900 w-8">{rate}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Compliance Gaps */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-outfit font-semibold text-gray-900 flex items-center">
            <AlertTriangle className="h-5 w-5 mr-2 text-orange-600" />
            Compliance Gaps & Recommendations
          </h3>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowGapsOnly(!showGapsOnly)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                showGapsOnly 
                  ? 'bg-orange-100 text-orange-700 border border-orange-200' 
                  : 'bg-gray-100 text-gray-700 border border-gray-200'
              }`}
            >
              {showGapsOnly ? <EyeOff className="h-4 w-4 mr-2 inline" /> : <Eye className="h-4 w-4 mr-2 inline" />}
              {showGapsOnly ? 'Show All' : 'Show Gaps Only'}
            </button>
            <button
              onClick={exportComplianceReport}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </button>
          </div>
        </div>

        <div className="space-y-4">
          {complianceGaps
            .filter(gap => !showGapsOnly || gap.priority === 'Critical' || gap.priority === 'High')
            .slice(0, 10)
            .map((gap) => (
              <div key={gap.assetId} className={`p-4 rounded-lg border-2 ${getRiskColor(gap.priority)}`}>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900">{gap.assetName}</h4>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskColor(gap.priority)}`}>
                    {gap.priority} Priority
                  </span>
                </div>
                <div className="space-y-1">
                  {gap.missingRequirements.map((requirement, index) => (
                    <div key={index} className="text-sm text-gray-600 flex items-center">
                      <AlertTriangle className="h-3 w-3 mr-2 text-orange-500" />
                      {requirement}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          
          {complianceGaps.length === 0 && (
            <div className="text-center py-6 text-gray-500">
              <CheckCircle className="h-12 w-12 mx-auto mb-3 text-green-400" />
              <p>No compliance gaps identified!</p>
            </div>
          )}
        </div>
      </div>

      {/* Data Subject Rights */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-outfit font-semibold text-gray-900 mb-4 flex items-center">
          <Users className="h-5 w-5 mr-2 text-indigo-600" />
          Data Subject Rights Management
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {dataSubjectRights.map((right) => (
            <div key={right.id} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <h4 className="font-medium text-gray-900 mb-2">{right.name}</h4>
              <p className="text-sm text-gray-600 mb-3">{right.description}</p>
              <div className="space-y-2 text-xs text-gray-500">
                <div className="flex justify-between">
                  <span>Response Time:</span>
                  <span className="font-medium">{right.responseTimeframe} days</span>
                </div>
                <div className="flex justify-between">
                  <span>Automated:</span>
                  <span className="font-medium">{right.isAutomated ? 'Yes' : 'No'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Verification:</span>
                  <span className="font-medium">{right.requiresVerification ? 'Required' : 'Not Required'}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};