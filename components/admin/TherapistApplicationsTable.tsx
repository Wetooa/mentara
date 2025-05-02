"use client";

import React, { useState } from "react";
import { TherapistApplication } from "@/data/mockTherapistApplicationData";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
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

interface TherapistApplicationsTableProps {
  applications: TherapistApplication[];
  onStatusChange: (
    id: string,
    status: "approved" | "rejected" | "pending"
  ) => void;
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
  const [isProcessing, setIsProcessing] = useState(false);

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

  const confirmStatusChange = async () => {
    if (pendingAction) {
      setIsProcessing(true);
      try {
        // Call the API to update the status
        const response = await fetch(
          `/api/therapist/application/${pendingAction.id}`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ status: pendingAction.status }),
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to update application status");
        }

        // Update the UI with the new status
        onStatusChange(pendingAction.id, pendingAction.status);

        // Show success message
        toast.success(
          `Application ${pendingAction.status === "approved" ? "approved" : "rejected"} successfully`
        );

        // If this was an approval with a generated password, we could save it for EmailJS
        if (pendingAction.status === "approved" && data.generatedPassword) {
          // Store the generated password in the application object for EmailJS
          const applicationIndex = applications.findIndex(
            (app) => app.id === pendingAction.id
          );
          if (applicationIndex >= 0) {
            applications[applicationIndex].generatedPassword =
              data.generatedPassword;
          }
        }
      } catch (error) {
        console.error("Error updating application:", error);
        toast.error("Failed to update application status. Please try again.");
      } finally {
        setIsProcessing(false);
        setConfirmationOpen(false);
        setPendingAction(null);
      }
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
                {application.lastName}, {application.firstName}
              </TableCell>
              <TableCell>{application.providerType}</TableCell>
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
            <AlertDialogCancel disabled={isProcessing}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmStatusChange}
              disabled={isProcessing}
              className={
                pendingAction?.status === "approved"
                  ? "bg-green-600 hover:bg-green-700"
                  : pendingAction?.status === "rejected"
                    ? "bg-red-600 hover:bg-red-700"
                    : ""
              }
            >
              {isProcessing ? (
                <span className="flex items-center">
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
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
