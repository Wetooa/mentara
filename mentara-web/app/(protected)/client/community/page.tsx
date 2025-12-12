"use client";

import dynamic from "next/dynamic";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { useHasPreAssessment } from "@/hooks/pre-assessment/usePreAssessmentData";
import AssessmentPromptCard from "@/components/community/AssessmentPromptCard";

// Lazy load heavy community component
const CommunityPage = dynamic(() => import("@/components/community/CommunityPage").then(mod => ({ default: mod.default })), {
  ssr: false,
  loading: () => (
    <div className="space-y-6 p-6">
      <Skeleton className="h-10 w-64" />
      <Skeleton className="h-64 w-full" />
    </div>
  )
});

function UserCommunityContent() {
  const { hasAssessment, isLoading } = useHasPreAssessment();

  if (isLoading) {
    return (
      <div className="space-y-6 p-6" aria-live="polite" aria-busy="true">
        <Skeleton className="h-10 w-64" aria-label="Loading community page" />
        <Skeleton className="h-64 w-full" aria-label="Loading community content" />
      </div>
    );
  }

  // If user hasn't completed assessment, show prompt
  if (!hasAssessment) {
    return (
      <main>
        <AssessmentPromptCard />
      </main>
    );
  }

  return (
    <main>
      <CommunityPage role="client" />
    </main>
  );
}

export default function UserCommunity() {
  return (
    <Suspense fallback={
      <div className="space-y-6 p-6" aria-live="polite" aria-busy="true">
        <Skeleton className="h-10 w-64" aria-label="Loading community page" />
        <Skeleton className="h-64 w-full" aria-label="Loading community content" />
      </div>
    }>
      <UserCommunityContent />
    </Suspense>
  );
}