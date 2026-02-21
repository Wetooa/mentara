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
      bgColor: "bg-secondary/10",
      iconColor: "text-secondary",
      accentColor: "bg-secondary",
      trend: "+2 new",
    },
    {
      title: "Rescheduled",
      value: stats.rescheduled,
      icon: <Clock className="h-5 w-5" />,
      bgColor: "bg-secondary/15",
      iconColor: "text-secondary",
      accentColor: "bg-secondary/80",
      trend: "This week",
    },
    {
      title: "Cancelled",
      value: stats.cancelled,
      icon: <Trash className="h-5 w-5" />,
      bgColor: "bg-secondary/10",
      iconColor: "text-secondary",
      accentColor: "bg-secondary/60",
      trend: "Today",
    },
    {
      title: "This Month's Income",
      value: stats.income,
      icon: <DollarSign className="h-5 w-5" />,
      bgColor: "bg-secondary/15",
      iconColor: "text-secondary",
      accentColor: "bg-secondary/80",
      trend: "+12%",
      prefix: "₱",
      suffix: "K",
    },
  ];

  return <StatCard items={statItems} gridCols={4} animationDelay={0.2} />;
}
