import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import TherapistCard from "@/components/therapist/listing/TherapistCard";
import { TherapistProfileModal } from "@/components/therapist/TherapistProfileModal";
import BookingModal from "@/components/booking/BookingModal";
import Pagination from "@/components/ui/pagination";
import { useAllTherapistsWithClientFilters } from "@/hooks/therapist/useAllTherapists";
import { useFilters } from "@/hooks/utils/useFilters";
import FilterBar from "@/components/therapist/filters/FilterBar";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { TherapistCardData } from "@/types/therapist";
import { TherapistFilters } from "@/types/filters";
import { toast } from "sonner";
import { useStartConversationSimple } from "@/hooks";
import { start } from "repl";

// TherapistListing is now self-contained with no props needed

<<<<<<< HEAD
// Enhanced modern loading skeleton component
=======
// Input validation helper
function validateProps(props: TherapistListingProps): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (typeof props.searchQuery !== "string") {
    errors.push("searchQuery must be a string");
  }

  if (typeof props.filter !== "string") {
    errors.push("filter must be a string");
  }

  // Validate advancedFilters structure if provided
  if (props.advancedFilters) {
    const filters = props.advancedFilters;
    if (filters.specialties && !Array.isArray(filters.specialties)) {
      errors.push("advancedFilters.specialties must be an array");
    }
    if (filters.languages && !Array.isArray(filters.languages)) {
      errors.push("advancedFilters.languages must be an array");
    }
    if (
      filters.rating &&
      (typeof filters.rating !== "number" ||
        filters.rating < 0 ||
        filters.rating > 5)
    ) {
      errors.push("advancedFilters.rating must be a number between 0 and 5");
    }
  }

  return { isValid: errors.length === 0, errors };
}

// Loading skeleton component
>>>>>>> ae0c63ed89776ab3d3e135ed136ca0e10bca53e0
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
            <div key={i} className="w-4 h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded animate-pulse"></div>
          ))}
        </div>
        <div className="h-3 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-16 animate-pulse"></div>
      </div>

      {/* Specialties */}
      <div className="flex flex-wrap gap-2 mb-3">
        <div className="h-6 bg-gradient-to-r from-blue-100 to-blue-200 rounded-full w-20 animate-pulse"></div>
        <div className="h-6 bg-gradient-to-r from-green-100 to-green-200 rounded-full w-16 animate-pulse"></div>
        <div className="h-6 bg-gradient-to-r from-purple-100 to-purple-200 rounded-full w-24 animate-pulse"></div>
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
        <div className="flex-1 h-9 bg-gradient-to-r from-blue-100 to-blue-200 rounded border animate-pulse"></div>
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
  const [selectedTherapist, setSelectedTherapist] =
    useState<TherapistCardData | null>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [componentError, setComponentError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);

<<<<<<< HEAD
  // Search and filter state (moved from page)
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("All");
  const [hasActiveFilters, setHasActiveFilters] = useState(false);

  const {
    filters,
    updateFilters,
    resetFilters,
  } = useFilters();

  // Use the new simple hook that fetches ALL therapists and filters client-side
  const {
    therapists: allFilteredTherapists,
    totalCount,
    totalTherapists,
    isLoading,
    error,
    refetch
  } = useAllTherapistsWithClientFilters(searchQuery, selectedFilter);

  // Client-side pagination
  const pageSize = 12;
  const totalPages = Math.ceil(totalCount / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const therapists = allFilteredTherapists.slice(startIndex, endIndex);
  const hasNextPage = currentPage < totalPages;
  const hasPreviousPage = currentPage > 1;
=======
  const { startConversation, isStarting } = useStartConversationSimple();

  const {
    therapists,
    totalCount,
    totalPages,
    hasNextPage,
    hasPreviousPage,
    isLoading,
    error,
    refetch,
  } = useFilteredTherapists(searchQuery, filter, {
    page: currentPage,
    pageSize: 12,
    advancedFilters,
  });
>>>>>>> ae0c63ed89776ab3d3e135ed136ca0e10bca53e0

  // Reset page when search/filter changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedFilter]);

  // Enhanced retry logic with exponential backoff
  const handleSmartRetry = async () => {
    setIsRetrying(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000)); // Brief delay
      await refetch();
      setRetryCount(prev => prev + 1);
      toast.success("Successfully reconnected!");
    } catch (retryError) {
      console.error('Smart retry failed:', retryError);
      if (retryCount < 2) {
        toast.error(`Retry ${retryCount + 1} failed. Trying again...`);
        setTimeout(() => handleSmartRetry(), 2000); // Exponential backoff
      } else {
        toast.error("Multiple retry attempts failed. Please check your connection and refresh the page.");
      }
    } finally {
      setIsRetrying(false);
    }
  };


