'use client';

import React from 'react';
import { AlertTriangle, RefreshCw, Home, Heart, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { handleError } from '@/lib/errors/standardErrorHandler';
import { MentaraApiError } from '@/lib/api/errorHandler';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: ErrorProps) {
  React.useEffect(() => {
    // Use the standardized error handler for consistent logging and reporting
    const apiError = error instanceof MentaraApiError ? error : new Error(error.message);
    handleError(apiError, {
      context: 'generic',
      showToast: false,
      showBoundary: true,
      logError: true,
      severity: 'critical',
      customMessage: 'A critical application error occurred',
    });
  }, [error]);

  const handleRefresh = () => {
    reset();
    // Track retry attempt
    handleError(new Error('User attempted error recovery'), {
      context: 'generic',
      showToast: false,
      logError: true,
      severity: 'low',
    });
  };

  const handleGoHome = () => {
    window.location.href = '/';
  };

  return (
    <html>
      <body className="font-[Futura] antialiased min-h-screen min-w-screen h-screen w-screen">
        <div className="min-h-screen bg-gradient-to-br from-tertiary via-background to-primary/5 flex items-center justify-center p-4">
          <Card className="w-full max-w-lg shadow-lg border-primary/20">
            <CardHeader className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 bg-red-50 border border-red-200 rounded-full flex items-center justify-center mb-4">
                <AlertTriangle className="h-8 w-8 text-red-500" />
              </div>
              <CardTitle className="text-2xl font-[Futura] text-foreground">
                We're Here to Help
              </CardTitle>
              <p className="text-muted-foreground leading-relaxed">
                Something unexpected happened, but don't worry - our team has been automatically notified and we're working to resolve this quickly.
              </p>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {/* Supportive Message */}
              <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 text-center">
                <Heart className="h-5 w-5 text-primary mx-auto mb-2" />
                <p className="text-sm text-primary/80">
                  Your mental health journey is important to us. If you need immediate support, please reach out to our crisis resources.
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
                
                <Button 
                  variant="outline" 
                  onClick={handleGoHome}
                  className="w-full border-primary/20 text-primary hover:bg-primary/5"
                  size="lg"
                >
                  <Home className="h-4 w-4 mr-2" />
                  Go to Homepage
                </Button>
              </div>

              {/* Crisis Support Information */}
              <div className="pt-4 border-t border-primary/10 text-center">
                <p className="text-sm text-muted-foreground mb-3">
                  Need immediate support?
                </p>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => window.open('tel:988', '_self')}
                  className="text-primary hover:bg-primary/5"
                >
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Crisis Helpline: 988
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </body>
    </html>
  );
}