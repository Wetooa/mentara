import React from "react";
import { useRouter } from "next/navigation";
import { Task } from "./types";
import { FileText, CheckCircle, Clock, AlertTriangle } from "lucide-react";

interface TherapistWorksheetsListProps {
  tasks: Task[];
}

export default function TherapistWorksheetsList({
  tasks,
}: TherapistWorksheetsListProps) {
  const router = useRouter();

  // Group tasks by date
  const groupTasksByDate = () => {
    const groups: { [key: string]: Task[] } = {};

    tasks.forEach((task) => {
      if (!groups[task.date]) {
        groups[task.date] = [];
      }
      groups[task.date].push(task);
    });

    // Sort dates in descending order (newest first)
    return Object.keys(groups)
      .sort()
      .reverse()
      .map((date) => ({
        date,
        formattedDate: formatDate(date),
        tasks: groups[date],
      }));
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const month = date.toLocaleString("default", { month: "short" });
    const day = date.getDate();
    const dayOfWeek = date.toLocaleString("default", { weekday: "long" });

    return `${month} ${day}${getDaySuffix(day)} ${dayOfWeek}`;
  };

  const getDaySuffix = (day: number) => {
    if (day > 3 && day < 21) return "th";
    switch (day % 10) {
      case 1:
        return "st";
      case 2:
        return "nd";
      case 3:
        return "rd";
      default:
        return "th";
    }
  };

  const handleSelectTask = (task: Task) => {
    router.push(`/therapist/worksheets/${task.id}`);
  };

  const taskGroups = groupTasksByDate();

  const getStatusIcon = (task: Task) => {
    if (task.isCompleted) {
      return <CheckCircle className="h-5 w-5 text-[#436B00]" />;
    } else if (task.status === "past_due") {
      return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
    } else {
      return <Clock className="h-5 w-5 text-[#436B00]" />;
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
      {taskGroups.length > 0 ? (
        taskGroups.map((group) => (
          <div key={group.date} className="mb-8">
            <h3 className="text-md font-medium text-gray-700 mb-3">
              {group.formattedDate}
            </h3>

            <div className="grid gap-4">
              {group.tasks.map((task) => (
                <div
                  key={task.id}
                  onClick={() => handleSelectTask(task)}
                  className="cursor-pointer bg-white p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900">
                        {task.title}
                      </h4>
                      <p className="text-sm text-gray-600 mt-1">
                        {task.patientName}
                      </p>
                      <p className="text-sm text-gray-500 mt-2 line-clamp-2">
                        {task.instructions || "No instructions provided"}
                      </p>
                    </div>
                    <div className="flex flex-col items-end">
                      <div className="mb-2">{getStatusIcon(task)}</div>
                    </div>
                  </div>

                  {task.isCompleted && (
                    <div className="mt-3 pt-3 border-t border-gray-100 flex justify-between items-center">
                      <span className="text-xs text-gray-500">
                        Submitted:{" "}
                        {new Date(task.submittedAt || "").toLocaleDateString()}
                      </span>
                      {task.feedback ? (
                        <span className="text-xs bg-[#129316]/15 text-[#436B00] px-2 py-1 rounded">
                          Feedback provided
                        </span>
                      ) : (
                        <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                          Feedback needed
                        </span>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))
      ) : (
        <div className="flex flex-col items-center justify-center h-full text-gray-500">
          <FileText className="h-12 w-12 mb-2 text-gray-400" />
          <p>No worksheets found</p>
          <p className="text-sm">Try adjusting your filters</p>
        </div>
      )}
    </div>
  );
}
