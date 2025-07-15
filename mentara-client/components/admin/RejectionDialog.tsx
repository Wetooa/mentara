'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { 
  XCircle,
  AlertTriangle,
  FileX,
  // Shield,
  Info,
  Mail
} from 'lucide-react';

interface RejectionDialogProps {
  open: boolean;
  onClose: () => void;
  onReject: (data: { rejectionReason: string; customMessage?: string; notifyTherapist?: boolean; allowReapplication?: boolean }) => void;
  therapistName: string;
}

const REJECTION_REASONS = [
  {
    value: 'incomplete_documentation',
    label: 'Incomplete Documentation',
    description: 'Missing required documents or information'
  },
  {
    value: 'invalid_license',
    label: 'Invalid or Expired License',
    description: 'License verification failed or expired'
  },
  {
    value: 'insufficient_experience',
    label: 'Insufficient Experience',
    description: 'Does not meet minimum experience requirements'
  },
  {
    value: 'policy_violation',
    label: 'Policy Violation',
    description: 'Application violates platform policies'
  },
  {
    value: 'quality_standards',
    label: 'Quality Standards Not Met',
    description: 'Application does not meet quality requirements'
  },
  {
    value: 'verification_failed',
    label: 'Background Check Failed',
    description: 'Unable to verify credentials or background'
  },
  {
    value: 'other',
    label: 'Other',
    description: 'Custom reason (please specify below)'
  }
];

export function RejectionDialog({
  open,
  onClose,
  onReject,
  therapistName,
}: RejectionDialogProps) {
  const [selectedReason, setSelectedReason] = useState('');
  const [customMessage, setCustomMessage] = useState('');
  const [notifyTherapist, setNotifyTherapist] = useState(true);
  const [allowReapplication, setAllowReapplication] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleReject = async () => {
    if (!selectedReason) return;
    
    setIsSubmitting(true);
    try {
      await onReject({
        rejectionReason: selectedReason,
        customMessage: customMessage.trim() || undefined,
        notifyTherapist,
        allowReapplication,
      });
      // Reset form
      setSelectedReason('');
      setCustomMessage('');
      setNotifyTherapist(true);
      setAllowReapplication(true);
    } catch (error) {
      console.error('Rejection failed:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setSelectedReason('');
      setCustomMessage('');
      setNotifyTherapist(true);
      setAllowReapplication(true);
      onClose();
    }
  };

  // const selectedReasonData = REJECTION_REASONS.find(r => r.value === selectedReason);
  const isFormValid = selectedReason && (selectedReason !== 'other' || customMessage.trim());

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <XCircle className="h-5 w-5 text-red-600" />
            Reject Therapist Application
          </DialogTitle>
          <DialogDescription>
            You are about to reject the therapist application for <strong>{therapistName}</strong>.
            Please provide a reason for the rejection.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-6">
          {/* Warning */}
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-4">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-medium text-red-800 mb-1">Rejection Impact</h4>
                  <ul className="text-sm text-red-700 space-y-1">
                    <li>• Therapist will be notified of rejection</li>
                    <li>• Application will be archived</li>
                    <li>• Access to platform will be denied</li>
                    <li>• Reapplication may be allowed based on settings</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Rejection Reason */}
          <div className="space-y-3">
            <Label className="text-base font-medium">Reason for Rejection *</Label>
            <RadioGroup value={selectedReason} onValueChange={setSelectedReason}>
              {REJECTION_REASONS.map((reason) => (
                <div key={reason.value} className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-muted/50">
                  <RadioGroupItem value={reason.value} id={reason.value} className="mt-1" />
                  <div className="space-y-1 flex-1">
                    <Label htmlFor={reason.value} className="font-medium cursor-pointer">
                      {reason.label}
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      {reason.description}
                    </p>
                  </div>
                </div>
              ))}
            </RadioGroup>
          </div>

          {/* Custom Message */}
          <div className="space-y-2">
            <Label htmlFor="custom-message">
              {selectedReason === 'other' ? (
                <>Custom Reason <span className="text-red-500">*</span></>
              ) : (
                <>Additional Message <span className="text-muted-foreground">(Optional)</span></>
              )}
            </Label>
            <Textarea
              id="custom-message"
              placeholder={
                selectedReason === 'other' 
                  ? "Please specify the reason for rejection..."
                  : "Add additional context or guidance for the therapist..."
              }
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              rows={3}
              maxLength={1000}
              disabled={isSubmitting}
            />
            <p className="text-xs text-muted-foreground">
              {customMessage.length}/1000 characters
            </p>
          </div>

          {/* Options */}
          <div className="space-y-4">
            {/* Notification */}
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="notify-therapist-reject"
                  checked={notifyTherapist}
                  onChange={(e) => setNotifyTherapist(e.target.checked)}
                  disabled={isSubmitting}
                  className="rounded border-gray-300"
                />
                <Label htmlFor="notify-therapist-reject" className="text-sm">
                  Send rejection notification email
                </Label>
              </div>
              
              {notifyTherapist && (
                <div className="ml-6 p-3 bg-blue-50 border border-blue-200 rounded-md">
                  <p className="text-sm text-blue-800 flex items-start gap-2">
                    <Mail className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    The therapist will receive an email explaining the rejection with the reason and any additional message you provided.
                  </p>
                </div>
              )}
            </div>

            {/* Reapplication */}
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="allow-reapplication"
                  checked={allowReapplication}
                  onChange={(e) => setAllowReapplication(e.target.checked)}
                  disabled={isSubmitting}
                  className="rounded border-gray-300"
                />
                <Label htmlFor="allow-reapplication" className="text-sm">
                  Allow future reapplication
                </Label>
              </div>
              
              <div className="ml-6 p-3 bg-gray-50 border border-gray-200 rounded-md">
                <p className="text-sm text-gray-700 flex items-start gap-2">
                  <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  {allowReapplication 
                    ? "The therapist can submit a new application after addressing the issues mentioned."
                    : "The therapist will be permanently blocked from reapplying to the platform."
                  }
                </p>
              </div>
            </div>
          </div>

          {/* Final Warning */}
          <Card className="border-yellow-200 bg-yellow-50">
            <CardContent className="p-4">
              <div className="flex items-start gap-2">
                <FileX className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-medium text-yellow-800 mb-1">Before Rejecting</h4>
                  <p className="text-sm text-yellow-700">
                    Consider if this application could be approved with minor corrections. 
                    Rejection should be used for applications that cannot meet platform standards.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={handleClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button 
            variant="destructive"
            onClick={handleReject}
            disabled={!isFormValid || isSubmitting}
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                Rejecting...
              </>
            ) : (
              <>
                <XCircle className="h-4 w-4 mr-2" />
                Reject Application
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}