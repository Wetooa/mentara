"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useUser } from "@clerk/nextjs";
import { toast } from "sonner";

export default function SSOCallbackPage() {
  const router = useRouter();
  const { user } = useUser();
  const { registerUser, submitPreAssessment } = useAuth();

  useEffect(() => {
    const handleSSOCallback = async () => {
      if (!user) {
        toast.error("Authentication failed. Please try again.");
        router.push("/sign-in");
        return;
      }

      try {
        toast.info("Completing authentication...");
        
        // Check if user has pre-assessment data (indicates new user from pre-assessment flow)
        const assessmentAnswers = localStorage.getItem("assessmentAnswers");
        
        if (assessmentAnswers) {
          // New user from pre-assessment flow - register with backend
          try {
            const answersList = JSON.parse(assessmentAnswers);
            
            // Create user data for backend registration
            const userData = {
              user: {
                email: user.primaryEmailAddress?.emailAddress || user.emailAddresses[0]?.emailAddress || "user@example.com",
                firstName: user.firstName || "User",
                middleName: "",
                lastName: user.lastName || "",
                birthDate: new Date().toISOString(),
                address: "",
                avatarUrl: user.imageUrl || "",
                role: "client" as const,
                bio: "",
                coverImageUrl: "",
                isActive: true,
              },
            };

            // Register with backend
            await registerUser(userData);
            
            // Submit pre-assessment data
            await submitPreAssessment({
              answerMatrix: answersList,
              metadata: { source: "preAssessment_oauth" },
            });
            
            toast.success("Welcome! Your account has been created.");
          } catch (regError) {
            console.error("Backend registration error:", regError);
            toast.error("Account created but registration incomplete. Please contact support.");
          }
        }
        
        if (assessmentAnswers) {
          // Clear assessment data and redirect to welcome
          localStorage.removeItem("assessmentAnswers");
          router.push("/user/welcome");
        } else {
          // Existing user signing in
          toast.success("Signed in successfully!");
          router.push("/user/dashboard");
        }
      } catch (error) {
        console.error("SSO callback error:", error);
        toast.error("Authentication failed. Please try again.");
        router.push("/sign-in");
      }
    };

    if (user) {
      handleSSOCallback();
    }
  }, [user, router, registerUser, submitPreAssessment]);

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