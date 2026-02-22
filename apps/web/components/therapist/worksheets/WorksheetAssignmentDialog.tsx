'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { FileText, Plus } from 'lucide-react';
import { WorksheetCreationForm } from './WorksheetCreationForm';

interface Client {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  profilePicture?: string;
  assessmentInfo?: {
    hasAssessment: boolean;
    assessmentType?: string;
  };
}

interface WorksheetAssignmentDialogProps {
  client: Client;
  trigger?: React.ReactNode;
  onSuccess?: () => void;
}

export function WorksheetAssignmentDialog({ 
  client, 
  trigger,
  onSuccess 
}: WorksheetAssignmentDialogProps) {
  const [open, setOpen] = useState(false);

  const handleSuccess = () => {
    setOpen(false);
    onSuccess?.();
  };

  const handleCancel = () => {
    setOpen(false);
  };

  const defaultTrigger = (
    <Button size="sm">
      <FileText className="h-4 w-4 mr-1" />
      Assign Worksheet
    </Button>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="sr-only">
          <DialogTitle>Assign Worksheet to {client.firstName} {client.lastName}</DialogTitle>
          <DialogDescription>
            Create and assign a new worksheet to your client
          </DialogDescription>
        </DialogHeader>
        <WorksheetCreationForm
          client={client}
          onSuccess={handleSuccess}
          onCancel={handleCancel}
        />
      </DialogContent>
    </Dialog>
  );
}

// Quick Action Button for use in lists
interface QuickAssignButtonProps {
  client: Client;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'default' | 'lg';
  onSuccess?: () => void;
}

export function QuickAssignButton({ 
  client, 
  variant = 'outline',
  size = 'sm',
  onSuccess 
}: QuickAssignButtonProps) {
  return (
    <WorksheetAssignmentDialog
      client={client}
      onSuccess={onSuccess}
      trigger={
        <Button variant={variant} size={size}>
          <Plus className="h-4 w-4 mr-1" />
          Assign
        </Button>
      }
    />
  );
}