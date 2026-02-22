"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { FileText, RefreshCw, Sparkles } from "lucide-react";
import TherapistListing from "@/components/therapist/listing/TherapistListing";
import RecommendedSection from "@/components/therapist/listing/RecommendedSection";
import { useHasPreAssessment } from "@/hooks/pre-assessment/usePreAssessmentData";

export default function FindTherapistSection() {
  const router = useRouter();
  const { hasAssessment } = useHasPreAssessment();

  return (
    <div className="space-y-10 pb-8">
      {/* Header Section with Assessment Button */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Find Your Therapist
          </h2>
          <p className="text-gray-600 text-lg">
            Discover qualified mental health professionals tailored to your needs
          </p>
        </div>
        <Button
          onClick={() => router.push("/client/assessment")}
          variant="outline"
          size="lg"
          className="gap-2 border-2 hover:bg-primary hover:text-primary-foreground transition-all"
        >
          {hasAssessment ? (
            <>
              <RefreshCw className="h-5 w-5" />
              Retake Assessment
            </>
          ) : (
            <>
              <Sparkles className="h-5 w-5" />
              Take Assessment
            </>
          )}
        </Button>
      </div>

      {/* Recommendations Section - Clean White Card Design */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="border-t-4 border-primary bg-primary/5 px-6 sm:px-8 py-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-md">
              <Sparkles className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900">Recommended for You</h3>
              <p className="text-sm text-gray-600 mt-0.5">
                AI-powered matches based on your assessment
              </p>
            </div>
          </div>
        </div>
        <div className="p-6 sm:p-8">
          <RecommendedSection />
        </div>
      </div>

      {/* Main Therapist Listing - Clean White Card Design */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="border-t-4 border-primary bg-primary/5 px-6 sm:px-8 py-6">
          <h3 className="text-2xl font-bold text-gray-900">Browse All Therapists</h3>
          <p className="text-sm text-gray-600 mt-1">
            Search and filter through our network of qualified professionals
          </p>
        </div>
        <div className="p-6 sm:p-8">
          <TherapistListing />
        </div>
      </div>
    </div>
  );
}
