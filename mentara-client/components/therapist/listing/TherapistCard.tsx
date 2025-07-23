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
    <Card className="w-full overflow-hidden shadow-sm hover:shadow-xl border-0 bg-gradient-to-br from-white via-white to-gray-50/30 transition-all duration-300 hover:scale-[1.02] group cursor-pointer backdrop-blur-sm">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      <CardContent className="p-0 relative">
        <div 
          className="p-6 flex flex-col h-full relative z-10"
          onClick={() => onViewProfile?.(therapist)}
        >
          {/* Enhanced Status and Price Section */}
          <div className="flex items-center mb-4 justify-between">
            <div className="flex items-center">
              <div className="relative">
                <div
                  className={`w-2.5 h-2.5 rounded-full mr-2 ${
                    therapist.isActive ? "bg-emerald-500 shadow-lg shadow-emerald-500/50" : "bg-gray-400"
                  } ${therapist.isActive ? "animate-pulse" : ""}`}
                ></div>
                {therapist.isActive && (
                  <div className="absolute top-0 left-0 w-2.5 h-2.5 bg-emerald-400 rounded-full animate-ping"></div>
                )}
              </div>
              <span className={`text-xs font-medium ${
                therapist.isActive ? "text-emerald-700" : "text-gray-500"
              }`}>
                {therapist.isActive ? "Available Now" : "Currently Offline"}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleToggleFavorite}
                className="p-1.5 h-8 w-8 rounded-full hover:bg-red-50 transition-colors duration-200 group/heart"
              >
                <Heart
                  className={`h-4 w-4 transition-all duration-200 ${
                    isTherapistFavorited 
                      ? "fill-red-500 text-red-500 scale-110" 
                      : "text-gray-400 group-hover/heart:text-red-400 group-hover/heart:scale-110"
                  }`}
                />
              </Button>
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 px-3 py-1.5 rounded-full border border-blue-100">
                <span className="text-sm font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  {therapist.sessionPrice}
                </span>
                <span className="text-xs text-gray-500 ml-1">
                  / {therapist.sessionDuration}min
                </span>
              </div>
            </div>
          </div>

          {/* Enhanced Therapist Info */}
          <div className="flex flex-col">
            <h3 className="font-bold text-xl text-gray-900 mb-1 group-hover:text-blue-700 transition-colors duration-200 leading-tight">
              {therapist.name}
            </h3>
            <p className="text-sm font-medium text-gray-600 mb-3 leading-relaxed">
              {therapist.title}
            </p>

            {/* Enhanced Rating with Modern Design */}
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
                  <div className="bg-gradient-to-r from-yellow-400 to-orange-400 text-white px-2 py-0.5 rounded-full text-xs font-bold shadow-sm">
                    ⭐ TOP RATED
                  </div>
                )}
              </div>
            </div>

            {/* Enhanced Specialties with Modern Styling */}
            <div className="flex flex-wrap gap-2 mb-4">
              {therapist.specialties?.map((specialty, index) => {
                const colors = [
                  "bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 border-blue-200",
                  "bg-gradient-to-r from-emerald-50 to-green-50 text-emerald-700 border-emerald-200", 
                  "bg-gradient-to-r from-purple-50 to-violet-50 text-purple-700 border-purple-200",
                  "bg-gradient-to-r from-rose-50 to-pink-50 text-rose-700 border-rose-200",
                  "bg-gradient-to-r from-amber-50 to-yellow-50 text-amber-700 border-amber-200"
                ];
                const colorClass = colors[index % colors.length];
                
                return (
                  <Badge 
                    key={index} 
                    variant="outline" 
                    className={`text-xs font-medium px-3 py-1 transition-all duration-200 hover:scale-105 hover:shadow-sm ${colorClass}`}
                  >
                    {specialty}
                  </Badge>
                );
              }) || (
                <Badge variant="outline" className="text-xs bg-gradient-to-r from-gray-50 to-slate-50 text-gray-700 border-gray-200">
                  General Therapy
                </Badge>
              )}
            </div>

            {/* Enhanced Available Time */}
            {nextAvailableTime && (
              <div className="flex items-center text-sm mb-3 bg-gradient-to-r from-green-50 to-emerald-50 px-3 py-2 rounded-lg border border-green-100">
                <div className="bg-green-100 p-1.5 rounded-full mr-3">
                  <Calendar size={14} className="text-green-600" />
                </div>
                <div>
                  <div className="font-medium text-green-800">Next Available</div>
                  <div className="text-xs text-green-600">
                    {nextAvailableTime.day}, {nextAvailableTime.time}
                  </div>
                </div>
              </div>
            )}

            {/* Enhanced Bio Section */}
            <div className="bg-gradient-to-r from-gray-50/50 to-slate-50/50 rounded-lg p-3 mb-4 border border-gray-100">
              <p className="text-sm text-gray-700 line-clamp-2 leading-relaxed">
                {therapist.bio || "Experienced therapist dedicated to helping you achieve your mental health goals."}
              </p>
            </div>

            {/* Enhanced Action Buttons */}
            <div className="flex gap-3 mt-auto">
              <Button 
                variant="outline" 
                className="flex-1 gap-2 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 text-blue-700 hover:from-blue-100 hover:to-indigo-100 hover:border-blue-300 hover:text-blue-800 transition-all duration-200 hover:scale-[1.02] hover:shadow-md font-medium"
                onClick={(e) => {
                  e.stopPropagation();
                  onBooking?.(therapist.id);
                }}
              >
                <PhoneCall size={16} className="transition-transform duration-200 group-hover:scale-110" />
                Book Session
              </Button>
              <Button 
                variant="outline" 
                className="flex-1 gap-2 bg-gradient-to-r from-emerald-50 to-green-50 border-emerald-200 text-emerald-700 hover:from-emerald-100 hover:to-green-100 hover:border-emerald-300 hover:text-emerald-800 transition-all duration-200 hover:scale-[1.02] hover:shadow-md font-medium"
                onClick={(e) => {
                  e.stopPropagation();
                  onMessage?.(therapist.id);
                }}
              >
                <MessageSquare size={16} className="transition-transform duration-200 group-hover:scale-110" />
                Message
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
