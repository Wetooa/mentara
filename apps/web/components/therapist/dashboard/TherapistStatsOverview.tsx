import React, { memo } from "react";
import { Calendar, DollarSign, MessageSquare, TrendingUp, ArrowUpRight, Users } from "lucide-react";
import { motion } from "framer-motion";

interface TherapistStatsOverviewProps {
  stats: {
    activePatients: number;
    todayAppointments: number;
    weeklyIncome: number;
    pendingMessages: number;
    practiceGrowth?: number;
  };
  onPatientsClick?: () => void;
  onScheduleClick?: () => void;
  onMessagesClick?: () => void;
  onIncomeClick?: () => void;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 24,
    },
  },
};

function TherapistStatsOverview({ 
  stats, 
  onPatientsClick,
  onScheduleClick,
  onMessagesClick,
  onIncomeClick,
}: TherapistStatsOverviewProps) {
  return (
    <div className="space-y-4">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Today at a Glance</h2>
          <p className="text-sm text-muted-foreground">Your practice overview and activity</p>
        </div>
      </div>

      {/* Stats Grid - Asymmetric layout for visual interest */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-4"
      >
        {/* Hero Stat - Active Patients (Larger, more prominent) */}
        <motion.div
          variants={itemVariants}
          whileHover={{ scale: 1.02, y: -4 }}
          className="lg:col-span-5 cursor-pointer"
          onClick={onPatientsClick}
        >
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-secondary/10 via-secondary/5 to-secondary/5 border border-secondary/20 p-6 h-full shadow-sm hover:shadow-lg transition-all group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-secondary/20 to-transparent rounded-full blur-2xl" />
            
            <div className="relative">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-secondary/10 rounded-xl group-hover:bg-secondary/20 transition-colors">
                  <Users className="h-7 w-7 text-secondary" />
                </div>
                <div className="flex items-center gap-1 text-xs font-medium text-secondary bg-secondary/10 px-2.5 py-1 rounded-full">
                  <ArrowUpRight className="h-3 w-3" />
                  <span>Active</span>
                </div>
              </div>
              
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-muted-foreground">Active Patients</h3>
                <p className="text-4xl font-bold text-secondary">{stats.activePatients}</p>
                <p className="text-xs text-muted-foreground">currently in care</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Secondary Stats Grid */}
        <div className="lg:col-span-7 grid grid-cols-2 gap-4">
          {/* Today's Appointments */}
          <motion.div
            variants={itemVariants}
            whileHover={{ scale: 1.02, y: -4 }}
            className="cursor-pointer"
            onClick={onScheduleClick}
          >
            <div className="rounded-xl bg-gradient-to-br from-secondary/10 to-secondary/5 border border-secondary/20 p-5 hover:shadow-md transition-all group h-full">
              <div className="flex items-start justify-between mb-3">
                <div className="p-2.5 bg-secondary/10 rounded-lg group-hover:bg-secondary/20 transition-colors">
                  <Calendar className="h-5 w-5 text-secondary" />
                </div>
                <div className="flex items-center gap-1 text-xs text-secondary">
                  <ArrowUpRight className="h-3 w-3" />
                  <span>Today</span>
                </div>
              </div>
              <h3 className="text-xs font-medium text-muted-foreground mb-1">Appointments</h3>
              <p className="text-2xl font-bold text-secondary">{stats.todayAppointments}</p>
              <p className="text-xs text-muted-foreground mt-1">scheduled today</p>
            </div>
          </motion.div>

          {/* Weekly Income */}
          <motion.div
            variants={itemVariants}
            whileHover={{ scale: 1.02, y: -4 }}
            className="cursor-pointer"
            onClick={onIncomeClick}
          >
            <div className="rounded-xl bg-gradient-to-br from-secondary/10 to-secondary/5 border border-secondary/20 p-5 hover:shadow-md transition-all group h-full">
              <div className="flex items-start justify-between mb-3">
                <div className="p-2.5 bg-secondary/10 rounded-lg group-hover:bg-secondary/20 transition-colors">
                  <DollarSign className="h-5 w-5 text-secondary" />
                </div>
                <div className="flex items-center gap-1 text-xs text-secondary">
                  <ArrowUpRight className="h-3 w-3" />
                  <span>+{stats.practiceGrowth || 0}%</span>
                </div>
              </div>
              <h3 className="text-xs font-medium text-muted-foreground mb-1">This Week</h3>
              <p className="text-2xl font-bold text-secondary">₱{stats.weeklyIncome}K</p>
              <p className="text-xs text-muted-foreground mt-1">earnings</p>
            </div>
          </motion.div>

          {/* Pending Messages */}
          <motion.div
            variants={itemVariants}
            whileHover={{ scale: 1.02, y: -4 }}
            className="cursor-pointer"
            onClick={onMessagesClick}
          >
            <div className="rounded-xl bg-gradient-to-br from-secondary/10 to-secondary/5 border border-secondary/20 p-5 hover:shadow-md transition-all group h-full">
              <div className="flex items-start justify-between mb-3">
                <div className="p-2.5 bg-secondary/10 rounded-lg group-hover:bg-secondary/20 transition-colors">
                  <MessageSquare className="h-5 w-5 text-secondary" />
                </div>
                {stats.pendingMessages > 0 && (
                  <div className="flex items-center gap-1 text-xs bg-secondary/10 text-secondary px-2 py-0.5 rounded-full font-medium">
                    <span>{stats.pendingMessages} new</span>
                  </div>
                )}
              </div>
              <h3 className="text-xs font-medium text-muted-foreground mb-1">Messages</h3>
              <p className="text-2xl font-bold text-secondary">{stats.pendingMessages}</p>
              <p className="text-xs text-muted-foreground mt-1">awaiting reply</p>
            </div>
          </motion.div>

          {/* Practice Growth */}
          <motion.div
            variants={itemVariants}
            whileHover={{ scale: 1.02, y: -4 }}
            className="cursor-pointer"
            onClick={onPatientsClick}
          >
            <div className="rounded-xl bg-gradient-to-br from-secondary/10 to-secondary/5 border border-secondary/20 p-5 hover:shadow-md transition-all group h-full">
              <div className="flex items-start justify-between mb-3">
                <div className="p-2.5 bg-secondary/10 rounded-lg group-hover:bg-secondary/20 transition-colors">
                  <TrendingUp className="h-5 w-5 text-secondary" />
                </div>
                <div className="flex items-center gap-1">
                  <div className="h-2 w-2 rounded-full bg-secondary animate-pulse" />
                  <span className="text-xs text-secondary font-medium">Growing</span>
                </div>
              </div>
              <h3 className="text-xs font-medium text-muted-foreground mb-1">Practice</h3>
              <p className="text-2xl font-bold text-secondary">+{stats.practiceGrowth || 0}%</p>
              <p className="text-xs text-muted-foreground mt-1">this month</p>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}

// Memoize component to prevent unnecessary re-renders
export default memo(TherapistStatsOverview);

