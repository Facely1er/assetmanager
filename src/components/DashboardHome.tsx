import React, { useRef, useEffect } from 'react';
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
import { format, subDays } from 'date-fns';

// Helper component for progress bar with dynamic width
const ProgressBar: React.FC<{ percentage: number; className?: string }> = ({ percentage, className = '' }) => {
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (barRef.current) {
      barRef.current.style.setProperty('--progress-width', `${percentage}%`);
    }
  }, [percentage]);

  return <div ref={barRef} className={`dashboard-progress-bar ${className}`} />;
};

interface DashboardHomeProps {
  stats: AssetStats;
  onNavigateToAssets: () => void;
  onNavigateToReports: () => void;
  onNavigateToSettings: () => void;
  onNavigateToActivity?: () => void;
}

export const DashboardHome: React.FC<DashboardHomeProps> = ({
  stats,
  onNavigateToAssets,
  onNavigateToReports,
  onNavigateToSettings,
  onNavigateToActivity,
}) => {
  const criticalityPercentages = {
    critical: stats.total > 0 ? Math.round((stats.byCriticality['Critical'] || 0) / stats.total * 100) : 0,
    high: stats.total > 0 ? Math.round((stats.byCriticality['High'] || 0) / stats.total * 100) : 0,
    medium: stats.total > 0 ? Math.round((stats.byCriticality['Medium'] || 0) / stats.total * 100) : 0,
    low: stats.total > 0 ? Math.round((stats.byCriticality['Low'] || 0) / stats.total * 100) : 0,
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

  // Recent Activity - can be connected to ActivityLog service later
  const recentActivity = [
    {
      type: 'asset_added',
      message: 'New server asset added to inventory',
      time: new Date(),
      icon: CheckCircle,
      color: 'text-green-600',
    },
    {
      type: 'vulnerability_detected',
      message: 'High severity vulnerability detected',
      time: subDays(new Date(), 1),
      icon: AlertTriangle,
      color: 'text-red-600',
    },
    {
      type: 'compliance_check',
      message: 'SOC 2 compliance assessment completed',
      time: subDays(new Date(), 2),
      icon: CheckCircle,
      color: 'text-blue-600',
    },
    {
      type: 'asset_updated',
      message: 'Database server configuration updated',
      time: subDays(new Date(), 3),
      icon: Activity,
      color: 'text-orange-600',
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
                {stats.total > 0 ? Math.round((stats.total - stats.untagged) / stats.total * 100) : 0}%
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
              const percentage = stats.total > 0 ? Math.round((count / stats.total) * 100) : 0;
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
                      <ProgressBar 
                        percentage={percentage}
                        className={`h-2 rounded-full ${
                          type === 'Server' ? 'bg-blue-500' :
                          type === 'Database' ? 'bg-green-500' :
                          type === 'Application' ? 'bg-purple-500' :
                          type === 'Network' ? 'bg-orange-500' :
                          type === 'Endpoint' ? 'bg-pink-500' :
                          'bg-cyan-500'
                        }`}
                      />
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
              { level: 'Critical', count: stats.byCriticality['Critical'] || 0, color: 'bg-red-500', textColor: 'text-red-600' },
              { level: 'High', count: stats.byCriticality['High'] || 0, color: 'bg-orange-500', textColor: 'text-orange-600' },
              { level: 'Medium', count: stats.byCriticality['Medium'] || 0, color: 'bg-yellow-500', textColor: 'text-yellow-600' },
              { level: 'Low', count: stats.byCriticality['Low'] || 0, color: 'bg-green-500', textColor: 'text-green-600' },
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
                      <ProgressBar 
                        percentage={percentage}
                        className={`h-2 rounded-full ${color}`}
                      />
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Quick Actions */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-outfit font-semibold text-gray-900 dark:text-white">Quick Actions</h3>
            <Zap className="h-5 w-5 text-gray-400" />
          </div>
          <div className="space-y-4">
            {quickActions.map((action, index) => (
              <button
                key={index}
                onClick={action.action}
                className="w-full flex items-center p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-sm transition-all group"
              >
                <div className={`p-3 rounded-lg ${action.color} mr-4 group-hover:scale-105 transition-transform`}>
                  <action.icon className="h-5 w-5 text-white" />
                </div>
                <div className="text-left">
                  <h4 className="font-medium text-gray-900 dark:text-white group-hover:text-command-blue-600 transition-colors">
                    {action.title}
                  </h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{action.description}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-outfit font-semibold text-gray-900 dark:text-white">Recent Activity</h3>
            <Activity className="h-5 w-5 text-gray-400" />
          </div>
          <div className="space-y-4">
            {recentActivity.map((activity, index) => (
              <div key={index} className="flex items-start space-x-3">
                <div className={`p-2 rounded-lg bg-gray-50 dark:bg-gray-700 ${activity.color}`}>
                  <activity.icon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{activity.message}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{format(activity.time, 'MMM dd, yyyy HH:mm')}</p>
                </div>
              </div>
            ))}
          </div>
          {onNavigateToActivity && (
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <button 
                onClick={onNavigateToActivity}
                className="text-sm text-command-blue-600 dark:text-command-blue-400 hover:text-command-blue-700 dark:hover:text-command-blue-300 font-medium"
              >
                View all activity →
              </button>
            </div>
          )}
        </div>
      </div>

      {/* System Health Status */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-outfit font-semibold text-gray-900 dark:text-white">System Health</h3>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-green-600 dark:text-green-400 font-medium">All Systems Operational</span>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-50 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
            <h4 className="font-medium text-gray-900 dark:text-white">Data Integrity</h4>
            <p className="text-sm text-gray-500 dark:text-gray-400">100% validated</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <Shield className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            </div>
            <h4 className="font-medium text-gray-900 dark:text-white">Security Status</h4>
            <p className="text-sm text-gray-500 dark:text-gray-400">Fully protected</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-purple-50 dark:bg-purple-900/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <Activity className="h-8 w-8 text-purple-600 dark:text-purple-400" />
            </div>
            <h4 className="font-medium text-gray-900 dark:text-white">Performance</h4>
            <p className="text-sm text-gray-500 dark:text-gray-400">Optimal</p>
          </div>
        </div>
      </div>
    </div>
  );
};