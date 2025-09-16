// Offline data synchronization manager
// Handles syncing cached data and offline actions when connection is restored

import { dbManager } from './indexeddb';
import { offlineManager } from './offline';

export interface SyncProgress {
  total: number;
  completed: number;
  currentAction: string;
  isComplete: boolean;
}

export class OfflineSyncManager {
  private static instance: OfflineSyncManager;
  private syncInProgress = false;
  private syncProgress: SyncProgress = {
    total: 0,
    completed: 0,
    currentAction: '',
    isComplete: true
  };

  static getInstance(): OfflineSyncManager {
    if (!OfflineSyncManager.instance) {
      OfflineSyncManager.instance = new OfflineSyncManager();
    }
    return OfflineSyncManager.instance;
  }

  // Get current sync progress
  getSyncProgress(): SyncProgress {
    return { ...this.syncProgress };
  }

  // Check if sync is currently in progress
  isSyncing(): boolean {
    return this.syncInProgress;
  }

  // Perform full data synchronization
  async syncAllData(): Promise<void> {
    if (this.syncInProgress || !navigator.onLine) {
      return;
    }

    this.syncInProgress = true;
    this.syncProgress = {
      total: 0,
      completed: 0,
      currentAction: 'Initializing sync...',
      isComplete: false
    };

    try {
      // Get pending actions
      const pendingActions = await dbManager.getPendingActions();
      this.syncProgress.total = pendingActions.length + 3; // +3 for data sync steps

      // Sync offline actions first
      await this.syncOfflineActions(pendingActions);

      // Sync user data
      await this.syncUserData();

      // Sync groups
      await this.syncGroups();

      // Sync messages
      await this.syncMessages();

      this.syncProgress.isComplete = true;
      this.syncProgress.currentAction = 'Sync complete';

    } catch (error) {
      console.error('Sync failed:', error);
      this.syncProgress.currentAction = 'Sync failed';
    } finally {
      this.syncInProgress = false;
    }
  }

  // Sync pending offline actions
  private async syncOfflineActions(actions: any[]): Promise<void> {
    for (const action of actions) {
      this.syncProgress.currentAction = `Syncing ${action.type.toLowerCase()}...`;

      try {
        await this.syncSingleAction(action);
        await dbManager.markActionSynced(action.id);
        this.syncProgress.completed++;
      } catch (error) {
        console.error(`Failed to sync action ${action.id}:`, error);
        // Continue with other actions
      }
    }
  }

  // Sync a single offline action
  private async syncSingleAction(action: any): Promise<void> {
    switch (action.type) {
      case 'SEND_MESSAGE':
        await this.syncSendMessage(action.data);
        break;
      case 'JOIN_GROUP':
        await this.syncJoinGroup(action.data);
        break;
      case 'LEAVE_GROUP':
        await this.syncLeaveGroup(action.data);
        break;
      case 'UPDATE_PROFILE':
        await this.syncUpdateProfile(action.data);
        break;
      default:
        console.warn('Unknown action type:', action.type);
    }
  }

  // Sync send message action
  private async syncSendMessage(messageData: any): Promise<void> {
    const response = await fetch('/api/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(messageData)
    });

    if (!response.ok) {
      throw new Error('Failed to sync message');
    }

    // Update cached message status
    const cachedMessage = await dbManager.getCachedUserData(messageData.id);
    if (cachedMessage) {
      cachedMessage.status = 'sent';
      await dbManager.cacheMessage(cachedMessage);
    }
  }

  // Sync join group action
  private async syncJoinGroup(data: { groupId: string; userId: string }): Promise<void> {
    const response = await fetch(`/api/groups/join`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      throw new Error('Failed to sync group join');
    }
  }

  // Sync leave group action
  private async syncLeaveGroup(data: { groupId: string; userId: string }): Promise<void> {
    const response = await fetch(`/api/groups/${data.groupId}/members`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId: data.userId })
    });

    if (!response.ok) {
      throw new Error('Failed to sync group leave');
    }
  }

  // Sync profile update action
  private async syncUpdateProfile(profileData: any): Promise<void> {
    const response = await fetch('/api/users', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(profileData)
    });

    if (!response.ok) {
      throw new Error('Failed to sync profile update');
    }
  }

  // Sync user data
  private async syncUserData(): Promise<void> {
    this.syncProgress.currentAction = 'Syncing user data...';

    try {
      const response = await fetch('/api/users/me');
      if (response.ok) {
        const userData = await response.json();
        await dbManager.cacheUserData(userData);
      }
    } catch (error) {
      console.error('Failed to sync user data:', error);
    }

    this.syncProgress.completed++;
  }

  // Sync groups data
  private async syncGroups(): Promise<void> {
    this.syncProgress.currentAction = 'Syncing groups...';

    try {
      const response = await fetch('/api/groups');
      if (response.ok) {
        const groups = await response.json();
        for (const group of groups) {
          await dbManager.cacheGroupData(group);
        }
      }
    } catch (error) {
      console.error('Failed to sync groups:', error);
    }

    this.syncProgress.completed++;
  }

  // Sync messages data
  private async syncMessages(): Promise<void> {
    this.syncProgress.currentAction = 'Syncing messages...';

    try {
      // Get user's groups to sync messages for
      const groups = await dbManager.getCachedGroups();

      for (const group of groups) {
        const response = await fetch(`/api/messages?groupId=${group.id}&limit=50`);
        if (response.ok) {
          const messages = await response.json();
          for (const message of messages) {
            await dbManager.cacheMessage(message);
          }
        }
      }
    } catch (error) {
      console.error('Failed to sync messages:', error);
    }

    this.syncProgress.completed++;
  }

  // Clear all sync data (for testing or reset)
  async clearSyncData(): Promise<void> {
    await dbManager.clear('offlineActions');
    this.syncProgress = {
      total: 0,
      completed: 0,
      currentAction: '',
      isComplete: true
    };
  }

  // Get sync statistics
  async getSyncStats(): Promise<{
    pendingActions: number;
    lastSyncTime: Date | null;
    totalSynced: number;
  }> {
    try {
      const pendingActions = await dbManager.getPendingActions();
      const lastSyncTime = await dbManager.getSetting('lastSyncTime');
      const totalSynced = await dbManager.getSetting('totalSynced') || 0;

      return {
        pendingActions: pendingActions.length,
        lastSyncTime,
        totalSynced
      };
    } catch (error) {
      // If database not initialized, return default values
      if (error instanceof Error && error.message.includes('Database not initialized')) {
        console.log('Database not initialized yet, returning default sync stats');
        return {
          pendingActions: 0,
          lastSyncTime: null,
          totalSynced: 0
        };
      }
      throw error;
    }
  }
}

// Export singleton instance
export const syncManager = OfflineSyncManager.getInstance();

export default OfflineSyncManager;