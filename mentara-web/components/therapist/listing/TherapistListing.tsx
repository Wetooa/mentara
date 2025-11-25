import FilterBar from "@/components/therapist/filters/FilterBar";
import TherapistCard from "@/components/therapist/listing/TherapistCard";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Pagination from "@/components/ui/pagination";
import { useAllTherapistsWithClientFilters } from "@/hooks/therapist/useAllTherapists";
import { useFilters } from "@/hooks/utils/useFilters";
import { useTherapistRequest } from "@/hooks/therapist/useTherapistRequest";
import { TherapistCardData } from "@/types/therapist";
import { AlertCircle, RefreshCw, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { toast } from "sonner";
import { ErrorState } from "@/components/common/ErrorState";
import { EmptyState } from "@/components/common/EmptyState";
import { SkeletonTherapistCard } from "@/components/common/Skeleton";
import { logger } from "@/lib/logger";

// TherapistListing is now self-contained with no props needed

// Enhanced modern loading skeleton component
function TherapistCardSkeleton() {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 overflow-hidden relative">
      {/* Animated shimmer overlay */}
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/60 to-transparent"></div>

      {/* Status and Price Section */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center">
          <div className="w-2 h-2 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full mr-1.5 animate-pulse"></div>
          <div className="h-3 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-12 animate-pulse"></div>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 bg-gradient-to-r from-gray-200 to-gray-300 rounded animate-pulse"></div>
          <div className="h-3 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-20 animate-pulse"></div>
        </div>
      </div>

      {/* Therapist Name and Title */}
      <div className="space-y-2 mb-2">
        <div className="h-5 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded w-4/5 animate-pulse"></div>
        <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded w-3/5 animate-pulse"></div>
      </div>

      {/* Star Rating */}
      <div className="flex items-center gap-2 mb-2">
        <div className="flex gap-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="w-4 h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded animate-pulse"
            ></div>
          ))}
        </div>
        <div className="h-3 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-16 animate-pulse"></div>
      </div>

      {/* Specialties */}
      <div className="flex flex-wrap gap-2 mb-3">
        <div className="h-6 bg-gradient-to-r from-primary/20 to-primary/30 rounded-full w-20 animate-pulse"></div>
        <div className="h-6 bg-gradient-to-r from-primary/20 to-primary/30 rounded-full w-16 animate-pulse"></div>
        <div className="h-6 bg-gradient-to-r from-primary/20 to-primary/30 rounded-full w-24 animate-pulse"></div>
      </div>

      {/* Available Time */}
      <div className="flex items-center gap-2 mb-2">
        <div className="w-3.5 h-3.5 bg-gradient-to-r from-gray-200 to-gray-300 rounded animate-pulse"></div>
        <div className="h-3 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-32 animate-pulse"></div>
      </div>

      {/* Bio */}
      <div className="space-y-1 mb-4">
        <div className="h-3 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded animate-pulse"></div>
        <div className="h-3 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded w-4/5 animate-pulse"></div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <div className="flex-1 h-9 bg-gradient-to-r from-primary/20 to-primary/30 rounded border animate-pulse"></div>
        <div className="flex-1 h-9 bg-gradient-to-r from-gray-100 to-gray-200 rounded border animate-pulse"></div>
      </div>

      {/* Custom shimmer animation styles */}
      <style jsx>{`
        @keyframes shimmer {
          100% {
            transform: translateX(100%);
          }
        }
      `}</style>
    </div>
  );
}

