import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  Lock, 
  Eye, 
  EyeOff, 
  AlertTriangle, 
  CheckCircle, 
  Database, 
  Users, 
  Globe, 
  FileText, 
  Download,
  Filter,
  Search,
  RefreshCw,
  Key,
  Server,
  Cloud,
  HardDrive,
  Network,
  Activity,
  TrendingUp,
  BarChart3
} from 'lucide-react';
import { Asset } from '../../types/asset';
import { useAssetInventory } from '../../hooks/useAssetInventory';
import { exportToCSV } from '../../utils/assetUtils';
import toast from 'react-hot-toast';

interface DataProtectionStats {
  totalAssets: number;
  encryptedAssets: number;
  unencryptedAssets: number;
  partiallyEncryptedAssets: number;
  unknownEncryptionAssets: number;
  personalDataAssets: number;
  crossBorderTransferAssets: number;
  thirdPartySharingAssets: number;
  accessControlledAssets: number;
  piaCompletedAssets: number;
  dataBreachHistory: number;
  averageRiskScore: number;
  encryptionCoverage: number;
  accessControlCoverage: number;
  complianceCoverage: number;
}

interface SecurityControl {
  id: string;
  name: string;
  type: 'Encryption' | 'Access Control' | 'Monitoring' | 'Backup' | 'Network Security' | 'Data Loss Prevention';
  status: 'Implemented' | 'Partial' | 'Not Implemented' | 'Unknown';
  coverage: number; // percentage of assets covered
  lastUpdated: Date;
  description: string;
  requirements: string[];
}

interface DataFlow {
  id: string;
  source: string;
  destination: string;
  dataType: string;
  encryption: boolean;
  accessControl: boolean;
  monitoring: boolean;
  riskLevel: 'Low' | 'Medium' | 'High' | 'Critical';
  purpose: string;
}

