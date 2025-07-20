'use client';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { normalizeSessionDuration } from '@/lib/utils/session-duration';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';

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
  CreditCard
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

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
  const matchScore = therapist.matchScore || 0;
  const averageRating = therapist.reviews?.length > 0 
    ? therapist.reviews.reduce((sum, r) => sum + r.rating, 0) / therapist.reviews.length 
    : 0;

  // const getMatchColor = (score: number) => {
  //   if (score >= 80) return 'text-green-600';
  //   if (score >= 60) return 'text-yellow-600';
  //   return 'text-orange-600';
  // };

  const getMatchLevel = (score: number) => {
    if (score >= 80) return 'Excellent Match';
    if (score >= 60) return 'Good Match';
    return 'Moderate Match';
  };

  const getMatchBadgeColor = (score: number) => {
    if (score >= 80) return 'bg-green-100 text-green-800 border-green-200';
    if (score >= 60) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    return 'bg-orange-100 text-orange-800 border-orange-200';
  };

  const handleCardClick = () => {
    if (!disabled) {
      onSelect(!isSelected);
    }
  };

  const yearsSinceStart = therapist.practiceStartDate 
    ? new Date().getFullYear() - new Date(therapist.practiceStartDate).getFullYear()
    : 0;

  return (
    <Card 
      className={`transition-all cursor-pointer hover:shadow-lg ${
        isSelected ? 'ring-2 ring-primary shadow-lg bg-primary/5' : 'hover:bg-muted/30'
      } ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}
      onClick={handleCardClick}
    >
      <CardHeader className="pb-4">
        <div className="flex items-start gap-4">
          {/* Rank Badge */}
          <div className="flex flex-col items-center gap-2">
            <div className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
              #{rank}
            </div>
            <Checkbox
              checked={isSelected}
              onCheckedChange={onSelect}
              disabled={disabled}
              onClick={(e) => e.stopPropagation()}
            />
          </div>
          
          {/* Therapist Info */}
          <div className="flex-1">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-start gap-3">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={therapist.user?.avatarUrl} />
                  <AvatarFallback className="text-lg">
                    {therapist.user?.firstName?.[0]}{therapist.user?.lastName?.[0]}
                  </AvatarFallback>
                </Avatar>
                
                <div>
                  <h3 className="text-xl font-semibold">
                    {therapist.user?.firstName} {therapist.user?.lastName}
                  </h3>
                  <p className="text-muted-foreground">{therapist.providerType}</p>
                  
                  {/* Rating */}
                  {averageRating > 0 && (
                    <div className="flex items-center gap-1 mt-1">
                      <div className="flex items-center">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i < Math.floor(averageRating)
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {averageRating.toFixed(1)} ({therapist.reviews?.length || 0} reviews)
                      </span>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Match Score */}
              <div className="text-right">
                <Badge className={getMatchBadgeColor(matchScore)}>
                  {matchScore}% Match
                </Badge>
                <p className="text-xs text-muted-foreground mt-1">
                  {getMatchLevel(matchScore)}
                </p>
              </div>
            </div>
            
            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span>{therapist.province || 'Remote'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>{yearsSinceStart} years exp.</span>
              </div>
              <div className="flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-muted-foreground" />
                <span>₱{therapist.hourlyRate || 'N/A'}/hour</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>{normalizeSessionDuration(therapist.sessionDuration)} min sessions</span>
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

        {/* Match Explanation */}
        {showMatchExplanation && therapist.matchExplanation && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="text-sm font-medium mb-2 flex items-center gap-2 text-blue-800">
              <Info className="h-4 w-4" />
              Why this match?
            </h4>
            <div className="space-y-2 text-sm text-blue-700">
              {therapist.matchExplanation.reasons?.map((reason, index) => (
                <div key={index} className="flex items-start gap-2">
                  <CheckCircle className="h-3 w-3 mt-0.5 text-blue-600" />
                  <span>{reason}</span>
                </div>
              ))}
            </div>
            
            {/* Match Score Breakdown */}
            <div className="mt-3 pt-3 border-t border-blue-200">
              <div className="grid grid-cols-3 gap-4 text-xs">
                <div className="text-center">
                  <div className="font-medium text-blue-800">Compatibility</div>
                  <div className="mt-1">
                    <Progress 
                      value={therapist.matchExplanation.compatibility || 0} 
                      className="h-2" 
                    />
                    <span className="text-blue-600">
                      {therapist.matchExplanation.compatibility || 0}%
                    </span>
                  </div>
                </div>
                <div className="text-center">
                  <div className="font-medium text-blue-800">Availability</div>
                  <div className="mt-1">
                    <Progress 
                      value={therapist.matchExplanation.availability || 0} 
                      className="h-2" 
                    />
                    <span className="text-blue-600">
                      {therapist.matchExplanation.availability || 0}%
                    </span>
                  </div>
                </div>
                <div className="text-center">
                  <div className="font-medium text-blue-800">Experience</div>
                  <div className="mt-1">
                    <Progress 
                      value={therapist.matchExplanation.experience || 0} 
                      className="h-2" 
                    />
                    <span className="text-blue-600">
                      {therapist.matchExplanation.experience || 0}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Action Area */}
        <div className="pt-2 border-t">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      <span>{therapist.activeClients || 0}</span>
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
                    <div className="flex items-center gap-1">
                      <MessageCircle className="h-4 w-4" />
                      <span>{therapist.responseTime || 'N/A'}</span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Average response time</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              {therapist.isOnline && (
                <div className="flex items-center gap-1 text-green-600">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Online now</span>
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              {isSelected && (
                <Badge variant="default" className="bg-primary text-primary-foreground">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Selected
                </Badge>
              )}
              
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  // TODO: Navigate to therapist profile
                }}
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