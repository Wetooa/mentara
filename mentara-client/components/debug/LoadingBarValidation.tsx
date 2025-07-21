"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useLoadingDebugger } from '@/hooks/loading/useLoadingDebugger';
import { useAuth } from '@/contexts/AuthContext';
import { Badge } from '@/components/ui/badge';

/**
 * Validation component to test global loading bar functionality
 * 
 * Add this to any page temporarily to test:
 * ```tsx
 * {process.env.NODE_ENV === 'development' && <LoadingBarValidation />}
 * ```
 */
export const LoadingBarValidation = () => {
  const router = useRouter();
  const { isLoading: authLoading, isAuthenticated, userRole } = useAuth();
  const debugger = useLoadingDebugger();
  const [testResults, setTestResults] = useState<any[]>([]);

  // Don't render in production
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  const runValidationTests = () => {
    console.group('🧪 Global Loading Bar Validation');
    setTestResults([]);
    
    const results: any[] = [];

    // Test 1: Basic Auth Loading
    console.log('Test 1: Auth Loading...');
    const authTest = debugger.testAuthLoading(2000);
    results.push({ test: 'Auth Loading', status: 'running', duration: '2s' });

    // Test 2: Navigation Loading  
    setTimeout(() => {
      console.log('Test 2: Navigation Loading...');
      const navTest = debugger.testNavigationLoading(1500);
      results.push({ test: 'Navigation Loading', status: 'running', duration: '1.5s' });
      setTestResults([...results]);
    }, 2500);

    // Test 3: Multiple Operations
    setTimeout(() => {
      console.log('Test 3: Multiple Concurrent Operations...');
      const multiTest = debugger.testMultipleOperations();
      results.push({ test: 'Multiple Operations', status: 'running', duration: '3s' });
      setTestResults([...results]);
    }, 4500);

    // Test 4: Error Scenario
    setTimeout(() => {
      console.log('Test 4: Error Scenario...');
      const errorTest = debugger.testErrorLoading();
      results.push({ test: 'Error Loading', status: 'running', duration: '2s' });
      setTestResults([...results]);
    }, 7000);

    setTimeout(() => {
      console.log('✅ All validation tests completed!');
      console.groupEnd();
      results.forEach(r => r.status = 'completed');
      setTestResults([...results]);
    }, 9500);

    setTestResults([...results]);
  };

  const testNavigation = (path: string) => {
    console.log('🧪 Testing navigation loading to:', path);
    router.push(path);
  };

  return (
    <Card className="fixed top-4 right-4 w-80 bg-background/95 backdrop-blur border shadow-lg z-40">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium">✅ Loading Bar Validation</CardTitle>
        <CardDescription className="text-xs">
          Test global loading functionality
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Current Auth State */}
        <div className="space-y-2">
          <h4 className="text-xs font-medium text-muted-foreground">Current Auth State</h4>
          <div className="flex items-center gap-2 text-xs">
            <Badge variant={authLoading ? "default" : "secondary"}>
              {authLoading ? "Loading" : "Loaded"}
            </Badge>
            <Badge variant={isAuthenticated ? "default" : "secondary"}>
              {isAuthenticated ? `Authenticated (${userRole})` : "Not Authenticated"}
            </Badge>
          </div>
        </div>

        {/* Validation Test */}
        <div className="space-y-2">
          <Button
            onClick={runValidationTests}
            className="w-full text-xs"
            size="sm"
          >
            🚀 Run Full Validation Test
          </Button>
          
          {testResults.length > 0 && (
            <div className="space-y-1">
              {testResults.map((result, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 bg-muted/50 rounded text-xs"
                >
                  <span>{result.test}</span>
                  <div className="flex items-center gap-2">
                    <Badge variant={result.status === 'completed' ? "default" : "secondary"}>
                      {result.status}
                    </Badge>
                    <span className="text-muted-foreground">{result.duration}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Navigation Tests */}
        <div className="space-y-2">
          <h4 className="text-xs font-medium text-muted-foreground">Test Navigation Loading</h4>
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => testNavigation('/client')}
              className="text-xs"
            >
              Client
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => testNavigation('/therapist')}
              className="text-xs"
            >
              Therapist
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => testNavigation('/admin')}
              className="text-xs"
            >
              Admin
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => testNavigation('/auth/sign-in')}
              className="text-xs"
            >
              Sign In
            </Button>
          </div>
        </div>

        {/* Expected Results */}
        <div className="text-xs text-muted-foreground space-y-1">
          <div className="font-medium">Expected Results:</div>
          <div className="bg-muted/50 p-2 rounded space-y-1">
            <div>✅ Green loading bar at top of screen</div>
            <div>✅ Shimmer animation during loading</div>
            <div>✅ Smooth progress from 0% to 100%</div>
            <div>✅ Different priorities work correctly</div>
            <div>✅ Auth loading triggers during role checks</div>
            <div>✅ Navigation loading on page switches</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default LoadingBarValidation;