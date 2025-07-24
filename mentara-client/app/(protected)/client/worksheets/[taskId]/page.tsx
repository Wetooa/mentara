"use client";

import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  MoreHorizontal,
  CheckCircle,
  FileText,
  Download,
  Plus,
  Trash2,
  Upload as UploadIcon,
  Send,
  RotateCcw,
  AlertCircle,
  Eye,
} from "lucide-react";
import { Task, TaskFile, transformWorksheetAssignmentToTask } from "@/components/worksheets/types";
import WorksheetProgress from "@/components/worksheets/WorksheetProgress";
import { toast } from "sonner";
import { useApi } from "@/lib/api";
import { queryKeys } from "@/lib/queryKeys";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { WorksheetStatus } from "@/types/api/worksheets";
import { use } from "react";

interface TaskDetailPageProps {
  params: Promise<{ taskId: string }>;
}

export default function TaskDetailPage({ params }: TaskDetailPageProps) {
  const { taskId } = use(params);
  
  return <TaskDetailPageClient taskId={taskId} />;
}

function TaskDetailPageClient({ taskId }: { taskId: string }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [showFileOptions, setShowFileOptions] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const api = useApi();

  // Use React Query to fetch worksheet data
  const {
    data: worksheetData,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: queryKeys.worksheets.byId(taskId),
    queryFn: () => api.worksheets.getById(taskId),
    enabled: !!taskId,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: (failureCount, error: any) => {
      // Don't retry on 404 or auth errors
      if (error?.response?.status === 404 || error?.response?.status === 401) {
        return false;
      }
      return failureCount < 2;
    }
  });

  // Transform the worksheet data to Task format
  const task = worksheetData ? transformWorksheetAssignmentToTask(worksheetData) : undefined;

  // File upload mutation with optimistic updates
  const uploadFileMutation = useMutation({
    mutationFn: (file: File) => api.worksheets.uploadFile(file, taskId, "submission"),
    onSuccess: (uploadedFile) => {
      // Invalidate and refetch worksheet data
      queryClient.invalidateQueries({ queryKey: queryKeys.worksheets.byId(taskId) });
      toast.success(`Successfully uploaded ${uploadedFile.filename}`);
    },
    onError: (error) => {
      console.error("Error uploading file:", error);
      toast.error("Failed to upload file. Please try again.");
    }
  });

  // Turn in worksheet mutation
  const turnInMutation = useMutation({
    mutationFn: () => api.worksheets.turnIn(taskId),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.worksheets.byId(taskId) });
      toast.success("Worksheet turned in successfully!");
    },
    onError: (error) => {
      console.error("Error turning in worksheet:", error);
      toast.error("Failed to turn in worksheet. Please try again.");
    }
  });

  // Unturn in worksheet mutation
  const unturnInMutation = useMutation({
    mutationFn: () => api.worksheets.unturnIn(taskId),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.worksheets.byId(taskId) });
      toast.success("Worksheet turned back in for editing!");
    },
    onError: (error) => {
      console.error("Error unturning in worksheet:", error);
      toast.error("Failed to unturn in worksheet. Please try again.");
    }
  });

  // Determine if task is editable based on submission status
  const isTaskEditable = task && !task.isCompleted && task.status !== "past_due";

  useEffect(() => {
    // Close dropdown when clicking outside
    const handleClickOutside = () => {
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
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      console.log("Selected file:", file.name);

      // Use the built-in validation from the API service
      const validation = api.worksheets.validateFile(file);
      if (!validation.isValid) {
        toast.error(validation.error);
        return;
      }

      // Upload the file using the mutation
      uploadFileMutation.mutate(file);

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
    link.href = file.url || '';
    link.download = file.filename || 'download';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDeleteAttachment = async (fileId: string) => {
    if (!task) return;

    try {
      // Delete the file from the server
      // TODO: Implement deleteSubmission method
      // await api.worksheets.deleteSubmission(fileId);

      // Update the local state
      const deletedFile = task.myWork?.find((work) => work.id === fileId);
      setTask({
        ...task,
        myWork: task.myWork?.filter((work) => work.id !== fileId) || [],
      });
      
      toast.success(`Successfully deleted ${deletedFile?.filename || "file"}`);
    } catch (err) {
      console.error("Error deleting file:", err);
      toast.error("Failed to delete file. Please try again.");
    }

    // Close dropdown
    setShowFileOptions(null);
  };

  const toggleFileOptions = (fileId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setShowFileOptions((prevId) => (prevId === fileId ? null : fileId));
  };

  const handleTurnIn = () => {
    turnInMutation.mutate();
  };

  const handleUnturnIn = () => {
    unturnInMutation.mutate();
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

  if (error) {
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
        <div className="flex-1 flex flex-col items-center justify-center gap-4">
          <p className="text-secondary text-center">
            {(error as any)?.response?.status === 404 
              ? "Worksheet not found" 
              : "Failed to load worksheet details. Please try again."}
          </p>
          <button
            onClick={() => refetch()}
            className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!task) {
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
          <p className="text-secondary">Worksheet not found</p>
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

          {/* Progress Tracking */}
          <div className="mb-6">
            <h2 className="font-medium text-secondary mb-4">Progress</h2>
            <WorksheetProgress task={task} />
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
                        onClick={(e) => material.id && toggleFileOptions(material.id, e)}
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
                    className={`flex items-center justify-between p-3 rounded-md ${
                      work.uploading
                        ? "bg-blue-50 border border-blue-200"
                        : "bg-gray-100"
                    }`}
                  >
                    <div className="flex items-center">
                      <FileText className={`h-5 w-5 mr-3 ${
                        work.uploading ? "text-blue-500" : "text-primary"
                      }`} />
                      <div className="flex flex-col">
                        <span className={`text-secondary ${
                          work.uploading ? "text-blue-700" : ""
                        }`}>
                          {work.filename}
                        </span>
                        {work.uploading && (
                          <span className="text-xs text-blue-600">
                            Uploading...
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center">
                      {work.uploading ? (
                        // Show spinner for uploading files
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
                      ) : (
                        <>
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
                            onClick={(e) => work.id && toggleFileOptions(work.id, e)}
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
                                          work.id && handleDeleteAttachment(work.id)
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
                        </>
                      )}
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
                <div className="flex gap-3">
                  {/* Turn In/Unturn In Button */}
                  {worksheetData?.status === WorksheetStatus.SUBMITTED ? (
                    <button
                      onClick={handleUnturnIn}
                      disabled={unturnInMutation.isPending}
                      className="flex items-center px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {unturnInMutation.isPending ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-2"></div>
                          Unturning in...
                        </>
                      ) : (
                        <>
                          <RotateCcw className="mr-2 h-4 w-4" />
                          Unturn In
                        </>
                      )}
                    </button>
                  ) : (
                    <button
                      onClick={handleTurnIn}
                      disabled={turnInMutation.isPending}
                      className="flex items-center px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {turnInMutation.isPending ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Turning in...
                        </>
                      ) : (
                        <>
                          <Send className="mr-2 h-4 w-4" />
                          Turn In
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            )}
        </div>
      </div>
    </div>
  );
}
