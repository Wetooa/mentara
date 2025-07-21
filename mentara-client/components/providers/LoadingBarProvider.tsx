"use client";

import React, { ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import GlobalLoadingBar from '@/components/ui/global-loading-bar';
import { useGlobalLoadingStore } from '@/store/loading/globalLoadingStore';

interface LoadingBarProviderProps {
  children: ReactNode;
  showLoadingBar?: boolean;
  loadingBarProps?: {
    height?: number;
    color?: 'green' | 'blue' | 'red' | 'yellow';
    position?: 'top' | 'bottom';
    showPercentage?: boolean;
    minimumDuration?: number;
  };
}

export const LoadingBarProvider: React.FC<LoadingBarProviderProps> = ({
  children,
  showLoadingBar = true,
  loadingBarProps = {},
}) => {
  const router = useRouter();
  const { startLoading, completeLoading, updateProgress } = useGlobalLoadingStore();

  // Track navigation loading
  useEffect(() => {
    let navigationId: string | null = null;
    let progressInterval: NodeJS.Timeout | null = null;

    const handleRouteChangeStart = () => {
      // Clear any existing navigation loading
      if (navigationId) {
        completeLoading(navigationId);
      }
      
      navigationId = `navigation-${Date.now()}`;
      startLoading(navigationId, 'navigation', {
        message: 'Loading page...',
        expectedDuration: 2000, // 2 seconds expected navigation time
      });

      // Simulate realistic progress during navigation
      let progress = 0;
      progressInterval = setInterval(() => {
        progress += Math.random() * 15 + 5; // Random progress between 5-20%
        if (progress < 80) {
          updateProgress(navigationId!, Math.min(progress, 80));
        }
      }, 100);
    };

    const handleRouteChangeComplete = () => {
      if (progressInterval) {
        clearInterval(progressInterval);
        progressInterval = null;
      }
      
      if (navigationId) {
        // Complete navigation loading
        updateProgress(navigationId, 100);
        completeLoading(navigationId);
        navigationId = null;
      }
    };

    const handleRouteChangeError = () => {
      if (progressInterval) {
        clearInterval(progressInterval);
        progressInterval = null;
      }
      
      if (navigationId) {
        // Mark navigation as error
        useGlobalLoadingStore.getState().errorLoading(navigationId, 'Failed to load page');
        navigationId = null;
      }
    };

    // Note: Next.js 13+ App Router doesn't have built-in route change events
    // We'll need to implement this differently or hook into the specific navigation triggers
    // For now, we'll set up the infrastructure

    return () => {
      if (progressInterval) {
        clearInterval(progressInterval);
      }
      if (navigationId) {
        completeLoading(navigationId);
      }
    };
  }, [router, startLoading, completeLoading, updateProgress]);

  // Handle window focus/blur for pause/resume functionality
  useEffect(() => {
    const handleVisibilityChange = () => {
      const state = useGlobalLoadingStore.getState();
      
      if (document.hidden) {
        // Page is hidden - we might want to pause some operations
        // For now, we'll just let them continue
      } else {
        // Page is visible again - resume operations
        // This could be used to refresh stale data
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // Handle beforeunload to clean up operations
  useEffect(() => {
    const handleBeforeUnload = () => {
      // Clear all loading operations on page unload
      useGlobalLoadingStore.getState().clearAll();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  return (
    <>
      {/* Render the global loading bar */}
      {showLoadingBar && (
        <GlobalLoadingBar
          height={4}
          color="green"
          position="top"
          showPercentage={false}
          minimumDuration={300}
          {...loadingBarProps}
        />
      )}
      
      {/* Render children */}
      {children}
    </>
  );
};

export default LoadingBarProvider;