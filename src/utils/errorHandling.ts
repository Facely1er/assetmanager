import { APP_CONFIG, ERROR_MESSAGES, FEATURE_FLAGS } from './constants';
import { logger } from './logger';

// Enhanced error logging with context
export const logError = (error: unknown, context: string, metadata?: Record<string, unknown>) => {
  const errorInfo = {
    message: error instanceof Error ? error.message : 'Unknown error',
    stack: error instanceof Error ? error.stack : undefined,
    context,
    metadata,
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent,
    url: window.location.href,
  };

  // Use logger utility for consistent error logging
  const errorMessage = error instanceof Error ? error.message : 'Unknown error';
  logger.error(`[${context}] ${errorMessage}`, error instanceof Error ? error : undefined, errorInfo);

  // In production, you might want to send to an error reporting service
  if (import.meta.env.PROD && FEATURE_FLAGS.ENABLE_ERROR_REPORTING) {
    // Example: Send to error reporting service
    // errorReportingService.captureException(error, { extra: errorInfo });
  }
};

// Simplified error handling for API calls
export const handleApiError = (error: unknown, fallbackMessage?: string): string => {
  logError(error, 'handleApiError');

  if (error instanceof Error) {
    // Network errors
    if (error.message.includes('fetch') || error.message.includes('network')) {
      return ERROR_MESSAGES.NETWORK_ERROR;
    }

    // Timeout errors
    if (error.message.includes('timeout')) {
      return ERROR_MESSAGES.CONNECTION_TIMEOUT;
    }

    // Return the error message if it's user-friendly
    if (error.message.length < 100 && !error.message.includes('Error:')) {
      return error.message;
    }
  }

  return fallbackMessage || ERROR_MESSAGES.SERVER_ERROR;
};

// Retry mechanism for failed operations
export const withRetry = async <T>(
  operation: () => Promise<T>,
  maxRetries: number = APP_CONFIG.RETRY.MAX_ATTEMPTS,
  delay: number = APP_CONFIG.RETRY.BASE_DELAY
): Promise<T> => {
  let lastError: Error;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;

      // Don't retry on certain errors
      if (error instanceof Error && (
        error.message.includes('401') || 
        error.message.includes('403') ||
        error.message.includes('404')
      )) {
        throw error;
      }

      if (attempt === maxRetries) {
        throw lastError;
      }

      // Exponential backoff
      const waitTime = Math.min(delay * Math.pow(2, attempt - 1), APP_CONFIG.RETRY.MAX_DELAY);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }

  throw lastError!;
};

// Error boundary helper
export const createErrorHandler = (context: string) => {
  return (error: Error, errorInfo: { componentStack: string }) => {
    logError(error, `${context}.ErrorBoundary`, {
      componentStack: errorInfo.componentStack,
    });
  };
};

// Validation error formatter
export const formatValidationErrors = (errors: Record<string, string[]>): string => {
  const errorMessages = Object.entries(errors)
    .map(([field, messages]) => `${field}: ${messages.join(', ')}`)
    .join('; ');
  
  return `Validation failed: ${errorMessages}`;
};

// Network status checker
export const isOnline = (): boolean => {
  return navigator.onLine;
};

// Debounced error handler to prevent spam
let errorTimeout: NodeJS.Timeout | null = null;
export const debouncedErrorLog = (error: unknown, context: string, delay = 1000) => {
  if (errorTimeout) {
    clearTimeout(errorTimeout);
  }
  
  errorTimeout = setTimeout(() => {
    logError(error, context);
  }, delay);
};