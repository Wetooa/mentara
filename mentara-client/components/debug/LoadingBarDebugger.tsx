"use client";

import { useState } from 'react';
import { useLoadingDebugger } from '@/hooks/loading/useLoadingDebugger';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { LoadingType } from '@/store/loading/types';

/**
 * Development-only component for testing the global loading bar
 * Add this to any page during development to test loading functionality
 * 
 * Usage:
 * ```tsx
 * {process.env.NODE_ENV === 'development' && <LoadingBarDebugger />}
 * ```
 */
export const LoadingBarDebugger = () => {
  const debugger = useLoadingDebugger();
  const [currentState, setCurrentState] = useState<any>(null);

  // Don't render in production
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  const refreshState = () => {
    setCurrentState(debugger.getCurrentState());
  };

  const testOperations = [
    {
      label: 'Test Auth Loading',
      description: 'Simulates authentication check',
      action: () => debugger.testAuthLoading(),
      variant: 'default' as const,
    },
    {
      label: 'Test Navigation Loading',
      description: 'Simulates page navigation',
      action: () => debugger.testNavigationLoading(),
      variant: 'secondary' as const,
    },
    {
      label: 'Test API Loading',
      description: 'Simulates API request',
      action: () => debugger.testApiLoading(),
      variant: 'outline' as const,
    },
    {
      label: 'Test Multiple Operations',
      description: 'Multiple concurrent operations',
      action: () => debugger.testMultipleOperations(),
      variant: 'default' as const,
    },
    {
      label: 'Test Error Scenario',
      description: 'Simulates loading error',
      action: () => debugger.testErrorLoading(),
      variant: 'destructive' as const,
    },
  ];

  const getTypeColor = (type: LoadingType) => {
    const colors = {
      auth: 'bg-red-500',
      navigation: 'bg-blue-500',
      api: 'bg-green-500',
      upload: 'bg-yellow-500',
      data: 'bg-purple-500',
      general: 'bg-gray-500',
    };
    return colors[type] || colors.general;
  };

  const getStateColor = (state: string) => {
    const colors = {
      loading: 'bg-blue-500',
      complete: 'bg-green-500',
      error: 'bg-red-500',
      idle: 'bg-gray-500',
    };
    return colors[state as keyof typeof colors] || colors.idle;
  };

  return (
    <Card className="fixed bottom-4 right-4 w-96 max-h-[80vh] overflow-y-auto bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border shadow-lg z-50">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium">🛠️ Loading Bar Debugger</CardTitle>
        <CardDescription className="text-xs">
          Development tools for testing the global loading system
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Test Buttons */}
        <div className="space-y-2">
          <h4 className="text-xs font-medium text-muted-foreground">Test Operations</h4>
          <div className="grid grid-cols-1 gap-2">
            {testOperations.map((test) => (
              <Button
                key={test.label}
                variant={test.variant}
                size="sm"
                onClick={test.action}
                className="justify-start text-xs h-8"
              >
                {test.label}
              </Button>
            ))}
          </div>
        </div>

        <Separator />

        {/* Control Buttons */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={refreshState}
            className="text-xs flex-1"
          >
            Refresh State
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => debugger.logCurrentState()}
            className="text-xs flex-1"
          >
            Log to Console
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={debugger.clearAllOperations}
            className="text-xs flex-1"
          >
            Clear All
          </Button>
        </div>

        {/* Current State Display */}
        {currentState && (
          <>
            <Separator />
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-medium text-muted-foreground">Current State</h4>
                <div className="flex items-center gap-2">
                  <Badge variant={currentState.isVisible ? "default" : "secondary"} className="text-xs">
                    {currentState.isVisible ? "Visible" : "Hidden"}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {currentState.aggregatedProgress}%
                  </span>
                </div>
              </div>

              <div className="text-xs text-muted-foreground">
                <div>Active: {currentState.activeOperations}</div>
                <div>Total: {currentState.totalOperations}</div>
                <div>Primary: {currentState.primaryOperation || 'None'}</div>
              </div>

              {/* Operations List */}
              {currentState.operations.length > 0 && (
                <div className="space-y-2">
                  <h5 className="text-xs font-medium text-muted-foreground">Operations</h5>
                  <div className="space-y-1 max-h-32 overflow-y-auto">
                    {currentState.operations.map((op: any) => (
                      <div
                        key={op.id}
                        className="flex items-center justify-between p-2 bg-muted/50 rounded text-xs"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <div className={`w-2 h-2 rounded-full ${getTypeColor(op.type)}`} />
                          <div className="truncate">
                            <div className="font-medium">{op.type.toUpperCase()}</div>
                            <div className="text-muted-foreground text-xs truncate">
                              {op.message || op.id}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <Badge
                            variant="outline"
                            className={`text-xs ${getStateColor(op.state)} text-white border-0`}
                          >
                            {op.state}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {op.progress}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {/* Console Instructions */}
        <Separator />
        <div className="text-xs text-muted-foreground space-y-1">
          <div className="font-medium">Console Commands:</div>
          <div className="font-mono bg-muted/50 p-2 rounded">
            <div>window.__loadingDebugger</div>
            <div>  .testAuth()</div>
            <div>  .testNav()</div>
            <div>  .getState()</div>
            <div>  .clear()</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default LoadingBarDebugger;