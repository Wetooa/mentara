"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { normalizeSessionDuration } from "@/lib/utils/session-duration";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { MatchExplanation } from "@/components/therapist/MatchExplanation";

import {
  Star,
  MapPin,
  Clock,
  GraduationCap,
  Users,
  CheckCircle,
  Info,
  Calendar,
  MessageCircle,
  CreditCard,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface TherapistRecommendationCardProps {
  therapist: {
    id: string;
    name: string;
    matchScore?: number;
    reviews?: { rating: number }[];
    profileImage?: string;
    specializations?: string[];
    location?: string;
    experience?: string;
    education?: string;
    languages?: string[];
    hourlyRate?: number;
    availability?: string;
    bio?: string;
    verificationStatus?: string;
    responseTime?: string;
    [key: string]: unknown;
  };
  rank: number;
  isSelected: boolean;
  onSelect: (selected: boolean) => void;
  showMatchExplanation?: boolean;
  disabled?: boolean;
}

export function TherapistRecommendationCard({
  therapist,
  rank,
  isSelected,
  onSelect,
  showMatchExplanation = false,
  disabled = false,
}: TherapistRecommendationCardProps) {
  const router = useRouter();
  const matchScore = therapist.matchScore || 0;
  const averageRating =
    therapist.reviews?.length > 0
      ? therapist.reviews.reduce((sum, r) => sum + r.rating, 0) /
        therapist.reviews.length
      : 0;

  // const getMatchColor = (score: number) => {
  //   if (score >= 80) return 'text-green-600';
  //   if (score >= 60) return 'text-yellow-600';
  //   return 'text-orange-600';
  // };

  const getMatchLevel = (score: number) => {
    if (score >= 80) return "Excellent Match";
    if (score >= 60) return "Good Match";
    return "Moderate Match";
  };

  const getMatchBadgeColor = (score: number) => {
    if (score >= 80) return "bg-green-600 text-white";
    if (score >= 60) return "bg-blue-600 text-white";
    return "bg-gray-600 text-white";
  };

  const handleCardClick = () => {
    if (!disabled) {
      onSelect(!isSelected);
    }
  };

  const yearsSinceStart = therapist.practiceStartDate
    ? new Date().getFullYear() -
      new Date(therapist.practiceStartDate).getFullYear()
    : 0;

  return (
    <Card
      className={`transition-all duration-200 cursor-pointer group relative overflow-hidden ${
        isSelected
          ? "ring-2 ring-primary shadow-lg bg-blue-50/50"
          : "hover:shadow-md hover:bg-gray-50/50"
      } ${disabled ? "opacity-60 cursor-not-allowed" : ""} border border-gray-200 bg-white`}
      onClick={handleCardClick}
    >
      <CardHeader className="pb-4">
        <div className="flex items-start gap-4">
          {/* Professional Rank Badge */}
          <div className="flex flex-col items-center gap-3">
            <div className="bg-primary text-white rounded-full w-10 h-10 flex items-center justify-center text-sm font-bold">
              #{rank}
            </div>
            <Checkbox
              checked={isSelected}
              onCheckedChange={onSelect}
              disabled={disabled}
              onClick={(e) => e.stopPropagation()}
              className="data-[state=checked]:bg-primary border-2"
            />
          </div>

          {/* Therapist Info */}
          <div className="flex-1">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start gap-4">
                <div className="relative">
                  <Avatar className="h-16 w-16 border-2 border-gray-200">
                    <AvatarImage src={therapist.user?.avatarUrl} />
                    <AvatarFallback className="text-lg bg-blue-100 text-blue-700 font-bold">
                      {therapist.user?.firstName?.[0]}
                      {therapist.user?.lastName?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  {/* Online indicator */}
                  {therapist.isOnline && (
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 border-2 border-white rounded-full"></div>
                  )}
                </div>

                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-1">
                    {therapist.user?.firstName} {therapist.user?.lastName}
                  </h3>
                  <p className="text-blue-600 font-medium text-sm mb-1">
                    {therapist.providerType}
                  </p>

                  {/* Rating */}
                  {averageRating > 0 && (
                    <div className="flex items-center gap-1 mt-1">
                      <div className="flex items-center">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i < Math.floor(averageRating)
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {averageRating.toFixed(1)} (
                        {therapist.reviews?.length || 0} reviews)
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Professional Match Score */}
              <div className="text-right">
                <Badge
                  className={`${getMatchBadgeColor(matchScore)} px-3 py-1 font-bold text-sm`}
                >
                  {matchScore}% Match
                </Badge>
                <p className="text-xs font-medium text-gray-600 mt-2">
                  {getMatchLevel(matchScore)}
                </p>
              </div>
            </div>

            {/* Professional Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg border border-gray-200">
                <MapPin className="h-4 w-4 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">
                  {therapist.province || "Remote"}
                </span>
              </div>
              <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg border border-gray-200">
                <Clock className="h-4 w-4 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">
                  {yearsSinceStart} years exp.
                </span>
              </div>
              <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg border border-gray-200">
                <CreditCard className="h-4 w-4 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">
                  ₱{therapist.hourlyRate || "N/A"}/hour
                </span>
              </div>
              <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg border border-gray-200">
                <Calendar className="h-4 w-4 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">
                  {normalizeSessionDuration(therapist.sessionDuration)} min
                  sessions
                </span>
              </div>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0 space-y-4">
        {/* Bio */}
        {therapist.bio && (
          <p className="text-sm text-muted-foreground line-clamp-3">
            {therapist.bio}
          </p>
        )}

        {/* Specializations */}
        {therapist.areasOfExpertise?.length > 0 && (
          <div>
            <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
              <GraduationCap className="h-4 w-4" />
              Specializations
            </h4>
            <div className="flex flex-wrap gap-2">
              {therapist.areasOfExpertise.slice(0, 4).map((area, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {area}
                </Badge>
              ))}
              {therapist.areasOfExpertise.length > 4 && (
                <Badge variant="outline" className="text-xs">
                  +{therapist.areasOfExpertise.length - 4} more
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Professional Match Explanation */}
        {showMatchExplanation && (
          <MatchExplanation
            matchScore={matchScore}
            scoreBreakdown={therapist.scoreBreakdown}
            matchExplanation={therapist.matchExplanation}
            conversationMatch={therapist.conversationMatch}
          />
        )}

        {/* Professional Action Area */}
        <div className="pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center gap-2 px-2 py-1 bg-gray-100 rounded-lg">
                      <Users className="h-4 w-4 text-gray-600" />
                      <span className="text-sm font-medium text-gray-700">
                        {therapist.activeClients || 0}
                      </span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Active clients</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center gap-2 px-2 py-1 bg-gray-100 rounded-lg">
                      <MessageCircle className="h-4 w-4 text-gray-600" />
                      <span className="text-sm font-medium text-gray-700">
                        {therapist.responseTime || "N/A"}
                      </span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Average response time</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>

            <div className="flex items-center gap-3">
              {isSelected && (
                <Badge className="bg-green-600 text-white px-3 py-1">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Selected
                </Badge>
              )}

              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  router.push(`/client/profile/${therapist.id}`);
                }}
                className="hover:bg-gray-50 hover:border-gray-400 transition-colors duration-200 font-medium"
              >
                View Profile
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
