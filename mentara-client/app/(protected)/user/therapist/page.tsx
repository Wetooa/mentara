"use client";

import { useState } from "react";
import { Search, Filter } from "lucide-react";
import TherapistListing from "@/components/therapist/listing/TherapistListing";
import MeetingsSection from "@/components/therapist/listing/MeetingsSection";
import RecommendedSection from "@/components/therapist/listing/RecommendedSection";
import AdvancedFilters from "@/components/therapist/filters/AdvancedFilters";
import { TherapistListingErrorWrapper } from "@/components/common/TherapistListingErrorBoundary";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useFilters } from "@/hooks/useFilters";

export default function TherapistPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("All");
  const [isFiltersExpanded, setIsFiltersExpanded] = useState(false);
  
  const {
    filters,
    updateFilters,
    resetFilters,
    hasActiveFilters,
    activeFilterCount
  } = useFilters();

  return (
    <div className="w-full h-full p-6 space-y-8">
      {/* Page Header */}
      <h1 className="text-2xl font-bold">My Therapists</h1>

      {/* Search and Filter */}
      <div className="space-y-4">
        <div className="flex gap-2 items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              type="text"
              placeholder="Search therapists by name or specialty..."
              className="pl-10 pr-4"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Select
            value={selectedFilter}
            onValueChange={(value) => setSelectedFilter(value)}
          >
            <SelectTrigger className="w-32">
              <SelectValue>{selectedFilter}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All</SelectItem>
              <SelectItem value="CBT">CBT</SelectItem>
              <SelectItem value="DBT">DBT</SelectItem>
              <SelectItem value="EMDR">EMDR</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant={hasActiveFilters ? "default" : "outline"}
            onClick={() => setIsFiltersExpanded(!isFiltersExpanded)}
            className="gap-2"
          >
            <Filter className="h-4 w-4" />
            Filters
            {activeFilterCount > 0 && (
              <span className="bg-white text-blue-600 text-xs px-1.5 py-0.5 rounded-full font-medium">
                {activeFilterCount}
              </span>
            )}
          </Button>
        </div>

        {/* Advanced Filters */}
        <AdvancedFilters
          filters={filters}
          onChange={updateFilters}
          onReset={resetFilters}
          isExpanded={isFiltersExpanded}
          onExpandedChange={setIsFiltersExpanded}
        />
      </div>

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
