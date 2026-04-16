"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Send,
  Save,
  Clock,
  CheckCircle,
  AlertCircle,
  FileText,
  Calendar,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import {
  FileAttachment,
  AttachedFile,
} from "@/components/attachments/FileAttachment";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface WorksheetQuestion {
  id: string;
  type: "text" | "multiple_choice" | "scale" | "file_upload";
  question: string;
  required: boolean;
  options?: string[];
  minLength?: number;
  maxLength?: number;
  scaleMin?: number;
  scaleMax?: number;
  allowedFileTypes?: string[];
}

interface WorksheetData {
  id: string;
  title: string;
  description: string;
  questions: WorksheetQuestion[];
  dueDate?: string;
  submittedAt?: string;
  status: "not_started" | "in_progress" | "submitted" | "overdue" | "reviewed";
  therapistName: string;
  instructions?: string;
}

interface WorksheetResponse {
  questionId: string;
  type: string;
  textResponse?: string;
  numberResponse?: number;
  selectedOptions?: string[];
  attachments?: string[];
}

interface WorksheetSubmissionProps {
  worksheet: WorksheetData;
  existingResponses?: WorksheetResponse[];
  onSubmit: (
    responses: WorksheetResponse[],
    attachments: AttachedFile[]
  ) => Promise<void>;
  onSaveDraft: (
    responses: WorksheetResponse[],
    attachments: AttachedFile[]
  ) => Promise<void>;
  disabled?: boolean;
  className?: string;
}

