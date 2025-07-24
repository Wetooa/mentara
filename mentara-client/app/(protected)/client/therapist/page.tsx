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

      {/* Additional Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Enhanced Recommended Section */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
          <RecommendedSection />
        </div>

        {/* Enhanced Meetings Section */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
          <MeetingsSection />
        </div>
      </div>
    </div>
  );
}