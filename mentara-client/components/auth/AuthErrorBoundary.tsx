"use client";

import React from "react";
import { ErrorBoundary } from "react-error-boundary";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MentaraApiError } from "@/lib/api/errorHandler";

interface AuthErrorFallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
}

function AuthErrorFallback({ error, resetErrorBoundary }: AuthErrorFallbackProps) {
  const isAuthError = error instanceof MentaraApiError && [401, 403].includes(error.status);
  const isNetworkError = error instanceof MentaraApiError && [500, 502, 503, 504].includes(error.status);
  const isValidationError = error instanceof MentaraApiError && error.status === 422;

  const getErrorTitle = () => {
    if (isAuthError) return "Authentication Error";
    if (isNetworkError) return "Connection Error";
    if (isValidationError) return "Validation Error";
    return "Something went wrong";
  };

  const getErrorMessage = () => {
    if (isAuthError) {
      return "Your session has expired or you don't have permission to access this resource. Please sign in again.";
    }
    if (isNetworkError) {
      return "We're having trouble connecting to our servers. Please check your internet connection and try again.";
    }
    if (isValidationError) {
      return "The information provided is invalid. Please check your input and try again.";
    }
    return error.message || "An unexpected error occurred. Our team has been notified.";
  };

  const getErrorActions = () => {
    if (isAuthError) {
      return (
        <div className="flex gap-2">
          <Button 
            onClick={resetErrorBoundary} 
            variant="outline" 
            size="sm"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Try Again
          </Button>
          <Button 
            onClick={() => {
              // Clear any stored auth tokens
              localStorage.removeItem("access_token");
              localStorage.removeItem("refresh_token");
              window.location.href = "/client/sign-in";
            }} 
            size="sm"
          >
            Sign In
          </Button>
        </div>
      );
    }

    return (
      <Button 
        onClick={resetErrorBoundary} 
        variant="outline" 
        size="sm"
      >
        <RefreshCw className="mr-2 h-4 w-4" />
        Try Again
      </Button>
    );
  };

  // Log error for monitoring
  React.useEffect(() => {
    console.error("Auth Error Boundary triggered:", {
      error: error.message,
      stack: error.stack,
      type: error.constructor.name,
      timestamp: new Date().toISOString(),
    });
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md mx-auto border-red-200 shadow-lg">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
            <AlertTriangle className="h-6 w-6 text-red-600" />
          </div>
          <CardTitle className="text-red-700 text-lg">
            {getErrorTitle()}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-center">
          <p className="text-sm text-gray-600 leading-relaxed">
            {getErrorMessage()}
          </p>
          
          {/* Error details for development */}
          {process.env.NODE_ENV === "development" && (
            <details className="text-left">
              <summary className="text-xs text-gray-500 cursor-pointer hover:text-gray-700">
                Error Details (Development)
              </summary>
              <pre className="mt-2 p-2 bg-gray-100 rounded text-xs text-gray-700 overflow-auto">
                {error.stack}
              </pre>
            </details>
          )}
          
          <div className="flex justify-center">
            {getErrorActions()}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

interface AuthErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<AuthErrorFallbackProps>;
}

export function AuthErrorBoundary({ 
  children, 
  fallback: FallbackComponent = AuthErrorFallback 
}: AuthErrorBoundaryProps) {
  return (
    <ErrorBoundary FallbackComponent={FallbackComponent}>
      {children}
    </ErrorBoundary>
  );
}