"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function TherapistApplicationsRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the new therapists route
    router.replace("/admin/therapists");
  }, [router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
      <Loader2 className="h-8 w-8 animate-spin" />
      <p className="text-gray-600">Redirecting to Therapist Management...</p>
    </div>
  );
}