export default function TherapistListing() {
  // All hooks must be called before any conditional returns
  const router = useRouter();

  const [currentPage, setCurrentPage] = useState(1);
  const [componentError, setComponentError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);

  // Search and filter state (moved from page)
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("All");
  const [hasActiveFilters, setHasActiveFilters] = useState(false);

  const { filters, updateFilters, resetFilters } = useFilters();

  // Therapist request functionality
  const { requestTherapist, isLoading: isRequestLoading } =
    useTherapistRequest();

  // Use the new simple hook that fetches ALL therapists and filters client-side
  const {
    therapists: allFilteredTherapists,
    totalCount,
    totalTherapists,
    isLoading,
    error,
    refetch,
  } = useAllTherapistsWithClientFilters(searchQuery, selectedFilter);

  // Client-side pagination
  const pageSize = 12;
  const totalPages = Math.ceil(totalCount / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const therapists = allFilteredTherapists.slice(startIndex, endIndex);
  const hasNextPage = currentPage < totalPages;
  const hasPreviousPage = currentPage > 1;

  // Reset page when search/filter changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedFilter]);

  // Enhanced retry logic with exponential backoff
  const handleSmartRetry = async () => {
    setIsRetrying(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Brief delay
      await refetch();
      setRetryCount((prev) => prev + 1);
      toast.success("Successfully reconnected!");
    } catch (retryError) {
      logger.error("Smart retry failed:", retryError);
      if (retryCount < 2) {
        toast.error(`Retry ${retryCount + 1} failed. Trying again...`);
        setTimeout(() => handleSmartRetry(), 2000); // Exponential backoff
      } else {
        toast.error(
          "Multiple retry attempts failed. Please check your connection and refresh the page."
        );
      }
    } finally {
      setIsRetrying(false);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-8">
        <h1 className="text-2xl font-bold">My Therapists</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, index) => (
            <SkeletonTherapistCard key={index} />
          ))}
        </div>
      </div>
    );
  }

  // Component error state (from internal errors)
  if (componentError) {
    return (
      <Alert className="max-w-2xl mx-auto">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription className="flex items-center justify-between">
          <span>
            Something went wrong with the therapist listing.
            <span className="block text-sm text-gray-500 mt-1">
              {componentError}
            </span>
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setComponentError(null);
              window.location.reload();
            }}
            className="ml-4"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Reload
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  // Enhanced API error state with smart retry
  if (error) {
    const errorMessage = error instanceof Error
      ? error.message.includes("network") || error.message.includes("fetch")
        ? "It looks like there's a connection issue. Please check your internet connection."
        : "We're having trouble loading therapist data right now."
      : "Something went wrong while loading therapists.";
    
    return (
      <ErrorState
        title="Unable to Load Therapists"
        message={errorMessage}
        error={error}
        onRetry={handleSmartRetry}
        showHomeButton={false}
      />
    );
  }

  // Empty state
  if (therapists.length === 0) {
    return (
      <EmptyState
        icon={Search}
        title="No therapists found"
        description={
          searchQuery || selectedFilter !== "All"
            ? "Try adjusting your search or filter criteria"
            : "No therapists are currently available"
        }
        action={
          searchQuery || selectedFilter !== "All"
            ? {
                label: "Clear filters",
                onClick: () => {
                  setSearchQuery("");
                  setSelectedFilter("All");
                  resetFilters();
                },
              }
            : undefined
        }
      />
    );
  }

  return (
    <>
      <div className="space-y-8">
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

        <div className="space-y-6">
          {/* Results count with safe calculations */}
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              {(() => {
                try {
                  const startItem = Math.max(
                    1,
                    (currentPage - 1) * pageSize + 1
                  );
                  const endItem = Math.min(
                    currentPage * pageSize,
                    totalCount || 0
                  );
                  const total = totalCount || 0;
                  const showingFiltered =
                    searchQuery || selectedFilter !== "All";
                  return showingFiltered
                    ? `Showing ${startItem}-${endItem} of ${total} filtered therapists (${totalTherapists} total)`
                    : `Showing ${startItem}-${endItem} of ${total} therapists`;
                } catch (error) {
                  logger.error("Error calculating results count:", error);
                  return `Showing results`;
                }
              })()}
            </div>
            {totalPages > 1 && (
              <div className="text-sm text-gray-500">
                Page {currentPage || 1} of {totalPages || 1}
              </div>
            )}
          </div>

          {/* Therapist grid with error boundary protection */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.isArray(therapists) ? (
              therapists
                .map((therapist) => {
                  try {
                    // Validate each therapist before rendering
                    if (!therapist?.id) {
                      logger.warn(
                        "Skipping therapist with missing ID:",
                        therapist
                      );
                      return null;
                    }

                    return (
                      <TherapistCard key={therapist.id} therapist={therapist} />
                    );
                  } catch (error) {
                    logger.error(
                      "Error rendering therapist card:",
                      error,
                      therapist
                    );
                    // Return error placeholder for this specific card
                    return (
                      <div
                        key={therapist?.id || Math.random()}
                        className="bg-red-50 border border-red-200 rounded-xl p-6"
                      >
                        <div className="text-sm text-red-600">
                          Error loading therapist data
                        </div>
                      </div>
                    );
                  }
                })
                .filter(Boolean)
            ) : (
              <div className="col-span-full text-center text-gray-500 py-8">
                No therapist data available
              </div>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-8">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                hasNextPage={hasNextPage}
                hasPreviousPage={hasPreviousPage}
                onPageChange={setCurrentPage}
              />
            </div>
          )}
        </div>
      </div>
    </>
  );
}
