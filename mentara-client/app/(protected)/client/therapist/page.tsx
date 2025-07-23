"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import TherapistListing from "@/components/therapist/listing/TherapistListing";
import MeetingsSection from "@/components/therapist/listing/MeetingsSection";
import RecommendedSection from "@/components/therapist/listing/RecommendedSection";
import FilterBar from "@/components/therapist/filters/FilterBar";
import { TherapistListingErrorWrapper } from "@/components/common/TherapistListingErrorBoundary";
import { Input } from "@/components/ui/input";
import { useFilters } from "@/hooks/utils/useFilters";

export default function TherapistPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("All");
  const [hasActiveFilters, setHasActiveFilters] = useState(false);

  const { filters, updateFilters, resetFilters } = useFilters();

  return (
    <div className="w-full h-full p-6 space-y-6 bg-gradient-to-br from-blue-50/30 via-white to-green-50/20 min-h-screen">
      {/* Page Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">
          Find Your Therapist
        </h1>
        <p className="text-gray-600 leading-relaxed">
          Connect with licensed mental health professionals who understand your
          needs and can guide you toward wellness.
        </p>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-2xl">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-blue-500 h-5 w-5" />
        <Input
          type="text"
          placeholder="Search by therapist name, specialty, or approach..."
          className="pl-12 pr-4 h-12 text-base border-blue-200 focus:border-blue-400 focus:ring-blue-400 shadow-sm"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Filter Section */}
      <FilterBar
        filters={filters}
        onChange={updateFilters}
        onFiltersChange={setHasActiveFilters}
        className="max-w-full"
      />

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Primary Therapist Listings */}
        <div className="lg:col-span-3 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">
              Available Therapists
            </h2>
            {hasActiveFilters && (
              <span className="text-sm text-blue-600 font-medium">
                Filtered results
              </span>
            )}
          </div>

          <TherapistListingErrorWrapper
            onError={(error, errorInfo) => {
              console.error("Therapist listing error:", {
                error,
                errorInfo,
                searchQuery,
                selectedFilter,
                filters,
              });
            }}
          >
            <TherapistListing
              searchQuery={searchQuery}
              filter={selectedFilter}
              advancedFilters={filters}
            />
          </TherapistListingErrorWrapper>
        </div>

        {/* Sidebar with Additional Sections */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <h3 className="font-semibold text-gray-900 mb-3">Quick Actions</h3>
            <div className="space-y-2">
              <button className="w-full text-left px-3 py-2 text-sm text-blue-700 hover:bg-blue-50 rounded-md transition-colors">
                Schedule Consultation
              </button>
              <button className="w-full text-left px-3 py-2 text-sm text-green-700 hover:bg-green-50 rounded-md transition-colors">
                Emergency Resources
              </button>
            </div>
          </div>

          <MeetingsSection />
          <RecommendedSection />
        </div>
      </div>
    </div>
  );
}
