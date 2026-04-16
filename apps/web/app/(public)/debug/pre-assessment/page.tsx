'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, X } from 'lucide-react';
import PreAssessmentTester from '@/components/debug/PreAssessmentTester';

export default function DebugPreAssessmentPage() {
  const [isDevelopment, setIsDevelopment] = useState(false);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
    // Check if we're in development mode
    const nodeEnv = process.env.NODE_ENV;
    const isDev = nodeEnv === 'development';
    setIsDevelopment(isDev);

    // Redirect if not in development
    if (!isDev && typeof window !== 'undefined') {
      router.push('/');
    }
  }, [router]);

  if (!mounted) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isDevelopment) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <Alert variant="destructive" className="max-w-md">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            This page is only available in development mode.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return <PreAssessmentTester />;
}

