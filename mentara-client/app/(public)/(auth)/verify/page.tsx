"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSignUp } from "@clerk/nextjs";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";

export default function VerifyPage() {
  const router = useRouter();
  const { signUp, setActive } = useSignUp();
  const { validateSession } = useAuth();

  useEffect(() => {
    const handleVerification = async () => {
      if (!signUp) {
        toast.error("Verification failed. Please try again.");
        router.push("/sign-in");
        return;
      }

      try {
        toast.info("Verifying your email...");
        
        // Complete the sign-up process
        const completeSignUp = await signUp.attemptEmailAddressVerification({
          code: "EMAIL_LINK", // This is for email link verification
        });

        if (completeSignUp.status === "complete") {
          await setActive({ session: completeSignUp.createdSessionId });
          
          toast.success("Email verified successfully! Welcome to Mentara!");
          
          // Validate session with backend
          await validateSession();
          
          // Check if user has pre-assessment data
          const assessmentAnswers = localStorage.getItem("assessmentAnswers");
          
          if (assessmentAnswers) {
            // Clear assessment data (backend registration already happened during sign-up)
            localStorage.removeItem("assessmentAnswers");
            router.push("/user/welcome");
          } else {
            router.push("/user/dashboard");
          }
        } else {
          toast.error("Verification incomplete. Please try again.");
          router.push("/pre-assessment");
        }
      } catch (error) {
        console.error("Verification error:", error);
        toast.error("Verification failed. Please try again.");
        router.push("/pre-assessment");
      }
    };

    handleVerification();
  }, [signUp, setActive, router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <h2 className="text-lg font-semibold mb-2">Verifying your email...</h2>
        <p className="text-sm text-gray-600">
          Please wait while we verify your email address.
        </p>
      </div>
    </div>
  );
}