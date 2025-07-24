"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageCircle, Calendar, User, Star, MapPin, Clock } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMyTherapists } from "@/hooks/therapist/useMyTherapists";
import { Skeleton } from "@/components/ui/skeleton";

interface ActiveTherapistCardProps {
  therapist: {
    id: string;
    name: string;
    title: string;
    bio: string;
    rating: number;
    reviewCount: number;
    specialties: string[];
    hourlyRate: number;
    profileImage?: string;
  };
  onViewProfile: (therapistId: string) => void;
  onMessage: (therapistId: string) => void;
  onSchedule: (therapistId: string) => void;
}

function ActiveTherapistCard({ 
  therapist, 
  onViewProfile, 
  onMessage, 
  onSchedule 
}: ActiveTherapistCardProps) {
  const initials = therapist.name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase();

  return (
    <Card className="hover:shadow-md transition-shadow duration-200">
      <CardHeader className="pb-4">
        <div className="flex items-start gap-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={therapist.profileImage} alt={therapist.name} />
            <AvatarFallback className="bg-blue-100 text-blue-600 text-lg font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 space-y-2">
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-xl font-semibold text-gray-900">
                  {therapist.name}
                </CardTitle>
                <p className="text-gray-600 font-medium">{therapist.title}</p>
              </div>
              <Badge variant="secondary" className="bg-green-100 text-green-700 hover:bg-green-100">
                Active
              </Badge>
            </div>
            
            {/* Rating */}
            <div className="flex items-center gap-2">
              <div className="flex items-center">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span className="text-sm font-medium ml-1">{therapist.rating}</span>
              </div>
              <span className="text-sm text-gray-500">
                ({therapist.reviewCount} reviews)
              </span>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Bio */}
        <p className="text-gray-700 text-sm leading-relaxed line-clamp-2">
          {therapist.bio}
        </p>

        {/* Specialties */}
        {therapist.specialties.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {therapist.specialties.slice(0, 3).map((specialty, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {specialty}
              </Badge>
            ))}
            {therapist.specialties.length > 3 && (
              <Badge variant="outline" className="text-xs text-gray-500">
                +{therapist.specialties.length - 3} more
              </Badge>
            )}
          </div>
        )}

        {/* Rate */}
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Clock className="h-4 w-4" />
          <span>${therapist.hourlyRate}/session</span>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onViewProfile(therapist.id)}
            className="flex-1"
          >
            <User className="h-4 w-4 mr-2" />
            View Profile
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onMessage(therapist.id)}
            className="flex-1"
          >
            <MessageCircle className="h-4 w-4 mr-2" />
            Message
          </Button>
          <Button
            size="sm"
            onClick={() => onSchedule(therapist.id)}
            className="flex-1"
          >
            <Calendar className="h-4 w-4 mr-2" />
            Schedule
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function EmptyTherapistState() {
  return (
    <div className="text-center py-12 px-6">
      <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
        <Users className="h-12 w-12 text-gray-400" />
      </div>
      
      <h3 className="text-xl font-semibold text-gray-900 mb-2">
        No Active Therapists
      </h3>
      
      <p className="text-gray-600 mb-6 max-w-md mx-auto">
        You haven't connected with any therapists yet. Browse our qualified therapists 
        and send connection requests to get started with your mental health journey.
      </p>
      
      <Button className="bg-blue-600 hover:bg-blue-700">
        <Search className="h-4 w-4 mr-2" />
        Find a Therapist
      </Button>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 3 }).map((_, index) => (
        <Card key={index} className="overflow-hidden">
          <CardHeader className="pb-4">
            <div className="flex items-start gap-4">
              <Skeleton className="h-16 w-16 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-20" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <div className="flex gap-2">
              <Skeleton className="h-6 w-16" />
              <Skeleton className="h-6 w-20" />
              <Skeleton className="h-6 w-18" />
            </div>
            <div className="flex gap-2 pt-2">
              <Skeleton className="h-8 flex-1" />
              <Skeleton className="h-8 flex-1" />
              <Skeleton className="h-8 flex-1" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default function MyTherapistSection() {
  const router = useRouter();
  const { data: therapists, isLoading, error } = useMyTherapists();

  const handleViewProfile = (therapistId: string) => {
    router.push(`/client/profile/${therapistId}`);
  };

  const handleMessage = (therapistId: string) => {
    router.push(`/client/messages?contact=${encodeURIComponent(therapistId)}`);
  };

  const handleSchedule = (therapistId: string) => {
    router.push(`/client/booking?therapist=${encodeURIComponent(therapistId)}`);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">My Therapists</h2>
          <Skeleton className="h-4 w-32" />
        </div>
        <LoadingSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="mx-auto w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mb-6">
          <User className="h-12 w-12 text-red-400" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Failed to Load Therapists
        </h3>
        <p className="text-gray-600 mb-6">
          We couldn't load your therapist connections. Please try again.
        </p>
        <Button variant="outline" onClick={() => window.location.reload()}>
          Try Again
        </Button>
      </div>
    );
  }

  if (!therapists || therapists.length === 0) {
    return <EmptyTherapistState />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">My Therapists</h2>
        <p className="text-sm text-gray-600">
          {therapists.length} active connection{therapists.length !== 1 ? 's' : ''}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {therapists.map((therapist) => (
          <ActiveTherapistCard
            key={therapist.id}
            therapist={therapist}
            onViewProfile={handleViewProfile}
            onMessage={handleMessage}
            onSchedule={handleSchedule}
          />
        ))}
      </div>
    </div>
  );
}