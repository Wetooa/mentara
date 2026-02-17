"use client";

import { useCallback, useEffect } from 'react';
import { useGlobalLoadingStore } from '@/store/loading/globalLoadingStore';
import { LoadingType } from '@/store/loading/types';

/**
 * Development-only hook for debugging and testing the global loading system
 * 
 * Usage:
 * ```tsx
 * const debugger = useLoadingDebugger();
 * 
 * // Trigger test loading
 * debugger.testAuthLoading();
 * debugger.testNavigationLoading();
 * debugger.testMultipleOperations();
 * 
 * // Get current state
 * console.log(debugger.getCurrentState());
 * ```
 */
export const useLoadingDebugger = () => {
  const store = useGlobalLoadingStore();

  // Log state changes in development
  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') return;

    const unsubscribe = store.subscribe((state) => {
      const activeOps = Object.values(state.operations).filter(op => op.state === 'loading');
      
      if (activeOps.length > 0) {
        console.group('🔄 Loading Operations Active');
        activeOps.forEach(op => {
          console.log(`📋 ${op.type.toUpperCase()}: ${op.id} (${op.progress}%) - ${op.message || 'No message'}`);
        });
        console.log(`📊 Aggregated Progress: ${state.aggregatedProgress}%`);
        console.log(`🎯 Primary Operation: ${state.primaryOperation || 'None'}`);
        console.log(`👀 Visible: ${state.isVisible ? '✅' : '❌'}`);
        console.groupEnd();
      }
    });

    return unsubscribe;
  }, [store]);

  const testAuthLoading = useCallback((duration: number = 3000) => {
    if (process.env.NODE_ENV !== 'development') {
      console.warn('useLoadingDebugger: testAuthLoading is only available in development');
      return;
    }

    console.log('🧪 Testing Auth Loading...');
    const id = `debug-auth-${Date.now()}`;
    
    store.startLoading(id, 'auth', {
      message: 'Testing authentication loading...',
      expectedDuration: duration,
    });

    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      store.updateProgress(id, Math.min(progress, 90));
      
      if (progress >= 90) {
        clearInterval(interval);
        setTimeout(() => {
          store.updateProgress(id, 100);
          setTimeout(() => store.completeLoading(id), 200);
        }, 500);
      }
    }, duration / 10);

    return () => {
      clearInterval(interval);
      store.completeLoading(id);
    };
  }, [store]);

  const testNavigationLoading = useCallback((duration: number = 2000) => {
    if (process.env.NODE_ENV !== 'development') {
      console.warn('useLoadingDebugger: testNavigationLoading is only available in development');
      return;
    }

    console.log('🧪 Testing Navigation Loading...');
    const id = `debug-nav-${Date.now()}`;
    
    store.startLoading(id, 'navigation', {
      message: 'Testing navigation loading...',
      expectedDuration: duration,
    });

    let progress = 0;
    const interval = setInterval(() => {
      progress += 15;
      store.updateProgress(id, Math.min(progress, 85));
      
      if (progress >= 85) {
        clearInterval(interval);
        setTimeout(() => {
          store.updateProgress(id, 100);
          setTimeout(() => store.completeLoading(id), 150);
        }, 300);
      }
    }, duration / 8);

    return () => {
      clearInterval(interval);
      store.completeLoading(id);
    };
  }, [store]);

  const testApiLoading = useCallback((duration: number = 4000) => {
    if (process.env.NODE_ENV !== 'development') {
      console.warn('useLoadingDebugger: testApiLoading is only available in development');
      return;
    }

    console.log('🧪 Testing API Loading...');
    const id = `debug-api-${Date.now()}`;
    
    store.startLoading(id, 'api', {
      message: 'Testing API request loading...',
      expectedDuration: duration,
    });

    let progress = 0;
    const interval = setInterval(() => {
      progress += 8;
      store.updateProgress(id, Math.min(progress, 95));
      
      if (progress >= 95) {
        clearInterval(interval);
        setTimeout(() => {
          store.updateProgress(id, 100);
          setTimeout(() => store.completeLoading(id), 100);
        }, 200);
      }
    }, duration / 12);

    return () => {
      clearInterval(interval);
      store.completeLoading(id);
    };
  }, [store]);

  const testMultipleOperations = useCallback(() => {
    if (process.env.NODE_ENV !== 'development') {
      console.warn('useLoadingDebugger: testMultipleOperations is only available in development');
      return;
    }

    console.log('🧪 Testing Multiple Concurrent Operations...');
    
    // Start multiple operations with different priorities
    const ops = [
      { type: 'auth' as LoadingType, duration: 2000, message: 'Auth operation' },
      { type: 'api' as LoadingType, duration: 3000, message: 'API request' },
      { type: 'data' as LoadingType, duration: 1500, message: 'Data processing' },
    ];

    const cleanups: (() => void)[] = [];

    ops.forEach((op, index) => {
      const id = `debug-multi-${op.type}-${Date.now()}-${index}`;
      
      store.startLoading(id, op.type, {
        message: op.message,
        expectedDuration: op.duration,
      });

      let progress = 0;
      const interval = setInterval(() => {
        progress += Math.random() * 15 + 5;
        store.updateProgress(id, Math.min(progress, 90));
        
        if (progress >= 90) {
          clearInterval(interval);
          setTimeout(() => {
            store.updateProgress(id, 100);
            setTimeout(() => store.completeLoading(id), 100);
          }, Math.random() * 500);
        }
      }, op.duration / 10);

      cleanups.push(() => {
        clearInterval(interval);
        store.completeLoading(id);
      });
    });

    return () => {
      cleanups.forEach(cleanup => cleanup());
    };
  }, [store]);

  const testErrorLoading = useCallback(() => {
    if (process.env.NODE_ENV !== 'development') {
      console.warn('useLoadingDebugger: testErrorLoading is only available in development');
      return;
    }

    console.log('🧪 Testing Error Loading...');
    const id = `debug-error-${Date.now()}`;
    
    store.startLoading(id, 'api', {
      message: 'Testing error scenario...',
      expectedDuration: 2000,
    });

    let progress = 0;
    const interval = setInterval(() => {
      progress += 20;
      store.updateProgress(id, Math.min(progress, 60));
      
      if (progress >= 60) {
        clearInterval(interval);
        setTimeout(() => {
          store.errorLoading(id, 'Simulated error for testing');
        }, 500);
      }
    }, 200);

    return () => {
      clearInterval(interval);
      store.completeLoading(id);
    };
  }, [store]);

  const getCurrentState = useCallback(() => {
    const state = store;
    const operations = Object.values(state.operations);
    const activeOps = operations.filter(op => op.state === 'loading');
    
    return {
      isVisible: state.isVisible,
      aggregatedProgress: state.aggregatedProgress,
      primaryOperation: state.primaryOperation,
      totalOperations: operations.length,
      activeOperations: activeOps.length,
      operations: operations.map(op => ({
        id: op.id,
        type: op.type,
        state: op.state,
        progress: op.progress,
        message: op.message,
        duration: op.duration,
        elapsed: Date.now() - op.startTime,
      })),
    };
  }, [store]);

  const clearAllOperations = useCallback(() => {
    if (process.env.NODE_ENV !== 'development') {
      console.warn('useLoadingDebugger: clearAllOperations is only available in development');
      return;
    }

    console.log('🧹 Clearing all loading operations...');
    store.clearAll();
  }, [store]);

  const logCurrentState = useCallback(() => {
    if (process.env.NODE_ENV !== 'development') {
      console.warn('useLoadingDebugger: logCurrentState is only available in development');
      return;
    }

    const state = getCurrentState();
    console.group('🔍 Global Loading State');
    console.log('State:', state);
    console.groupEnd();
  }, [getCurrentState]);

  // Development-only: Add global debugging methods
  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') return;

    // Add debugging methods to window for easy access in dev tools
    (window as any).__loadingDebugger = {
      testAuth: testAuthLoading,
      testNav: testNavigationLoading,
      testApi: testApiLoading,
      testMultiple: testMultipleOperations,
      testError: testErrorLoading,
      getState: getCurrentState,
      logState: logCurrentState,
      clear: clearAllOperations,
    };

    console.log('🛠️ Loading debugger available at window.__loadingDebugger');
    console.log('Available methods:', Object.keys((window as any).__loadingDebugger));

    return () => {
      delete (window as any).__loadingDebugger;
    };
  }, [testAuthLoading, testNavigationLoading, testApiLoading, testMultipleOperations, testErrorLoading, getCurrentState, logCurrentState, clearAllOperations]);

  return {
    testAuthLoading,
    testNavigationLoading,
    testApiLoading,
    testMultipleOperations,
    testErrorLoading,
    getCurrentState,
    logCurrentState,
    clearAllOperations,
  };
};

export default useLoadingDebugger;