// Production performance monitoring and optimization utilities

interface PerformanceMetrics {
  pageLoadTime: number;
  firstContentfulPaint: number;
  largestContentfulPaint: number;
  firstInputDelay: number;
  cumulativeLayoutShift: number;
  timeToInteractive: number;
}

interface ResourceTiming {
  name: string;
  duration: number;
  size: number;
  type: string;
}

class PerformanceMonitor {
  private metrics: Partial<PerformanceMetrics> = {};
  private observers: PerformanceObserver[] = [];
  private isEnabled: boolean = true;

  constructor() {
    this.isEnabled = import.meta.env.VITE_ENABLE_ANALYTICS === 'true';
    if (this.isEnabled) {
      this.setupObservers();
      this.measurePageLoad();
    }
  }

  private setupObservers() {
    // Core Web Vitals Observer
    if ('PerformanceObserver' in window) {
      try {
        // Largest Contentful Paint
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          this.metrics.largestContentfulPaint = lastEntry.startTime;
          this.reportMetric('lcp', lastEntry.startTime);
        });
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
        this.observers.push(lcpObserver);

        // First Input Delay
        const fidObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry) => {
            this.metrics.firstInputDelay = entry.processingStart - entry.startTime;
            this.reportMetric('fid', this.metrics.firstInputDelay);
          });
        });
        fidObserver.observe({ entryTypes: ['first-input'] });
        this.observers.push(fidObserver);

        // Cumulative Layout Shift
        const clsObserver = new PerformanceObserver((list) => {
          let clsValue = 0;
          const entries = list.getEntries();
          entries.forEach((entry) => {
            if (!entry.hadRecentInput) {
              clsValue += entry.value;
            }
          });
          this.metrics.cumulativeLayoutShift = clsValue;
          this.reportMetric('cls', clsValue);
        });
        clsObserver.observe({ entryTypes: ['layout-shift'] });
        this.observers.push(clsObserver);

        // First Contentful Paint
        const fcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry) => {
            if (entry.name === 'first-contentful-paint') {
              this.metrics.firstContentfulPaint = entry.startTime;
              this.reportMetric('fcp', entry.startTime);
            }
          });
        });
        fcpObserver.observe({ entryTypes: ['paint'] });
        this.observers.push(fcpObserver);

      } catch (error) {
        console.warn('Performance Observer setup failed:', error);
      }
    }
  }

  private measurePageLoad() {
    window.addEventListener('load', () => {
      // Page load timing
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      if (navigation) {
        this.metrics.pageLoadTime = navigation.loadEventEnd - navigation.fetchStart;
        this.reportMetric('page_load', this.metrics.pageLoadTime);
      }

      // Resource timing analysis
      this.analyzeResourceTiming();
    });
  }

  private analyzeResourceTiming() {
    const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
    const resourceData: ResourceTiming[] = resources.map(resource => ({
      name: resource.name,
      duration: resource.duration,
      size: resource.transferSize || 0,
      type: this.getResourceType(resource.name)
    }));

    // Identify slow resources
    const slowResources = resourceData.filter(resource => resource.duration > 1000);
    if (slowResources.length > 0) {
      console.warn('Slow loading resources detected:', slowResources);
    }

    // Identify large resources
    const largeResources = resourceData.filter(resource => resource.size > 500000); // 500KB
    if (largeResources.length > 0) {
      console.warn('Large resources detected:', largeResources);
    }
  }

  private getResourceType(url: string): string {
    if (url.includes('.js')) return 'script';
    if (url.includes('.css')) return 'stylesheet';
    if (url.match(/\.(png|jpg|jpeg|gif|webp|svg)$/)) return 'image';
    if (url.match(/\.(woff|woff2|ttf|eot)$/)) return 'font';
    return 'other';
  }

  private reportMetric(name: string, value: number) {
    if (import.meta.env.DEV) {
      console.log(`Performance metric - ${name}:`, value);
    }

    // In production, send to analytics service
    if (import.meta.env.PROD && import.meta.env.VITE_GOOGLE_ANALYTICS_ID) {
      this.sendToAnalytics(name, value);
    }
  }

  private sendToAnalytics(metric: string, value: number) {
    // Google Analytics 4 custom event
    if (typeof gtag !== 'undefined') {
      gtag('event', 'performance_metric', {
        metric_name: metric,
        metric_value: Math.round(value),
        custom_parameter: 'core_web_vitals'
      });
    }
  }

  public getMetrics(): Partial<PerformanceMetrics> {
    return { ...this.metrics };
  }

  public measureFunction<T>(name: string, fn: () => T): T {
    const start = performance.now();
    try {
      const result = fn();
      const duration = performance.now() - start;
      this.reportMetric(`function_${name}`, duration);
      return result;
    } catch (error) {
      const duration = performance.now() - start;
      this.reportMetric(`function_${name}_error`, duration);
      throw error;
    }
  }

  public async measureAsyncFunction<T>(name: string, fn: () => Promise<T>): Promise<T> {
    const start = performance.now();
    try {
      const result = await fn();
      const duration = performance.now() - start;
      this.reportMetric(`async_function_${name}`, duration);
      return result;
    } catch (error) {
      const duration = performance.now() - start;
      this.reportMetric(`async_function_${name}_error`, duration);
      throw error;
    }
  }

  public destroy() {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
  }
}

// Memory usage monitoring
export const monitorMemoryUsage = () => {
  if ('memory' in performance) {
    const memory = (performance as { memory?: { usedJSHeapSize: number; totalJSHeapSize: number; jsHeapSizeLimit: number } }).memory;
    const memoryInfo = {
      usedJSHeapSize: memory.usedJSHeapSize,
      totalJSHeapSize: memory.totalJSHeapSize,
      jsHeapSizeLimit: memory.jsHeapSizeLimit,
      usagePercentage: Math.round((memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100)
    };

    // Warn if memory usage is high
    if (memoryInfo.usagePercentage > 80) {
      console.warn('High memory usage detected:', memoryInfo);
    }

    return memoryInfo;
  }
  return null;
};

// Bundle size analysis helper
export const analyzeBundleSize = () => {
  const scripts = Array.from(document.querySelectorAll('script[src]'));
  const styles = Array.from(document.querySelectorAll('link[rel="stylesheet"]'));
  
  Promise.all([
    ...scripts.map(script => fetch(script.src).then(r => ({ url: script.src, size: r.headers.get('content-length') }))),
    ...styles.map(style => fetch(style.href).then(r => ({ url: style.href, size: r.headers.get('content-length') })))
  ]).then(resources => {
    const totalSize = resources.reduce((sum, resource) => 
      sum + (parseInt(resource.size || '0') || 0), 0
    );
    
    console.log('Bundle analysis:', {
      totalResources: resources.length,
      totalSize: `${(totalSize / 1024).toFixed(2)} KB`,
      resources: resources.sort((a, b) => 
        (parseInt(b.size || '0') || 0) - (parseInt(a.size || '0') || 0)
      )
    });
  }).catch(error => {
    console.warn('Bundle analysis failed:', error);
  });
};

// Lazy loading utility for heavy components

// Create singleton instance
export const performanceMonitor = new PerformanceMonitor();

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
  performanceMonitor.destroy();
});

// Export utilities
export {
  PerformanceMonitor,
  type PerformanceMetrics,
  type ResourceTiming
};