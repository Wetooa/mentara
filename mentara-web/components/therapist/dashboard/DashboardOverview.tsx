import React from "react";
import { ChevronDown, TrendingUp, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

interface DashboardOverviewProps {
  patientStats: {
    total: number;
    percentage: number;
    months: number;
    chartData: Array<{ month: string; value: number }>;
  };
}

const chartVariants = {
  hidden: { scale: 0, opacity: 0 },
  visible: (i: number) => ({
    scale: 1,
    opacity: 1,
    transition: {
      delay: i * 0.1,
      type: "spring",
      stiffness: 300,
      damping: 24
    }
  })
};

export default function DashboardOverview({
  patientStats,
}: DashboardOverviewProps) {
  const { total, percentage, months, chartData } = patientStats;

  // Find min and max values for chart scaling
  const values = chartData.map((item) => item.value);
  const maxValue = Math.max(...values) || 1;

  return (
    <Card className="relative overflow-hidden border-2 hover:border-secondary/30 shadow-lg hover:shadow-xl transition-all duration-300 bg-white group">
      {/* Accent line with secondary color */}
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-secondary to-secondary/70" />
      
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-secondary/10 p-3 text-secondary">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-lg">Patient Overview</CardTitle>
              <p className="text-sm text-muted-foreground">Last {months} months</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" className="gap-1 text-xs">
            {months} months
            <ChevronDown className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Stats Section */}
        <div className="space-y-2">
          <div className="flex items-end gap-3">
            <motion.span 
              className="text-3xl font-bold tracking-tight"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              {total}
            </motion.span>
            <div className="flex items-center gap-1">
              <TrendingUp className={`h-4 w-4 ${percentage >= 0 ? 'text-emerald-500' : 'text-red-500'}`} />
              <span
                className={`text-sm font-medium ${
                  percentage >= 0 ? "text-emerald-500" : "text-red-500"
                }`}
              >
                {percentage >= 0 ? "+" : ""}
                {percentage}%
              </span>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            Total patients compared to last period
          </p>
        </div>

        {/* Modern Chart */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-muted-foreground">Monthly Growth</h4>
          <div className="h-32 flex items-end justify-between gap-2 px-2">
            {chartData.map((item, index) => {
              // Calculate height percentage based on max value
              const heightPercentage = maxValue > 0 ? (item.value / maxValue) * 100 : 0;

              return (
                <motion.div 
                  key={index} 
                  className="flex flex-col items-center flex-1"
                  custom={index}
                  variants={chartVariants}
                  initial="hidden"
                  animate="visible"
                >
                  <div className="relative w-full group/bar">
                    <motion.div
                      className="w-full bg-gradient-to-t from-secondary to-secondary/80 rounded-t-md hover:from-secondary/90 hover:to-secondary/70 transition-colors duration-200"
                      style={{
                        height: `${Math.max(heightPercentage, 8)}%`,
                      }}
                      whileHover={{ scale: 1.05 }}
                      transition={{ type: "spring", stiffness: 400 }}
                    />
                    {/* Tooltip on hover */}
                    <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover/bar:opacity-100 transition-opacity whitespace-nowrap">
                      {item.value} patients
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground mt-2 font-medium">
                    {item.month}
                  </span>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Subtle gradient overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-br from-secondary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
      </CardContent>
    </Card>
  );
}