export const DataProtectionDashboard: React.FC = () => {
  const { assets } = useAssetInventory();
  const [stats, setStats] = useState<DataProtectionStats | null>(null);
  const [securityControls, setSecurityControls] = useState<SecurityControl[]>([]);
  const [dataFlows, setDataFlows] = useState<DataFlow[]>([]);
  const [selectedControl, setSelectedControl] = useState<string>('');
  const [showOnlyRisks, setShowOnlyRisks] = useState(false);

  useEffect(() => {
    calculateStats();
    generateSecurityControls();
    generateDataFlows();
  }, [assets]);

  const calculateStats = () => {
    const totalAssets = assets.length;
    const encryptedAssets = assets.filter(asset => asset.encryptionStatus === 'Encrypted').length;
    const unencryptedAssets = assets.filter(asset => asset.encryptionStatus === 'Not Encrypted').length;
    const partiallyEncryptedAssets = assets.filter(asset => asset.encryptionStatus === 'Partially Encrypted').length;
    const unknownEncryptionAssets = assets.filter(asset => asset.encryptionStatus === 'Unknown').length;
    
    const personalDataAssets = assets.filter(asset => 
      asset.dataTypes?.some(type => ['PII', 'PHI', 'Personal Data'].includes(type)) ||
      asset.type === 'Personal Data' ||
      asset.type === 'Sensitive Data'
    ).length;

    const crossBorderTransferAssets = assets.filter(asset => asset.crossBorderTransfer).length;
    const thirdPartySharingAssets = assets.filter(asset => asset.thirdPartySharing).length;
    const accessControlledAssets = assets.filter(asset => 
      asset.accessControls && asset.accessControls.length > 0
    ).length;
    const piaCompletedAssets = assets.filter(asset => 
      asset.privacyImpactAssessment !== null
    ).length;

    const dataBreachHistory = assets.reduce((total, asset) => 
      total + (asset.dataBreachHistory?.length || 0), 0
    );

    const averageRiskScore = assets.length > 0 
      ? Math.round(assets.reduce((sum, asset) => sum + asset.riskScore, 0) / assets.length)
      : 0;

    const encryptionCoverage = totalAssets > 0 ? Math.round((encryptedAssets / totalAssets) * 100) : 0;
    const accessControlCoverage = totalAssets > 0 ? Math.round((accessControlledAssets / totalAssets) * 100) : 0;
    const complianceCoverage = totalAssets > 0 
      ? Math.round((assets.filter(asset => asset.complianceFrameworks.length > 0).length / totalAssets) * 100)
      : 0;

    setStats({
      totalAssets,
      encryptedAssets,
      unencryptedAssets,
      partiallyEncryptedAssets,
      unknownEncryptionAssets,
      personalDataAssets,
      crossBorderTransferAssets,
      thirdPartySharingAssets,
      accessControlledAssets,
      piaCompletedAssets,
      dataBreachHistory,
      averageRiskScore,
      encryptionCoverage,
      accessControlCoverage,
      complianceCoverage
    });
  };

  const generateSecurityControls = () => {
    const controls: SecurityControl[] = [
      {
        id: 'encryption-at-rest',
        name: 'Encryption at Rest',
        type: 'Encryption',
        status: 'Implemented',
        coverage: stats?.encryptionCoverage || 0,
        lastUpdated: new Date(),
        description: 'Data encryption while stored on disk or in databases',
        requirements: ['AES-256 encryption', 'Key management', 'Regular key rotation']
      },
      {
        id: 'encryption-in-transit',
        name: 'Encryption in Transit',
        type: 'Encryption',
        status: 'Implemented',
        coverage: 85,
        lastUpdated: new Date(),
        description: 'Data encryption during transmission over networks',
        requirements: ['TLS 1.3', 'Certificate management', 'Perfect Forward Secrecy']
      },
      {
        id: 'access-controls',
        name: 'Access Controls',
        type: 'Access Control',
        status: 'Partial',
        coverage: stats?.accessControlCoverage || 0,
        lastUpdated: new Date(),
        description: 'Role-based and attribute-based access controls',
        requirements: ['RBAC implementation', 'Least privilege principle', 'Regular access reviews']
      },
      {
        id: 'data-monitoring',
        name: 'Data Monitoring',
        type: 'Monitoring',
        status: 'Partial',
        coverage: 60,
        lastUpdated: new Date(),
        description: 'Continuous monitoring of data access and usage',
        requirements: ['SIEM integration', 'Real-time alerts', 'Audit logging']
      },
      {
        id: 'data-backup',
        name: 'Data Backup',
        type: 'Backup',
        status: 'Implemented',
        coverage: 90,
        lastUpdated: new Date(),
        description: 'Regular backup of critical data assets',
        requirements: ['Automated backups', 'Offsite storage', 'Recovery testing']
      },
      {
        id: 'network-security',
        name: 'Network Security',
        type: 'Network Security',
        status: 'Implemented',
        coverage: 75,
        lastUpdated: new Date(),
        description: 'Network-level security controls and segmentation',
        requirements: ['Firewall rules', 'Network segmentation', 'Intrusion detection']
      },
      {
        id: 'dlp',
        name: 'Data Loss Prevention',
        type: 'Data Loss Prevention',
        status: 'Not Implemented',
        coverage: 20,
        lastUpdated: new Date(),
        description: 'Prevention of unauthorized data exfiltration',
        requirements: ['Content inspection', 'Policy enforcement', 'User training']
      }
    ];

    setSecurityControls(controls);
  };

  const generateDataFlows = () => {
    const flows: DataFlow[] = [];

    assets.forEach(asset => {
      asset.relationships.forEach(relationship => {
        const relatedAsset = assets.find(a => a.id === relationship.relatedAssetId);
        if (relatedAsset) {
          flows.push({
            id: `${asset.id}-${relationship.relatedAssetId}`,
            source: asset.name,
            destination: relatedAsset.name,
            dataType: relationship.isPersonalData ? 'Personal Data' : 'Business Data',
            encryption: asset.encryptionStatus === 'Encrypted' && 
                      relatedAsset.encryptionStatus === 'Encrypted',
            accessControl: (asset.accessControls?.length || 0) > 0 && 
                          (relatedAsset.accessControls?.length || 0) > 0,
            monitoring: true, // Simplified for demo
            riskLevel: relationship.isPersonalData ? 'High' : 'Medium',
            purpose: relationship.purpose
          });
        }
      });
    });

    setDataFlows(flows);
  };

  const exportProtectionReport = async () => {
    try {
      const reportData = assets.map(asset => ({
        name: asset.name,
        type: asset.type,
        dataClassification: asset.dataClassification || 'Not Classified',
        encryptionStatus: asset.encryptionStatus || 'Unknown',
        accessControls: asset.accessControls?.length || 0,
        hasPIA: asset.privacyImpactAssessment ? 'Yes' : 'No',
        crossBorderTransfer: asset.crossBorderTransfer ? 'Yes' : 'No',
        thirdPartySharing: asset.thirdPartySharing ? 'Yes' : 'No',
        riskScore: asset.riskScore,
        complianceFrameworks: asset.complianceFrameworks.join(', ') || 'None'
      }));

      await exportToCSV(reportData);
      toast.success('Data protection report exported successfully');
    } catch (error) {
      toast.error('Failed to export protection report');
    }
  };

  const getControlStatusColor = (status: string) => {
    switch (status) {
      case 'Implemented': return 'text-green-600 bg-green-50 border-green-200';
      case 'Partial': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'Not Implemented': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getRiskLevelColor = (level: string) => {
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
      <div className="bg-gradient-to-r from-red-600 to-orange-600 rounded-2xl p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-outfit font-bold mb-2 flex items-center">
              <Shield className="h-8 w-8 mr-3" />
              Data Protection Dashboard
            </h1>
            <p className="text-lg opacity-90 mb-4">
              Monitor and manage data protection controls and security measures
            </p>
            <div className="flex items-center space-x-6 text-sm">
              <div className="flex items-center">
                <Lock className="h-4 w-4 mr-2" />
                <span>{stats.encryptionCoverage}% Encryption Coverage</span>
              </div>
              <div className="flex items-center">
                <Database className="h-4 w-4 mr-2" />
                <span>{stats.personalDataAssets} Personal Data Assets</span>
              </div>
              <div className="flex items-center">
                <AlertTriangle className="h-4 w-4 mr-2" />
                <span>{stats.dataBreachHistory} Data Breach Incidents</span>
              </div>
            </div>
          </div>
          <div className="hidden lg:block">
            <div className="w-24 h-24 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
              <Shield className="h-12 w-12" />
            </div>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Encryption Coverage</p>
              <p className="text-3xl font-outfit font-bold text-green-600">{stats.encryptionCoverage}%</p>
              <p className="text-sm text-green-600">
                {stats.encryptedAssets} of {stats.totalAssets} assets
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
              <p className="text-sm font-medium text-gray-600">Access Controls</p>
              <p className="text-3xl font-outfit font-bold text-blue-600">{stats.accessControlCoverage}%</p>
              <p className="text-sm text-blue-600">
                {stats.accessControlledAssets} assets protected
              </p>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <Key className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Personal Data</p>
              <p className="text-3xl font-outfit font-bold text-purple-600">{stats.personalDataAssets}</p>
              <p className="text-sm text-purple-600">
                {stats.totalAssets > 0 ? Math.round((stats.personalDataAssets / stats.totalAssets) * 100) : 0}% of total
              </p>
            </div>
            <div className="p-3 bg-purple-50 rounded-lg">
              <Users className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Data Breaches</p>
              <p className="text-3xl font-outfit font-bold text-red-600">{stats.dataBreachHistory}</p>
              <p className="text-sm text-red-600">Incidents recorded</p>
            </div>
            <div className="p-3 bg-red-50 rounded-lg">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Security Controls Overview */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-outfit font-semibold text-gray-900">
            Security Controls Status
          </h3>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowOnlyRisks(!showOnlyRisks)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                showOnlyRisks 
                  ? 'bg-red-100 text-red-700 border border-red-200' 
                  : 'bg-gray-100 text-gray-700 border border-gray-200'
              }`}
            >
              {showOnlyRisks ? <EyeOff className="h-4 w-4 mr-2 inline" /> : <Eye className="h-4 w-4 mr-2 inline" />}
              {showOnlyRisks ? 'Show All' : 'Show Risks Only'}
            </button>
            <button
              onClick={exportProtectionReport}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {securityControls
            .filter(control => !showOnlyRisks || control.status !== 'Implemented')
            .map(control => (
              <div key={control.id} className={`p-4 rounded-lg border-2 ${getControlStatusColor(control.status)}`}>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-gray-900">{control.name}</h4>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getControlStatusColor(control.status)}`}>
                    {control.status}
                  </span>
                </div>
                
                <p className="text-sm text-gray-600 mb-3">{control.description}</p>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Coverage</span>
                    <span className="font-medium">{control.coverage}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all ${
                        control.coverage >= 80 ? 'bg-green-600' :
                        control.coverage >= 60 ? 'bg-yellow-600' : 'bg-red-600'
                      }`}
                      style={{ width: `${control.coverage}%` }}
                    />
                  </div>
                </div>

                <div className="mt-3">
                  <h5 className="text-xs font-medium text-gray-700 mb-2">Requirements:</h5>
                  <div className="space-y-1">
                    {control.requirements.slice(0, 2).map((req, index) => (
                      <div key={index} className="text-xs text-gray-600 flex items-center">
                        <CheckCircle className="h-3 w-3 mr-1 text-green-500" />
                        {req}
                      </div>
                    ))}
                    {control.requirements.length > 2 && (
                      <div className="text-xs text-gray-500">
                        +{control.requirements.length - 2} more...
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Data Flows */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-outfit font-semibold text-gray-900 mb-6">
          Data Flow Security
        </h3>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Source</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Destination</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Data Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Encryption</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Access Control</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Risk Level</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Purpose</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {dataFlows.slice(0, 10).map(flow => (
                <tr key={flow.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {flow.source}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {flow.destination}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {flow.dataType}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {flow.encryption ? (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Yes
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        No
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {flow.accessControl ? (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Yes
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        No
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getRiskLevelColor(flow.riskLevel)}`}>
                      {flow.riskLevel}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {flow.purpose}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Encryption Status Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-outfit font-semibold text-gray-900 mb-4 flex items-center">
            <BarChart3 className="h-5 w-5 mr-2 text-blue-600" />
            Encryption Status Distribution
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600">Encrypted</span>
              <div className="flex items-center space-x-2">
                <div className="w-24 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-600 h-2 rounded-full"
                    style={{ width: `${(stats.encryptedAssets / stats.totalAssets) * 100}%` }}
                  />
                </div>
                <span className="text-sm font-medium text-gray-900 w-8">{stats.encryptedAssets}</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600">Partially Encrypted</span>
              <div className="flex items-center space-x-2">
                <div className="w-24 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-yellow-600 h-2 rounded-full"
                    style={{ width: `${(stats.partiallyEncryptedAssets / stats.totalAssets) * 100}%` }}
                  />
                </div>
                <span className="text-sm font-medium text-gray-900 w-8">{stats.partiallyEncryptedAssets}</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600">Not Encrypted</span>
              <div className="flex items-center space-x-2">
                <div className="w-24 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-red-600 h-2 rounded-full"
                    style={{ width: `${(stats.unencryptedAssets / stats.totalAssets) * 100}%` }}
                  />
                </div>
                <span className="text-sm font-medium text-gray-900 w-8">{stats.unencryptedAssets}</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600">Unknown</span>
              <div className="flex items-center space-x-2">
                <div className="w-24 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-gray-600 h-2 rounded-full"
                    style={{ width: `${(stats.unknownEncryptionAssets / stats.totalAssets) * 100}%` }}
                  />
                </div>
                <span className="text-sm font-medium text-gray-900 w-8">{stats.unknownEncryptionAssets}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-outfit font-semibold text-gray-900 mb-4 flex items-center">
            <TrendingUp className="h-5 w-5 mr-2 text-green-600" />
            Protection Recommendations
          </h3>
          <div className="space-y-4">
            {stats.encryptionCoverage < 80 && (
              <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                <h4 className="font-medium text-red-900 mb-2">Improve Encryption Coverage</h4>
                <p className="text-sm text-red-800">
                  Only {stats.encryptionCoverage}% of assets are encrypted. Target 90%+ coverage.
                </p>
              </div>
            )}
            {stats.accessControlCoverage < 70 && (
              <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                <h4 className="font-medium text-orange-900 mb-2">Enhance Access Controls</h4>
                <p className="text-sm text-orange-800">
                  {stats.accessControlCoverage}% access control coverage needs improvement.
                </p>
              </div>
            )}
            {stats.personalDataAssets > 0 && stats.piaCompletedAssets < stats.personalDataAssets && (
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h4 className="font-medium text-blue-900 mb-2">Complete Privacy Impact Assessments</h4>
                <p className="text-sm text-blue-800">
                  {stats.personalDataAssets - stats.piaCompletedAssets} personal data assets need PIA completion.
                </p>
              </div>
            )}
            {stats.dataBreachHistory > 0 && (
              <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                <h4 className="font-medium text-purple-900 mb-2">Review Data Breach History</h4>
                <p className="text-sm text-purple-800">
                  {stats.dataBreachHistory} data breach incidents require review and remediation.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};