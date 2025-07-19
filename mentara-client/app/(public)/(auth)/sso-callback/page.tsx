"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
// useUser functionality now handled by useAuth
import { toast } from "sonner";

export default function SSOCallbackPage() {
  const router = useRouter();
  const { user, isLoaded, handleOAuthCallback } = useAuth();

  useEffect(() => {
    const handleSSOCallback = async () => {
      if (!isLoaded) return;

      try {
        toast.info("Completing authentication...");
        
        // Get token from URL parameters (OAuth callback)
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get('token');
        const code = urlParams.get('code');
        
        if (token || code) {
          // Handle OAuth callback with token
          const callbackToken = token || code;
          if (callbackToken) {
            await handleOAuthCallback(callbackToken);
          }
          
          // Check if user has pre-assessment data (indicates new user from pre-assessment flow)
          const pendingAssessmentData = localStorage.getItem("pendingAssessmentData");
          
          if (pendingAssessmentData) {
            // Clear assessment data and redirect to welcome
            localStorage.removeItem("pendingAssessmentData");
            toast.success("Welcome! Your account has been created.");
            router.push("/user/welcome");
          } else {
            // Existing user signing in
            toast.success("Signed in successfully!");
            
            // Redirect based on user role if available
            if (user?.role) {
              switch (user.role) {
                case 'client':
                  router.push("/user/dashboard");
                  break;
                case 'therapist':
                  router.push("/therapist/dashboard");
                  break;
                case 'moderator':
                  router.push("/moderator/dashboard");
                  break;
                case 'admin':
                  router.push("/admin/dashboard");
                  break;
                default:
                  router.push("/user/dashboard");
              }
            } else {
              router.push("/user/dashboard");
            }
          }
        } else {
          // No token found, redirect to sign-in
          toast.error("Authentication failed. No token found.");
          router.push("/auth/sign-in");
        }
      } catch (error) {
        console.error("SSO callback error:", error);
        toast.error("Authentication failed. Please try again.");
        router.push("/auth/sign-in");
      }
    };

    handleSSOCallback();
  }, [isLoaded, user, router, handleOAuthCallback]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <h2 className="text-lg font-semibold mb-2">Completing authentication...</h2>
        <p className="text-sm text-gray-600">
          Please wait while we set up your account.
        </p>
      </div>
    </div>
  );
}