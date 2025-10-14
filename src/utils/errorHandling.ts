import { ERROR_MESSAGES } from './constants';
import { isSupabaseEnabled } from '../lib/supabase';

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly timestamp: Date;
  public readonly context?: string;

  constructor(
    message: string, 
    statusCode: number = 500, 
    isOperational: boolean = true,
    context?: string
  ) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.timestamp = new Date();
    this.context = context;
    
    Error.captureStackTrace(this, this.constructor);
  }
}

// Enhanced error categorization and handling
export const handleApiError = (error: unknown): string => {
  if (error instanceof AppError) {
    return error.message;
  }

  if (error instanceof Error) {
    // Enhanced network error detection
    if (error.message.includes('fetch') || 
        error.message.includes('NetworkError') ||
        error.message.includes('ERR_NETWORK') ||
        error.name === 'TypeError') {
      return ERROR_MESSAGES.NETWORK_ERROR;
    }
    
    // Database connection errors
    if (error.message.includes('connection') || 
        error.message.includes('timeout')) {
      return 'Database connection issue. Please try again.';
    }
    
    return error.message;
  }

  // Enhanced HTTP status code handling
  if (typeof error === 'object' && error !== null && 'status' in error) {
    const status = (error as { status: number }).status;
    switch (status) {
      case 401:
        return ERROR_MESSAGES.UNAUTHORIZED;
      case 403:
        return ERROR_MESSAGES.FORBIDDEN;
      case 404:
        return ERROR_MESSAGES.NOT_FOUND;
      case 409:
        return 'Conflict: This operation conflicts with existing data.';
      case 422:
        return 'Invalid data provided. Please check your input.';
      case 429:
        return 'Too many requests. Please wait and try again.';
      case 500:
      case 502:
      case 503:
      case 504:
        return ERROR_MESSAGES.SERVER_ERROR;
      default:
        return `Server responded with status ${status}. Please try again.`;
    }
  }

  return 'An unexpected error occurred';
};

// Production-ready error logging with structured data
export const logError = (error: unknown, context?: string, additionalData?: Record<string, unknown>) => {
  const errorInfo = {
    message: error instanceof Error ? error.message : 'Unknown error',
    stack: error instanceof Error ? error.stack : undefined,
    context,
    additionalData,
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent,
    url: window.location.href,
    supabaseEnabled: isSupabaseEnabled,
    environment: import.meta.env.MODE
  };

  // Enhanced production error logging
  if (import.meta.env.PROD) {
    // Send to external monitoring service in production
    if (import.meta.env.VITE_SENTRY_DSN) {
      // In a real implementation, send to Sentry
      sendToMonitoringService(errorInfo);
    }
    // Always log to console for server-side monitoring
    console.error('Production Error:', JSON.stringify(errorInfo, null, 2));
  } else {
    // Detailed logging in development
    console.group('🐛 Development Error');
    console.error('Error:', error);
    console.table(errorInfo);
    console.groupEnd();
  }
};

const sendToMonitoringService = (errorInfo: Record<string, unknown>) => {
  // Implementation for sending to monitoring service
};