import React, { useState, useEffect } from 'react';
import { BarChart3, Download, Calendar, Filter, TrendingUp, Shield, AlertTriangle, FileText, PieChart, Activity } from 'lucide-react';
import { Asset } from '../../types/asset';
import { Report } from '../../types/organization';
import { reportingService } from '../../services/reportingService';
import { useAssetInventory } from '../../hooks/useAssetInventory';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsPieChart, Cell, LineChart, Line, AreaChart, Area } from 'recharts';
import toast from 'react-hot-toast';

export const AdvancedReportingDashboard: React.FC = () => {
  const { assets, stats } = useAssetInventory();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedTimeRange, setSelectedTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [selectedReport, setSelectedReport] = useState<'overview' | 'compliance' | 'risk' | 'trends'>('overview');

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    setLoading(true);
    try {
      const data = await reportingService.getReports();
      setReports(data);
    } catch (error) {
      toast.error('Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  const generateReport = async (type: 'pdf' | 'excel' | 'csv') => {
    try {
      await reportingService.generateAssetSummaryReport(assets, type);
      toast.success(`${type.toUpperCase()} report generated successfully`);
    } catch (error) {
      toast.error('Failed to generate report');
    }
  };

  const generateComplianceReport = async (framework: string) => {
    try {
      await reportingService.generateComplianceReport(assets, framework);
      toast.success(`${framework} compliance report generated`);
    } catch (error) {
      toast.error('Failed to generate compliance report');
    }
  };

  const generateRiskReport = async () => {
    try {
      await reportingService.generateRiskAssessmentReport(assets);
      toast.success('Risk assessment report generated');
    } catch (error) {
      toast.error('Failed to generate risk report');
    }
  };

  // Chart data preparations
  const assetTypeData = Object.entries(stats.byType).map(([type, count]) => ({
    name: type,
    value: count,
    percentage: Math.round((count / stats.total) * 100),
  }));

  const criticalityData = Object.entries(stats.byCriticality).map(([level, count]) => ({
    name: level,
    value: count,
    percentage: Math.round((count / stats.total) * 100),
  }));

  const riskDistribution = [
    { range: '0-25', count: assets.filter(a => a.riskScore <= 25).length, color: '#10B981' },
    { range: '26-50', count: assets.filter(a => a.riskScore > 25 && a.riskScore <= 50).length, color: '#F59E0B' },
    { range: '51-75', count: assets.filter(a => a.riskScore > 50 && a.riskScore <= 75).length, color: '#EF4444' },
    { range: '76-100', count: assets.filter(a => a.riskScore > 75).length, color: '#DC2626' },
  ];

  const vulnerabilityTrends = assets.reduce((acc, asset) => {
    asset.vulnerabilities.forEach(vuln => {
      const month = new Date(vuln.discoveredAt).toISOString().slice(0, 7);
      if (!acc[month]) acc[month] = 0;
      acc[month]++;
    });
    return acc;
  }, {} as Record<string, number>);

  const trendData = Object.entries(vulnerabilityTrends)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-6)
    .map(([month, count]) => ({
      month: new Date(month + '-01').toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
      vulnerabilities: count,
    }));

  const complianceFrameworks = Array.from(
    new Set(assets.flatMap(asset => asset.complianceFrameworks))
  );

  const complianceData = complianceFrameworks.map(framework => ({
    framework,
    covered: assets.filter(asset => asset.complianceFrameworks.includes(framework)).length,
    total: stats.total,
    percentage: Math.round(
      (assets.filter(asset => asset.complianceFrameworks.includes(framework)).length / stats.total) * 100
    ),
  }));

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
        <h1 className="text-3xl font-outfit font-bold mb-2">Advanced Reporting</h1>
        <p className="text-lg opacity-90">Comprehensive analytics and insights for your asset inventory</p>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-gray-400" />
              <select
                value={selectedTimeRange}
                onChange={(e) => setSelectedTimeRange(e.target.value as '7d' | '30d' | '90d' | '1y')}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
                <option value="1y">Last year</option>
              </select>
            </div>
            
            <div className="flex items-center space-x-2">
              <Filter className="h-5 w-5 text-gray-400" />
              <select
                value={selectedReport}
                onChange={(e) => setSelectedReport(e.target.value as 'asset_summary' | 'compliance' | 'risk_assessment' | 'vulnerability')}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="overview">Overview</option>
                <option value="compliance">Compliance</option>
                <option value="risk">Risk Assessment</option>
                <option value="trends">Trends</option>
              </select>
            </div>
          </div>

          <div className="flex space-x-3">
            <button
              onClick={() => generateReport('pdf')}
              className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <FileText className="h-4 w-4 mr-2" />
              PDF Report
            </button>
            <button
              onClick={() => generateReport('excel')}
              className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Download className="h-4 w-4 mr-2" />
              Excel Export
            </button>
            <button
              onClick={generateRiskReport}
              className="inline-flex items-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
            >
              <AlertTriangle className="h-4 w-4 mr-2" />
              Risk Report
            </button>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Assets</p>
              <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
              <p className="text-sm text-green-600">+12% from last month</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <Shield className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Critical Assets</p>
              <p className="text-3xl font-bold text-red-600">{stats.critical}</p>
              <p className="text-sm text-red-600">{Math.round((stats.critical / stats.total) * 100)}% of total</p>
            </div>
            <div className="p-3 bg-red-50 rounded-lg">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Risk Score</p>
              <p className="text-3xl font-bold text-orange-600">
                {Math.round(assets.reduce((sum, a) => sum + a.riskScore, 0) / assets.length)}
              </p>
              <p className="text-sm text-orange-600">Medium risk level</p>
            </div>
            <div className="p-3 bg-orange-50 rounded-lg">
              <TrendingUp className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Vulnerabilities</p>
              <p className="text-3xl font-bold text-purple-600">
                {assets.reduce((sum, a) => sum + a.vulnerabilities.length, 0)}
              </p>
              <p className="text-sm text-purple-600">Across all assets</p>
            </div>
            <div className="p-3 bg-purple-50 rounded-lg">
              <Activity className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      {selectedReport === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Asset Type Distribution */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Asset Distribution by Type</h3>
            <ResponsiveContainer width="100%" height={300}>
              <RechartsPieChart>
                <RechartsPieChart data={assetTypeData}>
                  {assetTypeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </RechartsPieChart>
                <Tooltip formatter={(value, name) => [`${value} assets`, name]} />
              </RechartsPieChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-2 gap-4 mt-4">
              {assetTypeData.map((item, index) => (
                <div key={item.name} className="flex items-center space-x-2">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <span className="text-sm text-gray-600">{item.name}: {item.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Criticality Breakdown */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Asset Criticality Levels</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={criticalityData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {selectedReport === 'compliance' && (
        <div className="space-y-8">
          {/* Compliance Overview */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Compliance Framework Coverage</h3>
              <div className="flex space-x-2">
                {complianceFrameworks.slice(0, 3).map(framework => (
                  <button
                    key={framework}
                    onClick={() => generateComplianceReport(framework)}
                    className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium hover:bg-blue-200 transition-colors"
                  >
                    {framework} Report
                  </button>
                ))}
              </div>
            </div>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={complianceData} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="framework" type="category" width={80} />
                <Tooltip formatter={(value, name) => [`${value} assets`, 'Coverage']} />
                <Bar dataKey="covered" fill="#10B981" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Compliance Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {complianceData.map((item) => (
              <div key={item.framework} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-semibold text-gray-900">{item.framework}</h4>
                  <span className="text-2xl font-bold text-green-600">{item.percentage}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-600 h-2 rounded-full"
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  {item.covered} of {item.total} assets covered
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {selectedReport === 'risk' && (
        <div className="space-y-8">
          {/* Risk Distribution */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Risk Score Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={riskDistribution}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="range" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill={(entry) => entry.color} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* High Risk Assets */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">High Risk Assets (Score &gt; 75)</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Asset</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Risk Score</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vulnerabilities</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Owner</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {assets
                    .filter(asset => asset.riskScore > 75)
                    .slice(0, 10)
                    .map((asset) => (
                      <tr key={asset.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {asset.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {asset.type}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            {asset.riskScore}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {asset.vulnerabilities.length}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {asset.owner}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {selectedReport === 'trends' && (
        <div className="space-y-8">
          {/* Vulnerability Trends */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Vulnerability Discovery Trends</h3>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Area 
                  type="monotone" 
                  dataKey="vulnerabilities" 
                  stroke="#8884d8" 
                  fill="#8884d8" 
                  fillOpacity={0.3}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Asset Growth */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Asset Inventory Growth</h3>
            <div className="text-center py-8 text-gray-500">
              <BarChart3 className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>Historical growth data coming soon</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};