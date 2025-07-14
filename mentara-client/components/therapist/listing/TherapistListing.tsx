import React, { useState } from "react";
import { useRouter } from "next/navigation";
import TherapistCard from "./TherapistCard";
import TherapistProfileModal from "../TherapistProfileModal";
import BookingModal from "../../booking/BookingModal";
import Pagination from "../../ui/pagination";
import { useFilteredTherapists } from "@/hooks/useTherapists";
import { Loader2, AlertCircle, RefreshCw } from "lucide-react";
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
  const router = useRouter();
  const [selectedTherapist, setSelectedTherapist] = useState<TherapistCardData | null>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

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

  const handleViewProfile = (therapist: TherapistCardData) => {
    setSelectedTherapist(therapist);
    setIsProfileModalOpen(true);
  };

  const handleCloseProfileModal = () => {
    setIsProfileModalOpen(false);
    setSelectedTherapist(null);
  };

  const handleBooking = (therapistId: string) => {
    const therapist = therapists.find(t => t.id === therapistId);
    if (therapist) {
      setSelectedTherapist(therapist);
      setIsBookingModalOpen(true);
      // Close profile modal if it's open
      setIsProfileModalOpen(false);
    }
  };

  const handleCloseBookingModal = () => {
    setIsBookingModalOpen(false);
    setSelectedTherapist(null);
  };

  const handleBookingSuccess = (meeting: any) => {
    toast.success("Session booked successfully!", {
      description: `Your session with ${selectedTherapist?.name} has been scheduled.`,
    });
  };

  const handleMessage = (therapistId: string) => {
    router.push(`/user/messages?contact=${therapistId}`);
    toast.success("Opening messages...");
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

  // Error state
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
            onClick={() => refetch()}
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
            onClick={() => window.location.reload()}
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
        {/* Results count */}
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Showing {((currentPage - 1) * 12) + 1}-{Math.min(currentPage * 12, totalCount)} of {totalCount} recommended therapists
          </div>
          {totalPages > 1 && (
            <div className="text-sm text-gray-500">
              Page {currentPage} of {totalPages}
            </div>
          )}
        </div>
        
        {/* Therapist grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {therapists.map((therapist) => (
            <TherapistCard 
              key={therapist.id} 
              therapist={therapist}
              onViewProfile={handleViewProfile}
              onBooking={handleBooking}
              onMessage={handleMessage}
            />
          ))}
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
