/**
 * Mentara Service Worker - Enhanced Push Notifications
 * Handles background push notifications, caching, and offline functionality
 * Version: 2.0.0
 */

const CACHE_NAME = 'mentara-v2';
const NOTIFICATION_CACHE = 'mentara-notifications-v1';

// Cache essential resources
const urlsToCache = [
  '/',
  '/favicon.ico',
  '/icons/mentara/mentara-icon.png',
];

// Notification assets
const notificationAssets = [
  '/icons/mentara/mentara-icon.png',
  '/icons/mentara/mentara-landscape.png',
];

// Install event - cache resources
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  
  event.waitUntil(
    Promise.all([
      caches.open(CACHE_NAME).then((cache) => {
        console.log('Caching app assets');
        return cache.addAll(urlsToCache);
      }),
      caches.open(NOTIFICATION_CACHE).then((cache) => {
        console.log('Caching notification assets');
        return cache.addAll(notificationAssets);
      })
    ])
  );
  
  // Take control immediately
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');
  
  const cacheWhitelist = [CACHE_NAME, NOTIFICATION_CACHE];

  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  
  // Take control of all clients
  self.clients.claim();
});

// Fetch event - serve from cache when possible
self.addEventListener('fetch', (event) => {
  // Only cache GET requests
  if (event.request.method !== 'GET') return;
  
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version or fetch from network
        return response || fetch(event.request);
      })
      .catch(() => {
        // Fallback for offline scenarios
        if (event.request.destination === 'document') {
          return caches.match('/');
        }
      })
  );
});

// Push event - handle incoming push notifications
self.addEventListener('push', (event) => {
  console.log('Push notification received:', event);

  if (!event.data) {
    console.log('Push event but no data');
    return;
  }

  try {
    const data = event.data.json();
    console.log('Push data:', data);

    // Enhanced notification options based on category and priority
    const notificationOptions = {
      body: data.message || data.body || 'You have a new notification',
      icon: data.icon || '/icons/mentara/mentara-icon.png',
      badge: data.badge || '/icons/mentara/mentara-icon.png',
      image: data.image,
      data: {
        url: data.actionUrl || data.url || getDashboardUrl(data.category),
        notificationId: data.id,
        category: data.category || 'system',
        priority: data.priority || 'medium',
        conversationId: data.conversationId,
        messageId: data.messageId,
        senderId: data.senderId,
        ...data.data
      },
      actions: data.actions || getDefaultActions(data.category, data.actionUrl),
      tag: data.tag || `mentara-${data.category || 'notification'}`,
      renotify: data.renotify || false,
      requireInteraction: data.priority === 'urgent',
      silent: data.silent || false,
      vibrate: data.vibration !== false ? getVibrationPattern(data.priority) : undefined,
      timestamp: Date.now(),
      dir: data.dir || 'auto',
      lang: data.lang || 'en',
    };

    // Add category-specific styling
    applyNotificationStyling(notificationOptions, data.category, data.priority);

    event.waitUntil(
      self.registration.showNotification(
        data.title || getCategoryTitle(data.category),
        notificationOptions
      )
    );

  } catch (error) {
    console.error('Error processing push notification:', error);

    // Fallback notification
    event.waitUntil(
      self.registration.showNotification('Mentara', {
        body: 'You have a new notification',
        icon: '/icons/mentara/mentara-icon.png',
        badge: '/icons/mentara/mentara-icon.png',
        data: { url: '/' },
        tag: 'mentara-fallback'
      })
    );
  }
});

// Helper function to get dashboard URL based on category
function getDashboardUrl(category) {
  switch (category) {
    case 'message':
      return '/user/messages';
    case 'community':
      return '/user/community';
    case 'billing':
      return '/user/billing';
    case 'therapy':
      return '/user/therapy';
    case 'system':
    default:
      return '/user/dashboard';
  }
}

// Helper function to get default actions based on category
function getDefaultActions(category, actionUrl) {
  const actions = [];

  if (actionUrl) {
    switch (category) {
      case 'message':
        actions.push({
          action: 'view',
          title: 'View Message',
          icon: '/icons/messages.svg'
        });
        break;
      case 'community':
        actions.push({
          action: 'view',
          title: 'View Post',
          icon: '/icons/community.svg'
        });
        break;
      case 'billing':
        actions.push({
          action: 'view',
          title: 'View Billing',
          icon: '/icons/dashboard.svg'
        });
        break;
      case 'therapy':
        actions.push({
          action: 'view',
          title: 'View Session',
          icon: '/icons/therapist.svg'
        });
        break;
      default:
        actions.push({
          action: 'view',
          title: 'View',
          icon: '/icons/dashboard.svg'
        });
    }
  }

  actions.push({
    action: 'dismiss',
    title: 'Dismiss',
    icon: '/icons/dashboard.svg'
  });

  return actions;
}

