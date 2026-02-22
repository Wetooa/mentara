"use client";

import React, { useState } from 'react';
import { toast } from 'sonner';
import { Flag, AlertTriangle } from 'lucide-react';
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
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (reason: string, content?: string) => Promise<void>;
  type: 'post' | 'comment';
  contentPreview?: string;
  isLoading?: boolean;
}

const REPORT_REASONS = [
  {
    value: 'spam',
    label: 'Spam or Unwanted Content',
    description: 'Repetitive, promotional, or irrelevant content'
  },
  {
    value: 'harassment',
    label: 'Harassment or Bullying',
    description: 'Targeted harassment, threats, or bullying behavior'
  },
  {
    value: 'inappropriate',
    label: 'Inappropriate Content',
    description: 'Content that violates community guidelines'
  },
  {
    value: 'misinformation',
    label: 'Misinformation',
    description: 'False or misleading health information'
  },
  {
    value: 'hate_speech',
    label: 'Hate Speech',
    description: 'Content that promotes hatred based on identity'
  },
  {
    value: 'self_harm',
    label: 'Self-Harm or Dangerous Content',
    description: 'Content that could encourage harmful behavior'
  },
  {
    value: 'privacy',
    label: 'Privacy Violation',
    description: 'Sharing personal information without consent'
  },
  {
    value: 'other',
    label: 'Other',
    description: 'Other community guideline violations'
  }
];

export function ReportModal({
  isOpen,
  onClose,
  onSubmit,
  type,
  contentPreview,
  isLoading = false
}: ReportModalProps) {
  const [selectedReason, setSelectedReason] = useState<string>('');
  const [additionalDetails, setAdditionalDetails] = useState<string>('');

  const handleSubmit = async () => {
    if (!selectedReason) {
      toast.error('Please select a reason for reporting');
      return;
    }

    try {
      await onSubmit(selectedReason, additionalDetails.trim() || undefined);
      handleClose();
    } catch (error) {
      // Error handling is done in the parent component
      console.error('Report submission error:', error);
    }
  };

  const handleClose = () => {
    setSelectedReason('');
    setAdditionalDetails('');
    onClose();
  };

  const selectedReasonData = REPORT_REASONS.find(r => r.value === selectedReason);

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Flag className="h-5 w-5 text-red-500" />
            Report {type === 'post' ? 'Post' : 'Comment'}
          </DialogTitle>
          <DialogDescription>
            Help us maintain a safe and supportive community by reporting inappropriate content.
            {contentPreview && (
              <div className="mt-3 p-3 bg-muted rounded-md border-l-4 border-l-orange-500">
                <p className="text-sm text-muted-foreground font-medium mb-1">Content being reported:</p>
                <p className="text-sm line-clamp-3">
                  {contentPreview.length > 150 
                    ? `${contentPreview.substring(0, 150)}...` 
                    : contentPreview}
                </p>
              </div>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Reason Selection */}
          <div className="space-y-2">
            <Label htmlFor="reason">
              What's wrong with this {type}?
              <span className="text-red-500 ml-1">*</span>
            </Label>
            <Select value={selectedReason} onValueChange={setSelectedReason}>
              <SelectTrigger>
                <SelectValue placeholder="Select a reason" />
              </SelectTrigger>
              <SelectContent>
                {REPORT_REASONS.map((reason) => (
                  <SelectItem key={reason.value} value={reason.value}>
                    <div>
                      <div className="font-medium">{reason.label}</div>
                      <div className="text-xs text-muted-foreground">
                        {reason.description}
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            {selectedReasonData && (
              <div className="flex items-start gap-2 mt-2 p-2 bg-orange-50 border border-orange-200 rounded-md">
                <AlertTriangle className="h-4 w-4 text-orange-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm">
                  <p className="font-medium text-orange-800">{selectedReasonData.label}</p>
                  <p className="text-orange-700">{selectedReasonData.description}</p>
                </div>
              </div>
            )}
          </div>

          {/* Additional Details */}
          <div className="space-y-2">
            <Label htmlFor="details">
              Additional details (optional)
            </Label>
            <Textarea
              id="details"
              placeholder="Provide any additional context that might help our review team..."
              value={additionalDetails}
              onChange={(e) => setAdditionalDetails(e.target.value)}
              rows={3}
              maxLength={500}
            />
            <p className="text-xs text-muted-foreground">
              {additionalDetails.length}/500 characters
            </p>
          </div>

          {/* Privacy Notice */}
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
            <p className="text-sm text-blue-800">
              <strong>Privacy Notice:</strong> Your report will be reviewed by our moderation team. 
              Reports are confidential and the reported user will not know who submitted the report.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!selectedReason || isLoading}
            className="bg-red-600 hover:bg-red-700"
          >
            {isLoading ? 'Submitting...' : 'Submit Report'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default ReportModal;