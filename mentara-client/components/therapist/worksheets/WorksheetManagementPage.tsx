'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
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

export function WorksheetManagementPage() {
  const api = useApi();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

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

  // Fetch matched clients for quick assignment
  const { data: matchedClientsData, isLoading: clientsLoading } = useMatchedClients();

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
        <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
          <TabsTrigger value="worksheets">My Worksheets</TabsTrigger>
          <TabsTrigger value="assign">Quick Assign</TabsTrigger>
        </TabsList>

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
                variant={statusFilter === 'IN_PROGRESS' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter('IN_PROGRESS')}
              >
                In Progress
              </Button>
              <Button
                variant={statusFilter === 'COMPLETED' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter('COMPLETED')}
              >
                Completed
              </Button>
            </div>
          </div>

          {/* Worksheets List */}
          <div className="space-y-4">
            {filteredWorksheets.length === 0 ? (
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
              filteredWorksheets.map((worksheet: Worksheet) => (
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
                        <Button variant="outline" size="sm">
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
          <Card>
            <CardHeader>
              <CardTitle>Active Clients</CardTitle>
              <p className="text-sm text-muted-foreground">
                Quickly assign worksheets to your active clients
              </p>
            </CardHeader>
            <CardContent>
              {activeClients.length === 0 ? (
                <div className="text-center py-8">
                  <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">No Active Clients</h3>
                  <p className="text-muted-foreground">
                    You don't have any active clients yet.
                  </p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {activeClients.map((match) => (
                    <div
                      key={match.client.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={match.client.profilePicture} />
                          <AvatarFallback>
                            {match.client.firstName[0]}{match.client.lastName[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">
                            {match.client.firstName} {match.client.lastName}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {match.client.email}
                          </p>
                        </div>
                      </div>
                      
                      <WorksheetAssignmentDialog
                        client={{
                          id: match.client.id,
                          firstName: match.client.firstName,
                          lastName: match.client.lastName,
                          email: match.client.email,
                          profilePicture: match.client.profilePicture,
                          assessmentInfo: match.assessmentInfo,
                        }}
                        trigger={
                          <Button>
                            <Plus className="h-4 w-4 mr-2" />
                            Assign Worksheet
                          </Button>
                        }
                      />
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}