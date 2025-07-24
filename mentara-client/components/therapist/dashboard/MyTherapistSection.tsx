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
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={THERAPIST_HOVER.cardLift}
      whileTap={THERAPIST_TAP.card}
    >
      <Card className="overflow-hidden border-l-4 border-l-blue-400 bg-gradient-to-r from-blue-50/30 to-white hover:shadow-lg transition-all duration-200">
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-0">
            <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
              {/* Therapist Avatar */}
              <motion.div 
                className="relative"
                whileHover={THERAPIST_HOVER.subtle}
              >
                <Avatar className="h-14 w-14 border-2 border-white shadow-md">
                  <AvatarImage 
                    src={therapist.profileImage} 
                    alt={therapistName} 
                  />
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-teal-500 text-white font-semibold text-lg">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                {/* Active indicator */}
                <motion.div 
                  className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full flex items-center justify-center"
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                >
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </motion.div>
              </motion.div>

              {/* Therapist Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="font-bold text-lg text-gray-900 truncate">
                    {therapistName}
                  </h3>
                  <motion.div whileHover={THERAPIST_HOVER.subtle}>
                    <Badge 
                      variant="secondary" 
                      className="bg-green-100 text-green-800 border-green-200 flex-shrink-0"
                    >
                      <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
                      Active
                    </Badge>
                  </motion.div>
                </div>

                <p className="text-sm text-gray-600 mb-2 font-medium">{therapist.title}</p>

                {/* Specialties */}
                {therapist.specialties && therapist.specialties.length > 0 && (
                  <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                    {therapist.specialties.slice(0, 3).join(" • ")}
                    {therapist.specialties.length > 3 &&
                      ` • +${therapist.specialties.length - 3} more`}
                  </p>
                )}

                {/* Experience, Rate, and Rating */}
                <div className="flex items-center gap-2 sm:gap-4 text-sm text-gray-500 flex-wrap">
                  <span className="flex items-center gap-1">
                    <User className="h-3 w-3 flex-shrink-0" />
                    <span className="whitespace-nowrap">{therapist.experience || 8}+ years</span>
                  </span>
                  <span className="whitespace-nowrap">${therapist.hourlyRate}/hour</span>
                  <div className="flex items-center gap-1">
                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                    <span className="whitespace-nowrap">4.8 (127 reviews)</span>
                  </div>
                </div>

                {/* Connection status */}
                <div className="flex items-center gap-2 mt-3">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse flex-shrink-0"></div>
                  <p className="text-xs text-green-700 font-medium">
                    Connected since {new Date().getFullYear() - 1}
                  </p>
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-col sm:items-end gap-2 sm:ml-4 flex-shrink-0">
              {/* Primary action - Schedule */}
              <motion.div
                whileHover={THERAPIST_HOVER.buttonLift}
                whileTap={THERAPIST_TAP.button}
              >
                <Button
                  size="sm"
                  onClick={() => onSchedule(therapist.id)}
                  className="w-full sm:min-w-[120px] sm:w-auto bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 text-white shadow-md hover:shadow-lg transition-all duration-200"
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  Schedule
                </Button>
              </motion.div>

              {/* Secondary actions */}
              <div className="flex gap-2 w-full sm:w-auto">
                <motion.div 
                  whileHover={THERAPIST_HOVER.buttonLift}
                  whileTap={THERAPIST_TAP.button}
                  className="flex-1 sm:flex-none"
                >
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onMessage(therapist.id)}
                    className="w-full text-teal-600 border-teal-200 hover:bg-teal-50 hover:border-teal-300 transition-colors"
                  >
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Message
                  </Button>
                </motion.div>
                
                <motion.div 
                  whileHover={THERAPIST_HOVER.buttonLift}
                  whileTap={THERAPIST_TAP.button}
                  className="flex-1 sm:flex-none"
                >
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onViewProfile(therapist.id)}
                    className="w-full text-blue-600 border-blue-200 hover:bg-blue-50 hover:border-blue-300 transition-colors"
                  >
                    <User className="h-4 w-4 mr-2" />
                    Profile
                  </Button>
                </motion.div>
              </div>
            </div>
          </div>

          {/* Optional therapist bio preview */}
          {therapist.bio && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <p className="text-sm text-gray-600 line-clamp-2 italic">
                "{therapist.bio.substring(0, 120)}
                {therapist.bio.length > 120 ? "..." : ""}"
              </p>
            </div>
          )}
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
        You haven&apos;t connected with any therapists yet. Our platform makes it easy to 
        find qualified mental health professionals who match your needs and preferences.
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
    <div className="space-y-4">
      {Array.from({ length: 3 }).map((_, index) => (
        <Card key={index} className="overflow-hidden border-l-4 border-l-gray-200 bg-gradient-to-r from-gray-50/30 to-white">
          <CardContent className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-0">
              <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                <div className="relative">
                  <Skeleton className="h-14 w-14 rounded-full" />
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-gray-200 rounded-full"></div>
                </div>
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-48" />
                  <div className="flex items-center gap-4">
                    <Skeleton className="h-3 w-16" />
                    <Skeleton className="h-3 w-20" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <Skeleton className="h-8 w-24" />
                <div className="flex gap-2">
                  <Skeleton className="h-8 w-20" />
                  <Skeleton className="h-8 w-20" />
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
      <div className="space-y-8 p-6">
        {/* Healthcare Loading Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-200 to-teal-200 rounded-full animate-pulse"></div>
            <div>
              <Skeleton className="h-7 w-48 mb-2" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
          <Skeleton className="h-4 w-32" />
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
          We&apos;re having trouble loading your therapist connections. This might be a temporary issue.
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
    <div className="space-y-8 p-6">
      {/* Enhanced Healthcare Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* Healthcare Professional Icon */}
          <div className="w-14 h-14 bg-gradient-to-r from-blue-500 to-teal-500 rounded-xl flex items-center justify-center shadow-lg">
            <Users className="h-7 w-7 text-white" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-gray-900 tracking-tight">
              Your Care Team
            </h2>
            <p className="text-gray-600 text-lg">
              Professional therapists supporting your mental health journey
            </p>
          </div>
        </div>
        
        {/* Connection Status */}
        <div className="text-right">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
            <p className="text-sm font-semibold text-green-700">
              {therapists.length} Active Connection{therapists.length !== 1 ? "s" : ""}
            </p>
          </div>
          <p className="text-xs text-gray-500">
            Ready to support you
          </p>
        </div>
      </div>

      {/* Professional Therapist Cards with Staggered Animation */}
      <motion.div 
        className="space-y-6"
        initial="hidden"
        animate="visible"
        variants={{
          visible: {
            transition: {
              staggerChildren: 0.1,
              delayChildren: 0.2
            }
          }
        }}
      >
        <AnimatePresence mode="popLayout">
          {therapists.map((therapist, index) => (
            <motion.div
              key={therapist.id}
              variants={{
                hidden: { 
                  opacity: 0, 
                  y: 30, 
                  scale: 0.9 
                },
                visible: { 
                  opacity: 1, 
                  y: 0, 
                  scale: 1,
                  transition: {
                    duration: 0.5,
                    ease: [0.25, 0.25, 0, 1],
                    delay: index * 0.1
                  }
                }
              }}
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
      </motion.div>
      
      {/* Healthcare Information Footer */}
      <div className="bg-gradient-to-r from-blue-50 via-white to-teal-50 border border-blue-100 rounded-2xl p-6 mt-8">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-teal-500 rounded-full flex items-center justify-center flex-shrink-0">
            <MessageCircle className="h-5 w-5 text-white" />
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">
              Stay Connected with Your Care Team
            </h4>
            <p className="text-sm text-gray-600 leading-relaxed">
              Regular communication with your therapists enhances treatment outcomes. 
              Use the message feature for non-urgent questions, or schedule sessions for comprehensive care.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}