import { toast } from "sonner";
import { MentaraApiError } from "@/lib/api/errorHandler";

// Standardized error context types
export type ErrorContext = 
  | "authentication"
  | "billing"
  | "booking"
  | "messaging"
  | "worksheets"
  | "community"
  | "profile"
  | "therapist"
  | "admin"
  | "file_upload"
  | "meeting"
  | "notification"
  | "generic";

// Error severity levels
export type ErrorSeverity = "low" | "medium" | "high" | "critical";

// Error action types
export type ErrorAction = {
  label: string;
  action: () => void;
  variant?: "default" | "destructive";
};

// Standardized error handler configuration
export interface ErrorHandlerConfig {
  context: ErrorContext;
  showToast?: boolean;
  showBoundary?: boolean;
  logError?: boolean;
  customMessage?: string;
  action?: ErrorAction;
  severity?: ErrorSeverity;
  retryable?: boolean;
}

// Default error messages by context
const DEFAULT_ERROR_MESSAGES: Record<ErrorContext, string> = {
  authentication: "Authentication failed. Please sign in again.",
  billing: "Payment processing failed. Please try again.",
  booking: "Booking operation failed. Please try again.",
  messaging: "Message delivery failed. Please try again.",
  worksheets: "Worksheet operation failed. Please try again.",
  community: "Community operation failed. Please try again.",
  profile: "Profile update failed. Please try again.",
  therapist: "Therapist operation failed. Please try again.",
  admin: "Admin operation failed. Please try again.",
  file_upload: "File upload failed. Please try again.",
  meeting: "Meeting operation failed. Please try again.",
  notification: "Notification operation failed. Please try again.",
  generic: "Something went wrong. Please try again.",
};

// Error severity mapping
const ERROR_SEVERITY_MAP: Record<number, ErrorSeverity> = {
  400: "medium",  // Bad Request
  401: "high",    // Unauthorized
  403: "high",    // Forbidden
  404: "medium",  // Not Found
  409: "medium",  // Conflict
  422: "medium",  // Validation Error
  429: "medium",  // Rate Limited
  500: "critical", // Internal Server Error
  502: "critical", // Bad Gateway
  503: "critical", // Service Unavailable
  504: "critical", // Gateway Timeout
};

// Standardized error handler class
export class StandardErrorHandler {
  private static instance: StandardErrorHandler;
  private errorCounts: Map<string, number> = new Map();
  private lastErrorTime: Map<string, number> = new Map();

  private constructor() {}

  public static getInstance(): StandardErrorHandler {
    if (!StandardErrorHandler.instance) {
      StandardErrorHandler.instance = new StandardErrorHandler();
    }
    return StandardErrorHandler.instance;
  }

  // Main error handling method
  public handleError(error: MentaraApiError | Error, config: ErrorHandlerConfig): void {
    const errorKey = this.getErrorKey(error, config.context);
    
    // Prevent spam of same error
    if (this.isDuplicateError(errorKey)) {
      return;
    }

    const severity = this.determineSeverity(error, config);
    const message = this.getErrorMessage(error, config);
    
    // Log error if enabled
    if (config.logError !== false) {
      this.logError(error, config, severity);
    }

    // Show toast notification
    if (config.showToast !== false) {
      this.showToast(message, severity, config.action);
    }

    // Track error occurrence
    this.trackError(errorKey);

    // Handle specific error types
    this.handleSpecificErrors(error, config);
  }

  // Determine error severity
  private determineSeverity(error: MentaraApiError | Error, config: ErrorHandlerConfig): ErrorSeverity {
    if (config.severity) {
      return config.severity;
    }

    if (error instanceof MentaraApiError) {
      return ERROR_SEVERITY_MAP[error.status] || "medium";
    }

    return "medium";
  }

  // Get appropriate error message
  private getErrorMessage(error: MentaraApiError | Error, config: ErrorHandlerConfig): string {
    // Use custom message if provided
    if (config.customMessage) {
      return config.customMessage;
    }

    // Use error message from API if available
    if (error instanceof MentaraApiError && error.message) {
      return error.message;
    }

    // Use error message from standard Error
    if (error.message && error.message !== "Network Error") {
      return error.message;
    }

    // Fall back to default message for context
    return DEFAULT_ERROR_MESSAGES[config.context];
  }

  // Show toast notification based on severity
  private showToast(message: string, severity: ErrorSeverity, action?: ErrorAction): void {
    const toastOptions = {
      description: message,
      duration: this.getToastDuration(severity),
      action: action ? {
        label: action.label,
        onClick: action.action,
      } : undefined,
    };

    switch (severity) {
      case "critical":
        toast.error("Critical Error", toastOptions);
        break;
      case "high":
        toast.error("Error", toastOptions);
        break;
      case "medium":
        toast.warning("Warning", toastOptions);
        break;
      case "low":
        toast.info("Notice", toastOptions);
        break;
    }
  }

