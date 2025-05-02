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
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

interface TherapistApplicationsTableProps {
  applications: TherapistApplication[];
  onStatusChange: (
    id: string,
    status: "approved" | "rejected" | "pending"
  ) => void;
  onViewApplication: (application: TherapistApplication) => void;
}

export function TherapistApplicationsTable({
  applications,
  onStatusChange,
  onViewApplication,
}: TherapistApplicationsTableProps) {
  const [confirmationOpen, setConfirmationOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<{
    id: string;
    status: "approved" | "rejected" | "pending";
  } | null>(null);

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

  const confirmStatusChange = () => {
    if (pendingAction) {
      onStatusChange(pendingAction.id, pendingAction.status);
    }
    setConfirmationOpen(false);
    setPendingAction(null);
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
                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onViewApplication(application)}
                    >
                      View
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogTitle>
                      <VisuallyHidden>
                        Application Details for {application.firstName}{" "}
                        {application.lastName}
                      </VisuallyHidden>
                    </DialogTitle>
                    {/* The actual content will be handled by the parent component */}
                  </DialogContent>
                </Dialog>
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
                ? "Are you sure you want to approve this therapist application? This will allow the therapist to start using the platform."
                : pendingAction?.status === "rejected"
                  ? "Are you sure you want to reject this therapist application? The applicant will be notified of this decision."
                  : "Are you sure you want to change the status of this application?"}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmStatusChange}>
              {pendingAction?.status === "approved"
                ? "Approve"
                : pendingAction?.status === "rejected"
                  ? "Reject"
                  : "Confirm"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
