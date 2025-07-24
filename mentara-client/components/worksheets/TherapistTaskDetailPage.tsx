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

  const handleEditWorksheet = (worksheet: Task) => {
    setEditingWorksheet(worksheet);
    setFilesToRemove([]);
    setNewFiles([]);
  };

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

        <div className="flex items-center gap-3">
          {canEdit && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleEditWorksheet(task)}
              className="text-blue-600 border-blue-200 hover:bg-blue-50"
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit Worksheet
            </Button>
          )}
          {turnedInDate && (
            <div className="flex items-center text-gray-600">
              <CheckCircle className="mr-2 h-5 w-5 text-[#436B00]" />
              {turnedInDate}
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-3xl mx-auto">
          {/* Task Title */}
          <div className="mb-4">
            <h1 className="text-2xl font-semibold">{task.title}</h1>
            <p className="text-gray-600 mt-1">Patient: {task.patientName}</p>
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

          {/* Patient's Work */}
          <div className="mb-6">
            <h2 className="text-lg font-medium mb-2">Patient&apos;s work</h2>
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
                <p className="mb-2 text-gray-500">No work submitted yet</p>
              </div>
            )}
          </div>

          {/* Review Actions */}
          {task.status === "completed" && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-medium">Review Worksheet</h2>
                <button
                  onClick={handleMarkAsReviewed}
                  disabled={markAsReviewedMutation.isPending}
                  className="flex items-center px-4 py-2 bg-[#436B00] text-white rounded-md hover:bg-[#129316] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
                </button>
              </div>
              <p className="text-sm text-gray-600 bg-blue-50 p-3 rounded-md border border-blue-200">
                Click &quot;Mark as Reviewed&quot; to provide feedback and
                complete the review process.
              </p>
            </div>
          )}

          {/* Existing Feedback (if worksheet was already reviewed) */}
          {task.status === "reviewed" && task.feedback && (
            <div className="mb-6">
              <h2 className="text-lg font-medium mb-2">Your feedback</h2>
              <div className="bg-green-50 p-4 rounded-md border border-green-200">
                <p className="text-gray-700 whitespace-pre-wrap">{task.feedback}</p>
              </div>
            </div>
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
      <Sheet open={!!editingWorksheet} onOpenChange={open => !open && setEditingWorksheet(null)}>
        <SheetContent side="right" className="w-full max-w-2xl sm:max-w-xl p-0 gap-0 overflow-hidden flex flex-col">
          {editingWorksheet && (
            <>
              <SheetHeader className="px-6 py-5 border-b bg-gradient-to-br from-blue-50/80 via-indigo-50/60 to-purple-50/80 backdrop-blur-sm">
                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <SheetTitle className="flex items-center gap-3 text-xl font-semibold text-gray-900">
                      <div className="p-2 rounded-lg bg-blue-100/80 shadow-sm">
                        <Edit className="h-5 w-5 text-blue-600" />
                      </div>
                      Edit Worksheet
                    </SheetTitle>
                  </div>
                  <SheetDescription className="text-sm text-gray-600 font-medium">
                    Update the worksheet details, instructions, and reference materials for your client.
                  </SheetDescription>
                </div>
              </SheetHeader>
              
              <div className="flex-1 min-h-0 bg-gradient-to-b from-gray-50/30 to-white">
                <div className="h-full overflow-y-auto">
                  <div className="p-6 space-y-6">
                    <form 
                      onSubmit={(e) => {
                        e.preventDefault();
                        const formData = new FormData(e.currentTarget);
                        const dueDateValue = formData.get('dueDate') as string;
                        
                        const updateData = {
                          title: formData.get('title') as string,
                          instructions: formData.get('instructions') as string,
                          dueDate: dueDateValue ? new Date(dueDateValue).toISOString() : undefined,
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
                          <div className="p-2 rounded-lg bg-blue-50">
                            <FileText className="h-4 w-4 text-blue-600" />
                          </div>
                          <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>
                        </div>
                        
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="title" className="text-sm font-medium text-gray-700">
                              Worksheet Title
                            </Label>
                            <Input
                              id="title"
                              name="title"
                              defaultValue={editingWorksheet.title}
                              placeholder="Enter worksheet title..."
                              className="h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500/20"
                              required
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="instructions" className="text-sm font-medium text-gray-700">
                              Instructions
                            </Label>
                            <Textarea
                              id="instructions"
                              name="instructions"
                              defaultValue={editingWorksheet.instructions || ''}
                              placeholder="Provide detailed instructions for your client..."
                              rows={4}
                              className="border-gray-300 focus:border-blue-500 focus:ring-blue-500/20 resize-none"
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="dueDate" className="text-sm font-medium text-gray-700">
                              Due Date & Time
                            </Label>
                            <Input
                              id="dueDate"
                              name="dueDate"
                              type="datetime-local"
                              defaultValue={editingWorksheet.date ? new Date(editingWorksheet.date).toISOString().slice(0, 16) : ''}
                              className="h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500/20"
                            />
                          </div>
                        </div>
                      </div>

                      {/* File Management Section */}
                      <div className="bg-white rounded-xl border border-gray-200/60 shadow-sm p-6">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="p-2 rounded-lg bg-purple-50">
                            <FileText className="h-4 w-4 text-purple-600" />
                          </div>
                          <h3 className="text-lg font-semibold text-gray-900">Reference Files</h3>
                        </div>
                        
                        {/* Existing Files */}
                        {editingWorksheet.materials && editingWorksheet.materials.length > 0 && (
                          <div className="space-y-3 mb-6">
                            <Label className="text-sm font-medium text-gray-700">Current Files</Label>
                            <div className="space-y-2">
                              {editingWorksheet.materials.map((material, index) => {
                                const fileName = material.filename;
                                const fileUrl = material.url || `file-${index}`;
                                const isMarkedForRemoval = filesToRemove.includes(fileUrl);
                                
                                return (
                                  <div
                                    key={fileUrl}
                                    className={`flex items-center justify-between p-4 border rounded-lg transition-all duration-200 ${
                                      isMarkedForRemoval 
                                        ? 'bg-red-50 border-red-200 opacity-60' 
                                        : 'bg-gray-50 border-gray-200 hover:border-gray-300'
                                    }`}
                                  >
                                    <div className="flex items-center gap-3">
                                      <FileText className="h-4 w-4 text-gray-500" />
                                      <span className={`text-sm font-medium ${isMarkedForRemoval ? 'line-through text-gray-500' : 'text-gray-700'}`}>
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
                                          onClick={() => handleRemoveExistingFile(fileUrl)}
                                          className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                                        >
                                          <Trash2 className="h-3 w-3" />
                                        </Button>
                                      ) : (
                                        <Button
                                          type="button"
                                          variant="outline"
                                          size="sm"
                                          onClick={() => handleRestoreExistingFile(fileUrl)}
                                          className="text-green-600 hover:text-green-700 hover:bg-green-50 border-green-200"
                                        >
                                          Restore
                                        </Button>
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {/* New Files */}
                        {newFiles.length > 0 && (
                          <div className="space-y-3 mb-6">
                            <Label className="text-sm font-medium text-gray-700">New Files to Upload</Label>
                            <div className="space-y-2">
                              {newFiles.map((file, index) => (
                                <div
                                  key={index}
                                  className="flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-lg"
                                >
                                  <div className="flex items-center gap-3">
                                    <FileText className="h-4 w-4 text-blue-500" />
                                    <span className="text-sm font-medium text-blue-700">{file.name}</span>
                                    <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded-full font-medium">
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
                          <Label className="text-sm font-medium text-gray-700 mb-2 block">Add Files</Label>
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
                            className="flex items-center justify-center w-full p-6 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-400 hover:bg-blue-50/50 transition-all duration-200 group"
                          >
                            <div className="text-center">
                              <Plus className="h-8 w-8 text-gray-400 mx-auto mb-3 group-hover:text-blue-500 transition-colors" />
                              <span className="text-sm font-medium text-gray-600 group-hover:text-blue-600 transition-colors">
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
                          className="px-6 bg-blue-600 hover:bg-blue-700"
                        >
                          {editWorksheetMutation.isPending ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                              Updating...
                            </>
                          ) : (
                            'Update Worksheet'
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