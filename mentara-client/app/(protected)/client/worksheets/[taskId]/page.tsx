"use client";

import React, { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  CheckCircle,
  FileText,
  Plus,
  Trash2,
  Upload as UploadIcon,
  Send,
  RotateCcw,
  Eye,
} from "lucide-react";
import {
  TaskFile,
  transformWorksheetAssignmentToTask,
} from "@/components/worksheets/types";
import WorksheetProgress from "@/components/worksheets/WorksheetProgress";
import { toast } from "sonner";
import { useApi } from "@/lib/api";
import { queryKeys } from "@/lib/queryKeys";
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
  const [uploadingFiles, setUploadingFiles] = useState<Set<string>>(new Set());
  const fileInputRef = useRef<HTMLInputElement>(null);
  const api = useApi();

  // Use React Query to fetch worksheet data
  const {
    data: worksheetData,
    isLoading,
    error,
    refetch,
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
    },
  });

  // Transform the worksheet data to Task format
  const task = worksheetData
    ? transformWorksheetAssignmentToTask(worksheetData)
    : undefined;

  // File upload mutation with optimistic updates
  const uploadFileMutation = useMutation({
    mutationFn: async (file: File) => {
      const fileName = file.name;
      setUploadingFiles((prev) => new Set(prev).add(fileName));
      return api.worksheets.uploadFile(file, taskId, "submission");
    },
    onSuccess: (uploadedFile) => {
      // Remove from uploading state
      setUploadingFiles((prev) => {
        const newSet = new Set(prev);
        newSet.delete(uploadedFile.filename || "");
        return newSet;
      });

      // Invalidate and refetch worksheet data
      queryClient.invalidateQueries({
        queryKey: queryKeys.worksheets.byId(taskId),
      });
      toast.success(`Successfully uploaded ${uploadedFile.filename}`);
    },
    onError: (error, file) => {
      // Remove from uploading state
      setUploadingFiles((prev) => {
        const newSet = new Set(prev);
        newSet.delete(file.name);
        return newSet;
      });

      console.error("Error uploading file:", error);
      toast.error("Failed to upload file. Please try again.");
    },
  });

  // Turn in worksheet mutation
  const turnInMutation = useMutation({
    mutationFn: () => api.worksheets.turnIn(taskId),
    onSuccess: (result) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.worksheets.byId(taskId),
      });
      toast.success("Worksheet turned in successfully!");
    },
    onError: (error) => {
      console.error("Error turning in worksheet:", error);
      toast.error("Failed to turn in worksheet. Please try again.");
    },
  });

  // Unturn in worksheet mutation
  const unturnInMutation = useMutation({
    mutationFn: () => api.worksheets.unturnIn(taskId),
    onSuccess: (result) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.worksheets.byId(taskId),
      });
      toast.success("Worksheet turned back in for editing!");
    },
    onError: (error) => {
      console.error("Error unturning in worksheet:", error);
      toast.error("Failed to unturn in worksheet. Please try again.");
    },
  });

  // Determine if task is editable based on submission status
  const isTaskEditable =
    task &&
    !task.isCompleted &&
    task.status !== "past_due" &&
    task.status !== "reviewed";

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
    link.href = file.url || "";
    link.download = file.filename || "download";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDeleteAttachment = async (fileId: string) => {
    if (!task) return;

    try {
      // Delete the file from the server
      await api.worksheets.deleteSubmission(fileId);

      // Refetch the data to update the UI
      queryClient.invalidateQueries({
        queryKey: queryKeys.worksheets.byId(taskId),
      });

      const deletedFile = task.myWork?.find((work) => work.id === fileId);
      toast.success(`Successfully deleted ${deletedFile?.filename || "file"}`);
    } catch (err) {
      console.error("Error deleting file:", err);
      toast.error("Failed to delete file. Please try again.");
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
                      {/* View button */}
                      <button
                        className="text-gray-500 hover:text-primary p-2 rounded-md hover:bg-gray-200 transition-colors"
                        onClick={() => handleDownload(material)}
                        title="View file"
                      >
                        <Eye className="h-4 w-4" />
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

            {/* Show uploading files first */}
            {Array.from(uploadingFiles).length > 0 ||
            (task.myWork && task.myWork.length > 0) ? (
              <div className="space-y-2">
                {/* Show uploading files */}
                {Array.from(uploadingFiles).map((fileName) => (
                  <div
                    key={`uploading-${fileName}`}
                    className="flex items-center justify-between p-3 rounded-md bg-blue-50 border border-blue-200"
                  >
                    <div className="flex items-center">
                      <FileText className="h-5 w-5 mr-3 text-blue-500" />
                      <div className="flex flex-col">
                        <span className="text-blue-700">{fileName}</span>
                        <span className="text-xs text-blue-600">
                          Uploading...
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
                    </div>
                  </div>
                ))}

                {/* Show existing files */}
                {task.myWork?.map((work) => (
                  <div
                    key={work.id}
                    className="flex items-center justify-between p-3 rounded-md bg-gray-100"
                  >
                    <div className="flex items-center">
                      <FileText className="h-5 w-5 mr-3 text-primary" />
                      <div className="flex flex-col">
                        <span className="text-secondary">{work.filename}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {/* View button */}
                      <button
                        className="text-gray-500 hover:text-primary p-2 rounded-md hover:bg-gray-200 transition-colors"
                        onClick={() => handleDownload(work)}
                        title="View file"
                      >
                        <Eye className="h-4 w-4" />
                      </button>

                      {/* Delete button - only if task is editable */}
                      {isTaskEditable && (
                        <button
                          className="text-gray-500 hover:text-red-600 p-2 rounded-md hover:bg-red-50 transition-colors"
                          onClick={() =>
                            work.id && handleDeleteAttachment(work.id)
                          }
                          title="Delete file"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}

                {/* Add More Attachments Button - only if task is not completed */}
                {isTaskEditable && (
                  <button
                    onClick={handleAddAttachment}
                    disabled={uploadFileMutation.isPending}
                    className="flex items-center justify-center w-full py-3 border border-dashed border-gray-300 rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {uploadFileMutation.isPending ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary mr-2"></div>
                        <span className="text-primary">Processing...</span>
                      </>
                    ) : (
                      <>
                        <Plus className="h-5 w-5 text-primary mr-2" />
                        <span className="text-primary">
                          Add More Attachments
                        </span>
                      </>
                    )}
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

          {/* Submit/Unsubmit button - only show if task has attachments or uploading files */}
          {((task.myWork && task.myWork.length > 0) ||
            Array.from(uploadingFiles).length > 0) &&
            task.status !== "past_due" && (
              <div className="flex flex-col items-end">
                {task.submittedAt && (
                  <p className="text-sm text-gray-500 mb-2">
                    Submitted on {formatDate(task.submittedAt)}
                  </p>
                )}
                <div className="flex gap-3">
                  {/* Turn In/Unturn In Button */}
                  {worksheetData?.status === WorksheetStatus.SUBMITTED ? (
                    <button
                      onClick={() => unturnInMutation.mutate()}
                      disabled={
                        unturnInMutation.isPending ||
                        Array.from(uploadingFiles).length > 0
                      }
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
                  ) : worksheetData?.status !== WorksheetStatus.REVIEWED ? (
                    <button
                      onClick={() => turnInMutation.mutate()}
                      disabled={
                        turnInMutation.isPending ||
                        Array.from(uploadingFiles).length > 0
                      }
                      className="flex items-center px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {turnInMutation.isPending ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Turning in...
                        </>
                      ) : Array.from(uploadingFiles).length > 0 ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Uploading files...
                        </>
                      ) : (
                        <>
                          <Send className="mr-2 h-4 w-4" />
                          Turn In
                        </>
                      )}
                    </button>
                  ) : null}
                </div>
              </div>
            )}
        </div>
      </div>
    </div>
  );
}
