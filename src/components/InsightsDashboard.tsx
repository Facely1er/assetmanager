import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  AlertTriangle,
  DollarSign,
  Shield,
  BarChart3,
  Activity,
  Target,
  Zap,
  Eye,
  RefreshCw,
  Download,
  Filter,
  Calendar,
  ChevronRight,
  ChevronDown,
  Info,
  CheckCircle
} from 'lucide-react';
import { Asset } from '../types/asset';
import { EnrichmentData } from '../services/dataEnrichmentService';
import { AnalyticsInsights } from '../services/analyticsService';
import { dataEnrichmentService } from '../services/dataEnrichmentService';
import { analyticsService } from '../services/analyticsService';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area
} from 'recharts';
import toast from 'react-hot-toast';
import { logError } from '../utils/errorHandling';

interface InsightsDashboardProps {
  isOpen: boolean;
  onClose: () => void;
  assets: Asset[];
  className?: string;
}

export const InsightsDashboard: React.FC<InsightsDashboardProps> = ({
  isOpen,
  onClose,
  assets: propAssets,
  className = ''
}) => {
  const assets = propAssets;
  const [, setEnrichmentData] = useState<Map<string, EnrichmentData>>(new Map());
  const [analyticsInsights, setAnalyticsInsights] = useState<AnalyticsInsights | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedTimeRange, setSelectedTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [selectedView, setSelectedView] = useState<'overview' | 'trends' | 'forecasts' | 'anomalies' | 'recommendations'>('overview');
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['overview', 'trends']));

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFC658', '#FF7C7C'];

  const loadInsights = async () => {
    if (assets.length === 0) return;

    setLoading(true);
    try {
      // Enrich asset data
      const enriched = await dataEnrichmentService.enrichAssets(assets);
      setEnrichmentData(enriched);

      // Generate analytics insights
      const insights = await analyticsService.generateInsights(assets, enriched);
      setAnalyticsInsights(insights);
    } catch (error) {
      toast.error('Failed to load insights');
      logError(error, 'InsightsDashboard.loadInsights');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInsights();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assets]);

  const refreshInsights = async () => {
    await loadInsights();
    toast.success('Insights refreshed');
  };

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  const exportInsights = async () => {
    if (!analyticsInsights) return;
    
    try {
      const data = {
        timestamp: new Date().toISOString(),
        summary: analyticsInsights.summary,
        trends: analyticsInsights.trends,
        forecasts: analyticsInsights.forecasts,
        anomalies: analyticsInsights.anomalies,
        recommendations: analyticsInsights.recommendations
      };
      
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `insights-${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      URL.revokeObjectURL(url);
      
      toast.success('Insights exported successfully');
    } catch (error) {
      toast.error('Failed to export insights');
    }
  };

  const chartData = useMemo(() => {
    if (!analyticsInsights) return null;

    return {
      riskDistribution: Object.entries(analyticsInsights.summary.riskDistribution).map(([level, count]) => ({
        level,
        count,
        percentage: Math.round((count / analyticsInsights.summary.totalAssets) * 100)
      })),
      complianceStatus: Object.entries(analyticsInsights.summary.complianceStatus).map(([status, count]) => ({
        status,
        count,
        percentage: Math.round((count / analyticsInsights.summary.totalAssets) * 100)
      })),
      costBreakdown: Object.entries(analyticsInsights.summary.costAnalysis).map(([category, value]) => ({
        category,
        value: typeof value === 'number' ? value : 0
      })),
      trendData: analyticsInsights.trends.assetGrowth.dataPoints.slice(-30).map(point => ({
        date: point.date.toLocaleDateString(),
        value: point.value
      })),
      forecastData: analyticsInsights.forecasts.assetInventory.predictions.slice(0, 30).map(point => ({
        date: point.date.toLocaleDateString(),
        predicted: point.value,
        lowerBound: point.lowerBound,
        upperBound: point.upperBound
      }))
    };
  }, [analyticsInsights]);

  if (loading) {
    return (
      <div className={`flex items-center justify-center h-96 ${className}`}>
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading insights...</p>
        </div>
      </div>
    );
  }

  if (!analyticsInsights || !chartData) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <BarChart3 className="h-12 w-12 mx-auto mb-4 text-gray-300" />
        <p className="text-gray-600">No insights available</p>
        <button
          onClick={loadInsights}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Load Insights
        </button>
      </div>
    );
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-7xl h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900">Asset Insights & Analytics</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-outfit font-bold mb-2">Asset Insights & Analytics</h1>
            <p className="text-lg opacity-90">Comprehensive analytics and predictive insights for your asset inventory</p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={refreshInsights}
              className="p-2 bg-white bg-opacity-20 rounded-lg hover:bg-opacity-30 transition-colors"
              title="Refresh Insights"
            >
              <RefreshCw className="h-5 w-5" />
            </button>
            <button
              onClick={exportInsights}
              className="p-2 bg-white bg-opacity-20 rounded-lg hover:bg-opacity-30 transition-colors"
              title="Export Insights"
            >
              <Download className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-gray-400" />
              <select
                value={selectedTimeRange}
                onChange={(e) => setSelectedTimeRange(e.target.value as any)}
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
                value={selectedView}
                onChange={(e) => setSelectedView(e.target.value as any)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="overview">Overview</option>
                <option value="trends">Trends</option>
                <option value="forecasts">Forecasts</option>
                <option value="anomalies">Anomalies</option>
                <option value="recommendations">Recommendations</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Assets"
          value={analyticsInsights.summary.totalAssets}
          icon={BarChart3}
          color="text-blue-600 bg-blue-50"
          border="border-blue-200"
          trend={analyticsInsights.trends.assetGrowth.direction}
          trendValue={analyticsInsights.trends.assetGrowth.rate}
        />
        <MetricCard
          title="Average Risk Score"
          value={analyticsInsights.summary.performanceMetrics.averageRiskScore}
          icon={AlertTriangle}
          color="text-red-600 bg-red-50"
          border="border-red-200"
          trend={analyticsInsights.trends.riskTrends.direction}
          trendValue={analyticsInsights.trends.riskTrends.rate}
        />
        <MetricCard
          title="Compliance Score"
          value={analyticsInsights.summary.performanceMetrics.averageComplianceScore}
          icon={Shield}
          color="text-green-600 bg-green-50"
          border="border-green-200"
          trend={analyticsInsights.trends.complianceTrends.direction}
          trendValue={analyticsInsights.trends.complianceTrends.rate}
        />
        <MetricCard
          title="Total Cost"
          value={`$${analyticsInsights.summary.costAnalysis.totalCost.toLocaleString()}`}
          icon={DollarSign}
          color="text-purple-600 bg-purple-50"
          border="border-purple-200"
          trend={analyticsInsights.trends.costTrends.direction}
          trendValue={analyticsInsights.trends.costTrends.rate}
        />
      </div>

      {/* Overview Section */}
      <CollapsibleSection
        title="Overview"
        icon={Eye}
        isExpanded={expandedSections.has('overview')}
        onToggle={() => toggleSection('overview')}
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Risk Distribution */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Risk Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
              <RechartsPieChart>
                <RechartsPieChart data={chartData.riskDistribution}>
                  {chartData.riskDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </RechartsPieChart>
                <Tooltip formatter={(value, name) => [`${value} assets`, name]} />
              </RechartsPieChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-2 gap-4 mt-4">
              {chartData.riskDistribution.map((item, index) => (
                <div key={item.level} className="flex items-center space-x-2">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <span className="text-sm text-gray-600">{item.level}: {item.count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Compliance Status */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Compliance Status</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData.complianceStatus}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="status" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#10B981" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </CollapsibleSection>

      {/* Trends Section */}
      <CollapsibleSection
        title="Trends Analysis"
        icon={TrendingUp}
        isExpanded={expandedSections.has('trends')}
        onToggle={() => toggleSection('trends')}
      >
        <div className="space-y-8">
          {/* Asset Growth Trend */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Asset Growth Trend</h3>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={chartData.trendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Area 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#8884d8" 
                  fill="#8884d8" 
                  fillOpacity={0.3}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Risk vs Compliance Correlation */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Risk vs Compliance Correlation</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-4">Correlation Analysis</h4>
                {analyticsInsights.correlations.correlations.map((corr, index) => (
                  <div key={index} className="mb-4 p-4 bg-gray-50 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium">{corr.variable1} vs {corr.variable2}</span>
                      <span className={`px-2 py-1 rounded text-sm ${
                        Math.abs(corr.strength) > 0.7 ? 'bg-red-100 text-red-800' :
                        Math.abs(corr.strength) > 0.5 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {corr.strength > 0 ? '+' : ''}{corr.strength.toFixed(2)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">{corr.description}</p>
                  </div>
                ))}
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-4">Key Insights</h4>
                <ul className="space-y-2">
                  {analyticsInsights.correlations.insights.map((insight, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <Info className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-gray-600">{insight}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </CollapsibleSection>

      {/* Forecasts Section */}
      <CollapsibleSection
        title="Predictive Forecasts"
        icon={Target}
        isExpanded={expandedSections.has('forecasts')}
        onToggle={() => toggleSection('forecasts')}
      >
        <div className="space-y-8">
          {/* Asset Inventory Forecast */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Asset Inventory Forecast (90 days)</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData.forecastData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="predicted" 
                  stroke="#8884d8" 
                  strokeWidth={2}
                />
                <Line 
                  type="monotone" 
                  dataKey="lowerBound" 
                  stroke="#8884d8" 
                  strokeDasharray="5 5"
                  strokeOpacity={0.5}
                />
                <Line 
                  type="monotone" 
                  dataKey="upperBound" 
                  stroke="#8884d8" 
                  strokeDasharray="5 5"
                  strokeOpacity={0.5}
                />
              </LineChart>
            </ResponsiveContainer>
            <div className="mt-4 text-sm text-gray-600">
              <p>Confidence: {Math.round(analyticsInsights.forecasts.assetInventory.confidence * 100)}%</p>
              <p>Predicted growth: {analyticsInsights.forecasts.assetInventory.predictions[29]?.value || 0} assets in 90 days</p>
            </div>
          </div>

          {/* Forecast Scenarios */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Forecast Scenarios</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {analyticsInsights.forecasts.assetInventory.scenarios.map((scenario, index) => (
                <div key={index} className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-medium text-gray-900">{scenario.name}</h4>
                    <span className="text-sm text-gray-500">{Math.round(scenario.probability * 100)}% probability</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{scenario.description}</p>
                  <div className="text-sm">
                    <span className={`px-2 py-1 rounded text-xs ${
                      scenario.impact === 'High' ? 'bg-red-100 text-red-800' :
                      scenario.impact === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {scenario.impact} Impact
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CollapsibleSection>

      {/* Anomalies Section */}
      <CollapsibleSection
        title="Anomaly Detection"
        icon={AlertTriangle}
        isExpanded={expandedSections.has('anomalies')}
        onToggle={() => toggleSection('anomalies')}
      >
        <div className="space-y-6">
          {/* Anomalies List */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Detected Anomalies</h3>
            {analyticsInsights.anomalies.anomalies.length > 0 ? (
              <div className="space-y-4">
                {analyticsInsights.anomalies.anomalies.map((anomaly, index) => (
                  <div key={index} className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          anomaly.severity === 'Critical' ? 'bg-red-100 text-red-800' :
                          anomaly.severity === 'High' ? 'bg-orange-100 text-orange-800' :
                          anomaly.severity === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {anomaly.severity}
                        </span>
                        <span className="text-sm font-medium text-gray-900">{anomaly.type}</span>
                      </div>
                      <span className="text-xs text-gray-500">
                        {anomaly.detectedAt.toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{anomaly.description}</p>
                    <div className="text-xs text-gray-500">
                      <p>Confidence: {Math.round(anomaly.confidence * 100)}%</p>
                      <p>Affected Assets: {anomaly.affectedAssets.length}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
                <p>No anomalies detected</p>
              </div>
            )}
          </div>

          {/* Patterns */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Detected Patterns</h3>
            {analyticsInsights.anomalies.patterns.length > 0 ? (
              <div className="space-y-4">
                {analyticsInsights.anomalies.patterns.map((pattern, index) => (
                  <div key={index} className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-medium text-gray-900">{pattern.name}</h4>
                      <span className="text-sm text-gray-500">
                        {Math.round(pattern.confidence * 100)}% confidence
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{pattern.description}</p>
                    <div className="text-xs text-gray-500">
                      <p>Frequency: {Math.round(pattern.frequency * 100)}%</p>
                      <p>Affected Assets: {pattern.affectedAssets.length}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Activity className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No patterns detected</p>
              </div>
            )}
          </div>
        </div>
      </CollapsibleSection>

      {/* Recommendations Section */}
      <CollapsibleSection
        title="Smart Recommendations"
        icon={Zap}
        isExpanded={expandedSections.has('recommendations')}
        onToggle={() => toggleSection('recommendations')}
      >
        <div className="space-y-6">
          {analyticsInsights.recommendations.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {analyticsInsights.recommendations.map((rec, index) => (
                <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        rec.priority === 'Critical' ? 'bg-red-100 text-red-800' :
                        rec.priority === 'High' ? 'bg-orange-100 text-orange-800' :
                        rec.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {rec.priority}
                      </span>
                      <span className="text-sm font-medium text-gray-900">{rec.category}</span>
                    </div>
                    <span className="text-xs text-gray-500">
                      {Math.round(rec.confidence * 100)}% confidence
                    </span>
                  </div>
                  
                  <h4 className="font-semibold text-gray-900 mb-2">{rec.title}</h4>
                  <p className="text-sm text-gray-600 mb-4">{rec.description}</p>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Impact:</span>
                      <span className="text-gray-900">{rec.impact}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Effort:</span>
                      <span className="text-gray-900">{rec.effort}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Timeline:</span>
                      <span className="text-gray-900">{rec.timeline}</span>
                    </div>
                    {rec.cost && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Cost:</span>
                        <span className="text-gray-900">${rec.cost.toLocaleString()}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="mb-4">
                    <h5 className="text-sm font-medium text-gray-900 mb-2">Benefits:</h5>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {rec.benefits.map((benefit, idx) => (
                        <li key={idx} className="flex items-center space-x-2">
                          <CheckCircle className="h-3 w-3 text-green-500 flex-shrink-0" />
                          <span>{benefit}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="text-xs text-gray-500">
                    <p>Affected Assets: {rec.affectedAssets.length}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Target className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No recommendations available</p>
            </div>
          )}
        </div>
      </CollapsibleSection>
          </div>
        </div>
      </div>
    </div>
  );
};

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  border: string;
  trend?: 'Increasing' | 'Decreasing' | 'Stable';
  trendValue?: number;
}

const MetricCard: React.FC<MetricCardProps> = ({ 
  title, 
  value, 
  icon: Icon, 
  color, 
  border, 
  trend, 
  trendValue 
}) => {
  const getTrendColor = (trend?: string) => {
    switch (trend) {
      case 'Increasing': return 'text-red-600';
      case 'Decreasing': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  const getTrendIcon = (trend?: string) => {
    switch (trend) {
      case 'Increasing': return <TrendingUp className="h-3 w-3" />;
      case 'Decreasing': return <TrendingUp className="h-3 w-3 rotate-180" />;
      default: return <Activity className="h-3 w-3" />;
    }
  };

  return (
    <div className={`bg-white p-6 rounded-lg border-2 ${border} hover:shadow-md transition-all duration-300`}>
      <div className="flex items-center">
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon className="h-6 w-6" />
        </div>
        <div className="ml-4 flex-1">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-outfit font-bold text-gray-900">{value}</p>
          {trend && trendValue !== undefined && (
            <div className={`flex items-center space-x-1 text-xs ${getTrendColor(trend)}`}>
              {getTrendIcon(trend)}
              <span>{Math.abs(trendValue).toFixed(1)}%</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

interface CollapsibleSectionProps {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  isExpanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({ 
  title, 
  icon: Icon, 
  isExpanded, 
  onToggle, 
  children 
}) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      <button
        onClick={onToggle}
        className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center space-x-3">
          <Icon className="h-5 w-5 text-gray-500" />
          <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
        </div>
        {isExpanded ? (
          <ChevronDown className="h-5 w-5 text-gray-500" />
        ) : (
          <ChevronRight className="h-5 w-5 text-gray-500" />
        )}
      </button>
      {isExpanded && (
        <div className="px-6 pb-6">
          {children}
        </div>
      )}
    </div>
  );
};