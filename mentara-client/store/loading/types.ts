export type LoadingType = 
  | 'auth' 
  | 'navigation' 
  | 'api' 
  | 'upload' 
  | 'data' 
  | 'general';

export type LoadingState = 'idle' | 'loading' | 'complete' | 'error';

export interface LoadingOperation {
  id: string;
  type: LoadingType;
  progress: number; // 0-100
  state: LoadingState;
  startTime: number;
  duration?: number; // Expected duration in ms
  message?: string;
}

export interface GlobalLoadingState {
  operations: Record<string, LoadingOperation>;
  isVisible: boolean;
  aggregatedProgress: number;
  primaryOperation: string | null;
}

export interface LoadingStoreActions {
  // Start a new loading operation
  startLoading: (
    id: string, 
    type: LoadingType, 
    options?: {
      message?: string;
      expectedDuration?: number;
    }
  ) => void;
  
  // Update progress for an operation
  updateProgress: (id: string, progress: number) => void;
  
  // Complete an operation
  completeLoading: (id: string) => void;
  
  // Set error state for an operation
  errorLoading: (id: string, message?: string) => void;
  
  // Remove an operation
  removeOperation: (id: string) => void;
  
  // Clear all operations
  clearAll: () => void;
  
  // Show/hide the loading bar
  setVisible: (visible: boolean) => void;
  
  // Get aggregated progress across all operations
  getAggregatedProgress: () => number;
  
  // Get primary operation (most important currently running)
  getPrimaryOperation: () => LoadingOperation | null;
}

export type GlobalLoadingStore = GlobalLoadingState & LoadingStoreActions;

// Helper types for component props
export interface LoadingBarProps {
  className?: string;
  height?: number;
  color?: 'green' | 'blue' | 'red' | 'yellow';
  position?: 'top' | 'bottom';
  showPercentage?: boolean;
  minimumDuration?: number; // Minimum display duration in ms
}

export interface UseGlobalLoadingReturn {
  startLoading: (options?: { message?: string; expectedDuration?: number }) => string;
  updateProgress: (progress: number) => void;
  completeLoading: () => void;
  errorLoading: (message?: string) => void;
  isLoading: boolean;
  progress: number;
}