"use client";

import React, { Component, ReactNode, ErrorInfo } from "react";
import { MentaraApiError } from "@/lib/api/errorHandler";
import { ErrorContext, StandardErrorHandler } from "@/lib/errors/standardErrorHandler";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, RefreshCw, Home, Bug, ChevronDown, ChevronUp } from "lucide-react";

// Error boundary props
interface StandardErrorBoundaryProps {
  children: ReactNode;
  context: ErrorContext;
  fallbackTitle?: string;
  fallbackMessage?: string;
  showErrorDetails?: boolean;
  showRetryButton?: boolean;
  showHomeButton?: boolean;
  showReportButton?: boolean;
  onRetry?: () => void;
  onHome?: () => void;
  onReport?: (error: Error, errorInfo: ErrorInfo) => void;
  className?: string;
}

// Error boundary state
interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  showDetails: boolean;
  retryCount: number;
}

// Default error messages by context
const DEFAULT_ERROR_TITLES: Record<ErrorContext, string> = {
  authentication: "Authentication Error",
  billing: "Payment Error",
  booking: "Booking Error",
  messaging: "Messaging Error",
  worksheets: "Worksheet Error",
  community: "Community Error",
  profile: "Profile Error",
  therapist: "Therapist Error",
  admin: "Admin Error",
  file_upload: "File Upload Error",
  meeting: "Meeting Error",
  notification: "Notification Error",
  generic: "Something went wrong",
};

const DEFAULT_ERROR_MESSAGES: Record<ErrorContext, string> = {
  authentication: "There was a problem with authentication. Please try signing in again.",
  billing: "There was a problem processing your payment. Please check your payment details and try again.",
  booking: "There was a problem with your booking. Please try again or contact support.",
  messaging: "There was a problem loading your messages. Please try again.",
  worksheets: "There was a problem loading your worksheet. Please try again.",
  community: "There was a problem loading community content. Please try again.",
  profile: "There was a problem loading your profile. Please try again.",
  therapist: "There was a problem loading therapist information. Please try again.",
  admin: "There was a problem loading admin data. Please try again.",
  file_upload: "There was a problem uploading your file. Please try again.",
  meeting: "There was a problem with the meeting. Please try again.",
  notification: "There was a problem loading notifications. Please try again.",
  generic: "An unexpected error occurred. Please try again.",
};

export class StandardErrorBoundary extends Component<StandardErrorBoundaryProps, ErrorBoundaryState> {
  private errorHandler: StandardErrorHandler;
  private maxRetries: number = 3;

  constructor(props: StandardErrorBoundaryProps) {
    super(props);
    this.errorHandler = StandardErrorHandler.getInstance();
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      showDetails: false,
      retryCount: 0,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error using standardized error handler
    this.errorHandler.handleError(error, {
      context: this.props.context,
      showToast: false, // Don't show toast for boundary errors
      showBoundary: true,
      logError: true,
      severity: "high",
    });

    // Update state with error info
    this.setState({
      errorInfo,
    });

    // Call custom report handler
    this.props.onReport?.(error, errorInfo);
  }

  private handleRetry = () => {
    const { retryCount } = this.state;
    
    if (retryCount < this.maxRetries) {
      this.setState({
        hasError: false,
        error: null,
        errorInfo: null,
        retryCount: retryCount + 1,
      });
      
      this.props.onRetry?.();
    }
  };

  private handleHome = () => {
    this.props.onHome?.();
    // Default home navigation
    if (!this.props.onHome) {
      window.location.href = "/";
    }
  };

  private handleReport = () => {
    if (this.state.error && this.state.errorInfo) {
      this.props.onReport?.(this.state.error, this.state.errorInfo);
    }
  };

  private toggleDetails = () => {
    this.setState(prevState => ({
      showDetails: !prevState.showDetails,
    }));
  };

  private getErrorTitle(): string {
    return this.props.fallbackTitle || DEFAULT_ERROR_TITLES[this.props.context];
  }

  private getErrorMessage(): string {
    return this.props.fallbackMessage || DEFAULT_ERROR_MESSAGES[this.props.context];
  }

  private getErrorCode(): string {
    const { error } = this.state;
    if (error instanceof MentaraApiError) {
      return error.code || `HTTP_${error.status}`;
    }
    return error?.name || "UNKNOWN_ERROR";
  }

  private canRetry(): boolean {
    return this.state.retryCount < this.maxRetries && this.props.showRetryButton !== false;
  }

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    const { error, errorInfo, showDetails, retryCount } = this.state;
    const {
      showErrorDetails = false,
      showHomeButton = true,
      showReportButton = false,
      className = "",
    } = this.props;

