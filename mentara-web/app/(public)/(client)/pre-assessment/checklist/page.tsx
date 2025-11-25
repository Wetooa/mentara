"use client";

import { Suspense } from "react";
import dynamic from "next/dynamic";

// Force dynamic rendering to avoid static generation issues with useSearchParams
export const dynamic = 'force-dynamic';

const PreAssessmentPageContent = dynamic(
  () => import("@/components/pre-assessment/PreAssessmentPage"),
  { 
    ssr: false,
    loading: () => <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }
);

export default function ChecklistPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
      <PreAssessmentPageContent />
    </Suspense>
  );
}
