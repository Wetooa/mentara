"use client";

import React from "react";
import TherapistListing from "@/components/therapist/listing/TherapistListing";
import RecommendedSection from "@/components/therapist/listing/RecommendedSection";

export default function FindTherapistSection() {
  return (
    <div className="space-y-8">
      {/* Recommendations Section */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
        <RecommendedSection />
      </div>

      {/* Main Therapist Listing */}
      <div>
        <TherapistListing />
      </div>
    </div>
  );
}