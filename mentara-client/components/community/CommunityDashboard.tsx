'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useApi } from '@/lib/api';
import { queryKeys } from '@/lib/queryKeys';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  MessageCircle, 
  TrendingUp, 
  Clock,
  Plus,
  Search,
  Filter,
  Star,
  Activity,
  UserPlus,
  Eye
} from 'lucide-react';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';

interface Community {
  id: string;
  name: string;
  description: string;
  memberCount: number;
  postCount: number;
  avatarUrl?: string;
  category: string;
  isJoined: boolean;
  isPrivate: boolean;
  compatibilityScore?: number;
  lastActivity: string;
  moderators: Array<{
    id: string;
    name: string;
    avatarUrl?: string;
  }>;
}

interface RecentActivity {
  id: string;
  type: 'post' | 'comment' | 'join' | 'like';
  user: {
    id: string;
    name: string;
    avatarUrl?: string;
  };
  community: {
    id: string;
    name: string;
  };
  content?: string;
  timestamp: string;
  postId?: string;
}

interface CommunityStats {
  totalCommunities: number;
  joinedCommunities: number;
  totalPosts: number;
  totalComments: number;
  weeklyActivity: number;
}

export function CommunityDashboard() {
  const api = useApi();
  const [activeTab, setActiveTab] = useState<'overview' | 'discover' | 'activity'>('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Fetch user's communities
  const { data: userCommunities, isLoading: communitiesLoading } = useQuery({
    queryKey: queryKeys.communities.joined(),
    queryFn: () => api.communities.getJoined(),
    staleTime: 5 * 60 * 1000,
  });

  // Fetch recommended communities
  const { data: recommendedCommunities, isLoading: recommendedLoading } = useQuery({
    queryKey: queryKeys.communities.recommended(),
    queryFn: () => api.communities.getRecommended(),
    staleTime: 10 * 60 * 1000,
  });

  // Fetch recent activity
  const { data: recentActivity, isLoading: activityLoading } = useQuery({
    queryKey: queryKeys.communities.activity(),
    queryFn: () => api.communities.getRecentActivity(),
    refetchInterval: 30 * 1000, // Refresh every 30 seconds
    staleTime: 30 * 1000,
  });

  // Fetch community stats
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: queryKeys.communities.stats(),
    queryFn: () => api.communities.getStats(),
    staleTime: 5 * 60 * 1000,
  });

  const handleJoinCommunity = async (communityId: string) => {
    try {
      await api.communities.join(communityId);
      toast.success('Successfully joined community!');
      // Refresh communities data
      queryClient.invalidateQueries({ queryKey: queryKeys.communities.all });
    } catch (error) {
      toast.error('Failed to join community. Please try again.');
    }
  };

  const handleLeaveCommunity = async (communityId: string) => {
    try {
      await api.communities.leave(communityId);
      toast.success('Successfully left community');
      // Refresh communities data
      queryClient.invalidateQueries({ queryKey: queryKeys.communities.all });
    } catch (error) {
      toast.error('Failed to leave community. Please try again.');
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'post': return <MessageCircle className="h-4 w-4" />;
      case 'comment': return <MessageCircle className="h-4 w-4" />;
      case 'join': return <UserPlus className="h-4 w-4" />;
      case 'like': return <Star className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  const getActivityText = (activity: RecentActivity) => {
    switch (activity.type) {
      case 'post':
        return `posted in ${activity.community.name}`;
      case 'comment':
        return `commented in ${activity.community.name}`;
      case 'join':
        return `joined ${activity.community.name}`;
      case 'like':
        return `liked a post in ${activity.community.name}`;
      default:
        return `activity in ${activity.community.name}`;
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Communities</h1>
          <p className="text-muted-foreground">
            Connect with others who share similar experiences and goals
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Create Community
        </Button>
      </div>

      {/* Stats Overview */}
      {statsLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      ) : stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Joined Communities</p>
                  <p className="text-2xl font-bold">{stats.joinedCommunities}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <MessageCircle className="h-5 w-5 text-green-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Your Posts</p>
                  <p className="text-2xl font-bold">{stats.totalPosts}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5 text-purple-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Comments Made</p>
                  <p className="text-2xl font-bold">{stats.totalComments}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Activity className="h-5 w-5 text-orange-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Weekly Activity</p>
                  <p className="text-2xl font-bold">{stats.weeklyActivity}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="discover">Discover</TabsTrigger>
          <TabsTrigger value="activity">Recent Activity</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* My Communities */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  My Communities
                </CardTitle>
              </CardHeader>
              <CardContent>
                {communitiesLoading ? (
                  <div className="space-y-3">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <Skeleton key={i} className="h-16" />
                    ))}
                  </div>
                ) : userCommunities && userCommunities.length > 0 ? (
                  <div className="space-y-3">
                    {userCommunities.slice(0, 5).map((community: Community) => (
                      <div key={community.id} className="flex items-center justify-between p-3 rounded-lg border">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold">
                            {community.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-medium">{community.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {community.memberCount} members
                            </p>
                          </div>
                        </div>
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                      </div>
                    ))}
                    {userCommunities.length > 5 && (
                      <Button variant="ghost" className="w-full">
                        View all communities
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">You haven&apos;t joined any communities yet</p>
                    <Button className="mt-4" onClick={() => setActiveTab('discover')}>
                      Discover Communities
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recommended Communities */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5" />
                  Recommended for You
                </CardTitle>
              </CardHeader>
              <CardContent>
                {recommendedLoading ? (
                  <div className="space-y-3">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <Skeleton key={i} className="h-20" />
                    ))}
                  </div>
                ) : recommendedCommunities && recommendedCommunities.length > 0 ? (
                  <div className="space-y-3">
                    {recommendedCommunities.slice(0, 3).map((community: Community) => (
                      <div key={community.id} className="p-3 rounded-lg border">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-green-500 to-blue-500 flex items-center justify-center text-white font-semibold">
                              {community.name.charAt(0)}
                            </div>
                            <div>
                              <p className="font-medium">{community.name}</p>
                              <p className="text-sm text-muted-foreground">
                                {community.memberCount} members
                              </p>
                            </div>
                          </div>
                          {community.compatibilityScore && (
                            <Badge variant="secondary">
                              {community.compatibilityScore}% match
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">
                          {community.description}
                        </p>
                        <Button 
                          size="sm" 
                          className="w-full"
                          onClick={() => handleJoinCommunity(community.id)}
                        >
                          <UserPlus className="h-4 w-4 mr-1" />
                          Join Community
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Star className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No recommendations available</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Discover Tab */}
        <TabsContent value="discover" className="space-y-6">
          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <input
                type="text"
                placeholder="Search communities..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-full h-10 px-3 border border-input bg-background rounded-md"
              />
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="h-10 px-3 border border-input bg-background rounded-md"
            >
              <option value="all">All Categories</option>
              <option value="anxiety">Anxiety Support</option>
              <option value="depression">Depression Support</option>
              <option value="mindfulness">Mindfulness</option>
              <option value="relationships">Relationships</option>
              <option value="therapy">Therapy Discussion</option>
            </select>
          </div>

          {/* Community Grid - Will be populated by CommunityCard components */}
          <div className="text-center py-8">
            <p className="text-muted-foreground">Community discovery will be implemented with CommunityCard components</p>
          </div>
        </TabsContent>

        {/* Recent Activity Tab */}
        <TabsContent value="activity">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              {activityLoading ? (
                <div className="space-y-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-16" />
                  ))}
                </div>
              ) : recentActivity && recentActivity.length > 0 ? (
                <div className="space-y-4">
                  {recentActivity.map((activity: RecentActivity) => (
                    <div key={activity.id} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-accent/50">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-accent flex items-center justify-center">
                        {getActivityIcon(activity.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm">
                          <span className="font-medium">{activity.user.name}</span>{' '}
                          {getActivityText(activity)}
                        </p>
                        {activity.content && (
                          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                            {activity.content}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No recent activity</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}