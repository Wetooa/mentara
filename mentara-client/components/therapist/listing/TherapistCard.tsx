import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PhoneCall, MessageSquare, Calendar, Heart } from "lucide-react";
import { TherapistCardData } from "@/types/therapist";
import { Badge } from "@/components/ui/badge";
import { useFavorites } from "@/hooks/user/useFavorites";
import StarRating from "@/components/reviews/StarRating";
import { useTherapistReviewStats } from "@/hooks/reviews/useReviews";

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
  const nextAvailableTime = therapist.availableTimes?.[0];
  const { isFavorite, toggleFavorite } = useFavorites();
  const isTherapistFavorited = isFavorite(therapist.id);
  
  // Fetch review stats for this therapist
  const { data: reviewStats } = useTherapistReviewStats(therapist.id);

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleFavorite(therapist.id);
  };

  return (
    <Card className="w-full overflow-hidden shadow-sm hover:shadow-md border border-gray-200 bg-white transition-all duration-200 hover:border-primary/30 group cursor-pointer">
      <CardContent className="p-0">
        <div 
          className="p-6 flex flex-col h-full"
          onClick={() => onViewProfile?.(therapist)}
        >
          {/* Professional Status and Price Section */}
          <div className="flex items-center mb-4 justify-between">
            <div className="flex items-center">
              <div
                className={`w-2.5 h-2.5 rounded-full mr-2 ${
                  therapist.isActive ? "bg-green-500" : "bg-gray-400"
                }`}
              ></div>
              <span className={`text-xs font-medium ${
                therapist.isActive ? "text-green-700" : "text-gray-500"
              }`}>
                {therapist.isActive ? "Available Now" : "Currently Offline"}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleToggleFavorite}
                className="p-1.5 h-8 w-8 rounded-full hover:bg-gray-50 transition-colors duration-200"
              >
                <Heart
                  className={`h-4 w-4 transition-colors duration-200 ${
                    isTherapistFavorited 
                      ? "fill-red-500 text-red-500" 
                      : "text-gray-400 hover:text-red-400"
                  }`}
                />
              </Button>
              <div className="bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-200">
                <span className="text-sm font-semibold text-gray-900">
                  {therapist.sessionPrice}
                </span>
                <span className="text-xs text-gray-500 ml-1">
                  / {therapist.sessionDuration}min
                </span>
              </div>
            </div>
          </div>

          {/* Professional Therapist Info */}
          <div className="flex flex-col">
            <h3 className="font-bold text-xl text-gray-900 mb-1 leading-tight">
              {therapist.name}
            </h3>
            <p className="text-sm font-medium text-gray-600 mb-3 leading-relaxed">
              {therapist.title}
            </p>

            {/* Professional Rating Display */}
            <div className="mb-4">
              <div className="flex items-center gap-3">
                <StarRating 
                  rating={reviewStats?.averageRating || 0}
                  totalReviews={reviewStats?.totalReviews || 0}
                  size="sm"
                  showNumber={true}
                  showReviewCount={true}
                />
                {(reviewStats?.averageRating || 0) > 4.5 && (
                  <div className="bg-primary text-white px-2 py-0.5 rounded-md text-xs font-medium">
                    ⭐ TOP RATED
                  </div>
                )}
              </div>
            </div>

            {/* Professional Specialties */}
            <div className="flex flex-wrap gap-2 mb-4">
              {therapist.specialties?.map((specialty, index) => (
                <Badge 
                  key={index} 
                  variant="outline" 
                  className="text-xs font-medium px-3 py-1 bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 transition-colors duration-200"
                >
                  {specialty}
                </Badge>
              )) || (
                <Badge variant="outline" className="text-xs bg-gray-50 text-gray-700 border-gray-200">
                  General Therapy
                </Badge>
              )}
            </div>

            {/* Professional Available Time */}
            {nextAvailableTime && (
              <div className="flex items-center text-sm mb-3 bg-green-50 px-3 py-2 rounded-lg border border-green-200">
                <Calendar size={14} className="text-green-600 mr-3" />
                <div>
                  <div className="font-medium text-green-800">Next Available</div>
                  <div className="text-xs text-green-600">
                    {nextAvailableTime.day}, {nextAvailableTime.time}
                  </div>
                </div>
              </div>
            )}

            {/* Professional Bio Section */}
            <div className="bg-gray-50 rounded-lg p-3 mb-4 border border-gray-100">
              <p className="text-sm text-gray-700 line-clamp-2 leading-relaxed">
                {therapist.bio || "Experienced therapist dedicated to helping you achieve your mental health goals."}
              </p>
            </div>

            {/* Professional Action Buttons */}
            <div className="flex gap-3 mt-auto">
              <Button 
                variant="default" 
                className="flex-1 gap-2 bg-primary hover:bg-primary/90 text-white transition-colors duration-200 font-medium"
                onClick={(e) => {
                  e.stopPropagation();
                  onBooking?.(therapist.id);
                }}
              >
                <PhoneCall size={16} />
                Book Session
              </Button>
              <Button 
                variant="outline" 
                className="flex-1 gap-2 border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-colors duration-200 font-medium"
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
        </div>
      </CardContent>
    </Card>
  );
}