  // Get toast duration based on severity
  private getToastDuration(severity: ErrorSeverity): number {
    switch (severity) {
      case "critical":
        return 10000; // 10 seconds
      case "high":
        return 8000;  // 8 seconds
      case "medium":
        return 5000;  // 5 seconds
      case "low":
        return 3000;  // 3 seconds
      default:
        return 5000;
    }
  }

  // Log error for monitoring
  private logError(error: MentaraApiError | Error, config: ErrorHandlerConfig, severity: ErrorSeverity): void {
    const logData = {
      timestamp: new Date().toISOString(),
      context: config.context,
      severity,
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack,
        ...(error instanceof MentaraApiError && {
          status: error.status,
          code: error.code,
          details: error.details,
        }),
      },
    };

    // Log to console in development
    if (process.env.NODE_ENV === "development") {
      console.group(`🚨 Error [${severity.toUpperCase()}] - ${config.context}`);
      console.error(error);
      console.log("Context:", config);
      console.log("Log Data:", logData);
      console.groupEnd();
    }

    // In production, send to monitoring service
    if (process.env.NODE_ENV === "production") {
      // TODO: Integrate with monitoring service (Sentry, LogRocket, etc.)
      // monitoringService.captureError(error, logData);
    }
  }

  // Handle specific error types
  private handleSpecificErrors(error: MentaraApiError | Error, config: ErrorHandlerConfig): void {
    if (error instanceof MentaraApiError) {
      switch (error.status) {
        case 401:
          this.handleUnauthorizedError(error, config);
          break;
        case 403:
          this.handleForbiddenError(error, config);
          break;
        case 429:
          this.handleRateLimitError(error, config);
          break;
        case 500:
        case 502:
        case 503:
        case 504:
          this.handleServerError(error, config);
          break;
      }
    }
  }

  // Handle unauthorized errors
  private handleUnauthorizedError(error: MentaraApiError, config: ErrorHandlerConfig): void {
    // Could trigger logout or redirect to login
    console.warn("Unauthorized error - may need to redirect to login", { error, config });
  }

  // Handle forbidden errors
  private handleForbiddenError(error: MentaraApiError, config: ErrorHandlerConfig): void {
    // Could show access denied message or redirect
    console.warn("Forbidden error - user lacks permission", { error, config });
  }

  // Handle rate limit errors
  private handleRateLimitError(error: MentaraApiError, config: ErrorHandlerConfig): void {
    // Could implement exponential backoff
    console.warn("Rate limit exceeded - implementing backoff", { error, config });
  }

  // Handle server errors
  private handleServerError(error: MentaraApiError, config: ErrorHandlerConfig): void {
    // Could implement retry logic or show maintenance message
    console.warn("Server error - may need retry logic", { error, config });
  }

  // Generate unique error key
  private getErrorKey(error: MentaraApiError | Error, context: ErrorContext): string {
    const errorType = error instanceof MentaraApiError ? error.status : error.name;
    return `${context}:${errorType}:${error.message}`;
  }

  // Check if this is a duplicate error within time window
  private isDuplicateError(errorKey: string): boolean {
    const now = Date.now();
    const lastTime = this.lastErrorTime.get(errorKey) || 0;
    const timeDiff = now - lastTime;
    
    // Prevent duplicate errors within 5 seconds
    return timeDiff < 5000;
  }

  // Track error occurrence
  private trackError(errorKey: string): void {
    const now = Date.now();
    const currentCount = this.errorCounts.get(errorKey) || 0;
    
    this.errorCounts.set(errorKey, currentCount + 1);
    this.lastErrorTime.set(errorKey, now);
  }

  // Get error statistics
  public getErrorStats(): { key: string; count: number; lastOccurrence: number }[] {
    const stats: { key: string; count: number; lastOccurrence: number }[] = [];
    
    for (const [key, count] of this.errorCounts.entries()) {
      stats.push({
        key,
        count,
        lastOccurrence: this.lastErrorTime.get(key) || 0,
      });
    }
    
    return stats.sort((a, b) => b.lastOccurrence - a.lastOccurrence);
  }

  // Clear error statistics
  public clearErrorStats(): void {
    this.errorCounts.clear();
    this.lastErrorTime.clear();
  }
}

// Convenience function for error handling
export function handleError(error: MentaraApiError | Error, config: ErrorHandlerConfig): void {
  StandardErrorHandler.getInstance().handleError(error, config);
}

// Hook for using the standardized error handler
export function useStandardErrorHandler() {
  const handler = StandardErrorHandler.getInstance();

  return {
    handleError: (error: MentaraApiError | Error, config: ErrorHandlerConfig) => {
      handler.handleError(error, config);
    },
    getErrorStats: () => handler.getErrorStats(),
    clearErrorStats: () => handler.clearErrorStats(),
  };
}