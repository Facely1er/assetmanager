export const APP_CONFIG = {
  NAME: 'ERMITS CyberSoluce®',
  VERSION: '1.0.0',
  API_TIMEOUT: import.meta.env.PROD ? 10000 : 30000,
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  SUPPORTED_FILE_TYPES: ['.csv', '.xlsx', '.json'] as const,
  
  CACHE: {
    DEFAULT_TTL: 5 * 60 * 1000, // 5 minutes
    MAX_ENTRIES: 100,
    STORAGE_KEY: 'ermits-cache'
  },
  
  RETRY: {
    MAX_ATTEMPTS: 3,
    BASE_DELAY: 1000,
    MAX_DELAY: 10000
  },
  
  PAGINATION: {
    DEFAULT_PAGE_SIZE: 25,
    MAX_PAGE_SIZE: 100,
    PAGE_SIZE_OPTIONS: [10, 25, 50, 100] as const
  },
  
  SEARCH: {
    DEBOUNCE_DELAY: 300,
    MIN_SEARCH_LENGTH: 2,
    MAX_SEARCH_LENGTH: 100,
    MAX_RESULTS: 1000
  },
  
  ASSET_LIMITS: {
    MAX_TAGS: 20,
    MAX_RELATIONSHIPS: 50,
    MAX_VULNERABILITIES: 100,
    MAX_BULK_OPERATIONS: 50
  },
  
  PERFORMANCE: {
    VIRTUAL_SCROLL_THRESHOLD: 100,
    LAZY_LOADING_THRESHOLD: 20,
    IMAGE_LAZY_LOADING: true
  }
} as const;

// Enhanced error messages with more specific guidance
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection and try again.',
  CONNECTION_TIMEOUT: 'Request timed out. Please check your connection and try again.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  FORBIDDEN: 'Access denied. Please contact your administrator.',
  NOT_FOUND: 'The requested resource was not found.',
  SERVER_ERROR: 'Server error. Please try again later.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  RATE_LIMITED: 'Too many requests. Please wait a moment and try again.',
  MAINTENANCE: 'System is currently under maintenance. Please try again later.',
  FILE_TOO_LARGE: `File size must be less than ${APP_CONFIG.MAX_FILE_SIZE / (1024 * 1024)}MB`,
  UNSUPPORTED_FILE_TYPE: `Supported file types: ${APP_CONFIG.SUPPORTED_FILE_TYPES.join(', ')}`,
  BULK_LIMIT_EXCEEDED: `Cannot process more than ${APP_CONFIG.ASSET_LIMITS.MAX_BULK_OPERATIONS} items at once`,
  DATABASE_CONNECTION: 'Database connection issue. Please try again or contact support.',
  SESSION_EXPIRED: 'Your session has expired. Please sign in again.'
} as const;

export const SUCCESS_MESSAGES = {
  ASSET_CREATED: 'Asset created successfully',
  ASSET_UPDATED: 'Asset updated successfully',
  ASSET_DELETED: 'Asset deleted successfully',
  ASSETS_IMPORTED: 'Assets imported successfully',
  ASSETS_EXPORTED: 'Assets exported successfully',
  SETTINGS_SAVED: 'Settings saved successfully',
  TEAM_MEMBER_INVITED: 'Team member invited successfully',
  ORGANIZATION_CREATED: 'Organization created successfully',
  REPORT_GENERATED: 'Report generated successfully',
  DATA_SYNCHRONIZED: 'Data synchronized successfully'
} as const;

// API endpoints configuration
export const API_ENDPOINTS = {
  HEALTH_CHECK: '/api/health',
  ASSETS: '/api/assets',
  REPORTS: '/api/reports',
  ORGANIZATIONS: '/api/organizations',
  USERS: '/api/users'
} as const;

// Feature flags for production deployment
export const FEATURE_FLAGS = {
  ENABLE_OFFLINE_MODE: import.meta.env.VITE_ENABLE_OFFLINE_MODE === 'true',
  ENABLE_ANALYTICS: import.meta.env.VITE_ENABLE_ANALYTICS === 'true',
  ENABLE_ERROR_REPORTING: import.meta.env.VITE_ENABLE_ERROR_REPORTING === 'true',
  ENABLE_PWA: import.meta.env.VITE_ENABLE_PWA === 'true',
  ENABLE_REAL_TIME: import.meta.env.VITE_ENABLE_REAL_TIME !== 'false', // Default enabled
  DEBUG_MODE: import.meta.env.VITE_DEBUG_MODE === 'true'
} as const;