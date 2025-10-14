// Production monitoring and error tracking utilities
import React, { useState, useEffect } from 'react';
import { Shield } from 'lucide-react';

interface ErrorInfo {
  message: string;
  stack?: string;
  context?: string;
  timestamp: string;
  userAgent: string;
  url: string;
  userId?: string;
  organizationId?: string;
  additionalData?: Record<string, unknown>;
}

interface PerformanceMetric {
  name: string;
  value: number;
  unit: string;
  timestamp: string;
  context?: string;
}

class MonitoringService {
  private errorBuffer: ErrorInfo[] = [];
  private performanceBuffer: PerformanceMetric[] = [];
  private isEnabled: boolean;

  constructor() {
    this.isEnabled = import.meta.env.VITE_ENABLE_ERROR_REPORTING === 'true';
  }

  // Error tracking
  captureError(error: Error | string, context?: string, additionalData?: Record<string, unknown>) {
    if (!this.isEnabled) return;

    const errorInfo: ErrorInfo = {
      message: typeof error === 'string' ? error : error.message,
      stack: typeof error === 'object' ? error.stack : undefined,
      context,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      additionalData,
    };

    this.errorBuffer.push(errorInfo);
    
    // Log to console in development
    if (import.meta.env.MODE === 'development') {
      console.error('Monitoring Error:', errorInfo);
    }

    // Send to external service in production
    if (import.meta.env.MODE === 'production') {
      this.sendErrorToService(errorInfo);
    }

    // Limit buffer size
    if (this.errorBuffer.length > 100) {
      this.errorBuffer = this.errorBuffer.slice(-50);
    }
  }

  // Performance tracking
  capturePerformanceMetric(name: string, value: number, unit: string = 'ms', context?: string) {
    if (!this.isEnabled) return;

    const metric: PerformanceMetric = {
      name,
      value,
      unit,
      timestamp: new Date().toISOString(),
      context,
    };

    this.performanceBuffer.push(metric);

    // Log significant performance issues
    if ((unit === 'ms' && value > 1000) || (unit === 'bytes' && value > 1024 * 1024)) {
      console.warn('Performance Warning:', metric);
    }

    // Limit buffer size
    if (this.performanceBuffer.length > 100) {
      this.performanceBuffer = this.performanceBuffer.slice(-50);
    }
  }

  // Measure function execution time
  measurePerformance<T>(name: string, fn: () => T | Promise<T>, context?: string): T | Promise<T> {
    const startTime = performance.now();
    
    try {
      const result = fn();
      
      if (result instanceof Promise) {
        return result
          .then(value => {
            this.capturePerformanceMetric(name, performance.now() - startTime, 'ms', context);
            return value;
          })
          .catch(error => {
            this.capturePerformanceMetric(name, performance.now() - startTime, 'ms', `${context} (error)`);
            throw error;
          });
      } else {
        this.capturePerformanceMetric(name, performance.now() - startTime, 'ms', context);
        return result;
      }
    } catch (error) {
      this.capturePerformanceMetric(name, performance.now() - startTime, 'ms', `${context} (error)`);
      throw error;
    }
  }

  // Send error to external service
  private async sendErrorToService(errorInfo: ErrorInfo) {
    try {
      const sentryDsn = import.meta.env.VITE_SENTRY_DSN;
      if (sentryDsn) {
        // In a real implementation, you would send to Sentry or similar service
        // For now, we'll just log it
        console.log('Would send to Sentry:', errorInfo);
      }
    } catch (error) {
      console.error('Failed to send error to monitoring service:', error);
    }
  }

  // Get error report for debugging
  getErrorReport(): ErrorInfo[] {
    return [...this.errorBuffer];
  }

  // Get performance report
  getPerformanceReport(): PerformanceMetric[] {
    return [...this.performanceBuffer];
  }

  // Clear buffers
  clearBuffers() {
    this.errorBuffer = [];
    this.performanceBuffer = [];
  }

