"use client";

import React, { useState } from "react";
import TherapistCard from "./listing/TherapistCard";
import TherapistProfileModal from "./TherapistProfileModal";
import BookingModal from "../booking/BookingModal";
import { useFavorites } from "@/hooks/useFavorites";
import { useFilteredTherapists } from "@/hooks/useTherapists";
import { Heart, Star } from "lucide-react";
import { TherapistCardData } from "@/types/therapist";
import { toast } from "sonner";

export default function FavoritesSection() {
  const { favorites, isLoaded } = useFavorites();
  const [selectedTherapist, setSelectedTherapist] = useState<TherapistCardData | null>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

  // Get all therapists to filter favorites from
  const { therapists, isLoading } = useFilteredTherapists("", "All", { limit: 100 });

  // Filter therapists to only show favorites
  const favoriteTherapists = therapists.filter(therapist => 
    favorites.includes(therapist.id)
  );

  const handleViewProfile = (therapist: TherapistCardData) => {
    setSelectedTherapist(therapist);
    setIsProfileModalOpen(true);
  };

  const handleCloseProfileModal = () => {
    setIsProfileModalOpen(false);
    setSelectedTherapist(null);
  };

  const handleBooking = (therapistId: string) => {
    const therapist = therapists.find(t => t.id === therapistId);
    if (therapist) {
      setSelectedTherapist(therapist);
      setIsBookingModalOpen(true);
      setIsProfileModalOpen(false);
    }
  };

  const handleCloseBookingModal = () => {
    setIsBookingModalOpen(false);
    setSelectedTherapist(null);
  };

  const handleBookingSuccess = () => {
    toast.success("Session booked successfully!", {
      description: `Your session with ${selectedTherapist?.name} has been scheduled.`,
    });
  };

  const handleMessage = (therapistId: string) => {
    console.log("Messaging therapist:", therapistId);
    toast.info("Messaging feature coming soon!");
  };

  if (!isLoaded || isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-6">
          <Heart className="h-6 w-6 text-red-500" />
          <h2 className="text-2xl font-bold">Favorite Therapists</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 animate-pulse">
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-16 h-16 bg-gray-200 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
              <div className="space-y-2 mb-4">
                <div className="h-3 bg-gray-200 rounded"></div>
                <div className="h-3 bg-gray-200 rounded w-5/6"></div>
              </div>
              <div className="h-10 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (favorites.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-6">
          <Heart className="h-6 w-6 text-red-500" />
          <h2 className="text-2xl font-bold">Favorite Therapists</h2>
        </div>
        <div className="text-center py-12">
          <div className="text-gray-500 mb-4">
            <Heart className="mx-auto h-16 w-16 text-gray-300" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No favorite therapists yet</h3>
          <p className="text-gray-500 mb-4">
            Start adding therapists to your favorites by clicking the heart icon on their profiles.
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-6">
          <Heart className="h-6 w-6 text-red-500 fill-red-500" />
          <h2 className="text-2xl font-bold">Favorite Therapists</h2>
          <span className="text-sm text-gray-500">({favoriteTherapists.length})</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {favoriteTherapists.map((therapist) => (
            <div key={therapist.id} className="relative">
              {/* Favorite badge */}
              <div className="absolute top-2 right-2 z-10">
                <div className="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                  <Star className="h-3 w-3 fill-white" />
                  Favorite
                </div>
              </div>
              <TherapistCard
                therapist={therapist}
                onViewProfile={handleViewProfile}
                onBooking={handleBooking}
                onMessage={handleMessage}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Therapist Profile Modal */}
      <TherapistProfileModal
        therapist={selectedTherapist}
        isOpen={isProfileModalOpen}
        onClose={handleCloseProfileModal}
        onBooking={handleBooking}
        onMessage={handleMessage}
      />

      {/* Booking Modal */}
      <BookingModal
        therapist={selectedTherapist}
        isOpen={isBookingModalOpen}
        onClose={handleCloseBookingModal}
        onSuccess={handleBookingSuccess}
      />
    </>
  );
}