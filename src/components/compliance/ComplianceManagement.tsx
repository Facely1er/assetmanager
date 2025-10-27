import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  CheckCircle, 
  AlertTriangle, 
  Plus, 
  Filter, 
  Download,
  Shield,
  Target,
  Calendar,
  TrendingUp,
  Users,
  Building2
} from 'lucide-react';
import { Asset } from '../../types/asset';
import { useAssetInventory } from '../../contexts/AssetInventoryContext';
import { complianceFrameworks } from '../../data/sampleAssets';
import { exportToCSV } from '../../utils/assetUtils';
import toast from 'react-hot-toast';

interface ComplianceFrameworkStatus {
  name: string;
  totalAssets: number;
  compliantAssets: number;
  complianceRate: number;
  criticalAssets: number;
  lastUpdated: Date;
}

export const ComplianceManagement: React.FC = () => {
  const { assets, filteredAssets, updateFilters } = useAssetInventory();
  const [selectedFramework, setSelectedFramework] = useState<string>('');
  const [frameworkStats, setFrameworkStats] = useState<ComplianceFrameworkStatus[]>([]);

  useEffect(() => {
    calculateFrameworkStats();
  }, [assets]);

  const calculateFrameworkStats = () => {
    const stats = complianceFrameworks.map(framework => {
      const compliantAssets = assets.filter(asset => 
        asset.complianceFrameworks.includes(framework)
      );
      const criticalCompliantAssets = compliantAssets.filter(asset => 
        asset.criticality === 'Critical'
      );

      return {
        name: framework,
        totalAssets: assets.length,
        compliantAssets: compliantAssets.length,
        complianceRate: assets.length > 0 ? Math.round((compliantAssets.length / assets.length) * 100) : 0,
        criticalAssets: criticalCompliantAssets.length,
        lastUpdated: new Date()
      };
    });

    setFrameworkStats(stats);
  };

  const handleFrameworkFilter = (framework: string) => {
    setSelectedFramework(framework);
    updateFilters({ complianceFrameworks: [framework] });
  };

  const clearFilters = () => {
    setSelectedFramework('');
    updateFilters({ complianceFrameworks: [] });
  };

  const exportComplianceReport = async (framework: string) => {
    try {
      const frameworkAssets = assets.filter(asset => 
        asset.complianceFrameworks.includes(framework)
      );
      await exportToCSV(frameworkAssets);
      toast.success(`${framework} compliance report exported`);
    } catch (error) {
      toast.error('Failed to export compliance report');
    }
  };

  const getFrameworkColor = (framework: string) => {
    const colors = {
      'SOC 2': 'bg-blue-50 border-blue-200 text-blue-700',
      'PCI DSS': 'bg-green-50 border-green-200 text-green-700',
      'ISO 27001': 'bg-purple-50 border-purple-200 text-purple-700',
      'GDPR': 'bg-indigo-50 border-indigo-200 text-indigo-700',
      'HIPAA': 'bg-pink-50 border-pink-200 text-pink-700',
      'NIST': 'bg-orange-50 border-orange-200 text-orange-700',
      'CIS Controls': 'bg-cyan-50 border-cyan-200 text-cyan-700',
      'COBIT': 'bg-yellow-50 border-yellow-200 text-yellow-700'
    };
    return colors[framework as keyof typeof colors] || 'bg-gray-50 border-gray-200 text-gray-700';
  };

  const overallComplianceRate = assets.length > 0 
    ? Math.round((assets.filter(asset => asset.complianceFrameworks.length > 0).length / assets.length) * 100)
    : 0;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-blue-600 rounded-2xl p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-outfit font-bold mb-2 flex items-center">
              <Shield className="h-8 w-8 mr-3" />
              Compliance Management
            </h1>
            <p className="text-lg opacity-90 mb-4">
              Monitor and manage compliance across security frameworks
            </p>
            <div className="flex items-center space-x-6 text-sm">
              <div className="flex items-center">
                <Target className="h-4 w-4 mr-2" />
                <span>{overallComplianceRate}% Overall Compliance</span>
              </div>
              <div className="flex items-center">
                <Building2 className="h-4 w-4 mr-2" />
                <span>{frameworkStats.length} Frameworks Monitored</span>
              </div>
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-2" />
                <span>Last updated: {new Date().toLocaleDateString()}</span>
              </div>
            </div>
          </div>
          <div className="hidden lg:block">
            <div className="w-24 h-24 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
              <div className="text-3xl font-bold">{overallComplianceRate}%</div>
            </div>
          </div>
        </div>
      </div>

      {/* Compliance Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Assets</p>
              <p className="text-3xl font-outfit font-bold text-gray-900">{assets.length}</p>
              <p className="text-sm text-blue-600">Asset inventory</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <Building2 className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Compliant Assets</p>
              <p className="text-3xl font-outfit font-bold text-green-600">
                {assets.filter(a => a.complianceFrameworks.length > 0).length}
              </p>
              <p className="text-sm text-green-600">{overallComplianceRate}% coverage</p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Non-Compliant</p>
              <p className="text-3xl font-outfit font-bold text-orange-600">
                {assets.filter(a => a.complianceFrameworks.length === 0).length}
              </p>
              <p className="text-sm text-orange-600">Need attention</p>
            </div>
            <div className="p-3 bg-orange-50 rounded-lg">
              <AlertTriangle className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Frameworks</p>
              <p className="text-3xl font-outfit font-bold text-purple-600">{complianceFrameworks.length}</p>
              <p className="text-sm text-purple-600">Available standards</p>
            </div>
            <div className="p-3 bg-purple-50 rounded-lg">
              <FileText className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Framework Status Grid */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-outfit font-semibold text-gray-900">
            Framework Compliance Status
          </h2>
          <div className="flex items-center space-x-3">
            <button
              onClick={clearFilters}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              <Filter className="h-4 w-4 mr-2 inline" />
              Clear Filters
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {frameworkStats.map((framework) => (
            <div 
              key={framework.name}
              className={`rounded-lg border-2 p-6 cursor-pointer transition-all hover:shadow-md ${
                selectedFramework === framework.name 
                  ? getFrameworkColor(framework.name)
                  : 'bg-white border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => handleFrameworkFilter(framework.name)}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">{framework.name}</h3>
                <span className={`text-2xl font-bold ${
                  framework.complianceRate >= 80 ? 'text-green-600' :
                  framework.complianceRate >= 60 ? 'text-yellow-600' :
                  'text-red-600'
                }`}>
                  {framework.complianceRate}%
                </span>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Compliant Assets</span>
                  <span className="font-medium">{framework.compliantAssets} / {framework.totalAssets}</span>
                </div>
                
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all ${
                      framework.complianceRate >= 80 ? 'bg-green-600' :
                      framework.complianceRate >= 60 ? 'bg-yellow-600' :
                      'bg-red-600'
                    }`}
                    style={{ width: `${framework.complianceRate}%` }}
                  />
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">
                    {framework.criticalAssets} critical assets
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      exportComplianceReport(framework.name);
                    }}
                    className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                  >
                    <Download className="h-3 w-3 inline mr-1" />
                    Export
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Compliance Gaps and Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Compliance Gaps */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-outfit font-semibold text-gray-900 mb-4 flex items-center">
            <AlertTriangle className="h-5 w-5 mr-2 text-orange-600" />
            Compliance Gaps
          </h3>
          <div className="space-y-4">
            {assets
              .filter(asset => asset.complianceFrameworks.length === 0)
              .slice(0, 5)
              .map((asset) => (
                <div key={asset.id} className="flex items-center justify-between p-3 bg-orange-50 rounded-lg border border-orange-200">
                  <div>
                    <div className="font-medium text-gray-900">{asset.name}</div>
                    <div className="text-sm text-gray-600">{asset.type} • {asset.criticality}</div>
                  </div>
                  <span className="text-orange-600 text-sm font-medium">No framework assigned</span>
                </div>
              ))}
            {assets.filter(asset => asset.complianceFrameworks.length === 0).length === 0 && (
              <div className="text-center py-6 text-gray-500">
                <CheckCircle className="h-12 w-12 mx-auto mb-3 text-green-400" />
                <p>All assets have compliance frameworks assigned!</p>
              </div>
            )}
          </div>
        </div>

        {/* Recommendations */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-outfit font-semibold text-gray-900 mb-4 flex items-center">
            <TrendingUp className="h-5 w-5 mr-2 text-blue-600" />
            Recommendations
          </h3>
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h4 className="font-medium text-blue-900 mb-2">Critical Asset Focus</h4>
              <p className="text-sm text-blue-800">
                Prioritize compliance for {assets.filter(a => a.criticality === 'Critical').length} critical assets
              </p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <h4 className="font-medium text-green-900 mb-2">Framework Consolidation</h4>
              <p className="text-sm text-green-800">
                Consider focusing on 2-3 primary frameworks for better coverage
              </p>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
              <h4 className="font-medium text-purple-900 mb-2">Regular Audits</h4>
              <p className="text-sm text-purple-800">
                Schedule quarterly compliance reviews for all critical assets
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Framework Analysis */}
      {selectedFramework && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-outfit font-semibold text-gray-900">
              {selectedFramework} Detailed Analysis
            </h3>
            <button
              onClick={() => exportComplianceReport(selectedFramework)}
              className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {(() => {
              const frameworkAssets = assets.filter(asset => 
                asset.complianceFrameworks.includes(selectedFramework)
              );
              const criticalCount = frameworkAssets.filter(a => a.criticality === 'Critical').length;
              const avgRisk = frameworkAssets.length > 0 
                ? Math.round(frameworkAssets.reduce((sum, a) => sum + a.riskScore, 0) / frameworkAssets.length)
                : 0;
              
              return (
                <>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600">{frameworkAssets.length}</div>
                    <div className="text-sm text-gray-600">Compliant Assets</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-red-600">{criticalCount}</div>
                    <div className="text-sm text-gray-600">Critical Assets</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-orange-600">{avgRisk}</div>
                    <div className="text-sm text-gray-600">Avg Risk Score</div>
                  </div>
                </>
              );
            })()}
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Asset</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Criticality</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Risk Score</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Owner</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {assets
                  .filter(asset => asset.complianceFrameworks.includes(selectedFramework))
                  .slice(0, 10)
                  .map((asset) => (
                    <tr key={asset.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-gray-900">{asset.name}</div>
                        <div className="text-sm text-gray-500">{asset.location}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{asset.type}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          asset.criticality === 'Critical' ? 'bg-red-100 text-red-800' :
                          asset.criticality === 'High' ? 'bg-orange-100 text-orange-800' :
                          asset.criticality === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {asset.criticality}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          asset.riskScore >= 80 ? 'bg-red-100 text-red-800' :
                          asset.riskScore >= 60 ? 'bg-orange-100 text-orange-800' :
                          asset.riskScore >= 40 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {asset.riskScore}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{asset.owner}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};