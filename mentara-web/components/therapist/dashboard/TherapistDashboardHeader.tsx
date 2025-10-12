"use client";

import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Calendar, 
  MessageSquare, 
  Users,
  Sun, 
  Moon, 
  Cloud,
  TrendingUp,
  Briefcase
} from "lucide-react";
import { motion } from "framer-motion";
import { getInitials } from "@/lib/utils/common";

interface TherapistDashboardHeaderProps {
  therapist: {
    firstName: string;
    lastName: string;
    avatarUrl?: string;
    specializations?: string[];
  };
  onViewSchedule?: () => void;
}

export default function TherapistDashboardHeader({
  therapist,
  onViewSchedule,
}: TherapistDashboardHeaderProps) {
  // Get current time to display appropriate greeting and theme
  const currentHour = new Date().getHours();
  let greeting = "Good morning";
  let timeIcon = <Sun className="h-5 w-5" />;
  let gradientFrom = "from-amber-500/20";
  let gradientVia = "via-orange-500/10";
  let gradientTo = "to-yellow-500/20";
  let emoji = "☀️";

  if (currentHour >= 12 && currentHour < 18) {
    greeting = "Good afternoon";
    timeIcon = <Cloud className="h-5 w-5" />;
    gradientFrom = "from-secondary/20";
    gradientVia = "via-secondary/10";
    gradientTo = "to-secondary/5";
    emoji = "🌤️";
  } else if (currentHour >= 18) {
    greeting = "Good evening";
    timeIcon = <Moon className="h-5 w-5" />;
    gradientFrom = "from-gray-700/20";
    gradientVia = "via-gray-600/10";
    gradientTo = "to-gray-500/20";
    emoji = "🌙";
  }

  const therapistName = `Dr. ${therapist.firstName} ${therapist.lastName}`;
  const initials = getInitials(therapist.firstName, therapist.lastName);

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${gradientFrom} ${gradientVia} ${gradientTo} border border-secondary/20 shadow-lg`}
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      
      <div className="relative p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          {/* User Info Section */}
          <div className="flex items-start gap-4 sm:gap-6">
            {/* Avatar with Ring */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              <div className="relative">
                <Avatar className="h-20 w-20 sm:h-24 sm:w-24 border-4 border-white shadow-xl ring-2 ring-secondary/20">
                  <AvatarImage src={therapist.avatarUrl} className="object-cover" />
                  <AvatarFallback className="bg-gradient-to-br from-secondary to-secondary/80 text-secondary-foreground text-2xl font-bold">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                {/* Professional Badge */}
                <div className="absolute -bottom-2 -right-2">
                  <Badge className="bg-green-500 text-white border-2 border-white shadow-md">
                    <div className="w-2 h-2 bg-white rounded-full mr-1.5 animate-pulse"></div>
                    Active
                  </Badge>
                </div>
              </div>
            </motion.div>

            {/* Greeting and Info */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">{emoji}</span>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                  {greeting}, {therapist.firstName}!
                </h1>
              </div>
              
              <p className="text-gray-600 text-base mb-3">
                Welcome to your practice dashboard
              </p>

              {/* Specializations */}
              {therapist.specializations && therapist.specializations.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {therapist.specializations.slice(0, 3).map((spec, idx) => (
                    <Badge 
                      key={idx} 
                      variant="secondary" 
                      className="bg-secondary/10 text-secondary border-secondary/30 text-xs"
                    >
                      {spec}
                    </Badge>
                  ))}
                  {therapist.specializations.length > 3 && (
                    <Badge variant="secondary" className="bg-gray-100 text-gray-600 text-xs">
                      +{therapist.specializations.length - 3} more
                    </Badge>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-col gap-3 sm:items-end">
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button 
                size="lg" 
                onClick={onViewSchedule}
                className="w-full sm:w-auto bg-secondary hover:bg-secondary/90 shadow-md hover:shadow-lg transition-all"
              >
                <Calendar className="h-4 w-4 mr-2" />
                View Schedule
              </Button>
            </motion.div>

            {/* Practice Stats Summary */}
            <div className="flex gap-4 sm:gap-6 text-sm">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-secondary/10 rounded-lg">
                  <Users className="h-4 w-4 text-secondary" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Practice</p>
                  <p className="font-semibold text-gray-900">Growing</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="p-2 bg-secondary/10 rounded-lg">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Today</p>
                  <p className="font-semibold text-gray-900">On Track</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

