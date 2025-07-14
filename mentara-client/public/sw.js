/**
 * Service Worker for Push Notifications
 * Handles background push notifications when the app is closed
 */

const CACHE_NAME = 'mentara-v1';
const urlsToCache = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css',
];

// Install event - cache resources
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// Fetch event - serve from cache when possible
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version or fetch from network
        return response || fetch(event.request);
      }
    )
  );
});

// Push event - handle incoming push notifications
self.addEventListener('push', (event) => {
  console.log('Push notification received:', event);

  let notificationData = {
    title: 'Mentara',
    body: 'You have a new message',
    icon: '/icon-192x192.png',
    badge: '/badge-72x72.png',
    tag: 'mentara-notification',
    requireInteraction: false,
    silent: false,
    data: {
      url: '/user/messages'
    }
  };

  // Parse notification data from push event
  if (event.data) {
    try {
      const pushData = event.data.json();
      notificationData = {
        ...notificationData,
        ...pushData,
        data: {
          url: pushData.url || '/user/messages',
          conversationId: pushData.conversationId,
          messageId: pushData.messageId,
          senderId: pushData.senderId,
          ...pushData.data
        }
      };
    } catch (error) {
      console.error('Error parsing push data:', error);
    }
  }

  // Show the notification
  const notificationPromise = self.registration.showNotification(
    notificationData.title,
    {
      body: notificationData.body,
      icon: notificationData.icon,
      badge: notificationData.badge,
      tag: notificationData.tag,
      requireInteraction: notificationData.requireInteraction,
      silent: notificationData.silent,
      data: notificationData.data,
      actions: [
        {
          action: 'open',
          title: 'Open Message',
          icon: '/icon-open.png'
        },
        {
          action: 'close',
          title: 'Dismiss',
          icon: '/icon-close.png'
        }
      ]
    }
  );

  event.waitUntil(notificationPromise);
});

// Notification click event - handle user interaction
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event);

  event.notification.close();

  if (event.action === 'close') {
    // User dismissed the notification
    return;
  }

  // Default action or 'open' action
  const urlToOpen = event.notification.data?.url || '/user/messages';
  const conversationId = event.notification.data?.conversationId;

  // Build the URL with query parameters if needed
  let targetUrl = urlToOpen;
  if (conversationId) {
    const url = new URL(urlToOpen, self.location.origin);
    url.searchParams.set('conversation', conversationId);
    targetUrl = url.toString();
  }

  // Open the app and navigate to the relevant page
  const openPromise = clients.matchAll({
    type: 'window',
    includeUncontrolled: true
  }).then((clientList) => {
    // Check if app is already open
    for (let i = 0; i < clientList.length; i++) {
      const client = clientList[i];
      if (client.url.includes(self.location.origin)) {
        // Focus existing window and navigate
        client.focus();
        client.postMessage({
          type: 'NAVIGATE',
          url: targetUrl,
          conversationId: conversationId,
          source: 'push-notification'
        });
        return;
      }
    }

    // Open new window if app is not open
    return clients.openWindow(targetUrl);
  });

  event.waitUntil(openPromise);
});

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

  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  if (event.data && event.data.type === 'QUEUE_OFFLINE_MESSAGE') {
    // Queue message for sending when online
    queueOfflineMessage(event.data.message);
  }
});

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