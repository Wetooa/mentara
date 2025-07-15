/**
 * Push Notifications Service
 * Handles registration, subscription, and management of push notifications
 */

export interface PushSubscriptionData {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

export interface NotificationPermissionResult {
  granted: boolean;
  denied: boolean;
  default: boolean;
  error?: string;
}

class PushNotificationService {
  private vapidPublicKey: string;
  private serviceWorkerRegistration: ServiceWorkerRegistration | null = null;
  private pushSubscription: PushSubscription | null = null;

  constructor() {
    // In production, this should come from environment variables
    this.vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '';
  }

  /**
   * Initialize push notification service
   */
  async initialize(): Promise<boolean> {
    try {
      // Check if service workers are supported
      if (!('serviceWorker' in navigator)) {
        console.warn('Service workers not supported');
        return false;
      }

      // Check if push notifications are supported
      if (!('PushManager' in window)) {
        console.warn('Push notifications not supported');
        return false;
      }

      // Register service worker
      await this.registerServiceWorker();
      
      // Set up message listener for navigation from notifications
      this.setupMessageListener();

      return true;
    } catch (error) {
      console.error('Failed to initialize push notifications:', error);
      return false;
    }
  }

  /**
   * Register service worker
   */
  private async registerServiceWorker(): Promise<void> {
    try {
      this.serviceWorkerRegistration = await navigator.serviceWorker.register('/sw.js');
      console.log('Service worker registered successfully');

      // Wait for service worker to be ready
      await navigator.serviceWorker.ready;
    } catch (error) {
      console.error('Service worker registration failed:', error);
      throw error;
    }
  }

  /**
   * Request notification permission from user
   */
  async requestPermission(): Promise<NotificationPermissionResult> {
    try {
      if (!('Notification' in window)) {
        return {
          granted: false,
          denied: true,
          default: false,
          error: 'Notifications not supported'
        };
      }

      let permission = Notification.permission;

      // Request permission if not already granted or denied
      if (permission === 'default') {
        permission = await Notification.requestPermission();
      }

      return {
        granted: permission === 'granted',
        denied: permission === 'denied',
        default: permission === 'default'
      };
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return {
        granted: false,
        denied: true,
        default: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Subscribe to push notifications
   */
  async subscribeToPush(): Promise<PushSubscriptionData | null> {
    try {
      if (!this.serviceWorkerRegistration) {
        throw new Error('Service worker not registered');
      }

      if (!this.vapidPublicKey) {
        throw new Error('VAPID public key not configured');
      }

      // Check for existing subscription
      this.pushSubscription = await this.serviceWorkerRegistration.pushManager.getSubscription();

      if (!this.pushSubscription) {
        // Create new subscription
        this.pushSubscription = await this.serviceWorkerRegistration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: this.urlBase64ToUint8Array(this.vapidPublicKey)
        });
      }

      // Convert subscription to serializable format
      const subscriptionData: PushSubscriptionData = {
        endpoint: this.pushSubscription.endpoint,
        keys: {
          p256dh: this.arrayBufferToBase64(this.pushSubscription.getKey('p256dh')!),
          auth: this.arrayBufferToBase64(this.pushSubscription.getKey('auth')!)
        }
      };

      console.log('Push subscription created:', subscriptionData);
      return subscriptionData;
    } catch (error) {
      console.error('Failed to subscribe to push notifications:', error);
      return null;
    }
  }

  /**
   * Unsubscribe from push notifications
   */
  async unsubscribeFromPush(): Promise<boolean> {
    try {
      if (!this.serviceWorkerRegistration) {
        return false;
      }

      const subscription = await this.serviceWorkerRegistration.pushManager.getSubscription();
      
      if (subscription) {
        const result = await subscription.unsubscribe();
        this.pushSubscription = null;
        console.log('Unsubscribed from push notifications');
        return result;
      }

      return true;
    } catch (error) {
      console.error('Failed to unsubscribe from push notifications:', error);
      return false;
    }
  }

  /**
   * Get current push subscription
   */
  async getCurrentSubscription(): Promise<PushSubscriptionData | null> {
    try {
      if (!this.serviceWorkerRegistration) {
        return null;
      }

      const subscription = await this.serviceWorkerRegistration.pushManager.getSubscription();
      
      if (!subscription) {
        return null;
      }

      return {
        endpoint: subscription.endpoint,
        keys: {
          p256dh: this.arrayBufferToBase64(subscription.getKey('p256dh')!),
          auth: this.arrayBufferToBase64(subscription.getKey('auth')!)
        }
      };
    } catch (error) {
      console.error('Failed to get current subscription:', error);
      return null;
    }
  }

  /**
   * Check if push notifications are enabled
   */
  async isSubscribed(): Promise<boolean> {
    try {
      const subscription = await this.getCurrentSubscription();
      return subscription !== null;
    } catch (error) {
      console.error('Failed to check subscription status:', error);
      return false;
    }
  }

  /**
   * Send push subscription to server
   */
  async sendSubscriptionToServer(subscriptionData: PushSubscriptionData, userId: string): Promise<boolean> {
    try {
      const response = await fetch('/api/push-notifications/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subscription: subscriptionData,
          userId: userId
        })
      });

      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}`);
      }

      console.log('Push subscription sent to server successfully');
      return true;
    } catch (error) {
      console.error('Failed to send subscription to server:', error);
      return false;
    }
  }

  /**
   * Remove push subscription from server
   */
  async removeSubscriptionFromServer(userId: string): Promise<boolean> {
    try {
      const response = await fetch('/api/push-notifications/unsubscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: userId
        })
      });

      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}`);
      }

      console.log('Push subscription removed from server successfully');
      return true;
    } catch (error) {
      console.error('Failed to remove subscription from server:', error);
      return false;
    }
  }

  /**
   * Show a local notification (for testing)
   */
  async showLocalNotification(title: string, body: string, data?: unknown): Promise<void> {
    try {
      if (!this.serviceWorkerRegistration) {
        throw new Error('Service worker not registered');
      }

      await this.serviceWorkerRegistration.showNotification(title, {
        body,
        icon: '/icon-192x192.png',
        badge: '/badge-72x72.png',
        tag: 'mentara-local-notification',
        data: data || {}
      });
    } catch (error) {
      console.error('Failed to show local notification:', error);
    }
  }

  /**
   * Set up message listener for service worker communication
   */
  private setupMessageListener(): void {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', (event) => {
        console.log('Received message from service worker:', event.data);

        if (event.data && event.data.type === 'NAVIGATE') {
          // Handle navigation from push notification
          window.location.href = event.data.url;
        }
      });
    }
  }

  /**
   * Convert URL-safe base64 to Uint8Array
   */
  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/\-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  /**
   * Convert ArrayBuffer to base64
   */
  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  }
}

