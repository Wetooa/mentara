"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  MoreHorizontal,
  CheckCircle,
  FileText,
  Download,
  Plus,
  Trash2,
  X,
  Upload as UploadIcon,
} from "lucide-react";
import { Task, TaskFile } from "@/components/worksheets/types";
import { worksheetsApi } from "@/lib/api/worksheets";
import { useAuth } from "@clerk/nextjs";

// Mock data - fallback if API fails
const getMockTask = (taskId: string): Task | undefined => {
  const mockTasks: Task[] = [
    {
      id: "task-2",
      title: "Exercise 5",
      therapistName: "Therapist Jackson",
      date: "2025-03-22",
      status: "completed",
      isCompleted: true,
      instructions: "None",
      materials: [
        {
          id: "mat-1",
          filename: "CSIT337Exercise5.pdf",
          url: "/files/CSIT337Exercise5.pdf",
        },
      ],
      myWork: [
        {
          id: "work-1",
          filename: "TolentinoTristanJamesExercise5.pdf",
          url: "/files/TolentinoTristanJamesExercise5.pdf",
        },
      ],
      submittedAt: "2025-03-22T20:53:00",
    },
    {
      id: "task-1",
      title: "Weekly Reflection",
      therapistName: "Therapist Williams",
      date: "2025-04-10",
      status: "upcoming",
      isCompleted: false,
      instructions:
        "Complete the reflection worksheet about your progress this week.",
      materials: [
        {
          id: "mat-2",
          filename: "ReflectionTemplate.pdf",
          url: "/files/ReflectionTemplate.pdf",
        },
      ],
      myWork: [],
    },
  ];

  return mockTasks.find((task) => task.id === taskId);
};

