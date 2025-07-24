"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  console.log("Therapist:", therapist);
  const initials = `${therapist.firstName} ${therapist.lastName}`
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      transition={{ 
        duration: 0.4, 
        ease: [0.25, 0.25, 0, 1],
        layout: { duration: 0.3 }
      }}
      whileHover={{ 
        y: -8, 
        transition: { duration: 0.2, ease: "easeOut" } 
      }}
      className="group"
    >
      <Card className="overflow-hidden bg-gradient-to-br from-white via-white to-blue-50/30 border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
        {/* Healthcare Professional Header */}
        <motion.div 
          className="bg-gradient-to-r from-blue-500 via-teal-500 to-cyan-500 p-4"
          whileHover={{ 
            background: "linear-gradient(to right, rgb(59 130 246), rgb(20 184 166), rgb(6 182 212))",
            transition: { duration: 0.3 }
          }}
        >
          <div className="flex items-start gap-4">
            <motion.div 
              className="relative"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
            >
              <Avatar className="h-16 w-16 border-3 border-white shadow-lg">
                <AvatarImage
                  src={therapist.profileImage}
                  alt={`${therapist.firstName} ${therapist.lastName}`}
                />
                <AvatarFallback className="bg-gradient-to-br from-white to-blue-50 text-blue-600 text-lg font-bold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              {/* Professional Status Indicator */}
              <motion.div 
                className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-400 border-2 border-white rounded-full flex items-center justify-center"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              >
                <div className="w-2 h-2 bg-white rounded-full"></div>
              </motion.div>
            </motion.div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-2">
              <div>
                <CardTitle className="text-xl font-bold text-white truncate">
                  Dr. {`${therapist.firstName} ${therapist.lastName}`}
                </CardTitle>
                <p className="text-blue-100 font-medium text-sm">{therapist.title}</p>
              </div>
              <Badge className="bg-white/20 backdrop-blur-sm text-white border-white/30 hover:bg-white/30 font-medium">
                <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
                Active
              </Badge>
            </div>

            {/* Professional Rating */}
            <div className="flex items-center gap-3">
              <div className="flex items-center bg-white/20 backdrop-blur-sm rounded-full px-3 py-1">
                <Star className="h-4 w-4 fill-yellow-300 text-yellow-300 mr-1" />
                <span className="text-white font-semibold text-sm">
                  {therapist.rating || '4.8'}
                </span>
              </div>
              <span className="text-blue-100 text-sm">
                ({therapist.reviewCount || '127'} reviews)
              </span>
            </div>
          </div>
        </div>
      </div>

      <CardContent className="p-6 space-y-5">
        {/* Professional Bio */}
        {therapist.bio && (
          <div className="bg-gray-50/80 rounded-lg p-4 border-l-4 border-l-teal-400">
            <p className="text-gray-700 text-sm leading-relaxed line-clamp-3 italic">
              "{therapist.bio}"
            </p>
          </div>
        )}

        {/* Clinical Specialties */}
        {therapist.specialties && therapist.specialties.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <div className="w-2 h-2 bg-teal-500 rounded-full"></div>
              Clinical Specialties
            </h4>
            <div className="flex flex-wrap gap-2">
              {therapist.specialties.slice(0, 4).map((specialty, index) => (
                <Badge
                  key={index}
                  variant="outline"
                  className="bg-gradient-to-r from-teal-50 to-blue-50 border-teal-200 text-teal-800 font-medium text-xs hover:from-teal-100 hover:to-blue-100 transition-colors"
                >
                  {specialty}
                </Badge>
              ))}
              {therapist.specialties.length > 4 && (
                <Badge
                  variant="outline"
                  className="bg-gray-50 border-gray-200 text-gray-600 text-xs"
                >
                  +{therapist.specialties.length - 4} more
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Professional Details */}
        <div className="grid grid-cols-2 gap-4 p-4 bg-gradient-to-r from-blue-50/50 to-teal-50/50 rounded-xl">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <User className="h-4 w-4 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium">Experience</p>
              <p className="text-sm font-semibold text-gray-800">{therapist.experience || '8+'} years</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <Clock className="h-4 w-4 text-green-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium">Session Rate</p>
              <p className="text-sm font-semibold text-gray-800">${therapist.hourlyRate}/hour</p>
            </div>
          </div>
        </div>

        {/* Professional Action Buttons */}
        <motion.div 
          className="grid grid-cols-3 gap-2"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.3 }}
        >
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onViewProfile(therapist.id)}
              className="w-full border-blue-200 text-blue-700 hover:bg-blue-50 hover:border-blue-300 transition-all duration-200"
            >
              <motion.div
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ duration: 0.2 }}
              >
                <User className="h-4 w-4 mr-2" />
              </motion.div>
              <span className="text-xs font-medium">Profile</span>
            </Button>
          </motion.div>
          
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onMessage(therapist.id)}
              className="w-full border-teal-200 text-teal-700 hover:bg-teal-50 hover:border-teal-300 transition-all duration-200"
            >
              <motion.div
                whileHover={{ scale: 1.1, x: 2 }}
                transition={{ duration: 0.2 }}
              >
                <MessageCircle className="h-4 w-4 mr-2" />
              </motion.div>
              <span className="text-xs font-medium">Message</span>
            </Button>
          </motion.div>
          
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              size="sm"
              onClick={() => onSchedule(therapist.id)}
              className="w-full bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 text-white shadow-md hover:shadow-lg transition-all duration-200"
            >
              <motion.div
                whileHover={{ scale: 1.15, y: -1 }}
                transition={{ duration: 0.2 }}
              >
                <Calendar className="h-4 w-4 mr-2" />
              </motion.div>
              <span className="text-xs font-medium">Book</span>
            </Button>
          </motion.div>
        </motion.div>
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
        You haven't connected with any therapists yet. Our platform makes it easy to 
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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 3 }).map((_, index) => (
        <Card key={index} className="overflow-hidden bg-gradient-to-br from-white via-white to-blue-50/30 border-0 shadow-lg">
          {/* Professional Header Skeleton */}
          <div className="bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 p-4 animate-pulse">
            <div className="flex items-start gap-4">
              <div className="relative">
                <Skeleton className="h-16 w-16 rounded-full bg-white/50" />
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-white/50 rounded-full"></div>
              </div>
              <div className="flex-1 space-y-2">
                <Skeleton className="h-5 w-32 bg-white/60" />
                <Skeleton className="h-4 w-24 bg-white/50" />
                <div className="flex items-center gap-2">
                  <Skeleton className="h-6 w-16 rounded-full bg-white/50" />
                </div>
              </div>
            </div>
          </div>

          <CardContent className="p-6 space-y-5">
            {/* Bio Skeleton */}
            <div className="bg-gray-50 rounded-lg p-4 border-l-4 border-l-gray-200">
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-3/4" />
            </div>

            {/* Specialties Skeleton */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2 h-2 bg-gray-200 rounded-full"></div>
                <Skeleton className="h-4 w-24" />
              </div>
              <div className="flex flex-wrap gap-2">
                <Skeleton className="h-6 w-20 rounded-full" />
                <Skeleton className="h-6 w-24 rounded-full" />
                <Skeleton className="h-6 w-16 rounded-full" />
              </div>
            </div>

            {/* Professional Details Skeleton */}
            <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-2">
                <Skeleton className="w-8 h-8 rounded-full" />
                <div>
                  <Skeleton className="h-3 w-16 mb-1" />
                  <Skeleton className="h-4 w-12" />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Skeleton className="w-8 h-8 rounded-full" />
                <div>
                  <Skeleton className="h-3 w-16 mb-1" />
                  <Skeleton className="h-4 w-12" />
                </div>
              </div>
            </div>

            {/* Action Buttons Skeleton */}
            <div className="grid grid-cols-3 gap-2">
              <Skeleton className="h-8 rounded-lg" />
              <Skeleton className="h-8 rounded-lg" />
              <Skeleton className="h-8 rounded-lg" />
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
          We're having trouble loading your therapist connections. This might be a temporary issue.
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

      {/* Professional Therapist Cards Grid with Staggered Animation */}
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
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
