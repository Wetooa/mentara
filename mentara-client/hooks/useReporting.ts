"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useApi } from "@/lib/api";
import { queryKeys } from "@/lib/queryKeys";
import { toast } from "sonner";

export interface CreateReportData {
  contentType: "post" | "comment" | "message" | "user" | "therapist";
  contentId: string;
  category: string;
  description: string;
  isAnonymous: boolean;
  reportedUserId?: string;
  attachments?: string[];
}

export function useReporting() {
  const api = useApi();
  const queryClient = useQueryClient();

  const createReportMutation = useMutation({
    mutationFn: async (data: CreateReportData) => {
      return api.reports.create(data);
    },
    onSuccess: () => {
      toast.success("Report submitted successfully. Our team will review it shortly.");
      queryClient.invalidateQueries({ queryKey: queryKeys.reports.all });
    },
    onError: (error) => {
      console.error("Report submission error:", error);
      toast.error("Failed to submit report. Please try again.");
    },
  });

  const uploadEvidenceMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', 'report_evidence');
      
      return api.files.upload(formData);
    },
    onError: (error) => {
      console.error("Evidence upload error:", error);
      toast.error("Failed to upload evidence file.");
    },
  });

  return {
    createReport: createReportMutation.mutate,
    uploadEvidence: uploadEvidenceMutation.mutate,
    isCreatingReport: createReportMutation.isPending,
    isUploadingEvidence: uploadEvidenceMutation.isPending,
  };
}