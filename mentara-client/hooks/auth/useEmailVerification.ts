import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { useSignUpStore } from '@/store/pre-assessment';
import { sendOtpEmailAuto, formatExpiryTime } from '@/lib/api/services/email-backend.service';

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
          // Send initial verification email using backend service
          const result = await sendOtpEmailAuto({
            to_email: details.email,
            to_name: details.firstName || "User",
            type: 'registration',
            expires_in_minutes: 10
          });

          if (result.status === 'success') {
            toast.success("Verification email sent! Please check your inbox.");
            setVerificationStatus('sent');
          } else {
            throw new Error(result.message);
          }
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
      toast.loading("Resending verification email...", { id: 'resend-email' });

      // Use backend email service to send OTP email
      const result = await sendOtpEmailAuto({
        to_email: details.email,
        to_name: details.firstName || "User",
        type: 'registration',
        expires_in_minutes: 10
      });

      if (result.status === 'success') {
        toast.success("Verification email sent! Please check your inbox.", { id: 'resend-email' });
        setVerificationStatus('sent');
      } else {
        throw new Error(result.message);
      }
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