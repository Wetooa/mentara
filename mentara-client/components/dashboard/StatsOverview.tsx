import { Card, CardContent } from "@/components/ui/card";
import { Clock, Calendar, FileCheck, FileClock, Users, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";
import type { UserDashboardData } from "@/types/api/dashboard";

interface StatsOverviewProps {
  stats: UserDashboardData["stats"];
  onUpcomingSessionsClick?: () => void;
  onPendingWorksheetsClick?: () => void;
  onCompletedSessionsClick?: () => void;
  onCompletedWorksheetsClick?: () => void;
  onTherapistsClick?: () => void;
}

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0, scale: 0.95 },
  visible: {
    y: 0,
    opacity: 1,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 24
    }
  }
};

const iconVariants = {
  hover: {
    scale: 1.1,
    rotate: 5,
    transition: { duration: 0.2 }
  }
};

export default function StatsOverview({ 
  stats, 
  onUpcomingSessionsClick,
  onPendingWorksheetsClick,
  onCompletedSessionsClick,
  onCompletedWorksheetsClick,
  onTherapistsClick 
}: StatsOverviewProps) {
  const statItems = [
    {
      title: "Completed Sessions",
      value: stats.completedSessions,
      icon: <Calendar className="h-5 w-5" />,
      bgColor: "bg-primary/10",
      iconColor: "text-primary",
      accentColor: "bg-primary",
      trend: "+12%",
      onClick: onCompletedSessionsClick,
      clickable: !!onCompletedSessionsClick,
    },
    {
      title: "Upcoming Sessions",
      value: stats.upcomingSessions,
      icon: <Clock className="h-5 w-5" />,
      bgColor: "bg-secondary/10", 
      iconColor: "text-secondary",
      accentColor: "bg-secondary",
      trend: "+3",
      onClick: onUpcomingSessionsClick,
      clickable: !!onUpcomingSessionsClick,
    },
    {
      title: "Completed Worksheets",
      value: stats.completedWorksheets,
      icon: <FileCheck className="h-5 w-5" />,
      bgColor: "bg-tertiary/20",
      iconColor: "text-primary",
      accentColor: "bg-primary",
      trend: "+8%",
      onClick: onCompletedWorksheetsClick,
      clickable: !!onCompletedWorksheetsClick,
    },
    {
      title: "Pending Worksheets",
      value: stats.pendingWorksheets,
      icon: <FileClock className="h-5 w-5" />,
      bgColor: "bg-muted",
      iconColor: "text-muted-foreground",
      accentColor: "bg-muted-foreground",
      trend: "2 new",
      onClick: onPendingWorksheetsClick,
      clickable: !!onPendingWorksheetsClick,
    },
    {
      title: "Therapists Connected",
      value: stats.therapistsConsulted,
      icon: <Users className="h-5 w-5" />,
      bgColor: "bg-primary/5",
      iconColor: "text-primary",
      accentColor: "bg-primary",
      trend: "Active",
      onClick: onTherapistsClick,
      clickable: !!onTherapistsClick,
    },
  ];

  return (
    <motion.div 
      className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {statItems.map((stat, index) => (
        <motion.div
          key={index}
          variants={itemVariants}
          whileHover={{ y: -8, scale: 1.02, transition: { duration: 0.3 } }}
          whileTap={{ scale: 0.98 }}
          onClick={stat.clickable ? stat.onClick : undefined}
        >
          <Card className={`relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-card/50 backdrop-blur-sm group ${
            stat.clickable 
              ? 'cursor-pointer hover:ring-2 hover:ring-primary/20' 
              : 'cursor-default'
          }`}>
            {/* Accent line */}
            <div className={`absolute top-0 left-0 right-0 h-1 ${stat.accentColor}`} />
            
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <motion.div 
                  className={`rounded-xl ${stat.bgColor} p-3 ${stat.iconColor} group-hover:scale-110 transition-transform duration-300`}
                  variants={iconVariants}
                  whileHover="hover"
                >
                  {stat.icon}
                </motion.div>
                <span className="text-xs font-medium px-2 py-1 rounded-full bg-primary/10 text-primary">
                  {stat.trend}
                </span>
              </div>
              
              <div className="space-y-2">
                <motion.div 
                  className="text-2xl sm:text-3xl font-bold tracking-tight"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.2 + index * 0.1, type: "spring", stiffness: 400 }}
                >
                  {stat.value}
                </motion.div>
                <p className="text-sm text-muted-foreground font-medium leading-tight">
                  {stat.title}
                </p>
              </div>

              {/* Subtle gradient overlay on hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </motion.div>
  );
}
