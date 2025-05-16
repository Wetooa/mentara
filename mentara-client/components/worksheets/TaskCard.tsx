import React from "react";
import { Task } from "./types";
import { FileText, CheckCircle, Clock, AlertTriangle } from "lucide-react";

interface TaskCardProps {
  task: Task;
}

export default function TaskCard({ task }: TaskCardProps) {
  const getStatusIcon = () => {
    if (task.isCompleted) {
      return (
        <div className="flex items-center text-[#436B00]">
          <CheckCircle className="h-5 w-5 mr-1" />
          <span className="text-sm font-medium">Completed</span>
        </div>
      );
    } else if (task.status === "past_due") {
      return (
        <div className="flex items-center text-amber-600">
          <AlertTriangle className="h-5 w-5 mr-1" />
          <span className="text-sm font-medium">Past Due</span>
        </div>
      );
    } else {
      return (
        <div className="flex items-center text-[#436B00]">
          <Clock className="h-5 w-5 mr-1" />
          <span className="text-sm font-medium">Upcoming</span>
        </div>
      );
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm mb-3 p-4 hover:shadow-md transition-shadow border border-gray-100">
      <div className="flex items-start justify-between">
        <div className="flex items-start">
          <div className="p-2 bg-[#129316]/15 rounded-md mr-3 mt-1">
            <FileText className="h-5 w-5 text-[#436B00]" />
          </div>
          <div>
            <h4 className="font-medium text-gray-900">{task.title}</h4>
            <p className="text-sm text-gray-600 mt-1">{task.therapistName}</p>
          </div>
        </div>

        <div className="flex flex-col items-end">
          {getStatusIcon()}
          {task.submittedAt && (
            <p className="text-xs text-gray-500 mt-2">
              Submitted: {new Date(task.submittedAt).toLocaleDateString()}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
