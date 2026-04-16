"use client";

import dynamic from "next/dynamic";
import { Suspense } from "react";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { useApi } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
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
  const api = useApi();
  const { user } = useAuth();

  // Fetch user's communities with structure to check if they have any communities
  const { 
    data: communitiesData, 
    isLoading: isLoadingCommunities
  } = useQuery({
    queryKey: ["communities", "my-with-structure"],
    queryFn: () => api.communities.getMyCommunitiesWithStructure(),
    enabled: !!user,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });

  const hasCommunities = communitiesData && communitiesData.length > 0;

  if (isLoadingCommunities) {
    return (
      <div className="space-y-6 p-6" aria-live="polite" aria-busy="true">
        <Skeleton className="h-10 w-64" aria-label="Loading community page" />
        <Skeleton className="h-64 w-full" aria-label="Loading community content" />
      </div>
    );
  }

  // If user doesn't have communities, show prompt to take preassessment
  if (!hasCommunities) {
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