'use client';
import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

export default function OAuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { handleOAuthCallback } = useAuth();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const token = searchParams.get('token');
        const error = searchParams.get('error');

        if (error) {
          throw new Error(`OAuth failed: ${error}`);
        }

        if (token) {
          await handleOAuthCallback(token);
          router.push('/user/dashboard');
        } else {
          throw new Error('No token received from OAuth callback');
        }
      } catch (error) {
        console.error('OAuth callback error:', error);
        router.push('/auth/sign-in?error=oauth_failed');
      }
    };

    handleCallback();
  }, [searchParams, router, handleOAuthCallback]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-xl font-semibold mb-4">Completing sign-in...</h2>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
      </div>
    </div>
  );
}