"use client";

import TherapistCard from "@/components/recommended-therapists/Therapist";
import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { ArrowRight, Loader2, CheckCircle, Target } from "lucide-react";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { useWelcomePage } from "@/hooks/useWelcomePage";
import type { TherapistRecommendation } from "@/lib/api/services/therapists";

const Navbar = () => (
  <nav className="bg-white text-white w-full sticky top-0 z-50 shadow-md">
    <div className="flex justify-center p-4">
      <Image
        width={200}
        height={200}
        alt="Mentara Logo"
        src="/icons/mentara/mentara-landscape.png"
        className="w-52 h-12"
      />
    </div>
  </nav>
);


// Component to show match explanation
const MatchExplanation = ({ 
  therapist, 
  getMatchExplanation 
}: { 
  therapist: TherapistRecommendation; 
  getMatchExplanation: (therapist: TherapistRecommendation) => {
    matchPercentage: string;
    matchingSpecialties: string[];
    experience: number;
    hourlyRate: number;
  };
}) => {
  const matchData = getMatchExplanation(therapist);

  return (
    <div className="mt-2 space-y-2">
      <div className="flex items-center gap-2">
        <CheckCircle className="h-4 w-4 text-green-600" />
        <span className="text-sm font-medium text-green-700">
          {matchData.matchPercentage}% Match
        </span>
      </div>
      
      {matchData.matchingSpecialties.length > 0 && (
        <div className="space-y-1">
          <p className="text-xs text-neutral-600 font-medium">Specializes in your areas:</p>
          <div className="flex flex-wrap gap-1">
            {matchData.matchingSpecialties.map((specialty: string) => (
              <Badge key={specialty} variant="secondary" className="text-xs px-2 py-1">
                {specialty}
              </Badge>
            ))}
          </div>
        </div>
      )}
      
      <div className="text-xs text-neutral-500">
        {matchData.experience} years experience &bull; ${matchData.hourlyRate}/session
      </div>
    </div>
  );
};

