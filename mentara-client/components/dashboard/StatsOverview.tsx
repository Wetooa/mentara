import { Card, CardContent } from "@/components/ui/card";
import { Clock, Calendar, FileCheck, FileClock, Users } from "lucide-react";
import { motion } from "framer-motion";
import type { UserDashboardData } from "@/lib/api/types/dashboard";

interface StatsOverviewProps {
  stats: UserDashboardData["stats"];
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

export default function StatsOverview({ stats }: StatsOverviewProps) {
  const statItems = [
    {
      title: "Completed Sessions",
      value: stats.completedSessions,
      icon: <Calendar className="h-5 w-5 text-blue-500" />,
      color: "bg-blue-50",
    },
    {
      title: "Upcoming Sessions",
      value: stats.upcomingSessions,
      icon: <Clock className="h-5 w-5 text-amber-500" />,
      color: "bg-amber-50",
    },
    {
      title: "Completed Worksheets",
      value: stats.completedWorksheets,
      icon: <FileCheck className="h-5 w-5 text-green-500" />,
      color: "bg-green-50",
    },
    {
      title: "Pending Worksheets",
      value: stats.pendingWorksheets,
      icon: <FileClock className="h-5 w-5 text-red-500" />,
      color: "bg-red-50",
    },
    {
      title: "Therapists Consulted",
      value: stats.therapistsConsulted,
      icon: <Users className="h-5 w-5 text-purple-500" />,
      color: "bg-purple-50",
    },
  ];

  return (
    <motion.div 
      className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {statItems.map((stat, index) => (
        <motion.div
          key={index}
          variants={itemVariants}
          whileHover={{ y: -4, transition: { duration: 0.2 } }}
        >
          <Card className="shadow-sm hover:shadow-md transition-shadow duration-200">
            <CardContent className="p-3 sm:p-4 md:p-6 flex flex-col items-center text-center">
              <motion.div 
                className={`rounded-full ${stat.color} p-2 sm:p-3 mb-2 sm:mb-3`}
                variants={iconVariants}
                whileHover="hover"
              >
                {stat.icon}
              </motion.div>
              <motion.h3 
                className="text-xl sm:text-2xl md:text-3xl font-bold"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3 + index * 0.1, type: "spring", stiffness: 300 }}
              >
                {stat.value}
              </motion.h3>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1 leading-tight">{stat.title}</p>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </motion.div>
  );
}
