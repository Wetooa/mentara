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
  
  const {
    filters,
    updateFilters,
    resetFilters,
  } = useFilters();

  return (
    <div className="w-full h-full p-6 space-y-8">
      {/* Page Header */}
      <h1 className="text-2xl font-bold">My Therapists</h1>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          type="text"
          placeholder="Search therapists by name or specialty..."
          className="pl-10 pr-4"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Modern Filter Bar */}
      <FilterBar
        filters={filters}
        onChange={updateFilters}
        onFiltersChange={setHasActiveFilters}
        className="mb-6"
      />

      {/* Therapist Listings with Error Boundary */}
      <TherapistListingErrorWrapper
        onError={(error, errorInfo) => {
          // Log error to monitoring service
          console.error('Therapist listing error:', { error, errorInfo, searchQuery, selectedFilter, filters });
          // Could integrate with error tracking service here
        }}
      >
        <TherapistListing 
          searchQuery={searchQuery} 
          filter={selectedFilter} 
          advancedFilters={filters}
        />
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
