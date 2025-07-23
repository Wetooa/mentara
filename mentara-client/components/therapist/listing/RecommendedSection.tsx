import React, { useState, useRef, useEffect, useCallback } from "react";
import { Plus, ChevronLeft, ChevronRight, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useCarouselRecommendations } from "@/hooks/therapist/useRecommendedTherapists";

export default function RecommendedSection() {
  const carouselRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  
  // Use unified hook instead of direct API calls
  const { 
    therapists, 
    isLoading, 
    error 
  } = useCarouselRecommendations();

  const checkScrollButtons = useCallback(() => {
    if (!carouselRef.current) return;

    const { scrollLeft, scrollWidth, clientWidth } = carouselRef.current;
    setCanScrollLeft(scrollLeft > 0);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10); // 10px buffer
  }, []);

  // Initialize scroll buttons visibility when component mounts and when data changes
  useEffect(() => {
    checkScrollButtons();
  }, [therapists, checkScrollButtons]);

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

  // Handle loading state
  if (isLoading) {
    return (
      <div className="space-y-4 h-full flex flex-col">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold">Recommended</h2>
          <Button variant="ghost" size="sm" disabled>
            See all
          </Button>
        </div>
        <div className="flex-grow flex items-center justify-center">
          <div className="flex items-center gap-2 text-muted-foreground" data-testid="recommendations-loading">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Loading recommendations...</span>
          </div>
        </div>
      </div>
    );
  }

  // Handle error state
  if (error) {
    return (
      <div className="space-y-4 h-full flex flex-col">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold">Recommended</h2>
          <Button variant="ghost" size="sm" disabled>
            See all
          </Button>
        </div>
        <div className="flex-grow flex items-center justify-center">
          <div className="flex items-center gap-2 text-destructive" data-testid="error-message">
            <AlertCircle className="h-5 w-5" />
            <span>Failed to load recommendations. Please try again later.</span>
          </div>
        </div>
      </div>
    );
  }

  // Handle empty state
  if (therapists.length === 0) {
    return (
      <div className="space-y-4 h-full flex flex-col">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold">Recommended</h2>
          <Button variant="ghost" size="sm" disabled>
            See all
          </Button>
        </div>
        <div className="flex-grow flex items-center justify-center">
          <div className="text-center text-muted-foreground" data-testid="empty-state">
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
        <Button variant="ghost" size="sm">
          See all
        </Button>
      </div>

      <div className="relative flex-grow" data-testid="therapist-recommendations">
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
          {therapists.map((therapist) => (
            <div
              key={therapist.id}
              className="relative flex-none w-[300px] h-full snap-start"
              data-testid="therapist-card"
            >
              {/* Plus Button */}
              <Button
                size="icon"
                aria-label="Add therapist to favorites"
                className="absolute top-2 right-2 z-20 bg-primary text-white hover:bg-white hover:text-primary transition-colors"
              >
                <Plus className="w-5 h-5" />
              </Button>

              <Card className="relative overflow-hidden h-full z-0 flex flex-col">
                {/* Background image */}
                <div
                  className="absolute inset-0 bg-cover bg-center"
                  style={{ 
                    backgroundImage: `url(${therapist.profileImage || '/placeholder-therapist.jpg'})` 
                  }}
                />
                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10" />

                {/* Foreground content */}
                <CardContent className="p-4 relative z-20 flex flex-col items-center justify-end h-full text-white mt-auto">
                  <div className="w-full">
                    <div className="flex gap-2 flex-wrap mb-3">
                      {therapist.specialties?.map((specialty, i) => (
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
                      <div className="bg-white rounded-sm px-2 py-0.5">
                        <span className="text-primary text-xs font-medium">
                          {therapist.experience} years experience
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-amber-900/90 rounded-lg p-3 w-full">
                    <h3 className="font-semibold mb-1" data-testid="therapist-name">
                      {therapist.firstName} {therapist.lastName}
                    </h3>
                    <p className="text-sm text-white/90 line-clamp-2">
                      {therapist.bio || 'Experienced therapist dedicated to helping you achieve your mental health goals.'}
                    </p>
                    {therapist.rating && (
                      <div className="flex items-center gap-1 mt-2" data-testid="therapist-rating">
                        <span className="text-xs">⭐ {therapist.rating.toFixed(1)}</span>
                        {therapist.totalReviews && (
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
