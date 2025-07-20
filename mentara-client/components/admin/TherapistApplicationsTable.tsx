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
// Removed unused import: toast
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
      <div className="hidden md:block">
        <Table>
          <TableHeader className="bg-gray-50">
            <TableRow>
              <TableHead className="w-[80px]">Details</TableHead>
              <TableHead>Name</TableHead>
              <TableHead className="hidden lg:table-cell">Provider Type</TableHead>
              <TableHead className="hidden lg:table-cell">Submission Date</TableHead>
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
                    className="text-xs"
                  >
                    View
                  </Button>
                </TableCell>
                <TableCell className="font-medium">
                  <div className="space-y-1">
                    <div>{application.personalInfo.lastName || 'Unknown'}, {application.personalInfo.firstName || 'Unknown'}</div>
                    <div className="lg:hidden text-xs text-gray-500">
                      {(application as Record<string, unknown>).providerType as string || 'Not specified'} • {formatDate(application.createdAt)}
                    </div>
                  </div>
                </TableCell>
                <TableCell className="hidden lg:table-cell">{(application as Record<string, unknown>).providerType as string || 'Not specified'}</TableCell>
                <TableCell className="hidden lg:table-cell">{formatDate(application.createdAt)}</TableCell>
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
                    <div className="flex flex-col md:flex-row justify-end gap-1 md:gap-2">
                      <Button
                        size="sm"
                        className="bg-green-600 hover:bg-green-700 text-xs px-2 py-1"
                        onClick={() =>
                          handleStatusChange(application.id, "approved")
                        }
                      >
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        className="text-xs px-2 py-1"
                        onClick={() =>
                          handleStatusChange(application.id, "rejected")
                        }
                      >
                        Reject
                      </Button>
                    </div>
                  ) : (
                    <span className="text-gray-500 text-xs">
                      No actions available
                    </span>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Mobile Card Layout */}
      <div className="md:hidden space-y-3">
        {applications.map((application) => (
          <div key={application.id} className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex justify-between items-start mb-3">
              <div className="flex-1">
                <h3 className="font-medium text-sm">
                  {application.personalInfo.lastName || 'Unknown'}, {application.personalInfo.firstName || 'Unknown'}
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  {(application as Record<string, unknown>).providerType as string || 'Not specified'}
                </p>
                <p className="text-xs text-gray-500">
                  Submitted: {formatDate(application.createdAt)}
                </p>
              </div>
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
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleViewApplication(application.id)}
                className="text-xs flex-1"
              >
                View Details
              </Button>
              {application.status === "pending" && (
                <>
                  <Button
                    size="sm"
                    className="bg-green-600 hover:bg-green-700 text-xs flex-1"
                    onClick={() =>
                      handleStatusChange(application.id, "approved")
                    }
                  >
                    Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    className="text-xs flex-1"
                    onClick={() =>
                      handleStatusChange(application.id, "rejected")
                    }
                  >
                    Reject
                  </Button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

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
