"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, Calendar, Star, Heart, Clock, Zap } from "lucide-react";
import { motion } from "framer-motion";

interface Therapist {
  id: string;
  userId: string;
  user: {
    id: string;
    firstName?: string;
    lastName?: string;
    imageUrl?: string;
  };
  specializations?: string[];
  hourlyRate?: number;
  status: string;
}

interface AssignedTherapistProps {
  assignedTherapists?: Therapist[];
  isLoading?: boolean;
  onMessageTherapist?: () => void;
  onScheduleSession?: () => void;
}

export default function AssignedTherapist({
  assignedTherapists = [],
  isLoading = false,
  onMessageTherapist,
  onScheduleSession,
}: AssignedTherapistProps) {
  // Get the primary therapist (first one if multiple)
  const therapist =
    assignedTherapists.length > 0 ? assignedTherapists[0] : null;

  // Mock data - in production would come from API
  const lastInteraction = "2 hours ago";
  const nextSession = "Tomorrow at 2:00 PM";
  const connectionStrength = 85; // out of 100
  const isOnline = true;

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Your Therapist
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-pulse space-y-2">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 bg-gray-200 rounded-full"></div>
                <div className="space-y-1">
                  <div className="h-4 w-24 bg-gray-200 rounded"></div>
                  <div className="h-3 w-32 bg-gray-200 rounded"></div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!therapist) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Your Therapist
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="text-muted-foreground mb-4">
              <MessageCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No therapist assigned yet</p>
            </div>
            <Button variant="outline" size="sm">
              Find a Therapist
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const firstName = therapist.user.firstName || "";
  const lastName = therapist.user.lastName || "";
  const fullName = `${firstName} ${lastName}`.trim() || "Therapist";
  const initials = `${firstName[0] || "T"}${lastName[0] || "H"}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="h-full"
    >
      <Card className="overflow-hidden shadow-sm hover:shadow-md transition-shadow p-0 h-full flex flex-col">
        <div className="bg-gradient-to-br from-primary/5 to-primary/10 px-5 py-4">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-lg font-semibold">
              <Heart className="h-5 w-5 text-primary" />
              Your Therapist
            </span>
            {isOnline && (
              <Badge
                variant="secondary"
                className="bg-green-100 text-green-700 border-green-200"
              >
                <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse mr-1.5" />
                Online
              </Badge>
            )}
          </div>
        </div>
        <CardContent className="p-5 flex-1">
          <div className="space-y-5">
            {/* Therapist Info with enhanced design */}
            <div className="flex items-start gap-4">
              <motion.div
                className="relative"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Avatar className="h-16 w-16 border-2 border-primary/20 shadow-md">
                  <AvatarImage src={therapist.user.imageUrl} alt={fullName} />
                  <AvatarFallback className="bg-gradient-to-br from-primary to-primary/70 text-white text-lg">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                {therapist.status === "approved" && (
                  <div className="absolute -bottom-1 -right-1 bg-blue-500 rounded-full p-1">
                    <Star className="h-3 w-3 text-white fill-white" />
                  </div>
                )}
              </motion.div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-bold text-base truncate">{fullName}</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-2">
                  Licensed Therapist
                </p>

                {/* Connection strength indicator */}
                <div className="flex items-center gap-2">
                  <div className="flex-1">
                    <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-gradient-to-r from-primary to-primary/70 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${connectionStrength}%` }}
                        transition={{ duration: 1, delay: 0.5 }}
                      />
                    </div>
                  </div>
                  <span className="text-xs font-medium text-primary">
                    {connectionStrength}%
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Connection strength
                </p>
              </div>
            </div>

            {/* Quick Info Cards */}
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-blue-50 rounded-lg p-3 border border-blue-100">
                <div className="flex items-center gap-2 mb-1">
                  <Clock className="h-3.5 w-3.5 text-blue-600" />
                  <span className="text-xs font-medium text-blue-900">
                    Last Chat
                  </span>
                </div>
                <p className="text-xs text-blue-700 font-semibold">
                  {lastInteraction}
                </p>
              </div>

              <div className="bg-purple-50 rounded-lg p-3 border border-purple-100">
                <div className="flex items-center gap-2 mb-1">
                  <Zap className="h-3.5 w-3.5 text-purple-600" />
                  <span className="text-xs font-medium text-purple-900">
                    Next Session
                  </span>
                </div>
                <p className="text-xs text-purple-700 font-semibold">
                  {nextSession}
                </p>
              </div>
            </div>

            {/* Specializations with better styling */}
            {therapist.specializations &&
              therapist.specializations.length > 0 && (
                <div>
                  <p className="text-xs font-semibold mb-2 text-muted-foreground">
                    Areas of Expertise
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {therapist.specializations
                      .slice(0, 3)
                      .map((spec, index) => (
                        <Badge
                          key={index}
                          variant="outline"
                          className="text-xs bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20 hover:from-primary/10 hover:to-primary/20 transition-all"
                        >
                          {spec}
                        </Badge>
                      ))}
                    {therapist.specializations.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{therapist.specializations.length - 3} more
                      </Badge>
                    )}
                  </div>
                </div>
              )}

            {/* Enhanced Actions */}
            <div className="flex gap-2 pt-2">
              <motion.div
                className="flex-1"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                <Button
                  size="sm"
                  className="w-full bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80 shadow-sm group"
                  onClick={onMessageTherapist}
                >
                  <MessageCircle className="h-4 w-4 mr-1.5 group-hover:scale-110 transition-transform" />
                  Message
                </Button>
              </motion.div>
              <motion.div
                className="flex-1"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full border-2 hover:border-primary/50 hover:bg-primary/5 group"
                  onClick={onScheduleSession}
                >
                  <Calendar className="h-4 w-4 mr-1.5 group-hover:scale-110 transition-transform" />
                  Book
                </Button>
              </motion.div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
