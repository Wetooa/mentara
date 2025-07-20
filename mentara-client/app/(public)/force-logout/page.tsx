'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';

export default function ForceLogoutPage() {
  const { logout, isAuthenticated } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(true);

  useEffect(() => {
    // Call AuthContext logout function immediately when component mounts
    logout();
    setIsLoggingOut(false);
  }, [logout]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="flex flex-col items-center justify-center gap-4">
        {isLoggingOut ? (
          <>
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            <p className="text-sm text-gray-500">Logging out...</p>
          </>
        ) : (
          <>
            <div className="text-center">
              <p className="text-sm text-gray-500">Logged out successfully. Redirecting...</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}