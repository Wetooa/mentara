import React from 'react';
import { Loader2, UserCheck } from 'lucide-react';

export default function TherapistLoading() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="flex flex-col items-center space-y-4">
        <div className="flex items-center space-x-2">
          <UserCheck className="h-6 w-6 text-primary" />
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
        <p className="text-sm text-muted-foreground">Loading therapist dashboard...</p>
      </div>
    </div>
  );
}