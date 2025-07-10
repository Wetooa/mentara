import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { UserDashboardData } from "@/lib/api/types/dashboard";
import {
  ArrowRight,
  FileText,
  CheckCircle,
  Clock,
  AlertCircle,
} from "lucide-react";
import { format, parseISO, isPast, isToday } from "date-fns";

interface WorksheetStatusProps {
  worksheets: UserDashboardData["worksheets"];
}

export default function WorksheetStatus({ worksheets }: WorksheetStatusProps) {
  // Group worksheets by status
  const pendingWorksheets = worksheets.filter((ws) => ws.status === "pending");
  const overdueWorksheets = worksheets.filter((ws) => ws.status === "overdue");
  const completedWorksheets = worksheets.filter(
    (ws) => ws.status === "completed"
  );

  // Check if there are worksheets due today
  const dueTodayWorksheets = worksheets.filter(
    (ws) => isToday(parseISO(ws.dueDate)) && ws.status !== "completed"
  );

  return (
    <Card className="shadow-sm">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">Worksheets</h2>
          <Button variant="ghost" size="sm" className="text-primary gap-1">
            View All <ArrowRight size={16} />
          </Button>
        </div>

        <div className="space-y-6">
          {/* Worksheets due today */}
          {dueTodayWorksheets.length > 0 && (
            <div>
              <h3 className="text-md font-semibold mb-3 text-primary">
                Due Today
              </h3>
              <div className="space-y-3">
                {dueTodayWorksheets.map((worksheet) => (
                  <WorksheetCard key={worksheet.id} worksheet={worksheet} />
                ))}
              </div>
            </div>
          )}

          {/* Pending worksheets */}
          {pendingWorksheets.length > 0 && (
            <div>
              <h3 className="text-md font-semibold mb-3 text-muted-foreground">
                Pending
              </h3>
              <div className="space-y-3">
                {pendingWorksheets
                  .filter((ws) => !isToday(parseISO(ws.dueDate)))
                  .slice(0, 3)
                  .map((worksheet) => (
                    <WorksheetCard key={worksheet.id} worksheet={worksheet} />
                  ))}
              </div>
            </div>
          )}

          {/* Overdue worksheets */}
          {overdueWorksheets.length > 0 && (
            <div>
              <h3 className="text-md font-semibold mb-3 text-red-500">
                Overdue
              </h3>
              <div className="space-y-3">
                {overdueWorksheets.slice(0, 2).map((worksheet) => (
                  <WorksheetCard key={worksheet.id} worksheet={worksheet} />
                ))}
              </div>
            </div>
          )}

          {/* If no worksheets are assigned */}
          {worksheets.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No worksheets assigned
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Helper component for individual worksheet card
function WorksheetCard({
  worksheet,
}: {
  worksheet: UserDashboardData["worksheets"][0];
}) {
  // Format dates
  const assignedDate = format(parseISO(worksheet.assignedDate), "MMM d");
  const dueDate = format(parseISO(worksheet.dueDate), "MMM d");

  // Determine status properties
  const statusProps = {
    pending: {
      icon: <Clock className="h-5 w-5 text-yellow-500" />,
      label: "Pending",
      color: "text-yellow-500",
      bgColor: "bg-yellow-50",
    },
    completed: {
      icon: <CheckCircle className="h-5 w-5 text-green-500" />,
      label: "Completed",
      color: "text-green-500",
      bgColor: "bg-green-50",
    },
    overdue: {
      icon: <AlertCircle className="h-5 w-5 text-red-500" />,
      label: "Overdue",
      color: "text-red-500",
      bgColor: "bg-red-50",
    },
  };

  const status = statusProps[worksheet.status];

  return (
    <div className={`p-4 rounded-lg border ${status.bgColor}`}>
      <div className="flex items-start gap-3">
        <div className="p-2 bg-white rounded-md">
          <FileText className="h-5 w-5 text-primary" />
        </div>

        <div className="flex-1">
          <h4 className="font-semibold">{worksheet.title}</h4>
          <p className="text-sm text-muted-foreground">
            Assigned by {worksheet.therapistName}
          </p>
          <div className="text-xs text-muted-foreground mt-1">
            Assigned: {assignedDate} · Due: {dueDate}
          </div>
        </div>

        <div>
          <div
            className={`flex items-center gap-1 ${status.color} text-sm font-medium`}
          >
            {status.icon}
            <span>{status.label}</span>
          </div>

          <div className="mt-2 text-right">
            <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full"
                style={{ width: `${worksheet.progress}%` }}
              />
            </div>
            <span className="text-xs text-muted-foreground">
              {worksheet.progress}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
