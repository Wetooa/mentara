'use client';
// import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';

export default function ContinueWithMicrosoft() {
  // const router = useRouter();
  const { signInWithOAuth, isLoading } = useAuth();

  const handleMicrosoftOAuth = async () => {
    try {
      await signInWithOAuth("oauth_microsoft");
    } catch {
      // Microsoft OAuth initiation failed - error handling in hook
    }
  };

  return (
    <Button
      variant="outline"
      className="w-full"
      onClick={handleMicrosoftOAuth}
      type="button"
      disabled={isLoading}
    >
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="mr-2"
      >
        <path d="M11.4 2H2V11.4H11.4V2Z" fill="#F25022" />
        <path d="M11.4 12.6H2V22H11.4V12.6Z" fill="#00A4EF" />
        <path d="M22 2H12.6V11.4H22V2Z" fill="#7FBA00" />
        <path d="M22 12.6H12.6V22H22V12.6Z" fill="#FFB900" />
      </svg>
      Continue with Microsoft
    </Button>
  );
}
