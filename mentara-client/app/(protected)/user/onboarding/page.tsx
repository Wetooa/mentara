"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function OnboardingPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the first step of onboarding
    router.push("/user/onboarding/profile");
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="text-center">
        <div className="text-gray-500">Redirecting to onboarding...</div>
      </div>
    </div>
  );
}