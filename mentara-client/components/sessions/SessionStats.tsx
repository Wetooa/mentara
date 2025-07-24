import { 
  Calendar, 
  CheckCircle, 
  Clock, 
  XCircle, 
  Play
} from "lucide-react";
import { StatCard, type StatItem } from "@/components/ui/stat-card";
import { useSessionStats } from "@/hooks/sessions";

interface SessionStatsProps {
  showTrends?: boolean;
  variant?: 'default' | 'compact';
}

export function SessionStats({ showTrends = false, variant = 'default' }: SessionStatsProps) {
  const { 
    data: stats, 
    isLoading, 
    error, 
    refetch, 
    isRefetching 
  } = useSessionStats();

  if (!stats && !isLoading && !error) {
    return null;
  }

  const statItems: StatItem[] = stats ? [
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
  ] : [];

  return (
    <StatCard
      items={statItems}
      isLoading={isLoading}
      error={error}
      onRetry={refetch}
      isRefetching={isRefetching}
      variant={variant}
      showTrends={showTrends}
      gridCols={4}
      className={variant === 'compact' ? 'mb-4' : 'mb-6'}
      animationDelay={0.2}
    />
  );
}