export function WorksheetSubmission({
  worksheet,
  existingResponses = [],
  onSubmit,
  onSaveDraft,
  disabled = false,
  className,
}: WorksheetSubmissionProps) {
  const [responses, setResponses] = useState<Record<string, WorksheetResponse>>(
    existingResponses.reduce(
      (acc, response) => {
        acc[response.questionId] = response;
        return acc;
      },
      {} as Record<string, WorksheetResponse>
    )
  );

  const [attachments, setAttachments] = useState<
    Record<string, AttachedFile[]>
  >({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const updateResponse = (
    questionId: string,
    update: Partial<WorksheetResponse>
  ) => {
    setResponses((prev) => ({
      ...prev,
      [questionId]: {
        ...prev[questionId],
        questionId,
        type:
          worksheet.questions.find((q) => q.id === questionId)?.type || "text",
        ...update,
      },
    }));
  };

  const updateAttachments = (questionId: string, files: AttachedFile[]) => {
    setAttachments((prev) => ({
      ...prev,
      [questionId]: files,
    }));

    // Update response with attachment IDs
    const uploadedIds = files
      .filter((f) => f.isUploaded && f.id)
      .map((f) => f.id!);
    updateResponse(questionId, { attachments: uploadedIds });
  };

  const validateResponses = (): boolean => {
    for (const question of worksheet.questions) {
      if (!question.required) continue;

      const response = responses[question.id];

      if (!response) {
        toast.error(`Please answer: ${question.question}`);
        return false;
      }

      switch (question.type) {
        case "text":
          if (!response.textResponse?.trim()) {
            toast.error(`Please answer: ${question.question}`);
            return false;
          }
          if (
            question.minLength &&
            response.textResponse.length < question.minLength
          ) {
            toast.error(`Answer too short for: ${question.question}`);
            return false;
          }
          break;

        case "multiple_choice":
          if (!response.selectedOptions?.length) {
            toast.error(`Please select an option for: ${question.question}`);
            return false;
          }
          break;

        case "scale":
          if (response.numberResponse === undefined) {
            toast.error(`Please rate: ${question.question}`);
            return false;
          }
          break;

        case "file_upload":
          if (!response.attachments?.length) {
            toast.error(`Please upload a file for: ${question.question}`);
            return false;
          }
          break;
      }
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateResponses()) return;

    setIsSubmitting(true);
    try {
      const responseArray = Object.values(responses);
      const allAttachments = Object.values(attachments).flat();
      await onSubmit(responseArray, allAttachments);
      toast.success("Worksheet submitted successfully!");
    } catch {
      toast.error("Failed to submit worksheet");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveDraft = async () => {
    setIsSaving(true);
    try {
      const responseArray = Object.values(responses);
      const allAttachments = Object.values(attachments).flat();
      await onSaveDraft(responseArray, allAttachments);
      toast.success("Draft saved successfully!");
    } catch {
      toast.error("Failed to save draft");
    } finally {
      setIsSaving(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "submitted":
        return "bg-green-100 text-green-800";
      case "reviewed":
        return "bg-purple-100 text-purple-800";
      case "in_progress":
        return "bg-blue-100 text-blue-800";
      case "overdue":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "submitted":
        return <CheckCircle className="h-4 w-4" />;
      case "reviewed":
        return <CheckCircle className="h-4 w-4" />;
      case "in_progress":
        return <Clock className="h-4 w-4" />;
      case "overdue":
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const isOverdue =
    worksheet.dueDate && new Date() > new Date(worksheet.dueDate);
  const canEdit =
    worksheet.status !== "submitted" &&
    worksheet.status !== "reviewed" &&
    !disabled;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn("max-w-4xl mx-auto space-y-6", className)}
    >
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <CardTitle className="text-2xl">{worksheet.title}</CardTitle>
              <p className="text-muted-foreground">{worksheet.description}</p>
            </div>
            <Badge className={getStatusColor(worksheet.status)}>
              {getStatusIcon(worksheet.status)}
              <span className="ml-1 capitalize">
                {worksheet.status.replace("_", " ")}
              </span>
            </Badge>
          </div>

          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <User className="h-4 w-4" />
              <span>Assigned by {worksheet.therapistName}</span>
            </div>

            {worksheet.dueDate && (
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>
                  Due {format(new Date(worksheet.dueDate), "MMM dd, yyyy")}
                </span>
                {isOverdue && (
                  <Badge variant="destructive" className="ml-2">
                    Overdue
                  </Badge>
                )}
              </div>
            )}

            {worksheet.submittedAt && (
              <div className="flex items-center gap-1">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>
                  Submitted{" "}
                  {format(new Date(worksheet.submittedAt), "MMM dd, yyyy")}
                </span>
              </div>
            )}
          </div>
        </CardHeader>

        {worksheet.instructions && (
          <CardContent>
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{worksheet.instructions}</AlertDescription>
            </Alert>
          </CardContent>
        )}
      </Card>

      {/* Questions */}
      <div className="space-y-6">
        {worksheet.questions.map((question, index) => (
          <Card key={question.id}>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <span className="bg-primary text-primary-foreground rounded-full h-6 w-6 flex items-center justify-center text-sm">
                  {index + 1}
                </span>
                {question.question}
                {question.required && <span className="text-red-500">*</span>}
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Text Input */}
              {question.type === "text" && (
                <div className="space-y-2">
                  <Textarea
                    value={responses[question.id]?.textResponse || ""}
                    onChange={(e) =>
                      updateResponse(question.id, {
                        textResponse: e.target.value,
                      })
                    }
                    placeholder="Enter your response..."
                    disabled={!canEdit}
                    maxLength={question.maxLength}
                    rows={4}
                    className="resize-none"
                  />
                  {question.maxLength && (
                    <div className="text-xs text-muted-foreground text-right">
                      {responses[question.id]?.textResponse?.length || 0}/
                      {question.maxLength}
                    </div>
                  )}
                  {question.minLength && (
                    <div className="text-xs text-muted-foreground">
                      Minimum {question.minLength} characters required
                    </div>
                  )}
                </div>
              )}

              {/* Multiple Choice */}
              {question.type === "multiple_choice" && question.options && (
                <div className="space-y-2">
                  {question.options.map((option, optionIndex) => (
                    <label
                      key={optionIndex}
                      className="flex items-center space-x-2 cursor-pointer"
                    >
                      <input
                        type="radio"
                        name={`question-${question.id}`}
                        value={option}
                        checked={responses[
                          question.id
                        ]?.selectedOptions?.includes(option)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            updateResponse(question.id, {
                              selectedOptions: [option],
                            });
                          }
                        }}
                        disabled={!canEdit}
                        className="text-primary"
                      />
                      <span>{option}</span>
                    </label>
                  ))}
                </div>
              )}

              {/* Scale Rating */}
              {question.type === "scale" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>{question.scaleMin || 1}</span>
                    <span>{question.scaleMax || 10}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {Array.from(
                      {
                        length:
                          (question.scaleMax || 10) -
                          (question.scaleMin || 1) +
                          1,
                      },
                      (_, i) => i + (question.scaleMin || 1)
                    ).map((value) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() =>
                          updateResponse(question.id, { numberResponse: value })
                        }
                        disabled={!canEdit}
                        className={cn(
                          "h-10 w-10 rounded-full border-2 text-sm font-medium transition-colors",
                          responses[question.id]?.numberResponse === value
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-border hover:border-primary",
                          !canEdit && "opacity-50 cursor-not-allowed"
                        )}
                      >
                        {value}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* File Upload */}
              {question.type === "file_upload" && (
                <FileAttachment
                  attachedFiles={attachments[question.id] || []}
                  onFilesChange={(files) =>
                    updateAttachments(question.id, files)
                  }
                  maxFiles={3}
                  maxFileSize={10}
                  allowedTypes={
                    question.allowedFileTypes || [
                      "image/*",
                      "application/pdf",
                      "text/*",
                    ]
                  }
                  uploadType="worksheet"
                  disabled={!canEdit}
                  compact={true}
                />
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Actions */}
      {canEdit && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                {Object.keys(responses).length} of{" "}
                {worksheet.questions.filter((q) => q.required).length} required
                questions answered
              </div>

              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  onClick={handleSaveDraft}
                  disabled={isSaving || isSubmitting}
                >
                  <Save className="h-4 w-4 mr-2" />
                  {isSaving ? "Saving..." : "Save Draft"}
                </Button>

                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting || isSaving}
                >
                  <Send className="h-4 w-4 mr-2" />
                  {isSubmitting ? "Submitting..." : "Submit Worksheet"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {worksheet.status === "submitted" && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            This worksheet has been submitted successfully. Your therapist will
            review your responses.
          </AlertDescription>
        </Alert>
      )}

      {worksheet.status === "reviewed" && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            This worksheet has been reviewed by your therapist. No further
            changes can be made.
          </AlertDescription>
        </Alert>
      )}
    </motion.div>
  );
}
