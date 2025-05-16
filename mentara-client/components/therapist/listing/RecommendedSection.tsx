import React, { useState, useRef, useEffect } from "react";
import { Plus, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { mockRecommendedTherapists } from "@/data/mockTherapistListingData";

export default function RecommendedSection() {
  const carouselRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScrollButtons = () => {
    if (!carouselRef.current) return;

    const { scrollLeft, scrollWidth, clientWidth } = carouselRef.current;
    setCanScrollLeft(scrollLeft > 0);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10); // 10px buffer
  };

  // Initialize scroll buttons visibility when component mounts
  useEffect(() => {
    checkScrollButtons();
  }, []);

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

  return (
    <div className="space-y-4 h-full flex flex-col">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Recommended</h2>
        <Button variant="ghost" size="sm">
          See all
        </Button>
      </div>

      <div className="relative flex-grow">
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
          {mockRecommendedTherapists.map((therapist) => (
            <div
              key={therapist.id}
              className="relative flex-none w-[300px] h-full snap-start"
            >
              {/* Plus Button */}
              <Button
                size="icon"
                aria-label="Add"
                className="absolute top-2 right-2 z-20 bg-primary text-white hover:bg-white hover:text-primary transition-colors"
              >
                <Plus className="w-5 h-5" />
              </Button>

              <Card className="relative overflow-hidden h-full z-0 flex flex-col">
                {/* Background image */}
                <div
                  className="absolute inset-0 bg-cover bg-center"
                  style={{ backgroundImage: `url(${therapist.photoUrl})` }}
                />
                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10" />

                {/* Foreground content */}
                <CardContent className="p-4 relative z-20 flex flex-col items-center justify-end h-full text-white mt-auto">
                  <div className="w-full">
                    <div className="flex gap-2 flex-wrap mb-3">
                      {therapist.specialties.map((specialty, i) => (
                        <div
                          key={i}
                          className="bg-white rounded-sm px-2 py-0.5"
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
                    <h3 className="font-semibold mb-1">
                      {therapist.firstName} {therapist.lastName}
                    </h3>
                    <p className="text-sm text-white/90 line-clamp-2">
                      {therapist.description}
                    </p>
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
