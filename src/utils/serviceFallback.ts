/**
 * Service Fallback Utility
 * Provides fallback mechanisms for external services when they're unavailable
 */

import { logger } from './logger';

export interface FallbackOptions<T> {
  /** The primary service call */
  serviceCall: () => Promise<T>;
  /** Fallback data/function to use when service fails */
  fallback: T | (() => T | Promise<T>);
  /** Error message to log */
  errorContext: string;
  /** Whether to throw error or return fallback silently */
  throwOnError?: boolean;
  /** Maximum retries before falling back */
  maxRetries?: number;
  /** Retry delay in milliseconds */
  retryDelay?: number;
}

export interface NetworkStatus {
  isOnline: boolean;
  lastCheck: number;
  consecutiveFailures: number;
}

class ServiceFallbackManager {
  private networkStatus: NetworkStatus = {
    isOnline: navigator.onLine !== false,
    lastCheck: Date.now(),
    consecutiveFailures: 0
  };

  private readonly MAX_CONSECUTIVE_FAILURES = 3;
  private readonly NETWORK_CHECK_INTERVAL = 30000; // 30 seconds

  constructor() {
    // Monitor network status
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => {
        this.networkStatus.isOnline = true;
        this.networkStatus.consecutiveFailures = 0;
        logger.info('Network connection restored');
      });

      window.addEventListener('offline', () => {
        this.networkStatus.isOnline = false;
        logger.warn('Network connection lost');
      });

      // Periodic network check
      setInterval(() => this.checkNetworkStatus(), this.NETWORK_CHECK_INTERVAL);
    }
  }

  private async checkNetworkStatus(): Promise<void> {
    try {
      // Lightweight connectivity check
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000);
      
      await fetch('https://www.google.com/favicon.ico', {
        method: 'HEAD',
        mode: 'no-cors',
        signal: controller.signal,
        cache: 'no-cache'
      });
      
      clearTimeout(timeoutId);
      this.networkStatus.isOnline = true;
      this.networkStatus.consecutiveFailures = 0;
      this.networkStatus.lastCheck = Date.now();
    } catch {
      this.networkStatus.isOnline = false;
      this.networkStatus.lastCheck = Date.now();
    }
  }

  /**
   * Check if network is available
   */
  isNetworkAvailable(): boolean {
    return this.networkStatus.isOnline && navigator.onLine !== false;
  }

  /**
   * Check if service should use fallback based on consecutive failures
   */
  shouldUseFallback(): boolean {
    return this.networkStatus.consecutiveFailures >= this.MAX_CONSECUTIVE_FAILURES;
  }

  /**
   * Execute service call with fallback mechanism
   */
  async executeWithFallback<T>(options: FallbackOptions<T>): Promise<T> {
    const {
      serviceCall,
      fallback,
      errorContext,
      throwOnError = false,
      maxRetries = 2,
      retryDelay = 1000
    } = options;

    // If network is down or too many failures, use fallback immediately
    if (!this.isNetworkAvailable() || this.shouldUseFallback()) {
      logger.warn(`${errorContext}: Using fallback due to network issues`);
      return this.getFallbackValue(fallback);
    }

    let lastError: Error | null = null;

    // Retry logic
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const result = await Promise.race([
          serviceCall(),
          this.createTimeout(10000) // 10 second timeout
        ]);

        // Success - reset failure counter
        this.networkStatus.consecutiveFailures = 0;
        return result as T;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        
        // Check if it's a network error
        const isNetworkError = this.isNetworkError(lastError);
        
        if (isNetworkError) {
          this.networkStatus.consecutiveFailures++;
        }

        // Don't retry on certain errors (auth, validation, etc.)
        if (this.isNonRetryableError(lastError)) {
          logger.error(`${errorContext}: Non-retryable error`, lastError);
          if (throwOnError) {
            throw lastError;
          }
          return this.getFallbackValue(fallback);
        }

        // Last attempt failed
        if (attempt === maxRetries) {
          logger.error(`${errorContext}: All retries exhausted, using fallback`, lastError);
          if (throwOnError) {
            throw lastError;
          }
          return this.getFallbackValue(fallback);
        }

        // Wait before retry with exponential backoff
        await this.delay(retryDelay * Math.pow(2, attempt));
      }
    }

    // Should never reach here, but TypeScript needs it
    return this.getFallbackValue(fallback);
  }

  /**
   * Check if error is a network-related error
   */
  private isNetworkError(error: Error): boolean {
    const networkErrorPatterns = [
      'fetch',
      'network',
      'NetworkError',
      'Failed to fetch',
      'timeout',
      'ECONNREFUSED',
      'ENOTFOUND',
      'ETIMEDOUT',
      'ERR_INTERNET_DISCONNECTED',
      'ERR_NETWORK_CHANGED',
      'ERR_CONNECTION_REFUSED',
      'ERR_CONNECTION_RESET',
      'ERR_CONNECTION_TIMED_OUT'
    ];

    const errorMessage = error.message.toLowerCase();
    return networkErrorPatterns.some(pattern => errorMessage.includes(pattern.toLowerCase()));
  }

  /**
   * Check if error should not be retried
   */
  private isNonRetryableError(error: Error): boolean {
    const nonRetryablePatterns = [
      '401', // Unauthorized
      '403', // Forbidden
      '404', // Not Found
      '422', // Validation Error
      '400', // Bad Request
      'authentication',
      'authorization',
      'permission',
      'invalid',
      'validation'
    ];

    const errorMessage = error.message.toLowerCase();
    return nonRetryablePatterns.some(pattern => errorMessage.includes(pattern.toLowerCase()));
  }

  /**
   * Get fallback value (handles both sync and async fallbacks)
   */
  private async getFallbackValue<T>(fallback: T | (() => T | Promise<T>)): Promise<T> {
    if (typeof fallback === 'function') {
      return await (fallback as () => T | Promise<T>)();
    }
    return fallback;
  }

  /**
   * Create a timeout promise
   */
  private createTimeout(ms: number): Promise<never> {
    return new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Request timeout')), ms);
    });
  }

  /**
   * Delay utility
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Reset failure counter (call when service is confirmed working)
   */
  resetFailureCounter(): void {
    this.networkStatus.consecutiveFailures = 0;
  }
}

// Singleton instance
export const serviceFallback = new ServiceFallbackManager();

/**
 * Convenience function for executing service calls with fallback
 */
export async function withFallback<T>(
  serviceCall: () => Promise<T>,
  fallback: T | (() => T | Promise<T>),
  errorContext: string,
  options?: Partial<FallbackOptions<T>>
): Promise<T> {
  return serviceFallback.executeWithFallback({
    serviceCall,
    fallback,
    errorContext,
    ...options
  });
}

/**
 * Check if service is available (network + connectivity)
 */
export function isServiceAvailable(): boolean {
  return serviceFallback.isNetworkAvailable() && !serviceFallback.shouldUseFallback();
}

