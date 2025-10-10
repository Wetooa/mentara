"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { ArrowRight, CheckCircle } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function TherapistWelcomePage() {
  const router = useRouter();
  const { user, isLoaded } = useAuth();

  // Redirect to dashboard if already authenticated as a therapist
  useEffect(() => {
    if (isLoaded && user) {
      // Check if user has therapist role
      const userRole = user.role;
      if (userRole === "therapist") {
        // Redirect to dashboard after a brief delay
        const timer = setTimeout(() => {
          router.push("/therapist/dashboard");
        }, 2000);
        return () => clearTimeout(timer);
      }
    }
  }, [isLoaded, user, router]);

  // Handle manual navigation to dashboard
  const goToDashboard = () => {
    router.push("/therapist/dashboard");
  };

  return (
    <div className="w-full min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-green-50 to-blue-50 p-4">
      <Card className="w-full max-w-lg border-0 shadow-xl">
        <CardHeader className="bg-primary text-white text-center py-8 rounded-t-lg">
          <div className="mx-auto mb-6">
            <Image
              src="/mentara-landscape.png"
              alt="Mentara Logo"
              width={200}
              height={80}
              className="mx-auto"
            />
          </div>
          <CardTitle className="text-2xl font-bold">
            Welcome to Mentara!
          </CardTitle>
          <p className="mt-2 text-primary-foreground/90">
            Your therapist account has been activated
          </p>
        </CardHeader>
        <CardContent className="p-8">
          <div className="flex items-center justify-center mb-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </div>

          <h2 className="text-xl font-semibold text-center mb-4">
            You&apos;re all set to start your journey!
          </h2>

          <div className="space-y-4 mb-8">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium text-gray-800 mb-1">Your Dashboard</h3>
              <p className="text-gray-600 text-sm">
                Your personalized dashboard gives you access to patient
                management, appointments, and other essential tools.
              </p>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium text-gray-800 mb-1">
                Complete Your Profile
              </h3>
              <p className="text-gray-600 text-sm">
                Make sure your therapist profile is complete to help patients
                find and connect with you.
              </p>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium text-gray-800 mb-1">
                Technical Support
              </h3>
              <p className="text-gray-600 text-sm">
                Need help? Our support team is available at{" "}
                <span className="text-primary">support@mentara.com</span>
              </p>
            </div>
          </div>

          <Button
            onClick={goToDashboard}
            className="w-full bg-primary hover:bg-primary/90"
          >
            Go to Dashboard <ArrowRight className="ml-2 h-4 w-4" />
          </Button>

          <p className="text-xs text-center text-gray-500 mt-4">
            You are automatically being redirected to your dashboard...
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
