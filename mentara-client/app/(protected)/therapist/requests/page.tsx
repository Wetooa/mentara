'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useApi } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ClientRequestCard } from '@/components/therapist/ClientRequestCard';
import { RequestResponseDialog } from '@/components/therapist/RequestResponseDialog';
import { RequestStatistics } from '@/components/therapist/RequestStatistics';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  RefreshCw, 
  Users, 
  Clock, 
  CheckCircle, 
  XCircle,
  AlertCircle,
  Filter,
  Search
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

interface RequestFilters {
  status?: 'pending' | 'accepted' | 'declined' | 'expired';
  priority?: 'high' | 'medium' | 'low';
  dateRange?: 'today' | 'week' | 'month' | 'all';
  sortBy?: 'newest' | 'oldest' | 'priority' | 'match_score';
}

export default function TherapistRequestsPage() {
  const api = useApi();
  const queryClient = useQueryClient();
  
  const [filters, setFilters] = useState<RequestFilters>({
    status: 'pending',
    sortBy: 'newest',
    dateRange: 'all',
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);
  const [responseDialogOpen, setResponseDialogOpen] = useState(false);

  // Fetch client requests
  const { data: requestsData, isLoading, error, refetch } = useQuery({
    queryKey: ['therapist', 'requests', filters, searchTerm],
    queryFn: () => api.therapists.getClientRequests({ 
      ...filters, 
      search: searchTerm || undefined 
    }),
    refetchInterval: 30000, // Refresh every 30 seconds for real-time updates
  });

  // Fetch request statistics
  const { data: statistics } = useQuery({
    queryKey: ['therapist', 'requests', 'statistics'],
    queryFn: () => api.therapists.getRequestStatistics(),
    refetchInterval: 60000, // Refresh every minute
  });

  // Respond to request mutation
  const respondToRequestMutation = useMutation({
    mutationFn: ({ requestId, response }: { 
      requestId: string; 
      response: {
        action: 'accept' | 'decline' | 'request_info';
        message?: string;
        availableSlots?: Array<{
          date: string;
          time: string;
          duration: number;
        }>;
        questions?: string[];
      };
    }) => api.therapists.respondToClientRequest(requestId, response),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['therapist', 'requests'] });
      const action = variables.response.action;
      const actionText = action === 'accept' ? 'accepted' : 
                        action === 'decline' ? 'declined' : 'responded to';
      toast.success(`Successfully ${actionText} client request`);
      setResponseDialogOpen(false);
      setSelectedRequestId(null);
    },
    onError: () => {
      toast.error('Failed to respond to client request. Please try again.');
    },
  });

  const handleRequestResponse = (requestId: string, response: Record<string, unknown>) => {
    respondToRequestMutation.mutate({ requestId, response });
  };

  const handleQuickAccept = (requestId: string) => {
    respondToRequestMutation.mutate({
      requestId,
      response: { action: 'accept', message: 'I would be happy to work with you!' }
    });
  };

  const handleQuickDecline = (requestId: string) => {
    respondToRequestMutation.mutate({
      requestId,
      response: { action: 'decline', message: 'Thank you for your interest. Unfortunately, I am not able to take on new clients at this time.' }
    });
  };

  const handleOpenResponseDialog = (requestId: string) => {
    setSelectedRequestId(requestId);
    setResponseDialogOpen(true);
  };

  const handleFilterChange = (key: keyof RequestFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const getTabCounts = () => {
    if (!requestsData) return { pending: 0, accepted: 0, declined: 0, expired: 0 };
    
    return {
      pending: requestsData.requests?.filter(r => r.status === 'pending').length || 0,
      accepted: requestsData.requests?.filter(r => r.status === 'accepted').length || 0,
      declined: requestsData.requests?.filter(r => r.status === 'declined').length || 0,
      expired: requestsData.requests?.filter(r => r.status === 'expired').length || 0,
    };
  };

  const tabCounts = getTabCounts();

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
        <Card className="max-w-md mx-auto">
          <CardContent className="p-8 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Error Loading Requests</h2>
            <p className="text-muted-foreground mb-4">
              Unable to load client requests. Please try again.
            </p>
            <Button onClick={() => refetch()}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Client Requests</h1>
          <p className="text-muted-foreground">
            Manage incoming client requests and build your practice
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Statistics Overview */}
      {statistics && <RequestStatistics statistics={statistics} />}

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters & Search
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search clients..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={filters.dateRange} onValueChange={(value) => handleFilterChange('dateRange', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Date Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
                <SelectItem value="all">All Time</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filters.priority} onValueChange={(value) => handleFilterChange('priority', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Priorities</SelectItem>
                <SelectItem value="high">High Priority</SelectItem>
                <SelectItem value="medium">Medium Priority</SelectItem>
                <SelectItem value="low">Low Priority</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filters.sortBy} onValueChange={(value) => handleFilterChange('sortBy', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Sort By" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="oldest">Oldest First</SelectItem>
                <SelectItem value="priority">Priority</SelectItem>
                <SelectItem value="match_score">Match Score</SelectItem>
              </SelectContent>
            </Select>

            <Button 
              variant="outline" 
              onClick={() => {
                setFilters({ status: 'pending', sortBy: 'newest', dateRange: 'all' });
                setSearchTerm('');
              }}
            >
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Request Tabs */}
      <Tabs value={filters.status} onValueChange={(value) => handleFilterChange('status', value)}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="pending" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Pending
            {tabCounts.pending > 0 && (
              <Badge variant="secondary" className="ml-1">
                {tabCounts.pending}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="accepted" className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            Accepted
            {tabCounts.accepted > 0 && (
              <Badge variant="secondary" className="ml-1">
                {tabCounts.accepted}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="declined" className="flex items-center gap-2">
            <XCircle className="h-4 w-4" />
            Declined
            {tabCounts.declined > 0 && (
              <Badge variant="secondary" className="ml-1">
                {tabCounts.declined}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="expired" className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            Expired
            {tabCounts.expired > 0 && (
              <Badge variant="secondary" className="ml-1">
                {tabCounts.expired}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value={filters.status} className="space-y-4">
          {/* Requests List */}
          <div className="grid gap-4">
            {requestsData?.requests?.length > 0 ? (
              requestsData.requests.map((request) => (
                <ClientRequestCard
                  key={request.id}
                  request={request}
                  onQuickAccept={handleQuickAccept}
                  onQuickDecline={handleQuickDecline}
                  onOpenResponseDialog={handleOpenResponseDialog}
                  isProcessing={respondToRequestMutation.isPending}
                />
              ))
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">
                    No {filters.status} requests
                  </h3>
                  <p className="text-muted-foreground">
                    {filters.status === 'pending' 
                      ? 'No new client requests at the moment. Check back later!'
                      : `No ${filters.status} requests found with the current filters.`
                    }
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Response Dialog */}
      {selectedRequestId && (
        <RequestResponseDialog
          requestId={selectedRequestId}
          request={requestsData?.requests?.find(r => r.id === selectedRequestId)}
          open={responseDialogOpen}
          onClose={() => {
            setResponseDialogOpen(false);
            setSelectedRequestId(null);
          }}
          onRespond={handleRequestResponse}
          isLoading={respondToRequestMutation.isPending}
        />
      )}
    </div>
  );
}