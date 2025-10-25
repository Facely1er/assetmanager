// Performance monitoring and optimization utilities

interface PerformanceMetrics {
  loadTime: number;
  renderTime: number;
  memoryUsage: number;
  bundleSize: number;
}

class PerformanceMonitor {
  private metrics: PerformanceMetrics[] = [];
  private observers: PerformanceObserver[] = [];

  // Measure component render time
  measureRender<T>(componentName: string, renderFn: () => T): T {
    const start = performance.now();
    const result = renderFn();
    const end = performance.now();
    
    const renderTime = end - start;
    this.recordMetric('renderTime', renderTime, { component: componentName });
    
    return result;
  }

  // Measure async operations
  async measureAsync<T>(
    operationName: string, 
    operation: () => Promise<T>
  ): Promise<T> {
    const start = performance.now();
    try {
      const result = await operation();
      const end = performance.now();
      
      const duration = end - start;
      this.recordMetric('loadTime', duration, { operation: operationName });
      
      return result;
    } catch (error) {
      const end = performance.now();
      const duration = end - start;
      this.recordMetric('loadTime', duration, { 
        operation: operationName, 
        error: true 
      });
      throw error;
    }
  }

  // Record performance metrics
  private recordMetric(
    type: keyof PerformanceMetrics, 
    value: number, 
    metadata?: Record<string, unknown>
  ) {
    const metric = {
      [type]: value,
      timestamp: Date.now(),
      metadata
    } as PerformanceMetrics & { timestamp: number; metadata?: Record<string, unknown> };

    this.metrics.push(metric);

    // Keep only last 100 metrics to prevent memory leaks
    if (this.metrics.length > 100) {
      this.metrics = this.metrics.slice(-100);
    }

    // Log in development
    if (import.meta.env.DEV) {
      console.log(`[Performance] ${type}:`, value, metadata);
    }
  }

  // Get performance summary
  getSummary(): {
    averageLoadTime: number;
    averageRenderTime: number;
    totalMetrics: number;
    slowestOperations: Array<{ operation: string; time: number }>;
  } {
    const loadTimes = this.metrics
      .filter(m => m.loadTime)
      .map(m => m.loadTime);
    
    const renderTimes = this.metrics
      .filter(m => m.renderTime)
      .map(m => m.renderTime);

    const slowestOperations = this.metrics
      .filter(m => m.metadata?.operation)
      .map(m => ({
        operation: m.metadata?.operation as string,
        time: m.loadTime || m.renderTime || 0
      }))
      .sort((a, b) => b.time - a.time)
      .slice(0, 5);

    return {
      averageLoadTime: loadTimes.length > 0 
        ? loadTimes.reduce((a, b) => a + b, 0) / loadTimes.length 
        : 0,
      averageRenderTime: renderTimes.length > 0 
        ? renderTimes.reduce((a, b) => a + b, 0) / renderTimes.length 
        : 0,
      totalMetrics: this.metrics.length,
      slowestOperations
    };
  }

  // Monitor memory usage
  monitorMemory() {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      this.recordMetric('memoryUsage', memory.usedJSHeapSize / 1024 / 1024, {
        total: memory.totalJSHeapSize / 1024 / 1024,
        limit: memory.jsHeapSizeLimit / 1024 / 1024
      });
    }
  }

  // Setup performance observers
  setupObservers() {
    if ('PerformanceObserver' in window) {
      // Observe long tasks
      const longTaskObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.duration > 50) { // Tasks longer than 50ms
            this.recordMetric('renderTime', entry.duration, {
              type: 'long-task',
              startTime: entry.startTime
            });
          }
        }
      });

      try {
        longTaskObserver.observe({ entryTypes: ['longtask'] });
        this.observers.push(longTaskObserver);
      } catch (e) {
        // Long task observer not supported
      }

      // Observe navigation timing
      const navigationObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'navigation') {
            const navEntry = entry as PerformanceNavigationTiming;
            this.recordMetric('loadTime', navEntry.loadEventEnd - navEntry.loadEventStart, {
              type: 'navigation',
              domContentLoaded: navEntry.domContentLoadedEventEnd - navEntry.domContentLoadedEventStart
            });
          }
        }
      });

      try {
        navigationObserver.observe({ entryTypes: ['navigation'] });
        this.observers.push(navigationObserver);
      } catch (e) {
        // Navigation observer not supported
      }
    }
  }

  // Cleanup observers
  cleanup() {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
  }
}

// Global performance monitor instance
export const performanceMonitor = new PerformanceMonitor();

// Initialize performance monitoring
if (typeof window !== 'undefined') {
  performanceMonitor.setupObservers();
  
  // Monitor memory usage every 30 seconds
  setInterval(() => {
    performanceMonitor.monitorMemory();
  }, 30000);
}

// React hook for measuring component performance
export const usePerformanceMeasure = (componentName: string) => {
  const measureRender = <T>(renderFn: () => T): T => {
    return performanceMonitor.measureRender(componentName, renderFn);
  };

  const measureAsync = <T>(operationName: string, operation: () => Promise<T>): Promise<T> => {
    return performanceMonitor.measureAsync(operationName, operation);
  };

  return { measureRender, measureAsync };
};

// Bundle size analyzer
export const analyzeBundleSize = () => {
  if (import.meta.env.DEV) {
    const scripts = document.querySelectorAll('script[src]');
    let totalSize = 0;
    
    scripts.forEach(script => {
      const src = script.getAttribute('src');
      if (src && src.includes('assets/')) {
        // This is a rough estimate - in reality you'd need to fetch the actual file size
        console.log(`Script: ${src}`);
      }
    });
    
    console.log(`Total estimated bundle size: ${totalSize} bytes`);
  }
};

// Debounce utility for performance
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

// Throttle utility for performance
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};