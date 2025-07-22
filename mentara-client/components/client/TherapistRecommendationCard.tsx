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
    if (score >= 80) return 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg';
    if (score >= 60) return 'bg-gradient-to-r from-yellow-500 to-amber-500 text-white shadow-lg';
    return 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg';
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
      className={`transition-all duration-300 cursor-pointer group relative overflow-hidden ${
        isSelected 
          ? 'ring-2 ring-blue-400 shadow-2xl bg-gradient-to-br from-blue-50/80 via-white to-purple-50/30 scale-[1.02]' 
          : 'hover:shadow-xl hover:scale-[1.01] hover:bg-gradient-to-br hover:from-gray-50/80 hover:via-white hover:to-blue-50/20'
      } ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}
      onClick={handleCardClick}
    >
      <CardHeader className="pb-4">
        <div className="flex items-start gap-4">
          {/* Enhanced Rank Badge */}
          <div className="flex flex-col items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full blur-sm opacity-60 group-hover:opacity-80 transition-opacity duration-300"></div>
              <div className="relative bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-full w-10 h-10 flex items-center justify-center text-sm font-bold shadow-lg transform group-hover:scale-110 transition-transform duration-300">
                #{rank}
              </div>
            </div>
            <div className="relative">
              <Checkbox
                checked={isSelected}
                onCheckedChange={onSelect}
                disabled={disabled}
                onClick={(e) => e.stopPropagation()}
                className="scale-110 data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-blue-500 data-[state=checked]:to-purple-500 border-2"
              />
            </div>
          </div>
          
          {/* Therapist Info */}
          <div className="flex-1">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start gap-4">
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full blur-sm opacity-50 group-hover:opacity-70 transition-opacity duration-300"></div>
                  <div className="relative p-1 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full">
                    <Avatar className="h-16 w-16 border-2 border-white">
                      <AvatarImage src={therapist.user?.avatarUrl} />
                      <AvatarFallback className="text-lg bg-gradient-to-br from-blue-100 to-purple-100 text-blue-700 font-bold">
                        {therapist.user?.firstName?.[0]}{therapist.user?.lastName?.[0]}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  {/* Online indicator */}
                  {therapist.isOnline && (
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 border-2 border-white rounded-full shadow-lg animate-pulse"></div>
                  )}
                </div>
                
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-1">
                    {therapist.user?.firstName} {therapist.user?.lastName}
                  </h3>
                  <p className="text-blue-600 font-medium text-sm mb-1">{therapist.providerType}</p>
                  
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
              
              {/* Enhanced Match Score */}
              <div className="text-right">
                <div className="relative">
                  <Badge className={`${getMatchBadgeColor(matchScore)} px-3 py-1 font-bold text-sm transform group-hover:scale-105 transition-transform duration-300`}>
                    {matchScore}% Match
                  </Badge>
                </div>
                <p className="text-xs font-medium text-gray-600 mt-2">
                  {getMatchLevel(matchScore)}
                </p>
              </div>
            </div>
            
            {/* Enhanced Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="flex items-center gap-2 p-2 bg-white/70 rounded-lg border border-gray-100 shadow-sm">
                <MapPin className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-gray-700">{therapist.province || 'Remote'}</span>
              </div>
              <div className="flex items-center gap-2 p-2 bg-white/70 rounded-lg border border-gray-100 shadow-sm">
                <Clock className="h-4 w-4 text-purple-600" />
                <span className="text-sm font-medium text-gray-700">{yearsSinceStart} years exp.</span>
              </div>
              <div className="flex items-center gap-2 p-2 bg-white/70 rounded-lg border border-gray-100 shadow-sm">
                <CreditCard className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-gray-700">₱{therapist.hourlyRate || 'N/A'}/hour</span>
              </div>
              <div className="flex items-center gap-2 p-2 bg-white/70 rounded-lg border border-gray-100 shadow-sm">
                <Calendar className="h-4 w-4 text-amber-600" />
                <span className="text-sm font-medium text-gray-700">{normalizeSessionDuration(therapist.sessionDuration)} min sessions</span>
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

        {/* Enhanced Match Explanation */}
        {showMatchExplanation && therapist.matchExplanation && (
          <div className="bg-gradient-to-br from-blue-50/80 via-white to-purple-50/50 border border-blue-200/60 rounded-xl p-5 shadow-sm backdrop-blur-sm">
            <h4 className="text-sm font-bold mb-3 flex items-center gap-2 text-blue-800">
              <div className="p-1 bg-blue-100 rounded-full">
                <Info className="h-3 w-3 text-blue-600" />
              </div>
              Why this match?
            </h4>
            <div className="space-y-2 text-sm">
              {therapist.matchExplanation.reasons?.map((reason, index) => (
                <div key={index} className="flex items-start gap-3 p-2 bg-white/60 rounded-lg border border-blue-100/50">
                  <CheckCircle className="h-4 w-4 mt-0.5 text-blue-600 flex-shrink-0" />
                  <span className="text-blue-800 font-medium">{reason}</span>
                </div>
              ))}
            </div>
            
            {/* Enhanced Match Score Breakdown */}
            <div className="mt-4 pt-4 border-t border-blue-200/60">
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-3 bg-white/70 rounded-lg border border-blue-100">
                  <div className="font-bold text-blue-800 text-xs mb-2">Compatibility</div>
                  <div className="relative mb-2">
                    <Progress 
                      value={therapist.matchExplanation.compatibility || 0} 
                      className="h-2 bg-gray-200" 
                    />
                    <div 
                      className="absolute top-0 left-0 h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-500"
                      style={{ width: `${therapist.matchExplanation.compatibility || 0}%` }}
                    />
                  </div>
                  <span className="text-blue-600 font-bold text-xs">
                    {therapist.matchExplanation.compatibility || 0}%
                  </span>
                </div>
                <div className="text-center p-3 bg-white/70 rounded-lg border border-blue-100">
                  <div className="font-bold text-blue-800 text-xs mb-2">Availability</div>
                  <div className="relative mb-2">
                    <Progress 
                      value={therapist.matchExplanation.availability || 0} 
                      className="h-2 bg-gray-200" 
                    />
                    <div 
                      className="absolute top-0 left-0 h-2 bg-gradient-to-r from-emerald-500 to-green-500 rounded-full transition-all duration-500"
                      style={{ width: `${therapist.matchExplanation.availability || 0}%` }}
                    />
                  </div>
                  <span className="text-emerald-600 font-bold text-xs">
                    {therapist.matchExplanation.availability || 0}%
                  </span>
                </div>
                <div className="text-center p-3 bg-white/70 rounded-lg border border-blue-100">
                  <div className="font-bold text-blue-800 text-xs mb-2">Experience</div>
                  <div className="relative mb-2">
                    <Progress 
                      value={therapist.matchExplanation.experience || 0} 
                      className="h-2 bg-gray-200" 
                    />
                    <div 
                      className="absolute top-0 left-0 h-2 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full transition-all duration-500"
                      style={{ width: `${therapist.matchExplanation.experience || 0}%` }}
                    />
                  </div>
                  <span className="text-amber-600 font-bold text-xs">
                    {therapist.matchExplanation.experience || 0}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Enhanced Action Area */}
        <div className="pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center gap-2 px-2 py-1 bg-gray-100/70 rounded-lg">
                      <Users className="h-4 w-4 text-blue-600" />
                      <span className="text-sm font-medium text-gray-700">{therapist.activeClients || 0}</span>
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
                    <div className="flex items-center gap-2 px-2 py-1 bg-gray-100/70 rounded-lg">
                      <MessageCircle className="h-4 w-4 text-purple-600" />
                      <span className="text-sm font-medium text-gray-700">{therapist.responseTime || 'N/A'}</span>
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
                <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg px-3 py-1">
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
                className="hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 transition-colors duration-200 font-medium"
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