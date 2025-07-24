import { CheckCircle, AlertTriangle, Circle } from "lucide-react";
import { Task } from "./types";

interface WorksheetProgressProps {
  task: Task;
  showDetails?: boolean;
}

export default function WorksheetProgress({
  task,
  showDetails = true,
}: WorksheetProgressProps) {
  const getStatusInfo = () => {
    switch (task.status) {
      case "completed":
        return {
          icon: <CheckCircle className="h-5 w-5 text-green-500" />,
          label: "Completed",
          color: "text-green-500",
          bgColor: "bg-green-50",
        };
      case "overdue":
        return {
          icon: <AlertTriangle className="h-5 w-5 text-red-500" />,
          label: "Past Due",
          color: "text-red-500",
          bgColor: "bg-red-50",
        };
      case "in_progress":
        return {
          icon: <CheckCircle className="h-5 w-5 text-blue-500" />,
          label: "Submitted",
          color: "text-blue-500",
          bgColor: "bg-blue-50",
        };
      case "assigned":
        return {
          icon: <Circle className="h-5 w-5 text-gray-500" />,
          label: "Assigned",
          color: "text-gray-500",
          bgColor: "bg-gray-50",
        };
      case "reviewed":
        return {
          icon: <CheckCircle className="h-5 w-5 text-purple-500" />,
          label: "Reviewed",
          color: "text-purple-500",
          bgColor: "bg-purple-50",
        };
      default:
        return {
          icon: <Circle className="h-5 w-5 text-gray-500" />,
          label: "Unknown",
          color: "text-gray-500",
          bgColor: "bg-gray-50",
        };
    }
  };

  const statusInfo = getStatusInfo();

  // Simple inline display for list views
  if (!showDetails) {
    return (
      <div className="flex items-center space-x-2">
        {statusInfo.icon}
        <span className={`text-sm font-medium ${statusInfo.color}`}>
          {statusInfo.label}
        </span>
      </div>
    );
  }

  // Simple detailed display for detail views
  return (
    <div className="space-y-3">
      {/* Status Badge */}
      <div
        className={`inline-flex items-center px-3 py-2 rounded-lg ${statusInfo.bgColor}`}
      >
        {statusInfo.icon}
        <span className={`ml-2 text-sm font-medium ${statusInfo.color}`}>
          {statusInfo.label}
        </span>
      </div>

      {/* Submission Details */}
      {task.submittedAt && (
        <div className="p-3 bg-green-50 rounded-lg">
          <div className="flex items-center">
            <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
            <div>
              <p className="text-sm font-medium text-green-800">
                Submitted successfully
              </p>
              <p className="text-xs text-green-600 mt-1">
                {new Date(task.submittedAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "numeric",
                  minute: "numeric",
                })}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Feedback Section */}
      {task.feedback && (
        <div className="p-3 bg-blue-50 rounded-lg">
          <h5 className="text-sm font-medium text-blue-800 mb-2">
            Therapist Feedback
          </h5>
          <p className="text-sm text-blue-700">{task.feedback}</p>
        </div>
      )}
    </div>
  );
}
