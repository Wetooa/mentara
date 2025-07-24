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
  Search, 
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  User,
  Edit,
  Upload,
  Eye,
  MoreHorizontal
} from 'lucide-react';

import { useMatchedClients } from '@/hooks/therapist/useMatchedClients';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { useAuth } from '@/contexts/AuthContext';
import type { Worksheet } from '@/types/api/worksheets';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import CreateWorksheetModal from '@/components/worksheets/CreateWorksheetModal';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

export function WorksheetManagementPage() {
  const api = useApi();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [viewWorksheet, setViewWorksheet] = useState<Worksheet | null>(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editingWorksheet, setEditingWorksheet] = useState<Worksheet | null>(null);

  // Fetch therapist's worksheets
  const { data: worksheetData, isLoading: worksheetsLoading } = useQuery({
    queryKey: ['therapist', 'worksheets', statusFilter, user?.id],
    queryFn: async () => {
      if (!user?.id) return { worksheets: [], total: 0, hasMore: false };
      const params: { therapistId: string; status?: string } = { therapistId: user.id };
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
    mutationFn: async ({ worksheetId, feedback }: { worksheetId: string; feedback?: string }) => {
      return api.therapists.worksheets.markAsReviewed(worksheetId, feedback);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['therapist', 'worksheets'] });
      toast.success("Worksheet marked as reviewed successfully!");
    },
    onError: (error) => {
      console.error("Error marking worksheet as reviewed:", error);
      toast.error("Failed to mark worksheet as reviewed. Please try again.");
    },
  });

  // Mutation for editing worksheet
  const editWorksheetMutation = useMutation({
    mutationFn: async ({ worksheetId, updateData }: { 
      worksheetId: string; 
      updateData: { title?: string; instructions?: string; dueDate?: string; status?: string; }
    }) => {
      return api.therapists.worksheets.edit(worksheetId, updateData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['therapist', 'worksheets'] });
      toast.success("Worksheet updated successfully!");
      setEditingWorksheet(null);
    },
    onError: (error) => {
      console.error("Error updating worksheet:", error);
      toast.error("Failed to update worksheet. Please try again.");
    },
  });

  // Mutation for uploading reference file
  const uploadReferenceMutation = useMutation({
    mutationFn: async ({ worksheetId, file }: { worksheetId: string; file: File }) => {
      return api.therapists.worksheets.uploadReferenceFile(worksheetId, file);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['therapist', 'worksheets'] });
      toast.success("Reference file uploaded successfully!");
    },
    onError: (error) => {
      console.error("Error uploading reference file:", error);
      toast.error("Failed to upload reference file. Please try again.");
    },
  });

  // Handler functions
  const handleEditWorksheet = (worksheet: Worksheet) => {
    setEditingWorksheet(worksheet);
  };

  const handleUploadReference = (worksheetId: string) => {
    // Create a hidden file input
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.pdf,.doc,.docx,.txt,.jpg,.png';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        uploadReferenceMutation.mutate({ worksheetId, file });
      }
    };
    input.click();
  };

  const handleMarkAsReviewed = (worksheetId: string, feedback?: string) => {
    markAsReviewedMutation.mutate({ worksheetId, feedback });
  };

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
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEditWorksheet(worksheet)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit Worksheet
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleUploadReference(worksheet.id)}>
                              <Upload className="h-4 w-4 mr-2" />
                              Upload Reference File
                            </DropdownMenuItem>
                            {worksheet.status === 'SUBMITTED' && (
                              <DropdownMenuItem onClick={() => handleMarkAsReviewed(worksheet.id)}>
                                <Eye className="h-4 w-4 mr-2" />
                                Mark as Reviewed
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
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
                              disabled={markAsReviewedMutation.isPending}
                              onClick={() => handleMarkAsReviewed(worksheet.id)}
                            >
                              {markAsReviewedMutation.isPending ? 'Marking...' : 'Mark as Reviewed'}
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

      {/* Edit Worksheet Dialog */}
      <Dialog open={!!editingWorksheet} onOpenChange={open => !open && setEditingWorksheet(null)}>
        <DialogContent className="max-w-2xl">
          {editingWorksheet && (
            <>
              <DialogHeader>
                <DialogTitle>Edit Worksheet</DialogTitle>
                <DialogDescription>
                  Update the worksheet details and content.
                </DialogDescription>
              </DialogHeader>
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  const updateData = {
                    title: formData.get('title') as string,
                    instructions: formData.get('instructions') as string,
                    dueDate: formData.get('dueDate') as string,
                  };
                  editWorksheetMutation.mutate({
                    worksheetId: editingWorksheet.id,
                    updateData,
                  });
                }}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    name="title"
                    defaultValue={editingWorksheet.title}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="instructions">Instructions</Label>
                  <Textarea
                    id="instructions"
                    name="instructions"
                    defaultValue={editingWorksheet.instructions || ''}
                    rows={4}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dueDate">Due Date</Label>
                  <Input
                    id="dueDate"
                    name="dueDate"
                    type="datetime-local"
                    defaultValue={editingWorksheet.dueDate ? new Date(editingWorksheet.dueDate).toISOString().slice(0, 16) : ''}
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setEditingWorksheet(null)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={editWorksheetMutation.isPending}
                  >
                    {editWorksheetMutation.isPending ? 'Updating...' : 'Update Worksheet'}
                  </Button>
                </div>
              </form>
            </>
          )}
        </DialogContent>
      </Dialog>

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