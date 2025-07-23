import React from "react";
import { Clock, Trash, DollarSign, UserPlus } from "lucide-react";
import { StatCard, type StatItem } from "@/components/ui/stat-card";

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

export default function DashboardStats({ stats }: DashboardStatsProps) {
  const statItems: StatItem[] = [
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
    <StatCard 
      items={statItems}
      gridCols={4}
      animationDelay={0.2}
    />
  );
}
