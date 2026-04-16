"use client";

import React from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { THERAPIST_HOVER, THERAPIST_TAP, THERAPIST_STATUS } from "@/lib/animations";
import { Button } from "@/components/ui/button";
import { Clock, Loader2, X, User, MapPin } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { format, parseISO } from "date-fns";
import type { TherapistRecommendation } from "@/types/api/therapist";

interface TherapistRequestCardProps {
  /** The therapist request data */
  request: TherapistRecommendation;
  /** Function to call when canceling the request */
  onCancel: (therapistId: string) => void;
  /** Whether a cancel operation is in progress */
  isCanceling?: boolean;
  /** Optional CSS class name */
  className?: string;
}

/**
 * Individual card component for displaying a pending therapist request
 * Features: therapist info, request status, cancel functionality
 */
export default function TherapistRequestCard({
  request,
  onCancel,
  isCanceling = false,
  className = "",
}: TherapistRequestCardProps) {
  // Generate therapist name and initials
  const therapistName = `${request.firstName} ${request.lastName}`;
  const initials = `${request.firstName.charAt(0)}${request.lastName.charAt(0)}`;

  // Format the request date
  const requestDate = request.requestedAt
    ? format(parseISO(request.requestedAt), "MMM d, yyyy")
    : "Recently";

  const requestTime = request.requestedAt
    ? format(parseISO(request.requestedAt), "h:mm a")
    : "";

  const handleCancel = () => {
    onCancel(request.id);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={THERAPIST_HOVER.cardLift}
      whileTap={THERAPIST_TAP.card}
    >
      <Card
        className={`overflow-hidden border-l-4 border-l-amber-400 bg-gradient-to-r from-amber-50/30 to-white hover:shadow-lg transition-all duration-200 ${className}`}
      >
      <CardContent className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-0">
          <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
            {/* Therapist Avatar */}
            <motion.div 
              className="relative"
              whileHover={THERAPIST_HOVER.subtle}
            >
              <Avatar className="h-14 w-14 border-2 border-white shadow-md">
                <AvatarImage src={request.profileImage} alt={therapistName} />
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-teal-500 text-white font-semibold text-lg">
                  {initials}
                </AvatarFallback>
              </Avatar>
              {/* Pending indicator */}
              <motion.div 
                className="absolute -top-1 -right-1 w-4 h-4 bg-amber-400 rounded-full flex items-center justify-center"
                {...THERAPIST_STATUS.pulse}
              >
                <Clock className="h-2.5 w-2.5 text-white" />
              </motion.div>
            </motion.div>

            {/* Therapist Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="font-bold text-lg text-gray-900 truncate">
                  {therapistName}
                </h3>
                <motion.div
                  whileHover={THERAPIST_HOVER.subtle}
                >
                  <Badge 
                    variant="secondary" 
                    className="bg-amber-100 text-amber-800 border-amber-200 flex-shrink-0"
                  >
                    <motion.div
                      {...THERAPIST_STATUS.clockRotate}
                    >
                      <Clock className="h-3 w-3 mr-1" />
                    </motion.div>
                    Pending
                  </Badge>
                </motion.div>
              </div>

              {/* Specialties */}
              {request.specialties && request.specialties.length > 0 && (
                <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                  {request.specialties.slice(0, 3).join(" • ")}
                  {request.specialties.length > 3 &&
                    ` • +${request.specialties.length - 3} more`}
                </p>
              )}

              {/* Experience, Rate, and Location */}
              <div className="flex items-center gap-2 sm:gap-4 text-sm text-gray-500 flex-wrap">
                <span className="flex items-center gap-1">
                  <User className="h-3 w-3 flex-shrink-0" />
                  <span className="whitespace-nowrap">{request.experience} years</span>
                </span>
                <span className="whitespace-nowrap">${request.hourlyRate}/hour</span>
                {request.province && (
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3 w-3 flex-shrink-0" />
                    <span className="truncate">{request.province}</span>
                  </span>
                )}
              </div>

              {/* Request timestamp */}
              <div className="flex items-center gap-2 mt-3">
                <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse flex-shrink-0"></div>
                <p className="text-xs text-amber-700 font-medium">
                  Request sent {requestDate} {requestTime && `at ${requestTime}`}
                </p>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:items-end gap-3 sm:ml-4 flex-shrink-0">
            <motion.div
              whileHover={THERAPIST_HOVER.buttonLift}
              whileTap={THERAPIST_TAP.button}
            >
              <Button
                variant="outline"
                size="sm"
                onClick={handleCancel}
                disabled={isCanceling}
                className="text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300 transition-colors w-full sm:min-w-[120px] sm:w-auto"
              >
              {isCanceling ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Canceling...
                </>
              ) : (
                <>
                  <X className="h-4 w-4 mr-2" />
                  Cancel Request
                </>
              )}
              </Button>
            </motion.div>

            {/* Status indicator */}
            <div className="text-xs text-center sm:text-right text-gray-500">
              <div className="flex items-center justify-center sm:justify-end gap-1">
                <span>Awaiting response</span>
              </div>
            </div>
          </div>
        </div>

        {/* Optional therapist bio preview */}
        {request.bio && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <p className="text-sm text-gray-600 line-clamp-2 italic">
              "{request.bio.substring(0, 120)}
              {request.bio.length > 120 ? "..." : ""}"
            </p>
          </div>
        )}
      </CardContent>
    </Card>
    </motion.div>
  );
}

/**
 * Compact version of the TherapistRequestCard for smaller displays or lists
 */
export function CompactTherapistRequestCard({
  request,
  onCancel,
  isCanceling = false,
  className = "",
}: TherapistRequestCardProps) {
  const therapistName = `${request.firstName} ${request.lastName}`;
  const initials = `${request.firstName.charAt(0)}${request.lastName.charAt(0)}`;

  const handleCancel = () => {
    onCancel(request.id);
  };

  return (
    <Card className={`overflow-hidden border-l-2 border-l-amber-400 hover:shadow-md transition-all duration-200 ${className}`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10 border border-white shadow-sm">
              <AvatarImage src={request.profileImage} alt={therapistName} />
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-teal-500 text-white font-medium text-sm">
                {initials}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-semibold text-gray-900 truncate">
                  {therapistName}
                </h4>
                <Badge variant="secondary" className="bg-amber-100 text-amber-700 text-xs">
                  Pending
                </Badge>
              </div>
              
              <div className="flex items-center gap-3 text-xs text-gray-500">
                <span>{request.experience} yrs</span>
                <span>${request.hourlyRate}/hr</span>
                {request.province && <span className="truncate">{request.province}</span>}
              </div>
            </div>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleCancel}
            disabled={isCanceling}
            className="text-red-600 hover:bg-red-50 p-2"
          >
            {isCanceling ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <X className="h-4 w-4" />
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}