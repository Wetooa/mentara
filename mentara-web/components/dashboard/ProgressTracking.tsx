import { Card } from "@/components/ui/card";
import type { UserDashboardData } from "@/types/api/dashboard";
import { Smile, Frown, Meh, Heart, Activity, TrendingUp } from "lucide-react";
import { format, parseISO } from "date-fns";
import { motion } from "framer-motion";

interface ProgressTrackingProps {
  progress: UserDashboardData["progress"];
}

export default function ProgressTracking({ progress }: ProgressTrackingProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      <Card className="shadow-sm hover:shadow-md transition-shadow overflow-hidden p-0">
        <div className="bg-gradient-to-br from-pink-500/5 to-purple-500/5 px-5 py-4">
          <div className="flex items-center gap-2 text-lg font-semibold">
            <Activity className="h-5 w-5 text-pink-600" />
            Wellness Pulse
          </div>
        </div>
        <div className="p-5 space-y-5">
          {/* Treatment Progress - Enhanced */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-gradient-to-br from-primary/10 to-primary/20 rounded-lg">
                  <TrendingUp className="h-4 w-4 text-primary" />
                </div>
                <h3 className="text-sm font-semibold">Treatment Journey</h3>
              </div>
              <span className="text-lg font-bold text-primary">
                {progress.treatmentProgress}%
              </span>
            </div>
            <div className="relative w-full h-3 bg-gray-100 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-primary via-primary/80 to-primary rounded-full shadow-sm"
                initial={{ width: 0 }}
                animate={{ width: `${progress.treatmentProgress}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              You're making great progress! Keep it up! 🎉
            </p>
          </div>

          {/* Weekly Engagement - Enhanced */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-gradient-to-br from-blue-500/10 to-blue-500/20 rounded-lg">
                  <Heart className="h-4 w-4 text-blue-600" />
                </div>
                <h3 className="text-sm font-semibold">Weekly Activity</h3>
              </div>
              <span className="text-lg font-bold text-blue-600">
                {progress.weeklyEngagement}%
              </span>
            </div>
            <div className="relative w-full h-3 bg-gray-100 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-blue-500 via-cyan-500 to-blue-500 rounded-full shadow-sm"
                initial={{ width: 0 }}
                animate={{ width: `${progress.weeklyEngagement}%` }}
                transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {progress.weeklyEngagement >= 70 ? "Excellent engagement this week! 💪" : "Try to engage more this week!"}
            </p>
          </div>

          {/* Weekly Mood Chart - Beautifully redesigned */}
          <div>
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <span>Mood This Week</span>
              <span className="text-xs font-normal text-muted-foreground">
                (Last 7 days)
              </span>
            </h3>
            <div className="grid grid-cols-7 gap-1.5">
              {progress.weeklyMood.map((day, index) => {
                const moodIcon = getMoodIcon(day.value);
                const dayName = format(parseISO(day.date), "EEE");
                const isToday = index === progress.weeklyMood.length - 1;

                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex flex-col items-center"
                  >
                    <motion.div
                      whileHover={{ scale: 1.15, rotate: 5 }}
                      className={`w-10 h-10 flex items-center justify-center rounded-xl ${getMoodColor(day.value)} ${
                        isToday ? "ring-2 ring-primary ring-offset-2" : ""
                      } cursor-pointer transition-all`}
                    >
                      {moodIcon}
                    </motion.div>
                    <span className={`text-xs mt-1.5 ${isToday ? "font-semibold text-primary" : "text-muted-foreground"}`}>
                      {dayName}
                    </span>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Compact Mood Legend */}
          <div className="pt-4 border-t border-border/50">
            <div className="grid grid-cols-5 gap-2 text-center">
              {[
                { color: "bg-red-100", label: "Bad", value: 1 },
                { color: "bg-orange-100", label: "Poor", value: 2 },
                { color: "bg-yellow-100", label: "Okay", value: 3 },
                { color: "bg-blue-100", label: "Good", value: 4 },
                { color: "bg-green-100", label: "Great", value: 5 },
              ].map((item) => (
                <div key={item.value} className="flex flex-col items-center gap-1">
                  <div className={`w-4 h-4 rounded-md ${item.color}`}></div>
                  <span className="text-xs text-muted-foreground">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

// Helper function to get mood icon based on value (1-5)
function getMoodIcon(value: number) {
  switch (value) {
    case 1:
      return <Frown className="h-4 w-4 text-red-500" />;
    case 2:
      return <Frown className="h-4 w-4 text-orange-500" />;
    case 3:
      return <Meh className="h-4 w-4 text-yellow-500" />;
    case 4:
      return <Smile className="h-4 w-4 text-blue-500" />;
    case 5:
      return <Smile className="h-4 w-4 text-green-500" />;
    default:
      return <Meh className="h-4 w-4 text-gray-500" />;
  }
}

// Helper function to get mood background color
function getMoodColor(value: number) {
  switch (value) {
    case 1:
      return "bg-red-100";
    case 2:
      return "bg-orange-100";
    case 3:
      return "bg-yellow-100";
    case 4:
      return "bg-blue-100";
    case 5:
      return "bg-green-100";
    default:
      return "bg-gray-100";
  }
}
