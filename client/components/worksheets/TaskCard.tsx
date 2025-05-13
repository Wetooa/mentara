import React from "react";
import { Task } from "./types";
import { FileText, CheckCircle } from "lucide-react";

interface TaskCardProps {
  task: Task;
}

export default function TaskCard({ task }: TaskCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm mb-3 p-4 hover:shadow transition-shadow">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className="p-2 bg-primary/10 rounded-md mr-3">
            <FileText className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h4 className="font-medium text-secondary">{task.title}</h4>
            <p className="text-sm text-gray-500">{task.therapistName}</p>
          </div>
        </div>

        {task.isCompleted && (
          <div className="flex items-center text-green-500">
            <CheckCircle className="h-5 w-5 mr-1" />
            <span className="text-sm">Completed</span>
          </div>
        )}
      </div>
    </div>
  );
}
