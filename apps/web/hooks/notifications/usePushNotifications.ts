'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useApi } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface PushSubscriptionData {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
  expirationTime?: number | null;
}

interface PushNotificationState {
  isSupported: boolean;
  hasPermission: boolean;
  isSubscribed: boolean;
  isRegistering: boolean;
  isLoading: boolean;
  error: string | null;
  subscription: PushSubscription | null;
  registration: ServiceWorkerRegistration | null;
}

interface PushNotificationConfig {
  enabled: boolean;
  categories: {
    messages: boolean;
    community: boolean;
    billing: boolean;
    therapy: boolean;
    system: boolean;
  };
  quietHours: {
    enabled: boolean;
    start: string; // HH:MM format
    end: string;   // HH:MM format
  };
  sound: boolean;
  vibration: boolean;
}

const defaultConfig: PushNotificationConfig = {
  enabled: false,
  categories: {
    messages: true,
    community: true,
    billing: true,
    therapy: true,
    system: true,
  },
  quietHours: {
    enabled: false,
    start: '22:00',
    end: '08:00',
  },
  sound: true,
  vibration: true,
};

export function usePushNotifications() {
  const api = useApi();
  const { user, accessToken } = useAuth();
  const queryClient = useQueryClient();
  
  const [state, setState] = useState<PushNotificationState>({
    isSupported: false,
    hasPermission: false,
    isSubscribed: false,
    isRegistering: false,
    isLoading: true,
    error: null,
    subscription: null,
    registration: null,
  });

  const [config, setConfig] = useState<PushNotificationConfig>(defaultConfig);
  const initializationAttempted = useRef(false);

  // Check browser support
  const checkSupport = useCallback(() => {
    if (typeof window === 'undefined') return false;
    
    return !!(
      'serviceWorker' in navigator &&
      'PushManager' in window &&
      'Notification' in window &&
      'fetch' in window
    );
  }, []);

  // Check notification permission
  const checkPermission = useCallback(() => {
    if (!checkSupport()) return false;
    return Notification.permission === 'granted';
  }, [checkSupport]);

  // Request notification permission
  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!checkSupport()) {
      setState(prev => ({ ...prev, error: 'Push notifications not supported' }));
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      const hasPermission = permission === 'granted';
      
      setState(prev => ({ ...prev, hasPermission, error: null }));
      
      if (hasPermission) {
        toast.success('Push notifications enabled!');
      } else {
        toast.error('Push notifications permission denied');
      }
      
      return hasPermission;
    } catch (error) {
      console.error('Failed to request notification permission:', error);
      setState(prev => ({ ...prev, error: 'Failed to request permission' }));
      return false;
    }
  }, [checkSupport]);

  // Register service worker
  const registerServiceWorker = useCallback(async (): Promise<ServiceWorkerRegistration | null> => {
    if (!checkSupport()) return null;

    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
        updateViaCache: 'none'
      });

      console.log('Service worker registered successfully');
      
      // Wait for service worker to be ready
      await navigator.serviceWorker.ready;
      
      setState(prev => ({ ...prev, registration, error: null }));
      return registration;
    } catch (error) {
      console.error('Failed to register service worker:', error);
      setState(prev => ({ ...prev, error: 'Failed to register service worker' }));
      return null;
    }
  }, [checkSupport]);

  // Get or create push subscription
  const subscribeToPush = useCallback(async (): Promise<PushSubscription | null> => {
    if (!state.registration || !state.hasPermission) return null;

    try {
      setState(prev => ({ ...prev, isRegistering: true, error: null }));

      // Check for existing subscription
      let subscription = await state.registration.pushManager.getSubscription();
      
      if (!subscription) {
        // Create new subscription
        const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
        if (!vapidPublicKey) {
          throw new Error('VAPID public key not configured');
        }

        subscription = await state.registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
        });
      }

      // Send subscription to server
      if (subscription) {
        await savePushSubscription(subscription);
        setState(prev => ({ 
          ...prev, 
          subscription, 
          isSubscribed: true, 
          isRegistering: false,
          error: null 
        }));
        
        toast.success('Push notifications configured successfully!');
      }

      return subscription;
    } catch (error) {
      console.error('Failed to subscribe to push notifications:', error);
      setState(prev => ({ 
        ...prev, 
        error: 'Failed to setup push notifications',
        isRegistering: false 
      }));
      return null;
    }
  }, [state.registration, state.hasPermission]);

  // Unsubscribe from push notifications
  const unsubscribeFromPush = useCallback(async (): Promise<boolean> => {
    if (!state.subscription) return true;

    try {
      // Unsubscribe from browser
      const success = await state.subscription.unsubscribe();
      
      if (success) {
        // Remove subscription from server
        await removePushSubscription();
        
        setState(prev => ({ 
          ...prev, 
          subscription: null, 
          isSubscribed: false,
          error: null 
        }));
        
        toast.success('Push notifications disabled');
      }
      
      return success;
    } catch (error) {
      console.error('Failed to unsubscribe from push notifications:', error);
      setState(prev => ({ ...prev, error: 'Failed to disable push notifications' }));
      return false;
    }
  }, [state.subscription]);

  // Save push subscription to server
  const savePushSubscription = useCallback(async (subscription: PushSubscription) => {
    const subscriptionData: PushSubscriptionData = {
      endpoint: subscription.endpoint,
      keys: {
        p256dh: arrayBufferToBase64(subscription.getKey('p256dh')!),
        auth: arrayBufferToBase64(subscription.getKey('auth')!),
      },
      expirationTime: subscription.expirationTime,
    };

    try {
      await api.notifications.savePushSubscription(subscriptionData);
    } catch (error) {
      console.error('Failed to save push subscription to server:', error);
      throw error;
    }
  }, [api]);

  // Remove push subscription from server
  const removePushSubscription = useCallback(async () => {
    try {
      await api.notifications.removePushSubscription();
    } catch (error) {
      console.error('Failed to remove push subscription from server:', error);
      throw error;
    }
  }, [api]);

  // Update notification configuration
  const updateConfig = useCallback(async (newConfig: Partial<PushNotificationConfig>) => {
    const updatedConfig = { ...config, ...newConfig };
    
    try {
      await api.notifications.updatePushConfig(updatedConfig);
      setConfig(updatedConfig);
      
      // Store in localStorage for offline access
      localStorage.setItem('pushNotificationConfig', JSON.stringify(updatedConfig));
      
      toast.success('Notification preferences updated');
    } catch (error) {
      console.error('Failed to update notification config:', error);
      toast.error('Failed to update preferences');
    }
  }, [config, api]);

  // Load configuration from server or localStorage
  const loadConfig = useCallback(async () => {
    try {
      // Try to load from server first
      const serverConfig = await api.notifications.getPushConfig();
      setConfig(serverConfig);
    } catch (error) {
      // Fallback to localStorage
      const localConfig = localStorage.getItem('pushNotificationConfig');
      if (localConfig) {
        try {
          setConfig(JSON.parse(localConfig));
        } catch (parseError) {
          console.error('Failed to parse local notification config:', parseError);
        }
      }
    }
  }, [api]);

  // Test push notification
  const testNotification = useCallback(async () => {
    if (!state.hasPermission) {
      toast.error('Notification permission not granted');
      return;
    }

    try {
      // Send test notification through service worker
      if (state.registration && state.registration.active) {
        state.registration.active.postMessage({
          type: 'TEST_NOTIFICATION',
          data: {
            title: 'Test Notification',
            message: 'Push notifications are working correctly!',
            icon: '/icons/notification-icon.png',
            badge: '/icons/notification-badge.png',
          }
        });
      } else {
        // Fallback to browser notification
        new Notification('Test Notification', {
          body: 'Push notifications are working correctly!',
          icon: '/icons/notification-icon.png',
          badge: '/icons/notification-badge.png',
        });
      }
    } catch (error) {
      console.error('Failed to send test notification:', error);
      toast.error('Failed to send test notification');
    }
  }, [state.hasPermission, state.registration]);

  // Initialize push notifications
  const initialize = useCallback(async () => {
    if (initializationAttempted.current || !user || !accessToken) return;
    
    initializationAttempted.current = true;
    setState(prev => ({ ...prev, isLoading: true }));

    try {
      const isSupported = checkSupport();
      const hasPermission = checkPermission();
      
      setState(prev => ({ 
        ...prev, 
        isSupported, 
        hasPermission,
      }));

      if (isSupported) {
        // Load configuration
        await loadConfig();
        
        // Register service worker
        const registration = await registerServiceWorker();
        
        if (registration && hasPermission) {
          // Check for existing subscription
          const existingSubscription = await registration.pushManager.getSubscription();
          
          setState(prev => ({ 
            ...prev, 
            subscription: existingSubscription,
            isSubscribed: !!existingSubscription,
          }));
        }
      }
    } catch (error) {
      console.error('Failed to initialize push notifications:', error);
      setState(prev => ({ ...prev, error: 'Initialization failed' }));
    } finally {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, [user, accessToken, checkSupport, checkPermission, loadConfig, registerServiceWorker]);

  // Auto-initialize when user is available
  useEffect(() => {
    if (user && accessToken && !initializationAttempted.current) {
      initialize();
    }
  }, [user, accessToken, initialize]);

  // Handle service worker updates
  useEffect(() => {
    if (state.registration) {
      const handleUpdate = () => {
        toast.info('App update available. Refresh to get the latest version.');
      };

      state.registration.addEventListener('updatefound', handleUpdate);
      
      return () => {
        state.registration.removeEventListener('updatefound', handleUpdate);
      };
    }
  }, [state.registration]);

  // Enable push notifications (request permission and subscribe)
  const enablePushNotifications = useCallback(async (): Promise<boolean> => {
    try {
      const hasPermission = await requestPermission();
      if (!hasPermission) return false;

      const subscription = await subscribeToPush();
      if (!subscription) return false;

      await updateConfig({ enabled: true });
      return true;
    } catch (error) {
      console.error('Failed to enable push notifications:', error);
      return false;
    }
  }, [requestPermission, subscribeToPush, updateConfig]);

  // Disable push notifications
  const disablePushNotifications = useCallback(async (): Promise<boolean> => {
    try {
      await unsubscribeFromPush();
      await updateConfig({ enabled: false });
      return true;
    } catch (error) {
      console.error('Failed to disable push notifications:', error);
      return false;
    }
  }, [unsubscribeFromPush, updateConfig]);

  return {
    // State
    ...state,
    config,
    
    // Actions
    enablePushNotifications,
    disablePushNotifications,
    requestPermission,
    testNotification,
    updateConfig,
    
    // Advanced control
    subscribeToPush,
    unsubscribeFromPush,
    registerServiceWorker,
    
    // Utilities
    canEnable: state.isSupported && !state.isSubscribed,
    isConfigured: state.isSupported && state.hasPermission && state.isSubscribed,
    needsPermission: state.isSupported && !state.hasPermission,
  };
}

// Utility functions
function urlBase64ToUint8Array(base64String: string): Uint8Array {
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

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  bytes.forEach(byte => binary += String.fromCharCode(byte));
  return window.btoa(binary);
}