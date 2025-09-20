"use client";

import React, { ReactNode, useEffect, useRef } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
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
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { startLoading, completeLoading, updateProgress } = useGlobalLoadingStore();
  
  // Refs to track navigation state
  const navigationId = useRef<string | null>(null);
  const progressInterval = useRef<NodeJS.Timeout | null>(null);
  const isNavigating = useRef<boolean>(false);
  const lastPath = useRef<string>(pathname);

  // Helper functions for navigation loading
  const startNavigationLoading = () => {
    if (isNavigating.current) return;
    
    isNavigating.current = true;
    navigationId.current = `navigation-${Date.now()}`;
    
    startLoading(navigationId.current, 'navigation', {
      message: 'Loading page...',
      expectedDuration: 1500,
    });

    // Simulate realistic progress during navigation
    let progress = 0;
    progressInterval.current = setInterval(() => {
      progress += Math.random() * 12 + 8; // Random progress between 8-20%
      if (progress < 85) {
        updateProgress(navigationId.current!, Math.min(progress, 85));
      }
    }, 120);

    if (process.env.NODE_ENV === 'development') {
      console.log('🚀 Navigation loading started:', navigationId.current);
    }
  };

  const completeNavigationLoading = () => {
    if (!isNavigating.current || !navigationId.current) return;
    
    if (progressInterval.current) {
      clearInterval(progressInterval.current);
      progressInterval.current = null;
    }
    
    // Complete with 100% progress
    updateProgress(navigationId.current, 100);
    
    // Small delay for visual feedback, then complete
    setTimeout(() => {
      if (navigationId.current) {
        completeLoading(navigationId.current);
        if (process.env.NODE_ENV === 'development') {
          console.log('✅ Navigation loading completed:', navigationId.current);
        }
        navigationId.current = null;
      }
      isNavigating.current = false;
    }, 150);
  };

  const errorNavigationLoading = (error?: string) => {
    if (!isNavigating.current || !navigationId.current) return;
    
    if (progressInterval.current) {
      clearInterval(progressInterval.current);
      progressInterval.current = null;
    }
    
    useGlobalLoadingStore.getState().errorLoading(
      navigationId.current, 
      error || 'Navigation failed'
    );
    
    if (process.env.NODE_ENV === 'development') {
      console.error('❌ Navigation loading failed:', navigationId.current, error);
    }
    
    navigationId.current = null;
    isNavigating.current = false;
  };

  // Monitor pathname changes for navigation loading
  useEffect(() => {
    const currentPath = pathname + searchParams.toString();
    
    // Skip initial mount
    if (lastPath.current === pathname) {
      lastPath.current = currentPath;
      return;
    }
    
    // Route change detected
    if (lastPath.current !== currentPath) {
      startNavigationLoading();
      
      // Update last path
      lastPath.current = currentPath;
      
      // Complete loading after a short delay (simulating page load)
      const completeTimer = setTimeout(() => {
        completeNavigationLoading();
      }, 800 + Math.random() * 400); // 800-1200ms
      
      return () => {
        clearTimeout(completeTimer);
      };
    }
  }, [pathname, searchParams]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
      }
      if (navigationId.current) {
        completeLoading(navigationId.current);
      }
    };
  }, [completeLoading]);

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