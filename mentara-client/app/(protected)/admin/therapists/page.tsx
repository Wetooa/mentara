"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useApi } from "@/lib/api";
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
import { toast } from "sonner";

interface TherapistFilters {
  status?: "pending" | "approved" | "rejected" | "suspended";
  province?: string;
  submittedAfter?: string;
  processedBy?: string;
  providerType?: string;
  limit?: number;
}

interface TherapistApprovalData {
  approvalMessage?: string;
  notifyTherapist?: boolean;
  sendWelcomeEmail?: boolean;
}

interface TherapistRejectionData {
  rejectionReason: string;
  customMessage?: string;
  notifyTherapist?: boolean;
  allowReapplication?: boolean;
}

export default function AdminTherapistManagementPage() {
  const api = useApi();
  const queryClient = useQueryClient();

  const [filters, setFilters] = useState<TherapistFilters>({
    status: "pending",
    limit: 50,
  });
  const [selectedTherapists, setSelectedTherapists] = useState<string[]>([]);
  const [detailsTherapistId, setDetailsTherapistId] = useState<string | null>(
    null
  );

  // Fetch pending applications
  const {
    data: applications,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["admin", "therapists", "applications", filters],
    queryFn: () =>
      api.admin.getTherapistApplications({
        ...filters,
        limit: filters.limit || 50,
      }),
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Fetch statistics
  const { data: statistics } = useQuery({
    queryKey: ["admin", "therapists", "statistics"],
    queryFn: () => api.admin.getTherapistStatistics(),
    refetchInterval: 60000, // Refresh every minute
  });

  // Fetch therapist application details for modal
  const { data: selectedApplication } = useQuery({
    queryKey: ["admin", "therapists", "application", detailsTherapistId],
    queryFn: () => api.admin.therapistApplications.getById(detailsTherapistId!),
    enabled: !!detailsTherapistId,
  });

  // Approve therapist mutation
  const approveMutation = useMutation({
    mutationFn: ({
      therapistId,
      data,
    }: {
      therapistId: string;
      data: TherapistApprovalData;
    }) => api.admin.approveTherapist(therapistId, data),
    onMutate: async ({ therapistId }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["admin", "therapists"] });
      
      // Snapshot the previous value
      const previousApplications = queryClient.getQueryData(["admin", "therapists", "applications", filters]);
      
      // Optimistically update the cache
      queryClient.setQueryData(
        ["admin", "therapists", "applications", filters],
        (old: any) => {
          if (!old?.applications) return old;
          return {
            ...old,
            applications: old.applications.map((app: any) =>
              app.id === therapistId
                ? { ...app, status: "approved", processingDate: new Date().toISOString() }
                : app
            ),
          };
        }
      );
      
      return { previousApplications, therapistId };
    },
    onError: (error, variables, context) => {
      // Rollback optimistic update
      if (context?.previousApplications) {
        queryClient.setQueryData(
          ["admin", "therapists", "applications", filters],
          context.previousApplications
        );
      }
      toast.error("Failed to approve therapist");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "therapists"] });
      toast.success("Therapist approved successfully");
    },
  });

  // Reject therapist mutation
  const rejectMutation = useMutation({
    mutationFn: ({
      therapistId,
      data,
    }: {
      therapistId: string;
      data: TherapistRejectionData;
    }) => api.admin.rejectTherapist(therapistId, data),
    onMutate: async ({ therapistId }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["admin", "therapists"] });
      
      // Snapshot the previous value
      const previousApplications = queryClient.getQueryData(["admin", "therapists", "applications", filters]);
      
      // Optimistically update the cache
      queryClient.setQueryData(
        ["admin", "therapists", "applications", filters],
        (old: any) => {
          if (!old?.applications) return old;
          return {
            ...old,
            applications: old.applications.map((app: any) =>
              app.id === therapistId
                ? { ...app, status: "rejected", processingDate: new Date().toISOString() }
                : app
            ),
          };
        }
      );
      
      return { previousApplications, therapistId };
    },
    onError: (error, variables, context) => {
      // Rollback optimistic update
      if (context?.previousApplications) {
        queryClient.setQueryData(
          ["admin", "therapists", "applications", filters],
          context.previousApplications
        );
      }
      toast.error("Failed to reject therapist");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "therapists"] });
      toast.success("Therapist application rejected");
    },
  });

  const handleStatusChange = (status: string) => {
    setFilters((prev) => ({
      ...prev,
      status: status as TherapistFilters["status"],
    }));
  };

  const handleBulkApprove = async () => {
    // Optimistically update all selected applications
    const previousApplications = queryClient.getQueryData(["admin", "therapists", "applications", filters]);
    
    try {
      // Immediately update UI for better UX
      queryClient.setQueryData(
        ["admin", "therapists", "applications", filters],
        (old: any) => {
          if (!old?.applications) return old;
          return {
            ...old,
            applications: old.applications.map((app: any) =>
              selectedTherapists.includes(app.id)
                ? { ...app, status: "approved", processingDate: new Date().toISOString() }
                : app
            ),
          };
        }
      );
      
      const promises = selectedTherapists.map(therapistId =>
        approveMutation.mutateAsync({
          therapistId,
          data: { approvalMessage: "Bulk approval processed" },
        })
      );
      
      const results = await Promise.allSettled(promises);
      const successful = results.filter(r => r.status === 'fulfilled').length;
      const failed = results.filter(r => r.status === 'rejected').length;
      
      if (failed === 0) {
        toast.success(`Successfully approved ${successful} therapist applications`);
      } else {
        toast.warning(`Approved ${successful} applications, ${failed} failed`);
        // If some failed, refresh to get accurate state
        queryClient.invalidateQueries({ queryKey: ["admin", "therapists"] });
      }
      
      setSelectedTherapists([]);
    } catch (error) {
      // Rollback optimistic update on error
      if (previousApplications) {
        queryClient.setQueryData(
          ["admin", "therapists", "applications", filters],
          previousApplications
        );
      }
      toast.error('Bulk approval failed. Please try again.');
    }
  };

  const handleBulkReject = async () => {
    // Optimistically update all selected applications
    const previousApplications = queryClient.getQueryData(["admin", "therapists", "applications", filters]);
    
    try {
      // Immediately update UI for better UX
      queryClient.setQueryData(
        ["admin", "therapists", "applications", filters],
        (old: any) => {
          if (!old?.applications) return old;
          return {
            ...old,
            applications: old.applications.map((app: any) =>
              selectedTherapists.includes(app.id)
                ? { ...app, status: "rejected", processingDate: new Date().toISOString() }
                : app
            ),
          };
        }
      );
      
      const promises = selectedTherapists.map(therapistId =>
        rejectMutation.mutateAsync({
          therapistId,
          data: { rejectionReason: "incomplete_documentation" },
        })
      );
      
      const results = await Promise.allSettled(promises);
      const successful = results.filter(r => r.status === 'fulfilled').length;
      const failed = results.filter(r => r.status === 'rejected').length;
      
      if (failed === 0) {
        toast.success(`Successfully rejected ${successful} therapist applications`);
      } else {
        toast.warning(`Rejected ${successful} applications, ${failed} failed`);
        // If some failed, refresh to get accurate state
        queryClient.invalidateQueries({ queryKey: ["admin", "therapists"] });
      }
      
      setSelectedTherapists([]);
    } catch (error) {
      // Rollback optimistic update on error
      if (previousApplications) {
        queryClient.setQueryData(
          ["admin", "therapists", "applications", filters],
          previousApplications
        );
      }
      toast.error('Bulk rejection failed. Please try again.');
    }
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
          <Button onClick={() => queryClient.invalidateQueries()}>Retry</Button>
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
            onClick={() => queryClient.invalidateQueries()}
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* Statistics Overview */}
      {statistics && <TherapistStatistics statistics={statistics} />}

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
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
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
          isLoading={approveMutation.isPending || rejectMutation.isPending}
        />
      )}

      {/* Applications List */}
      <div className="grid gap-3 sm:gap-4">
        {applications?.applications.length ? (
          applications.applications.map((therapist) => (
            <TherapistApplicationCard
              key={therapist.id}
              therapist={therapist}
              isSelected={selectedTherapists.includes(therapist.id)}
              onSelect={(id, selected) => {
                if (selected) {
                  setSelectedTherapists((prev) => [...prev, id]);
                } else {
                  setSelectedTherapists((prev) => prev.filter((x) => x !== id));
                }
              }}
              onViewDetails={() => setDetailsTherapistId(therapist.id)}
              onApprove={(data) =>
                approveMutation.mutate({
                  therapistId: therapist.id,
                  data: data as unknown as TherapistApprovalData,
                })
              }
              onReject={(data) =>
                rejectMutation.mutate({
                  therapistId: therapist.id,
                  data: data as unknown as TherapistRejectionData,
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
                {filters.status === "pending"
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
                `${selectedApplication.firstName} ${selectedApplication.lastName} - Application Details`
              }
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-auto p-6">
            {detailsTherapistId && selectedApplication && (
              <TherapistApplicationDetails
                application={selectedApplication}
                onStatusChange={(id, status) => {
                  if (status === "approved") {
                    approveMutation.mutate({
                      therapistId: id,
                      data: { approvalMessage: "Application approved" },
                    });
                  } else if (status === "rejected") {
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
