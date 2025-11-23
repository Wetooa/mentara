import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  User,
  ChevronLeft,
  ChevronRight,
  Loader2,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useCarouselRecommendations } from "@/hooks/therapist/useRecommendedTherapists";
import { toast } from "sonner";
import { logger } from "@/lib/logger";

export default function RecommendedSection() {
  const router = useRouter();
  const carouselRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [retryCount, setRetryCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);

  // Use clean hook for carousel recommendations with fallback to therapist cards
  const { therapists, therapistCards, isLoading, error, refetch } =
    useCarouselRecommendations();

  // Get the appropriate therapist data to display
  const displayTherapists = therapistCards || therapists;

  // Enhanced retry logic for recommendations
  const handleRecommendationRetry = async () => {
    setIsRetrying(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 800)); // Brief delay
      await refetch();
      setRetryCount((prev) => prev + 1);
      toast.success("Recommendations refreshed!");
    } catch (retryError) {
      logger.error("Recommendation retry failed:", retryError);
      if (retryCount < 2) {
        toast.error(`Failed to refresh. Trying again...`);
        setTimeout(() => handleRecommendationRetry(), 1500);
      } else {
        toast.error("Unable to load recommendations. Please refresh the page.");
      }
    } finally {
      setIsRetrying(false);
    }
  };

  const checkScrollButtons = useCallback(() => {
    if (!carouselRef.current) return;

    const { scrollLeft, scrollWidth, clientWidth } = carouselRef.current;
    setCanScrollLeft(scrollLeft > 0);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10); // 10px buffer
  }, []);

  // Initialize scroll buttons visibility when component mounts and when data changes
  useEffect(() => {
    checkScrollButtons();
  }, [displayTherapists, checkScrollButtons]);

  const scroll = (direction: "left" | "right") => {
    if (!carouselRef.current) return;

    const scrollAmount = 300; // Adjust as needed
    const newScrollLeft =
      direction === "left"
        ? carouselRef.current.scrollLeft - scrollAmount
        : carouselRef.current.scrollLeft + scrollAmount;

    carouselRef.current.scrollTo({
      left: newScrollLeft,
      behavior: "smooth",
    });
  };

  // Enhanced loading state with modern skeleton cards
  if (isLoading) {
    return (
      <div className="space-y-4 h-full flex flex-col">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold">Recommended</h2>
            <div className="flex items-center gap-2 text-primary">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm font-medium animate-pulse">
                Finding perfect matches...
              </span>
            </div>
          </div>
          <div className="h-8 w-16 bg-gray-200 rounded animate-pulse"></div>
        </div>

        {/* Enhanced skeleton carousel */}
        <div className="relative flex-grow">
          <div className="flex overflow-x-hidden h-full pb-2 pt-2 gap-4">
            {Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className="relative flex-none w-[300px] h-full overflow-hidden"
                data-testid="recommendation-skeleton"
              >
                <Card className="relative overflow-hidden h-full flex flex-col bg-gray-100">
                  {/* Animated shimmer overlay */}
                  <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/60 to-transparent"></div>

                  {/* Background image placeholder */}
                  <div className="absolute inset-0 bg-gray-200 animate-pulse"></div>

                  {/* Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>

                  {/* View Profile button placeholder */}
                  <div className="absolute top-2 right-2 w-8 h-8 bg-gray-300 rounded-full animate-pulse"></div>

                  {/* Content */}
                  <CardContent className="p-4 relative z-20 flex flex-col items-center justify-end h-full text-white mt-auto">
                    <div className="w-full mb-3">
                      <div className="flex gap-2 flex-wrap mb-3">
                        <div className="bg-white/80 rounded-sm px-2 py-1 h-6 w-20 animate-pulse"></div>
                        <div className="bg-white/80 rounded-sm px-2 py-1 h-6 w-16 animate-pulse"></div>
                        <div className="bg-white/80 rounded-sm px-2 py-1 h-6 w-24 animate-pulse"></div>
                      </div>
                    </div>

                    <div className="bg-black/60 rounded-lg p-3 w-full">
                      <div className="h-5 bg-white/30 rounded w-3/4 mb-2 animate-pulse"></div>
                      <div className="space-y-1 mb-2">
                        <div className="h-3 bg-white/20 rounded animate-pulse"></div>
                        <div className="h-3 bg-white/20 rounded w-4/5 animate-pulse"></div>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="h-3 w-3 bg-white/30 rounded animate-pulse"></div>
                        <div className="h-3 bg-white/20 rounded w-16 animate-pulse"></div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
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

  // Enhanced error state with contextual help
  if (error) {
    return (
      <div className="space-y-4 h-full flex flex-col">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold">Recommended</h2>
        </div>
        <div className="flex-grow flex items-center justify-center">
          <div className="text-center max-w-md" data-testid="error-message">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
              <div className="flex items-center justify-center mb-3">
                <div className="bg-red-100 p-2 rounded-full">
                  <AlertCircle className="h-5 w-5 text-red-600" />
                </div>
              </div>
              <h3 className="font-semibold text-red-900 mb-2">
                Recommendations Unavailable
              </h3>
              <p className="text-red-700 text-sm mb-4">
                We&apos;re having trouble loading personalized recommendations
                right now.
              </p>

              {/* Retry options */}
              <div className="flex flex-col sm:flex-row gap-2 justify-center">
                <Button
                  onClick={handleRecommendationRetry}
                  disabled={isRetrying}
                  size="sm"
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  {isRetrying ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Retrying...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Try Again
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => (window.location.href = "/client/therapists")}
                  className="border-red-200 text-red-700 hover:bg-red-50"
                >
                  Browse All Therapists
                </Button>
              </div>

              {retryCount > 0 && (
                <div className="text-xs text-red-500 mt-2">
                  Retry attempts: {retryCount}/3
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Handle empty state
  if (displayTherapists.length === 0) {
    return (
      <div className="space-y-4 h-full flex flex-col">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold">Recommended</h2>
        </div>
        <div className="flex-grow flex items-center justify-center">
          <div
            className="text-center text-muted-foreground"
            data-testid="empty-state"
          >
            <p>No therapist recommendations available at the moment.</p>
            <p className="text-sm">Please check back later.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 h-full flex flex-col">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Recommended</h2>
      </div>

      <div
        className="relative flex-grow"
        data-testid="therapist-recommendations"
      >
        {/* Scroll buttons */}
        {canScrollLeft && (
          <Button
            onClick={() => scroll("left")}
            size="icon"
            className="absolute left-0 top-1/2 -translate-y-1/2 z-30 bg-white/80 shadow-md hover:bg-white"
            aria-label="Scroll left"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
        )}

        {canScrollRight && (
          <Button
            onClick={() => scroll("right")}
            size="icon"
            className="absolute right-0 top-1/2 -translate-y-1/2 z-30 bg-white/80 shadow-md hover:bg-white"
            aria-label="Scroll right"
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        )}

        {/* Carousel container */}
        <div
          ref={carouselRef}
          className="flex overflow-x-auto h-full pb-2 pt-2 snap-x scrollbar-hide gap-4"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          onScroll={checkScrollButtons}
        >
          {displayTherapists.map((therapist) => (
            <div
              key={therapist.id}
              className="relative flex-none w-[300px] h-full snap-start"
              data-testid="therapist-card"
            >
              {/* View Profile Button */}
              <Button
                size="icon"
                aria-label="View therapist profile"
                className="absolute top-2 right-2 z-20 bg-primary text-white hover:bg-white hover:text-primary transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  router.push(`/client/profile/${therapist.id}`);
                }}
              >
                <User className="w-5 h-5" />
              </Button>

              <Card className="relative overflow-hidden h-full z-0 flex flex-col">
                {/* Background image */}
                <div
                  className="absolute inset-0 bg-cover bg-center"
                  style={{
                    backgroundImage: `url(${therapist.imageUrl || "/placeholder-therapist.jpg"})`,
                  }}
                />
                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10" />

                {/* Foreground content */}
                <CardContent className="p-4 relative z-20 flex flex-col items-center justify-end h-full text-white mt-auto">
                  <div className="w-full">
                    <div className="flex gap-2 flex-wrap mb-3">
                      {therapist.specialties
                        ?.slice(0, 3)
                        .map((specialty, i) => (
                          <div
                            key={i}
                            className="bg-white rounded-sm px-2 py-0.5"
                            data-testid="therapist-specialties"
                          >
                            <span className="text-primary text-xs font-medium">
                              {specialty}
                            </span>
                          </div>
                        ))}
                      {therapist.experience > 0 && (
                        <div className="bg-white rounded-sm px-2 py-0.5">
                          <span className="text-primary text-xs font-medium">
                            {therapist.experience} years experience
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="bg-black/80 rounded-lg p-3 w-full">
                    <h3
                      className="font-semibold mb-1"
                      data-testid="therapist-name"
                    >
                      {therapist.name}
                    </h3>
                    <p className="text-sm text-white/90 line-clamp-2">
                      {therapist.bio ||
                        "Experienced therapist dedicated to helping you achieve your mental health goals."}
                    </p>
                    {therapist.rating > 0 && (
                      <div
                        className="flex items-center gap-1 mt-2"
                        data-testid="therapist-rating"
                      >
                        <span className="text-xs">
                          ⭐ {therapist.rating.toFixed(1)}
                        </span>
                        {therapist.totalReviews &&
                          therapist.totalReviews > 0 && (
                            <span className="text-xs text-white/70">
                              ({therapist.totalReviews} reviews)
                            </span>
                          )}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </div>

      {/* Add custom style to hide scrollbar */}
      <style jsx>{`
        :global(::-webkit-scrollbar) {
          display: none;
        }
      `}</style>
    </div>
  );
}
