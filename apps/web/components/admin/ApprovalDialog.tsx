'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
// Removed unused import: Badge
import { 
  CheckCircle,
  User,
  Shield,
  Mail,
  Calendar,
  AlertCircle
} from 'lucide-react';

interface ApprovalDialogProps {
  open: boolean;
  onClose: () => void;
  onApprove: (data: { approvalMessage?: string; notifyTherapist?: boolean }) => void;
  therapistName: string;
}

export function ApprovalDialog({
  open,
  onClose,
  onApprove,
  therapistName,
}: ApprovalDialogProps) {
  const [approvalMessage, setApprovalMessage] = useState('');
  const [notifyTherapist, setNotifyTherapist] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleApprove = async () => {
    setIsSubmitting(true);
    try {
      await onApprove({
        approvalMessage: approvalMessage.trim() || undefined,
        notifyTherapist,
      });
      // Reset form
      setApprovalMessage('');
      setNotifyTherapist(true);
    } catch (error) {
      console.error('Approval failed:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setApprovalMessage('');
      setNotifyTherapist(true);
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Approve Therapist Application
          </DialogTitle>
          <DialogDescription>
            You are about to approve the therapist application for <strong>{therapistName}</strong>.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-4">
          {/* Approval Benefits Info */}
          <Card className="border-green-200 bg-green-50">
            <CardContent className="p-4">
              <h4 className="font-medium text-green-800 mb-2 flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Approval Benefits
              </h4>
              <ul className="text-sm text-green-700 space-y-1">
                <li className="flex items-center gap-2">
                  <User className="h-3 w-3" />
                  Access to therapist dashboard and tools
                </li>
                <li className="flex items-center gap-2">
                  <Mail className="h-3 w-3" />
                  Ability to receive and respond to client requests
                </li>
                <li className="flex items-center gap-2">
                  <Calendar className="h-3 w-3" />
                  Profile visibility in therapist recommendations
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Optional Approval Message */}
          <div className="space-y-2">
            <Label htmlFor="approval-message">
              Approval Message <span className="text-muted-foreground">(Optional)</span>
            </Label>
            <Textarea
              id="approval-message"
              placeholder="Add a personalized welcome message for the therapist..."
              value={approvalMessage}
              onChange={(e) => setApprovalMessage(e.target.value)}
              rows={3}
              maxLength={500}
              disabled={isSubmitting}
            />
            <p className="text-xs text-muted-foreground">
              {approvalMessage.length}/500 characters
            </p>
          </div>

          {/* Notification Settings */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="notify-therapist"
                checked={notifyTherapist}
                onChange={(e) => setNotifyTherapist(e.target.checked)}
                disabled={isSubmitting}
                className="rounded border-gray-300"
              />
              <Label htmlFor="notify-therapist" className="text-sm">
                Send approval notification email
              </Label>
            </div>
            
            {notifyTherapist && (
              <div className="ml-6 p-3 bg-blue-50 border border-blue-200 rounded-md">
                <p className="text-sm text-blue-800 flex items-start gap-2">
                  <Mail className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  The therapist will receive an email with login instructions and dashboard access information.
                  {approvalMessage && " Your custom message will be included."}
                </p>
              </div>
            )}
          </div>

          {/* Warning */}
          <div className="flex items-start gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
            <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-yellow-800">
              <p className="font-medium">Important:</p>
              <p>Once approved, the therapist will have immediate access to the platform. Ensure all credentials and documents have been properly verified.</p>
            </div>
          </div>
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
            onClick={handleApprove}
            disabled={isSubmitting}
            className="bg-green-600 hover:bg-green-700"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                Approving...
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                Approve Application
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}