// Component to show user's assessment summary
const AssessmentSummary = ({ 
  getAssessmentSummary 
}: { 
  getAssessmentSummary: () => {
    primaryConditions: string[];
    secondaryConditions: string[];
  } | null;
}) => {
  const assessmentData = getAssessmentSummary();
  
  if (!assessmentData) return null;
  
  const { primaryConditions, secondaryConditions } = assessmentData;
  
  return (
    <div className="w-full max-w-6xl bg-white rounded-lg border border-secondary/20 p-6 mb-8">
      <div className="flex items-center gap-2 mb-4">
        <Target className="h-5 w-5 text-secondary" />
        <h2 className="text-xl font-semibold text-secondary">Your Personalized Matches</h2>
      </div>
      
      <p className="text-neutral-600 mb-4">
        Based on your assessment, we&apos;ve identified therapists who specialize in your specific needs:
      </p>
      
      <div className="grid md:grid-cols-2 gap-4">
        {primaryConditions.length > 0 && (
          <div>
            <h3 className="font-medium text-neutral-800 mb-2">Primary Focus Areas:</h3>
            <div className="flex flex-wrap gap-2">
              {primaryConditions.map((condition: string, index: number) => (
                <Badge key={index} className="bg-secondary text-white">
                  {condition}
                </Badge>
              ))}
            </div>
          </div>
        )}
        
        {secondaryConditions.length > 0 && (
          <div>
            <h3 className="font-medium text-neutral-800 mb-2">Additional Areas:</h3>
            <div className="flex flex-wrap gap-2">
              {secondaryConditions.map((condition: string, index: number) => (
                <Badge key={index} variant="outline">
                  {condition}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default function Home() {
  const {
    userName,
    therapists,
    matchCriteria,
    isLoading,
    error,
    mapTherapistToCard,
    getMatchExplanation,
    getAssessmentSummary,
    handleContinueToDashboard,
    handleRetry,
  } = useWelcomePage();

  return (
    <div className="min-h-screen bg-gradient-to-b from-tertiary via-white to-tertiary flex flex-col gap-12 items-center">
      <Navbar />

      <div className="flex flex-col gap-2 w-full max-w-6xl p-2">
        <h1 className="text-3xl font-bold text-secondary">Welcome, {userName}!</h1>
        <p className="text-xl text-neutral-600">
          You&apos;ve taken a great first step. Let&apos;s find the right therapist to
          support you from here. These are some personalized recommendations based on your assessment.
        </p>
      </div>

      {/* Assessment Summary - only show when we have match criteria */}
      {!isLoading && !error && matchCriteria && (
        <AssessmentSummary 
          getAssessmentSummary={getAssessmentSummary}
        />
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center w-full max-w-6xl h-80">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-secondary" />
            <p className="text-lg text-neutral-600">Finding your perfect therapist matches...</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="flex items-center justify-center w-full max-w-6xl h-80">
          <div className="flex flex-col items-center gap-4">
            <p className="text-lg text-red-600">Unable to load recommendations at this time.</p>
            <Button 
              onClick={handleRetry} 
              variant="outline"
            >
              Try Again
            </Button>
          </div>
        </div>
      )}

      {/* Therapist Recommendations Carousel */}
      {!isLoading && !error && therapists.length > 0 && (
        <div className="w-full max-w-6xl">
          <h2 className="text-2xl font-semibold text-secondary mb-6 text-center">
            Your Recommended Therapists
          </h2>
          <Carousel opts={{ align: "start" }} className="w-full mx-auto">
            <CarouselContent>
              {therapists.map((therapist) => (
                <CarouselItem
                  key={therapist.id}
                  className="md:basis-1/2 lg:basis-1/3 xl:basis-1/4"
                >
                  <div className="p-2">
                    <div className="bg-white rounded-lg border border-neutral-200 shadow-sm hover:shadow-md transition-shadow">
                      <TherapistCard {...mapTherapistToCard(therapist)} />
                      <div className="p-4 pt-0">
                        <MatchExplanation 
                          therapist={therapist}
                          getMatchExplanation={getMatchExplanation}
                        />
                      </div>
                    </div>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
          </Carousel>
        </div>
      )}

      {/* No recommendations found */}
      {!isLoading && !error && therapists.length === 0 && (
        <div className="flex items-center justify-center w-full max-w-6xl h-80">
          <div className="flex flex-col items-center gap-4">
            <p className="text-lg text-neutral-600">No therapist recommendations available at this time.</p>
            <p className="text-sm text-neutral-500">Please try again later or contact support.</p>
          </div>
        </div>
      )}

      {/* Continue to Dashboard Button */}
      {!isLoading && !error && (
        <div className="w-full max-w-6xl flex justify-center">
          <Button 
            onClick={handleContinueToDashboard}
            size="lg"
            className="bg-secondary text-white hover:bg-secondary/90 transition-colors px-8 py-3"
          >
            Continue to Dashboard
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      )}

      <div className="w-full max-w-5xl border border-secondary rounded-[10px] h-42 bg-white flex items-center">
        <div className="w-1/3 h-full flex justify-center pt-4">
          <Image
            src="/icons/brain.png"
            width={100}
            height={100}
            className="max-h-full max-w-full object-contain"
            alt="brain"
          />
        </div>

        <div className="w-3/3 text-3xl flex justify-center">
          <div className="flex flex-col justify-center">
            <p>This is your safe space.</p>
            <p>Join the community that understands you.</p>
          </div>
        </div>
        <div className="w-1/3 flex justify-center">
          <div>
            <Button className="bg-[#608128] text-white hover:bg-white hover:text-[#436B00] transition-colors w-12 h-12 rounded-[50%]">
              <ArrowRight className="w-25 h-25 stroke-[4]" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}