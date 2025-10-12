'use client';

import { useMatchedClients } from '@/hooks/therapist/useMatchedClients';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Users, 
  Clock, 
  UserCheck, 
  Calendar,
  MessageCircle,
  AlertCircle,
  RefreshCw,
  TrendingUp,
  Activity
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { QuickAssignButton } from '../worksheets/WorksheetAssignmentDialog';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface MatchedClient {
  relationshipId: string;
  client: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    profilePicture?: string;
    joinedAt: string;
  };
  matchInfo: {
    assignedAt: string;
    status: 'PENDING' | 'ACTIVE';
    daysSinceMatch: number;
  };
  assessmentInfo: {
    hasAssessment: boolean;
    completedAt?: string;
    assessmentType?: string;
    daysSinceAssessment?: number;
  };
}

interface MatchedClientsData {
  recentMatches: MatchedClient[];
  allMatches: MatchedClient[];
  summary: {
    totalRecentMatches: number;
    totalAllMatches: number;
    totalMatches: number;
  };
}

export function MatchedClientsSection() {
  const { data, isLoading, error, refetch } = useMatchedClients();

  // Enhanced loading state with better skeleton design
  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Summary cards skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="bg-secondary/5">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-6 w-16" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        {/* Recent matches skeleton */}
        <Card className="bg-white">
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Skeleton className="h-8 w-20" />
                  <Skeleton className="h-8 w-20" />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  // Enhanced error state with better UX and user-friendly messaging
  if (error) {
    // Check if this might be a "no clients" scenario rather than a real error
    const errorMessage = (error as any)?.response?.status === 404 
      ? "No clients assigned yet - please wait for client assignments"
      : "Unable to load client information at the moment";
    
    return (
      <Alert className="border-blue-200 bg-blue-50">
        <AlertCircle className="h-4 w-4 text-blue-600" />
        <AlertDescription className="flex items-center justify-between text-blue-800">
          <div className="space-y-1">
            <span className="font-medium">{errorMessage}</span>
            {(error as any)?.response?.status === 404 && (
              <p className="text-sm text-blue-700">
                New therapists typically receive client assignments within 24-48 hours of profile completion.
              </p>
            )}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            className="ml-4 border-blue-300 text-blue-700 hover:bg-blue-100"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  const matchedData = data as MatchedClientsData;
  const { recentMatches, allMatches, summary } = matchedData || {
    recentMatches: [],
    allMatches: [],
    summary: { totalRecentMatches: 0, totalAllMatches: 0, totalMatches: 0 }
  };

  const handleViewAllMatches = () => {
    // Navigate to all matches page
    window.location.href = '/therapist/clients';
  };

  const handleStartConversation = (clientId: string, clientName: string) => {
    // Navigate to conversation
    window.location.href = `/therapist/messages?client=${clientId}`;
    toast.success(`Starting conversation with ${clientName}`);
  };

  return (
    <div className="space-y-6">
      {/* Enhanced Summary Cards with professional healthcare theme */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="bg-white border-2 hover:border-secondary/30 hover:shadow-lg transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="bg-secondary p-3 rounded-xl shadow-sm">
                <UserCheck className="h-5 w-5 text-secondary-foreground" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">Recent Matches</p>
                <p className="text-xs text-gray-500 mb-1">Last 30 days</p>
                <p className="text-2xl font-bold text-gray-900">{summary.totalRecentMatches}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-2 hover:border-secondary/30 hover:shadow-lg transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="bg-secondary/80 p-3 rounded-xl shadow-sm">
                <Users className="h-5 w-5 text-secondary-foreground" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">Total Clients</p>
                <p className="text-xs text-gray-500 mb-1">All time</p>
                <p className="text-2xl font-bold text-gray-900">{summary.totalMatches}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-2 hover:border-secondary/30 hover:shadow-lg transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="bg-secondary/60 p-3 rounded-xl shadow-sm">
                <Activity className="h-5 w-5 text-secondary-foreground" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">Active Rate</p>
                <p className="text-xs text-gray-500 mb-1">Client engagement</p>
                <p className="text-2xl font-bold text-gray-900">
                  {summary.totalMatches > 0 ? Math.round((summary.totalRecentMatches / summary.totalMatches) * 100) : 0}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Recent Matches Section */}
      {recentMatches.length > 0 && (
        <Card className="bg-white border-gray-200">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-secondary p-2 rounded-lg">
                  <UserCheck className="h-5 w-5 text-secondary-foreground" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Recent Client Matches</h3>
                  <p className="text-sm text-gray-600">New connections from the last 30 days</p>
                </div>
              </div>
              <Badge variant="secondary" className="bg-secondary/10 text-secondary border-secondary/30">
                {recentMatches.length} new
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 space-y-4">
            {recentMatches.slice(0, 4).map((match) => (
              <div
                key={match.relationshipId}
                className={cn(
                  "group flex items-center justify-between p-4 rounded-xl border transition-all duration-300",
                  "bg-white hover:bg-gradient-to-r hover:from-secondary/5 hover:to-white",
                  "border-slate-200 hover:border-secondary/30 hover:shadow-md"
                )}
              >
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <Avatar className="h-12 w-12 ring-2 ring-secondary/20 group-hover:ring-secondary/40 transition-all">
                      <AvatarImage src={match.client.profilePicture} />
                      <AvatarFallback className="bg-gradient-to-br from-secondary/20 to-secondary/10 text-secondary font-semibold">
                        {match.client.firstName[0]}{match.client.lastName[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute -bottom-1 -right-1 h-4 w-4 bg-green-500 rounded-full border-2 border-white"></div>
                  </div>
                  <div className="space-y-1">
                    <p className="font-semibold text-gray-900 group-hover:text-secondary transition-colors">
                      {match.client.firstName} {match.client.lastName}
                    </p>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3 text-secondary" />
                        <span className="font-medium">{match.matchInfo.daysSinceMatch}</span> days ago
                      </span>
                      {match.assessmentInfo.hasAssessment && (
                        <Badge variant="outline" className="text-xs bg-secondary/10 border-secondary/30 text-secondary">
                          {match.assessmentInfo.assessmentType}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    variant="outline"
                    className="border-secondary/30 text-secondary hover:bg-secondary/10"
                    onClick={() => handleStartConversation(
                      match.client.id, 
                      `${match.client.firstName} ${match.client.lastName}`
                    )}
                  >
                    <MessageCircle className="h-4 w-4 mr-1" />
                    Message
                  </Button>
                  <QuickAssignButton
                    client={{
                      id: match.client.id,
                      firstName: match.client.firstName,
                      lastName: match.client.lastName,
                      email: match.client.email,
                      profilePicture: match.client.profilePicture,
                      assessmentInfo: match.assessmentInfo,
                    }}
                    variant="outline"
                    size="sm"
                    className="border-slate-300 text-slate-700 hover:bg-slate-100"
                  />
                  <Button 
                    size="sm" 
                    className="bg-secondary hover:bg-secondary/90 text-secondary-foreground"
                  >
                    Schedule
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Enhanced Empty State */}
      {summary.totalMatches === 0 && (
        <Card className="bg-white border-gray-200">
          <CardContent className="p-12 text-center">
            <div className="bg-gradient-to-br from-secondary/20 to-secondary/10 p-6 rounded-2xl w-fit mx-auto mb-6 shadow-sm">
              <Users className="h-12 w-12 text-secondary" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Welcome to Your Client Dashboard!</h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto leading-relaxed">
              Your matched clients will appear here once the matching algorithm connects you with clients who need your expertise. 
              Great things are coming!
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button 
                variant="outline" 
                className="border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                <UserCheck className="h-4 w-4 mr-2" />
                Review Profile
              </Button>
              <Button 
                className="bg-secondary hover:bg-secondary/90 text-secondary-foreground"
              >
                <TrendingUp className="h-4 w-4 mr-2" />
                View Analytics
              </Button>
            </div>
            <div className="mt-8 p-4 bg-secondary/10 rounded-lg border border-secondary/30">
              <p className="text-sm text-gray-700">
                <strong>💡 Tip:</strong> Make sure your profile is complete and your specializations are up-to-date to attract the right clients.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}