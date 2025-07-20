import React, { useState } from "react";
import { useRouter } from "next/navigation";
import TherapistCard from "@/components/therapist/listing/TherapistCard";
import { TherapistProfileModal } from "@/components/therapist/TherapistProfileModal";
import BookingModal from "@/components/booking/BookingModal";
import Pagination from "@/components/ui/pagination";
import { useFilteredTherapists } from "@/hooks/useTherapists";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { TherapistCardData } from "@/types/therapist";
import { TherapistFilters } from "@/types/filters";
import { toast } from "sonner";

interface TherapistListingProps {
  searchQuery: string;
  filter: string;
  advancedFilters?: TherapistFilters;
}

// Input validation helper
function validateProps(props: TherapistListingProps): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (typeof props.searchQuery !== 'string') {
    errors.push('searchQuery must be a string');
  }
  
  if (typeof props.filter !== 'string') {
    errors.push('filter must be a string');
  }
  
  // Validate advancedFilters structure if provided
  if (props.advancedFilters) {
    const filters = props.advancedFilters;
    if (filters.specialties && !Array.isArray(filters.specialties)) {
      errors.push('advancedFilters.specialties must be an array');
    }
    if (filters.languages && !Array.isArray(filters.languages)) {
      errors.push('advancedFilters.languages must be an array');
    }
    if (filters.rating && (typeof filters.rating !== 'number' || filters.rating < 0 || filters.rating > 5)) {
      errors.push('advancedFilters.rating must be a number between 0 and 5');
    }
  }
  
  return { isValid: errors.length === 0, errors };
}

// Loading skeleton component
function TherapistCardSkeleton() {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 animate-pulse">
      <div className="flex items-center space-x-4 mb-4">
        <div className="w-16 h-16 bg-gray-200 rounded-full"></div>
        <div className="flex-1">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
      <div className="space-y-2 mb-4">
        <div className="h-3 bg-gray-200 rounded"></div>
        <div className="h-3 bg-gray-200 rounded w-5/6"></div>
      </div>
      <div className="flex flex-wrap gap-2 mb-4">
        <div className="h-6 bg-gray-200 rounded-full w-16"></div>
        <div className="h-6 bg-gray-200 rounded-full w-12"></div>
        <div className="h-6 bg-gray-200 rounded-full w-20"></div>
      </div>
      <div className="h-10 bg-gray-200 rounded"></div>
    </div>
  );
}

export default function TherapistListing({
  searchQuery,
  filter,
  advancedFilters,
}: TherapistListingProps) {
  // All hooks must be called before any conditional returns
  const router = useRouter();
  const [selectedTherapist, setSelectedTherapist] = useState<TherapistCardData | null>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [componentError, setComponentError] = useState<string | null>(null);

  const { 
    therapists, 
    totalCount,
    totalPages,
    hasNextPage,
    hasPreviousPage,
    isLoading, 
    error, 
    refetch 
  } = useFilteredTherapists(searchQuery, filter, { 
    page: currentPage, 
    pageSize: 12,
    advancedFilters 
  });

  // Reset page when search/filter changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filter, advancedFilters]);

  // Input validation (after hooks)
  const validation = validateProps({ searchQuery, filter, advancedFilters });
  if (!validation.isValid) {
    console.error('TherapistListing: Invalid props:', validation.errors);
    return (
      <Alert className="max-w-2xl mx-auto">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Invalid configuration. Please refresh the page and try again.
        </AlertDescription>
      </Alert>
    );
  }

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
      console.error('Error viewing therapist profile:', error);
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
      if (!therapistId || typeof therapistId !== 'string') {
        toast.error("Invalid therapist selection. Please try again.");
        return;
      }
      
      // Ensure therapists array exists and find therapist safely
      if (!Array.isArray(therapists)) {
        toast.error("Therapist data is not available. Please refresh the page.");
        return;
      }
      
      const therapist = therapists.find(t => t?.id === therapistId);
      if (!therapist) {
        toast.error("Selected therapist not found. Please try again.");
        return;
      }
      
      setSelectedTherapist(therapist);
      setIsBookingModalOpen(true);
      // Close profile modal if it's open
      setIsProfileModalOpen(false);
    } catch (error) {
      console.error('Error initiating booking:', error);
      toast.error("Failed to start booking process. Please try again.");
    }
  };

  const handleCloseBookingModal = () => {
    setIsBookingModalOpen(false);
    setSelectedTherapist(null);
  };

  const handleBookingSuccess = () => {
    try {
      const therapistName = selectedTherapist?.name || 'the therapist';
      toast.success("Session booked successfully!", {
        description: `Your session with ${therapistName} has been scheduled.`,
      });
    } catch (error) {
      console.error('Error displaying booking success:', error);
      // Fallback success message
      toast.success("Session booked successfully!");
    }
  };

  const handleMessage = (therapistId: string) => {
    try {
      // Input validation
      if (!therapistId || typeof therapistId !== 'string') {
        toast.error("Invalid therapist selection. Please try again.");
        return;
      }
      
      router.push(`/client/messages?contact=${encodeURIComponent(therapistId)}`);
      toast.success("Opening messages...");
    } catch (error) {
      console.error('Error navigating to messages:', error);
      toast.error("Failed to open messages. Please try again.");
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, index) => (
          <TherapistCardSkeleton key={index} />
        ))}
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
                console.error('Failed to retry:', retryError);
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
    );
  }

  // Empty state
  if (therapists.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500 mb-4">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No therapists found</h3>
        <p className="text-gray-500 mb-4">
          {searchQuery || filter !== "All" 
            ? "Try adjusting your search or filter criteria" 
            : "No therapists are currently available"}
        </p>
        {(searchQuery || filter !== "All") && (
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
        )}
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        {/* Results count with safe calculations */}
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            {(() => {
              try {
                const startItem = Math.max(1, ((currentPage - 1) * 12) + 1);
                const endItem = Math.min(currentPage * 12, totalCount || 0);
                const total = totalCount || 0;
                return `Showing ${startItem}-${endItem} of ${total} recommended therapists`;
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

      {/* Therapist Profile Modal */}
      <TherapistProfileModal
        therapist={selectedTherapist}
        isOpen={isProfileModalOpen}
        onClose={handleCloseProfileModal}
        onBooking={handleBooking}
        onMessage={handleMessage}
      />

      {/* Booking Modal */}
      <BookingModal
        therapist={selectedTherapist}
        isOpen={isBookingModalOpen}
        onClose={handleCloseBookingModal}
        onSuccess={handleBookingSuccess}
      />
    </>
  );
}