// Helper function to get category title
function getCategoryTitle(category) {
  switch (category) {
    case 'message':
      return 'New Message';
    case 'community':
      return 'Community Activity';
    case 'billing':
      return 'Billing Update';
    case 'therapy':
      return 'Therapy Reminder';
    case 'system':
    default:
      return 'Mentara';
  }
}

// Helper function to get vibration pattern based on priority
function getVibrationPattern(priority) {
  switch (priority) {
    case 'urgent':
      return [200, 100, 200, 100, 200];
    case 'high':
      return [200, 100, 200];
    case 'medium':
      return [200, 100];
    case 'low':
    default:
      return [100];
  }
}

// Helper function to apply category-specific styling
function applyNotificationStyling(options, category, priority) {
  // This could be extended to apply different icons, colors, etc.
  // For now, we'll keep the basic implementation
  
  if (priority === 'urgent') {
    options.requireInteraction = true;
  }
  
  // Set appropriate icons based on category
  if (category && !options.icon.includes('mentara-icon')) {
    switch (category) {
      case 'message':
        if (typeof options.data === 'object') {
          options.data.categoryIcon = '/icons/messages.svg';
        }
        break;
      case 'community':
        if (typeof options.data === 'object') {
          options.data.categoryIcon = '/icons/community.svg';
        }
        break;
      case 'billing':
        if (typeof options.data === 'object') {
          options.data.categoryIcon = '/icons/dashboard.svg';
        }
        break;
      case 'therapy':
        if (typeof options.data === 'object') {
          options.data.categoryIcon = '/icons/therapist.svg';
        }
        break;
    }
  }
}

// Notification click event - handle user interaction
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event);

  const notification = event.notification;
  const action = event.action;
  const data = notification.data || {};

  // Close the notification
  notification.close();

  // Handle different actions
  if (action === 'dismiss') {
    // Track dismissal and return
    trackNotificationAction(data.notificationId, 'dismiss');
    return;
  }

  // Default action or 'view' action
  let targetUrl = data.url || '/user/dashboard';
  
  // Build URL with query parameters based on notification data
  try {
    const url = new URL(targetUrl, self.location.origin);
    
    // Add conversation parameters for messages
    if (data.conversationId) {
      url.searchParams.set('conversation', data.conversationId);
    }
    
    // Add message parameters
    if (data.messageId) {
      url.searchParams.set('message', data.messageId);
    }
    
    // Add notification source tracking
    url.searchParams.set('source', 'push-notification');
    url.searchParams.set('notificationId', data.notificationId || '');
    
    targetUrl = url.toString();
  } catch (error) {
    console.error('Error building target URL:', error);
  }

  // Track the click action
  trackNotificationAction(data.notificationId, action || 'click');

  // Open the app and navigate to the relevant page
  const openPromise = clients.matchAll({
    type: 'window',
    includeUncontrolled: true
  }).then((clientList) => {
    // Check if app is already open to the target URL
    for (const client of clientList) {
      if (client.url.includes(self.location.origin)) {
        // Focus existing window and navigate
        return client.focus().then(() => {
          return client.postMessage({
            type: 'NAVIGATE',
            url: targetUrl,
            notificationData: data,
            source: 'push-notification'
          });
        });
      }
    }

    // No app window is open, open a new one
    if (clients.openWindow) {
      return clients.openWindow(targetUrl);
    }
  });

  event.waitUntil(openPromise);
});

// Notification close event - track dismissals
self.addEventListener('notificationclose', (event) => {
  console.log('Notification closed:', event);

  const notification = event.notification;
  const data = notification.data || {};

  // Track notification dismissal
  trackNotificationAction(data.notificationId, 'dismiss');
});

// Helper function to track notification actions
function trackNotificationAction(notificationId, action) {
  if (!notificationId) return;

  // Send analytics to server
  fetch('/api/notifications/track', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      notificationId,
      action,
      timestamp: Date.now(),
      userAgent: navigator.userAgent
    })
  }).catch((error) => {
    console.error('Failed to track notification action:', error);
  });
}

