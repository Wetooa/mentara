"use client";

import React, { useState } from "react";
import { 
  AlertTriangle, 
  Shield, 
  Flag, 
  MessageCircle, 
  File,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useApi } from "@/lib/api";

import { CrisisSupportModal } from "@/components/crisis/CrisisSupportModal";

interface ReportContentModalProps {
  isOpen: boolean;
  onClose: () => void;
  contentType: "post" | "comment" | "message" | "user" | "therapist";
  contentId: string;
  reportedUserId?: string;
  reportedUserName?: string;
}

const REPORT_CATEGORIES = {
  HARASSMENT: {
    value: "harassment",
    label: "Harassment or Bullying",
    description: "Abusive, threatening, or intimidating behavior",
    icon: <Shield className="h-4 w-4" />,
    severity: "high"
  },
  INAPPROPRIATE_CONTENT: {
    value: "inappropriate_content",
    label: "Inappropriate Content",
    description: "Sexual, violent, or disturbing content",
    icon: <AlertTriangle className="h-4 w-4" />,
    severity: "high"
  },
  SPAM: {
    value: "spam",
    label: "Spam or Unwanted Content",
    description: "Repetitive, promotional, or off-topic content",
    icon: <Flag className="h-4 w-4" />,
    severity: "medium"
  },
  MISINFORMATION: {
    value: "misinformation",
    label: "Misinformation",
    description: "False or misleading health information",
    icon: <AlertTriangle className="h-4 w-4" />,
    severity: "high"
  },
  PRIVACY_VIOLATION: {
    value: "privacy_violation", 
    label: "Privacy Violation",
    description: "Sharing personal information without consent",
    icon: <Shield className="h-4 w-4" />,
    severity: "high"
  },
  IMPERSONATION: {
    value: "impersonation",
    label: "Impersonation",
    description: "Pretending to be someone else",
    icon: <MessageCircle className="h-4 w-4" />,
    severity: "high"
  },
  OTHER: {
    value: "other",
    label: "Other",
    description: "Other policy violation or concern",
    icon: <Flag className="h-4 w-4" />,
    severity: "medium"
  }
} as const;

