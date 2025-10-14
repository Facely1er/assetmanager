// Offline functionality and data synchronization
import { useState, useEffect } from 'react';

interface OfflineOperation {
  id: string;
  type: 'create' | 'update' | 'delete';
  resource: 'asset' | 'organization' | 'user';
  data: unknown;
  timestamp: string;
  retry_count: number;
}

class OfflineManager {
  private operations: OfflineOperation[] = [];
  private isOnline: boolean = navigator.onLine;
  private syncInProgress: boolean = false;
  private maxRetries: number = 3;

  constructor() {
    this.loadOfflineOperations();
    this.setupEventListeners();
  }

  private setupEventListeners() {
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.syncOfflineOperations();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
    });

    // Periodic sync attempt
    setInterval(() => {
      if (this.isOnline && this.operations.length > 0 && !this.syncInProgress) {
        this.syncOfflineOperations();
      }
    }, 30000); // Every 30 seconds
  }

  // Queue operation for offline sync
  queueOperation(type: OfflineOperation['type'], resource: OfflineOperation['resource'], data: unknown): string {
    const operation: OfflineOperation = {
      id: crypto.randomUUID(),
      type,
      resource,
      data,
      timestamp: new Date().toISOString(),
      retry_count: 0,
    };

    this.operations.push(operation);
    this.saveOfflineOperations();

    // Try immediate sync if online
    if (this.isOnline) {
      this.syncOfflineOperations();
    }

    return operation.id;
  }

  // Sync offline operations when back online
  private async syncOfflineOperations() {
    if (this.syncInProgress || this.operations.length === 0) return;

    this.syncInProgress = true;
    console.log(`Syncing ${this.operations.length} offline operations...`);

    const failedOperations: OfflineOperation[] = [];

    for (const operation of this.operations) {
      try {
        await this.executeOperation(operation);
        console.log(`Synced operation ${operation.id}`);
      } catch (error) {
        console.error(`Failed to sync operation ${operation.id}:`, error);
        operation.retry_count++;
        
        if (operation.retry_count < this.maxRetries) {
          failedOperations.push(operation);
        } else {
          console.error(`Operation ${operation.id} exceeded max retries, discarding`);
        }
      }
    }

    this.operations = failedOperations;
    this.saveOfflineOperations();
    this.syncInProgress = false;

    if (failedOperations.length === 0) {
      console.log('All offline operations synced successfully');
    } else {
      console.log(`${failedOperations.length} operations still pending retry`);
    }
  }

  // Execute individual operation
  private async executeOperation(operation: OfflineOperation): Promise<void> {
    const { assetService } = await import('../services/assetService');
    const { organizationService } = await import('../services/organizationService');

    switch (operation.resource) {
      case 'asset':
        switch (operation.type) {
          case 'create':
            await assetService.createAsset(operation.data);
            break;
          case 'update':
            await assetService.updateAsset(operation.data.id, operation.data);
            break;
          case 'delete':
            await assetService.deleteAssets([operation.data.id]);
            break;
        }
        break;
      
      case 'organization':
        switch (operation.type) {
          case 'create':
            await organizationService.createOrganization(operation.data);
            break;
          case 'update':
            await organizationService.updateOrganization(operation.data.id, operation.data);
            break;
        }
        break;
      
      default:
        throw new Error(`Unknown resource type: ${operation.resource}`);
    }
  }

  // Local storage management
  private loadOfflineOperations() {
    try {
      const stored = localStorage.getItem('ermits_offline_operations');
      if (stored) {
        this.operations = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Failed to load offline operations:', error);
      this.operations = [];
    }
  }

  private saveOfflineOperations() {
    try {
      localStorage.setItem('ermits_offline_operations', JSON.stringify(this.operations));
    } catch (error) {
      console.error('Failed to save offline operations:', error);
    }
  }

  // Public methods
  getQueuedOperations(): OfflineOperation[] {
    return [...this.operations];
  }

  clearQueue() {
    this.operations = [];
    this.saveOfflineOperations();
  }

  isOffline(): boolean {
    return !this.isOnline;
  }

  getPendingCount(): number {
    return this.operations.length;
  }
}

// Cache management for offline data
class OfflineCache {
  private cacheName = 'ermits-data-cache-v1';

  async cacheData(key: string, data: unknown, expiry?: number): Promise<void> {
    try {
      const cache = await caches.open(this.cacheName);
      const response = new Response(JSON.stringify({
        data,
        timestamp: Date.now(),
        expiry: expiry ? Date.now() + expiry : undefined,
      }));
      
      await cache.put(key, response);
    } catch (error) {
      console.error('Failed to cache data:', error);
    }
  }

  async getCachedData(key: string): Promise<unknown | null> {
    try {
      const cache = await caches.open(this.cacheName);
      const response = await cache.match(key);
      
      if (!response) return null;
      
      const cached = await response.json();
      
      // Check expiry
      if (cached.expiry && Date.now() > cached.expiry) {
        await cache.delete(key);
        return null;
      }
      
      return cached.data;
    } catch (error) {
      console.error('Failed to get cached data:', error);
      return null;
    }
  }

  async clearCache(): Promise<void> {
    try {
      await caches.delete(this.cacheName);
    } catch (error) {
      console.error('Failed to clear cache:', error);
    }
  }

  async getCacheSize(): Promise<number> {
    try {
      const cache = await caches.open(this.cacheName);
      const keys = await cache.keys();
      let totalSize = 0;
      
      for (const request of keys) {
        const response = await cache.match(request);
        if (response) {
          const blob = await response.blob();
          totalSize += blob.size;
        }
      }
      
      return totalSize;
    } catch (error) {
      console.error('Failed to calculate cache size:', error);
      return 0;
    }
  }
}

// Create singleton instances
export const offlineManager = new OfflineManager();
export const offlineCache = new OfflineCache();

// Utility function to check network connectivity
export const checkConnectivity = async (): Promise<boolean> => {
  if (!navigator.onLine) return false;
  
  try {
    const response = await fetch('/api/health', {
      method: 'HEAD',
      cache: 'no-cache',
    });
    return response.ok;
  } catch {
    return false;
  }
};

// Hook for offline status
export const useOfflineStatus = () => {
  const [isOffline, setIsOffline] = React.useState(!navigator.onLine);
  const [pendingOperations, setPendingOperations] = React.useState(0);

  React.useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Update pending operations count
    const updatePendingCount = () => {
      setPendingOperations(offlineManager.getPendingCount());
    };

    const interval = setInterval(updatePendingCount, 1000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, []);

  return { isOffline, pendingOperations };
};