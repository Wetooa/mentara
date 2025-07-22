'use client';

import React from 'react';
import { User, RefreshCw, ArrowLeft, MessageSquare, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useRouter, usePathname } from 'next/navigation';

interface UserErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function UserError({ error, reset }: UserErrorProps) {
  const router = useRouter();
  const pathname = usePathname();

  React.useEffect(() => {
    console.error('Client error:', error, 'on path:', pathname);
  }, [error, pathname]);

  // Determine context based on current route
  const getErrorContext = () => {
    if (pathname?.includes('/messages')) {
      return {
        title: 'Messaging Error',
        description: 'Something went wrong with the messaging system. Your conversations are safe.',
        icon: MessageSquare,
        backAction: () => router.push('/client/messages'),
        backLabel: 'Back to Messages'
      };
    }
    
    // Default to dashboard context
    return {
      title: 'Dashboard Error', 
      description: 'Something went wrong with your dashboard. Your progress is safe.',
      icon: User,
      backAction: () => router.push('/client'),
      backLabel: 'Back to Dashboard'
    };
  };

  const context = getErrorContext();
  const IconComponent = context.icon;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <IconComponent className="h-6 w-6 text-red-600" />
          </div>
          <CardTitle className="text-xl">{context.title}</CardTitle>
          <p className="text-sm text-muted-foreground">
            {context.description}
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
              onClick={context.backAction}
              className="w-full"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              {context.backLabel}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}