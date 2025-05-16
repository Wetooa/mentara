import React from "react";
import { useRouter } from "next/navigation";
import { Task } from "./types";
import { FileText } from "lucide-react";
import TaskCard from "./TaskCard";

interface WorksheetsListProps {
  tasks: Task[];
}

export default function WorksheetsList({ tasks }: WorksheetsListProps) {
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
    router.push(`/user/worksheets/${task.id}`);
  };

  const taskGroups = groupTasksByDate();

  return (
    <div className="flex-1 overflow-y-auto p-6 bg-gray-50 h-full">
      {taskGroups.length > 0 ? (
        taskGroups.map((group) => (
          <div key={group.date} className="mb-8">
            <h3 className="text-md font-medium text-gray-700 mb-3">
              {group.formattedDate}
            </h3>

            <div className="space-y-3">
              {group.tasks.map((task) => (
                <div
                  key={task.id}
                  onClick={() => handleSelectTask(task)}
                  className="cursor-pointer"
                >
                  <TaskCard task={task} />
                </div>
              ))}
            </div>
          </div>
        ))
      ) : (
        <div className="flex flex-col items-center justify-center h-full text-gray-500">
          <FileText className="h-12 w-12 mb-2 text-gray-400" />
          <p className="text-lg font-medium">No worksheets found</p>
          <p className="text-sm mt-1">Try adjusting your filters</p>
        </div>
      )}
    </div>
  );
}
