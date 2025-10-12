"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  MessageCircle,
  Calendar,
  User,
  Star,
  Clock,
  Users,
  Search,
} from "lucide-react";
import { THERAPIST_HOVER, THERAPIST_TAP } from "@/lib/animations";
import { useRouter } from "next/navigation";
import { useMyTherapists } from "@/hooks/therapist/useMyTherapists";
import { Skeleton } from "@/components/ui/skeleton";
import { TherapistRecommendation } from "@/types/api/therapist";

export interface ActiveTherapistCardProps {
  therapist: TherapistRecommendation;
  onViewProfile: (therapistId: string) => void;
  onMessage: (therapistId: string) => void;
  onSchedule: (therapistId: string) => void;
}

function ActiveTherapistCard({
  therapist,
  onViewProfile,
  onMessage,
  onSchedule,
}: ActiveTherapistCardProps) {
  // Generate therapist name and initials
  const therapistName = `Dr. ${therapist.firstName} ${therapist.lastName}`;
  const initials = `${therapist.firstName.charAt(0)}${therapist.lastName.charAt(0)}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="h-full"
    >
      <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 h-full flex flex-col border-2 hover:border-primary/30">
        <CardContent className="p-0 flex flex-col h-full">
          {/* Profile Image Section */}
          <div className="relative h-48 bg-gradient-to-br from-primary/10 to-secondary/10">
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.div whileHover={{ scale: 1.05 }}>
                <Avatar className="h-32 w-32 border-4 border-white shadow-xl">
                  <AvatarImage
                    src={therapist.profileImage}
                    alt={therapistName}
                    className="object-cover"
                  />
                  <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-primary-foreground font-bold text-3xl">
                    {initials}
                  </AvatarFallback>
                </Avatar>
              </motion.div>
            </div>
            {/* Active indicator */}
            <motion.div
              className="absolute top-4 right-4"
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Badge className="bg-green-500 text-white border-2 border-white shadow-md">
                <div className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse"></div>
                Active
              </Badge>
            </motion.div>
          </div>

          {/* Info Section */}
          <div className="p-6 flex-1 flex flex-col">
            {/* Name and Title */}
            <div className="mb-4">
              <h3 className="text-xl font-bold text-gray-900 mb-1">
                {therapistName}
              </h3>
              <p className="text-sm text-gray-600 font-medium">
                {therapist.title}
              </p>
            </div>

            {/* Specialties */}
            {therapist.specialties && therapist.specialties.length > 0 && (
              <div className="mb-4">
                <div className="flex flex-wrap gap-2">
                  {therapist.specialties.slice(0, 3).map((specialty, idx) => (
                    <Badge
                      key={idx}
                      variant="secondary"
                      className="bg-primary/10 text-primary border-primary/20"
                    >
                      {specialty}
                    </Badge>
                  ))}
                  {therapist.specialties.length > 3 && (
                    <Badge
                      variant="secondary"
                      className="bg-gray-100 text-gray-600"
                    >
                      +{therapist.specialties.length - 3} more
                    </Badge>
                  )}
                </div>
              </div>
            )}

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
              <div className="flex items-center gap-2 text-gray-600">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Clock className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">
                    {therapist.experience || 8}+
                  </p>
                  <p className="text-xs">Years Exp.</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">4.8</p>
                  <p className="text-xs">Rating</p>
                </div>
              </div>
            </div>

            {/* Price */}
            <div className="mb-4 p-3 bg-primary/5 rounded-lg border border-primary/20">
              <p className="text-sm text-gray-600">Session Rate</p>
              <p className="text-2xl font-bold text-primary">
                ${therapist.hourlyRate}
                <span className="text-sm font-normal text-gray-600">/hour</span>
              </p>
            </div>

            {/* Actions - Stacked for better mobile */}
            <div className="mt-auto space-y-2">
              <Button
                onClick={() => onSchedule(therapist.id)}
                className="w-full bg-primary hover:bg-primary/90 shadow-md"
                size="lg"
              >
                <Calendar className="h-4 w-4 mr-2" />
                Schedule Session
              </Button>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  onClick={() => onMessage(therapist.id)}
                  className="border-primary/30 text-primary hover:bg-primary/10"
                >
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Message
                </Button>
                <Button
                  variant="outline"
                  onClick={() => onViewProfile(therapist.id)}
                  className="border-gray-300 hover:bg-gray-50"
                >
                  <User className="h-4 w-4 mr-2" />
                  Profile
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function EmptyTherapistState() {
  return (
    <div className="text-center py-16 px-6">
      {/* Healthcare-focused empty state illustration */}
      <div className="relative mx-auto w-32 h-32 mb-8">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-100 via-teal-100 to-cyan-100 rounded-full"></div>
        <div className="absolute inset-2 bg-gradient-to-br from-white to-blue-50 rounded-full flex items-center justify-center shadow-inner">
          <Users className="h-16 w-16 text-blue-400" />
        </div>
        {/* Floating medical cross indicators */}
        <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-teal-400 to-cyan-400 rounded-full flex items-center justify-center">
          <div className="w-3 h-3 bg-white rounded-sm"></div>
        </div>
        <div className="absolute -bottom-2 -left-2 w-4 h-4 bg-gradient-to-r from-blue-400 to-teal-400 rounded-full"></div>
      </div>

      <h3 className="text-2xl font-bold text-gray-900 mb-3">
        Ready to Begin Your Journey?
      </h3>

      <p className="text-gray-600 mb-8 max-w-lg mx-auto text-lg">
        You haven&apos;t connected with any therapists yet. Our platform makes
        it easy to find qualified mental health professionals who match your
        needs and preferences.
      </p>

      {/* Enhanced call-to-action with healthcare styling */}
      <div className="space-y-4">
        <Button className="bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 text-white px-8 py-3 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5">
          <Search className="h-5 w-5 mr-3" />
          Explore Qualified Therapists
        </Button>

        {/* Additional helpful information */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-12 max-w-3xl mx-auto">
          <div className="bg-gradient-to-br from-blue-50 to-teal-50 rounded-xl p-6 border border-blue-100">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-teal-500 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Search className="h-6 w-6 text-white" />
            </div>
            <h4 className="font-semibold text-gray-900 mb-2">Browse & Match</h4>
            <p className="text-sm text-gray-600">
              Find therapists by specialty, location, and availability
            </p>
          </div>

          <div className="bg-gradient-to-br from-teal-50 to-cyan-50 rounded-xl p-6 border border-teal-100">
            <div className="w-12 h-12 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-lg flex items-center justify-center mx-auto mb-4">
              <MessageCircle className="h-6 w-6 text-white" />
            </div>
            <h4 className="font-semibold text-gray-900 mb-2">Send Requests</h4>
            <p className="text-sm text-gray-600">
              Connect with therapists who are the right fit for you
            </p>
          </div>

          <div className="bg-gradient-to-br from-cyan-50 to-blue-50 rounded-xl p-6 border border-cyan-100">
            <div className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Calendar className="h-6 w-6 text-white" />
            </div>
            <h4 className="font-semibold text-gray-900 mb-2">Start Sessions</h4>
            <p className="text-sm text-gray-600">
              Schedule and attend therapy sessions online or in-person
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {Array.from({ length: 4 }).map((_, index) => (
        <Card key={index} className="overflow-hidden">
          <CardContent className="p-0">
            {/* Image area skeleton */}
            <div className="h-48 bg-gray-200 animate-pulse" />

            {/* Content area skeleton */}
            <div className="p-6 space-y-4">
              <div className="space-y-2">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
              <div className="flex gap-2">
                <Skeleton className="h-6 w-20" />
                <Skeleton className="h-6 w-24" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
              </div>
              <Skeleton className="h-20 w-full" />
              <div className="space-y-2">
                <Skeleton className="h-10 w-full" />
                <div className="grid grid-cols-2 gap-2">
                  <Skeleton className="h-9 w-full" />
                  <Skeleton className="h-9 w-full" />
                </div>
              </div>
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
      <div className="space-y-6 p-6">
        <div className="flex items-center justify-between mb-2">
          <div>
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-5 w-32" />
          </div>
        </div>
        <LoadingSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-16 px-6">
        {/* Healthcare Error State */}
        <div className="relative mx-auto w-24 h-24 mb-8">
          <div className="absolute inset-0 bg-gradient-to-br from-red-100 to-pink-100 rounded-full"></div>
          <div className="absolute inset-2 bg-gradient-to-br from-white to-red-50 rounded-full flex items-center justify-center shadow-inner">
            <User className="h-12 w-12 text-red-400" />
          </div>
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-3">
          Connection Issue
        </h3>
        <p className="text-gray-600 mb-8 max-w-md mx-auto">
          We&apos;re having trouble loading your therapist connections. This
          might be a temporary issue.
        </p>
        <Button
          variant="outline"
          onClick={() => window.location.reload()}
          className="bg-gradient-to-r from-red-50 to-pink-50 border-red-200 text-red-700 hover:from-red-100 hover:to-pink-100"
        >
          Try Again
        </Button>
      </div>
    );
  }

  if (!therapists || therapists.length === 0) {
    return <EmptyTherapistState />;
  }

  return (
    <div className="space-y-6 p-6">
      {/* Simplified Header */}
      <div className="flex items-center justify-between mb-2">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            My Therapist{therapists.length > 1 ? "s" : ""}
          </h2>
          <p className="text-gray-600 mt-1">
            {therapists.length} active connection
            {therapists.length !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      {/* Grid Layout for Therapist Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AnimatePresence mode="popLayout">
          {therapists.map((therapist, index) => (
            <motion.div
              key={therapist.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              layout
            >
              <ActiveTherapistCard
                therapist={therapist}
                onViewProfile={handleViewProfile}
                onMessage={handleMessage}
                onSchedule={handleSchedule}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
