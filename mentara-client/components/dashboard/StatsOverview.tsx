import { Card, CardContent } from "@/components/ui/card";
import { Clock, Calendar, FileCheck, FileClock, Users } from "lucide-react";
import { UserDashboardData } from "@/data/mockUserDashboardData";

interface StatsOverviewProps {
  stats: UserDashboardData["stats"];
}

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
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
      {statItems.map((stat, index) => (
        <Card key={index} className="shadow-sm">
          <CardContent className="p-4 md:p-6 flex flex-col items-center text-center">
            <div className={`rounded-full ${stat.color} p-3 mb-3`}>
              {stat.icon}
            </div>
            <h3 className="text-2xl md:text-3xl font-bold">{stat.value}</h3>
            <p className="text-sm text-muted-foreground mt-1">{stat.title}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
