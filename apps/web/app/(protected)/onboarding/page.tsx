"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Construction } from "lucide-react";

export default function OnboardingPage() {
  const router = useRouter();

  const handleContinue = () => {
    // For now, redirect to recommendations stub
    router.push("/onboarding/recommendations");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 p-3 bg-yellow-100 rounded-full">
            <Construction className="h-8 w-8 text-yellow-600" />
          </div>
          <CardTitle className="text-2xl">Onboarding</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-center">
          <p className="text-gray-600">
            This onboarding flow is currently being redesigned for better user experience.
          </p>
          <p className="text-sm text-gray-500">
            Role-specific onboarding will be implemented in individual role dashboards.
          </p>
          <Button onClick={handleContinue} className="w-full">
            Continue to Recommendations
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}