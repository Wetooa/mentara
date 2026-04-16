import React, { memo } from "react";
import { Clock, Calendar, FileCheck, FileClock, Users, ArrowUpRight } from "lucide-react";
import type { UserDashboardData } from "@/types/api/dashboard";
import { motion } from "framer-motion";

interface StatsOverviewProps {
  stats: UserDashboardData["stats"];
  onUpcomingSessionsClick?: () => void;
  onPendingWorksheetsClick?: () => void;
  onCompletedSessionsClick?: () => void;
  onCompletedWorksheetsClick?: () => void;
  onTherapistsClick?: () => void;
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

function StatsOverview({ 
  stats, 
  onUpcomingSessionsClick,
  onPendingWorksheetsClick,
  onCompletedSessionsClick,
  onCompletedWorksheetsClick,
  onTherapistsClick 
}: StatsOverviewProps) {
  return (
    <div className="space-y-4">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Today at a Glance</h2>
          <p className="text-sm text-muted-foreground">Your progress and activity overview</p>
        </div>
      </div>

      {/* Stats Grid - Asymmetric layout for visual interest */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-4"
      >
        {/* Hero Stat - Upcoming Sessions (Larger, more prominent) */}
        <motion.div
          variants={itemVariants}
          whileHover={{ scale: 1.02, y: -4 }}
          className="lg:col-span-5 cursor-pointer"
          onClick={onUpcomingSessionsClick}
        >
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-primary/5 border border-primary/20 p-6 h-full shadow-sm hover:shadow-lg transition-all group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/20 to-transparent rounded-full blur-2xl" />
            
            <div className="relative">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-primary/10 rounded-xl group-hover:bg-primary/20 transition-colors">
                  <Clock className="h-7 w-7 text-primary" />
                </div>
                <div className="flex items-center gap-1 text-xs font-medium text-primary bg-primary/10 px-2.5 py-1 rounded-full">
                  <ArrowUpRight className="h-3 w-3" />
                  <span>Today</span>
                </div>
              </div>
              
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-muted-foreground">Upcoming Sessions</h3>
                <p className="text-4xl font-bold text-primary">{stats.upcomingSessions}</p>
                <p className="text-xs text-muted-foreground">scheduled this week</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Secondary Stats Grid */}
        <div className="lg:col-span-7 grid grid-cols-2 gap-4">
          {/* Completed Sessions */}
          <motion.div
            variants={itemVariants}
            whileHover={{ scale: 1.02, y: -4 }}
            className="cursor-pointer"
            onClick={onCompletedSessionsClick}
          >
            <div className="rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 p-5 hover:shadow-md transition-all group h-full">
              <div className="flex items-start justify-between mb-3">
                <div className="p-2.5 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                  <Calendar className="h-5 w-5 text-primary" />
                </div>
                <div className="flex items-center gap-1 text-xs text-primary">
                  <ArrowUpRight className="h-3 w-3" />
                  <span>+12%</span>
                </div>
              </div>
              <h3 className="text-xs font-medium text-muted-foreground mb-1">Completed</h3>
              <p className="text-2xl font-bold text-primary">{stats.completedSessions}</p>
              <p className="text-xs text-muted-foreground mt-1">sessions done</p>
            </div>
          </motion.div>

          {/* Completed Worksheets */}
          <motion.div
            variants={itemVariants}
            whileHover={{ scale: 1.02, y: -4 }}
            className="cursor-pointer"
            onClick={onCompletedWorksheetsClick}
          >
            <div className="rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 p-5 hover:shadow-md transition-all group h-full">
              <div className="flex items-start justify-between mb-3">
                <div className="p-2.5 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                  <FileCheck className="h-5 w-5 text-primary" />
                </div>
                <div className="flex items-center gap-1 text-xs text-primary">
                  <ArrowUpRight className="h-3 w-3" />
                  <span>+8%</span>
                </div>
              </div>
              <h3 className="text-xs font-medium text-muted-foreground mb-1">Worksheets</h3>
              <p className="text-2xl font-bold text-primary">{stats.completedWorksheets}</p>
              <p className="text-xs text-muted-foreground mt-1">completed</p>
            </div>
          </motion.div>

          {/* Pending Worksheets */}
          <motion.div
            variants={itemVariants}
            whileHover={{ scale: 1.02, y: -4 }}
            className="cursor-pointer"
            onClick={onPendingWorksheetsClick}
          >
            <div className="rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 p-5 hover:shadow-md transition-all group h-full">
              <div className="flex items-start justify-between mb-3">
                <div className="p-2.5 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                  <FileClock className="h-5 w-5 text-primary" />
                </div>
                {stats.pendingWorksheets > 0 && (
                  <div className="flex items-center gap-1 text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">
                    <span>2 new</span>
                  </div>
                )}
              </div>
              <h3 className="text-xs font-medium text-muted-foreground mb-1">Pending</h3>
              <p className="text-2xl font-bold text-primary">{stats.pendingWorksheets}</p>
              <p className="text-xs text-muted-foreground mt-1">to complete</p>
            </div>
          </motion.div>

          {/* Therapists Connected */}
          <motion.div
            variants={itemVariants}
            whileHover={{ scale: 1.02, y: -4 }}
            className="cursor-pointer"
            onClick={onTherapistsClick}
          >
            <div className="rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 p-5 hover:shadow-md transition-all group h-full">
              <div className="flex items-start justify-between mb-3">
                <div className="p-2.5 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <div className="flex items-center gap-1">
                  <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                  <span className="text-xs text-primary font-medium">Active</span>
                </div>
              </div>
              <h3 className="text-xs font-medium text-muted-foreground mb-1">Therapists</h3>
              <p className="text-2xl font-bold text-primary">{stats.therapistsConsulted}</p>
              <p className="text-xs text-muted-foreground mt-1">connected</p>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}

// Memoize component to prevent unnecessary re-renders
export default memo(StatsOverview);
