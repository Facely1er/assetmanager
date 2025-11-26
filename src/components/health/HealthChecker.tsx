import React, { useState, useEffect } from 'react';
import { Activity, CheckCircle, AlertTriangle, XCircle, RefreshCw } from 'lucide-react';
import { monitoring } from '../../utils/monitoring';
import { isSupabaseEnabled } from '../../lib/supabase';
import { logger } from '../../utils/logger';

interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  checks: Record<string, boolean>;
  timestamp: string;
}

export const HealthChecker: React.FC = () => {
  const [healthStatus, setHealthStatus] = useState<HealthStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    checkHealth();
    
    // Periodic health checks
    const interval = setInterval(checkHealth, 60000); // Every minute
    
    return () => clearInterval(interval);
  }, []);

  const checkHealth = async () => {
    setLoading(true);
    try {
      const status = await monitoring.performHealthCheck();
      setHealthStatus(status);
    } catch (error) {
      logger.error('Health check failed', error instanceof Error ? error : undefined);
    } finally {
      setLoading(false);
    }
  };

  if (!healthStatus) {
    return null;
  }

  const getStatusIcon = () => {
    switch (healthStatus.status) {
      case 'healthy': return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'degraded': return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      case 'unhealthy': return <XCircle className="h-5 w-5 text-red-600" />;
    }
  };

  const getStatusColor = () => {
    switch (healthStatus.status) {
      case 'healthy': return 'bg-green-50 border-green-200 text-green-800';
      case 'degraded': return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'unhealthy': return 'bg-red-50 border-red-200 text-red-800';
    }
  };

  const getCheckIcon = (passing: boolean) => {
    return passing ? (
      <CheckCircle className="h-4 w-4 text-green-600" />
    ) : (
      <XCircle className="h-4 w-4 text-red-600" />
    );
  };

  return (
    <div className="fixed bottom-4 left-4 z-50">
      <div className={`rounded-lg border-2 p-3 shadow-lg cursor-pointer transition-all ${getStatusColor()}`}
           onClick={() => setShowDetails(!showDetails)}>
        <div className="flex items-center space-x-2">
          {getStatusIcon()}
          <span className="text-sm font-medium capitalize">{healthStatus.status}</span>
          {loading && <RefreshCw className="h-4 w-4 animate-spin" />}
        </div>
      </div>

      {showDetails && (
        <div className="absolute bottom-full left-0 mb-2 bg-white rounded-lg shadow-xl border border-gray-200 p-4 min-w-80">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-900 flex items-center">
              <Activity className="h-4 w-4 mr-2" />
              System Health
            </h3>
            <button
              onClick={checkHealth}
              className="p-1 hover:bg-gray-100 rounded"
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 text-gray-500 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>

          <div className="space-y-2">
            {Object.entries(healthStatus.checks).map(([check, passing]) => (
              <div key={check} className="flex items-center justify-between">
                <span className="text-sm text-gray-700 capitalize">
                  {check.replace(/([A-Z])/g, ' $1').toLowerCase()}
                </span>
                {getCheckIcon(passing)}
              </div>
            ))}
            
            <div className="border-t border-gray-200 pt-2 mt-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">Database</span>
                {getCheckIcon(isSupabaseEnabled)}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">Network</span>
                {getCheckIcon(navigator.onLine)}
              </div>
            </div>
          </div>

          <div className="text-xs text-gray-500 mt-3">
            Last checked: {new Date(healthStatus.timestamp).toLocaleTimeString()}
          </div>
        </div>
      )}
    </div>
  );
};