// Re-export all types for easier imports
export * from './asset';
export * from './organization';
export * from './database';
export * from './risk';
export * from './mitigation';
export * from './business-impact';
export * from './nist';
export * from './framework';
export * from './dependency';

// Global type definitions
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface FilterParams {
  search?: string;
  filters?: Record<string, unknown>;
}

// Environment variables type
export interface ImportMetaEnv {
  readonly VITE_APP_NAME: string;
  readonly VITE_APP_VERSION: string;
  readonly VITE_API_BASE_URL: string;
  readonly VITE_API_TIMEOUT: string;
  readonly VITE_ENABLE_ANALYTICS: string;
  readonly VITE_ENABLE_ERROR_REPORTING: string;
  readonly VITE_CSP_REPORT_URI: string;
  readonly VITE_DEBUG_MODE: string;
}

export interface ImportMeta {
  readonly env: ImportMetaEnv;
}