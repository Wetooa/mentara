import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/auth';
import { useSignUpStore } from '@/store/pre-assessment';

interface UseEmailVerificationReturn {
  isLoading: boolean;
  isResending: boolean;
  resendVerificationEmail: () => Promise<void>;
  verificationStatus: 'pending' | 'sent' | 'error';
}

export function useEmailVerification(): UseEmailVerificationReturn {
  const { isLoaded } = useAuth();
  const { details } = useSignUpStore();
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<'pending' | 'sent' | 'error'>('pending');

  // Send initial verification email
  useEffect(() => {
    const sendInitialVerificationEmail = async () => {
      if (isLoaded && details?.email && verificationStatus === 'pending') {
        setIsLoading(true);
        try {
          // Note: Email verification is now handled by the backend
          // The verification link should be sent automatically upon registration
          toast.success("Verification email sent! Please check your inbox.");
          setVerificationStatus('sent');
        } catch (error) {
          console.error("Failed to send initial verification email:", error);
          setVerificationStatus('error');
          toast.error("Failed to send verification email. Please try resending.");
        } finally {
          setIsLoading(false);
        }
      }
    };

    sendInitialVerificationEmail();
  }, [isLoaded, details?.email, verificationStatus]);

  const resendVerificationEmail = async (): Promise<void> => {
    if (!isLoaded || !details?.email) {
      toast.error("Unable to resend email. Please try again later.");
      return;
    }

    setIsResending(true);
    
    try {
      const protocol = window.location.protocol;
      const host = window.location.host;

      toast.loading("Resending verification email...", { id: 'resend-email' });

      // TODO: Replace with proper API call when authentication system is implemented
      // For now, simulate email sending
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success("Verification email sent! Please check your inbox.", { id: 'resend-email' });
      setVerificationStatus('sent');
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      toast.error(`Failed to resend verification email. ${errorMessage}`, { id: 'resend-email' });
      setVerificationStatus('error');
    } finally {
      setIsResending(false);
    }
  };

  return {
    isLoading,
    isResending,
    resendVerificationEmail,
    verificationStatus
  };
}