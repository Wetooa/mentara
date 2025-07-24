'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useApi } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  FileText, 
  Plus, 
  Search, 
  Filter,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  User
} from 'lucide-react';
import { WorksheetAssignmentDialog } from './WorksheetAssignmentDialog';
import { useMatchedClients } from '@/hooks/therapist/useMatchedClients';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { useAuth } from '@/contexts/AuthContext';
import type { Worksheet } from '@/types/api/worksheets';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import CreateWorksheetModal from '@/components/worksheets/CreateWorksheetModal';

export function WorksheetManagementPage() {
  const api = useApi();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [viewWorksheet, setViewWorksheet] = useState<Worksheet | null>(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);

  // Fetch therapist's worksheets
  const { data: worksheetData, isLoading: worksheetsLoading } = useQuery({
    queryKey: ['therapist', 'worksheets', statusFilter, user?.id],
    queryFn: async () => {
      if (!user?.id) return { worksheets: [], total: 0, hasMore: false };
      const params: any = { therapistId: user.id };
      if (statusFilter !== 'all') {
        params.status = statusFilter;
      }
      return await api.worksheets.getAll(params);
    },
    enabled: !!user?.id,
  });

  const worksheets = worksheetData?.worksheets || [];

  // Filter worksheets for each tab
  const completedWorksheets = worksheets.filter((w) => w.status === 'SUBMITTED');
  const nonCompletedWorksheets = worksheets.filter((w) => w.status !== 'SUBMITTED');

  // Fetch matched clients for quick assignment
  const { data: matchedClientsData, isLoading: clientsLoading } = useMatchedClients();

  const queryClient = useQueryClient();

  // Mutation for marking worksheet as reviewed
  const markAsReviewedMutation = useMutation({
    mutationFn: async (worksheetId: string) => {
      return api.worksheets.update(worksheetId, { status: 'REVIEWED' as any });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['therapist', 'worksheets'] });
    },
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SUBMITTED':
      case 'COMPLETED':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'ASSIGNED':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'OVERDUE':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'SUBMITTED':
      case 'COMPLETED':
        return <CheckCircle className="h-3 w-3" />;
      case 'OVERDUE':
        return <AlertCircle className="h-3 w-3" />;
      default:
        return <Clock className="h-3 w-3" />;
    }
  };

  const filteredWorksheets = worksheets.filter((worksheet: Worksheet) =>
    worksheet.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    `${worksheet.client?.user?.firstName || ''} ${worksheet.client?.user?.lastName || ''}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const activeClients = [
    ...(matchedClientsData?.recentMatches || []),
    ...(matchedClientsData?.pendingRequests || [])
  ].filter((match, index, self) => 
    index === self.findIndex(m => m.client.id === match.client.id)
  );

  if (worksheetsLoading || clientsLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-10 w-40" />
        </div>
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-32 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <FileText className="h-6 w-6 text-blue-600" />
            Worksheet Management
          </h1>
          <p className="text-muted-foreground">
            Create, assign, and track worksheets for your clients
          </p>
        </div>
      </div>

      <Tabs defaultValue="worksheets" className="space-y-6">
        <div className="flex items-center gap-4 mb-4">
          <Button onClick={() => setCreateModalOpen(true)} variant="default">
            + Create Worksheet
          </Button>
          <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
            <TabsTrigger value="worksheets">My Worksheets</TabsTrigger>
            <TabsTrigger value="assign">Client Submissions</TabsTrigger>
          </TabsList>
        </div>
        <CreateWorksheetModal isOpen={createModalOpen} onClose={() => setCreateModalOpen(false)} />

        {/* Worksheets Tab */}
        <TabsContent value="worksheets" className="space-y-6">
          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search worksheets or clients..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={statusFilter === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter('all')}
              >
                All
              </Button>
              <Button
                variant={statusFilter === 'ASSIGNED' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter('ASSIGNED')}
              >
                Assigned
              </Button>
              <Button
                variant={statusFilter === 'OVERDUE' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter('OVERDUE')}
              >
                Overdue
              </Button>
              <Button
                variant={statusFilter === 'REVIEWED' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter('REVIEWED')}
              >
                Reviewed
              </Button>
            </div>
          </div>

          {/* Worksheets List */}
          <div className="space-y-4">
            {nonCompletedWorksheets.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">No Worksheets Found</h3>
                  <p className="text-muted-foreground mb-4">
                    {searchTerm ? 'No worksheets match your search.' : 'You haven\'t created any worksheets yet.'}
                  </p>
                </CardContent>
              </Card>
            ) : (
              nonCompletedWorksheets.map((worksheet: Worksheet) => (
                <Card key={worksheet.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold">{worksheet.title}</h3>
                          <Badge variant="outline" className={getStatusColor(worksheet.status)}>
                            {getStatusIcon(worksheet.status)}
                            {worksheet.status.replace('_', ' ')}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4" />
                            <Avatar className="h-6 w-6">
                              <AvatarImage src={worksheet.client.user.avatarUrl} />
                              <AvatarFallback className="text-xs">
                                {worksheet.client.user.firstName[0]}{worksheet.client.user.lastName[0]}
                              </AvatarFallback>
                            </Avatar>
                            <span>{worksheet.client.user.firstName} {worksheet.client.user.lastName}</span>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            <span>Created {format(new Date(worksheet.createdAt), 'MMM d, yyyy')}</span>
                          </div>
                          
                          {worksheet.dueDate && (
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4" />
                              <span>Due {format(new Date(worksheet.dueDate), 'MMM d, yyyy')}</span>
                            </div>
                          )}
                        </div>
                        
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {worksheet.instructions || ""}
                        </p>
                      </div>
                      
                      <div className="flex gap-2 ml-4">
                        <Button variant="outline" size="sm" onClick={() => setViewWorksheet(worksheet)}>
                          View
                        </Button>
                        <Button variant="outline" size="sm">
                          Edit
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        {/* Quick Assign Tab */}
        <TabsContent value="assign" className="space-y-6">
          {/* Completed Worksheets Section */}
          <Card>
            <CardHeader>
              <CardTitle>Completed Worksheets</CardTitle>
              <p className="text-sm text-muted-foreground">
                Worksheets that have been completed by your clients
              </p>
            </CardHeader>
            <CardContent>
              {completedWorksheets.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">No Completed Worksheets</h3>
                  <p className="text-muted-foreground">
                    {searchTerm ? 'No completed worksheets match your search.' : 'No worksheets have been completed yet.'}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {completedWorksheets.map((worksheet: Worksheet) => (
                    <Card key={worksheet.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-semibold">{worksheet.title}</h3>
                              <Badge variant="outline" className={getStatusColor(worksheet.status)}>
                                {getStatusIcon(worksheet.status)}
                                {worksheet.status.replace('_', ' ')}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                              <div className="flex items-center gap-2">
                                <User className="h-4 w-4" />
                                <Avatar className="h-6 w-6">
                                  <AvatarImage src={worksheet.client.user.avatarUrl} />
                                  <AvatarFallback className="text-xs">
                                    {worksheet.client.user.firstName[0]}{worksheet.client.user.lastName[0]}
                                  </AvatarFallback>
                                </Avatar>
                                <span>{worksheet.client.user.firstName} {worksheet.client.user.lastName}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4" />
                                <span>Created {format(new Date(worksheet.createdAt), 'MMM d, yyyy')}</span>
                              </div>
                              {worksheet.dueDate && (
                                <div className="flex items-center gap-2">
                                  <Clock className="h-4 w-4" />
                                  <span>Due {format(new Date(worksheet.dueDate), 'MMM d, yyyy')}</span>
                                </div>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {worksheet.instructions || ""}
                            </p>
                          </div>
                          <div className="flex flex-col gap-2 ml-4 items-end">
                            <Button variant="outline" size="sm" onClick={() => setViewWorksheet(worksheet)}>
                              View
                            </Button>
                            <Button
                              variant="secondary"
                              size="sm"
                              disabled={markAsReviewedMutation.isPending && markAsReviewedMutation.variables === worksheet.id}
                              onClick={() => markAsReviewedMutation.mutate(worksheet.id)}
                            >
                              {markAsReviewedMutation.isPending && markAsReviewedMutation.variables === worksheet.id ? 'Marking...' : 'Mark as Reviewed'}
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Worksheet View Modal */}
      <Dialog open={!!viewWorksheet} onOpenChange={open => !open && setViewWorksheet(null)}>
        <DialogContent>
          {viewWorksheet && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-2xl font-bold mb-2">
                  <FileText className="h-6 w-6 text-blue-500" />
                  {viewWorksheet.title}
                </DialogTitle>
                <DialogDescription>
                  <div className="flex flex-col gap-3 mt-2">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-gray-500" />
                      <span className="font-medium">{viewWorksheet.client.user.firstName} {viewWorksheet.client.user.lastName}</span>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge className="capitalize" variant="outline">{viewWorksheet.status.toLowerCase()}</Badge>
                      <Calendar className="h-4 w-4 text-gray-500 ml-2" />
                      <span className="text-xs">Created {format(new Date(viewWorksheet.createdAt), 'MMM d, yyyy')}</span>
                      {viewWorksheet.dueDate && (
                        <>
                          <Clock className="h-4 w-4 text-gray-500 ml-2" />
                          <span className="text-xs">Due {format(new Date(viewWorksheet.dueDate), 'MMM d, yyyy')}</span>
                        </>
                      )}
                    </div>
                  </div>
                </DialogDescription>
              </DialogHeader>
              <div className="flex flex-col gap-8 mt-8">
                {/* Instructions */}
                <div>
                  <div className="flex items-center gap-2 mb-3 text-lg font-semibold">
                    <FileText className="h-5 w-5 text-blue-400" />
                    Instructions
                  </div>
                  <div className="rounded-md bg-gray-50 p-4 text-sm text-gray-700 min-h-[60px] border whitespace-pre-line">
                    {viewWorksheet.instructions || <span className="italic text-gray-400">No instructions provided.</span>}
                  </div>
                </div>
                {/* Reference Materials */}
                <div>
                  <div className="flex items-center gap-2 mb-3 text-lg font-semibold">
                    <FileText className="h-5 w-5 text-green-400" />
                    Reference Materials
                  </div>
                  <div className="rounded-md bg-gray-50 p-4 min-h-[60px] border">
                    {viewWorksheet.materialUrls && viewWorksheet.materialUrls.length > 0 ? (
                      <ul className="list-disc pl-5 space-y-3">
                        {viewWorksheet.materialUrls.map((url, idx) => (
                          <li key={url} className="flex items-center gap-2">
                            <a href={url} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline font-medium flex items-center gap-1">
                              <FileText className="h-4 w-4 text-blue-400" />
                              {viewWorksheet.materialNames[idx] || `Material ${idx + 1}`}
                            </a>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div className="italic text-gray-400">No reference materials attached.</div>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}