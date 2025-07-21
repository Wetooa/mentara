import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { shallow } from 'zustand/shallow';
import { useMemo } from 'react';
import { 
  GlobalLoadingStore, 
  LoadingOperation, 
  LoadingType, 
  LoadingState,
  GlobalLoadingState 
} from './types';

// Helper function to calculate aggregated progress
const calculateAggregatedProgress = (operations: Record<string, LoadingOperation>): number => {
  const activeOps = Object.values(operations).filter(op => op.state === 'loading');
  
  if (activeOps.length === 0) return 0;
  
  // Weight operations by importance (auth operations get higher weight)
  const weights = {
    auth: 3,
    navigation: 2,
    api: 1.5,
    upload: 1.5,
    data: 1,
    general: 1
  };
  
  let totalWeightedProgress = 0;
  let totalWeight = 0;
  
  activeOps.forEach(op => {
    const weight = weights[op.type] || 1;
    totalWeightedProgress += op.progress * weight;
    totalWeight += weight;
  });
  
  return totalWeight > 0 ? Math.round(totalWeightedProgress / totalWeight) : 0;
};

// Helper function to determine primary operation
const getPrimaryOperation = (operations: Record<string, LoadingOperation>): LoadingOperation | null => {
  const activeOps = Object.values(operations).filter(op => op.state === 'loading');
  
  if (activeOps.length === 0) return null;
  
  // Priority: auth > navigation > upload > api > data > general
  const priorities = {
    auth: 6,
    navigation: 5,
    upload: 4,
    api: 3,
    data: 2,
    general: 1
  };
  
  return activeOps.reduce((primary, current) => {
    const currentPriority = priorities[current.type] || 1;
    const primaryPriority = priorities[primary.type] || 1;
    
    return currentPriority > primaryPriority ? current : primary;
  });
};

// Helper function for realistic progress curves
const calculateRealisticProgress = (
  baseProgress: number, 
  startTime: number, 
  expectedDuration?: number
): number => {
  if (!expectedDuration) return baseProgress;
  
  const elapsed = Date.now() - startTime;
  const progressRatio = elapsed / expectedDuration;
  
  // Use an easing curve for realistic progress feeling
  // Fast start, slow middle, fast finish (but never reach 100% until explicitly set)
  const easedProgress = Math.min(90, progressRatio * 100 * (2 - progressRatio));
  
  return Math.max(baseProgress, Math.round(easedProgress));
};

const initialState: GlobalLoadingState = {
  operations: {},
  isVisible: false,
  aggregatedProgress: 0,
  primaryOperation: null,
};

