import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  Calendar, 
  Filter, 
  Download, 
  User, 
  Edit, 
  Trash2,
  Plus,
  Eye,
  Settings,
  Clock,
  Search
} from 'lucide-react';
import { AuditLog } from '../../types/organization';
import { format, subDays, isToday, isYesterday } from 'date-fns';
import toast from 'react-hot-toast';

interface ActivityLogProps {
  organizationId?: string;
}

export const ActivityLog: React.FC<ActivityLogProps> = ({ organizationId }) => {
  const [activities, setActivities] = useState<AuditLog[]>([]);
  const [filteredActivities, setFilteredActivities] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [actionFilter, setActionFilter] = useState<string>('');
  const [userFilter, setUserFilter] = useState<string>('');
  const [dateRange, setDateRange] = useState<'today' | '7d' | '30d' | '90d'>('7d');

  useEffect(() => {
    loadActivities();
  }, [organizationId, dateRange, loadActivities]);

  useEffect(() => {
    filterActivities();
  }, [activities, searchQuery, actionFilter, userFilter, filterActivities]);

  const loadActivities = React.useCallback(async () => {
    setLoading(true);
    try {
      // Demo mode - generate sample activity data
      const now = new Date();
      const sampleActivities: AuditLog[] = [
        {
          id: '1',
          organization_id: organizationId,
          user_id: 'user-1',
          action: 'asset.created',
          resource_type: 'asset',
          resource_id: 'asset-1',
          new_values: { name: 'Production Web Server', type: 'Server' },
          ip_address: '192.168.1.100',
          user_agent: 'Mozilla/5.0...',
          created_at: new Date(now.getTime() - 1000 * 60 * 30), // 30 minutes ago
          user: { full_name: 'John Doe', email: 'john@example.com' }
        },
        {
          id: '2',
          organization_id: organizationId,
          user_id: 'user-2',
          action: 'asset.updated',
          resource_type: 'asset',
          resource_id: 'asset-2',
          old_values: { risk_score: 70 },
          new_values: { risk_score: 85 },
          ip_address: '192.168.1.101',
          user_agent: 'Mozilla/5.0...',
          created_at: new Date(now.getTime() - 1000 * 60 * 60 * 2), // 2 hours ago
          user: { full_name: 'Jane Smith', email: 'jane@example.com' }
        },
        {
          id: '3',
          organization_id: organizationId,
          user_id: 'user-1',
          action: 'user.signed_in',
          resource_type: 'session',
          ip_address: '192.168.1.100',
          user_agent: 'Mozilla/5.0...',
          created_at: new Date(now.getTime() - 1000 * 60 * 60 * 4), // 4 hours ago
          user: { full_name: 'John Doe', email: 'john@example.com' }
        },
        {
          id: '4',
          organization_id: organizationId,
          user_id: 'user-3',
          action: 'compliance.framework_added',
          resource_type: 'asset',
          resource_id: 'asset-3',
          new_values: { compliance_frameworks: ['SOC 2', 'ISO 27001'] },
          ip_address: '192.168.1.102',
          user_agent: 'Mozilla/5.0...',
          created_at: new Date(now.getTime() - 1000 * 60 * 60 * 6), // 6 hours ago
          user: { full_name: 'Bob Wilson', email: 'bob@example.com' }
        },
        {
          id: '5',
          organization_id: organizationId,
          user_id: 'user-2',
          action: 'report.generated',
          resource_type: 'report',
          resource_id: 'report-1',
          new_values: { type: 'asset_summary', format: 'pdf' },
          ip_address: '192.168.1.101',
          user_agent: 'Mozilla/5.0...',
          created_at: new Date(now.getTime() - 1000 * 60 * 60 * 24), // 1 day ago
          user: { full_name: 'Jane Smith', email: 'jane@example.com' }
        }
      ];

      // Filter by date range
      const cutoffDate = subDays(now, 
        dateRange === 'today' ? 0 :
        dateRange === '7d' ? 7 :
        dateRange === '30d' ? 30 : 90
      );

      const filteredByDate = sampleActivities.filter(activity => 
        dateRange === 'today' ? isToday(activity.created_at) : activity.created_at >= cutoffDate
      );

      setActivities(filteredByDate);
    } catch {
      toast.error('Failed to load activity log');
    } finally {
      setLoading(false);
    }
  }, [organizationId, dateRange]);

  const filterActivities = React.useCallback(() => {
    let filtered = activities;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(activity =>
        activity.action.toLowerCase().includes(query) ||
        activity.resource_type.toLowerCase().includes(query) ||
        activity.user?.full_name?.toLowerCase().includes(query) ||
        activity.user?.email?.toLowerCase().includes(query)
      );
    }

    if (actionFilter) {
      filtered = filtered.filter(activity => activity.action.startsWith(actionFilter));
    }

    if (userFilter) {
      filtered = filtered.filter(activity => activity.user?.email === userFilter);
    }

    setFilteredActivities(filtered);
  }, [activities, searchQuery, actionFilter, userFilter]);

  const getActionIcon = (action: string) => {
    if (action.includes('created')) return <Plus className="h-4 w-4 text-green-600" />;
    if (action.includes('updated')) return <Edit className="h-4 w-4 text-blue-600" />;
    if (action.includes('deleted')) return <Trash2 className="h-4 w-4 text-red-600" />;
    if (action.includes('viewed')) return <Eye className="h-4 w-4 text-gray-600" />;
    if (action.includes('signed_in')) return <User className="h-4 w-4 text-purple-600" />;
    if (action.includes('settings')) return <Settings className="h-4 w-4 text-orange-600" />;
    return <Activity className="h-4 w-4 text-gray-600" />;
  };

  const getActionColor = (action: string) => {
    if (action.includes('created')) return 'text-green-600 bg-green-50';
    if (action.includes('updated')) return 'text-blue-600 bg-blue-50';
    if (action.includes('deleted')) return 'text-red-600 bg-red-50';
    if (action.includes('signed_in')) return 'text-purple-600 bg-purple-50';
    return 'text-gray-600 bg-gray-50';
  };

  const formatActionDescription = (activity: AuditLog) => {
    const parts = activity.action.split('.');
    const resource = parts[0];
    const action = parts[1];
    
    const actionMap: Record<string, string> = {
      'created': 'created',
      'updated': 'updated',
      'deleted': 'deleted',
      'signed_in': 'signed in',
      'signed_out': 'signed out',
      'framework_added': 'added compliance framework to',
      'generated': 'generated'
    };

    const resourceMap: Record<string, string> = {
      'asset': 'asset',
      'user': 'user account',
      'compliance': 'compliance',
      'report': 'report',
      'session': 'session'
    };

    return `${actionMap[action] || action} ${resourceMap[resource] || resource}`;
  };

  const exportActivityLog = async () => {
    try {
      const csvData = [
        ['Timestamp', 'User', 'Action', 'Resource Type', 'Resource ID', 'IP Address'],
        ...filteredActivities.map(activity => [
          format(activity.created_at, 'yyyy-MM-dd HH:mm:ss'),
          activity.user?.email || 'System',
          activity.action,
          activity.resource_type,
          activity.resource_id || '',
          activity.ip_address || ''
        ])
      ];

      const csvContent = csvData.map(row => row.map(field => `"${field}"`).join(',')).join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      
      link.setAttribute('href', url);
      link.setAttribute('download', `activity_log_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      URL.revokeObjectURL(url);
      toast.success('Activity log exported successfully');
    } catch {
      toast.error('Failed to export activity log');
    }
  };

  const groupedActivities = filteredActivities.reduce((groups, activity) => {
    const date = activity.created_at;
    let group = 'Older';
    
    if (isToday(date)) {
      group = 'Today';
    } else if (isYesterday(date)) {
      group = 'Yesterday';
    } else {
      group = format(date, 'MMM dd, yyyy');
    }
    
    if (!groups[group]) {
      groups[group] = [];
    }
    groups[group].push(activity);
    return groups;
  }, {} as Record<string, AuditLog[]>);

  const uniqueUsers = Array.from(new Set(activities.map(a => a.user?.email).filter(Boolean)));
  const uniqueActions = Array.from(new Set(activities.map(a => a.action.split('.')[0])));

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-600 to-blue-600 rounded-2xl p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-outfit font-bold mb-2 flex items-center">
              <Activity className="h-8 w-8 mr-3" />
              Activity Log
            </h1>
            <p className="text-lg opacity-90 mb-4">
              Track all system activities and user actions
            </p>
            <div className="flex items-center space-x-6 text-sm">
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-2" />
                <span>{filteredActivities.length} Activities</span>
              </div>
              <div className="flex items-center">
                <User className="h-4 w-4 mr-2" />
                <span>{uniqueUsers.length} Users</span>
              </div>
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-2" />
                <span>Last {dateRange}</span>
              </div>
            </div>
          </div>
          <div className="hidden lg:block">
            <div className="w-24 h-24 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
              <div className="text-center">
                <div className="text-2xl font-bold">{filteredActivities.length}</div>
                <div className="text-xs">Events</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center space-y-4 lg:space-y-0">
          <div className="flex flex-wrap gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search activities..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Actions</option>
              {uniqueActions.map(action => (
                <option key={action} value={action}>{action}</option>
              ))}
            </select>

            <select
              value={userFilter}
              onChange={(e) => setUserFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Users</option>
              {uniqueUsers.map(email => (
                <option key={email} value={email}>{email}</option>
              ))}
            </select>

            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value as 'today' | '7d' | '30d' | '90d')}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="today">Today</option>
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
            </select>
          </div>

          <div className="flex space-x-3">
            <button
              onClick={() => {
                setSearchQuery('');
                setActionFilter('');
                setUserFilter('');
                setDateRange('7d');
              }}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              <Filter className="h-4 w-4 mr-2" />
              Clear Filters
            </button>
            <button
              onClick={exportActivityLog}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Download className="h-4 w-4 mr-2" />
              Export Log
            </button>
          </div>
        </div>
      </div>

      {/* Activity Timeline */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : filteredActivities.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Activity className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>No activities found matching your criteria</p>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedActivities).map(([date, dateActivities]) => (
              <div key={date}>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 sticky top-0 bg-white py-2">
                  {date}
                </h3>
                <div className="space-y-4">
                  {dateActivities.map((activity) => (
                    <div key={activity.id} className="flex items-start space-x-4 p-4 hover:bg-gray-50 rounded-lg transition-colors">
                      <div className={`p-2 rounded-lg ${getActionColor(activity.action)}`}>
                        {getActionIcon(activity.action)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-gray-900">
                              {activity.user?.full_name || 'System'} {formatActionDescription(activity)}
                            </p>
                            <div className="flex items-center space-x-4 mt-1 text-sm text-gray-500">
                              <span>{format(activity.created_at, 'HH:mm')}</span>
                              <span>{activity.user?.email}</span>
                              {activity.ip_address && (
                                <span>IP: {activity.ip_address}</span>
                              )}
                            </div>
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getActionColor(activity.action)}`}>
                            {activity.action}
                          </span>
                        </div>
                        
                        {/* Show changes for update actions */}
                        {activity.old_values && activity.new_values && (
                          <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                            <p className="text-sm font-medium text-blue-900 mb-2">Changes:</p>
                            <div className="space-y-1 text-sm">
                              {Object.entries(activity.new_values).map(([key, value]) => (
                                <div key={key} className="flex items-center space-x-2">
                                  <span className="text-blue-600 font-medium">{key}:</span>
                                  {activity.old_values && activity.old_values[key] && (
                                    <>
                                      <span className="text-red-600 line-through">
                                        {JSON.stringify(activity.old_values[key])}
                                      </span>
                                      <span className="text-gray-400">→</span>
                                    </>
                                  )}
                                  <span className="text-green-600 font-medium">
                                    {JSON.stringify(value)}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};