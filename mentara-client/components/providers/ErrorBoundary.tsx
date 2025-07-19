"use client";

import React from 'react';
import { QueryErrorResetBoundary } from '@tanstack/react-query';
import { ErrorBoundary } from 'react-error-boundary';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { MentaraApiError } from '@/lib/api/errorHandler';

interface ErrorFallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
}

function ErrorFallback({ error, resetErrorBoundary }: ErrorFallbackProps) {
  const isApiError = error instanceof MentaraApiError;
  
  return (
    <Card className="w-full max-w-lg mx-auto my-8">
      <CardHeader className="text-center">
        <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
          <AlertCircle className="w-6 h-6 text-red-600" />
        </div>
        <CardTitle className="text-red-900">
          {isApiError ? 'API Error' : 'Something went wrong'}
        </CardTitle>
        <CardDescription>
          {isApiError 
            ? `${error.message} (Status: ${error.status})`
            : 'An unexpected error occurred while loading this content.'
          }
        </CardDescription>
      </CardHeader>
      <CardContent className="text-center space-y-4">
        {process.env.NODE_ENV === 'development' && (
          <details className="text-left text-sm text-gray-600">
            <summary className="cursor-pointer hover:text-gray-800">
              Technical Details
            </summary>
            <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto">
              {error.stack}
            </pre>
          </details>
        )}
        
        <div className="flex flex-col sm:flex-row gap-2 justify-center">
          <Button 
            onClick={resetErrorBoundary}
            variant="default"
            className="flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </Button>
          
          <Button 
            onClick={() => window.location.reload()}
            variant="outline"
          >
            Reload Page
          </Button>
        </div>
        
        {isApiError && error.status >= 500 && (
          <p className="text-sm text-gray-600">
            This appears to be a server issue. Please try again in a few moments.
          </p>
        )}
        
        {isApiError && error.status === 401 && (
          <p className="text-sm text-gray-600">
            Your session may have expired. Please try signing in again.
          </p>
        )}
      </CardContent>
    </Card>
  );
}

interface QueryErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<ErrorFallbackProps>;
}

export function QueryErrorBoundary({ 
  children, 
  fallback: FallbackComponent = ErrorFallback 
}: QueryErrorBoundaryProps) {
  return (
    <QueryErrorResetBoundary>
      {({ reset }) => (
        <ErrorBoundary
          FallbackComponent={FallbackComponent}
          onReset={reset}
          onError={(error, errorInfo) => {
            // Log error for monitoring in development
            if (process.env.NODE_ENV === 'development') {
              console.error('React Query Error Boundary caught an error:', error);
              console.error('Error Info:', errorInfo);
            }
            
            // In production, you might want to send this to a monitoring service
            // like Sentry, LogRocket, etc.
          }}
        >
          {children}
        </ErrorBoundary>
      )}
    </QueryErrorResetBoundary>
  );
}

// Simplified error boundary for smaller components
interface SimpleErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function SimpleErrorBoundary({ 
  children, 
  fallback = <div className="text-red-600 text-sm">Failed to load content</div>
}: SimpleErrorBoundaryProps) {
  return (
    <ErrorBoundary
      fallbackRender={() => <>{fallback}</>}
      onError={(error) => {
        if (process.env.NODE_ENV === 'development') {
          console.error('Simple Error Boundary caught an error:', error);
        }
      }}
    >
      {children}
    </ErrorBoundary>
  );
}