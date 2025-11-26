# Service Fallback Implementation

## Overview

This document describes the comprehensive fallback mechanisms implemented to ensure the CyberSoluce AssetManager continues to function gracefully when external services are unavailable.

## Architecture

### Service Fallback Manager

A centralized `ServiceFallbackManager` class (`src/utils/serviceFallback.ts`) provides:

1. **Network Status Monitoring**
   - Real-time network connectivity detection
   - Browser online/offline event handling
   - Periodic connectivity checks (every 30 seconds)
   - Consecutive failure tracking

2. **Intelligent Fallback Logic**
   - Automatic retry with exponential backoff
   - Network error detection
   - Non-retryable error identification (auth, validation, etc.)
   - Request timeout handling (10 seconds default)

3. **Graceful Degradation**
   - Falls back to demo/local data when services unavailable
   - Maintains application functionality
   - User-friendly error messages

## Implementation Details

### Network Detection

The system monitors network status through:
- Browser `navigator.onLine` API
- Window `online`/`offline` events
- Periodic lightweight connectivity checks
- Consecutive failure counter (max 3 failures before auto-fallback)

### Fallback Strategy

```typescript
// Example usage
import { withFallback, isServiceAvailable } from '../utils/serviceFallback';

const result = await withFallback(
  async () => {
    // Primary service call
    return await externalService.getData();
  },
  fallbackData, // Fallback value or function
  'ServiceName.getData', // Error context
  {
    throwOnError: false, // Return fallback instead of throwing
    maxRetries: 2, // Number of retry attempts
    retryDelay: 1000 // Initial retry delay in ms
  }
);
```

### Error Classification

**Network Errors** (automatically retried):
- `fetch`, `network`, `NetworkError`
- `Failed to fetch`
- `timeout`, `ECONNREFUSED`, `ENOTFOUND`
- `ETIMEDOUT`, `ERR_INTERNET_DISCONNECTED`

**Non-Retryable Errors** (immediate fallback):
- `401` (Unauthorized)
- `403` (Forbidden)
- `404` (Not Found)
- `422` (Validation Error)
- Authentication/authorization errors

## Service-Specific Implementations

### 1. Asset Service (`assetService.ts`)

**Fallback**: Returns `sampleAssets` from demo data

**Features**:
- Checks Supabase connectivity before attempting queries
- Falls back to demo assets on network errors
- Maintains cache for offline access
- Graceful handling of database connection failures

### 2. Organization Service (`organizationService.ts`)

**Fallback**: Returns demo organization data

**Features**:
- Demo organization returned when service unavailable
- Update operations return updated demo data in offline mode
- Prevents errors from propagating to UI

### 3. External Data Integration Service (`externalDataIntegrationService.ts`)

**Fallback**: Mock data and graceful error messages

**Features**:
- Connection tests check network availability first
- Sync operations include warnings when services unavailable
- Mock implementations available for all data source types
- Status reporting includes service availability

### 4. Supabase Integration (`lib/supabase.ts`)

**Fallback**: Demo mode with local storage

**Features**:
- Configuration validation
- Connectivity testing with timeout
- Retry mechanism with exponential backoff
- Automatic fallback to demo data
- Connection health monitoring

## User Experience

### Offline Indicators

When services are unavailable:
- Application continues to function with demo data
- User-friendly error messages displayed
- No application crashes or broken states
- Data persists in browser storage when possible

### Error Messages

All error messages are user-friendly:
- "Network connection error. Please check your internet connection."
- "External service unavailable. Data sync skipped. Will retry when service is available."
- "Using demo data - Database connection unavailable"

## Configuration

### Environment Variables

```env
# Enable/disable service fallback features
VITE_ENABLE_OFFLINE_MODE=true
VITE_DEBUG_MODE=false
```

### Service Availability Check

```typescript
import { isServiceAvailable } from '../utils/serviceFallback';

if (isServiceAvailable()) {
  // Use real service
} else {
  // Use fallback
}
```

## Benefits

1. **Resilience**: Application continues working during outages
2. **User Experience**: No broken states or crashes
3. **Development**: Easy testing without external dependencies
4. **Performance**: Faster responses with cached/demo data
5. **Reliability**: Automatic recovery when services restore

## Testing

### Simulating Service Failures

1. **Network Disconnection**: Disable network adapter
2. **Service Unavailable**: Block service URLs in browser dev tools
3. **Timeout Simulation**: Use browser throttling
4. **Error Injection**: Modify service responses

### Expected Behavior

- Application should continue functioning
- Demo data should be displayed
- Error messages should be user-friendly
- No console errors or crashes
- Services should resume when available

## Future Enhancements

1. **Offline Queue**: Queue operations for sync when online
2. **Service Health Dashboard**: Visual indicator of service status
3. **Manual Retry**: User-triggered retry mechanism
4. **Service Priority**: Prioritize critical services
5. **Fallback Data Updates**: Periodic updates to demo data

## Monitoring

The system logs:
- Service availability status
- Fallback activations
- Network status changes
- Retry attempts and outcomes

All logs respect production settings and use the centralized logger utility.

---

**Last Updated**: January 2025
**Status**: ✅ Implemented and Production-Ready

