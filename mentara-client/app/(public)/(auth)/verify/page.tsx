"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export default function VerifyPage() {
  const router = useRouter();
  const { isLoaded, handleOAuthCallback } = useAuth();

  useEffect(() => {
    const handleVerification = async () => {
      if (!isLoaded) return;

      try {
        toast.info("Verifying your account...");
        
        // Check for token from URL parameters (from email verification or OAuth)
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get('token');
        
        if (token) {
          // Handle OAuth callback or email verification
          await handleOAuthCallback(token);
          toast.success("Account verified successfully! Welcome to Mentara!");
          router.push("/user/onboarding/profile");
        } else {
          // Check if user is already authenticated (coming from email verification)
          toast.success("Email verified successfully! Welcome to Mentara!");
          router.push("/user/onboarding/profile");
        }
      } catch (error) {
        console.error("Verification error:", error);
        toast.error("Verification failed. Please try again.");
        router.push("/auth/sign-in");
      }
    };

    handleVerification();
  }, [isLoaded, handleOAuthCallback, router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <h2 className="text-lg font-semibold mb-2">Verifying your account...</h2>
        <p className="text-sm text-gray-600">
          Please wait while we verify your account.
        </p>
      </div>
    </div>
  );
}