'use client';

import { useMatchedClients } from '@/hooks/therapist/useMatchedClients';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Users, 
  Clock, 
  UserCheck, 
  Calendar,
  MessageCircle
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { QuickAssignButton } from '../worksheets/WorksheetAssignmentDialog';
import { toast } from 'sonner';

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
  const { data, isLoading, error } = useMatchedClients();

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-8 w-20" />
        </div>
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-20 w-full" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <div className="text-red-500 mb-2">Failed to load matched clients</div>
          <Button variant="outline" onClick={() => window.location.reload()}>
            Retry
          </Button>
        </CardContent>
      </Card>
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
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="bg-green-100 p-2 rounded-full">
                <UserCheck className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Recent Matches (30 days)</p>
                <p className="text-2xl font-semibold">{summary.totalRecentMatches}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 p-2 rounded-full">
                <Users className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Clients</p>
                <p className="text-2xl font-semibold">{summary.totalMatches}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Matches Section */}
      {recentMatches.length > 0 && (
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2">
              <UserCheck className="h-5 w-5 text-green-600" />
              Recent Matches ({recentMatches.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-3">
              {recentMatches.slice(0, 4).map((match) => (
                <div
                  key={match.relationshipId}
                  className="flex items-center justify-between p-3 bg-green-50 rounded-lg border"
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
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          Connected {match.matchInfo.daysSinceMatch} days ago
                        </span>
                        {match.assessmentInfo.hasAssessment && (
                          <Badge variant="outline" className="text-xs">
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
                    />
                    <Button size="sm">
                      Schedule
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {summary.totalMatches === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <div className="bg-gray-100 p-4 rounded-full w-fit mx-auto mb-4">
              <Users className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="font-semibold mb-2">No Matched Clients Yet</h3>
            <p className="text-muted-foreground mb-4">
              You&apos;ll see client requests and new matches here once clients start sending requests.
            </p>
            <Button variant="outline">
              Review Profile
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}