// Export singleton instance
export const pushNotificationService = new PushNotificationService();

// Export utility functions for React components
export const usePushNotifications = () => {
  const [isSupported, setIsSupported] = React.useState(false);
  const [isSubscribed, setIsSubscribed] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);

  React.useEffect(() => {
    const checkSupport = async () => {
      const supported = await pushNotificationService.initialize();
      setIsSupported(supported);

      if (supported) {
        const subscribed = await pushNotificationService.isSubscribed();
        setIsSubscribed(subscribed);
      }
    };

    checkSupport();
  }, []);

  const subscribe = async (userId: string) => {
    setIsLoading(true);
    try {
      const permission = await pushNotificationService.requestPermission();
      
      if (!permission.granted) {
        throw new Error('Permission not granted');
      }

      const subscriptionData = await pushNotificationService.subscribeToPush();
      
      if (!subscriptionData) {
        throw new Error('Failed to create subscription');
      }

      const success = await pushNotificationService.sendSubscriptionToServer(subscriptionData, userId);
      
      if (success) {
        setIsSubscribed(true);
      }

      return success;
    } catch (error) {
      console.error('Failed to subscribe to push notifications:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const unsubscribe = async (userId: string) => {
    setIsLoading(true);
    try {
      const success = await pushNotificationService.unsubscribeFromPush();
      
      if (success) {
        await pushNotificationService.removeSubscriptionFromServer(userId);
        setIsSubscribed(false);
      }

      return success;
    } catch (error) {
      console.error('Failed to unsubscribe from push notifications:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isSupported,
    isSubscribed,
    isLoading,
    subscribe,
    unsubscribe,
    showLocalNotification: pushNotificationService.showLocalNotification.bind(pushNotificationService)
  };
};

import React from 'react';