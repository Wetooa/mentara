import { useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { useApi } from "@/lib/api";

interface SimplePageMetadataOptions {
  pageName: string;
  enabled?: boolean;
}

interface SimplePageMetadataReturn {
  isLoading: boolean;
  error: Error | null;
  hasNotifications: boolean;
  unreadCount: number;
}

/**
 * Simplified hook for managing page metadata
 * - Simple title format: "Mentara | [Page Name]"
 * - Simple favicon: Original favicon with green dot overlay when notifications exist
 */
export function useSimplePageMetadata(
  options: SimplePageMetadataOptions
): SimplePageMetadataReturn {
  const { pageName, enabled = true } = options;
  const api = useApi();
  const originalFaviconRef = useRef<string | null>(null);

  // Fetch notification count (simple approach)
  const {
    data: notificationCount,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["notifications", "simple-count"],
    queryFn: async (): Promise<number> => {
      try {
        const notifications = await api.notifications.getMy({ isRead: false });
        return notifications.length;
      } catch (error) {
        console.error("Failed to fetch notification count:", error);
        return 0;
      }
    },
    enabled,
    refetchInterval: 30000, // Refetch every 30 seconds
    refetchIntervalInBackground: true,
    staleTime: 15000, // Consider data stale after 15 seconds
  });

  const unreadCount = notificationCount || 0;
  const hasNotifications = unreadCount > 0;

  // Store original favicon on mount
  useEffect(() => {
    if (!originalFaviconRef.current) {
      const faviconElement = document.querySelector('link[rel="icon"]') as HTMLLinkElement;
      originalFaviconRef.current = faviconElement?.href || "/favicon.ico";
    }
  }, []);

  // Update page title with simple format
  useEffect(() => {
    document.title = `Mentara | ${pageName}`;
  }, [pageName]);

  // Update favicon with simple approach (original + green dot overlay)
  useEffect(() => {
    if (!enabled) return;

    const faviconElement = document.querySelector('link[rel="icon"]') as HTMLLinkElement;
    if (!faviconElement) return;

    if (hasNotifications) {
      // Use favicon with green dot overlay
      faviconElement.href = "/favicon-notification.ico";
    } else {
      // Use original favicon
      faviconElement.href = originalFaviconRef.current || "/favicon.ico";
    }
  }, [hasNotifications, enabled]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Reset to original favicon
      if (originalFaviconRef.current) {
        const faviconElement = document.querySelector('link[rel="icon"]') as HTMLLinkElement;
        if (faviconElement) {
          faviconElement.href = originalFaviconRef.current;
        }
      }
    };
  }, []);

  return {
    isLoading,
    error,
    hasNotifications,
    unreadCount,
  };
}