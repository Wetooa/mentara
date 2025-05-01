import React from "react";
import { ArrowLeft, MoreHorizontal, CheckCircle, FileText } from "lucide-react";
import Link from "next/link";
import { Task } from "./types";

interface TaskDetailPageProps {
  task?: Task;
  onBack: () => void;
}

export default function TaskDetailPage({ task, onBack }: TaskDetailPageProps) {
  if (!task) {
    return (
      <div className="flex flex-col h-full bg-gray-900 text-white p-6">
        <div className="flex items-center">
          <button
            onClick={onBack}
            className="flex items-center text-blue-400 hover:text-blue-300"
          >
            <ArrowLeft className="mr-2 h-5 w-5" />
            Back
          </button>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <p>Task not found</p>
        </div>
      </div>
    );
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "numeric",
    });
  };

  const dueDate = formatDate(task.date);
  const turnedInDate = task.isCompleted
    ? `Turned in Sat Mar 22, 2025 at 8:53 PM`
    : null;

  return (
    <div className="flex flex-col h-full bg-gray-900 text-white">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-800">
        <button
          onClick={onBack}
          className="flex items-center text-blue-400 hover:text-blue-300"
        >
          <ArrowLeft className="mr-2 h-5 w-5" />
          Back
        </button>

        {turnedInDate && (
          <div className="flex items-center text-gray-400">
            <CheckCircle className="mr-2 h-5 w-5 text-green-500" />
            {turnedInDate}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-3xl mx-auto">
          {/* Task Title and Points */}
          <div className="flex items-start justify-between mb-4">
            <h1 className="text-2xl font-semibold">{task.title}</h1>
            <div className="text-right">
              <p className="text-lg font-medium">Points</p>
              <p>30 points possible</p>
            </div>
          </div>

          {/* Due Date */}
          <div className="mb-6 text-gray-400">
            <p>
              Due {dueDate} • Closes {dueDate}
            </p>
          </div>

          {/* Instructions */}
          <div className="mb-6">
            <h2 className="font-medium mb-2">Instructions</h2>
            <p className="text-gray-400">{task.instructions || "None"}</p>
          </div>

          {/* Reference Materials */}
          <div className="mb-6">
            <h2 className="font-medium mb-2">Reference materials</h2>
            {task.materials && task.materials.length > 0 ? (
              <div className="space-y-2">
                {task.materials.map((material, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between bg-gray-800 p-3 rounded-md"
                  >
                    <div className="flex items-center">
                      <FileText className="h-5 w-5 text-gray-400 mr-3" />
                      <span>{material.filename}</span>
                    </div>
                    <button className="text-gray-400 hover:text-white">
                      <MoreHorizontal className="h-5 w-5" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400">No reference materials</p>
            )}
          </div>

          {/* My Work */}
          <div className="mb-6">
            <h2 className="font-medium mb-2">My work</h2>
            {task.myWork && task.myWork.length > 0 ? (
              <div className="space-y-2">
                {task.myWork.map((work, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between bg-gray-800 p-3 rounded-md"
                  >
                    <div className="flex items-center">
                      <FileText className="h-5 w-5 text-gray-400 mr-3" />
                      <span>{work.filename}</span>
                    </div>
                    <button className="text-gray-400 hover:text-white">
                      <MoreHorizontal className="h-5 w-5" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-6 bg-gray-800 rounded-lg">
                <p className="mb-2">No work submitted yet</p>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                  Add Work
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
