'use client';

import React from 'react';
import { User, RefreshCw, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useRouter } from 'next/navigation';

interface UserErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function UserError({ error, reset }: UserErrorProps) {
  const router = useRouter();

  React.useEffect(() => {
    console.error('User dashboard error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <User className="h-6 w-6 text-red-600" />
          </div>
          <CardTitle className="text-xl">Dashboard Error</CardTitle>
          <p className="text-sm text-muted-foreground">
            Something went wrong with your dashboard. Your progress is safe.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {process.env.NODE_ENV === 'development' && (
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-xs font-mono text-red-600">
                {error.message}
              </p>
            </div>
          )}
          
          <div className="space-y-2">
            <Button onClick={reset} className="w-full">
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
            <Button 
              variant="outline" 
              onClick={() => router.push('/client')}
              className="w-full"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}