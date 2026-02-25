"use client";

import React from "react";
import { 
  Carousel, 
  CarouselContent, 
  CarouselItem, 
  CarouselNext, 
  CarouselPrevious 
} from "@/components/ui/carousel";
import { useCarouselRecommendations } from "@/hooks/therapist/useRecommendedTherapists";
import RecommendedTherapistCard from "./RecommendedTherapistCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Sparkles, Info } from "lucide-react";

export default function RecommendedSection() {
  const { therapists, isLoading, error } = useCarouselRecommendations();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-[450px] rounded-xl overflow-hidden border">
            <Skeleton className="h-full w-full" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 text-center bg-red-50 rounded-xl border border-red-100">
        <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
          <Info className="h-6 w-6 text-red-600" />
        </div>
        <h3 className="text-lg font-bold text-red-900">Failed to load recommendations</h3>
        <p className="text-red-600 mt-1 max-w-md">
          Something went wrong while fetching your personalized matches. Please try refreshing the page.
        </p>
      </div>
    );
  }

  if (!therapists || therapists.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 text-center bg-gray-50 rounded-xl border border-dashed border-gray-300">
        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <Sparkles className="h-6 w-6 text-gray-400" />
        </div>
        <h3 className="text-lg font-bold text-gray-900">No recommendations found</h3>
        <p className="text-gray-600 mt-1 max-w-md">
          Take the assessment or update your preferences to get personalized therapist matches.
        </p>
      </div>
    );
  }

  return (
    <div className="relative px-4 sm:px-12">
      <Carousel
        opts={{
          align: "start",
          loop: false,
        }}
        className="w-full"
      >
        <CarouselContent className="-ml-4 sm:-ml-6">
          {therapists.map((therapist) => (
            <CarouselItem 
              key={therapist.id} 
              className="pl-4 sm:pl-6 basis-[85%] sm:basis-[350px] lg:basis-[380px] py-4"
            >
              <RecommendedTherapistCard therapist={therapist} />
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="-left-4 sm:-left-10 h-10 w-10 border-2 shadow-sm hidden sm:flex" />
        <CarouselNext className="-right-4 sm:-right-10 h-10 w-10 border-2 shadow-sm hidden sm:flex" />
      </Carousel>
    </div>
  );
}
