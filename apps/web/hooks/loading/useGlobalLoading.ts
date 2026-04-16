import { useCallback, useRef } from 'react';
import { useGlobalLoadingStore } from '@/store/loading/globalLoadingStore';
import { LoadingType, UseGlobalLoadingReturn } from '@/store/loading/types';

/**
 * Hook for easy integration with the global loading system
 * 
 * @param type - The type of loading operation
 * @param defaultOptions - Default options for loading operations
 * @returns Object with loading control methods and state
 * 
 * @example
 * const { startLoading, updateProgress, completeLoading, isLoading } = useGlobalLoading('api');
 * 
 * // Start a loading operation
 * const loadingId = startLoading({ message: 'Fetching data...', expectedDuration: 3000 });
 * 
 * // Update progress
 * updateProgress(50);
 * 
 * // Complete loading
 * completeLoading();
 */
export const useGlobalLoading = (
  type: LoadingType = 'general',
  defaultOptions?: {
    message?: string;
    expectedDuration?: number;
  }
): UseGlobalLoadingReturn => {
  const store = useGlobalLoadingStore();
  const currentOperationId = useRef<string | null>(null);

  const startLoading = useCallback((options?: {
    message?: string;
    expectedDuration?: number;
  }): string => {
    // Complete any existing operation for this hook instance
    if (currentOperationId.current) {
      store.completeLoading(currentOperationId.current);
    }

    // Generate unique ID for this operation
    const operationId = `${type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    currentOperationId.current = operationId;

    // Merge options with defaults
    const finalOptions = {
      ...defaultOptions,
      ...options,
    };

    store.startLoading(operationId, type, finalOptions);
    
    return operationId;
  }, [type, defaultOptions, store]);

  const updateProgress = useCallback((progress: number) => {
    if (!currentOperationId.current) {
      console.warn('useGlobalLoading: No active loading operation to update progress for');
      return;
    }

    store.updateProgress(currentOperationId.current, progress);
  }, [store]);

  const completeLoading = useCallback(() => {
    if (!currentOperationId.current) {
      console.warn('useGlobalLoading: No active loading operation to complete');
      return;
    }

    store.completeLoading(currentOperationId.current);
    currentOperationId.current = null;
  }, [store]);

  const errorLoading = useCallback((message?: string) => {
    if (!currentOperationId.current) {
      console.warn('useGlobalLoading: No active loading operation to error');
      return;
    }

    store.errorLoading(currentOperationId.current, message);
    currentOperationId.current = null;
  }, [store]);

  // Get current operation state
  const currentOperation = currentOperationId.current 
    ? store.operations[currentOperationId.current] 
    : null;

  const isLoading = currentOperation?.state === 'loading';
  const progress = currentOperation?.progress || 0;

  return {
    startLoading,
    updateProgress,
    completeLoading,
    errorLoading,
    isLoading,
    progress,
  };
};

/**
 * Hook to get loading state for a specific operation ID
 * Useful for monitoring loading operations started elsewhere
 */
export const useLoadingState = (operationId: string | null) => {
  const operation = useGlobalLoadingStore((state) => 
    operationId ? state.operations[operationId] : null
  );

  return {
    isLoading: operation?.state === 'loading',
    progress: operation?.progress || 0,
    state: operation?.state || 'idle',
    message: operation?.message,
  };
};

/**
 * Hook to get aggregated loading state across all operations
 * Useful for showing global loading indicators
 */
export const useAggregatedLoadingState = () => {
  const { isVisible, aggregatedProgress, primaryOperation } = useGlobalLoadingStore((state) => ({
    isVisible: state.isVisible,
    aggregatedProgress: state.aggregatedProgress,
    primaryOperation: state.primaryOperation ? state.operations[state.primaryOperation] : null,
  }));

  return {
    isLoading: isVisible,
    progress: aggregatedProgress,
    primaryOperation,
    hasError: primaryOperation?.state === 'error',
  };
};

/**
 * Hook for managing multiple loading operations simultaneously
 * Useful for complex components with multiple async operations
 */
export const useMultipleLoading = (type: LoadingType = 'general') => {
  const store = useGlobalLoadingStore();
  const operationIds = useRef<Set<string>>(new Set());

  const startLoading = useCallback((id: string, options?: {
    message?: string;
    expectedDuration?: number;
  }): string => {
    const operationId = `${type}-${id}-${Date.now()}`;
    operationIds.current.add(operationId);

    store.startLoading(operationId, type, options);
    
    return operationId;
  }, [type, store]);

  const updateProgress = useCallback((operationId: string, progress: number) => {
    if (!operationIds.current.has(operationId)) {
      console.warn('useMultipleLoading: Unknown operation ID');
      return;
    }

    store.updateProgress(operationId, progress);
  }, [store]);

  const completeLoading = useCallback((operationId: string) => {
    if (!operationIds.current.has(operationId)) {
      console.warn('useMultipleLoading: Unknown operation ID');
      return;
    }

    store.completeLoading(operationId);
    operationIds.current.delete(operationId);
  }, [store]);

  const errorLoading = useCallback((operationId: string, message?: string) => {
    if (!operationIds.current.has(operationId)) {
      console.warn('useMultipleLoading: Unknown operation ID');
      return;
    }

    store.errorLoading(operationId, message);
    operationIds.current.delete(operationId);
  }, [store]);

  const completeAll = useCallback(() => {
    operationIds.current.forEach(operationId => {
      store.completeLoading(operationId);
    });
    operationIds.current.clear();
  }, [store]);

  // Get state for all operations managed by this hook
  const operations = useGlobalLoadingStore((state) => 
    Array.from(operationIds.current).map(id => state.operations[id]).filter(Boolean)
  );

  const hasAnyLoading = operations.some(op => op.state === 'loading');
  const averageProgress = operations.length > 0 
    ? operations.reduce((sum, op) => sum + op.progress, 0) / operations.length
    : 0;

  return {
    startLoading,
    updateProgress,
    completeLoading,
    errorLoading,
    completeAll,
    operations,
    hasAnyLoading,
    averageProgress,
  };
};