  // Health check
  async performHealthCheck(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy';
    checks: Record<string, boolean>;
    timestamp: string;
  }> {
    const checks = {
      localStorage: this.checkLocalStorage(),
      sessionStorage: this.checkSessionStorage(),
      indexedDB: await this.checkIndexedDB(),
      networkConnectivity: navigator.onLine,
      serviceWorker: 'serviceWorker' in navigator,
    };

    const healthyChecks = Object.values(checks).filter(Boolean).length;
    const totalChecks = Object.keys(checks).length;
    
    let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
    if (healthyChecks < totalChecks * 0.8) {
      status = 'degraded';
    }
    if (healthyChecks < totalChecks * 0.5) {
      status = 'unhealthy';
    }

    return {
      status,
      checks,
      timestamp: new Date().toISOString(),
    };
  }

  private checkLocalStorage(): boolean {
    try {
      const testKey = '__ermits_test__';
      localStorage.setItem(testKey, 'test');
      localStorage.removeItem(testKey);
      return true;
    } catch {
      return false;
    }
  }

  private checkSessionStorage(): boolean {
    try {
      const testKey = '__ermits_test__';
      sessionStorage.setItem(testKey, 'test');
      sessionStorage.removeItem(testKey);
      return true;
    } catch {
      return false;
    }
  }

  private async checkIndexedDB(): Promise<boolean> {
    try {
      return 'indexedDB' in window;
    } catch {
      return false;
    }
  }
}

// Create singleton instance
export const monitoring = new MonitoringService();

// Global error handling setup function
export const setupGlobalErrorHandling = () => {
  // Global error handler
  window.addEventListener('error', (event) => {
    monitoring.captureError(event.error || event.message, 'Global Error Handler', {
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
    });
  });

  // Global unhandled promise rejection handler
  window.addEventListener('unhandledrejection', (event) => {
    monitoring.captureError(
      event.reason instanceof Error ? event.reason : String(event.reason),
      'Unhandled Promise Rejection'
    );
  });
};

// Performance observer for Core Web Vitals
if ('PerformanceObserver' in window) {
  try {
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'navigation') {
          const navigation = entry as PerformanceNavigationTiming;
          monitoring.capturePerformanceMetric('page-load', navigation.loadEventEnd - navigation.fetchStart, 'ms', 'navigation');
        }
        
        if (entry.entryType === 'paint') {
          monitoring.capturePerformanceMetric(`paint-${entry.name}`, entry.startTime, 'ms', 'paint');
        }
        
        if (entry.entryType === 'largest-contentful-paint') {
          monitoring.capturePerformanceMetric('lcp', entry.startTime, 'ms', 'core-web-vitals');
        }
      }
    });

    observer.observe({ entryTypes: ['navigation', 'paint', 'largest-contentful-paint'] });
  } catch (error) {
    console.warn('Performance Observer not supported:', error);
  }
}

// Error Boundary Component
const ErrorBoundaryWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const handleError = (error: ErrorEvent) => {
      setHasError(true);
      monitoring.captureError(error.error, 'Error Boundary');
    };

    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);

  if (hasError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
          <div className="mb-6">
            <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <Shield className="h-8 w-8 text-red-600" />
            </div>
            <h2 className="text-2xl font-outfit font-bold text-gray-900 mb-2">
              Something went wrong
            </h2>
            <p className="text-gray-600">
              An unexpected error occurred. Please refresh the page or contact support if the problem persists.
            </p>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="w-full py-3 bg-command-blue-600 text-white rounded-lg hover:bg-command-blue-700 transition-colors font-medium"
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

// Export utility functions
export const withErrorBoundary = <T extends Record<string, unknown>>(
  Component: React.ComponentType<T>
): React.ComponentType<T> => {
  const WrappedComponent: React.ComponentType<T> = (props) => {
    return (
      <ErrorBoundaryWrapper>
        <Component {...props} />
      </ErrorBoundaryWrapper>
    );
  };

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
  return WrappedComponent;
};