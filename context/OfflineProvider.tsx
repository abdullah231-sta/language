"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useNetworkStatus } from '../lib/offline';
import { syncManager, SyncProgress } from '../lib/offline-sync';

interface OfflineContextType {
  isOnline: boolean;
  isConnecting: boolean;
  syncProgress: SyncProgress;
  isSyncing: boolean;
  lastSyncTime: Date | null;
  pendingActions: number;
  triggerSync: () => Promise<void>;
  clearSyncData: () => Promise<void>;
}

const OfflineContext = createContext<OfflineContextType | undefined>(undefined);

interface OfflineProviderProps {
  children: ReactNode;
}

export const OfflineProvider: React.FC<OfflineProviderProps> = ({ children }) => {
  const { isOnline, isConnecting } = useNetworkStatus();
  const [syncProgress, setSyncProgress] = useState<SyncProgress>(syncManager.getSyncProgress());
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [pendingActions, setPendingActions] = useState(0);
  const [isInitialized, setIsInitialized] = useState(false);

  // Update sync progress periodically
  useEffect(() => {
    const updateProgress = () => {
      setSyncProgress(syncManager.getSyncProgress());
    };

    const interval = setInterval(updateProgress, 500);
    return () => clearInterval(interval);
  }, []);

  // Update sync stats when sync completes or connection changes
  useEffect(() => {
    const updateStats = async () => {
      try {
        if (!isInitialized) return; // Wait for initialization
        
        const stats = await syncManager.getSyncStats();
        setLastSyncTime(stats.lastSyncTime);
        setPendingActions(stats.pendingActions);
      } catch (error) {
        console.error('Failed to get sync stats:', error);
        // If database not initialized, set defaults
        if (error instanceof Error && error.message.includes('Database not initialized')) {
          setLastSyncTime(null);
          setPendingActions(0);
        }
      }
    };

    updateStats();

    // Update stats when sync progress changes
    if (syncProgress.isComplete && isInitialized) {
      updateStats();
    }
  }, [syncProgress.isComplete, isOnline, isInitialized]);

  // Initialize database when component mounts
  useEffect(() => {
    const initializeDatabase = async () => {
      try {
        // Wait for offline manager to be initialized
        await new Promise(resolve => setTimeout(resolve, 100));
        setIsInitialized(true);
      } catch (error) {
        console.error('Failed to initialize offline provider:', error);
        setIsInitialized(true); // Still set to true to prevent infinite loading
      }
    };

    initializeDatabase();
  }, []);

  // Auto-sync when coming back online
  useEffect(() => {
    if (isOnline && !isConnecting && !syncManager.isSyncing()) {
      // Small delay to ensure connection is stable
      const timeout = setTimeout(() => {
        triggerSync();
      }, 2000);

      return () => clearTimeout(timeout);
    }
  }, [isOnline, isConnecting]);

  const triggerSync = async () => {
    if (!isOnline || syncManager.isSyncing()) {
      return;
    }

    try {
      await syncManager.syncAllData();
    } catch (error) {
      console.error('Manual sync failed:', error);
    }
  };

  const clearSyncData = async () => {
    await syncManager.clearSyncData();
    setLastSyncTime(null);
    setPendingActions(0);
  };

  const value: OfflineContextType = {
    isOnline,
    isConnecting,
    syncProgress,
    isSyncing: syncManager.isSyncing(),
    lastSyncTime,
    pendingActions,
    triggerSync,
    clearSyncData,
  };

  return (
    <OfflineContext.Provider value={value}>
      {children}
    </OfflineContext.Provider>
  );
};

// Hook to use offline context
export const useOffline = (): OfflineContextType => {
  const context = useContext(OfflineContext);
  if (context === undefined) {
    throw new Error('useOffline must be used within an OfflineProvider');
  }
  return context;
};

export default OfflineProvider;