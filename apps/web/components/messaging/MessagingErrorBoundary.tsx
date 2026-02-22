"use client";

import React, { Component, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  AlertTriangle,
  RefreshCw,
  MessageSquare,
  Wifi,
  Bug,
  ExternalLink,
} from "lucide-react";
import { logger } from "@/lib/logger";
import { cn } from "@/lib/utils";

interface MessagingErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  showDetails?: boolean;
  className?: string;
}

interface MessagingErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
  errorId: string | null;
  retryCount: number;
}

class MessagingErrorBoundary extends Component<
  MessagingErrorBoundaryProps,
  MessagingErrorBoundaryState
> {
  private maxRetries = 3;

  constructor(props: MessagingErrorBoundaryProps) {
    super(props);

    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null,
      retryCount: 0,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<MessagingErrorBoundaryState> {
    // Generate unique error ID for tracking
    const errorId = `msg-error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    return {
      hasError: true,
      error,
      errorId,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log the error
    logger.error('MessagingErrorBoundary', 'Component error caught', {
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack,
      },
      errorInfo,
      errorId: this.state.errorId,
    });

    this.setState({ errorInfo });

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Report to external error tracking service if available
    if (typeof window !== 'undefined' && (window as any).Sentry) {
      (window as any).Sentry.captureException(error, {
        tags: {
          component: 'MessagingErrorBoundary',
          errorId: this.state.errorId,
        },
        extra: errorInfo,
      });
    }
  }

  handleRetry = () => {
    if (this.state.retryCount < this.maxRetries) {
      logger.info('MessagingErrorBoundary', `Retry attempt ${this.state.retryCount + 1}`, {
        errorId: this.state.errorId,
      });

      this.setState({
        hasError: false,
        error: null,
        errorInfo: null,
        errorId: null,
        retryCount: this.state.retryCount + 1,
      });
    }
  };

  handleReload = () => {
    logger.info('MessagingErrorBoundary', 'Page reload requested', {
      errorId: this.state.errorId,
    });
    window.location.reload();
  };

  getErrorType = (error: Error): string => {
    const message = error.message.toLowerCase();
    const stack = error.stack?.toLowerCase() || '';

    if (message.includes('websocket') || message.includes('socket')) {
      return 'websocket';
    }
    if (message.includes('network') || message.includes('fetch')) {
      return 'network';
    }
    if (message.includes('auth') || message.includes('token')) {
      return 'authentication';
    }
    if (stack.includes('react-query') || stack.includes('tanstack')) {
      return 'cache';
    }
    if (stack.includes('messaging') || stack.includes('conversation')) {
      return 'messaging';
    }

    return 'unknown';
  };

  getErrorSeverity = (error: Error): 'low' | 'medium' | 'high' | 'critical' => {
    const errorType = this.getErrorType(error);
    const message = error.message.toLowerCase();

    if (errorType === 'authentication' || message.includes('unauthorized')) {
      return 'critical';
    }
    if (errorType === 'websocket' || errorType === 'network') {
      return 'high';
    }
    if (errorType === 'messaging') {
      return 'medium';
    }

    return 'low';
  };

  getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'high':
        return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'medium':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low':
      default:
        return 'text-blue-600 bg-blue-50 border-blue-200';
    }
  };

  getErrorIcon = (errorType: string) => {
    switch (errorType) {
      case 'websocket':
        return Wifi;
      case 'network':
        return AlertTriangle;
      case 'authentication':
        return AlertTriangle;
      case 'messaging':
        return MessageSquare;
      case 'cache':
        return RefreshCw;
      default:
        return Bug;
    }
  };

  getErrorSuggestions = (errorType: string, error: Error): string[] => {
    switch (errorType) {
      case 'websocket':
        return [
          'Check your internet connection',
          'Try refreshing the page',
          'WebSocket server may be temporarily unavailable',
        ];
      case 'network':
        return [
          'Check your internet connection',
          'Try again in a few moments',
          'Server may be temporarily unavailable',
        ];
      case 'authentication':
        return [
          'Please sign in again',
          'Your session may have expired',
          'Check your account permissions',
        ];
      case 'messaging':
        return [
          'Try refreshing the conversation',
          'Check if the conversation still exists',
          'Try sending the message again',
        ];
      case 'cache':
        return [
          'Try refreshing the page',
          'Clear browser cache and try again',
          'Data synchronization issue occurred',
        ];
      default:
        return [
          'Try refreshing the page',
          'If the problem persists, contact support',
          'Check browser console for more details',
        ];
    }
  };

  generateSupportInfo = () => {
    return {
      errorId: this.state.errorId,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      error: this.state.error?.name,
      message: this.state.error?.message,
      retryCount: this.state.retryCount,
    };
  };

  render() {
    if (this.state.hasError && this.state.error) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const errorType = this.getErrorType(this.state.error);
      const severity = this.getErrorSeverity(this.state.error);
      const ErrorIcon = this.getErrorIcon(errorType);
      const suggestions = this.getErrorSuggestions(errorType, this.state.error);
      const supportInfo = this.generateSupportInfo();

      return (
        <div className={cn("max-w-2xl mx-auto p-4", this.props.className)}>
          <Card className="border-2">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 rounded-full">
                  <ErrorIcon className="w-5 h-5 text-red-600" />
                </div>
                <div className="flex-1">
                  <CardTitle className="text-lg flex items-center gap-2">
                    Something went wrong
                    <Badge 
                      variant="outline" 
                      className={cn("text-xs", this.getSeverityColor(severity))}
                    >
                      {severity.toUpperCase()}
                    </Badge>
                  </CardTitle>
                  <CardDescription className="text-sm mt-1">
                    An error occurred in the messaging system
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Error Details */}
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Error Details</AlertTitle>
                <AlertDescription className="mt-2">
                  <p className="font-medium">{this.state.error.name}</p>
                  <p className="text-sm text-gray-600 mt-1">
                    {this.state.error.message}
                  </p>
                  {this.state.errorId && (
                    <p className="text-xs text-gray-400 mt-2">
                      Error ID: {this.state.errorId}
                    </p>
                  )}
                </AlertDescription>
              </Alert>

              {/* Suggestions */}
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Suggested actions:</h4>
                <ul className="space-y-1 text-sm text-gray-600">
                  {suggestions.map((suggestion, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="w-1 h-1 bg-gray-400 rounded-full mt-2 shrink-0" />
                      {suggestion}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap gap-2 pt-2">
                {this.state.retryCount < this.maxRetries && (
                  <Button onClick={this.handleRetry} size="sm" className="flex items-center gap-2">
                    <RefreshCw className="w-4 h-4" />
                    Try Again ({this.maxRetries - this.state.retryCount} left)
                  </Button>
                )}
                
                <Button onClick={this.handleReload} variant="outline" size="sm">
                  Reload Page
                </Button>

                {this.props.showDetails && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      const info = JSON.stringify(supportInfo, null, 2);
                      navigator.clipboard?.writeText(info);
                      logger.info('MessagingErrorBoundary', 'Support info copied to clipboard');
                    }}
                    className="flex items-center gap-2"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Copy Debug Info
                  </Button>
                )}
              </div>

              {/* Debug Information (Development Only) */}
              {process.env.NODE_ENV === 'development' && this.props.showDetails && (
                <details className="mt-4">
                  <summary className="cursor-pointer text-sm font-medium text-gray-600 hover:text-gray-800">
                    Debug Information (Development)
                  </summary>
                  <pre className="mt-2 p-3 bg-gray-100 rounded text-xs overflow-auto max-h-40">
                    {JSON.stringify(supportInfo, null, 2)}
                    {this.state.errorInfo && (
                      <>
                        {'\n\nComponent Stack:'}
                        {this.state.errorInfo.componentStack}
                      </>
                    )}
                  </pre>
                </details>
              )}
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

// HOC for wrapping components with error boundary
export function withMessagingErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Partial<MessagingErrorBoundaryProps>
) {
  const WrappedComponent = (props: P) => (
    <MessagingErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </MessagingErrorBoundary>
  );

  WrappedComponent.displayName = `withMessagingErrorBoundary(${Component.displayName || Component.name})`;
  
  return WrappedComponent;
}

// Lightweight error boundary for specific messaging features
export function MessagingFeatureErrorBoundary({ 
  children, 
  featureName,
  className 
}: { 
  children: ReactNode; 
  featureName: string;
  className?: string;
}) {
  return (
    <MessagingErrorBoundary
      className={className}
      fallback={
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center gap-2 text-yellow-800">
            <AlertTriangle className="w-4 h-4" />
            <p className="text-sm font-medium">
              {featureName} temporarily unavailable
            </p>
          </div>
          <p className="text-xs text-yellow-600 mt-1">
            This feature encountered an error and will retry automatically.
          </p>
        </div>
      }
    >
      {children}
    </MessagingErrorBoundary>
  );
}

export default MessagingErrorBoundary;