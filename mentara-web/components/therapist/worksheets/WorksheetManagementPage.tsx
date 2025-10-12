'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
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
  MoreHorizontal,
  X,
  Trash2,
  Plus
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
  const router = useRouter();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [clientFilter, setClientFilter] = useState<string>('all');
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editingWorksheet, setEditingWorksheet] = useState<Worksheet | null>(null);
  const [filesToRemove, setFilesToRemove] = useState<string[]>([]);
  const [newFiles, setNewFiles] = useState<File[]>([]);

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

  // Enhanced filtering function
  const filterWorksheets = (worksheets: Worksheet[]) => {
    return worksheets.filter((worksheet) => {
      // Search term filter - check both worksheet title and patient name
      const matchesSearch = searchTerm === '' || 
        worksheet.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        `${worksheet.client.user.firstName} ${worksheet.client.user.lastName}`.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Client filter
      const matchesClient = clientFilter === 'all' || worksheet.clientId === clientFilter;
      
      return matchesSearch && matchesClient;
    });
  };

  // Filter worksheets for each tab with enhanced search
  const allFilteredWorksheets = filterWorksheets(worksheets);
  const completedWorksheets = allFilteredWorksheets.filter((w) => w.status === 'SUBMITTED');
  const nonCompletedWorksheets = allFilteredWorksheets.filter((w) => w.status !== 'SUBMITTED');

  // Get unique clients from worksheets
  const uniqueClients = Array.from(
    new Map(worksheets.map(w => [
      w.clientId, 
      { 
        id: w.clientId, 
        name: `${w.client.user.firstName} ${w.client.user.lastName}`,
        avatarUrl: w.client.user.avatarUrl 
      }
    ])).values()
  );

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
    mutationFn: async ({ worksheetId, updateData, filesToRemove, newFiles }: { 
      worksheetId: string; 
      updateData: { title?: string; instructions?: string; dueDate?: string; status?: string; };
      filesToRemove: string[];
      newFiles: File[];
    }) => {
      // First update the worksheet
      const result = await api.therapists.worksheets.edit(worksheetId, updateData);
      
      // Remove files
      for (const fileUrl of filesToRemove) {
        await api.therapists.worksheets.removeReferenceFile(worksheetId, fileUrl);
      }
      
      // Upload new files
      for (const file of newFiles) {
        await api.therapists.worksheets.uploadReferenceFile(worksheetId, file);
      }
      
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['therapist', 'worksheets'] });
      toast.success("Worksheet updated successfully!");
      setEditingWorksheet(null);
      setFilesToRemove([]);
      setNewFiles([]);
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

  // Mutation for removing reference file
  const removeReferenceMutation = useMutation({
    mutationFn: async ({ worksheetId, fileUrl }: { worksheetId: string; fileUrl: string }) => {
      return api.therapists.worksheets.removeReferenceFile(worksheetId, fileUrl);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['therapist', 'worksheets'] });
      toast.success("Reference file removed successfully!");
    },
    onError: (error) => {
      console.error("Error removing reference file:", error);
      toast.error("Failed to remove reference file. Please try again.");
    },
  });

  // Handler functions
  const handleViewWorksheet = (worksheetId: string) => {
    router.push(`/therapist/worksheets/${worksheetId}`);
  };

  const handleEditWorksheet = (worksheet: Worksheet) => {
    setEditingWorksheet(worksheet);
    setFilesToRemove([]);
    setNewFiles([]);
  };

  const handleFileUpload = (files: FileList | null) => {
    if (files) {
      setNewFiles(prev => [...prev, ...Array.from(files)]);
    }
  };

  const handleRemoveNewFile = (index: number) => {
    setNewFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleRemoveExistingFile = (fileUrl: string) => {
    setFilesToRemove(prev => [...prev, fileUrl]);
  };

  const handleRestoreExistingFile = (fileUrl: string) => {
    setFilesToRemove(prev => prev.filter(url => url !== fileUrl));
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
        return 'bg-secondary/10 text-secondary border-secondary/30';
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
      {/* Enhanced Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3 text-gray-900">
            <div className="p-2 bg-secondary rounded-lg">
              <FileText className="h-7 w-7 text-secondary-foreground" />
            </div>
            Worksheet Management
          </h1>
          <p className="text-gray-600 mt-2 text-lg">
            Create, assign, and track worksheets for your clients
          </p>
          <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span>{completedWorksheets.length} completed</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-secondary rounded-full"></div>
              <span>{nonCompletedWorksheets.length} in progress</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
              <span>{allFilteredWorksheets.length} total</span>
            </div>
          </div>
        </div>
      </div>

      <Tabs defaultValue="worksheets" className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
          <Button 
            onClick={() => setCreateModalOpen(true)} 
            variant="default"
            className="bg-secondary hover:bg-secondary/90 text-secondary-foreground px-6 py-2.5 rounded-lg font-medium shadow-sm transition-all duration-200 hover:shadow-md"
          >
            <FileText className="h-4 w-4 mr-2" />
            Create New Worksheet
          </Button>
          <div className="flex-1" />
          <TabsList className="grid w-full sm:w-auto grid-cols-2 bg-gray-100 p-1 rounded-lg">
            <TabsTrigger 
              value="worksheets"
              className="data-[state=active]:bg-secondary data-[state=active]:text-secondary-foreground data-[state=active]:shadow-sm px-6 py-2 rounded-md transition-all"
            >
              My Worksheets ({nonCompletedWorksheets.length})
            </TabsTrigger>
            <TabsTrigger 
              value="assign"
              className="data-[state=active]:bg-secondary data-[state=active]:text-secondary-foreground data-[state=active]:shadow-sm px-6 py-2 rounded-md transition-all"
            >
              Client Submissions ({completedWorksheets.length})
            </TabsTrigger>
          </TabsList>
        </div>
        <CreateWorksheetModal isOpen={createModalOpen} onClose={() => setCreateModalOpen(false)} />

        {/* Worksheets Tab */}
        <TabsContent value="worksheets" className="space-y-6">
          {/* Enhanced Search and Filters */}
          <Card className="p-4 bg-white border-gray-200 shadow-sm">
            <div className="flex flex-col gap-4">
              {/* Search Bar */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by worksheet title or client name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2.5 border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary/30 focus:border-secondary transition-all"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
              
              {/* Filters Row */}
              <div className="flex flex-col md:flex-row gap-4">
                {/* Client Filter */}
                <div className="flex items-center gap-2">
                  <Label className="text-sm font-medium text-gray-700 whitespace-nowrap">Client:</Label>
                  <div className="flex gap-2 flex-wrap">
                    <Button
                      variant={clientFilter === 'all' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setClientFilter('all')}
                      className={clientFilter === 'all' ? 'bg-secondary hover:bg-secondary/90' : 'hover:bg-secondary/10'}
                    >
                      All Clients
                    </Button>
                    {uniqueClients.map((client) => (
                      <Button
                        key={client.id}
                        variant={clientFilter === client.id ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setClientFilter(client.id)}
                        className={clientFilter === client.id ? 'bg-primary hover:bg-primary/90' : 'hover:bg-primary/10'}
                      >
                        {client.name}
                      </Button>
                    ))}
                  </div>
                </div>
                
                {/* Status Filter */}
                <div className="flex items-center gap-2">
                  <Label className="text-sm font-medium text-gray-700 whitespace-nowrap">Status:</Label>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant={statusFilter === 'all' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setStatusFilter('all')}
                      className={statusFilter === 'all' ? 'bg-secondary hover:bg-secondary/90' : ''}
                    >
                      All
                    </Button>
                    <Button
                      variant={statusFilter === 'ASSIGNED' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setStatusFilter('ASSIGNED')}
                      className={statusFilter === 'ASSIGNED' ? 'bg-secondary hover:bg-secondary/90' : ''}
                    >
                      <Clock className="h-3 w-3 mr-1" />
                      Assigned
                    </Button>
                    <Button
                      variant={statusFilter === 'OVERDUE' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setStatusFilter('OVERDUE')}
                      className={statusFilter === 'OVERDUE' ? 'bg-secondary hover:bg-secondary/90' : ''}
                    >
                      <AlertCircle className="h-3 w-3 mr-1" />
                      Overdue
                    </Button>
                    <Button
                      variant={statusFilter === 'REVIEWED' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setStatusFilter('REVIEWED')}
                      className={statusFilter === 'REVIEWED' ? 'bg-secondary hover:bg-secondary/90' : ''}
                    >
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Reviewed
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </Card>

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
                <Card key={worksheet.id} className="group hover:shadow-lg hover:-translate-y-1 transition-all duration-300 border-l-4 border-l-secondary bg-white">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 space-y-3">
                        <div className="flex items-center gap-3">
                          <h3 className="font-semibold text-lg text-gray-900 group-hover:text-secondary transition-colors">
                            {worksheet.title}
                          </h3>
                          <Badge variant="outline" className={`${getStatusColor(worksheet.status)} font-medium`}>
                            {getStatusIcon(worksheet.status)}
                            <span className="ml-1">{worksheet.status.replace('_', ' ')}</span>
                          </Badge>
                        </div>
                        
                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-2 bg-primary/5 px-3 py-1.5 rounded-full border border-primary/20">
                            <Avatar className="h-5 w-5">
                              <AvatarImage src={worksheet.client.user.avatarUrl} />
                              <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                                {worksheet.client.user.firstName[0]}{worksheet.client.user.lastName[0]}
                              </AvatarFallback>
                            </Avatar>
                            <span className="font-medium text-gray-900">
                              {worksheet.client.user.firstName} {worksheet.client.user.lastName}
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-1.5 text-gray-500">
                            <Calendar className="h-4 w-4" />
                            <span>Created {format(new Date(worksheet.createdAt), 'MMM d, yyyy')}</span>
                          </div>
                          
                          {worksheet.dueDate && (
                            <div className="flex items-center gap-1.5 text-gray-500">
                              <Clock className="h-4 w-4" />
                              <span>Due {format(new Date(worksheet.dueDate), 'MMM d, yyyy')}</span>
                            </div>
                          )}
                        </div>
                        
                        {worksheet.instructions && (
                          <p className="text-sm text-gray-600 line-clamp-2 bg-gray-50 p-3 rounded-lg border-l-2 border-l-secondary/30">
                            {worksheet.instructions}
                          </p>
                        )}
                      </div>
                      
                      <div className="flex gap-2 ml-6">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleViewWorksheet(worksheet.id)}
                          className="bg-secondary/5 border-secondary/30 text-secondary hover:bg-secondary/10 hover:border-secondary/40 transition-all duration-200 shadow-sm"
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm" className="hover:bg-gray-50 transition-colors">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem onClick={() => handleEditWorksheet(worksheet)} className="cursor-pointer">
                              <Edit className="h-4 w-4 mr-2" />
                              Edit Worksheet
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleUploadReference(worksheet.id)} className="cursor-pointer">
                              <Upload className="h-4 w-4 mr-2" />
                              Upload Reference File
                            </DropdownMenuItem>
                            {worksheet.status === 'SUBMITTED' && (
                              <DropdownMenuItem onClick={() => handleMarkAsReviewed(worksheet.id)} className="cursor-pointer">
                                <CheckCircle className="h-4 w-4 mr-2" />
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

        {/* Client Submissions Tab */}
        <TabsContent value="assign" className="space-y-6">
          {/* Enhanced Completed Worksheets Section */}
          <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-green-800">
                <CheckCircle className="h-5 w-5" />
                Completed Worksheets
              </CardTitle>
              <p className="text-sm text-green-700">
                Worksheets that have been completed by your clients and are ready for review
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
                    <Card key={worksheet.id} className="group hover:shadow-lg hover:-translate-y-1 transition-all duration-300 border-l-4 border-l-green-500 bg-white">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 space-y-3">
                            <div className="flex items-center gap-3">
                              <h3 className="font-semibold text-lg text-gray-900 group-hover:text-green-700 transition-colors">
                                {worksheet.title}
                              </h3>
                              <Badge variant="outline" className={`${getStatusColor(worksheet.status)} font-medium`}>
                                {getStatusIcon(worksheet.status)}
                                <span className="ml-1">{worksheet.status.replace('_', ' ')}</span>
                              </Badge>
                            </div>
                            
                            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                              <div className="flex items-center gap-2 bg-green-50 px-3 py-1.5 rounded-full border border-green-200">
                                <Avatar className="h-5 w-5">
                                  <AvatarImage src={worksheet.client.user.avatarUrl} />
                                  <AvatarFallback className="text-xs bg-green-100 text-green-700">
                                    {worksheet.client.user.firstName[0]}{worksheet.client.user.lastName[0]}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="font-medium text-green-800">
                                  {worksheet.client.user.firstName} {worksheet.client.user.lastName}
                                </span>
                              </div>
                              
                              <div className="flex items-center gap-1.5 text-gray-500">
                                <Calendar className="h-4 w-4" />
                                <span>Created {format(new Date(worksheet.createdAt), 'MMM d, yyyy')}</span>
                              </div>
                              
                              {worksheet.dueDate && (
                                <div className="flex items-center gap-1.5 text-gray-500">
                                  <Clock className="h-4 w-4" />
                                  <span>Due {format(new Date(worksheet.dueDate), 'MMM d, yyyy')}</span>
                                </div>
                              )}
                            </div>
                            
                            {worksheet.instructions && (
                              <p className="text-sm text-gray-600 line-clamp-2 bg-green-50 p-3 rounded-lg border-l-2 border-l-green-300">
                                {worksheet.instructions}
                              </p>
                            )}
                          </div>
                          
                          <div className="flex flex-col gap-2 ml-6 items-end">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => handleViewWorksheet(worksheet.id)}
                              className="bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100 hover:border-blue-300 transition-all duration-200 shadow-sm"
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </Button>
                            <Button
                              variant="default"
                              size="sm"
                              disabled={markAsReviewedMutation.isPending}
                              onClick={() => handleMarkAsReviewed(worksheet.id)}
                              className="bg-green-600 hover:bg-green-700 text-white shadow-sm transition-all duration-200"
                            >
                              {markAsReviewedMutation.isPending ? (
                                <div className="flex items-center">
                                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-2" />
                                  Marking...
                                </div>
                              ) : (
                                <>
                                  <CheckCircle className="h-4 w-4 mr-2" />
                                  Mark as Reviewed
                                </>
                              )}
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
                  const dueDateValue = formData.get('dueDate') as string;
                  
                  const updateData = {
                    title: formData.get('title') as string,
                    instructions: formData.get('instructions') as string,
                    dueDate: dueDateValue ? new Date(dueDateValue).toISOString() : undefined,
                  };
                  editWorksheetMutation.mutate({
                    worksheetId: editingWorksheet.id,
                    updateData,
                    filesToRemove,
                    newFiles,
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

                {/* File Management Section */}
                <div className="space-y-4 border-t pt-4">
                  <Label className="text-base font-medium">Reference Files</Label>
                  
                  {/* Existing Files */}
                  {editingWorksheet.materialUrls && editingWorksheet.materialUrls.length > 0 && (
                    <div className="space-y-2">
                      <Label className="text-sm text-gray-600">Current Files</Label>
                      <div className="space-y-2">
                        {editingWorksheet.materialUrls.map((url, index) => {
                          const fileName = editingWorksheet.materialNames?.[index] || `File ${index + 1}`;
                          const isMarkedForRemoval = filesToRemove.includes(url);
                          
                          return (
                            <div
                              key={url}
                              className={`flex items-center justify-between p-3 border rounded-lg transition-all ${
                                isMarkedForRemoval 
                                  ? 'bg-red-50 border-red-200 opacity-60' 
                                  : 'bg-gray-50 border-gray-200'
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <FileText className="h-4 w-4 text-gray-500" />
                                <span className={`text-sm ${isMarkedForRemoval ? 'line-through text-gray-500' : 'text-gray-700'}`}>
                                  {fileName}
                                </span>
                                {isMarkedForRemoval && (
                                  <span className="text-xs text-red-600 bg-red-100 px-2 py-1 rounded">
                                    Will be removed
                                  </span>
                                )}
                              </div>
                              <div className="flex gap-1">
                                {!isMarkedForRemoval ? (
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleRemoveExistingFile(url)}
                                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                ) : (
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleRestoreExistingFile(url)}
                                    className="text-green-600 hover:text-green-700 hover:bg-green-50"
                                  >
                                    Restore
                                  </Button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* New Files */}
                  {newFiles.length > 0 && (
                    <div className="space-y-2">
                      <Label className="text-sm text-gray-600">New Files to Upload</Label>
                      <div className="space-y-2">
                        {newFiles.map((file, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg"
                          >
                            <div className="flex items-center gap-2">
                              <FileText className="h-4 w-4 text-blue-500" />
                              <span className="text-sm text-blue-700">{file.name}</span>
                              <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded">
                                New
                              </span>
                            </div>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => handleRemoveNewFile(index)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* File Upload */}
                  <div>
                    <Label className="text-sm text-gray-600">Add Files</Label>
                    <div className="mt-2">
                      <input
                        type="file"
                        multiple
                        accept=".pdf,.doc,.docx,.txt,.jpg,.png,.jpeg"
                        onChange={(e) => handleFileUpload(e.target.files)}
                        className="hidden"
                        id="file-upload"
                      />
                      <Label
                        htmlFor="file-upload"
                        className="flex items-center justify-center w-full p-4 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors"
                      >
                        <div className="text-center">
                          <Plus className="h-6 w-6 text-gray-400 mx-auto mb-2" />
                          <span className="text-sm text-gray-600">
                            Click to upload files or drag and drop
                          </span>
                          <span className="text-xs text-gray-500 block mt-1">
                            PDF, DOC, DOCX, TXT, JPG, PNG (Max 10MB each)
                          </span>
                        </div>
                      </Label>
                    </div>
                  </div>
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


    </div>
  );
}