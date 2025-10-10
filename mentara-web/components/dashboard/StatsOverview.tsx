import { Clock, Calendar, FileCheck, FileClock, Users } from "lucide-react";
import { StatCard, type StatItem } from "@/components/ui/stat-card";
import type { UserDashboardData } from "@/types/api/dashboard";

interface StatsOverviewProps {
  stats: UserDashboardData["stats"];
  onUpcomingSessionsClick?: () => void;
  onPendingWorksheetsClick?: () => void;
  onCompletedSessionsClick?: () => void;
  onCompletedWorksheetsClick?: () => void;
  onTherapistsClick?: () => void;
}

export default function StatsOverview({ 
  stats, 
  onUpcomingSessionsClick,
  onPendingWorksheetsClick,
  onCompletedSessionsClick,
  onCompletedWorksheetsClick,
  onTherapistsClick 
}: StatsOverviewProps) {
  const statItems: StatItem[] = [
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
    <StatCard
      items={statItems}
      gridCols={5}
      animationDelay={0.2}
    />
  );
}
