"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  
  // Define onboarding steps
  const steps = [
    { name: "Profile", path: "/client/onboarding/profile" },
    { name: "Goals", path: "/client/onboarding/goals" },
    { name: "Preferences", path: "/client/onboarding/therapist-preferences" },
    { name: "Complete", path: "/client/onboarding/complete" },
  ];

  // Calculate current step
  const currentStepIndex = steps.findIndex(step => pathname === step.path);
  const progressPercentage = ((currentStepIndex + 1) / steps.length) * 100;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link
            href="/client"
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
          >
            <ArrowLeft className="h-5 w-5" />
            Back to Dashboard
          </Link>
          
          <div className="text-center">
            <h1 className="text-xl font-semibold text-gray-900">
              Welcome to Mentara
            </h1>
            <p className="text-sm text-gray-600">
              Let&apos;s get you set up for your mental health journey
            </p>
          </div>
          
          <div className="w-24"></div> {/* Spacer for centering */}
        </div>
      </header>

      {/* Progress Bar */}
      <div className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              Step {currentStepIndex + 1} of {steps.length}
            </span>
            <span className="text-sm text-gray-500">
              {Math.round(progressPercentage)}% Complete
            </span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
          
          {/* Step indicators */}
          <div className="flex items-center justify-between mt-4">
            {steps.map((step, index) => (
              <div
                key={step.path}
                className={`flex flex-col items-center ${
                  index <= currentStepIndex
                    ? "text-green-600"
                    : "text-gray-400"
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    index <= currentStepIndex
                      ? "bg-green-600 text-white"
                      : "bg-gray-200 text-gray-500"
                  }`}
                >
                  {index + 1}
                </div>
                <span className="text-xs mt-1 font-medium">{step.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}