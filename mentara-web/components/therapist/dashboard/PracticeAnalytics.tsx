import { Card } from "@/components/ui/card";
import { TrendingUp, Users, DollarSign, Activity, Heart } from "lucide-react";
import { motion } from "framer-motion";

interface PracticeAnalyticsProps {
  patientStats?: {
    total: number;
    percentage: number;
    months: number;
    chartData: Array<{ month: string; value: number }>;
  };
  income?: {
    thisMonth: number;
    lastMonth: number;
    percentageChange: number;
  };
  performance?: {
    averageRating: number;
    sessionCompletionRate: number;
    responseTime: number;
  };
}

export default function PracticeAnalytics({ 
  patientStats, 
  income,
  performance 
}: PracticeAnalyticsProps) {
  const patientGrowth = patientStats?.percentage || 0;
  const incomeChange = income?.percentageChange || 0;
  const completionRate = performance?.sessionCompletionRate || 0;
  const averageRating = performance?.averageRating || 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      <Card className="shadow-sm hover:shadow-md transition-shadow overflow-hidden p-0">
        <div className="bg-gradient-to-br from-secondary/10 via-secondary/5 to-secondary/5 px-5 py-4 border-b border-border/50">
          <div className="flex items-center gap-2 text-lg font-semibold">
            <Activity className="h-5 w-5 text-secondary" />
            Practice Analytics
          </div>
        </div>
        <div className="p-5 space-y-5">
          {/* Patient Growth - Enhanced */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-gradient-to-br from-secondary/10 to-secondary/20 rounded-lg">
                  <Users className="h-4 w-4 text-secondary" />
                </div>
                <h3 className="text-sm font-semibold">Patient Growth</h3>
              </div>
              <span className="text-lg font-bold text-secondary">
                {patientStats?.total || 0}
              </span>
            </div>
            <div className="relative w-full h-3 bg-gray-100 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-secondary via-secondary/80 to-secondary rounded-full shadow-sm"
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(patientGrowth, 100)}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {patientGrowth >= 70
                ? "Excellent growth! Your practice is expanding! 🎉"
                : patientGrowth >= 40
                  ? "Steady growth - keep up the great work! 💪"
                  : "Building your practice - every patient matters! 🌱"}
            </p>
          </div>

          {/* Income Trend - Enhanced */}
          {income && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-gradient-to-br from-green-500/10 to-green-500/20 rounded-lg">
                    <DollarSign className="h-4 w-4 text-green-600" />
                  </div>
                  <h3 className="text-sm font-semibold">Monthly Income</h3>
                </div>
                <div className="text-right">
                  <span className="text-lg font-bold text-green-600">
                    ₱{income.thisMonth}K
                  </span>
                  <span className={`text-xs ml-2 ${incomeChange >= 0 ? "text-green-600" : "text-red-600"}`}>
                    {incomeChange >= 0 ? "+" : ""}{incomeChange}%
                  </span>
                </div>
              </div>
              <div className="relative w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-green-500 via-emerald-500 to-green-500 rounded-full shadow-sm"
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(Math.abs(incomeChange) + 50, 100)}%` }}
                  transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {incomeChange >= 10
                  ? "Outstanding earnings this month! 💰"
                  : incomeChange >= 0
                    ? "Steady income growth - well done! 📈"
                    : "Income down this month - focus on retention"}
              </p>
            </div>
          )}

          {/* Session Completion Rate */}
          {performance && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-gradient-to-br from-blue-500/10 to-blue-500/20 rounded-lg">
                    <Heart className="h-4 w-4 text-blue-600" />
                  </div>
                  <h3 className="text-sm font-semibold">Session Completion</h3>
                </div>
                <span className="text-lg font-bold text-blue-600">
                  {completionRate}%
                </span>
              </div>
              <div className="relative w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-blue-500 via-cyan-500 to-blue-500 rounded-full shadow-sm"
                  initial={{ width: 0 }}
                  animate={{ width: `${completionRate}%` }}
                  transition={{ duration: 1, delay: 0.4, ease: "easeOut" }}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {completionRate >= 90
                  ? "Excellent completion rate! Your patients are engaged! ✨"
                  : completionRate >= 70
                    ? "Good completion rate - keep encouraging attendance! 💪"
                    : "Focus on improving session attendance"}
              </p>
            </div>
          )}

          {/* Average Rating */}
          {performance && averageRating > 0 && (
            <div className="pt-4 border-t border-border/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-gradient-to-br from-yellow-500/10 to-yellow-500/20 rounded-lg">
                    <TrendingUp className="h-4 w-4 text-yellow-600" />
                  </div>
                  <h3 className="text-sm font-semibold">Average Rating</h3>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-2xl font-bold text-yellow-600">
                    {averageRating.toFixed(1)}
                  </span>
                  <span className="text-xs text-muted-foreground">/ 5.0</span>
                </div>
              </div>
              <div className="mt-2 flex gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.6 + i * 0.1 }}
                    className={`h-4 w-4 rounded ${
                      i < Math.round(averageRating)
                        ? "bg-yellow-500"
                        : "bg-gray-200"
                    }`}
                  />
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {averageRating >= 4.5
                  ? "Outstanding ratings! Your patients appreciate your care! ⭐"
                  : averageRating >= 4.0
                    ? "Great ratings - keep up the excellent work! 🌟"
                    : "Good ratings - continue improving your practice"}
              </p>
            </div>
          )}
        </div>
      </Card>
    </motion.div>
  );
}

