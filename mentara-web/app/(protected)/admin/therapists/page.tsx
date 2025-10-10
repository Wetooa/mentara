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
    <div className="container mx-auto py-4 sm:py-6 space-y-4 sm:space-y-6 px-4 sm:px-6 max-w-full overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 leading-tight">
            Therapist Applications
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground mt-1 leading-relaxed">
            Manage therapist applications and approvals
          </p>
        </div>
        <div className="flex gap-3 self-start sm:self-auto">
          <Button
            variant="outline"
            size="default"
            className="h-10 px-4 text-sm font-medium hover:bg-gray-50 focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            onClick={() => window.location.reload()}
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* Statistics Overview */}
      {/* {statistics && <TherapistStatistics statistics={statistics} />} */}

      {/* Filters */}
      <Card className="shadow-sm hover:shadow-md transition-shadow duration-200 rounded-lg sm:rounded-xl border border-gray-200">
        <CardHeader className="pb-4 sm:pb-6">
          <CardTitle className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-900">Filters</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5 lg:gap-6">
            <Select value={filters.status} onValueChange={handleStatusChange}>
              <SelectTrigger className="h-11 sm:h-10 lg:h-9 text-base sm:text-sm">
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
              className="h-11 sm:h-10 lg:h-9 text-base sm:text-sm"
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
              className="h-11 sm:h-10 lg:h-9 text-base sm:text-sm"
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
              className="h-11 sm:h-10 lg:h-9 text-base sm:text-sm"
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
          <Card className="shadow-sm rounded-lg sm:rounded-xl border border-gray-200">
            <CardContent className="p-8 sm:p-12 text-center">
              <h3 className="text-lg sm:text-xl font-semibold mb-3 text-gray-900">
                No Applications Found
              </h3>
              <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
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
        <DialogContent className="w-full max-w-full sm:max-w-2xl md:max-w-4xl lg:max-w-6xl xl:max-w-7xl h-[95vh] sm:h-[90vh] lg:h-[85vh] p-0 overflow-hidden rounded-lg sm:rounded-xl">
          <DialogHeader className="sticky top-0 bg-white z-10 p-4 sm:p-6 pb-3 sm:pb-4 border-b border-gray-200 rounded-t-lg sm:rounded-t-xl">
            <DialogTitle className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-900 leading-tight pr-8">
              {selectedApplication &&
                `${selectedApplication.user.firstName} ${selectedApplication.user.lastName} - Application Details`}
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-auto p-4 sm:p-6 bg-gray-50">
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
