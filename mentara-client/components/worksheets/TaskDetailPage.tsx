import React from "react";
import { ArrowLeft, Download, CheckCircle, FileText } from "lucide-react";
import Link from "next/link";
import { Task } from "./types";

interface TaskDetailPageProps {
  task?: Task;
  onBack: () => void;
}

export default function TaskDetailPage({ task, onBack }: TaskDetailPageProps) {
  if (!task) {
    return (
      <div className="flex flex-col h-full bg-white text-gray-900 p-6">
        <div className="flex items-center">
          <button
            onClick={onBack}
            className="flex items-center text-[#436B00] hover:text-[#129316]"
          >
            <ArrowLeft className="mr-2 h-5 w-5" />
            Back
          </button>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <p>Worksheet not found</p>
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
  const turnedInDate =
    task.isCompleted && task.submittedAt
      ? `Submitted ${formatDate(task.submittedAt)}`
      : null;

  return (
    <div className="flex flex-col h-full bg-white text-gray-900">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
        <button
          onClick={onBack}
          className="flex items-center text-[#436B00] hover:text-[#129316]"
        >
          <ArrowLeft className="mr-2 h-5 w-5" />
          Back
        </button>

        {turnedInDate && (
          <div className="flex items-center text-gray-600">
            <CheckCircle className="mr-2 h-5 w-5 text-[#436B00]" />
            {turnedInDate}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-3xl mx-auto">
          {/* Task Title */}
          <div className="mb-4">
            <h1 className="text-2xl font-semibold text-gray-900">
              {task.title}
            </h1>
            <p className="text-gray-600 mt-1">From: {task.therapistName}</p>
          </div>

          {/* Due Date */}
          <div className="mb-6 text-gray-600">
            <p>Due {dueDate}</p>
          </div>

          {/* Instructions */}
          <div className="mb-6">
            <h2 className="text-lg font-medium mb-2">Instructions</h2>
            <p className="text-gray-600 bg-[#129316]/15 p-4 rounded-md border border-gray-200">
              {task.instructions || "None"}
            </p>
          </div>

          {/* Reference Materials */}
          <div className="mb-6">
            <h2 className="text-lg font-medium mb-2">Reference materials</h2>
            {task.materials && task.materials.length > 0 ? (
              <div className="space-y-2">
                {task.materials.map((material, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between bg-gray-50 p-3 rounded-md border border-gray-200"
                  >
                    <div className="flex items-center">
                      <FileText className="h-5 w-5 text-gray-500 mr-3" />
                      <span>{material.filename}</span>
                    </div>
                    <button className="text-[#436B00] hover:text-[#129316] flex items-center">
                      <Download className="h-5 w-5 mr-1" />
                      Download
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No reference materials</p>
            )}
          </div>

          {/* My Work */}
          <div className="mb-6">
            <h2 className="text-lg font-medium mb-2">My work</h2>
            {task.myWork && task.myWork.length > 0 ? (
              <div className="space-y-2">
                {task.myWork.map((work, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between bg-gray-50 p-3 rounded-md border border-gray-200"
                  >
                    <div className="flex items-center">
                      <FileText className="h-5 w-5 text-gray-500 mr-3" />
                      <span>{work.filename}</span>
                    </div>
                    <button className="text-[#436B00] hover:text-[#129316] flex items-center">
                      <Download className="h-5 w-5 mr-1" />
                      Download
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-6 bg-[#129316]/15 rounded-lg border border-gray-200">
                <p className="mb-3 text-gray-700">No work submitted yet</p>
                <button className="px-4 py-2 bg-[#436B00] text-white rounded-md hover:bg-[#129316]">
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
