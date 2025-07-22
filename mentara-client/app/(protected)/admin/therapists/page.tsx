"use client";

/**
 * Admin Therapist Management Page
 *
 * This page provides a comprehensive interface for managing therapist applications
 * in the admin panel. It has been refactored to follow modern React patterns:
 *
 * Architecture Improvements:
 * - Business logic moved to custom React Query hooks
 * - Component focused solely on UI state management
 * - Type-safe integration with backend DTOs
 * - Optimistic updates with automatic rollback on errors
 * - Consistent error handling and user feedback
 *
 * Key Features:
 * - Real-time application filtering and pagination
 * - Individual and bulk application approval/rejection
 * - Detailed application view in modal
 * - Application metrics and statistics display
 * - Comprehensive error handling with user-friendly messages
 *
 * @version 2.0.0 - Refactored with custom hooks architecture
 * @lastUpdated 2025-01-22 - Complete DTO synchronization
 */

import { useState } from "react";
import {
  usePendingTherapistApplications,
  useTherapistApplicationMetrics,
  useTherapistApplicationDetails,
  useApproveTherapist,
  useRejectTherapist,
  useBulkApproveTherapists,
  useBulkRejectTherapists,
} from "@/hooks/admin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { TherapistApplicationCard } from "@/components/admin/TherapistApplicationCard";
import { TherapistApplicationDetails } from "@/components/admin/TherapistApplicationDetails";
import { BulkActionsBar } from "@/components/admin/BulkActionsBar";
import { TherapistStatistics } from "@/components/admin/TherapistStatistics";
import { Skeleton } from "@/components/ui/skeleton";
import type {
  PendingTherapistFiltersDto,
  ApproveTherapistDto,
  RejectTherapistDto,
} from "@/types/api/admin";

