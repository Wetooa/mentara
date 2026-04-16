import { useCallback } from 'react';
import { useApi } from '@/lib/api';
import { ErrorContext, ErrorSeverity } from '@/lib/errors/standardErrorHandler';
import { MentaraApiError } from '@/lib/api/errorHandler';
import { useAuth } from '@/contexts/AuthContext';

// Error report data structure
interface ErrorReport {
  id: string;
  timestamp: string;
  context: ErrorContext;
  severity: ErrorSeverity;
  error: {
    name: string;
    message: string;
    stack?: string;
    status?: number;
    code?: string;
    details?: any;
  };
  user?: {
    id: string;
    role: string;
    email: string;
  };
  session: {
    userAgent: string;
    url: string;
    timestamp: string;
  };
  metadata?: Record<string, any>;
}

// Error reporting configuration
interface ErrorReportingConfig {
  context: ErrorContext;
  severity?: ErrorSeverity;
  metadata?: Record<string, any>;
  immediate?: boolean; // Send immediately vs batched
}

export function useErrorReporting() {
  const api = useApi();
  const { user } = useAuth();

  // Generate unique error ID
  const generateErrorId = useCallback(() => {
    return `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  // Create error report payload
  const createErrorReport = useCallback((
    error: Error | MentaraApiError,
    config: ErrorReportingConfig
  ): ErrorReport => {
    const errorId = generateErrorId();
    
    return {
      id: errorId,
      timestamp: new Date().toISOString(),
      context: config.context,
      severity: config.severity || 'medium',
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
      ...(user && {
        user: {
          id: user.id,
          role: user.role,
          email: user.email,
        },
      }),
      session: {
        userAgent: navigator.userAgent,
        url: window.location.href,
        timestamp: new Date().toISOString(),
      },
      ...(config.metadata && { metadata: config.metadata }),
    };
  }, [user, generateErrorId]);

  // Send error report to analytics service
  const reportError = useCallback(async (
    error: Error | MentaraApiError,
    config: ErrorReportingConfig
  ): Promise<void> => {
    try {
      const errorReport = createErrorReport(error, config);
      
      // Send to analytics service (assuming there's an analytics endpoint)
      await api.post('/analytics/errors', errorReport);
      
      // Log success in development
      if (process.env.NODE_ENV === 'development') {
        console.log('📊 Error report sent:', errorReport);
      }
    } catch (reportingError) {
      // Silently fail - don't create infinite error loops
      if (process.env.NODE_ENV === 'development') {
        console.error('Failed to send error report:', reportingError);
      }
    }
  }, [api, createErrorReport]);

  // Report critical errors immediately
  const reportCriticalError = useCallback(async (
    error: Error | MentaraApiError,
    context: ErrorContext,
    metadata?: Record<string, any>
  ): Promise<void> => {
    return reportError(error, {
      context,
      severity: 'critical',
      metadata,
      immediate: true,
    });
  }, [reportError]);

  // Report authentication errors
  const reportAuthError = useCallback(async (
    error: Error | MentaraApiError,
    metadata?: Record<string, any>
  ): Promise<void> => {
    return reportError(error, {
      context: 'authentication',
      severity: 'high',
      metadata,
      immediate: true,
    });
  }, [reportError]);

  // Report user action errors (lower priority)
  const reportUserActionError = useCallback(async (
    error: Error | MentaraApiError,
    context: ErrorContext,
    metadata?: Record<string, any>
  ): Promise<void> => {
    return reportError(error, {
      context,
      severity: 'medium',
      metadata,
      immediate: false,
    });
  }, [reportError]);

  // Get error statistics for debugging
  const getErrorStats = useCallback(async () => {
    try {
      const response = await api.get('/analytics/errors/stats');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch error stats:', error);
      return null;
    }
  }, [api]);

  // Convenience method for 404 errors
  const report404Error = useCallback(async (path: string) => {
    const error = new Error(`Page not found: ${path}`);
    return reportError(error, {
      context: 'generic',
      severity: 'low',
      metadata: {
        errorType: '404',
        requestedPath: path,
        referrer: document.referrer,
      },
    });
  }, [reportError]);

  // Convenience method for API errors
  const reportApiError = useCallback(async (
    error: MentaraApiError,
    context: ErrorContext,
    endpoint?: string
  ) => {
    return reportError(error, {
      context,
      severity: error.status >= 500 ? 'critical' : 'medium',
      metadata: {
        endpoint,
        statusCode: error.status,
        responseTime: error.details?.responseTime,
      },
    });
  }, [reportError]);

  return {
    reportError,
    reportCriticalError,
    reportAuthError,
    reportUserActionError,
    report404Error,
    reportApiError,
    getErrorStats,
    createErrorReport,
  };
}

// Type exports for consumers
export type { ErrorReport, ErrorReportingConfig };