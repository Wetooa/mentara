"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, Calendar, Heart, Clock, Zap } from "lucide-react";
import { motion } from "framer-motion";
import { formatDistanceToNow, format, isToday, isTomorrow, parseISO } from "date-fns";
import { useMyTherapists } from "@/hooks/therapist/useMyTherapists";
import { useRecentCommunications } from "@/hooks/dashboard/useClientDashboard";
import { useUpcomingSessions } from "@/hooks/sessions/useSessions";
import { Skeleton } from "@/components/ui/skeleton";
import type { TherapistRecommendation } from "@/types/api/therapist";

interface AssignedTherapistProps {
  onMessageTherapist?: () => void;
  onScheduleSession?: () => void;
}

export default function AssignedTherapist({
  onMessageTherapist,
  onScheduleSession,
}: AssignedTherapistProps) {
  const router = useRouter();
  const { data: therapists, isLoading: isLoadingTherapists } = useMyTherapists();
  const { data: recentCommunications = [] } = useRecentCommunications();
  const { data: upcomingSessionsData, isLoading: isLoadingSessions } = useUpcomingSessions(20);
  const upcomingSessions = upcomingSessionsData?.meetings || [];

  // Map therapists with their last message and next session
  const therapistsWithData = useMemo(() => {
    if (!therapists || therapists.length === 0) return [];

    return therapists.map((therapist) => {
      // Find last message with this therapist
      // Check both direct ID match and participant match
      const conversation = recentCommunications.find((comm: any) => {
        // Direct ID match
        if (comm.id === therapist.id) return true;
        // Check if therapist is a participant
        if (comm.participants?.some((p: any) => p.userId === therapist.id)) return true;
        // Check if user field matches
        if (comm.user?.id === therapist.id) return true;
        return false;
      });
      
      // Extract timestamp from various possible structures
      const lastMessageTime = 
        conversation?.lastMessage?.timestamp || 
        conversation?.lastMessage?.createdAt ||
        conversation?.lastMessage?.time ||
        conversation?.timestamp ||
        conversation?.time ||
        conversation?.lastMessageAt ||
        conversation?.updatedAt;

      // Find next session with this therapist
      const nextSession = upcomingSessions.find(
        (session: any) => 
          session.therapistId === therapist.id ||
          session.therapist?.userId === therapist.id
      );

      return {
        therapist,
        lastMessageTime,
        nextSession,
      };
    });
  }, [therapists, recentCommunications, upcomingSessions]);

  // Format relative time for last chat
  const formatLastChat = (timestamp?: string): string => {
    if (!timestamp) return "No messages yet";
    
    try {
      const date = typeof timestamp === 'string' ? parseISO(timestamp) : new Date(timestamp);
      if (isNaN(date.getTime())) return "No messages yet";
      
      return formatDistanceToNow(date, { addSuffix: true });
    } catch {
      return "No messages yet";
    }
  };

  // Format next session time
  const formatNextSession = (session: any): string => {
    if (!session?.startTime && !session?.dateTime) return "No upcoming session";
    
    try {
      const dateStr = session.startTime || session.dateTime;
      const date = typeof dateStr === 'string' ? parseISO(dateStr) : new Date(dateStr);
      if (isNaN(date.getTime())) return "No upcoming session";

      if (isToday(date)) {
        return `Today at ${format(date, 'h:mm a')}`;
      } else if (isTomorrow(date)) {
        return `Tomorrow at ${format(date, 'h:mm a')}`;
      } else {
        return format(date, 'MMM d, h:mm a');
      }
    } catch {
      return "No upcoming session";
    }
  };

  const handleMessage = (therapistId: string) => {
    if (onMessageTherapist) {
      onMessageTherapist();
    } else {
      router.push(`/client/messages?contact=${encodeURIComponent(therapistId)}`);
    }
  };

  const handleSchedule = (therapistId: string) => {
    if (onScheduleSession) {
      onScheduleSession();
    } else {
      router.push(`/client/booking?therapist=${encodeURIComponent(therapistId)}`);
    }
  };

  const isLoading = isLoadingTherapists || isLoadingSessions;

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-primary" />
            Your Therapist{therapists && therapists.length > 1 ? "s" : ""}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!therapists || therapists.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-primary" />
            Your Therapist
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="text-muted-foreground mb-4">
              <MessageCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No therapist assigned yet</p>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => router.push("/client/therapists")}
            >
              Find a Therapist
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

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
              Your Therapist{therapists.length > 1 ? "s" : ""}
            </span>
            <Badge variant="secondary" className="text-xs">
              {therapists.length} active
            </Badge>
          </div>
        </div>
        <CardContent className="p-5 flex-1">
          <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
            {therapistsWithData.map(({ therapist, lastMessageTime, nextSession }, index) => {
              const firstName = therapist.firstName || "";
              const lastName = therapist.lastName || "";
              const fullName = `${firstName} ${lastName}`.trim() || "Therapist";
              const initials = `${firstName[0] || "T"}${lastName[0] || "H"}`;

              return (
                <motion.div
                  key={therapist.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="pb-4 border-b last:border-b-0 last:pb-0"
                >
                  <div className="space-y-4">
                    {/* Therapist Info */}
                    <div className="flex items-start gap-4">
                      <motion.div
                        className="relative"
                        whileHover={{ scale: 1.05 }}
                        transition={{ type: "spring", stiffness: 300 }}
                      >
                        <Avatar className="h-16 w-16 border-2 border-primary/20 shadow-md">
                          <AvatarImage src={therapist.profileImage} alt={fullName} />
                          <AvatarFallback className="bg-gradient-to-br from-primary to-primary/70 text-white text-lg">
                            {initials}
                          </AvatarFallback>
                        </Avatar>
                      </motion.div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-bold text-base truncate">{fullName}</h3>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">
                          {therapist.title || "Licensed Therapist"}
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
                          {formatLastChat(lastMessageTime)}
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
                          {formatNextSession(nextSession)}
                        </p>
                      </div>
                    </div>

                    {/* Specializations */}
                    {therapist.specialties && therapist.specialties.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold mb-2 text-muted-foreground">
                          Areas of Expertise
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {therapist.specialties
                            .slice(0, 3)
                            .map((spec, idx) => (
                              <Badge
                                key={idx}
                                variant="outline"
                                className="text-xs bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20 hover:from-primary/10 hover:to-primary/20 transition-all"
                              >
                                {spec}
                              </Badge>
                            ))}
                          {therapist.specialties.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{therapist.specialties.length - 3} more
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2 pt-2">
                      <motion.div
                        className="flex-1"
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                      >
                        <Button
                          size="sm"
                          className="w-full bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80 shadow-sm group"
                          onClick={() => handleMessage(therapist.id)}
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
                          onClick={() => handleSchedule(therapist.id)}
                        >
                          <Calendar className="h-4 w-4 mr-1.5 group-hover:scale-110 transition-transform" />
                          Book
                        </Button>
                      </motion.div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
