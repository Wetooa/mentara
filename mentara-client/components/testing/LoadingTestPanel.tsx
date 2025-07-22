"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useGlobalLoading, useAggregatedLoadingState, useMultipleLoading } from '@/hooks/loading/useGlobalLoading';
import { useGlobalLoadingStore } from '@/store/loading/globalLoadingStore';
import { LoadingType } from '@/store/loading/types';

/**
 * Test component for verifying the global loading system
 * This component provides controls to test different loading scenarios
 */
export const LoadingTestPanel: React.FC = () => {
  const [testProgress, setTestProgress] = useState(0);
  
  // Individual loading hooks for different types
  const authLoading = useGlobalLoading('auth');
  const apiLoading = useGlobalLoading('api');
  const uploadLoading = useGlobalLoading('upload');
  const multipleLoading = useMultipleLoading('general');
  
  // Global state
  const aggregatedState = useAggregatedLoadingState();
  const store = useGlobalLoadingStore();

  // Test functions
  const testSimpleLoading = async (type: LoadingType) => {
    const loading = useGlobalLoading(type);
    const loadingId = loading.startLoading({
      message: `Testing ${type} loading...`,
      expectedDuration: 3000,
    });

    // Simulate realistic progress
    for (let i = 0; i <= 100; i += 5) {
      await new Promise(resolve => setTimeout(resolve, 100));
      loading.updateProgress(i);
    }
    
    loading.completeLoading();
  };

  const testProgressiveLoading = async () => {
    authLoading.startLoading({
      message: 'Progressive authentication...',
      expectedDuration: 4000,
    });

    // Phase 1: Quick start
    for (let i = 0; i <= 30; i += 10) {
      await new Promise(resolve => setTimeout(resolve, 200));
      authLoading.updateProgress(i);
    }

    // Phase 2: Slower middle
    for (let i = 30; i <= 70; i += 5) {
      await new Promise(resolve => setTimeout(resolve, 300));
      authLoading.updateProgress(i);
    }

    // Phase 3: Quick finish
    for (let i = 70; i <= 100; i += 10) {
      await new Promise(resolve => setTimeout(resolve, 150));
      authLoading.updateProgress(i);
    }

    authLoading.completeLoading();
  };

  const testMultipleOperations = async () => {
    // Start multiple operations
    const op1 = multipleLoading.startLoading('auth-check', {
      message: 'Checking authentication...',
      expectedDuration: 2000,
    });
    
    const op2 = multipleLoading.startLoading('user-data', {
      message: 'Loading user data...',
      expectedDuration: 3000,
    });
    
    const op3 = multipleLoading.startLoading('preferences', {
      message: 'Loading preferences...',
      expectedDuration: 1500,
    });

    // Update operations at different rates
    const updateOperation = async (opId: string, duration: number) => {
      for (let i = 0; i <= 100; i += 5) {
        await new Promise(resolve => setTimeout(resolve, duration / 20));
        multipleLoading.updateProgress(opId, i);
      }
      multipleLoading.completeLoading(opId);
    };

    // Run operations concurrently with different timings
    Promise.all([
      updateOperation(op1, 2000),
      updateOperation(op2, 3000),
      updateOperation(op3, 1500),
    ]);
  };

  const testErrorState = async () => {
    apiLoading.startLoading({
      message: 'Testing error scenario...',
      expectedDuration: 2000,
    });

    // Progress partway
    for (let i = 0; i <= 50; i += 10) {
      await new Promise(resolve => setTimeout(resolve, 100));
      apiLoading.updateProgress(i);
    }

    // Simulate error
    apiLoading.errorLoading('Network connection failed');
  };

  const testRealisticAuth = async () => {
    authLoading.startLoading({
      message: 'Authenticating user...',
      expectedDuration: 2500,
    });

    // Simulate real auth flow
    authLoading.updateProgress(20); // Token validation
    await new Promise(resolve => setTimeout(resolve, 300));
    
    authLoading.updateProgress(45); // User lookup
    await new Promise(resolve => setTimeout(resolve, 500));
    
    authLoading.updateProgress(70); // Permission check
    await new Promise(resolve => setTimeout(resolve, 400));
    
    authLoading.updateProgress(90); // Session setup
    await new Promise(resolve => setTimeout(resolve, 300));
    
    authLoading.updateProgress(100); // Complete
    authLoading.completeLoading();
  };

  const clearAllOperations = () => {
    store.clearAll();
    setTestProgress(0);
  };

  return (
    <div className="space-y-6 p-6 max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            🧪 Global Loading System Test Panel
            <Badge variant={aggregatedState.isLoading ? "default" : "secondary"}>
              {aggregatedState.isLoading ? "Loading" : "Idle"}
            </Badge>
          </CardTitle>
          <CardDescription>
            Test the global loading bar with various scenarios and timing patterns
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Global State Display */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <h4 className="font-semibold">Global Progress</h4>
              <Progress value={aggregatedState.progress} className="w-full" />
              <p className="text-sm text-muted-foreground">
                {aggregatedState.progress}% complete
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold">Primary Operation</h4>
              <Badge variant="outline">
                {aggregatedState.primaryOperation?.type || 'None'}
              </Badge>
              {aggregatedState.primaryOperation?.message && (
                <p className="text-xs text-muted-foreground">
                  {aggregatedState.primaryOperation.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold">Active Operations</h4>
              <p className="text-2xl font-bold">
                {Object.values(store.operations).filter(op => op.state === 'loading').length}
              </p>
            </div>
          </div>

          {/* Test Controls */}
          <div className="space-y-4">
            <h4 className="font-semibold">Quick Tests</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              <Button
                onClick={() => testSimpleLoading('auth')}
                disabled={authLoading.isLoading}
                variant="outline"
                size="sm"
              >
                Auth Loading
              </Button>
              <Button
                onClick={() => testSimpleLoading('api')}
                disabled={apiLoading.isLoading}
                variant="outline"
                size="sm"
              >
                API Loading
              </Button>
              <Button
                onClick={() => testSimpleLoading('upload')}
                disabled={uploadLoading.isLoading}
                variant="outline"
                size="sm"
              >
                Upload Loading
              </Button>
              <Button
                onClick={testErrorState}
                disabled={apiLoading.isLoading}
                variant="outline"
                size="sm"
              >
                Error Test
              </Button>
            </div>
          </div>

          {/* Advanced Tests */}
          <div className="space-y-4">
            <h4 className="font-semibold">Advanced Scenarios</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              <Button
                onClick={testProgressiveLoading}
                disabled={authLoading.isLoading}
                className="w-full"
              >
                Progressive Loading
              </Button>
              <Button
                onClick={testMultipleOperations}
                disabled={multipleLoading.hasAnyLoading}
                className="w-full"
              >
                Multiple Operations
              </Button>
              <Button
                onClick={testRealisticAuth}
                disabled={authLoading.isLoading}
                className="w-full"
              >
                Realistic Auth Flow
              </Button>
            </div>
          </div>

          {/* Manual Controls */}
          <div className="space-y-4">
            <h4 className="font-semibold">Manual Controls</h4>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="0"
                max="100"
                value={testProgress}
                onChange={(e) => {
                  const progress = parseInt(e.target.value);
                  setTestProgress(progress);
                  if (authLoading.isLoading) {
                    authLoading.updateProgress(progress);
                  }
                }}
                className="flex-1"
              />
              <span className="text-sm font-mono w-12">{testProgress}%</span>
              <Button
                onClick={() => {
                  if (!authLoading.isLoading) {
                    authLoading.startLoading({ message: 'Manual testing...' });
                  } else {
                    authLoading.completeLoading();
                    setTestProgress(0);
                  }
                }}
                size="sm"
              >
                {authLoading.isLoading ? 'Stop' : 'Start'} Manual
              </Button>
            </div>
          </div>

          {/* Clear All */}
          <div className="flex justify-end">
            <Button onClick={clearAllOperations} variant="destructive" size="sm">
              Clear All Operations
            </Button>
          </div>

          {/* Current Operations Display */}
          {Object.keys(store.operations).length > 0 && (
            <div className="space-y-2">
              <h4 className="font-semibold">Current Operations</h4>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {Object.values(store.operations).map((op) => (
                  <div key={op.id} className="flex items-center justify-between p-2 bg-muted rounded">
                    <div className="flex items-center gap-2">
                      <Badge variant={op.state === 'loading' ? 'default' : op.state === 'error' ? 'destructive' : 'secondary'}>
                        {op.type}
                      </Badge>
                      <span className="text-sm">{op.message || op.id}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Progress value={op.progress} className="w-16 h-2" />
                      <span className="text-xs font-mono w-8">{op.progress}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default LoadingTestPanel;