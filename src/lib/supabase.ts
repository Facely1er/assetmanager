import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/database';
import { logger } from '../utils/logger';

// Environment variable validation with better error messages
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Production-ready Supabase configuration validation
const validateSupabaseConfig = () => {
  if (!supabaseUrl || !supabaseAnonKey) {
    return { 
      valid: false, 
      reason: 'Missing required environment variables VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY' 
    };
  }
  
  if (supabaseUrl.includes('placeholder') || supabaseAnonKey.includes('placeholder') ||
      supabaseUrl.includes('your_') || supabaseAnonKey.includes('your_') ||
      supabaseUrl.length < 30 || supabaseAnonKey.length < 30) {
    return { 
      valid: false, 
      reason: 'Placeholder or invalid values detected in environment variables' 
    };
  }
  
  if (!supabaseUrl.startsWith('https://') || !supabaseUrl.includes('.supabase.co')) {
    return { 
      valid: false, 
      reason: 'Invalid Supabase URL format. Must be https://*.supabase.co' 
    };
  }
  
  if (supabaseAnonKey.length < 50) {
    return { 
      valid: false, 
      reason: 'Invalid anon key format. Key appears to be too short' 
    };
  }
  
  return { valid: true, reason: 'Configuration valid' };
};

const configValidation = validateSupabaseConfig();
const isSupabaseConfigured = configValidation.valid;

// Enhanced connectivity validation
let connectivityStatus = {
  validated: false,
  lastCheck: 0,
  isOnline: true
};

if (!isSupabaseConfigured) {
  logger.warn(`Supabase not configured - running in demo mode (${configValidation.reason})`);
  logger.info(`
    To enable real database persistence:
    1. Create a Supabase project at https://supabase.com
    2. Copy your Project URL and anon key from Project Settings → API
    3. Update your .env.local file with real values
    4. Restart the development server
    
    Current config: URL=${supabaseUrl?.substring(0, 20)}..., Key=${supabaseAnonKey?.substring(0, 20)}...
    `);
}

// Create Supabase client with enhanced configuration
export const supabase = isSupabaseConfigured 
  ? createClient<Database>(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
        flowType: 'pkce'
      },
      realtime: {
        params: {
          eventsPerSecond: 10
        },
        heartbeatIntervalMs: 30000,
        reconnectAfterMs: (tries) => Math.min(tries * 1000, 30000)
      },
      global: {
        headers: {
          'X-Client-Info': 'ermits-cybersoluce@1.0.0'
        }
      }
    })
  : null;

// Enhanced connectivity testing with retry logic
const testSupabaseConnectivity = async (): Promise<boolean> => {
  if (!supabase) return false;
  
  // Use cached result if recent (5 minutes)
  const now = Date.now();
  if (connectivityStatus.validated && (now - connectivityStatus.lastCheck) < 300000) {
    return connectivityStatus.isOnline;
  }
  
  try {
    // Optimized connectivity test with shorter timeout
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Connection timeout')), 3000);
    });
    
    // Lightweight health check instead of auth session
    const connectivityTest = fetch(`${supabaseUrl}/rest/v1/`, {
      method: 'HEAD',
      headers: {
        'apikey': supabaseAnonKey,
        'Authorization': `Bearer ${supabaseAnonKey}`
      }
    });
    
    const result = await Promise.race([connectivityTest, timeoutPromise]);
    
    if (result instanceof Response && (result.ok || result.status === 401)) {
      connectivityStatus = { validated: true, lastCheck: now, isOnline: true };
      return true;
    } else {
      throw new Error('Invalid response');
    }
  } catch (error) {
    logger.warn('Supabase connectivity test failed, using demo mode:', error);
    connectivityStatus = { validated: true, lastCheck: now, isOnline: false };
    return false;
  }
};

// Retry mechanism for failed requests
export const retryRequest = async <T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
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
      await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, attempt - 1)));
    }
  }
  
  throw lastError!;
};

// Connection health monitoring
export const monitorConnection = () => {
  if (!supabase) return () => {};
  
  const interval = setInterval(async () => {
    const isOnline = await testSupabaseConnectivity();
    if (!isOnline && connectivityStatus.isOnline) {
      // Connection lost
      logger.warn('Supabase connection lost, switching to demo mode');
    } else if (isOnline && !connectivityStatus.isOnline) {
      // Connection restored
      logger.info('Supabase connection restored');
    }
  }, 60000); // Check every minute
  
  return () => clearInterval(interval);
};

// Enhanced error handling with categorization
export const handleSupabaseError = (error: unknown): string => {
  logger.error('Supabase error occurred', error instanceof Error ? error : new Error(String(error)));
  
  // Network errors
  if (error?.message?.includes('fetch') || error?.name === 'TypeError') {
    return 'Network connection error. Please check your internet connection.';
  }
  
  // Database errors
  if (error?.code === 'PGRST116') {
    return 'No data found matching your criteria';
  }
  
  if (error?.code === '23505') {
    return 'This record already exists. Please use a different name or identifier.';
  }
  
  if (error?.code === '23503') {
    return 'Cannot delete this record as it is referenced by other records';
  }
  
  if (error?.code === '42P01') {
    return 'Database table not found. Please ensure database migrations are applied.';
  }
  
  // Authentication errors
  if (error?.code === 'invalid_credentials') {
    return 'Invalid email or password. Please check your credentials.';
  }
  
  if (error?.code === 'email_not_confirmed') {
    return 'Please check your email and click the confirmation link.';
  }
  
  // Rate limiting
  if (error?.status === 429) {
    return 'Too many requests. Please wait a moment and try again.';
  }
  
  // Authorization errors
  if (error?.status === 401) {
    return 'You are not authorized to perform this action. Please sign in.';
  }
  
  if (error?.status === 403) {
    return 'Access denied. You do not have permission to perform this action.';
  }
  
  // Server errors
  if (error?.status >= 500) {
    return 'Server error occurred. Please try again later.';
  }
  
  // Default error message
  if (error?.message) {
    return error.message;
  }
  
  return 'An unexpected error occurred. Please try again.';
};

// Export configuration status with network validation
export const isSupabaseEnabled = isSupabaseConfigured;
export const checkSupabaseConnectivity = testSupabaseConnectivity;

// Real-time subscription helper
export const subscribeToAssetChanges = (callback: (payload: Record<string, unknown>) => void) => {
  return supabase
    ?.channel('assets_changes')
    .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'assets' }, 
        callback
    )
    .subscribe();
};

// Check if user is authenticated
export const getCurrentUser = async () => {
  if (!supabase) return null;
  const { data: { user } } = await supabase.auth.getUser();
  return user;
};

// Get current session
export const getCurrentSession = async () => {
  if (!supabase) return null;
  const { data: { session } } = await supabase.auth.getSession();
  return session;
};