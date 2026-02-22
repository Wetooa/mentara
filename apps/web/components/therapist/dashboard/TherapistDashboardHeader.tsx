"use client";

import { useState, memo, useMemo, useCallback } from "react";
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
  Briefcase,
  Heart,
  Sparkles
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
  stats?: {
    activePatients?: number;
    todayAppointments?: number;
    practiceGrowth?: number;
  };
}

function TherapistDashboardHeader({
  therapist,
  onViewSchedule,
  stats,
}: TherapistDashboardHeaderProps) {
  // Memoize greeting and theme based on current hour
  const { greeting, timeIcon, gradientFrom, gradientVia, gradientTo, emoji } = useMemo(() => {
    const currentHour = new Date().getHours();
    if (currentHour >= 12 && currentHour < 18) {
      return {
        greeting: "Good afternoon",
        timeIcon: <Cloud className="h-5 w-5" />,
        gradientFrom: "from-secondary/20",
        gradientVia: "via-secondary/10",
        gradientTo: "to-secondary/5",
        emoji: "🌤️"
      };
    } else if (currentHour >= 18) {
      return {
        greeting: "Good evening",
        timeIcon: <Moon className="h-5 w-5" />,
        gradientFrom: "from-secondary/30",
        gradientVia: "via-secondary/15",
        gradientTo: "to-secondary/5",
        emoji: "🌙"
      };
    }
    return {
      greeting: "Good morning",
      timeIcon: <Sun className="h-5 w-5" />,
      gradientFrom: "from-secondary/20",
      gradientVia: "via-secondary/10",
      gradientTo: "to-secondary/5",
      emoji: "☀️"
    };
  }, []);

  // Memoize today's inspirational quote for therapists
  const todaysQuote = useMemo(() => {
    const inspirationalQuotes = [
      "Making a difference, one session at a time 💙",
      "Your expertise transforms lives every day ✨",
      "Empowering others through compassionate care 🌱",
      "Every conversation is a step toward healing 🚀",
      "Your dedication creates lasting positive change 💪"
    ];
    return inspirationalQuotes[new Date().getDay() % inspirationalQuotes.length];
  }, []);

  const therapistName = `${therapist.firstName} ${therapist.lastName}`;
  const initials = getInitials(therapist.firstName, therapist.lastName);

  // Memoize callbacks
  const handleViewSchedule = useCallback(() => {
    onViewSchedule?.();
  }, [onViewSchedule]);

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${gradientFrom} ${gradientVia} ${gradientTo} border border-border/50 shadow-lg`}
    >
      {/* Decorative background pattern */}
      <div className="absolute inset-0 opacity-[0.03]">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 20px 20px, currentColor 1px, transparent 1px)`,
          backgroundSize: '40px 40px'
        }} />
      </div>

      {/* Floating decoration elements */}
      <motion.div
        className="absolute top-4 right-4 text-6xl opacity-10"
        animate={{ 
          rotate: [0, 10, 0],
          scale: [1, 1.1, 1]
        }}
        transition={{ 
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        {emoji}
      </motion.div>

      <div className="relative p-6 md:p-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Left Section - Therapist Info */}
          <div className="flex items-start gap-4 flex-1">
            <motion.div
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="relative">
                <Avatar className="h-20 w-20 border-4 border-background shadow-xl ring-2 ring-secondary/20">
                  <AvatarImage src={therapist.avatarUrl} loading="lazy" />
                  <AvatarFallback className="text-2xl bg-gradient-to-br from-secondary to-secondary/70 text-secondary-foreground">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                {/* Professional Badge */}
                <div className="absolute -bottom-2 -right-2">
                  <Badge className="bg-green-500 text-white border-2 border-background shadow-md">
                    <div className="w-2 h-2 bg-white rounded-full mr-1.5 animate-pulse"></div>
                    Active
                  </Badge>
                </div>
              </div>
            </motion.div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                {timeIcon}
                <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
                  {greeting}, {therapist.firstName}
                </h1>
              </div>
              
              <p className="text-muted-foreground text-base mb-3">
                {todaysQuote}
              </p>

              {/* Quick Stats Badges */}
              <div className="flex flex-wrap gap-2 mt-3">
                {stats?.activePatients !== undefined && (
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="cursor-pointer"
                  >
                    <Badge 
                      variant="secondary" 
                      className="px-3 py-1.5 bg-gradient-to-r from-secondary/10 to-secondary/5 border-secondary/30 hover:from-secondary/20 hover:to-secondary/10 transition-all"
                    >
                      <Users className="h-3.5 w-3.5 mr-1 text-secondary" />
                      <span className="font-semibold text-secondary">{stats.activePatients} active patients</span>
                    </Badge>
                  </motion.div>
                )}

                {stats?.todayAppointments !== undefined && (
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="cursor-pointer"
                  >
                    <Badge 
                      variant="secondary" 
                      className="px-3 py-1.5 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border-blue-200 hover:from-blue-500/20 hover:to-cyan-500/20 transition-all"
                    >
                      <Calendar className="h-3.5 w-3.5 mr-1 text-blue-600" />
                      <span className="font-semibold text-blue-700">{stats.todayAppointments} today</span>
                    </Badge>
                  </motion.div>
                )}

                {stats?.practiceGrowth !== undefined && (
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="cursor-pointer"
                  >
                    <Badge 
                      variant="secondary" 
                      className="px-3 py-1.5 bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-green-200 hover:from-green-500/20 hover:to-emerald-500/20 transition-all"
                    >
                      <TrendingUp className="h-3.5 w-3.5 mr-1 text-green-600" />
                      <span className="font-semibold text-green-700">+{stats.practiceGrowth}% growth</span>
                    </Badge>
                  </motion.div>
                )}

                {therapist.specializations && therapist.specializations.length > 0 && (
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="cursor-pointer"
                  >
                    <Badge 
                      variant="secondary" 
                      className="px-3 py-1.5 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-purple-200 hover:from-purple-500/20 hover:to-pink-500/20 transition-all"
                    >
                      <Sparkles className="h-3.5 w-3.5 mr-1 text-purple-600" />
                      <span className="font-semibold text-purple-700">{therapist.specializations.length} specializations</span>
                    </Badge>
                  </motion.div>
                )}
              </div>
            </div>
          </div>

          {/* Right Section - Actions */}
          <div className="flex flex-col sm:flex-row gap-3 lg:flex-col lg:w-auto">
            <motion.button
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleViewSchedule}
              className="px-6 py-3.5 bg-gradient-to-r from-secondary to-secondary/90 text-secondary-foreground rounded-xl hover:from-secondary/90 hover:to-secondary/80 transition-all shadow-lg hover:shadow-xl font-semibold flex items-center justify-center gap-2 group"
            >
              <Calendar className="h-5 w-5 group-hover:rotate-12 transition-transform" />
              View Schedule
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.98 }}
              className="px-6 py-3.5 bg-background/80 backdrop-blur-sm border-2 border-border hover:border-secondary/50 text-foreground rounded-xl hover:bg-background transition-all font-semibold flex items-center justify-center gap-2 group shadow-sm"
            >
              <MessageSquare className="h-5 w-5 group-hover:rotate-12 transition-transform" />
              Messages
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// Memoize component to prevent unnecessary re-renders
export default memo(TherapistDashboardHeader);

