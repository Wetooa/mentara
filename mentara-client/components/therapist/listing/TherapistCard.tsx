import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PhoneCall, MessageSquare, Calendar, Eye, Heart } from "lucide-react";
import { TherapistCardData } from "@/types/therapist";
import { Badge } from "@/components/ui/badge";
import { useFavorites } from "@/hooks/useFavorites";
import StarRating from "@/components/reviews/StarRating";
import { useTherapistReviewStats } from "@/hooks/useReviews";

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
    <Card className="w-full overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer">
      <CardContent className="p-0">
        <div 
          className="p-4 flex flex-col h-full"
          onClick={() => onViewProfile?.(therapist)}
        >
          {/* Status and Name Section */}
          <div className="flex items-center mb-3 justify-between">
            <div className="flex items-center">
              <div
                className={`w-2 h-2 rounded-full mr-1.5 ${therapist.isActive ? "bg-green-500" : "bg-gray-400"}`}
              ></div>
              <span className="text-xs text-muted-foreground">
                {therapist.isActive ? "Active" : "Inactive"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleToggleFavorite}
                className="p-1 h-6 w-6"
              >
                <Heart
                  className={`h-4 w-4 ${
                    isTherapistFavorited ? "fill-red-500 text-red-500" : "text-gray-400"
                  }`}
                />
              </Button>
              <div className="text-sm text-muted-foreground">
                ${therapist.sessionPrice} / {therapist.sessionDuration} min
              </div>
            </div>
          </div>

          {/* Therapist Info */}
          <div className="flex flex-col">
            <h3 className="font-bold text-lg">{therapist.name}</h3>
            <p className="text-sm font-medium mb-1">{therapist.title}</p>

            {/* Rating */}
            <div className="mb-2">
              <StarRating 
                rating={reviewStats?.averageRating || 0}
                totalReviews={reviewStats?.totalReviews || 0}
                size="sm"
                showNumber={true}
                showReviewCount={true}
              />
            </div>

            {/* Specialties */}
            <div className="flex flex-wrap gap-1 mb-3">
              {therapist.specialties.map((specialty, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {specialty}
                </Badge>
              ))}
            </div>

            {/* Available Time */}
            {nextAvailableTime && (
              <div className="flex items-center text-xs text-muted-foreground gap-2 my-1">
                <Calendar size={14} />
                <span>
                  {nextAvailableTime.day}, {nextAvailableTime.time}
                </span>
              </div>
            )}

            <p className="text-xs text-muted-foreground mb-4 line-clamp-2">
              {therapist.bio}
            </p>

            {/* Action Buttons */}
            <div className="flex gap-2 mt-auto">
              <Button 
                variant="outline" 
                className="flex-1 gap-2"
                onClick={(e) => {
                  e.stopPropagation();
                  onBooking?.(therapist.id);
                }}
              >
                <PhoneCall size={16} />
                Book a call
              </Button>
              <Button 
                variant="outline" 
                className="flex-1 gap-2"
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
