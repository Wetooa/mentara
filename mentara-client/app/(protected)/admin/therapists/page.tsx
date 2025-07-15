'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useApi } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
// Removed unused imports: Badge, Tabs, TabsContent, TabsList, TabsTrigger
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TherapistApplicationCard } from '@/components/admin/TherapistApplicationCard';
import { TherapistApplicationDetails } from '@/components/admin/TherapistApplicationDetails';
import { BulkActionsBar } from '@/components/admin/BulkActionsBar';
import { TherapistStatistics } from '@/components/admin/TherapistStatistics';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

interface TherapistFilters {
  status?: 'pending' | 'approved' | 'rejected' | 'suspended';
  province?: string;
  submittedAfter?: string;
  processedBy?: string;
  providerType?: string;
  limit?: number;
}

export default function AdminTherapistManagementPage() {
  const api = useApi();
  const queryClient = useQueryClient();
  
  const [filters, setFilters] = useState<TherapistFilters>({
    status: 'pending',
    limit: 50,
  });
  const [selectedTherapists, setSelectedTherapists] = useState<string[]>([]);
  const [detailsTherapistId, setDetailsTherapistId] = useState<string | null>(null);

  // Fetch pending applications
  const { data: applications, isLoading, error } = useQuery({
    queryKey: ['admin', 'therapists', 'applications', filters],
    queryFn: () => api.admin.getTherapistApplications(filters),
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Fetch statistics
  const { data: statistics } = useQuery({
    queryKey: ['admin', 'therapists', 'statistics'],
    queryFn: () => api.admin.getTherapistStatistics(),
    refetchInterval: 60000, // Refresh every minute
  });

  // Approve therapist mutation
  const approveMutation = useMutation({
    mutationFn: ({ therapistId, data }: { therapistId: string; data: Record<string, unknown> }) =>
      api.admin.approveTherapist(therapistId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'therapists'] });
      toast.success('Therapist approved successfully');
    },
    onError: () => {
      toast.error('Failed to approve therapist');
    },
  });

  // Reject therapist mutation
  const rejectMutation = useMutation({
    mutationFn: ({ therapistId, data }: { therapistId: string; data: Record<string, unknown> }) =>
      api.admin.rejectTherapist(therapistId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'therapists'] });
      toast.success('Therapist application rejected');
    },
    onError: () => {
      toast.error('Failed to reject therapist');
    },
  });

  const handleStatusChange = (status: string) => {
    setFilters(prev => ({ ...prev, status: status as TherapistFilters['status'] }));
  };

  const handleBulkApprove = async () => {
    for (const therapistId of selectedTherapists) {
      await approveMutation.mutateAsync({
        therapistId,
        data: { approvalMessage: 'Bulk approval processed' },
      });
    }
    setSelectedTherapists([]);
  };

  const handleBulkReject = async () => {
    for (const therapistId of selectedTherapists) {
      await rejectMutation.mutateAsync({
        therapistId,
        data: { rejectionReason: 'Bulk rejection processed' },
      });
    }
    setSelectedTherapists([]);
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
          <h2 className="text-xl font-semibold mb-2">Error Loading Applications</h2>
          <p className="mb-4">Failed to load therapist applications. Please try again.</p>
          <Button onClick={() => queryClient.invalidateQueries()}>
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Therapist Applications</h1>
          <p className="text-muted-foreground">Manage therapist applications and approvals</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => queryClient.invalidateQueries()}>
            Refresh
          </Button>
        </div>
      </div>

      {/* Statistics Overview */}
      {statistics && <TherapistStatistics statistics={statistics} />}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Select value={filters.status} onValueChange={handleStatusChange}>
              <SelectTrigger>
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
              value={filters.province || ''}
              onChange={(e) => setFilters(prev => ({ ...prev, province: e.target.value }))}
            />

            <Input
              type="date"
              placeholder="Submitted After"
              value={filters.submittedAfter || ''}
              onChange={(e) => setFilters(prev => ({ ...prev, submittedAfter: e.target.value }))}
            />

            <Input
              placeholder="Provider Type"
              value={filters.providerType || ''}
              onChange={(e) => setFilters(prev => ({ ...prev, providerType: e.target.value }))}
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
      <div className="grid gap-4">
        {applications?.therapists?.length > 0 ? (
          applications.therapists.map((therapist) => (
            <TherapistApplicationCard
              key={therapist.userId}
              therapist={therapist}
              isSelected={selectedTherapists.includes(therapist.userId)}
              onSelect={(id, selected) => {
                if (selected) {
                  setSelectedTherapists(prev => [...prev, id]);
                } else {
                  setSelectedTherapists(prev => prev.filter(x => x !== id));
                }
              }}
              onViewDetails={() => setDetailsTherapistId(therapist.userId)}
              onApprove={(data) => approveMutation.mutate({ therapistId: therapist.userId, data })}
              onReject={(data) => rejectMutation.mutate({ therapistId: therapist.userId, data })}
              isProcessing={approveMutation.isPending || rejectMutation.isPending}
            />
          ))
        ) : (
          <Card>
            <CardContent className="p-12 text-center">
              <h3 className="text-lg font-semibold mb-2">No Applications Found</h3>
              <p className="text-muted-foreground">
                {filters.status === 'pending' 
                  ? 'No pending therapist applications at this time.'
                  : `No ${filters.status} applications found with the current filters.`
                }
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Application Details Modal */}
      {detailsTherapistId && (
        <TherapistApplicationDetails
          therapistId={detailsTherapistId}
          onClose={() => setDetailsTherapistId(null)}
          onApprove={(data) => {
            approveMutation.mutate({ therapistId: detailsTherapistId, data });
            setDetailsTherapistId(null);
          }}
          onReject={(data) => {
            rejectMutation.mutate({ therapistId: detailsTherapistId, data });
            setDetailsTherapistId(null);
          }}
        />
      )}
    </div>
  );
}