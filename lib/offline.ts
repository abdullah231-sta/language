// Connection status utilities for offline mode
// Monitors network connectivity and provides offline indicators

import { useEffect, useState } from 'react';
import { dbManager } from './indexeddb';

// Hook to monitor network connectivity
export const useNetworkStatus = () => {
  const [isOnline, setIsOnline] = useState(true);
  const [isConnecting, setIsConnecting] = useState(false);

  useEffect(() => {
    // Set initial status
    setIsOnline(navigator.onLine);

    const handleOnline = () => {
      setIsConnecting(true);
      setIsOnline(true);
      
      // Trigger background sync when connection is restored
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.ready.then(registration => {
          // Try to register background sync if supported
          if ('sync' in registration) {
            (registration as any).sync.register('background-message-sync');
            (registration as any).sync.register('background-user-data-sync');
          }
        });
      }
      
      // Reset connecting state after a brief delay
      setTimeout(() => setIsConnecting(false), 1000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setIsConnecting(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return { isOnline, isConnecting };
};

// Service Worker registration utility
export const registerServiceWorker = async (): Promise<ServiceWorkerRegistration | null> => {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      });

      console.log('Service Worker registered successfully:', registration);

      // Handle service worker updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New version available
              if (confirm('A new version is available. Reload to update?')) {
                newWorker.postMessage({ type: 'SKIP_WAITING' });
                window.location.reload();
              }
            }
          });
        }
      });

      return registration;
    } catch (error) {
      console.error('Service Worker registration failed:', error);
      return null;
    }
  }
  return null;
};

// Offline storage utilities
export class OfflineManager {
  private static instance: OfflineManager;

  static getInstance(): OfflineManager {
    if (!OfflineManager.instance) {
      OfflineManager.instance = new OfflineManager();
    }
    return OfflineManager.instance;
  }

  // Initialize offline capabilities
  async init(): Promise<void> {
    await dbManager.init();
    await registerServiceWorker();
  }

  // Cache data with fallback for offline access
  async cacheWithFallback<T>(
    key: string,
    fetchFunction: () => Promise<T>,
    cacheFunction: (data: T) => Promise<void>,
    getCachedFunction: () => Promise<T | null>,
    maxAgeMinutes: number = 30
  ): Promise<T> {
    try {
      // Try to fetch fresh data if online
      if (navigator.onLine) {
        const freshData = await fetchFunction();
        await cacheFunction(freshData);
        return freshData;
      }
    } catch (error) {
      console.log('Failed to fetch fresh data, trying cache:', error);
    }

    // Fallback to cached data
    const cachedData = await getCachedFunction();
    if (cachedData) {
      return cachedData;
    }

    throw new Error('No data available offline');
  }

  // Store action for later sync when online
  async storeOfflineAction(action: any): Promise<void> {
    await dbManager.storeOfflineAction(action);
    
    // Try to register background sync if available
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.ready;
        if ('sync' in registration) {
          await (registration as any).sync.register('background-message-sync');
        }
      } catch (error) {
        console.log('Background sync registration failed:', error);
      }
    }
  }

  // Get cached user data with network fallback
  async getUserData(userId: string): Promise<any> {
    return this.cacheWithFallback(
      `user-${userId}`,
      () => fetch(`/api/users/${userId}`).then(res => res.json()),
      (data) => dbManager.cacheUserData(data),
      () => dbManager.getCachedUserData(userId)
    );
  }

  // Get cached groups with network fallback
  async getGroups(): Promise<any[]> {
    return this.cacheWithFallback(
      'groups',
      () => fetch('/api/groups').then(res => res.json()),
      async (data) => {
        // Cache each group individually
        for (const group of data) {
          await dbManager.cacheGroupData(group);
        }
      },
      () => dbManager.getCachedGroups()
    );
  }

  // Get cached messages with network fallback
  async getMessages(groupId: string): Promise<any[]> {
    return this.cacheWithFallback(
      `messages-${groupId}`,
      () => fetch(`/api/messages?groupId=${groupId}`).then(res => res.json()),
      async (data) => {
        // Cache each message individually
        for (const message of data) {
          await dbManager.cacheMessage(message);
        }
      },
      () => dbManager.getCachedMessages(groupId)
    );
  }

  // Send message with offline support
  async sendMessage(messageData: any): Promise<void> {
    if (navigator.onLine) {
      try {
        const response = await fetch('/api/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(messageData)
        });

        if (!response.ok) {
          throw new Error('Failed to send message');
        }

        // Cache the sent message
        await dbManager.cacheMessage(messageData);
        return;
      } catch (error) {
        console.log('Failed to send message online, storing for sync:', error);
      }
    }

    // Store for offline sync
    await this.storeOfflineAction({
      type: 'SEND_MESSAGE',
      data: messageData
    });

    // Cache the message locally with pending status
    await dbManager.cacheMessage({
      ...messageData,
      status: 'pending'
    });
  }

  // Check if cached data is stale
  isDataStale(cachedAt: Date, maxAgeMinutes: number = 30): boolean {
    return dbManager.isDataStale(cachedAt, maxAgeMinutes);
  }

  // Clear all cached data
  async clearCache(): Promise<void> {
    await dbManager.clear('userData');
    await dbManager.clear('groups');
    await dbManager.clear('messages');
    await dbManager.clear('conversations');
    console.log('All cached data cleared');
  }
}

// Export singleton instance
export const offlineManager = OfflineManager.getInstance();

export default OfflineManager;