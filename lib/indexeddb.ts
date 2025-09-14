// IndexedDB utilities for offline data storage
// Handles caching user data, messages, and group information

const DB_NAME = 'LanguageAppDB';
const DB_VERSION = 1;

// Object stores
const STORES = {
  USER_DATA: 'userData',
  GROUPS: 'groups', 
  MESSAGES: 'messages',
  CONVERSATIONS: 'conversations',
  OFFLINE_ACTIONS: 'offlineActions',
  SETTINGS: 'settings'
};

class IndexedDBManager {
  private db: IDBDatabase | null = null;

  // Initialize database
  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => {
        console.error('IndexedDB: Failed to open database');
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        console.log('IndexedDB: Database opened successfully');
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        this.setupObjectStores(db);
      };
    });
  }

  // Setup object stores on database upgrade
  private setupObjectStores(db: IDBDatabase): void {
    console.log('IndexedDB: Setting up object stores');

    // User data store
    if (!db.objectStoreNames.contains(STORES.USER_DATA)) {
      const userStore = db.createObjectStore(STORES.USER_DATA, { keyPath: 'id' });
      userStore.createIndex('username', 'username', { unique: true });
    }

    // Groups store
    if (!db.objectStoreNames.contains(STORES.GROUPS)) {
      const groupsStore = db.createObjectStore(STORES.GROUPS, { keyPath: 'id' });
      groupsStore.createIndex('name', 'name', { unique: false });
      groupsStore.createIndex('language', 'language', { unique: false });
    }

    // Messages store
    if (!db.objectStoreNames.contains(STORES.MESSAGES)) {
      const messagesStore = db.createObjectStore(STORES.MESSAGES, { keyPath: 'id' });
      messagesStore.createIndex('groupId', 'groupId', { unique: false });
      messagesStore.createIndex('senderId', 'senderId', { unique: false });
      messagesStore.createIndex('timestamp', 'timestamp', { unique: false });
    }

    // Conversations store  
    if (!db.objectStoreNames.contains(STORES.CONVERSATIONS)) {
      const conversationsStore = db.createObjectStore(STORES.CONVERSATIONS, { keyPath: 'id' });
      conversationsStore.createIndex('participants', 'participants', { unique: false, multiEntry: true });
    }

    // Offline actions store
    if (!db.objectStoreNames.contains(STORES.OFFLINE_ACTIONS)) {
      const offlineStore = db.createObjectStore(STORES.OFFLINE_ACTIONS, { keyPath: 'id' });
      offlineStore.createIndex('type', 'type', { unique: false });
      offlineStore.createIndex('timestamp', 'timestamp', { unique: false });
    }

    // Settings store
    if (!db.objectStoreNames.contains(STORES.SETTINGS)) {
      db.createObjectStore(STORES.SETTINGS, { keyPath: 'key' });
    }
  }

  // Generic method to add/update data
  async put(storeName: string, data: any): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.put(data);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // Generic method to get data
  async get(storeName: string, key: any): Promise<any> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.get(key);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  // Generic method to get all data from store
  async getAll(storeName: string): Promise<any[]> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  // Generic method to delete data
  async delete(storeName: string, key: any): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.delete(key);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // Clear all data from a store
  async clear(storeName: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.clear();

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // Cache user data
  async cacheUserData(userData: any): Promise<void> {
    await this.put(STORES.USER_DATA, {
      ...userData,
      cachedAt: new Date()
    });
  }

  // Get cached user data
  async getCachedUserData(userId: string): Promise<any> {
    return await this.get(STORES.USER_DATA, userId);
  }

  // Cache group data
  async cacheGroupData(groupData: any): Promise<void> {
    await this.put(STORES.GROUPS, {
      ...groupData,
      cachedAt: new Date()
    });
  }

  // Get cached groups
  async getCachedGroups(): Promise<any[]> {
    return await this.getAll(STORES.GROUPS);
  }

  // Cache message
  async cacheMessage(message: any): Promise<void> {
    await this.put(STORES.MESSAGES, {
      ...message,
      cachedAt: new Date()
    });
  }

  // Get cached messages for a group
  async getCachedMessages(groupId: string): Promise<any[]> {
    if (!this.db) return [];

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORES.MESSAGES], 'readonly');
      const store = transaction.objectStore(STORES.MESSAGES);
      const index = store.index('groupId');
      const request = index.getAll(groupId);

      request.onsuccess = () => {
        const messages = request.result.sort((a, b) => 
          new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        );
        resolve(messages);
      };
      request.onerror = () => reject(request.error);
    });
  }

  // Store offline action
  async storeOfflineAction(action: any): Promise<void> {
    const offlineAction = {
      id: Date.now().toString(),
      ...action,
      timestamp: new Date(),
      synced: false
    };
    await this.put(STORES.OFFLINE_ACTIONS, offlineAction);
  }

  // Get pending offline actions
  async getPendingActions(): Promise<any[]> {
    const actions = await this.getAll(STORES.OFFLINE_ACTIONS);
    return actions.filter(action => !action.synced);
  }

  // Mark action as synced
  async markActionSynced(actionId: string): Promise<void> {
    const action = await this.get(STORES.OFFLINE_ACTIONS, actionId);
    if (action) {
      action.synced = true;
      await this.put(STORES.OFFLINE_ACTIONS, action);
    }
  }

  // Store app settings
  async storeSetting(key: string, value: any): Promise<void> {
    await this.put(STORES.SETTINGS, { key, value, updatedAt: new Date() });
  }

  // Get app setting
  async getSetting(key: string): Promise<any> {
    const setting = await this.get(STORES.SETTINGS, key);
    return setting ? setting.value : null;
  }

  // Check if data is stale (older than specified minutes)
  isDataStale(cachedAt: Date, maxAgeMinutes: number = 30): boolean {
    const now = new Date();
    const diffMinutes = (now.getTime() - cachedAt.getTime()) / (1000 * 60);
    return diffMinutes > maxAgeMinutes;
  }
}

// Export singleton instance
export const dbManager = new IndexedDBManager();

// Export store names for reference
export { STORES };

export default IndexedDBManager;