"use client";

import TherapistListing from "@/components/therapist/listing/TherapistListing";
import MeetingsSection from "@/components/therapist/listing/MeetingsSection";
import RecommendedSection from "@/components/therapist/listing/RecommendedSection";
import { TherapistListingErrorWrapper } from "@/components/common/TherapistListingErrorBoundary";

export default function TherapistPage() {

  return (
    <div className="w-full h-full p-6 space-y-8">
      {/* Therapist Listings with Error Boundary */}
      <TherapistListingErrorWrapper
        onError={(error, errorInfo) => {
          // Log error to monitoring service
          console.error('Therapist listing error:', { error, errorInfo });
          // Could integrate with error tracking service here
        }}
      >
        <TherapistListing />
      </TherapistListingErrorWrapper>

      {/* Meetings and Recommended Sections placed side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-[500px]">
        <div className="w-full lg:col-span-1">
          <MeetingsSection />
        </div>
        <div className="w-full lg:col-span-2 h-full">
          <RecommendedSection />
        </div>
      </div>
    </div>
  );
}
