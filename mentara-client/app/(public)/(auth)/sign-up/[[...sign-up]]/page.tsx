"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function SignUpPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to pre-assessment workflow
    toast.info("Redirecting to pre-assessment...");
    router.replace("/pre-assessment");
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h2 className="text-lg font-semibold mb-2">Redirecting...</h2>
        <p className="text-sm text-gray-600">
          New users must complete the pre-assessment before registration.
        </p>
      </div>
    </div>
  );
}