export default function TaskDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [task, setTask] = useState<Task | undefined>(undefined);
  const [showFileOptions, setShowFileOptions] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const taskId = params.taskId as string;
  const { userId } = useAuth();

  // Determine if task is editable based on submission status
  const isTaskEditable =
    task && !task.isCompleted && task.status !== "past_due";

  // Fetch task data from API
  useEffect(() => {
    async function fetchTask() {
      try {
        setIsLoading(true);
        setError(null);

        // Call the API to get worksheet details
        const worksheetData = await worksheetsApi.getById(taskId);
        setTask(worksheetData);
      } catch (err) {
        console.error("Error fetching worksheet:", err);
        setError("Failed to load worksheet details. Using mock data instead.");

        // Fallback to mock data
        const mockData = getMockTask(taskId);
        setTask(mockData);
      } finally {
        setIsLoading(false);
      }
    }

    fetchTask();
  }, [taskId]);

  useEffect(() => {
    // Close dropdown when clicking outside
    const handleClickOutside = (e: MouseEvent) => {
      setShowFileOptions(null);
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const handleBack = () => {
    router.back();
  };

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

  const dueDate = task?.date ? formatDate(task.date) : "";
  const turnedInDate =
    task?.isCompleted && task?.submittedAt
      ? `Turned in ${formatDate(task.submittedAt)}`
      : null;

  const handleAddAttachment = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileSelection = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (e.target.files && e.target.files.length > 0 && task) {
      const file = e.target.files[0];
      console.log("Selected file:", file.name);

      try {
        // Upload the file to the server
        const uploadedFile = await worksheetsApi.uploadFile(
          file,
          task.id,
          "submission"
        );

        // Update the task with the new file
        setTask({
          ...task,
          myWork: [
            ...(task.myWork || []),
            {
              id: uploadedFile.id,
              filename: uploadedFile.filename,
              url: uploadedFile.url,
            },
          ],
        });
      } catch (err) {
        console.error("Error uploading file:", err);
        alert("Failed to upload file. Please try again.");
      }

      // Reset the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleDownload = (file: TaskFile) => {
    console.log("Downloading file:", file.filename);

    // Create an anchor element and trigger download
    const link = document.createElement("a");
    link.href = file.url;
    link.download = file.filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDeleteAttachment = async (fileId: string) => {
    if (!task) return;

    try {
      // Delete the file from the server
      await worksheetsApi.deleteSubmission(fileId);

      // Update the local state
      setTask({
        ...task,
        myWork: task.myWork?.filter((work) => work.id !== fileId) || [],
      });
    } catch (err) {
      console.error("Error deleting file:", err);
      alert("Failed to delete file. Please try again.");
    }

    // Close dropdown
    setShowFileOptions(null);
  };

  const toggleFileOptions = (fileId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setShowFileOptions((prevId) => (prevId === fileId ? null : fileId));
  };

  const handleSubmitWork = async () => {
    if (!task) return;

    // Start submitting process
    setSubmitting(true);

    try {
      if (task.isCompleted) {
        // Unsubmit work
        const updatedWorksheet = await worksheetsApi.update(task.id, {
          isCompleted: false,
          status: "upcoming",
          submittedAt: undefined,
        });

        setTask(updatedWorksheet);
      } else {
        // Submit work
        const updatedWorksheet = await worksheetsApi.submitWorksheet(task.id, {
          complete: true,
          submissions: [], // We've already uploaded the files individually
        });

        setTask(updatedWorksheet);
      }
    } catch (err) {
      console.error("Error submitting worksheet:", err);
      alert("Failed to submit worksheet. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="h-full bg-white p-6">
        <div className="flex items-center mb-6">
          <button
            onClick={handleBack}
            className="flex items-center text-primary hover:text-primary/80"
          >
            <ArrowLeft className="mr-2 h-5 w-5" />
            Back
          </button>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (error || !task) {
    return (
      <div className="h-full bg-white p-6">
        <div className="flex items-center mb-6">
          <button
            onClick={handleBack}
            className="flex items-center text-primary hover:text-primary/80"
          >
            <ArrowLeft className="mr-2 h-5 w-5" />
            Back
          </button>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <p className="text-secondary">{error || "Worksheet not found"}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-white text-secondary">
      {/* Hidden file input for attachment uploads */}
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        onChange={handleFileSelection}
        accept=".pdf,.doc,.docx,.txt,.jpg,.png"
      />

      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <button
          onClick={handleBack}
          className="flex items-center text-primary hover:text-primary/80"
        >
          <ArrowLeft className="mr-2 h-5 w-5" />
          Back
        </button>

        {turnedInDate && (
          <div className="flex items-center text-gray-600">
            <CheckCircle className="mr-2 h-5 w-5 text-green-500" />
            {turnedInDate}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-3xl mx-auto">
          {/* Task Title */}
          <div className="mb-4">
            <h1 className="text-2xl font-semibold text-secondary">
              {task.title}
            </h1>
          </div>

          {/* Due Date */}
          <div className="mb-6 text-gray-600">
            <p>
              Due {dueDate} • Closes {dueDate}
            </p>
          </div>

          {/* Instructions */}
          <div className="mb-6">
            <h2 className="font-medium text-secondary mb-2">Instructions</h2>
            <p className="text-gray-600">{task.instructions || "None"}</p>
          </div>

          {/* Reference Materials */}
          <div className="mb-6">
            <h2 className="font-medium text-secondary mb-2">
              Reference materials
            </h2>
            {task.materials && task.materials.length > 0 ? (
              <div className="space-y-2">
                {task.materials.map((material) => (
                  <div
                    key={material.id}
                    className="flex items-center justify-between bg-gray-100 p-3 rounded-md"
                  >
                    <div className="flex items-center">
                      <FileText className="h-5 w-5 text-primary mr-3" />
                      <span className="text-secondary">
                        {material.filename}
                      </span>
                    </div>
                    <div className="flex items-center">
                      {/* Download button is always available */}
                      <button
                        className="text-gray-500 hover:text-primary p-1 mr-1"
                        onClick={() => handleDownload(material)}
                        title="Download"
                      >
                        <Download className="h-5 w-5" />
                      </button>
                      <button
                        className="text-gray-500 hover:text-secondary p-1 relative"
                        onClick={(e) => toggleFileOptions(material.id, e)}
                        title="More options"
                      >
                        <MoreHorizontal className="h-5 w-5" />

                        {/* Dropdown menu for file */}
                        {showFileOptions === material.id && (
                          <div
                            className="absolute right-0 top-full mt-1 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <ul className="py-1">
                              <li>
                                <button
                                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                  onClick={() => handleDownload(material)}
                                >
                                  <Download className="h-4 w-4 mr-2" />
                                  Download
                                </button>
                              </li>
                            </ul>
                          </div>
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600">No reference materials</p>
            )}
          </div>

          {/* My Work */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <h2 className="font-medium text-secondary">My work</h2>
              {task.status === "completed" && (
                <span className="text-sm text-green-500 flex items-center">
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Submitted
                </span>
              )}
              {task.status === "past_due" && (
                <span className="text-sm text-red-500">Past due</span>
              )}
            </div>

            {task.myWork && task.myWork.length > 0 ? (
              <div className="space-y-2">
                {task.myWork.map((work) => (
                  <div
                    key={work.id}
                    className="flex items-center justify-between bg-gray-100 p-3 rounded-md"
                  >
                    <div className="flex items-center">
                      <FileText className="h-5 w-5 text-primary mr-3" />
                      <span className="text-secondary">{work.filename}</span>
                    </div>
                    <div className="flex items-center">
                      {/* Download button is always available */}
                      <button
                        className="text-gray-500 hover:text-primary p-1 mr-1"
                        onClick={() => handleDownload(work)}
                        title="Download"
                      >
                        <Download className="h-5 w-5" />
                      </button>

                      {/* More options button with dropdown */}
                      <button
                        className="text-gray-500 hover:text-secondary p-1 relative"
                        onClick={(e) => toggleFileOptions(work.id, e)}
                        title="More options"
                      >
                        <MoreHorizontal className="h-5 w-5" />

                        {/* Dropdown menu for file */}
                        {showFileOptions === work.id && (
                          <div
                            className="absolute right-0 top-full mt-1 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <ul className="py-1">
                              <li>
                                <button
                                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                  onClick={() => handleDownload(work)}
                                >
                                  <Download className="h-4 w-4 mr-2" />
                                  Download
                                </button>
                              </li>

                              {/* Delete option only if task is not completed */}
                              {isTaskEditable && (
                                <li>
                                  <button
                                    className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                                    onClick={() =>
                                      handleDeleteAttachment(work.id)
                                    }
                                  >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete
                                  </button>
                                </li>
                              )}
                            </ul>
                          </div>
                        )}
                      </button>
                    </div>
                  </div>
                ))}

                {/* Add More Attachments Button - only if task is not completed */}
                {isTaskEditable && (
                  <button
                    onClick={handleAddAttachment}
                    className="flex items-center justify-center w-full py-3 border border-dashed border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                  >
                    <Plus className="h-5 w-5 text-primary mr-2" />
                    <span className="text-primary">Add More Attachments</span>
                  </button>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-6 bg-gray-100 rounded-lg">
                {isTaskEditable ? (
                  <>
                    <p className="mb-4 text-gray-600">No work submitted yet</p>
                    <button
                      onClick={handleAddAttachment}
                      className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition"
                    >
                      <UploadIcon className="h-4 w-4 mr-2 inline" />
                      Add Work
                    </button>
                  </>
                ) : (
                  <p className="text-gray-600">
                    No work was submitted for this task
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Submit/Unsubmit button - only show if task has attachments */}
          {task.myWork &&
            task.myWork.length > 0 &&
            task.status !== "past_due" && (
              <div className="flex flex-col items-end">
                {task.submittedAt && !submitting && (
                  <p className="text-sm text-gray-500 mb-2">
                    Submitted on {formatDate(task.submittedAt)}
                  </p>
                )}
                <button
                  onClick={handleSubmitWork}
                  disabled={submitting}
                  className={`px-6 py-2 rounded-md transition ${
                    task.isCompleted
                      ? "bg-gray-200 text-gray-700 hover:bg-gray-300"
                      : "bg-primary text-white hover:bg-primary/90"
                  } ${submitting ? "opacity-70 cursor-not-allowed" : ""}`}
                >
                  {submitting ? (
                    <span className="flex items-center">
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      {task.isCompleted ? "Unsubmitting..." : "Submitting..."}
                    </span>
                  ) : (
                    <>{task.isCompleted ? "Unsubmit Work" : "Submit Work"}</>
                  )}
                </button>
              </div>
            )}
        </div>
      </div>
    </div>
  );
}
