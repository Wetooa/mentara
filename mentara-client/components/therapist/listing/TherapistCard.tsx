import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PhoneCall, MessageSquare, Calendar, Heart, MapPin, Award, Globe, Users } from "lucide-react";
import { TherapistCardData } from "@/types/therapist";
import { Badge } from "@/components/ui/badge";
import { useFavorites } from "@/hooks/user/useFavorites";
import StarRating from "@/components/reviews/StarRating";
import { useTherapistReviewStats } from "@/hooks/reviews/useReviews";
import Image from "next/image";

interface TherapistCardProps {
  therapist: TherapistCardData;
  onViewProfile?: (therapist: TherapistCardData) => void;
  onBooking?: (therapistId: string) => void;
  onMessage?: (therapistId: string) => void;
}

export default function TherapistCard({ 
  therapist, 
  onViewProfile, 
  onBooking, 
  onMessage 
}: TherapistCardProps) {
  const nextAvailableTime = therapist.availableTimes[0];
  const { isFavorite, toggleFavorite } = useFavorites();
  const isTherapistFavorited = isFavorite(therapist.id);
  
  // Fetch review stats for this therapist
  const { data: reviewStats } = useTherapistReviewStats(therapist.id);

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleFavorite(therapist.id);
  };

  return (
    <Card className="w-full overflow-hidden shadow-sm hover:shadow-lg transition-all duration-200 border-l-4 border-l-blue-500 hover:border-l-blue-600 cursor-pointer bg-white">
      <CardContent className="p-0">
        <div 
          className="p-6 flex flex-col h-full"
          onClick={() => onViewProfile?.(therapist)}
        >
          {/* Header Section with Photo and Basic Info */}
          <div className="flex items-start gap-4 mb-4">
            <div className="relative">
              <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-100 flex-shrink-0">
                <Image
                  src={therapist.imageUrl || '/team/default-therapist.jpg'}
                  alt={`${therapist.name} - Licensed Therapist`}
                  width={64}
                  height={64}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = '/team/default-therapist.jpg';
                  }}
                />
              </div>
              {/* Status Indicator */}
              <div
                className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-white ${
                  therapist.isActive ? "bg-green-500" : "bg-gray-400"
                }`}
                title={therapist.isActive ? "Available" : "Unavailable"}
              />
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-lg text-gray-900 leading-tight mb-1">
                    {therapist.name}
                  </h3>
                  <p className="text-sm text-gray-600 font-medium mb-2">
                    {therapist.title}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleToggleFavorite}
                  className="p-1 h-8 w-8 hover:bg-gray-100"
                  aria-label={isTherapistFavorited ? "Remove from favorites" : "Add to favorites"}
                >
                  <Heart
                    className={`h-4 w-4 ${
                      isTherapistFavorited ? "fill-red-500 text-red-500" : "text-gray-400 hover:text-red-400"
                    }`}
                  />
                </Button>
              </div>

              {/* Trust Indicators */}
              <div className="flex items-center gap-3 text-xs text-gray-500 mb-2">
                <div className="flex items-center gap-1">
                  <Award className="h-3 w-3" />
                  <span>{therapist.experience}+ years exp</span>
                </div>
                {therapist.location && (
                  <div className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    <span>{therapist.location}</span>
                  </div>
                )}
                {therapist.reviewCount > 0 && (
                  <div className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    <span>{therapist.reviewCount} reviews</span>
                  </div>
                )}
              </div>

              {/* Rating */}
              <div className="mb-3">
                <StarRating 
                  rating={reviewStats?.averageRating || therapist.rating || 0}
                  totalReviews={reviewStats?.totalReviews || therapist.reviewCount || 0}
                  size="sm"
                  showNumber={true}
                  showReviewCount={true}
                />
              </div>
            </div>
          </div>

          {/* Specialties */}
          <div className="mb-4">
            <div className="flex flex-wrap gap-1.5">
              {therapist.specialties?.slice(0, 4).map((specialty, index) => (
                <Badge 
                  key={index} 
                  variant="secondary" 
                  className="text-xs px-2 py-1 bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100"
                >
                  {specialty}
                </Badge>
              ))}
              {therapist.specialties?.length > 4 && (
                <Badge variant="outline" className="text-xs px-2 py-1 text-gray-500">
                  +{therapist.specialties.length - 4} more
                </Badge>
              )}
              {(!therapist.specialties || therapist.specialties.length === 0) && (
                <Badge variant="secondary" className="text-xs px-2 py-1 bg-gray-50 text-gray-600">
                  General Therapy
                </Badge>
              )}
            </div>
          </div>

          {/* Languages (if available) */}
          {therapist.languages && therapist.languages.length > 0 && (
            <div className="mb-3">
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <Globe className="h-3 w-3" />
                <span>
                  Languages: {therapist.languages.slice(0, 3).join(", ")}
                  {therapist.languages.length > 3 && " +more"}
                </span>
              </div>
            </div>
          )}

          {/* Available Time */}
          {nextAvailableTime && (
            <div className="flex items-center text-xs text-green-600 gap-2 mb-3 bg-green-50 px-2 py-1 rounded">
              <Calendar className="h-3 w-3" />
              <span>Next available: {nextAvailableTime.day}, {nextAvailableTime.time}</span>
            </div>
          )}

          {/* Bio */}
          <p className="text-sm text-gray-600 mb-4 line-clamp-2 leading-relaxed">
            {therapist.bio || "Experienced mental health professional dedicated to helping clients achieve their wellness goals."}
          </p>

          {/* Pricing */}
          <div className="flex justify-between items-center mb-4 p-2 bg-gray-50 rounded-lg">
            <span className="text-sm text-gray-600">Session Rate</span>
            <span className="font-semibold text-gray-900">
              ${therapist.sessionPrice} / {therapist.sessionDuration} min
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 mt-auto">
            <Button 
              variant="outline" 
              className="flex-1 gap-2 border-blue-200 text-blue-700 hover:bg-blue-50 hover:border-blue-300 transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                onBooking?.(therapist.id);
              }}
            >
              <Calendar size={16} />
              Book Session
            </Button>
            <Button 
              variant="outline" 
              className="flex-1 gap-2 border-green-200 text-green-700 hover:bg-green-50 hover:border-green-300 transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                onMessage?.(therapist.id);
              }}
            >
              <MessageSquare size={16} />
              Message
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
