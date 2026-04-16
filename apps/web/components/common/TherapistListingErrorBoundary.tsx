"use client";

import React, { ErrorInfo, ReactNode } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * Error boundary specifically designed for therapist listing components
 * Provides graceful fallback UI and error reporting for the matching system
 */
export class TherapistListingErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state to trigger fallback UI
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error details for debugging
    console.error('TherapistListingErrorBoundary caught an error:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo,
    });

    // Call optional error callback
    this.props.onError?.(error, errorInfo);

    // Log to external service if needed
    // trackError('therapist_listing_error', { error, errorInfo });
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  handleReload = () => {
    try {
      window.location.reload();
    } catch (error) {
      console.error('Failed to reload page:', error);
      // Fallback: reset component state
      this.handleReset();
    }
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default fallback UI
      return (
        <div className="flex flex-col items-center justify-center min-h-[400px] p-8">
          <Alert className="max-w-2xl mx-auto">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="space-y-4">
              <div>
                <h3 className="font-medium text-gray-900 mb-2">
                  Something went wrong with the therapist listing
                </h3>
                <p className="text-gray-600">
                  We encountered an unexpected error while loading the therapist recommendations. 
                  This might be a temporary issue.
                </p>
              </div>
              
              {/* Error details in development */}
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <div className="bg-gray-50 p-3 rounded text-xs font-mono text-gray-700">
                  <div className="font-bold mb-1">Error Details:</div>
                  <div>{this.state.error.message}</div>
                  {this.state.errorInfo?.componentStack && (
                    <div className="mt-2">
                      <div className="font-bold">Component Stack:</div>
                      <pre className="whitespace-pre-wrap">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    </div>
                  )}
                </div>
              )}
              
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={this.handleReset}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Try Again
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={this.handleReload}
                >
                  Reload Page
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Hook-based wrapper for functional components
 */
export function withTherapistListingErrorBoundary<P extends object>(
  Component: React.ComponentType<P>
) {
  return function ErrorBoundaryWrapper(props: P) {
    return (
      <TherapistListingErrorBoundary>
        <Component {...props} />
      </TherapistListingErrorBoundary>
    );
  };
}

/**
 * Simple functional wrapper component
 */
export function TherapistListingErrorWrapper({ 
  children, 
  onError 
}: { 
  children: ReactNode; 
  onError?: (error: Error, errorInfo: ErrorInfo) => void; 
}) {
  return (
    <TherapistListingErrorBoundary onError={onError}>
      {children}
    </TherapistListingErrorBoundary>
  );
}