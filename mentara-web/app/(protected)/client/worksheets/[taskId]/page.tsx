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
  const [deletingFiles, setDeletingFiles] = useState<Set<string>>(new Set());
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
    retry: (failureCount, error: unknown) => {
      // Don't retry on 404 or auth errors
      const apiError = error as Error & { response?: { status?: number } };
      if (
        apiError?.response?.status === 404 ||
        apiError?.response?.status === 401
      ) {
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
    onSuccess: () => {
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
    onSuccess: () => {
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

  const handleDeleteAttachment = async (filename: string) => {
    if (!task) return;

    // Add filename to deleting set
    setDeletingFiles((prev) => new Set(prev).add(filename));

    try {
      // Delete the file from the server using worksheetId and filename
      await api.worksheets.deleteSubmission(taskId, filename);

      // Refetch the data to update the UI
      queryClient.invalidateQueries({
        queryKey: queryKeys.worksheets.byId(taskId),
      });

      toast.success(`Successfully deleted ${filename}`);
    } catch (err) {
      console.error("Error deleting file:", err);
      toast.error("Failed to delete file. Please try again.");
    } finally {
      // Remove filename from deleting set
      setDeletingFiles((prev) => {
        const newSet = new Set(prev);
        newSet.delete(filename);
        return newSet;
      });
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
            {(error as Error & { response?: { status?: number } })?.response
              ?.status === 404
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
              {worksheetData?.status === WorksheetStatus.SUBMITTED && (
                <span className="text-sm text-green-500 flex items-center">
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Submitted
                </span>
              )}
              {worksheetData?.status === WorksheetStatus.REVIEWED && (
                <span className="text-sm text-blue-500 flex items-center">
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Reviewed
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
                {task.myWork?.map((work) => {
                  const isDeleting = Boolean(
                    work.filename && deletingFiles.has(work.filename)
                  );

                  return (
                    <div
                      key={work.id}
                      className={`flex items-center justify-between p-3 rounded-md transition-colors ${
                        isDeleting
                          ? "bg-red-50 border border-red-200 opacity-70"
                          : "bg-gray-100"
                      }`}
                    >
                      <div className="flex items-center">
                        <FileText
                          className={`h-5 w-5 mr-3 ${
                            isDeleting ? "text-red-500" : "text-primary"
                          }`}
                        />
                        <div className="flex flex-col">
                          <span
                            className={`${
                              isDeleting ? "text-red-700" : "text-secondary"
                            }`}
                          >
                            {work.filename}
                          </span>
                          {isDeleting && (
                            <span className="text-xs text-red-600">
                              Deleting...
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        {/* Show spinner when deleting */}
                        {isDeleting && (
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-red-500"></div>
                        )}

                        {/* View button - disabled when deleting */}
                        <button
                          className={`p-2 rounded-md transition-colors ${
                            isDeleting
                              ? "text-gray-400 cursor-not-allowed"
                              : "text-gray-500 hover:text-primary hover:bg-gray-200"
                          }`}
                          onClick={() => !isDeleting && handleDownload(work)}
                          disabled={isDeleting}
                          title={
                            isDeleting ? "File is being deleted" : "View file"
                          }
                        >
                          <Eye className="h-4 w-4" />
                        </button>

                        {/* Delete button - only if task is editable */}
                        {isTaskEditable && (
                          <button
                            className={`p-2 rounded-md transition-colors ${
                              isDeleting
                                ? "text-gray-400 cursor-not-allowed"
                                : "text-gray-500 hover:text-red-600 hover:bg-red-50"
                            }`}
                            onClick={() =>
                              !isDeleting &&
                              work.filename &&
                              handleDeleteAttachment(work.filename)
                            }
                            disabled={isDeleting}
                            title={isDeleting ? "Deleting..." : "Delete file"}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}

                {/* Status message for files vs submission */}
                {worksheetData?.status === WorksheetStatus.SUBMITTED && (
                  <div className="mb-3 p-3 bg-green-50 border border-green-200 rounded-md">
                    <p className="text-sm text-green-700">
                      ✓ Files uploaded and worksheet turned in
                    </p>
                  </div>
                )}
                {worksheetData?.status !== WorksheetStatus.SUBMITTED &&
                  task.myWork &&
                  task.myWork.length > 0 && (
                    <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-md">
                      <p className="text-sm text-blue-700">
                        Files uploaded but worksheet not yet turned in
                      </p>
                    </div>
                  )}

                {/* Add More Attachments Button - only if task is not completed */}
                {isTaskEditable &&
                  worksheetData?.status !== WorksheetStatus.SUBMITTED && (
                    <button
                      onClick={handleAddAttachment}
                      disabled={
                        uploadFileMutation.isPending || deletingFiles.size > 0
                      }
                      className="flex items-center justify-center w-full py-3 border border-dashed border-gray-300 rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {uploadFileMutation.isPending ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary mr-2"></div>
                          <span className="text-primary">Processing...</span>
                        </>
                      ) : deletingFiles.size > 0 ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-red-500 mr-2"></div>
                          <span className="text-red-500">
                            Deleting files...
                          </span>
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
                    <p className="mb-4 text-gray-600">
                      {worksheetData?.status === WorksheetStatus.SUBMITTED
                        ? "No files uploaded, but worksheet has been turned in"
                        : "No files uploaded yet"}
                    </p>
                    {worksheetData?.status !== WorksheetStatus.SUBMITTED && (
                      <button
                        onClick={handleAddAttachment}
                        disabled={deletingFiles.size > 0}
                        className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {deletingFiles.size > 0 ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2 inline-block"></div>
                            Deleting files...
                          </>
                        ) : (
                          <>
                            <UploadIcon className="h-4 w-4 mr-2 inline" />
                            Add Work
                          </>
                        )}
                      </button>
                    )}
                  </>
                ) : (
                  <p className="text-gray-600">
                    {worksheetData?.status === WorksheetStatus.SUBMITTED
                      ? "No files were uploaded, but worksheet was turned in"
                      : "No work was submitted for this task"}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Turn in info for empty worksheets */}
          {task.status !== "past_due" &&
            worksheetData?.status !== WorksheetStatus.SUBMITTED &&
            worksheetData?.status !== WorksheetStatus.REVIEWED &&
            (!task.myWork || task.myWork.length === 0) &&
            Array.from(uploadingFiles).length === 0 && (
              <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                <p className="text-sm text-yellow-700">
                  💡 You can turn in this worksheet even without uploading files
                  if no work is required.
                </p>
              </div>
            )}

          {/* Submit/Unsubmit button - show if task is not past due */}
          {task.status !== "past_due" && (
            <div className="flex flex-col items-end">
              <div className="flex gap-3">
                {/* Turn In/Unturn In Button */}
                {worksheetData?.status === WorksheetStatus.SUBMITTED ? (
                  <button
                    onClick={() => unturnInMutation.mutate()}
                    disabled={
                      unturnInMutation.isPending ||
                      Array.from(uploadingFiles).length > 0 ||
                      deletingFiles.size > 0
                    }
                    className="flex items-center px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {unturnInMutation.isPending ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-2"></div>
                        Unturning in...
                      </>
                    ) : deletingFiles.size > 0 ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-500 mr-2"></div>
                        Deleting files...
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
                      Array.from(uploadingFiles).length > 0 ||
                      deletingFiles.size > 0
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
                    ) : deletingFiles.size > 0 ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Deleting files...
                      </>
                    ) : (
                      <>
                        <Send className="mr-2 h-4 w-4" />
                        {task.myWork && task.myWork.length > 0
                          ? "Turn In"
                          : "Turn In (No Files)"}
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
