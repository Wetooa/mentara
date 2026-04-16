'use client';

import React from 'react';
import { AlertTriangle, RefreshCw, LogOut, Home, Heart, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { handleError } from '@/lib/errors/standardErrorHandler';
import { MentaraApiError } from '@/lib/api/errorHandler';

interface ProtectedErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ProtectedError({ error, reset }: ProtectedErrorProps) {
  const router = useRouter();
  const { user, logout } = useAuth();

  React.useEffect(() => {
    // Use the standardized error handler for consistent logging and reporting
    const apiError = error instanceof MentaraApiError ? error : new Error(error.message);
    handleError(apiError, {
      context: 'authentication',
      showToast: false,
      showBoundary: true,
      logError: true,
      severity: 'high',
      customMessage: 'Protected route error occurred',
    });
  }, [error]);

  const getRoleBasedDashboard = () => {
    if (!user) return '/';

    switch (user.role) {
      case 'client':
        return '/client';
      case 'therapist':
        return '/therapist';
      case 'moderator':
        return '/moderator';
      case 'admin':
        return '/admin';
      default:
        return '/';
    }
  };

  const getRoleBasedMessage = () => {
    if (!user) {
      return "There was an issue with your session. This might be a temporary problem with authentication.";
    }

    switch (user.role) {
      case 'client':
        return "We experienced an issue accessing your client area. This might be a temporary session problem, and your therapy progress is still safe.";
      case 'therapist':
        return "There was an issue accessing your therapist dashboard. Your client data and appointments remain secure.";
      case 'moderator':
        return "We experienced an issue with your moderation panel. The community platform is still protected.";
      case 'admin':
        return "There was an issue accessing the admin panel. All platform systems remain secure.";
      default:
        return "There was an issue with your session. Let's get you safely back on track.";
    }
  };

  const handleRefresh = () => {
    reset();
    // Track retry attempt
    handleError(new Error('User attempted protected route error recovery'), {
      context: 'authentication',
      showToast: false,
      logError: true,
      severity: 'low',
    });
  };

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/');
    } catch (err) {
      // Fallback if logout fails
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      window.location.href = '/';
    }
  };

  const handleGoToDashboard = () => {
    const dashboardPath = getRoleBasedDashboard();
    router.push(dashboardPath);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-tertiary via-background to-primary/5 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg shadow-lg border-primary/20">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-orange-50 border border-orange-200 rounded-full flex items-center justify-center mb-4">
            <Shield className="h-8 w-8 text-orange-500" />
          </div>
          <CardTitle className="text-2xl font-[Futura] text-foreground">
            Session Issue Detected
          </CardTitle>
          <p className="text-muted-foreground leading-relaxed">
            {getRoleBasedMessage()}
          </p>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Supportive Message */}
          <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 text-center">
            <Heart className="h-5 w-5 text-primary mx-auto mb-2" />
            <p className="text-sm text-primary/80">
              Your privacy and data security are our top priorities. All your information remains protected.
            </p>
          </div>

          {/* Development Error Details */}
          {process.env.NODE_ENV === 'development' && (
            <div className="p-3 bg-muted border border-orange-200 rounded-lg">
              <p className="text-xs font-mono text-orange-700 mb-2">
                <strong>Development Error:</strong> {error.message}
              </p>
              {error.digest && (
                <p className="text-xs font-mono text-muted-foreground">
                  Error ID: {error.digest}
                </p>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button
              onClick={handleRefresh}
              className="w-full bg-primary hover:bg-primary/90 text-white"
              size="lg"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>

            {user && (
              <Button
                variant="outline"
                onClick={handleGoToDashboard}
                className="w-full border-primary/20 text-primary hover:bg-primary/5"
                size="lg"
              >
                <Home className="h-4 w-4 mr-2" />
                Go to My Dashboard
              </Button>
            )}

            <Button
              variant="outline"
              onClick={handleLogout}
              className="w-full border-orange-200 text-orange-600 hover:bg-orange-50"
              size="lg"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out & Start Fresh
            </Button>
          </div>

          {/* Additional Help */}
          <div className="pt-4 border-t border-primary/10 text-center">
            <p className="text-xs text-muted-foreground">
              If this problem continues, please contact our support team. Your mental health journey is important to us.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
