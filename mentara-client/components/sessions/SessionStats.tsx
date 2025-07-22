import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { 
  Calendar, 
  CheckCircle, 
  Clock, 
  XCircle, 
  Play, 
  RefreshCw, 
  AlertCircle,
  TrendingUp 
} from "lucide-react";
import { motion } from "framer-motion";
import { useSessionStats } from "@/hooks/sessions";

interface SessionStatsProps {
  showTrends?: boolean;
  variant?: 'default' | 'compact';
}

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

export function SessionStats({ showTrends = false, variant = 'default' }: SessionStatsProps) {
  const { 
    data: stats, 
    isLoading, 
    error, 
    refetch, 
    isRefetching 
  } = useSessionStats();

  const handleRetry = () => {
    refetch();
  };

  // Loading state
  if (isLoading) {
    return (
      <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 ${variant === 'compact' ? 'mb-4' : 'mb-6'}`}>
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className={variant === 'compact' ? "h-16" : "h-24"} />
        ))}
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <Alert className="mb-6 border-red-200">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription className="flex items-center justify-between">
          <span>Failed to load session statistics</span>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRetry}
            disabled={isRefetching}
            className="ml-4"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefetching ? 'animate-spin' : ''}`} />
            Retry
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  if (!stats) {
    return null;
  }

  const statItems = [
    {
      title: "Upcoming Sessions",
      value: stats.upcoming,
      icon: <Calendar className="h-5 w-5" />,
      bgColor: "bg-blue-500/10",
      iconColor: "text-blue-600",
      accentColor: "bg-blue-500",
      trend: stats.upcoming > 0 ? `${stats.upcoming} scheduled` : "None scheduled",
      description: "Sessions scheduled for the future",
    },
    {
      title: "Completed Sessions",
      value: stats.completed,
      icon: <CheckCircle className="h-5 w-5" />,
      bgColor: "bg-green-500/10",
      iconColor: "text-green-600",
      accentColor: "bg-green-500",
      trend: stats.completed > 0 ? "Great progress!" : "Get started",
      description: "Successfully completed sessions",
    },
    {
      title: "In Progress",
      value: stats.inProgress,
      icon: <Play className="h-5 w-5" />,
      bgColor: "bg-purple-500/10",
      iconColor: "text-purple-600",
      accentColor: "bg-purple-500",
      trend: stats.inProgress > 0 ? "Active now" : "None active",
      description: "Currently ongoing sessions",
    },
    {
      title: "Cancelled Sessions",
      value: stats.cancelled,
      icon: <XCircle className="h-5 w-5" />,
      bgColor: "bg-red-500/10",
      iconColor: "text-red-600",
      accentColor: "bg-red-500",
      trend: stats.cancelled === 0 ? "Perfect record" : `${stats.cancelled} cancelled`,
      description: "Sessions that were cancelled",
    },
  ];

  if (variant === 'compact') {
    return (
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4"
      >
        {statItems.map((stat, index) => (
          <motion.div key={index} variants={itemVariants}>
            <Card className="border-0 shadow-sm bg-card/50 backdrop-blur-sm">
              <CardContent className="p-3">
                <div className="flex items-center gap-3">
                  <motion.div 
                    className={`rounded-lg ${stat.bgColor} p-2 ${stat.iconColor}`}
                    variants={iconVariants}
                    whileHover="hover"
                  >
                    {stat.icon}
                  </motion.div>
                  <div className="min-w-0 flex-1">
                    <div className="text-2xl font-bold tracking-tight">
                      {stat.value}
                    </div>
                    <p className="text-xs text-muted-foreground truncate">
                      {stat.title}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6"
    >
      {statItems.map((stat, index) => (
        <motion.div
          key={index}
          variants={itemVariants}
          whileHover={{ y: -4, scale: 1.02, transition: { duration: 0.2 } }}
          className="group"
        >
          <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-card/50 backdrop-blur-sm">
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
                {showTrends && (
                  <span className="text-xs font-medium px-2 py-1 rounded-full bg-primary/10 text-primary flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" />
                    {stat.trend}
                  </span>
                )}
              </div>
              
              <div className="space-y-2">
                <motion.div 
                  className="text-3xl font-bold tracking-tight"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.2 + index * 0.1, type: "spring", stiffness: 400 }}
                >
                  {stat.value}
                </motion.div>
                <p className="text-sm font-medium leading-tight">
                  {stat.title}
                </p>
                <p className="text-xs text-muted-foreground">
                  {stat.description}
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