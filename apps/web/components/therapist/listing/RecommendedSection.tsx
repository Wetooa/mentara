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
import { Badge } from "@/components/ui/badge";
import { useCarouselRecommendations } from "@/hooks/therapist/useRecommendedTherapists";
import { toast } from "sonner";
import { logger } from "@/lib/logger";

export default function RecommendedSection() {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [cardsPerView, setCardsPerView] = useState(3);
  const [retryCount, setRetryCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);

  // Use clean hook for carousel recommendations with fallback to therapist cards
  const { therapists, therapistCards, isLoading, error, refetch } =
    useCarouselRecommendations();

  // Get the appropriate therapist data to display
  const displayTherapists = therapistCards || therapists;

  // Calculate cards per view based on container width
  useEffect(() => {
    const updateCardsPerView = () => {
      if (!containerRef.current) return;
      const width = containerRef.current.offsetWidth;
      if (width < 640) {
        setCardsPerView(1);
      } else if (width < 1024) {
        setCardsPerView(2);
      } else if (width < 1280) {
        setCardsPerView(3);
      } else {
        setCardsPerView(4);
      }
    };

    updateCardsPerView();
    window.addEventListener("resize", updateCardsPerView);
    return () => window.removeEventListener("resize", updateCardsPerView);
  }, []);

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

  const canGoLeft = currentIndex > 0;
  const canGoRight = currentIndex + cardsPerView < displayTherapists.length;

  const goToPrevious = () => {
    setCurrentIndex((prev) => Math.max(0, prev - cardsPerView));
  };

  const goToNext = () => {
    setCurrentIndex((prev) =>
      Math.min(displayTherapists.length - cardsPerView, prev + cardsPerView)
    );
  };

  // Reset index when therapists change
  useEffect(() => {
    setCurrentIndex(0);
  }, [displayTherapists.length]);

  // Get visible therapists
  const visibleTherapists = displayTherapists.slice(
    currentIndex,
    currentIndex + cardsPerView
  );

  // Enhanced loading state with modern skeleton cards
  if (isLoading) {
    return (
      <div className="h-[450px] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="text-sm font-medium text-gray-600">
            Finding perfect matches...
          </span>
        </div>
      </div>
    );
  }

  // Enhanced error state with contextual help
  if (error) {
    return (
      <div className="h-[450px] flex items-center justify-center">
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
    );
  }

  // Handle empty state
  if (displayTherapists.length === 0) {
    return (
      <div className="h-[450px] flex items-center justify-center">
        <div
          className="text-center text-muted-foreground"
          data-testid="empty-state"
        >
          <p>No therapist recommendations available at the moment.</p>
          <p className="text-sm">Please check back later.</p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="relative min-h-[500px] py-4"
      data-testid="therapist-recommendations"
    >
      {/* Navigation buttons */}
      {canGoLeft && (
        <Button
          onClick={goToPrevious}
          size="icon"
          className="absolute left-0 top-1/2 -translate-y-1/2 z-30 bg-white shadow-lg hover:bg-gray-50 border border-gray-200"
          aria-label="Previous therapists"
        >
          <ChevronLeft className="h-5 w-5 text-gray-700" />
        </Button>
      )}

      {canGoRight && (
        <Button
          onClick={goToNext}
          size="icon"
          className="absolute right-0 top-1/2 -translate-y-1/2 z-30 bg-white shadow-lg hover:bg-gray-50 border border-gray-200"
          aria-label="Next therapists"
        >
          <ChevronRight className="h-5 w-5 text-gray-700" />
        </Button>
      )}

      {/* Single row container */}
      <div className="flex gap-6 justify-center items-start">
        {visibleTherapists.map((therapist) => (
          <div
            key={therapist.id}
            className="flex-1 min-w-0 max-w-[320px]"
            data-testid="therapist-card"
          >
            <Card className="relative overflow-visible flex flex-col bg-white border-t-4 border-primary shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-6 flex flex-col">
                {/* Therapist Image - Smaller to give more room */}
                <div className="relative w-full h-48 mb-4 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                  {therapist.imageUrl ? (
                    <img
                      src={therapist.imageUrl}
                      alt={therapist.name}
                      className="w-full h-full object-cover"
                      style={{ objectFit: 'cover' }}
                    />
                  ) : (
                    <div className="w-full h-full bg-primary/10 flex items-center justify-center">
                      <User className="h-16 w-16 text-primary/30" />
                    </div>
                  )}
                </div>

                {/* Therapist Info */}
                <div className="flex flex-col">
                  <div className="mb-2">
                    <h3
                      className="font-bold text-xl text-gray-900 mb-1"
                      data-testid="therapist-name"
                    >
                      {therapist.name}
                    </h3>
                    {therapist.title && (
                      <p className="text-sm text-gray-600">{therapist.title}</p>
                    )}
                  </div>

                  {/* Rating */}
                  {therapist.rating > 0 && (
                    <div
                      className="flex items-center gap-2 mb-3"
                      data-testid="therapist-rating"
                    >
                      <span className="text-sm font-medium text-gray-900">
                        ⭐ {therapist.rating.toFixed(1)}
                      </span>
                      {therapist.totalReviews &&
                        therapist.totalReviews > 0 && (
                          <span className="text-xs text-gray-500">
                            ({therapist.totalReviews} reviews)
                          </span>
                        )}
                    </div>
                  )}

                  {/* Specialties */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {therapist.specialties?.slice(0, 3).map((specialty, i) => (
                      <Badge
                        key={i}
                        variant="outline"
                        className="text-xs font-medium px-2 py-1 bg-primary/10 text-primary border-primary/30"
                        data-testid="therapist-specialties"
                      >
                        {specialty}
                      </Badge>
                    ))}
                    {therapist.experience > 0 && (
                      <Badge
                        variant="outline"
                        className="text-xs font-medium px-2 py-1 bg-primary/10 text-primary border-primary/30"
                      >
                        {therapist.experience} years
                      </Badge>
                    )}
                  </div>

                  {/* Bio - Removed line-clamp and flex-1 to allow natural flow */}
                  {therapist.bio && (
                    <p className="text-sm text-gray-700 mb-4 line-clamp-2">
                      {therapist.bio}
                    </p>
                  )}

                  {/* View Profile Button */}
                  <Button
                    variant="default"
                    className="w-full gap-2 bg-primary hover:bg-primary/90 text-primary-foreground mt-auto"
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(`/client/profile/${therapist.id}`);
                    }}
                  >
                    <User className="w-4 h-4" />
                    View Profile
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        ))}
      </div>
    </div>
  );
}
