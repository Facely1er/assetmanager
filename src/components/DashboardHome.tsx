import React from 'react';
import { 
  Shield, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Users, 
  Building2, 
  Activity,
  BarChart3,
  PieChart,
  Target,
  Zap
} from 'lucide-react';
import { AssetStats } from '../types/asset';
import { format } from 'date-fns';

interface DashboardHomeProps {
  stats: AssetStats;
  onNavigateToAssets: () => void;
  onNavigateToReports: () => void;
  onNavigateToSettings: () => void;
}

export const DashboardHome: React.FC<DashboardHomeProps> = ({
  stats,
  onNavigateToAssets,
  onNavigateToReports,
  onNavigateToSettings,
}) => {
  const criticalityPercentages = {
    critical: Math.round((stats.byCriticality.Critical || 0) / stats.total * 100),
    high: Math.round((stats.byCriticality.High || 0) / stats.total * 100),
    medium: Math.round((stats.byCriticality.Medium || 0) / stats.total * 100),
    low: Math.round((stats.byCriticality.Low || 0) / stats.total * 100),
  };

  const riskScore = Math.round(
    (criticalityPercentages.critical * 4 + 
     criticalityPercentages.high * 3 + 
     criticalityPercentages.medium * 2 + 
     criticalityPercentages.low * 1) / 4
  );

  const quickActions = [
    {
      title: 'View All Assets',
      description: 'Browse and manage your complete asset inventory',
      icon: Shield,
      color: 'bg-command-blue-500',
      action: onNavigateToAssets,
    },
    {
      title: 'Generate Reports',
      description: 'Create compliance and risk assessment reports',
      icon: BarChart3,
      color: 'bg-action-cyan-500',
      action: onNavigateToReports,
    },
    {
      title: 'System Settings',
      description: 'Configure system preferences and integrations',
      icon: Target,
      color: 'bg-purple-500',
      action: onNavigateToSettings,
    },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-command-blue-600 via-command-blue-700 to-action-cyan-600 rounded-2xl p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-outfit font-bold mb-1 leading-tight">
              CyberSoluce<sup className="text-xl">™</sup>
            </h1>
            <h2 className="text-xl font-outfit font-semibold mb-1 opacity-95">
              Asset Manager
            </h2>
            <p className="text-sm opacity-80 mb-4">
              by ERMITS
            </p>
            <p className="text-lg opacity-90 mb-4 mt-2">
              Your comprehensive asset inventory management platform
            </p>
            <div className="flex items-center space-x-6 text-sm">
              <div className="flex items-center">
                <Building2 className="h-4 w-4 mr-2" />
                <span>{stats.total} Total Assets</span>
              </div>
              <div className="flex items-center">
                <Users className="h-4 w-4 mr-2" />
                <span>{Object.keys(stats.byType).length} Asset Types</span>
              </div>
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-2" />
                <span>Last updated: {format(new Date(), 'MMM dd, yyyy HH:mm')}</span>
              </div>
            </div>
          </div>
          <div className="hidden lg:block">
            <div className="w-32 h-32 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
              <Shield className="h-16 w-16 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Assets</p>
              <p className="text-3xl font-outfit font-bold text-gray-900">{stats.total}</p>
              <p className="text-sm text-green-600 flex items-center mt-1">
                <TrendingUp className="h-3 w-3 mr-1" />
                +{stats.recentlyAdded} this month
              </p>
            </div>
            <div className="p-3 bg-command-blue-50 rounded-lg">
              <Shield className="h-6 w-6 text-command-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Critical Assets</p>
              <p className="text-3xl font-outfit font-bold text-red-600">{stats.critical}</p>
              <p className="text-sm text-gray-500 mt-1">
                {criticalityPercentages.critical}% of total
              </p>
            </div>
            <div className="p-3 bg-red-50 rounded-lg">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Risk Score</p>
              <p className={`text-3xl font-outfit font-bold ${
                riskScore >= 75 ? 'text-red-600' :
                riskScore >= 50 ? 'text-orange-600' :
                riskScore >= 25 ? 'text-yellow-600' :
                'text-green-600'
              }`}>
                {riskScore}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Overall risk level
              </p>
            </div>
            <div className={`p-3 rounded-lg ${
              riskScore >= 75 ? 'bg-red-50' :
              riskScore >= 50 ? 'bg-orange-50' :
              riskScore >= 25 ? 'bg-yellow-50' :
              'bg-green-50'
            }`}>
              <Activity className={`h-6 w-6 ${
                riskScore >= 75 ? 'text-red-600' :
                riskScore >= 50 ? 'text-orange-600' :
                riskScore >= 25 ? 'text-yellow-600' :
                'text-green-600'
              }`} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Compliance Rate</p>
              <p className="text-3xl font-outfit font-bold text-green-600">
                {Math.round((stats.total - stats.untagged) / stats.total * 100)}%
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Assets with compliance tags
              </p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts and Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Asset Distribution Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-outfit font-semibold text-gray-900">Asset Distribution</h3>
            <PieChart className="h-5 w-5 text-gray-400" />
          </div>
          <div className="space-y-4">
            {Object.entries(stats.byType).map(([type, count]) => {
              const percentage = Math.round((count / stats.total) * 100);
              return (
                <div key={type} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className={`w-3 h-3 rounded-full mr-3 ${
                      type === 'Server' ? 'bg-blue-500' :
                      type === 'Database' ? 'bg-green-500' :
                      type === 'Application' ? 'bg-purple-500' :
                      type === 'Network' ? 'bg-orange-500' :
                      type === 'Endpoint' ? 'bg-pink-500' :
                      'bg-cyan-500'
                    }`}></div>
                    <span className="text-sm font-medium text-gray-700">{type}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${
                          type === 'Server' ? 'bg-blue-500' :
                          type === 'Database' ? 'bg-green-500' :
                          type === 'Application' ? 'bg-purple-500' :
                          type === 'Network' ? 'bg-orange-500' :
                          type === 'Endpoint' ? 'bg-pink-500' :
                          'bg-cyan-500'
                        }`}
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-600 w-12 text-right">{count}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Criticality Breakdown */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-outfit font-semibold text-gray-900">Risk Assessment</h3>
            <BarChart3 className="h-5 w-5 text-gray-400" />
          </div>
          <div className="space-y-4">
            {[
              { level: 'Critical', count: stats.byCriticality.Critical || 0, color: 'bg-red-500', textColor: 'text-red-600' },
              { level: 'High', count: stats.byCriticality.High || 0, color: 'bg-orange-500', textColor: 'text-orange-600' },
              { level: 'Medium', count: stats.byCriticality.Medium || 0, color: 'bg-yellow-500', textColor: 'text-yellow-600' },
              { level: 'Low', count: stats.byCriticality.Low || 0, color: 'bg-green-500', textColor: 'text-green-600' },
            ].map(({ level, count, color, textColor }) => {
              const percentage = stats.total > 0 ? Math.round((count / stats.total) * 100) : 0;
              return (
                <div key={level} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className={`w-3 h-3 rounded-full mr-3 ${color}`}></div>
                    <span className="text-sm font-medium text-gray-700">{level}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${color}`}
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                    <span className={`text-sm font-medium w-12 text-right ${textColor}`}>{count}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Quick Actions and Recent Activity */}
      <div className="grid grid-cols-1 gap-8">
        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-outfit font-semibold text-gray-900">Quick Actions</h3>
            <Zap className="h-5 w-5 text-gray-400" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {quickActions.map((action, index) => (
              <button
                key={index}
                onClick={action.action}
                className="flex flex-col items-center p-6 rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all group text-center"
              >
                <div className={`p-3 rounded-lg ${action.color} mb-4 group-hover:scale-105 transition-transform`}>
                  <action.icon className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 group-hover:text-command-blue-600 transition-colors">
                    {action.title}
                  </h4>
                  <p className="text-sm text-gray-500">{action.description}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};