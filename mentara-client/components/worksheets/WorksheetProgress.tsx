
import { CheckCircle, Clock, AlertTriangle, Circle } from "lucide-react";
import { Task } from "./types";

interface WorksheetProgressProps {
  task: Task;
  showDetails?: boolean;
}

export default function WorksheetProgress({
  task,
  showDetails = true,
}: WorksheetProgressProps) {
  const getProgressSteps = () => {
    const steps = [
      {
        id: "assigned",
        label: "Assigned",
        isCompleted: true, // Always completed if task exists
        isActive: task.status === "assigned",
      },
      {
        id: "in_progress",
        label: "In Progress",
        isCompleted: task.myWork && task.myWork.length > 0,
        isActive: task.status === "upcoming" && task.myWork && task.myWork.length > 0,
      },
      {
        id: "submitted",
        label: "Submitted",
        isCompleted: task.isCompleted,
        isActive: task.status === "completed",
      },
    ];

    return steps;
  };

  const getStatusInfo = () => {
    switch (task.status) {
      case "completed":
        return {
          icon: <CheckCircle className="h-5 w-5 text-green-500" />,
          label: "Completed",
          color: "text-green-500",
          bgColor: "bg-green-50",
        };
      case "past_due":
        return {
          icon: <AlertTriangle className="h-5 w-5 text-red-500" />,
          label: "Past Due",
          color: "text-red-500",
          bgColor: "bg-red-50",
        };
      case "upcoming":
        return {
          icon: <Clock className="h-5 w-5 text-blue-500" />,
          label: "Upcoming",
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
  const progressSteps = getProgressSteps();

  const getCompletionPercentage = () => {
    const completedSteps = progressSteps.filter((step) => step.isCompleted).length;
    return Math.round((completedSteps / progressSteps.length) * 100);
  };

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

  return (
    <div className="space-y-4">
      {/* Status Badge */}
      <div className={`inline-flex items-center px-3 py-1 rounded-full ${statusInfo.bgColor}`}>
        {statusInfo.icon}
        <span className={`ml-2 text-sm font-medium ${statusInfo.color}`}>
          {statusInfo.label}
        </span>
      </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-gray-700">Progress</span>
          <span className="text-sm text-gray-500">{getCompletionPercentage()}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-green-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${getCompletionPercentage()}%` }}
          />
        </div>
      </div>

      {/* Progress Steps */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-gray-700">Steps</h4>
        {progressSteps.map((step) => (
          <div key={step.id} className="flex items-center space-x-3">
            <div
              className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${
                step.isCompleted
                  ? "bg-green-500"
                  : step.isActive
                  ? "bg-blue-500"
                  : "bg-gray-300"
              }`}
            >
              {step.isCompleted ? (
                <CheckCircle className="h-4 w-4 text-white" />
              ) : (
                <div
                  className={`w-2 h-2 rounded-full ${
                    step.isActive ? "bg-white" : "bg-gray-500"
                  }`}
                />
              )}
            </div>
            <span
              className={`text-sm ${
                step.isCompleted
                  ? "text-gray-900 font-medium"
                  : step.isActive
                  ? "text-blue-600 font-medium"
                  : "text-gray-500"
              }`}
            >
              {step.label}
            </span>
          </div>
        ))}
      </div>

      {/* Submission Details */}
      {task.submittedAt && (
        <div className="mt-4 p-3 bg-green-50 rounded-lg">
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
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <h5 className="text-sm font-medium text-blue-800 mb-2">
            Therapist Feedback
          </h5>
          <p className="text-sm text-blue-700">{task.feedback}</p>
        </div>
      )}
    </div>
  );
}