<<<<<<< HEAD
=======
  // Input validation (after hooks)
  const validation = validateProps({ searchQuery, filter, advancedFilters });
  if (!validation.isValid) {
    console.error("TherapistListing: Invalid props:", validation.errors);
    return (
      <Alert className="max-w-2xl mx-auto">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Invalid configuration. Please refresh the page and try again.
        </AlertDescription>
      </Alert>
    );
  }
>>>>>>> ae0c63ed89776ab3d3e135ed136ca0e10bca53e0

  const handleViewProfile = (therapist: TherapistCardData) => {
    try {
      // Validate therapist data before opening modal
      if (!therapist?.id || !therapist?.name) {
        toast.error("Invalid therapist data. Please try again.");
        return;
      }
      setSelectedTherapist(therapist);
      setIsProfileModalOpen(true);
    } catch (error) {
      console.error("Error viewing therapist profile:", error);
      toast.error("Failed to open therapist profile. Please try again.");
    }
  };

  const handleCloseProfileModal = () => {
    setIsProfileModalOpen(false);
    setSelectedTherapist(null);
  };

  const handleBooking = (therapistId: string) => {
    try {
      // Input validation
      if (!therapistId || typeof therapistId !== "string") {
        toast.error("Invalid therapist selection. Please try again.");
        return;
      }

      // Ensure therapists array exists and find therapist safely
      if (!Array.isArray(therapists)) {
        toast.error(
          "Therapist data is not available. Please refresh the page."
        );
        return;
      }

<<<<<<< HEAD
      const therapist = therapists.find(t => t?.id === therapistId);
=======
      const therapist = therapists.find((t) => t?.id === therapistId);
>>>>>>> ae0c63ed89776ab3d3e135ed136ca0e10bca53e0
      if (!therapist) {
        toast.error("Selected therapist not found. Please try again.");
        return;
      }

      setSelectedTherapist(therapist);
      setIsBookingModalOpen(true);
      // Close profile modal if it's open
      setIsProfileModalOpen(false);
    } catch (error) {
      console.error("Error initiating booking:", error);
      toast.error("Failed to start booking process. Please try again.");
    }
  };

  const handleCloseBookingModal = () => {
    setIsBookingModalOpen(false);
    setSelectedTherapist(null);
  };

  const handleBookingSuccess = () => {
    try {
      const therapistName = selectedTherapist?.name || "the therapist";
      toast.success("Session booked successfully!", {
        description: `Your session with ${therapistName} has been scheduled.`,
      });
    } catch (error) {
      console.error("Error displaying booking success:", error);
      // Fallback success message
      toast.success("Session booked successfully!");
    }
  };

  const handleMessage = (therapistId: string) => {
    try {
      // Input validation
      if (!therapistId || typeof therapistId !== "string") {
        toast.error("Invalid therapist selection. Please try again.");
        return;
      }

<<<<<<< HEAD
      router.push(`/client/messages?contact=${encodeURIComponent(therapistId)}`);
=======
      startConversation(therapistId);
>>>>>>> ae0c63ed89776ab3d3e135ed136ca0e10bca53e0
      toast.success("Opening messages...");
    } catch (error) {
      console.error("Error navigating to messages:", error);
      toast.error("Failed to open messages. Please try again.");
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <TherapistCardSkeleton key={index} />
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

<<<<<<< HEAD
  // Enhanced API error state with smart retry
  if (error) {
    return (
      <div className="max-w-2xl mx-auto">
        <Alert className="border-red-200 bg-red-50/50 backdrop-blur-sm">
          <div className="flex items-start gap-4">
            <div className="bg-red-100 p-2 rounded-full">
              <AlertCircle className="h-5 w-5 text-red-600" />
            </div>
            <div className="flex-1">
              <div className="font-semibold text-red-900 mb-1">
                Unable to Load Therapists
              </div>
              <div className="text-red-700 mb-3">
                {error instanceof Error ? (
                  error.message.includes('network') || error.message.includes('fetch') ?
                    "It looks like there's a connection issue. Please check your internet connection." :
                    "We're having trouble loading therapist data right now."
                ) : (
                  "Something went wrong while loading therapists."
                )}
              </div>

              {/* Retry suggestions */}
              <div className="bg-white/60 rounded-lg p-3 mb-4">
                <div className="text-sm font-medium text-gray-900 mb-2">Try these steps:</div>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                    Check your internet connection
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                    Try refreshing the page
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                    Clear your browser cache
                  </li>
                </ul>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={handleSmartRetry}
                  disabled={isRetrying}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  {isRetrying ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Retrying... ({retryCount + 1}/3)
                    </>
                  ) : (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Smart Retry
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => window.location.reload()}
                  className="border-red-200 text-red-700 hover:bg-red-50"
                >
                  Refresh Page
                </Button>
              </div>

              {retryCount > 0 && (
                <div className="text-xs text-gray-500 mt-2">
                  Retry attempts: {retryCount}/3
                </div>
              )}
            </div>
          </div>
        </Alert>
      </div>
=======
  // API error state
  if (error) {
    return (
      <Alert className="max-w-2xl mx-auto">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription className="flex items-center justify-between">
          <span>
            Failed to load therapists. Please try again.
            {error instanceof Error && (
              <span className="block text-sm text-gray-500 mt-1">
                {error.message}
              </span>
            )}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              try {
                refetch();
              } catch (retryError) {
                console.error("Failed to retry:", retryError);
                toast.error("Failed to retry. Please refresh the page.");
              }
            }}
            className="ml-4"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </AlertDescription>
      </Alert>
>>>>>>> ae0c63ed89776ab3d3e135ed136ca0e10bca53e0
    );
  }

  // Empty state
  if (therapists.length === 0) {
    return (
      <div className="text-center py-16 bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="text-blue-500 mb-6">
          <svg
            className="mx-auto h-16 w-16"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M17 20h5v-2a3 3 0 00-5.196-2.121M9 11a3 3 0 00-3 3v6c0 1.657 1.343 3 3 3h6c0-1.657-1.343-3-3-3v-3a3 3 0 00-3-3z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9 11V7a3 3 0 116 0v4"
            />
          </svg>
        </div>
<<<<<<< HEAD
        <h3 className="text-lg font-medium text-gray-900 mb-2">No therapists found</h3>
        <p className="text-gray-500 mb-4">
          {searchQuery || selectedFilter !== "All"
            ? "Try adjusting your search or filter criteria"
            : "No therapists are currently available"}
        </p>
        {(searchQuery || selectedFilter !== "All") && (
          <Button
            variant="outline"
            onClick={() => {
              try {
                window.location.reload();
              } catch (error) {
                console.error('Error reloading page:', error);
                // Fallback: try to navigate to base therapist listing
                router.push('/client/therapists');
              }
            }}
          >
            Clear filters
          </Button>
=======
        <h3 className="text-xl font-semibold text-gray-900 mb-3">
          No matching therapists found
        </h3>
        <p className="text-gray-600 mb-6 max-w-md mx-auto leading-relaxed">
          {searchQuery || filter !== "All"
            ? "We couldn't find any therapists matching your criteria. Try adjusting your search or filters to see more options."
            : "No therapists are currently available. Please check back later or contact support."}
        </p>
        {(searchQuery || filter !== "All") && (
          <div className="space-y-3">
            <Button
              variant="outline"
              onClick={() => {
                try {
                  window.location.reload();
                } catch (error) {
                  console.error("Error reloading page:", error);
                  router.push("/client/therapists");
                }
              }}
              className="border-blue-200 text-blue-700 hover:bg-blue-50"
            >
              Clear all filters
            </Button>
            <p className="text-sm text-gray-500">
              or try searching for different specialties or locations
            </p>
          </div>
>>>>>>> ae0c63ed89776ab3d3e135ed136ca0e10bca53e0
        )}
      </div>
    );
  }

  return (
    <>
<<<<<<< HEAD
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
                  const startItem = Math.max(1, ((currentPage - 1) * pageSize) + 1);
                  const endItem = Math.min(currentPage * pageSize, totalCount || 0);
                  const total = totalCount || 0;
                  const showingFiltered = searchQuery || selectedFilter !== "All";
                  return showingFiltered
                    ? `Showing ${startItem}-${endItem} of ${total} filtered therapists (${totalTherapists} total)`
                    : `Showing ${startItem}-${endItem} of ${total} therapists`;
                } catch (error) {
                  console.error('Error calculating results count:', error);
                  return `Showing results`;
                }
              })()}
            </div>
            {totalPages > 1 && (
              <div className="text-sm text-gray-500">
                Page {currentPage || 1} of {totalPages || 1}
              </div>
            )}
=======
      <div className="space-y-6">
        {/* Results count with safe calculations */}
        <div className="flex items-center justify-between bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="text-sm text-gray-700 font-medium">
            {(() => {
              try {
                const startItem = Math.max(1, (currentPage - 1) * 12 + 1);
                const endItem = Math.min(currentPage * 12, totalCount || 0);
                const total = totalCount || 0;
                return `${total} ${total === 1 ? "therapist" : "therapists"} found${total > 12 ? ` (showing ${startItem}-${endItem})` : ""}`;
              } catch (error) {
                console.error("Error calculating results count:", error);
                return `Therapists found`;
              }
            })()}
          </div>
          {totalPages > 1 && (
            <div className="text-sm text-blue-600 font-medium bg-blue-50 px-2 py-1 rounded">
              Page {currentPage || 1} of {totalPages || 1}
            </div>
          )}
        </div>

        {/* Therapist grid with error boundary protection - 2 column layout for better healthcare UI */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {Array.isArray(therapists) ? (
            therapists
              .map((therapist) => {
                try {
                  // Validate each therapist before rendering
                  if (!therapist?.id) {
                    console.warn(
                      "Skipping therapist with missing ID:",
                      therapist
                    );
                    return null;
                  }

                  return (
                    <TherapistCard
                      key={therapist.id}
                      therapist={therapist}
                      onViewProfile={handleViewProfile}
                      onBooking={handleBooking}
                      onMessage={handleMessage}
                    />
                  );
                } catch (error) {
                  console.error(
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
          <div className="flex justify-center mt-8 p-4 bg-white rounded-lg shadow-sm border border-gray-200">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              hasNextPage={hasNextPage}
              hasPreviousPage={hasPreviousPage}
              onPageChange={setCurrentPage}
            />
>>>>>>> ae0c63ed89776ab3d3e135ed136ca0e10bca53e0
          </div>

          {/* Therapist grid with error boundary protection */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.isArray(therapists) ? therapists.map((therapist) => {
              try {
                // Validate each therapist before rendering
                if (!therapist?.id) {
                  console.warn('Skipping therapist with missing ID:', therapist);
                  return null;
                }

                return (
                  <TherapistCard
                    key={therapist.id}
                    therapist={therapist}
                    onViewProfile={handleViewProfile}
                    onBooking={handleBooking}
                    onMessage={handleMessage}
                  />
                );
              } catch (error) {
                console.error('Error rendering therapist card:', error, therapist);
                // Return error placeholder for this specific card
                return (
                  <div key={therapist?.id || Math.random()} className="bg-red-50 border border-red-200 rounded-xl p-6">
                    <div className="text-sm text-red-600">
                      Error loading therapist data
                    </div>
                  </div>
                );
              }
            }).filter(Boolean) : (
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

      {/* Therapist Profile Modal */}
      <TherapistProfileModal
        therapist={selectedTherapist}
        isOpen={isProfileModalOpen}
        onClose={handleCloseProfileModal}
        onBooking={handleBooking}
        onMessage={handleMessage}
      />

      {/* Booking Modal */}
      {/* <BookingModal
        therapist={selectedTherapist}
        isOpen={isBookingModalOpen}
        onClose={handleCloseBookingModal}
        onSuccess={handleBookingSuccess}
      /> */}
    </>
  );
}
