import { useState } from "react";
import {
  ArrowLeft,
  CheckCircle,
  FileText,
  Download,
  Edit,
  Trash2,
  Plus,
  X,
  User,
  Calendar,
  Upload,
} from "lucide-react";
import { Task } from "./types";
import FeedbackModal from "./FeedbackModal";
import { useApi } from "@/lib/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface TaskDetailPageProps {
  task?: Task;
  onBack: () => void;
  onTaskUpdate?: () => void; // Add callback for when task is updated
}

export default function TherapistTaskDetailPage({
  task,
  onBack,
  onTaskUpdate,
}: TaskDetailPageProps) {
  // Remove unused feedback state - we now use the modal for feedback input
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [editingWorksheet, setEditingWorksheet] = useState<Task | null>(null);
  const [filesToRemove, setFilesToRemove] = useState<string[]>([]);
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [editDateTimeError, setEditDateTimeError] = useState<string | null>(
    null
  );
  const api = useApi();
  const queryClient = useQueryClient();

  // Mutation for marking worksheet as reviewed
  const markAsReviewedMutation = useMutation({
    mutationFn: (feedback: string) =>
      api.therapists.worksheets.markAsReviewed(task?.id || "", feedback),
    onSuccess: () => {
      toast.success("Worksheet marked as reviewed successfully!");
      setShowFeedbackModal(false);
      if (onTaskUpdate) {
        onTaskUpdate(); // Refresh the task data
      }
    },
    onError: (error) => {
      console.error("Error marking worksheet as reviewed:", error);
      toast.error("Failed to mark worksheet as reviewed. Please try again.");
    },
  });

  // Mutation for editing worksheet
  const editWorksheetMutation = useMutation({
    mutationFn: async ({
      worksheetId,
      updateData,
      filesToRemove,
      newFiles,
    }: {
      worksheetId: string;
      updateData: {
        title?: string;
        instructions?: string;
        dueDate?: string;
        status?: string;
      };
      filesToRemove: string[];
      newFiles: File[];
    }) => {
      // First update the worksheet
      const result = await api.therapists.worksheets.edit(
        worksheetId,
        updateData
      );

      // Remove files
      for (const fileUrl of filesToRemove) {
        await api.therapists.worksheets.removeReferenceFile(
          worksheetId,
          fileUrl
        );
      }

      // Upload new files
      for (const file of newFiles) {
        await api.therapists.worksheets.uploadReferenceFile(worksheetId, file);
      }

      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["therapist", "worksheets"] });
      toast.success("Worksheet updated successfully!");
      setEditingWorksheet(null);
      setFilesToRemove([]);
      setNewFiles([]);
      if (onTaskUpdate) {
        onTaskUpdate(); // Refresh the task data
      }
    },
    onError: (error) => {
      console.error("Error updating worksheet:", error);
      toast.error("Failed to update worksheet. Please try again.");
    },
  });

  // File management handlers
  const handleFileUpload = (files: FileList | null) => {
    if (files) {
      setNewFiles((prev) => [...prev, ...Array.from(files)]);
    }
  };

  const handleRemoveNewFile = (index: number) => {
    setNewFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleRemoveExistingFile = (fileUrl: string) => {
    setFilesToRemove((prev) => [...prev, fileUrl]);
  };

  const handleRestoreExistingFile = (fileUrl: string) => {
    setFilesToRemove((prev) => prev.filter((url) => url !== fileUrl));
  };

  // Validation function for date and time in edit mode
  const validateEditDateTime = (
    dateStr: string,
    timeStr: string
  ): { isValid: boolean; error?: string } => {
    if (!dateStr || !timeStr) {
      return { isValid: false, error: "Both date and time are required." };
    }

    const selectedDateTime = new Date(`${dateStr}T${timeStr}`);
    const now = new Date();

    if (selectedDateTime <= now) {
      return {
        isValid: false,
        error: "Due date and time must be in the future.",
      };
    }

    return { isValid: true };
  };

  const handleEditWorksheet = (worksheet: Task) => {
    setEditingWorksheet(worksheet);
    setFilesToRemove([]);
    setNewFiles([]);
    setEditDateTimeError(null);
  };

  if (!task) {
    return (
      <div className="flex flex-col h-full bg-white text-gray-900 p-6">
        <div className="flex items-center">
          <button
            onClick={onBack}
            className="flex items-center text-secondary hover:text-secondary/80"
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

  const handleMarkAsReviewed = () => {
    setShowFeedbackModal(true);
  };

  const handleSubmitFeedback = (feedbackText: string) => {
    markAsReviewedMutation.mutate(feedbackText);
  };

  const dueDate = formatDate(task.date);
  const turnedInDate =
    task.isCompleted && task.submittedAt
      ? `Submitted ${formatDate(task.submittedAt)}`
      : null;

  // Check if worksheet can be edited (not reviewed)
  const canEdit = task.status !== "reviewed";

  return (
    <div className="flex flex-col h-full bg-gray-50 text-gray-900">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-white shadow-sm">
        <button
          onClick={onBack}
          className="flex items-center text-secondary hover:text-secondary/80 font-medium"
        >
          <ArrowLeft className="mr-2 h-5 w-5" />
          Back to Worksheets
        </button>

        <div className="flex items-center gap-3">
          {canEdit && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleEditWorksheet(task)}
              className="text-secondary border-secondary/30 hover:bg-secondary/10"
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit Worksheet
            </Button>
          )}
          {turnedInDate && (
            <div className="flex items-center text-green-700 bg-green-50 px-3 py-1.5 rounded-lg border border-green-200">
              <CheckCircle className="mr-2 h-4 w-4" />
              <span className="text-sm font-medium">{turnedInDate}</span>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Worksheet Header Card */}
          <Card className="border-2 border-secondary/20 shadow-md overflow-hidden">
            <div className="bg-gradient-to-r from-secondary/5 to-primary/5 p-6">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-secondary rounded-xl">
                  <FileText className="h-8 w-8 text-secondary-foreground" />
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    {task.title}
                  </h2>
                  <div className="flex flex-wrap items-center gap-3 text-sm">
                    <div className="flex items-center gap-2 bg-primary/10 px-3 py-1.5 rounded-full border border-primary/20">
                      <User className="h-4 w-4 text-primary" />
                      <span className="font-medium text-gray-900">
                        Client: {task.patientName}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-gray-600">
                      <Calendar className="h-4 w-4" />
                      <span>Due {dueDate}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Instructions Card */}
          <Card className="shadow-md overflow-hidden">
            <div className="p-6 border-b bg-white">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <div className="p-2 bg-secondary/10 rounded-lg">
                  <FileText className="h-5 w-5 text-secondary" />
                </div>
                Instructions
              </h3>
            </div>
            <CardContent className="pt-6">
              <div className="bg-secondary/5 p-4 rounded-lg border-l-4 border-l-secondary">
                <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                  {task.instructions || "No instructions provided"}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Reference Materials Card */}
          <Card className="shadow-md overflow-hidden">
            <div className="p-6 border-b bg-white">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
                Reference Materials
              </h3>
            </div>
            <CardContent className="pt-6">
              {task.materials && task.materials.length > 0 ? (
                <div className="space-y-3">
                  {task.materials.map((material, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between bg-white p-4 rounded-lg border border-gray-200 hover:border-primary/30 hover:shadow-sm transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-md">
                          <FileText className="h-5 w-5 text-primary" />
                        </div>
                        <span className="font-medium text-gray-900">
                          {material.filename}
                        </span>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-primary border-primary/30 hover:bg-primary/10"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                  <FileText className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-500">
                    No reference materials attached
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Client's Submission Card */}
          <Card className="shadow-md border-2 border-primary/20 overflow-hidden">
            <div className="bg-primary/5 p-6 border-b border-primary/10">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <div className="p-2 bg-primary rounded-lg">
                  <Upload className="h-5 w-5 text-primary-foreground" />
                </div>
                Client Submission
              </h3>
            </div>
            <CardContent className="pt-6">
              {task.myWork && task.myWork.length > 0 ? (
                <div className="space-y-3">
                  {task.myWork.map((work, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between bg-white p-4 rounded-lg border-2 border-primary/30 hover:border-primary hover:shadow-md transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-primary rounded-lg">
                          <FileText className="h-5 w-5 text-primary-foreground" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {work.filename}
                          </p>
                          {work.submittedAt && (
                            <p className="text-xs text-gray-600 mt-1">
                              Submitted {formatDate(work.submittedAt)}
                            </p>
                          )}
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="bg-primary text-primary-foreground hover:bg-primary/90 border-primary"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                  <div className="p-4 bg-gray-100 rounded-full mb-4">
                    <FileText className="h-12 w-12 text-gray-400" />
                  </div>
                  <p className="text-gray-600 font-medium mb-1">
                    No submission yet
                  </p>
                  <p className="text-sm text-gray-500">
                    Client hasn't submitted their work
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Review Actions */}
          {task.status === "completed" && (
            <Card className="shadow-lg border-2 border-secondary/30 overflow-hidden">
              <div className="bg-gradient-to-r from-secondary/10 to-primary/5 p-6 border-b">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <div className="p-2 bg-secondary rounded-lg">
                      <CheckCircle className="h-5 w-5 text-secondary-foreground" />
                    </div>
                    Review Worksheet
                  </h3>
                  <Button
                    onClick={handleMarkAsReviewed}
                    disabled={markAsReviewedMutation.isPending}
                    className="bg-secondary hover:bg-secondary/90 shadow-md"
                    size="lg"
                  >
                    {markAsReviewedMutation.isPending ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Mark as Reviewed
                      </>
                    )}
                  </Button>
                </div>
              </div>
              <CardContent className="pt-6">
                <div className="p-4 bg-secondary/5 rounded-lg border border-secondary/20">
                  <p className="text-sm text-gray-700">
                    Click &quot;Mark as Reviewed&quot; to provide feedback and
                    complete the review process. Your feedback will be shared
                    with the client.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Existing Feedback (if worksheet was already reviewed) */}
          {task.status === "reviewed" && task.feedback && (
            <Card className="shadow-lg border-2 border-green-300 overflow-hidden">
              <div className="bg-green-50 p-6 border-b border-green-200">
                <h3 className="text-lg font-semibold flex items-center gap-2 text-green-800">
                  <div className="p-2 bg-green-500 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-white" />
                  </div>
                  Your Feedback
                </h3>
              </div>
              <CardContent className="pt-6">
                <div className="bg-white p-5 rounded-lg border border-green-200">
                  <p className="text-gray-800 whitespace-pre-wrap leading-relaxed">
                    {task.feedback}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Feedback Modal */}
      <FeedbackModal
        isOpen={showFeedbackModal}
        onClose={() => setShowFeedbackModal(false)}
        onSubmit={handleSubmitFeedback}
        isSubmitting={markAsReviewedMutation.isPending}
        patientName={task.patientName}
        worksheetTitle={task.title}
      />

      {/* Edit Worksheet Sheet */}
      <Sheet
        open={!!editingWorksheet}
        onOpenChange={(open) => !open && setEditingWorksheet(null)}
      >
        <SheetContent
          side="right"
          className="w-full max-w-2xl sm:max-w-xl p-0 gap-0 overflow-hidden flex flex-col"
        >
          {editingWorksheet && (
            <>
              <SheetHeader className="px-6 py-5 border-b bg-gradient-to-br from-secondary/5 to-primary/5 backdrop-blur-sm">
                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <SheetTitle className="flex items-center gap-3 text-xl font-semibold text-gray-900">
                      <div className="p-2 rounded-lg bg-secondary shadow-sm">
                        <Edit className="h-5 w-5 text-secondary-foreground" />
                      </div>
                      Edit Worksheet
                    </SheetTitle>
                  </div>
                  <SheetDescription className="text-sm text-gray-600 font-medium">
                    Update the worksheet details, instructions, and reference
                    materials for your client.
                  </SheetDescription>
                </div>
              </SheetHeader>

              <div className="flex-1 min-h-0 bg-gradient-to-b from-gray-50/30 to-white">
                <div className="h-full overflow-y-auto">
                  <div className="p-6 space-y-6">
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        setEditDateTimeError(null);
                        const formData = new FormData(e.currentTarget);
                        const dueDateValue = formData.get("dueDate") as string;
                        const dueTimeValue = formData.get("dueTime") as string;

                        // Validate date and time if both are provided
                        if (dueDateValue && dueTimeValue) {
                          const dateTimeValidation = validateEditDateTime(
                            dueDateValue,
                            dueTimeValue
                          );
                          if (!dateTimeValidation.isValid) {
                            setEditDateTimeError(dateTimeValidation.error!);
                            return;
                          }
                        }

                        const updateData = {
                          title: formData.get("title") as string,
                          instructions: formData.get("instructions") as string,
                          dueDate:
                            dueDateValue && dueTimeValue
                              ? new Date(
                                  `${dueDateValue}T${dueTimeValue}`
                                ).toISOString()
                              : undefined,
                        };
                        editWorksheetMutation.mutate({
                          worksheetId: editingWorksheet.id,
                          updateData,
                          filesToRemove,
                          newFiles,
                        });
                      }}
                      className="space-y-6"
                    >
                      {/* Basic Information Section */}
                      <div className="bg-white rounded-xl border border-gray-200/60 shadow-sm p-6">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="p-2 rounded-lg bg-secondary">
                            <FileText className="h-4 w-4 text-secondary-foreground" />
                          </div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            Basic Information
                          </h3>
                        </div>

                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label
                              htmlFor="title"
                              className="text-sm font-medium text-gray-700"
                            >
                              Worksheet Title
                            </Label>
                            <Input
                              id="title"
                              name="title"
                              defaultValue={editingWorksheet.title}
                              placeholder="Enter worksheet title..."
                              className="h-11 border-gray-300 focus:border-secondary focus:ring-secondary/20"
                              required
                            />
                          </div>

                          <div className="space-y-2">
                            <Label
                              htmlFor="instructions"
                              className="text-sm font-medium text-gray-700"
                            >
                              Instructions
                            </Label>
                            <Textarea
                              id="instructions"
                              name="instructions"
                              defaultValue={editingWorksheet.instructions || ""}
                              placeholder="Provide detailed instructions for your client..."
                              rows={4}
                              className="border-gray-300 focus:border-secondary focus:ring-secondary/20 resize-none"
                            />
                          </div>

                          <div className="space-y-3">
                            <Label className="text-sm font-medium text-gray-700">
                              Due Date & Time
                            </Label>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <div className="space-y-2">
                                <Label
                                  htmlFor="editDueDate"
                                  className="text-xs font-medium text-gray-600"
                                >
                                  Date
                                </Label>
                                <Input
                                  id="editDueDate"
                                  name="dueDate"
                                  type="date"
                                  defaultValue={
                                    editingWorksheet.date
                                      ? new Date(editingWorksheet.date)
                                          .toISOString()
                                          .split("T")[0]
                                      : ""
                                  }
                                  min={new Date().toISOString().split("T")[0]}
                                  className="h-11 border-gray-300 focus:border-secondary focus:ring-secondary/20"
                                  onChange={() => setEditDateTimeError(null)}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label
                                  htmlFor="editDueTime"
                                  className="text-xs font-medium text-gray-600"
                                >
                                  Time
                                </Label>
                                <Input
                                  id="editDueTime"
                                  name="dueTime"
                                  type="time"
                                  defaultValue={
                                    editingWorksheet.date
                                      ? new Date(editingWorksheet.date)
                                          .toTimeString()
                                          .slice(0, 5)
                                      : ""
                                  }
                                  className="h-11 border-gray-300 focus:border-secondary focus:ring-secondary/20"
                                  onChange={() => setEditDateTimeError(null)}
                                />
                              </div>
                            </div>
                            {editDateTimeError && (
                              <p className="text-red-500 text-sm">
                                {editDateTimeError}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* File Management Section */}
                      <div className="bg-white rounded-xl border border-gray-200/60 shadow-sm p-6">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="p-2 rounded-lg bg-purple-50">
                            <FileText className="h-4 w-4 text-purple-600" />
                          </div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            Reference Files
                          </h3>
                        </div>

                        {/* Existing Files */}
                        {editingWorksheet.materials &&
                          editingWorksheet.materials.length > 0 && (
                            <div className="space-y-3 mb-6">
                              <Label className="text-sm font-medium text-gray-700">
                                Current Files
                              </Label>
                              <div className="space-y-2">
                                {editingWorksheet.materials.map(
                                  (material, index) => {
                                    const fileName = material.filename;
                                    const fileUrl =
                                      material.url || `file-${index}`;
                                    const isMarkedForRemoval =
                                      filesToRemove.includes(fileUrl);

                                    return (
                                      <div
                                        key={fileUrl}
                                        className={`flex items-center justify-between p-4 border rounded-lg transition-all duration-200 ${
                                          isMarkedForRemoval
                                            ? "bg-red-50 border-red-200 opacity-60"
                                            : "bg-gray-50 border-gray-200 hover:border-gray-300"
                                        }`}
                                      >
                                        <div className="flex items-center gap-3">
                                          <FileText className="h-4 w-4 text-gray-500" />
                                          <span
                                            className={`text-sm font-medium ${isMarkedForRemoval ? "line-through text-gray-500" : "text-gray-700"}`}
                                          >
                                            {fileName}
                                          </span>
                                          {isMarkedForRemoval && (
                                            <span className="text-xs text-red-600 bg-red-100 px-2 py-1 rounded-full font-medium">
                                              Will be removed
                                            </span>
                                          )}
                                        </div>
                                        <div className="flex gap-2">
                                          {!isMarkedForRemoval ? (
                                            <Button
                                              type="button"
                                              variant="outline"
                                              size="sm"
                                              onClick={() =>
                                                handleRemoveExistingFile(
                                                  fileUrl
                                                )
                                              }
                                              className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                                            >
                                              <Trash2 className="h-3 w-3" />
                                            </Button>
                                          ) : (
                                            <Button
                                              type="button"
                                              variant="outline"
                                              size="sm"
                                              onClick={() =>
                                                handleRestoreExistingFile(
                                                  fileUrl
                                                )
                                              }
                                              className="text-green-600 hover:text-green-700 hover:bg-green-50 border-green-200"
                                            >
                                              Restore
                                            </Button>
                                          )}
                                        </div>
                                      </div>
                                    );
                                  }
                                )}
                              </div>
                            </div>
                          )}

                        {/* New Files */}
                        {newFiles.length > 0 && (
                          <div className="space-y-3 mb-6">
                            <Label className="text-sm font-medium text-gray-700">
                              New Files to Upload
                            </Label>
                            <div className="space-y-2">
                              {newFiles.map((file, index) => (
                                <div
                                  key={index}
                                  className="flex items-center justify-between p-4 bg-primary/5 border border-primary/20 rounded-lg"
                                >
                                  <div className="flex items-center gap-3">
                                    <FileText className="h-4 w-4 text-primary" />
                                    <span className="text-sm font-medium text-primary">
                                      {file.name}
                                    </span>
                                    <span className="text-xs text-primary-foreground bg-primary px-2 py-1 rounded-full font-medium">
                                      New
                                    </span>
                                  </div>
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleRemoveNewFile(index)}
                                    className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                                  >
                                    <X className="h-3 w-3" />
                                  </Button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* File Upload */}
                        <div>
                          <Label className="text-sm font-medium text-gray-700 mb-2 block">
                            Add Files
                          </Label>
                          <input
                            type="file"
                            multiple
                            accept=".pdf,.doc,.docx,.txt,.jpg,.png,.jpeg"
                            onChange={(e) => handleFileUpload(e.target.files)}
                            className="hidden"
                            id="file-upload-edit"
                          />
                          <Label
                            htmlFor="file-upload-edit"
                            className="flex items-center justify-center w-full p-6 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-secondary hover:bg-secondary/5 transition-all duration-200 group"
                          >
                            <div className="text-center">
                              <Plus className="h-8 w-8 text-gray-400 mx-auto mb-3 group-hover:text-secondary transition-colors" />
                              <span className="text-sm font-medium text-gray-600 group-hover:text-secondary transition-colors">
                                Click to upload files or drag and drop
                              </span>
                              <span className="text-xs text-gray-500 block mt-2">
                                PDF, DOC, DOCX, TXT, JPG, PNG (Max 10MB each)
                              </span>
                            </div>
                          </Label>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex justify-end gap-3 pt-4 border-t bg-gray-50/50 -mx-6 px-6 py-4">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setEditingWorksheet(null)}
                          className="px-6"
                        >
                          Cancel
                        </Button>
                        <Button
                          type="submit"
                          disabled={editWorksheetMutation.isPending}
                          className="px-6 bg-secondary hover:bg-secondary/90"
                        >
                          {editWorksheetMutation.isPending ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                              Updating...
                            </>
                          ) : (
                            "Update Worksheet"
                          )}
                        </Button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
