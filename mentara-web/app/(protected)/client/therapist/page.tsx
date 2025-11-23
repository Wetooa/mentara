"use client";

import dynamic from "next/dynamic";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";

// Lazy load heavy therapist dashboard component
const TherapistDashboard = dynamic(() => import("@/components/therapist/dashboard/TherapistDashboard").then(mod => ({ default: mod.default })), {
  ssr: false,
  loading: () => (
    <div className="space-y-6 p-6">
      <Skeleton className="h-10 w-64" />
      <Skeleton className="h-64 w-full" />
    </div>
  )
});

export default function TherapistPage() {
  return (
    <Suspense fallback={
      <div className="space-y-6 p-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-64 w-full" />
      </div>
    }>
      <TherapistDashboard />
    </Suspense>
  );
}