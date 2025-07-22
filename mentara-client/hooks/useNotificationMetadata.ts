import { useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { useApi } from "@/lib/api";
import { updateTitleWithNotifications, NotificationData } from "@/lib/metadata";

interface UseNotificationMetadataOptions {
  baseTitle?: string;
  enabled?: boolean;
  updateFavicon?: boolean;
  updatePageTitle?: boolean;
  blinkDuration?: number;
}

interface NotificationMetadataHook {
  notificationData: NotificationData | null;
  isLoading: boolean;
  error: Error | null;
  updateTitle: (customTitle?: string) => void;
  resetTitle: () => void;
}

/**
 * Hook for managing notification-enhanced metadata
 * Updates page title and optionally favicon based on notification data
 */
export function useNotificationMetadata(
  options: UseNotificationMetadataOptions = {}
): NotificationMetadataHook {
  const {
    baseTitle = document.title,
    enabled = true,
    updateFavicon = true,
    updatePageTitle = true,
    blinkDuration = 2000,
  } = options;

  const api = useApi();
  const originalTitle = useRef<string>(baseTitle);
  const originalFavicon = useRef<string | null>(null);
  const blinkTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch notification data
  const {
    data: notificationData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["notifications", "metadata"],
    queryFn: async (): Promise<NotificationData> => {
      try {
        const notifications = await api.notifications.getMy({ isRead: false });
        
        const unreadCount = notifications.length;
        const hasUrgent = notifications.some(n => 
          n.priority === "HIGH" || n.priority === "URGENT" ||
          n.type === "SECURITY_ALERT" || n.type === "PAYMENT_FAILED"
        );
        
        // Simplified notification data (no complex type tracking)
        return {
          unreadCount,
          hasUrgent,
        };
      } catch (error) {
        console.error("Failed to fetch notification metadata:", error);
        return {
          unreadCount: 0,
          hasUrgent: false,
        };
      }
    },
    enabled,
    refetchInterval: 30000, // Refetch every 30 seconds
    refetchIntervalInBackground: true,
    staleTime: 15000, // Consider data stale after 15 seconds
  });

  // Store original favicon on mount
  useEffect(() => {
    if (!originalFavicon.current) {
      const faviconElement = document.querySelector('link[rel="icon"]') as HTMLLinkElement;
      originalFavicon.current = faviconElement?.href || "/favicon/favicon.ico";
    }
  }, []);

  // Update page title based on notification data
  const updateTitle = (customTitle?: string) => {
    if (!updatePageTitle || !notificationData) return;

    const titleToUpdate = customTitle || originalTitle.current;
    const newTitle = updateTitleWithNotifications(titleToUpdate, notificationData);
    
    if (document.title !== newTitle) {
      document.title = newTitle;
    }
  };

  // Reset title to original
  const resetTitle = () => {
    if (updatePageTitle) {
      document.title = originalTitle.current;
    }
  };

  // Update favicon based on notification status
  const updateFaviconWithNotifications = (data: NotificationData) => {
    if (!updateFavicon) return;

    const faviconElement = document.querySelector('link[rel="icon"]') as HTMLLinkElement;
    if (!faviconElement) return;

    if (data.unreadCount > 0) {
      // Create notification badge favicon
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      canvas.width = 32;
      canvas.height = 32;

      // Draw base favicon background
      ctx.fillStyle = data.hasUrgent ? "#ef4444" : "#22c55e"; // Red for urgent, green for normal
      ctx.fillRect(0, 0, 32, 32);

      // Draw notification count
      ctx.fillStyle = "white";
      ctx.font = "bold 18px Arial";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      
      const displayCount = data.unreadCount > 99 ? "99+" : data.unreadCount.toString();
      ctx.fillText(displayCount, 16, 16);

      // Update favicon
      faviconElement.href = canvas.toDataURL("image/png");

      // Add blinking effect for urgent notifications
      if (data.hasUrgent) {
        startFaviconBlink();
      }
    } else {
      // Reset to original favicon
      if (originalFavicon.current) {
        faviconElement.href = originalFavicon.current;
      }
      stopFaviconBlink();
    }
  };

  // Blinking effect for urgent notifications
  const startFaviconBlink = () => {
    if (blinkTimeoutRef.current) return; // Already blinking

    let isVisible = true;
    const faviconElement = document.querySelector('link[rel="icon"]') as HTMLLinkElement;
    const originalHref = faviconElement?.href;

    const blink = () => {
      if (!faviconElement || !notificationData?.hasUrgent) {
        stopFaviconBlink();
        return;
      }

      isVisible = !isVisible;
      faviconElement.href = isVisible ? originalHref || "" : "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg=="; // Transparent pixel

      blinkTimeoutRef.current = setTimeout(blink, 500); // Blink every 500ms
    };

    // Stop blinking after specified duration
    setTimeout(stopFaviconBlink, blinkDuration);
    blink();
  };

  const stopFaviconBlink = () => {
    if (blinkTimeoutRef.current) {
      clearTimeout(blinkTimeoutRef.current);
      blinkTimeoutRef.current = null;
    }
  };

  // Update metadata when notification data changes
  useEffect(() => {
    if (notificationData) {
      updateTitle();
      updateFaviconWithNotifications(notificationData);
    }
  }, [notificationData, updatePageTitle, updateFavicon]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopFaviconBlink();
      resetTitle();
      
      // Reset favicon
      if (updateFavicon && originalFavicon.current) {
        const faviconElement = document.querySelector('link[rel="icon"]') as HTMLLinkElement;
        if (faviconElement) {
          faviconElement.href = originalFavicon.current;
        }
      }
    };
  }, []);

  return {
    notificationData,
    isLoading,
    error,
    updateTitle,
    resetTitle,
  };
}

/**
 * Hook for dashboard pages that need notification-enhanced titles
 */
export function useDashboardNotificationMetadata(role: "client" | "therapist" | "admin" | "moderator") {
  const baseTitle = `${role.charAt(0).toUpperCase() + role.slice(1)} Dashboard - Mentara`;
  
  return useNotificationMetadata({
    baseTitle,
    enabled: true,
    updateFavicon: true,
    updatePageTitle: true,
  });
}

/**
 * Hook for message/chat pages with enhanced notification handling
 */
export function useMessagingNotificationMetadata() {
  const baseTitle = "Messages - Mentara";
  
  return useNotificationMetadata({
    baseTitle,
    enabled: true,
    updateFavicon: true,
    updatePageTitle: true,
    blinkDuration: 3000, // Longer blink for messages
  });
}