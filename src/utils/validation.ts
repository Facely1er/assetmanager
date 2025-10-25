import { APP_CONFIG } from './constants';

// Input sanitization for security
export const sanitizeInput = (input: string): string => {
  if (typeof input !== 'string') return '';
  
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .substring(0, APP_CONFIG.SEARCH.MAX_SEARCH_LENGTH);
};

// Validate search query
export const validateSearchQuery = (query: string): boolean => {
  if (!query || typeof query !== 'string') return false;
  
  const sanitized = sanitizeInput(query);
  
  // Check minimum length
  if (sanitized.length < APP_CONFIG.SEARCH.MIN_SEARCH_LENGTH) return false;
  
  // Check for potentially malicious patterns
  const maliciousPatterns = [
    /<script/i,
    /javascript:/i,
    /on\w+\s*=/i,
    /eval\s*\(/i,
    /expression\s*\(/i,
  ];
  
  return !maliciousPatterns.some(pattern => pattern.test(sanitized));
};

// Validate asset data
export const validateAsset = (asset: Partial<Asset>): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  // Required fields
  if (!asset.name || asset.name.trim().length === 0) {
    errors.push('Name is required');
  }
  
  if (!asset.type) {
    errors.push('Type is required');
  }
  
  if (!asset.criticality) {
    errors.push('Criticality is required');
  }
  
  if (!asset.owner || asset.owner.trim().length === 0) {
    errors.push('Owner is required');
  }
  
  if (!asset.location || asset.location.trim().length === 0) {
    errors.push('Location is required');
  }
  
  // Validate risk score
  if (asset.riskScore !== undefined) {
    if (typeof asset.riskScore !== 'number' || asset.riskScore < 0 || asset.riskScore > 100) {
      errors.push('Risk score must be a number between 0 and 100');
    }
  }
  
  // Validate tags
  if (asset.tags && Array.isArray(asset.tags)) {
    if (asset.tags.length > APP_CONFIG.ASSET_LIMITS.MAX_TAGS) {
      errors.push(`Maximum ${APP_CONFIG.ASSET_LIMITS.MAX_TAGS} tags allowed`);
    }
    
    // Validate individual tags
    for (const tag of asset.tags) {
      if (typeof tag !== 'string' || tag.trim().length === 0) {
        errors.push('All tags must be non-empty strings');
        break;
      }
    }
  }
  
  // Validate IP address format
  if (asset.ipAddress && asset.ipAddress.trim().length > 0) {
    const ipRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    if (!ipRegex.test(asset.ipAddress)) {
      errors.push('Invalid IP address format');
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Validate email format
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Validate password strength
export const validatePassword = (password: string): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Validate file upload
export const validateFile = (file: File): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  // Check file size
  if (file.size > APP_CONFIG.MAX_FILE_SIZE) {
    errors.push(`File size must be less than ${APP_CONFIG.MAX_FILE_SIZE / (1024 * 1024)}MB`);
  }
  
  // Check file type
  const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
  if (!APP_CONFIG.SUPPORTED_FILE_TYPES.includes(fileExtension)) {
    errors.push(`Unsupported file type. Supported types: ${APP_CONFIG.SUPPORTED_FILE_TYPES.join(', ')}`);
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Validate CSV data
export const validateCSVData = (data: any[]): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (!Array.isArray(data)) {
    errors.push('Data must be an array');
    return { isValid: false, errors };
  }
  
  if (data.length === 0) {
    errors.push('No data found in CSV');
    return { isValid: false, errors };
  }
  
  // Check for required columns
  const requiredColumns = ['name', 'type', 'criticality', 'owner', 'location'];
  const firstRow = data[0];
  
  for (const column of requiredColumns) {
    if (!(column in firstRow)) {
      errors.push(`Missing required column: ${column}`);
    }
  }
  
  // Validate each row
  for (let i = 0; i < Math.min(data.length, 10); i++) { // Check first 10 rows
    const row = data[i];
    const rowErrors = validateAsset(row);
    if (!rowErrors.isValid) {
      errors.push(`Row ${i + 1}: ${rowErrors.errors.join(', ')}`);
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Debounced validation
export const createDebouncedValidator = <T>(
  validator: (value: T) => { isValid: boolean; errors: string[] },
  delay: number = 300
) => {
  let timeoutId: NodeJS.Timeout;
  
  return (value: T, callback: (result: { isValid: boolean; errors: string[] }) => void) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      const result = validator(value);
      callback(result);
    }, delay);
  };
};