"use client";

import React, { useState } from "react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { useUpdateTherapistApplicationStatus } from "@/hooks/useTherapistApplications";
import type { TherapistApplication } from "@/lib/api/services/therapists";

interface TherapistApplicationsTableProps {
  applications: TherapistApplication[];
  onStatusChange?: (id: string, status: "approved" | "rejected" | "pending") => void;
}

export function TherapistApplicationsTable({
  applications,
  onStatusChange,
}: TherapistApplicationsTableProps) {
  const router = useRouter();
  const [confirmationOpen, setConfirmationOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<{
    id: string;
    status: "approved" | "rejected" | "pending";
  } | null>(null);
  
  // Use React Query mutation for updating application status
  const updateStatusMutation = useUpdateTherapistApplicationStatus();

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "MMM dd, yyyy");
    } catch {
      return dateString;
    }
  };

  const handleStatusChange = (
    id: string,
    status: "approved" | "rejected" | "pending"
  ) => {
    setPendingAction({ id, status });
    setConfirmationOpen(true);
  };

  const handleViewApplication = (id: string) => {
    router.push(`/admin/therapist-applications/${id}`);
  };

  const confirmStatusChange = () => {
    if (pendingAction) {
      updateStatusMutation.mutate(
        {
          applicationId: pendingAction.id,
          data: { 
            status: pendingAction.status,
            reviewedBy: 'Admin', // This could be dynamic based on current user
            notes: `Status changed to ${pendingAction.status}`,
          },
        },
        {
          onSuccess: () => {
            // Call the parent component's callback if provided
            if (onStatusChange && pendingAction) {
              onStatusChange(pendingAction.id, pendingAction.status);
            }
            setConfirmationOpen(false);
            setPendingAction(null);
          },
          onError: () => {
            // Error is already handled in the hook with toast
            setConfirmationOpen(false);
            setPendingAction(null);
          },
        }
      );
    }
  };

  return (
    <>
      <Table>
        <TableHeader className="bg-gray-50">
          <TableRow>
            <TableHead className="w-[80px]">Details</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Provider Type</TableHead>
            <TableHead>Submission Date</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {applications.map((application) => (
            <TableRow key={application.id}>
              <TableCell>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleViewApplication(application.id)}
                >
                  View
                </Button>
              </TableCell>
              <TableCell className="font-medium">
                {application.lastName || 'Unknown'}, {application.firstName || 'Unknown'}
              </TableCell>
              <TableCell>{application.providerType || 'Not specified'}</TableCell>
              <TableCell>{formatDate(application.submissionDate)}</TableCell>
              <TableCell>
                <Badge
                  className={
                    application.status === "approved"
                      ? "bg-green-100 text-green-700 hover:bg-green-100"
                      : application.status === "rejected"
                        ? "bg-red-100 text-red-700 hover:bg-red-100"
                        : "bg-yellow-100 text-yellow-700 hover:bg-yellow-100"
                  }
                >
                  {application.status.charAt(0).toUpperCase() +
                    application.status.slice(1)}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                {application.status === "pending" ? (
                  <div className="flex justify-end gap-2">
                    <Button
                      size="sm"
                      className="bg-green-600 hover:bg-green-700"
                      onClick={() =>
                        handleStatusChange(application.id, "approved")
                      }
                    >
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() =>
                        handleStatusChange(application.id, "rejected")
                      }
                    >
                      Reject
                    </Button>
                  </div>
                ) : (
                  <span className="text-gray-500 text-sm">
                    No actions available
                  </span>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <AlertDialog open={confirmationOpen} onOpenChange={setConfirmationOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Status Change</AlertDialogTitle>
            <AlertDialogDescription>
              {pendingAction?.status === "approved"
                ? "Are you sure you want to approve this therapist application? This will create a therapist account and send login credentials to the applicant."
                : pendingAction?.status === "rejected"
                  ? "Are you sure you want to reject this therapist application? The applicant will be notified of this decision."
                  : "Are you sure you want to change the status of this application?"}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={updateStatusMutation.isPending}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmStatusChange}
              disabled={updateStatusMutation.isPending}
              className={
                pendingAction?.status === "approved"
                  ? "bg-green-600 hover:bg-green-700"
                  : pendingAction?.status === "rejected"
                    ? "bg-red-600 hover:bg-red-700"
                    : ""
              }
            >
              {updateStatusMutation.isPending ? (
                <span className="flex items-center">
                  <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
                  Processing...
                </span>
              ) : pendingAction?.status === "approved" ? (
                "Approve"
              ) : pendingAction?.status === "rejected" ? (
                "Reject"
              ) : (
                "Confirm"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
