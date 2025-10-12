"use client";

import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import type { UserDashboardData } from "@/types/api/dashboard";
import ProfileSettings from "./ProfileSettings";
import { 
  Calendar, 
  MessageSquare, 
  Sparkles, 
  Sun, 
  Moon, 
  Cloud,
  TrendingUp,
  Flame
} from "lucide-react";
import { motion } from "framer-motion";

interface DashboardHeaderProps {
  user: UserDashboardData["user"];
  onBookSession?: () => void;
}

export default function DashboardHeader({
  user,
  onBookSession,
}: DashboardHeaderProps) {
  const [isProfileSettingsOpen, setIsProfileSettingsOpen] = useState(false);

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
    gradientFrom = "from-blue-500/20";
    gradientVia = "via-cyan-500/10";
    gradientTo = "to-sky-500/20";
    emoji = "🌤️";
  } else if (currentHour >= 18) {
    greeting = "Good evening";
    timeIcon = <Moon className="h-5 w-5" />;
    gradientFrom = "from-indigo-500/20";
    gradientVia = "via-purple-500/10";
    gradientTo = "to-violet-500/20";
    emoji = "🌙";
  }

  // Mock data - in production, these would come from props or API
  const userStreak = 7; // days
  const wellnessScore = 78; // out of 100
  const motivationalQuotes = [
    "Every step forward is progress 💪",
    "You're doing amazing! Keep going ✨",
    "Your mental health journey matters 🌱",
    "Small steps lead to big changes 🚀",
    "You're stronger than you think 💙"
  ];
  const todaysQuote = motivationalQuotes[new Date().getDay() % motivationalQuotes.length];

  const handleBookSession = () => {
    onBookSession?.();
  };

  const handleViewProfile = () => {
    setIsProfileSettingsOpen(true);
  };

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
          {/* Left Section - User Info */}
          <div className="flex items-start gap-4 flex-1">
            <motion.div
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Avatar className="h-20 w-20 border-4 border-background shadow-xl ring-2 ring-primary/20">
                <AvatarImage src={user.avatar} />
                <AvatarFallback className="text-2xl bg-gradient-to-br from-primary to-primary/70 text-white">
                  {user.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
            </motion.div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                {timeIcon}
                <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
                  {greeting}, {user.name.split(' ')[0]}
                </h1>
              </div>
              
              <p className="text-muted-foreground text-base mb-3">
                {todaysQuote}
              </p>

              {/* Quick Stats Badges */}
              <div className="flex flex-wrap gap-2 mt-3">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="cursor-pointer"
                >
                  <Badge 
                    variant="secondary" 
                    className="px-3 py-1.5 bg-gradient-to-r from-orange-500/10 to-red-500/10 border-orange-200 hover:from-orange-500/20 hover:to-red-500/20 transition-all"
                  >
                    <Flame className="h-3.5 w-3.5 mr-1 text-orange-500" />
                    <span className="font-semibold text-orange-700">{userStreak} day streak</span>
                  </Badge>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="cursor-pointer"
                >
                  <Badge 
                    variant="secondary" 
                    className="px-3 py-1.5 bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-green-200 hover:from-green-500/20 hover:to-emerald-500/20 transition-all"
                  >
                    <TrendingUp className="h-3.5 w-3.5 mr-1 text-green-600" />
                    <span className="font-semibold text-green-700">{wellnessScore}% wellness</span>
                  </Badge>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="cursor-pointer"
                >
                  <Badge 
                    variant="secondary" 
                    className="px-3 py-1.5 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-purple-200 hover:from-purple-500/20 hover:to-pink-500/20 transition-all"
                  >
                    <Sparkles className="h-3.5 w-3.5 mr-1 text-purple-600" />
                    <span className="font-semibold text-purple-700">Active member</span>
                  </Badge>
                </motion.div>
              </div>
            </div>
          </div>

          {/* Right Section - Actions */}
          <div className="flex flex-col sm:flex-row gap-3 lg:flex-col lg:w-auto">
            <motion.button
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleBookSession}
              className="px-6 py-3.5 bg-gradient-to-r from-primary to-primary/90 text-white rounded-xl hover:from-primary/90 hover:to-primary/80 transition-all shadow-lg hover:shadow-xl font-semibold flex items-center justify-center gap-2 group"
            >
              <Calendar className="h-5 w-5 group-hover:rotate-12 transition-transform" />
              Book Session
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleViewProfile}
              className="px-6 py-3.5 bg-background/80 backdrop-blur-sm border-2 border-border hover:border-primary/50 text-foreground rounded-xl hover:bg-background transition-all font-semibold flex items-center justify-center gap-2 group shadow-sm"
            >
              <MessageSquare className="h-5 w-5 group-hover:rotate-12 transition-transform" />
              View Profile
            </motion.button>
          </div>
        </div>
      </div>

      <ProfileSettings
        user={user}
        isOpen={isProfileSettingsOpen}
        onClose={() => setIsProfileSettingsOpen(false)}
      />
    </motion.div>
  );
}
