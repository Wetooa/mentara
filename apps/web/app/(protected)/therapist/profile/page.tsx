'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { getProfileUrl } from '@/lib/utils';

/**
 * Therapist Profile Page - No ID Route
 * Redirects to the logged-in user's profile page
 */
export default function TherapistProfileRedirectPage() {
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      // Redirect to the user's profile using the helper function
      const profileUrl = getProfileUrl(user.role, user.id);
      router.replace(profileUrl);
    } else {
      // If no user is logged in, redirect to therapist dashboard
      router.replace('/therapist');
    }
  }, [user, router]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Redirecting to your profile...</p>
      </div>
    </div>
  );
}