    return (
      <div className={`flex items-center justify-center min-h-[400px] p-4 ${className}`}>
        <Card className="max-w-lg w-full">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="rounded-full bg-red-100 p-3">
                <AlertTriangle className="h-8 w-8 text-red-600" />
              </div>
            </div>
            <CardTitle className="text-xl font-semibold text-gray-900">
              {this.getErrorTitle()}
            </CardTitle>
            <CardDescription className="text-gray-600">
              {this.getErrorMessage()}
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {/* Error Code */}
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Error Code:</strong> {this.getErrorCode()}
                {retryCount > 0 && (
                  <span className="ml-2 text-sm text-gray-500">
                    (Attempt {retryCount + 1}/{this.maxRetries + 1})
                  </span>
                )}
              </AlertDescription>
            </Alert>

            {/* Error Details */}
            {(showErrorDetails || showDetails) && error && (
              <div className="space-y-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={this.toggleDetails}
                  className="w-full justify-between"
                >
                  <span>Error Details</span>
                  {showDetails ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </Button>
                
                {showDetails && (
                  <div className="bg-gray-50 p-3 rounded-md text-sm">
                    <div className="mb-2">
                      <strong>Message:</strong> {error.message}
                    </div>
                    {error.stack && (
                      <div className="mb-2">
                        <strong>Stack:</strong>
                        <pre className="mt-1 text-xs bg-gray-100 p-2 rounded overflow-x-auto">
                          {error.stack}
                        </pre>
                      </div>
                    )}
                    {errorInfo && (
                      <div>
                        <strong>Component Stack:</strong>
                        <pre className="mt-1 text-xs bg-gray-100 p-2 rounded overflow-x-auto">
                          {errorInfo.componentStack}
                        </pre>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-2">
              {this.canRetry() && (
                <Button
                  onClick={this.handleRetry}
                  className="flex-1 flex items-center justify-center gap-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  Try Again
                </Button>
              )}
              
              {showHomeButton && (
                <Button
                  variant="outline"
                  onClick={this.handleHome}
                  className="flex-1 flex items-center justify-center gap-2"
                >
                  <Home className="h-4 w-4" />
                  Go Home
                </Button>
              )}
              
              {showReportButton && (
                <Button
                  variant="outline"
                  onClick={this.handleReport}
                  className="flex-1 flex items-center justify-center gap-2"
                >
                  <Bug className="h-4 w-4" />
                  Report Issue
                </Button>
              )}
            </div>

            {/* Additional Help */}
            <div className="text-center text-sm text-gray-500">
              If this problem persists, please contact support.
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
}

// Convenience wrapper components for specific contexts
export function AuthErrorBoundary({ children, ...props }: Omit<StandardErrorBoundaryProps, 'context'>) {
  return (
    <StandardErrorBoundary context="authentication" {...props}>
      {children}
    </StandardErrorBoundary>
  );
}

export function BillingErrorBoundary({ children, ...props }: Omit<StandardErrorBoundaryProps, 'context'>) {
  return (
    <StandardErrorBoundary context="billing" {...props}>
      {children}
    </StandardErrorBoundary>
  );
}

export function BookingErrorBoundary({ children, ...props }: Omit<StandardErrorBoundaryProps, 'context'>) {
  return (
    <StandardErrorBoundary context="booking" {...props}>
      {children}
    </StandardErrorBoundary>
  );
}

export function MessagingErrorBoundary({ children, ...props }: Omit<StandardErrorBoundaryProps, 'context'>) {
  return (
    <StandardErrorBoundary context="messaging" {...props}>
      {children}
    </StandardErrorBoundary>
  );
}

export function CommunityErrorBoundary({ children, ...props }: Omit<StandardErrorBoundaryProps, 'context'>) {
  return (
    <StandardErrorBoundary context="community" {...props}>
      {children}
    </StandardErrorBoundary>
  );
}

export function WorksheetErrorBoundary({ children, ...props }: Omit<StandardErrorBoundaryProps, 'context'>) {
  return (
    <StandardErrorBoundary context="worksheets" {...props}>
      {children}
    </StandardErrorBoundary>
  );
}

export function MeetingErrorBoundary({ children, ...props }: Omit<StandardErrorBoundaryProps, 'context'>) {
  return (
    <StandardErrorBoundary context="meeting" {...props}>
      {children}
    </StandardErrorBoundary>
  );
}

export function AdminErrorBoundary({ children, ...props }: Omit<StandardErrorBoundaryProps, 'context'>) {
  return (
    <StandardErrorBoundary context="admin" {...props}>
      {children}
    </StandardErrorBoundary>
  );
}

export function GenericErrorBoundary({ children, ...props }: Omit<StandardErrorBoundaryProps, 'context'>) {
  return (
    <StandardErrorBoundary context="generic" {...props}>
      {children}
    </StandardErrorBoundary>
  );
}