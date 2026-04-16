"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { RefreshCw, AlertCircle, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";

// Types
export interface StatItem {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  bgColor?: string;
  iconColor?: string;
  accentColor?: string;
  trend?: string;
  description?: string;
  prefix?: string;
  suffix?: string;
  onClick?: () => void;
  clickable?: boolean;
}

export interface StatCardProps {
  items: StatItem[];
  isLoading?: boolean;
  error?: Error | null;
  onRetry?: () => void;
  isRefetching?: boolean;
  variant?: 'default' | 'compact';
  showTrends?: boolean;
  gridCols?: 'auto' | 1 | 2 | 3 | 4 | 5;
  className?: string;
  animationDelay?: number;
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

// Grid class mapping
const gridColsMap = {
  auto: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
  1: "grid-cols-1",
  2: "grid-cols-1 md:grid-cols-2",
  3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
  4: "grid-cols-1 md:grid-cols-2 xl:grid-cols-4",
  5: "grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 lg:grid-cols-5",
};

export function StatCard({
  items,
  isLoading = false,
  error = null,
  onRetry,
  isRefetching = false,
  variant = 'default',
  showTrends = false,
  gridCols = 'auto',
  className = "",
  animationDelay = 0,
}: StatCardProps) {
  const gridClass = gridColsMap[gridCols];

  // Loading state
  if (isLoading) {
    return (
      <div className={`grid ${gridClass} gap-4 ${className}`}>
        {items.map((_, i) => (
          <Skeleton 
            key={i} 
            className={variant === 'compact' ? "h-16" : "h-24"} 
          />
        ))}
      </div>
    );
  }

  // Error state
  if (error && onRetry) {
    return (
      <Alert className={`border-red-200 ${className}`}>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription className="flex items-center justify-between">
          <span>Failed to load statistics</span>
          <Button
            variant="outline"
            size="sm"
            onClick={onRetry}
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

  // Compact variant
  if (variant === 'compact') {
    return (
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className={`grid ${gridClass} gap-3 ${className}`}
      >
        {items.map((stat, index) => (
          <motion.div 
            key={index} 
            variants={itemVariants}
            onClick={stat.clickable ? stat.onClick : undefined}
          >
            <Card className={`border-0 shadow-sm bg-card/50 backdrop-blur-sm ${
              stat.clickable 
                ? 'cursor-pointer hover:ring-2 hover:ring-primary/20' 
                : 'cursor-default'
            }`}>
              <CardContent className="p-3">
                <div className="flex items-center gap-3">
                  <motion.div 
                    className={`rounded-lg ${
                      stat.bgColor || 'bg-primary/10'
                    } p-2 ${
                      stat.iconColor || 'text-primary'
                    }`}
                    variants={iconVariants}
                    whileHover="hover"
                  >
                    {stat.icon}
                  </motion.div>
                  <div className="min-w-0 flex-1">
                    <div className="text-2xl font-bold tracking-tight">
                      {stat.prefix}{stat.value}{stat.suffix}
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

  // Default variant
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className={`grid ${gridClass} gap-4 ${className}`}
    >
      {items.map((stat, index) => (
        <motion.div
          key={index}
          variants={itemVariants}
          whileHover={{ y: -4, scale: 1.02, transition: { duration: 0.2 } }}
          whileTap={{ scale: 0.98 }}
          onClick={stat.clickable ? stat.onClick : undefined}
          className="group"
        >
          <Card className={`relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-card/50 backdrop-blur-sm ${
            stat.clickable 
              ? 'cursor-pointer hover:ring-2 hover:ring-primary/20' 
              : 'cursor-default'
          }`}>
            {/* Accent line */}
            <div className={`absolute top-0 left-0 right-0 h-1 ${
              stat.accentColor || 'bg-primary'
            }`} />
            
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <motion.div 
                  className={`rounded-xl ${
                    stat.bgColor || 'bg-primary/10'
                  } p-3 ${
                    stat.iconColor || 'text-primary'
                  } group-hover:scale-110 transition-transform duration-300`}
                  variants={iconVariants}
                  whileHover="hover"
                >
                  {stat.icon}
                </motion.div>
                {(showTrends || stat.trend) && stat.trend && (
                  <span className="text-xs font-medium px-2 py-1 rounded-full bg-primary/10 text-primary flex items-center gap-1">
                    {showTrends && <TrendingUp className="h-3 w-3" />}
                    {stat.trend}
                  </span>
                )}
              </div>
              
              <div className="space-y-2">
                <motion.div 
                  className="text-2xl sm:text-3xl font-bold tracking-tight"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ 
                    delay: animationDelay + index * 0.1, 
                    type: "spring", 
                    stiffness: 400 
                  }}
                >
                  {stat.prefix}{stat.value}{stat.suffix}
                </motion.div>
                <p className="text-sm text-muted-foreground font-medium leading-tight">
                  {stat.title}
                </p>
                {stat.description && (
                  <p className="text-xs text-muted-foreground">
                    {stat.description}
                  </p>
                )}
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

export default StatCard;