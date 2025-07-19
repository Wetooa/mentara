
import { Task } from "./types";
import { FileText } from "lucide-react";
import WorksheetProgress from "./WorksheetProgress";

interface TaskCardProps {
  task: Task;
}

export default function TaskCard({ task }: TaskCardProps) {

  return (
    <div className="bg-white rounded-lg shadow-sm mb-3 p-4 hover:shadow-md transition-shadow border border-gray-100">
      <div className="flex items-start justify-between">
        <div className="flex items-start">
          <div className="p-2 bg-[#129316]/15 rounded-md mr-3 mt-1">
            <FileText className="h-5 w-5 text-[#436B00]" />
          </div>
          <div className="flex-1">
            <h4 className="font-medium text-gray-900">{task.title}</h4>
            <p className="text-sm text-gray-600 mt-1">{task.therapistName}</p>
            
            {/* Due Date */}
            <p className="text-xs text-gray-500 mt-1">
              Due: {new Date(task.date).toLocaleDateString()}
            </p>
          </div>
        </div>

        <div className="flex flex-col items-end space-y-2">
          <WorksheetProgress task={task} showDetails={false} />
          {task.submittedAt && (
            <p className="text-xs text-gray-500">
              Submitted: {new Date(task.submittedAt).toLocaleDateString()}
            </p>
          )}
        </div>
      </div>

      {/* Progress indicator for list view */}
      <div className="mt-3 flex items-center space-x-2">
        <div className="flex-1 bg-gray-200 rounded-full h-1">
          <div
            className={`h-1 rounded-full transition-all duration-300 ${
              task.isCompleted
                ? "bg-green-500"
                : task.myWork && task.myWork.length > 0
                ? "bg-blue-500"
                : "bg-gray-300"
            }`}
            style={{
              width: task.isCompleted
                ? "100%"
                : task.myWork && task.myWork.length > 0
                ? "60%"
                : "20%",
            }}
          />
        </div>
        <span className="text-xs text-gray-500">
          {task.isCompleted
            ? "100%"
            : task.myWork && task.myWork.length > 0
            ? "60%"
            : "20%"}
        </span>
      </div>
    </div>
  );
}