export function ReportContentModal({
  isOpen,
  onClose,
  contentType,
  contentId,
  reportedUserId,
  reportedUserName
}: ReportContentModalProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [description, setDescription] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const [showCrisisSupport, setShowCrisisSupport] = useState(false);

  const api = useApi();
  const queryClient = useQueryClient();

  const reportMutation = useMutation({
    mutationFn: async (reportData: {
      contentType: string;
      contentId: string;
      category: string;
      description: string;
      isAnonymous: boolean;
      reportedUserId?: string;
      attachments?: string[];
    }) => {
      // First upload any attachments
      const attachmentIds: string[] = [];
      
      for (const file of attachedFiles) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('type', 'report_evidence');
        
        const uploadResponse = await api.files.upload(formData);
        attachmentIds.push(uploadResponse.id);
      }

      // Then create the report
      return api.reports.create({
        ...reportData,
        attachments: attachmentIds
      });
    },
    onSuccess: () => {
      toast.success("Report submitted successfully. Our team will review it shortly.");
      queryClient.invalidateQueries({ queryKey: ['reports'] });
      onClose();
      resetForm();
    },
    onError: (error) => {
      toast.error("Failed to submit report. Please try again.");
      console.error("Report submission error:", error);
    }
  });

  const resetForm = () => {
    setSelectedCategory("");
    setDescription("");
    setIsAnonymous(false);
    setAttachedFiles([]);
  };

  const handleSubmit = () => {
    if (!selectedCategory) {
      toast.error("Please select a report category");
      return;
    }

    if (!description.trim()) {
      toast.error("Please provide a description of the issue");
      return;
    }

    reportMutation.mutate({
      contentType,
      contentId,
      category: selectedCategory,
      description: description.trim(),
      isAnonymous,
      reportedUserId,
    });
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const validFiles = files.filter(file => {
      // Allow images and documents up to 10MB
      const maxSize = 10 * 1024 * 1024; // 10MB
      const allowedTypes = [
        'image/jpeg', 'image/png', 'image/gif', 'image/webp',
        'application/pdf', 'text/plain', 'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ];
      
      if (file.size > maxSize) {
        toast.error(`File "${file.name}" is too large. Maximum size is 10MB.`);
        return false;
      }
      
      if (!allowedTypes.includes(file.type)) {
        toast.error(`File type "${file.type}" is not supported.`);
        return false;
      }
      
      return true;
    });

    setAttachedFiles(prev => [...prev, ...validFiles].slice(0, 5)); // Max 5 files
  };

  const removeFile = (index: number) => {
    setAttachedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const selectedCategoryData = selectedCategory ? 
    REPORT_CATEGORIES[selectedCategory as keyof typeof REPORT_CATEGORIES] : null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Flag className="h-5 w-5 text-red-500" />
            Report Content
          </DialogTitle>
          <DialogDescription>
            Help us maintain a safe community by reporting inappropriate content or behavior.
            {reportedUserName && (
              <span className="block mt-2 font-medium">
                Reporting content from: {reportedUserName}
              </span>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Report Category Selection */}
          <div className="space-y-2">
            <Label htmlFor="category">What type of issue are you reporting?</Label>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {Object.values(REPORT_CATEGORIES).map((category) => (
                  <SelectItem key={category.value} value={category.value}>
                    <div className="flex items-center gap-2">
                      {category.icon}
                      <div>
                        <div className="font-medium">{category.label}</div>
                        <div className="text-xs text-muted-foreground">
                          {category.description}
                        </div>
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            {selectedCategoryData && (
              <div className="flex items-center gap-2 mt-2">
                <Badge 
                  variant={selectedCategoryData.severity === "high" ? "destructive" : "secondary"}
                >
                  {selectedCategoryData.severity === "high" ? "High Priority" : "Medium Priority"}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  {selectedCategoryData.description}
                </span>
              </div>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">
              Please describe the issue in detail
              <span className="text-red-500 ml-1">*</span>
            </Label>
            <Textarea
              id="description"
              placeholder="Provide specific details about what happened, when it occurred, and any other relevant information..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              maxLength={1000}
            />
            <div className="text-xs text-muted-foreground text-right">
              {description.length}/1000 characters
            </div>
          </div>

          {/* File Attachments */}
          <div className="space-y-2">
            <Label>Attach Evidence (Optional)</Label>
            <div className="space-y-2">
              <input
                type="file"
                id="file-upload"
                multiple
                accept="image/*,.pdf,.txt,.doc,.docx"
                onChange={handleFileUpload}
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => document.getElementById('file-upload')?.click()}
                disabled={attachedFiles.length >= 5}
                className="w-full"
              >
                <File className="h-4 w-4 mr-2" />
                Add Files (Images, PDFs, Documents)
              </Button>
              <div className="text-xs text-muted-foreground">
                Max 5 files, 10MB each. Supported: Images, PDF, DOC, TXT
              </div>
            </div>

            {/* Attached Files Display */}
            {attachedFiles.length > 0 && (
              <div className="space-y-2">
                {attachedFiles.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                    <div className="flex items-center gap-2">
                      <File className="h-4 w-4" />
                      <span className="text-sm truncate">{file.name}</span>
                      <Badge variant="outline" className="text-xs">
                        {(file.size / 1024 / 1024).toFixed(1)}MB
                      </Badge>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Anonymous Reporting Option */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="anonymous"
              checked={isAnonymous}
              onCheckedChange={(checked) => setIsAnonymous(checked as boolean)}
            />
            <Label htmlFor="anonymous" className="text-sm">
              Submit this report anonymously
            </Label>
          </div>
          {isAnonymous && (
            <div className="text-xs text-muted-foreground ml-6">
              Anonymous reports help protect your privacy but may limit our ability to follow up with you.
            </div>
          )}

          {/* Safety Notice */}
          {selectedCategoryData?.severity === "high" && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5" />
                <div className="text-sm">
                  <div className="font-medium text-red-800">Immediate Safety Concern?</div>
                  <div className="text-red-700 mt-1">
                    If you&apos;re in immediate danger, please contact emergency services (911) or use our 
                    <Button 
                      variant="link" 
                      className="p-0 h-auto text-red-700 underline ml-1"
                      onClick={() => setShowCrisisSupport(true)}
                    >
                      crisis support resources
                    </Button>.
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={reportMutation.isPending}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={reportMutation.isPending || !selectedCategory || !description.trim()}
          >
            {reportMutation.isPending ? "Submitting..." : "Submit Report"}
          </Button>
        </DialogFooter>
      </DialogContent>

      {/* Crisis Support Modal */}
      <CrisisSupportModal
        isOpen={showCrisisSupport}
        onClose={() => setShowCrisisSupport(false)}
        emergencyType={selectedCategory === "harassment" ? "general" : "general"}
      />
    </Dialog>
  );
}