export const useGlobalLoadingStore = create<GlobalLoadingStore>()(
  devtools(
    (set, get) => ({
      ...initialState,

      startLoading: (id, type, options = {}) => {
        set((state) => {
          const operation: LoadingOperation = {
            id,
            type,
            progress: 0,
            state: 'loading',
            startTime: Date.now(),
            duration: options.expectedDuration,
            message: options.message,
          };

          const newOperations = {
            ...state.operations,
            [id]: operation,
          };

          const aggregatedProgress = calculateAggregatedProgress(newOperations);
          const primaryOp = getPrimaryOperation(newOperations);

          return {
            operations: newOperations,
            isVisible: true,
            aggregatedProgress,
            primaryOperation: primaryOp?.id || null,
          };
        }, false, 'startLoading');
      },

      updateProgress: (id, progress) => {
        set((state) => {
          const operation = state.operations[id];
          if (!operation || operation.state !== 'loading') return state;

          // Apply realistic progress curve if expected duration is set
          const realisticProgress = calculateRealisticProgress(
            progress,
            operation.startTime,
            operation.duration
          );

          const updatedOperation = {
            ...operation,
            progress: Math.min(100, Math.max(0, realisticProgress)),
          };

          const newOperations = {
            ...state.operations,
            [id]: updatedOperation,
          };

          const aggregatedProgress = calculateAggregatedProgress(newOperations);
          const primaryOp = getPrimaryOperation(newOperations);

          return {
            operations: newOperations,
            aggregatedProgress,
            primaryOperation: primaryOp?.id || null,
          };
        }, false, 'updateProgress');
      },

      completeLoading: (id) => {
        set((state) => {
          const operation = state.operations[id];
          if (!operation || operation.state !== 'loading') return state; // Only complete loading operations

          // Remove the operation immediately instead of scheduling
          const { [id]: removed, ...remainingOperations } = state.operations;

          const aggregatedProgress = calculateAggregatedProgress(remainingOperations);
          const primaryOp = getPrimaryOperation(remainingOperations);
          const hasActiveOps = Object.values(remainingOperations).some(op => op.state === 'loading');

          return {
            operations: remainingOperations,
            isVisible: hasActiveOps,
            aggregatedProgress,
            primaryOperation: primaryOp?.id || null,
          };
        }, false, 'completeLoading');
      },

      errorLoading: (id, message) => {
        set((state) => {
          const operation = state.operations[id];
          if (!operation || operation.state !== 'loading') return state; // Only error loading operations

          // Remove the operation immediately instead of scheduling
          const { [id]: removed, ...remainingOperations } = state.operations;

          const aggregatedProgress = calculateAggregatedProgress(remainingOperations);
          const primaryOp = getPrimaryOperation(remainingOperations);
          const hasActiveOps = Object.values(remainingOperations).some(op => op.state === 'loading');

          return {
            operations: remainingOperations,
            isVisible: hasActiveOps,
            aggregatedProgress,
            primaryOperation: primaryOp?.id || null,
          };
        }, false, 'errorLoading');
      },

      removeOperation: (id) => {
        set((state) => {
          const { [id]: removed, ...remainingOperations } = state.operations;

          const aggregatedProgress = calculateAggregatedProgress(remainingOperations);
          const primaryOp = getPrimaryOperation(remainingOperations);
          const hasActiveOps = Object.values(remainingOperations).some(op => op.state === 'loading');

          return {
            operations: remainingOperations,
            isVisible: hasActiveOps,
            aggregatedProgress,
            primaryOperation: primaryOp?.id || null,
          };
        }, false, 'removeOperation');
      },

      clearAll: () => {
        set(() => ({
          ...initialState,
        }), false, 'clearAll');
      },

      setVisible: (visible) => {
        set((state) => ({
          isVisible: visible,
        }), false, 'setVisible');
      },

      getAggregatedProgress: () => {
        const state = get();
        return calculateAggregatedProgress(state.operations);
      },

      getPrimaryOperation: () => {
        const state = get();
        const primaryId = state.primaryOperation;
        return primaryId ? state.operations[primaryId] || null : null;
      },
    }),
    {
      name: 'global-loading-store',
      // Only include in devtools during development
      enabled: process.env.NODE_ENV === 'development',
    }
  )
);

// Helper hook to get just the loading state for specific operation
export const useLoadingOperation = (id: string) => {
  return useGlobalLoadingStore((state) => state.operations[id] || null);
};

// Individual stable selectors
const selectIsVisible = (state: GlobalLoadingState) => state.isVisible;
const selectAggregatedProgress = (state: GlobalLoadingState) => state.aggregatedProgress;
const selectPrimaryOperationId = (state: GlobalLoadingState) => state.primaryOperation;

// Helper hook to get just the aggregated state
export const useAggregatedLoading = () => {
  const isVisible = useGlobalLoadingStore(selectIsVisible);
  const progress = useGlobalLoadingStore(selectAggregatedProgress);
  const primaryOperationId = useGlobalLoadingStore(selectPrimaryOperationId);
  
  // Get the primary operation directly when needed
  const primaryOperation = useGlobalLoadingStore((state) => 
    primaryOperationId ? state.operations[primaryOperationId] || null : null
  );

  // Memoize the result to prevent object recreation
  return useMemo(() => ({
    isVisible,
    progress,
    primaryOperation,
  }), [isVisible, progress, primaryOperation]);
};