// Background sync for offline message sending
self.addEventListener('sync', (event) => {
  console.log('Background sync triggered:', event.tag);
  
  if (event.tag === 'send-offline-messages') {
    event.waitUntil(sendOfflineMessages());
  }
});

// Function to send queued offline messages
async function sendOfflineMessages() {
  try {
    // Get offline messages from IndexedDB or local storage
    const offlineMessages = await getOfflineMessages();
    
    for (const message of offlineMessages) {
      try {
        // Attempt to send the message
        const response = await fetch('/api/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(message)
        });

        if (response.ok) {
          // Remove from offline queue on success
          await removeOfflineMessage(message.id);
          console.log('Offline message sent successfully:', message.id);
        }
      } catch (error) {
        console.error('Failed to send offline message:', message.id, error);
      }
    }
  } catch (error) {
    console.error('Error processing offline messages:', error);
  }
}

// Helper function to get offline messages (placeholder)
async function getOfflineMessages() {
  // This would integrate with IndexedDB to retrieve queued messages
  // For now, return empty array
  return [];
}

// Helper function to remove offline message (placeholder)
async function removeOfflineMessage(messageId) {
  // This would remove the message from IndexedDB
  console.log('Removing offline message:', messageId);
}

// Message event - handle messages from the main app
self.addEventListener('message', (event) => {
  console.log('Service worker received message:', event.data);

  const { type, data } = event.data || {};

  switch (type) {
    case 'SKIP_WAITING':
      self.skipWaiting();
      break;

    case 'TEST_NOTIFICATION':
      // Handle test notification from the usePushNotifications hook
      if (data) {
        self.registration.showNotification(data.title || 'Test Notification', {
          body: data.message || 'Push notifications are working correctly!',
          icon: data.icon || '/icons/mentara/mentara-icon.png',
          badge: data.badge || '/icons/mentara/mentara-icon.png',
          tag: 'test-notification',
          requireInteraction: false,
          data: { 
            url: '/',
            notificationId: 'test-' + Date.now(),
            category: 'system'
          },
          actions: [
            {
              action: 'view',
              title: 'View App',
              icon: '/icons/dashboard.svg'
            },
            {
              action: 'dismiss',
              title: 'Dismiss',
              icon: '/icons/dashboard.svg'
            }
          ]
        });
      }
      break;

    case 'UPDATE_CONFIG':
      // Handle configuration updates from usePushNotifications
      console.log('Updating notification config:', data);
      updateNotificationConfig(data);
      break;

    case 'CLEAR_NOTIFICATIONS':
      // Clear all notifications
      self.registration.getNotifications().then((notifications) => {
        notifications.forEach((notification) => {
          notification.close();
        });
      });
      break;

    case 'QUEUE_OFFLINE_MESSAGE':
      // Queue message for sending when online
      queueOfflineMessage(data?.message);
      break;

    case 'GET_NOTIFICATION_COUNT':
      // Get current notification count
      self.registration.getNotifications().then((notifications) => {
        event.ports[0]?.postMessage({
          type: 'NOTIFICATION_COUNT',
          count: notifications.length
        });
      });
      break;

    default:
      console.log('Unknown message type:', type);
  }
});

// Helper function to update notification configuration
function updateNotificationConfig(config) {
  try {
    // Store configuration in IndexedDB for offline access
    // This would integrate with a proper IndexedDB implementation
    console.log('Storing notification config:', config);
    
    // For now, we'll just log the config
    // In a real implementation, this would be stored in IndexedDB
    
    // Acknowledge the config update
    self.clients.matchAll().then((clients) => {
      clients.forEach((client) => {
        client.postMessage({
          type: 'CONFIG_UPDATED',
          success: true
        });
      });
    });
    
  } catch (error) {
    console.error('Failed to update notification config:', error);
    
    // Send error response
    self.clients.matchAll().then((clients) => {
      clients.forEach((client) => {
        client.postMessage({
          type: 'CONFIG_UPDATED',
          success: false,
          error: error.message
        });
      });
    });
  }
}

// Helper function to queue offline messages
function queueOfflineMessage(message) {
  // This would store the message in IndexedDB for later sending
  console.log('Queuing offline message:', message);
}

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];

  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

console.log('Mentara Service Worker loaded successfully');