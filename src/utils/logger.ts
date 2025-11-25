/**
 * Production-safe logging utility
 * Automatically filters out logs in production unless explicitly enabled
 */

const isDev = import.meta.env.DEV;
const isProduction = import.meta.env.PROD;
const debugMode = import.meta.env.VITE_DEBUG_MODE === 'true';
const enableErrorReporting = import.meta.env.VITE_ENABLE_ERROR_REPORTING === 'true';

/**
 * Logger utility that respects environment settings
 */
export const logger = {
  /**
   * Log debug information (only in development or debug mode)
   */
  debug: (...args: unknown[]) => {
    if (isDev || debugMode) {
      console.debug('[DEBUG]', ...args);
    }
  },

  /**
   * Log information (only in development or debug mode)
   */
  info: (...args: unknown[]) => {
    if (isDev || debugMode) {
      console.info('[INFO]', ...args);
    }
  },

  /**
   * Log warnings (always logged, but filtered in production)
   */
  warn: (...args: unknown[]) => {
    if (isDev || debugMode || enableErrorReporting) {
      console.warn('[WARN]', ...args);
    }
    // In production, could send to error tracking service
    if (isProduction && enableErrorReporting) {
      // TODO: Send to Sentry or other error tracking service
      // if (window.Sentry) {
      //   window.Sentry.captureMessage(args.join(' '), 'warning');
      // }
    }
  },

  /**
   * Log errors (always logged, sent to error tracking in production)
   */
  error: (message: string, error?: Error | unknown, context?: Record<string, unknown>) => {
    // Always log errors
    if (error instanceof Error) {
      console.error('[ERROR]', message, error, context);
    } else {
      console.error('[ERROR]', message, error, context);
    }

    // In production, send to error tracking service
    if (isProduction && enableErrorReporting) {
      // TODO: Send to Sentry or other error tracking service
      // if (window.Sentry) {
      //   window.Sentry.captureException(error || new Error(message), {
      //     extra: context,
      //     tags: { source: 'logger' }
      //   });
      // }
    }
  },

  /**
   * Log in development only (will be stripped in production builds)
   */
  dev: (...args: unknown[]) => {
    if (isDev) {
      console.log('[DEV]', ...args);
    }
  },

  /**
   * Group logs (only in development)
   */
  group: (label: string) => {
    if (isDev || debugMode) {
      console.group(label);
    }
  },

  /**
   * End log group (only in development)
   */
  groupEnd: () => {
    if (isDev || debugMode) {
      console.groupEnd();
    }
  },

  /**
   * Table log (only in development)
   */
  table: (data: unknown) => {
    if (isDev || debugMode) {
      console.table(data);
    }
  }
};

/**
 * Legacy console wrapper for gradual migration
 * Use logger.* methods instead when possible
 */
export const safeConsole = {
  log: (...args: unknown[]) => logger.debug(...args),
  info: (...args: unknown[]) => logger.info(...args),
  warn: (...args: unknown[]) => logger.warn(...args),
  error: (...args: unknown[]) => {
    const message = args[0] as string;
    const error = args[1] as Error | undefined;
    logger.error(message, error);
  },
  debug: (...args: unknown[]) => logger.debug(...args)
};

