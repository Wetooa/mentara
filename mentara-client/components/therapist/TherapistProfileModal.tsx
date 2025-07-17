"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Calendar, 
  Clock, 
  DollarSign, 
  Star, 
  PhoneCall, 
  MessageSquare, 
  Heart,
  BookOpen,
  Award,
  Users
} from "lucide-react";
import { TherapistCardData } from "@/types/therapist";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useFavorites } from "@/hooks/useFavorites";
import { toast } from "sonner";
import ReviewSection from "@/components/reviews/ReviewSection";
import ReviewForm from "@/components/reviews/ReviewForm";
import { useAuth } from "@/hooks/auth";

interface TherapistProfileModalProps {
  therapist: TherapistCardData | null;
  isOpen: boolean;
  onClose: () => void;
  onBooking?: (therapistId: string) => void;
  onMessage?: (therapistId: string) => void;
}

export default function TherapistProfileModal({
  therapist,
  isOpen,
  onClose,
  onBooking,
  onMessage,
}: TherapistProfileModalProps) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const { user } = useAuth();
  const userId = user?.id;
  const [isReviewFormOpen, setIsReviewFormOpen] = React.useState(false);

  if (!therapist) return null;

  const isTherapistFavorited = isFavorite(therapist.id);

  const handleToggleFavorite = () => {
    toggleFavorite(therapist.id);
    toast.success(
      isTherapistFavorited 
        ? `Removed ${therapist.name} from favorites` 
        : `Added ${therapist.name} to favorites`
    );
  };

  const initials = therapist.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0">
        <ScrollArea className="max-h-[90vh]">
          <div className="p-6">
            <DialogHeader className="mb-6">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-4">
                  <Avatar className="h-20 w-20">
                    <AvatarImage 
                      src={therapist.imageUrl} 
                      alt={therapist.name}
                    />
                    <AvatarFallback className="text-lg">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <DialogTitle className="text-2xl font-bold mb-1">
                      {therapist.name}
                    </DialogTitle>
                    <p className="text-lg text-muted-foreground mb-2">
                      {therapist.title}
                    </p>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="ml-1 text-sm font-medium">
                          {therapist.rating.toFixed(1)}
                        </span>
                      </div>
                      <div
                        className={`flex items-center gap-1 text-sm ${
                          therapist.isActive ? "text-green-600" : "text-gray-500"
                        }`}
                      >
                        <div
                          className={`w-2 h-2 rounded-full ${
                            therapist.isActive ? "bg-green-500" : "bg-gray-400"
                          }`}
                        />
                        {therapist.isActive ? "Available" : "Unavailable"}
                      </div>
                    </div>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleToggleFavorite}
                  className="p-2"
                >
                  <Heart
                    className={`h-5 w-5 ${
                      isTherapistFavorited ? "fill-red-500 text-red-500" : "text-gray-400"
                    }`}
                  />
                </Button>
              </div>
            </DialogHeader>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-6">
                {/* About Section */}
                <Card>
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                      <BookOpen className="h-5 w-5" />
                      About
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {therapist.bio || "This therapist hasn't provided a bio yet."}
                    </p>
                  </CardContent>
                </Card>

                {/* Specialties */}
                <Card>
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                      <Award className="h-5 w-5" />
                      Specialties & Expertise
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {therapist.specialties.map((specialty, index) => (
                        <Badge key={index} variant="secondary" className="text-sm">
                          {specialty}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Experience & Qualifications */}
                <Card>
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      Experience & Qualifications
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="bg-blue-100 p-2 rounded-full">
                          <Calendar className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium">Years of Experience</p>
                          <p className="text-sm text-muted-foreground">
                            {therapist.experience} years in practice
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="bg-green-100 p-2 rounded-full">
                          <Award className="h-4 w-4 text-green-600" />
                        </div>
                        <div>
                          <p className="font-medium">Professional Title</p>
                          <p className="text-sm text-muted-foreground">
                            {therapist.title}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Availability */}
                {therapist.availableTimes.length > 0 && (
                  <Card>
                    <CardContent className="p-6">
                      <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                        <Calendar className="h-5 w-5" />
                        Upcoming Availability
                      </h3>
                      <div className="space-y-2">
                        {therapist.availableTimes.slice(0, 5).map((time, index) => (
                          <div key={index} className="flex items-center gap-3 p-2 bg-gray-50 rounded-md">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">{time.day}</span>
                            <span className="text-muted-foreground">{time.time}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Reviews Section */}
                <Card>
                  <CardContent className="p-6">
                    <ReviewSection
                      therapistId={therapist.id}
                      currentUserId={userId || undefined}
                      onWriteReview={() => setIsReviewFormOpen(true)}
                      showWriteReviewButton={true}
                    />
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar */}
              <div className="space-y-4">
                {/* Quick Info */}
                <Card>
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold mb-4">Session Details</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">Session Rate</span>
                        </div>
                        <span className="font-medium">${therapist.sessionPrice}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">Duration</span>
                        </div>
                        <span className="font-medium">{therapist.sessionDuration} min</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Star className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">Rating</span>
                        </div>
                        <span className="font-medium">{therapist.rating.toFixed(1)}/5.0</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Action Buttons */}
                <div className="space-y-3">
                  <Button 
                    onClick={() => onBooking?.(therapist.id)}
                    className="w-full gap-2"
                    disabled={!therapist.isActive}
                  >
                    <PhoneCall className="h-4 w-4" />
                    Book Session
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => onMessage?.(therapist.id)}
                    className="w-full gap-2"
                  >
                    <MessageSquare className="h-4 w-4" />
                    Send Message
                  </Button>
                </div>

                {/* Quick Stats */}
                <Card>
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold mb-4">Quick Stats</h3>
                    <div className="space-y-3">
                      <div className="text-center p-3 bg-blue-50 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">
                          {therapist.experience}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Years Experience
                        </div>
                      </div>
                      <div className="text-center p-3 bg-green-50 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">
                          {therapist.rating.toFixed(1)}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Average Rating
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>

      {/* Review Form Modal */}
      <ReviewForm
        therapist={therapist}
        isOpen={isReviewFormOpen}
        onClose={() => setIsReviewFormOpen(false)}
        onSuccess={() => setIsReviewFormOpen(false)}
      />
    </Dialog>
  );
}