export default function AdminTherapistManagementPage() {
  const [filters, setFilters] = useState<PendingTherapistFiltersDto>({
    status: "PENDING",
    limit: 50,
  });
  const [selectedTherapists, setSelectedTherapists] = useState<string[]>([]);
  const [detailsTherapistId, setDetailsTherapistId] = useState<string | null>(
    null
  );

  // Fetch pending applications using custom hook
  const {
    data: applications,
    isLoading,
    error,
  } = usePendingTherapistApplications(filters);

  // Fetch statistics using custom hook
  const { data: statistics } = useTherapistApplicationMetrics();

  // Fetch therapist application details for modal using custom hook
  const { data: selectedApplication } =
    useTherapistApplicationDetails(detailsTherapistId);

  // Custom hooks for mutations
  const approveMutation = useApproveTherapist();

  const rejectMutation = useRejectTherapist();
  const bulkApproveMutation = useBulkApproveTherapists();
  const bulkRejectMutation = useBulkRejectTherapists();

  const handleStatusChange = (status: string) => {
    setFilters((prev) => ({
      ...prev,
      status: status as PendingTherapistFiltersDto["status"],
    }));
  };

  const handleBulkApprove = () => {
    bulkApproveMutation.mutate(
      {
        therapistIds: selectedTherapists,
        data: { approvalMessage: "Bulk approval processed" },
      },
      {
        onSuccess: () => setSelectedTherapists([]),
      }
    );
  };

  const handleBulkReject = () => {
    bulkRejectMutation.mutate(
      {
        therapistIds: selectedTherapists,
        data: { rejectionReason: "incomplete_documentation" },
      },
      {
        onSuccess: () => setSelectedTherapists([]),
      }
    );
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <Skeleton className="h-8 w-64 mb-2" />
            <Skeleton className="h-4 w-96" />
          </div>
          <Skeleton className="h-10 w-20" />
        </div>
        <div className="grid gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-48 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-6">
        <div className="text-center text-red-600 p-8">
          <h2 className="text-xl font-semibold mb-2">
            Error Loading Applications
          </h2>
          <p className="mb-4">
            Failed to load therapist applications. Please try again.
          </p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-4 sm:py-6 space-y-4 sm:space-y-6 px-4 sm:px-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">
            Therapist Applications
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Manage therapist applications and approvals
          </p>
        </div>
        <div className="flex gap-2 self-start sm:self-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.location.reload()}
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* Statistics Overview */}
      {/* {statistics && <TherapistStatistics statistics={statistics} />} */}

      {/* Filters */}
      <Card>
        <CardHeader className="pb-3 sm:pb-6">
          <CardTitle className="text-lg sm:text-xl">Filters</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <Select value={filters.status} onValueChange={handleStatusChange}>
              <SelectTrigger className="h-9 sm:h-10">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="APPROVED">Approved</SelectItem>
                <SelectItem value="REJECTED">Rejected</SelectItem>
                <SelectItem value="SUSPENDED">Suspended</SelectItem>
              </SelectContent>
            </Select>

            <Input
              placeholder="Province"
              value={filters.province || ""}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, province: e.target.value }))
              }
              className="h-9 sm:h-10 text-sm"
            />

            <Input
              type="date"
              placeholder="Submitted After"
              value={filters.submittedAfter || ""}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  submittedAfter: e.target.value,
                }))
              }
              className="h-9 sm:h-10 text-sm"
            />

            <Input
              placeholder="Provider Type"
              value={filters.providerType || ""}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  providerType: e.target.value,
                }))
              }
              className="h-9 sm:h-10 text-sm"
            />
          </div>
        </CardContent>
      </Card>

      {/* Bulk Actions */}
      {selectedTherapists.length > 0 && (
        <BulkActionsBar
          selectedCount={selectedTherapists.length}
          onBulkApprove={handleBulkApprove}
          onBulkReject={handleBulkReject}
          onClearSelection={() => setSelectedTherapists([])}
          isLoading={
            bulkApproveMutation.isPending || bulkRejectMutation.isPending
          }
        />
      )}

      {/* Applications List */}
      <div className="grid gap-3 sm:gap-4">
        {applications?.therapists.length ? (
          applications.therapists.map((therapist) => (
            <TherapistApplicationCard
              key={therapist.userId}
              therapist={therapist}
              isSelected={selectedTherapists.includes(therapist.userId)}
              onSelect={(id, selected) => {
                if (selected) {
                  setSelectedTherapists((prev) => [...prev, id]);
                } else {
                  setSelectedTherapists((prev) => prev.filter((x) => x !== id));
                }
              }}
              onViewDetails={() => setDetailsTherapistId(therapist.userId)}
              onApprove={(data) =>
                approveMutation.mutate({
                  therapistId: therapist.userId,
                  data: data as ApproveTherapistDto,
                })
              }
              onReject={(data) =>
                rejectMutation.mutate({
                  therapistId: therapist.userId,
                  data: data as RejectTherapistDto,
                })
              }
              isProcessing={
                approveMutation.isPending || rejectMutation.isPending
              }
            />
          ))
        ) : (
          <Card>
            <CardContent className="p-6 sm:p-12 text-center">
              <h3 className="text-base sm:text-lg font-semibold mb-2">
                No Applications Found
              </h3>
              <p className="text-sm sm:text-base text-muted-foreground">
                {filters.status === "PENDING"
                  ? "No pending therapist applications at this time."
                  : `No ${filters.status} applications found with the current filters.`}
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Application Details Modal */}
      <Dialog
        open={!!detailsTherapistId}
        onOpenChange={(open) => !open && setDetailsTherapistId(null)}
      >
        <DialogContent className="w-[95vw] max-w-[1200px] h-[90vh] max-h-[900px] p-0 overflow-hidden">
          <DialogHeader className="p-6 pb-2 border-b">
            <DialogTitle className="text-xl font-semibold">
              {selectedApplication &&
                `${selectedApplication.user.firstName} ${selectedApplication.user.lastName} - Application Details`}
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-auto p-6">
            {detailsTherapistId && selectedApplication && (
              <TherapistApplicationDetails
                application={selectedApplication}
                onStatusChange={(id, status) => {
                  if (status === "APPROVED") {
                    approveMutation.mutate({
                      therapistId: id,
                      data: { approvalMessage: "Application approved" },
                    });
                  } else if (status === "REJECTED") {
                    rejectMutation.mutate({
                      therapistId: id,
                      data: { rejectionReason: "incomplete_documentation" },
                    });
                  }
                  setDetailsTherapistId(null);
                }}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
