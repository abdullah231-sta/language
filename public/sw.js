// Service Worker for Language Learning App
// Provides offline functionality and caching

const CACHE_NAME = 'language-app-v1';
const STATIC_CACHE_NAME = 'language-app-static-v1';
const API_CACHE_NAME = 'language-app-api-v1';

// Static assets to cache
const STATIC_ASSETS = [
  '/',
  '/login',
  '/register',
  '/groups',
  '/messages',
  '/profile',
  '/settings',
  '/manifest.json'
];

// API endpoints to cache
const API_ENDPOINTS = [
  '/api/users',
  '/api/groups',
  '/api/conversations',
  '/api/messages'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  
  event.waitUntil(
    Promise.all([
      // Cache static assets
      caches.open(STATIC_CACHE_NAME).then((cache) => {
        console.log('Service Worker: Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      }),
      // Cache API endpoints
      caches.open(API_CACHE_NAME).then((cache) => {
        console.log('Service Worker: Setting up API cache');
        return Promise.resolve();
      })
    ]).then(() => {
      console.log('Service Worker: Installation complete');
      // Force activate immediately
      self.skipWaiting();
    })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== STATIC_CACHE_NAME && 
              cacheName !== API_CACHE_NAME && 
              cacheName !== CACHE_NAME) {
            console.log('Service Worker: Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('Service Worker: Activation complete');
      // Take control of all clients immediately
      return self.clients.claim();
    })
  );
});

// Fetch event - handle requests with caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Handle different types of requests with appropriate strategies
  if (url.pathname.startsWith('/api/')) {
    // API requests - Network first, cache fallback
    event.respondWith(networkFirstStrategy(request, API_CACHE_NAME));
  } else if (url.pathname.includes('/_next/') || url.pathname.includes('/static/')) {
    // Next.js static assets - Cache first
    event.respondWith(cacheFirstStrategy(request, STATIC_CACHE_NAME));
  } else {
    // Pages and other assets - Network first with cache fallback
    event.respondWith(networkFirstStrategy(request, STATIC_CACHE_NAME));
  }
});

// Network first strategy - try network, fallback to cache
async function networkFirstStrategy(request, cacheName) {
  try {
    // Try network first
    const networkResponse = await fetch(request);
    
    // If successful, update cache and return response
    if (networkResponse.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('Service Worker: Network failed, trying cache for:', request.url);
    
    // Network failed, try cache
    const cachedResponse = await caches.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // If no cache, return offline page for navigation requests
    if (request.mode === 'navigate') {
      return caches.match('/offline.html') || new Response('Offline - Please check your connection', {
        status: 503,
        statusText: 'Service Unavailable'
      });
    }
    
    // For other requests, return error
    return new Response('Offline', {
      status: 503,
      statusText: 'Service Unavailable'
    });
  }
}

// Cache first strategy - check cache first, fallback to network
async function cacheFirstStrategy(request, cacheName) {
  // Check cache first
  const cachedResponse = await caches.match(request);
  
  if (cachedResponse) {
    return cachedResponse;
  }
  
  // Not in cache, fetch from network
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('Service Worker: Both cache and network failed for:', request.url);
    return new Response('Resource unavailable offline', {
      status: 503,
      statusText: 'Service Unavailable'
    });
  }
}

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  console.log('Service Worker: Background sync triggered:', event.tag);
  
  if (event.tag === 'background-message-sync') {
    event.waitUntil(syncOfflineMessages());
  }
  
  if (event.tag === 'background-user-data-sync') {
    event.waitUntil(syncOfflineUserData());
  }
});

// Sync offline messages when connection is restored
async function syncOfflineMessages() {
  try {
    console.log('Service Worker: Syncing offline messages...');
    
    // Get pending messages from IndexedDB
    const pendingMessages = await getOfflineMessages();
    
    for (const message of pendingMessages) {
      try {
        const response = await fetch('/api/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(message)
        });
        
        if (response.ok) {
          // Remove from offline storage
          await removeOfflineMessage(message.id);
          console.log('Service Worker: Message synced:', message.id);
        }
      } catch (error) {
        console.log('Service Worker: Failed to sync message:', message.id, error);
      }
    }
  } catch (error) {
    console.log('Service Worker: Background sync failed:', error);
  }
}

// Sync offline user data when connection is restored
async function syncOfflineUserData() {
  try {
    console.log('Service Worker: Syncing offline user data...');
    
    // Implement user data sync logic here
    // This could include profile updates, settings changes, etc.
    
  } catch (error) {
    console.log('Service Worker: User data sync failed:', error);
  }
}

// IndexedDB helpers (simplified versions)
async function getOfflineMessages() {
  // Return pending messages from IndexedDB
  return [];
}

async function removeOfflineMessage(messageId) {
  // Remove message from IndexedDB
  return Promise.resolve();
}

// Message event for communication with main thread
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  // Handle notification requests from main thread
  if (event.data && event.data.type === 'SHOW_NOTIFICATION') {
    const { data } = event.data;
    
    const options = {
      body: data.body,
      icon: data.icon || '/favicon.ico',
      badge: '/favicon.ico',
      tag: data.tag,
      renotify: true,
      requireInteraction: false,
      actions: [
        {
          action: 'view',
          title: 'View Message',
          icon: '/favicon.ico'
        },
        {
          action: 'dismiss',
          title: 'Dismiss',
          icon: '/favicon.ico'
        }
      ],
      data: {
        url: data.url,
        groupId: data.groupId,
        messageId: data.messageId
      }
    };

    self.registration.showNotification(data.title, options);
  }
});

// Push notification events
self.addEventListener('push', (event) => {
  console.log('Service Worker: Push notification received', event);
  
  if (!event.data) {
    return;
  }

  try {
    const data = event.data.json();
    const options = {
      body: data.body || 'New message in group chat',
      icon: data.icon || '/favicon.ico',
      badge: '/favicon.ico',
      image: data.image,
      tag: data.tag || 'message-notification',
      renotify: true,
      requireInteraction: false,
      actions: [
        {
          action: 'view',
          title: 'View Message',
          icon: '/favicon.ico'
        },
        {
          action: 'dismiss',
          title: 'Dismiss',
          icon: '/favicon.ico'
        }
      ],
      data: {
        url: data.url || '/groups',
        groupId: data.groupId,
        messageId: data.messageId
      }
    };

    event.waitUntil(
      self.registration.showNotification(data.title || 'Language Learning App', options)
    );
  } catch (error) {
    console.error('Service Worker: Error handling push notification:', error);
    
    // Fallback notification
    event.waitUntil(
      self.registration.showNotification('Language Learning App', {
        body: 'You have a new message',
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: 'fallback-notification'
      })
    );
  }
});

// Handle notification click events
self.addEventListener('notificationclick', (event) => {
  console.log('Service Worker: Notification clicked', event);
  
  event.notification.close();

  if (event.action === 'dismiss') {
    return;
  }

  // Get the URL to open (default to groups page)
  const urlToOpen = event.notification.data?.url || '/groups';
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Check if there's already a window/tab open with our app
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          // If the app is already open, focus it and navigate if needed
          if (client.url !== self.location.origin + urlToOpen) {
            client.navigate(urlToOpen);
          }
          return client.focus();
        }
      }
      
      // If no window is open, open a new one
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});

// Handle notification close events
self.addEventListener('notificationclose', (event) => {
  console.log('Service Worker: Notification closed', event);
  
  // Optional: Track notification close events for analytics
  // You could send this data to your analytics service
});

console.log('Service Worker: Script loaded');