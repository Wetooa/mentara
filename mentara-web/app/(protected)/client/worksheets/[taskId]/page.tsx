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

  // Parse estimated time from instructions
  const extractEstimatedTime = (instructions: string) => {
    const match = instructions.match(/Estimated time:\s*(\d+)\s*minutes?/i);
    return match ? `${match[1]}m` : null;
  };

  const estimatedTime = task.instructions ? extractEstimatedTime(task.instructions) : null;

  // Calculate progress percentage
  const calculateProgress = () => {
    if (worksheetData?.status === WorksheetStatus.REVIEWED) return 100;
    if (worksheetData?.status === WorksheetStatus.SUBMITTED) return 75;
    if (task.myWork && task.myWork.length > 0) return 50;
    return 0;
  };

  const progressPercent = calculateProgress();

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Hidden file input for attachment uploads */}
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        onChange={handleFileSelection}
        accept=".pdf,.doc,.docx,.txt,.jpg,.png"
      />

      {/* Header with Back Button */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-sm border-b border-border/50 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4">
          <button
            onClick={handleBack}
            className="flex items-center text-primary hover:text-primary/80 transition-colors group"
          >
            <ArrowLeft className="mr-2 h-5 w-5 group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium">Back to Worksheets</span>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6">
          
          {/* Hero Section - Title & Key Info */}
          <div className="bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5 rounded-2xl p-6 sm:p-8 border border-primary/20 shadow-sm">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
                  {task.title}
                </h1>
                <p className="text-gray-600">
                  Assigned by{" "}
                  <span className="font-semibold text-primary">
                    {worksheetData?.therapist?.user 
                      ? `Dr. ${worksheetData.therapist.user.firstName} ${worksheetData.therapist.user.lastName}`
                      : "Your Therapist"}
                  </span>{" "}
                  • {new Date(worksheetData?.createdAt || task.date).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric"
                  })}
                </p>
              </div>
            </div>

            {/* Status Badges Row */}
            <div className="flex flex-wrap gap-3 mt-6">
              {/* Due Date Badge */}
              <div className="flex items-center gap-2 bg-white px-4 py-3 rounded-xl border border-gray-200 shadow-sm">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium">Due Date</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {new Date(task.date).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric"
                    })}
                  </p>
                </div>
              </div>

              {/* Estimated Time Badge */}
              {estimatedTime && (
                <div className="flex items-center gap-2 bg-white px-4 py-3 rounded-xl border border-gray-200 shadow-sm">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <FileText className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium">Est. Time</p>
                    <p className="text-sm font-semibold text-gray-900">{estimatedTime}</p>
                  </div>
                </div>
              )}

              {/* Progress Badge */}
              <div className="flex items-center gap-2 bg-white px-4 py-3 rounded-xl border border-gray-200 shadow-sm">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium">Progress</p>
                  <p className="text-sm font-semibold text-gray-900">{progressPercent}%</p>
                </div>
              </div>

              {/* Status Badge */}
              <div className="flex-1 min-w-fit">
                {worksheetData?.status === WorksheetStatus.REVIEWED && (
                  <div className="bg-blue-500 text-white px-4 py-3 rounded-xl shadow-sm flex items-center gap-2">
                    <CheckCircle className="h-5 w-5" />
                    <span className="font-semibold">Reviewed</span>
                  </div>
                )}
                {worksheetData?.status === WorksheetStatus.SUBMITTED && (
                  <div className="bg-green-500 text-white px-4 py-3 rounded-xl shadow-sm flex items-center gap-2">
                    <Send className="h-5 w-5" />
                    <span className="font-semibold">Submitted</span>
                  </div>
                )}
                {task.status === "past_due" && (
                  <div className="bg-red-500 text-white px-4 py-3 rounded-xl shadow-sm flex items-center gap-2">
                    <CheckCircle className="h-5 w-5" />
                    <span className="font-semibold">Past Due</span>
                  </div>
                )}
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mt-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Overall Progress</span>
                <span className="text-sm font-bold text-primary">{progressPercent}%</span>
              </div>
              <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-primary to-primary/80 transition-all duration-500 rounded-full"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          </div>

          {/* Therapist Context Card */}
          {worksheetData?.therapist && (
            <div className="bg-white rounded-2xl p-6 border border-border/50 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start gap-4 mb-4">
                <div className="h-16 w-16 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-white text-2xl font-bold shadow-md">
                  {worksheetData.therapist.user.firstName?.[0]}
                  {worksheetData.therapist.user.lastName?.[0]}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900">
                    Dr. {worksheetData.therapist.user.firstName} {worksheetData.therapist.user.lastName}
                  </h3>
                  <p className="text-sm text-gray-600 font-medium">
                    {worksheetData.therapist.professionalLicenseType || "Licensed Therapist"}
                  </p>
                  {worksheetData.therapist.yearsOfExperience && (
                    <p className="text-xs text-gray-500 mt-1">
                      {worksheetData.therapist.yearsOfExperience} years of experience
                    </p>
                  )}
                </div>
              </div>

              {/* Therapist Details */}
              {(worksheetData.therapist.areasOfExpertise?.length > 0 || 
                worksheetData.therapist.therapeuticApproachesUsedList?.length > 0) && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  {worksheetData.therapist.areasOfExpertise && worksheetData.therapist.areasOfExpertise.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-gray-500 mb-2">Specializations</p>
                      <div className="flex flex-wrap gap-1.5">
                        {worksheetData.therapist.areasOfExpertise.slice(0, 3).map((area, idx) => (
                          <span key={idx} className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-md font-medium">
                            {area}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {worksheetData.therapist.therapeuticApproachesUsedList && worksheetData.therapist.therapeuticApproachesUsedList.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-gray-500 mb-2">Approaches</p>
                      <div className="flex flex-wrap gap-1.5">
                        {worksheetData.therapist.therapeuticApproachesUsedList.slice(0, 3).map((approach, idx) => (
                          <span key={idx} className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-md font-medium">
                            {approach.replace("Therapy", "").replace(/[()]/g, "").trim()}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Instructions - Enhanced */}
          <div className="bg-white rounded-2xl p-6 border border-border/50 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <FileText className="h-6 w-6 text-primary" />
              Instructions
            </h2>
            <div className="prose prose-sm max-w-none">
              {task.instructions ? (
                <div className="space-y-3">
                  {task.instructions.split('\n').map((line, idx) => {
                    // Parse numbered steps
                    const stepMatch = line.match(/^(\d+)\.\s*(.+)$/);
                    if (stepMatch) {
                      return (
                        <div key={idx} className="flex gap-3 items-start">
                          <div className="flex-shrink-0 h-6 w-6 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold">
                            {stepMatch[1]}
                          </div>
                          <p className="text-gray-700 flex-1 pt-0.5">{stepMatch[2]}</p>
                        </div>
                      );
                    }
                    // Regular lines
                    if (line.trim()) {
                      return (
                        <p key={idx} className="text-gray-700">
                          {line}
                        </p>
                      );
                    }
                    return null;
                  })}
                </div>
              ) : (
                <p className="text-gray-500 italic">No instructions provided</p>
              )}
            </div>
          </div>

          {/* Reference Materials - Enhanced */}
          <div className="bg-white rounded-2xl p-6 border border-border/50 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <FileText className="h-6 w-6 text-blue-600" />
              Reference Materials
            </h2>
            {task.materials && task.materials.length > 0 ? (
              <div className="space-y-2">
                {task.materials.map((material) => (
                  <div
                    key={material.id}
                    className="flex items-center justify-between bg-gradient-to-r from-blue-50 to-cyan-50 p-4 rounded-xl border border-blue-200/50 hover:shadow-md transition-all group"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="p-2.5 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                        <FileText className="h-5 w-5 text-blue-600" />
                      </div>
                      <span className="text-gray-900 font-medium truncate">
                        {material.filename}
                      </span>
                    </div>
                    <button
                      className="flex items-center gap-2 text-primary hover:text-primary/80 font-medium transition-colors px-3 py-1.5 rounded-lg hover:bg-primary/10"
                      onClick={() => handleDownload(material)}
                      title="View file"
                    >
                      <Eye className="h-4 w-4" />
                      <span className="text-sm">View</span>
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                <FileText className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-500">No reference materials provided</p>
              </div>
            )}
          </div>

          {/* My Work - Enhanced */}
          <div className="bg-white rounded-2xl p-6 border border-border/50 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <UploadIcon className="h-6 w-6 text-primary" />
                My Work
              </h2>
              {turnedInDate && (
                <div className="flex items-center gap-2 bg-green-50 px-3 py-2 rounded-lg border border-green-200">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-green-700 font-medium">{turnedInDate}</span>
                </div>
              )}
            </div>

            {/* Show uploading files first */}
            {Array.from(uploadingFiles).length > 0 ||
            (task.myWork && task.myWork.length > 0) ? (
              <div className="space-y-3">
                {/* Show uploading files */}
                {Array.from(uploadingFiles).map((fileName) => (
                  <div
                    key={`uploading-${fileName}`}
                    className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 shadow-sm"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-blue-100 rounded-lg animate-pulse">
                        <FileText className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-blue-900 font-medium">{fileName}</span>
                        <span className="text-xs text-blue-600 font-medium">
                          Uploading...
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-500 border-t-transparent"></div>
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
                      className={`flex items-center justify-between p-4 rounded-xl transition-all ${
                        isDeleting
                          ? "bg-red-50 border border-red-200 opacity-70"
                          : "bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200/50 hover:shadow-md"
                      }`}
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className={`p-2.5 rounded-lg ${
                          isDeleting ? "bg-red-100" : "bg-green-100"
                        }`}>
                          <FileText
                            className={`h-5 w-5 ${
                              isDeleting ? "text-red-600" : "text-green-600"
                            }`}
                          />
                        </div>
                        <div className="flex flex-col flex-1 min-w-0">
                          <span
                            className={`font-medium truncate ${
                              isDeleting ? "text-red-700" : "text-gray-900"
                            }`}
                          >
                            {work.filename}
                          </span>
                          {isDeleting && (
                            <span className="text-xs text-red-600 font-medium">
                              Deleting...
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {/* Show spinner when deleting */}
                        {isDeleting && (
                          <div className="animate-spin rounded-full h-5 w-5 border-2 border-red-500 border-t-transparent"></div>
                        )}

                        {/* View button - disabled when deleting */}
                        <button
                          className={`p-2 rounded-lg transition-colors ${
                            isDeleting
                              ? "text-gray-400 cursor-not-allowed"
                              : "text-gray-500 hover:text-primary hover:bg-primary/10"
                          }`}
                          onClick={() => !isDeleting && handleDownload(work)}
                          disabled={isDeleting}
                          title={
                            isDeleting ? "File is being deleted" : "View file"
                          }
                        >
                          <Eye className="h-5 w-5" />
                        </button>

                        {/* Delete button - only if task is editable */}
                        {isTaskEditable && (
                          <button
                            className={`p-2 rounded-lg transition-colors ${
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
                            <Trash2 className="h-5 w-5" />
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
                      className="flex items-center justify-center w-full py-4 border-2 border-dashed border-primary/30 rounded-xl hover:bg-primary/5 hover:border-primary/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
                    >
                      {uploadFileMutation.isPending ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-2 border-primary border-t-transparent mr-2"></div>
                          <span className="text-primary font-medium">Processing...</span>
                        </>
                      ) : deletingFiles.size > 0 ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-2 border-red-500 border-t-transparent mr-2"></div>
                          <span className="text-red-500 font-medium">
                            Deleting files...
                          </span>
                        </>
                      ) : (
                        <>
                          <Plus className="h-5 w-5 text-primary mr-2 group-hover:scale-110 transition-transform" />
                          <span className="text-primary font-semibold">
                            Add More Files
                          </span>
                        </>
                      )}
                    </button>
                  )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border-2 border-dashed border-gray-300">
                {isTaskEditable ? (
                  <>
                    <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                      <UploadIcon className="h-8 w-8 text-primary" />
                    </div>
                    <p className="mb-2 text-gray-900 font-medium">
                      {worksheetData?.status === WorksheetStatus.SUBMITTED
                        ? "No files uploaded, but worksheet has been turned in"
                        : "No files uploaded yet"}
                    </p>
                    <p className="mb-4 text-sm text-gray-500">
                      Upload your completed work or turn in without files
                    </p>
                    {worksheetData?.status !== WorksheetStatus.SUBMITTED && (
                      <button
                        onClick={handleAddAttachment}
                        disabled={deletingFiles.size > 0}
                        className="px-6 py-3 bg-gradient-to-r from-primary to-primary/90 text-white rounded-xl hover:from-primary/90 hover:to-primary/80 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed font-semibold flex items-center gap-2"
                      >
                        {deletingFiles.size > 0 ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                            Deleting files...
                          </>
                        ) : (
                          <>
                            <UploadIcon className="h-5 w-5" />
                            Upload Your Work
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
              <div className="p-4 bg-gradient-to-r from-yellow-50 to-amber-50 border border-yellow-200 rounded-xl flex items-start gap-3">
                <div className="flex-shrink-0 text-2xl">💡</div>
                <div>
                  <p className="text-sm text-yellow-900 font-medium mb-1">
                    No files required?
                  </p>
                  <p className="text-sm text-yellow-700">
                    You can turn in this worksheet without uploading files if no work is required.
                  </p>
                </div>
              </div>
            )}

          {/* Submit/Unsubmit button - show if task is not past due */}
          {task.status !== "past_due" && (
            <div className="sticky bottom-0 bg-gradient-to-t from-white via-white to-transparent pt-6 pb-4 -mx-4 px-4 sm:-mx-6 sm:px-6">
              <div className="flex flex-col sm:flex-row gap-3 justify-end">
                {/* Turn In/Unturn In Button */}
                {worksheetData?.status === WorksheetStatus.SUBMITTED ? (
                  <button
                    onClick={() => unturnInMutation.mutate()}
                    disabled={
                      unturnInMutation.isPending ||
                      Array.from(uploadingFiles).length > 0 ||
                      deletingFiles.size > 0
                    }
                    className="flex items-center justify-center gap-2 px-6 py-3.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-semibold border border-gray-300"
                  >
                    {unturnInMutation.isPending ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-gray-600 border-t-transparent"></div>
                        Unturning in...
                      </>
                    ) : deletingFiles.size > 0 ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-red-500 border-t-transparent"></div>
                        Deleting files...
                      </>
                    ) : (
                      <>
                        <RotateCcw className="h-5 w-5" />
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
                    className="flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-primary to-primary/90 text-white rounded-xl hover:from-primary/90 hover:to-primary/80 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed font-bold text-lg"
                  >
                    {turnInMutation.isPending ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                        Turning in...
                      </>
                    ) : Array.from(uploadingFiles).length > 0 ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                        Uploading files...
                      </>
                    ) : deletingFiles.size > 0 ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                        Deleting files...
                      </>
                    ) : (
                      <>
                        <Send className="h-5 w-5" />
                        {task.myWork && task.myWork.length > 0
                          ? "Turn In Worksheet"
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
