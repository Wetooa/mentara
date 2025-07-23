import React from "react";
import { Clock, Trash, DollarSign, UserPlus, TrendingUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";

interface DashboardStatsProps {
  stats: {
    activePatients: number;
    rescheduled: number;
    cancelled: number;
    income: number;
    patientStats: {
      total: number;
      percentage: number;
      months: number;
      chartData: Array<{ month: string; value: number }>;
    };
  };
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

export default function DashboardStats({ stats }: DashboardStatsProps) {
  const statItems = [
    {
      title: "Active Patients",
      value: stats.activePatients,
      icon: <UserPlus className="h-5 w-5" />,
      bgColor: "bg-blue-500/10",
      iconColor: "text-blue-600",
      accentColor: "bg-blue-500",
      trend: "+2 new",
    },
    {
      title: "Rescheduled",
      value: stats.rescheduled,
      icon: <Clock className="h-5 w-5" />,
      bgColor: "bg-amber-500/10",
      iconColor: "text-amber-600",
      accentColor: "bg-amber-500",
      trend: "This week",
    },
    {
      title: "Cancelled",
      value: stats.cancelled,
      icon: <Trash className="h-5 w-5" />,
      bgColor: "bg-red-500/10",
      iconColor: "text-red-600",
      accentColor: "bg-red-500",
      trend: "Today",
    },
    {
      title: "Today's Income",
      value: stats.income,
      icon: <DollarSign className="h-5 w-5" />,
      bgColor: "bg-emerald-500/10",
      iconColor: "text-emerald-600",
      accentColor: "bg-emerald-500",
      trend: "+12%",
      prefix: "₱",
      suffix: "K",
    },
  ];

  return (
    <motion.div 
      className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4"
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
        >
          <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-card/50 backdrop-blur-sm group">
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
                  {stat.prefix}{stat.value}{stat.suffix}
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
