'use client';

import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useApi } from '@/lib/api';
import { queryKeys } from '@/lib/queryKeys';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Users, 
  MessageCircle, 
  TrendingUp, 
  Lock,
  Shield,
  UserPlus,
  UserMinus,
  Star,
  Clock,
  Eye,
  MoreHorizontal
} from 'lucide-react';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

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
  activityLevel: 'low' | 'medium' | 'high';
  moderators: Array<{
    id: string;
    name: string;
    avatarUrl?: string;
  }>;
  recentPosts?: Array<{
    id: string;
    title: string;
    timestamp: string;
  }>;
}

interface CommunityCardProps {
  community: Community;
  variant?: 'default' | 'compact' | 'detailed';
  showActions?: boolean;
  showCompatibility?: boolean;
  onClick?: () => void;
  className?: string;
}

export function CommunityCard({ 
  community, 
  variant = 'default',
  showActions = true,
  showCompatibility = true,
  onClick,
  className = ''
}: CommunityCardProps) {
  const api = useApi();
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);

  const joinMutation = useMutation({
    mutationFn: (communityId: string) => api.communities.join(communityId),
    onSuccess: () => {
      toast.success(`Successfully joined ${community.name}!`);
      queryClient.invalidateQueries({ queryKey: queryKeys.communities.all });
    },
    onError: () => {
      toast.error('Failed to join community. Please try again.');
    },
  });

  const leaveMutation = useMutation({
    mutationFn: (communityId: string) => api.communities.leave(communityId),
    onSuccess: () => {
      toast.success(`Left ${community.name}`);
      queryClient.invalidateQueries({ queryKey: queryKeys.communities.all });
    },
    onError: () => {
      toast.error('Failed to leave community. Please try again.');
    },
  });

  const handleJoin = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (community.isPrivate) {
      // For private communities, we might need a join request flow
      try {
        await api.communities.requestJoin(community.id);
        toast.success('Join request sent!');
      } catch (error) {
        toast.error('Failed to send join request.');
      }
    } else {
      joinMutation.mutate(community.id);
    }
  };

  const handleLeave = async (e: React.MouseEvent) => {
    e.stopPropagation();
    leaveMutation.mutate(community.id);
  };

  const getActivityLevelColor = (level: string) => {
    switch (level) {
      case 'high': return 'text-green-500';
      case 'medium': return 'text-yellow-500';
      case 'low': return 'text-gray-500';
      default: return 'text-gray-500';
    }
  };

  const getActivityLevelText = (level: string) => {
    switch (level) {
      case 'high': return 'Very Active';
      case 'medium': return 'Active';
      case 'low': return 'Quiet';
      default: return 'Unknown';
    }
  };

  const generateAvatarColor = (name: string) => {
    const colors = [
      'from-blue-500 to-purple-500',
      'from-green-500 to-blue-500',
      'from-purple-500 to-pink-500',
      'from-yellow-500 to-orange-500',
      'from-red-500 to-pink-500',
      'from-indigo-500 to-purple-500',
    ];
    const index = name.length % colors.length;
    return colors[index];
  };

  if (variant === 'compact') {
    return (
      <div 
        className={`flex items-center justify-between p-3 rounded-lg border hover:shadow-md transition-shadow cursor-pointer ${className}`}
        onClick={onClick}
      >
        <div className="flex items-center space-x-3">
          {community.avatarUrl ? (
            <Avatar className="h-10 w-10">
              <AvatarImage src={community.avatarUrl} alt={community.name} />
              <AvatarFallback>{community.name.charAt(0)}</AvatarFallback>
            </Avatar>
          ) : (
            <div className={`w-10 h-10 rounded-full bg-gradient-to-r ${generateAvatarColor(community.name)} flex items-center justify-center text-white font-semibold`}>
              {community.name.charAt(0)}
            </div>
          )}
          <div>
            <div className="flex items-center gap-2">
              <p className="font-medium">{community.name}</p>
              {community.isPrivate && <Lock className="h-3 w-3 text-muted-foreground" />}
            </div>
            <p className="text-sm text-muted-foreground">
              {community.memberCount.toLocaleString()} members
            </p>
          </div>
        </div>
        
        {showActions && (
          <Button
            variant={community.isJoined ? "outline" : "default"}
            size="sm"
            onClick={community.isJoined ? handleLeave : handleJoin}
            disabled={joinMutation.isPending || leaveMutation.isPending}
          >
            {community.isJoined ? (
              <>
                <UserMinus className="h-4 w-4 mr-1" />
                Leave
              </>
            ) : (
              <>
                <UserPlus className="h-4 w-4 mr-1" />
                {community.isPrivate ? 'Request' : 'Join'}
              </>
            )}
          </Button>
        )}
      </div>
    );
  }

  return (
    <Card className={`hover:shadow-lg transition-all duration-200 cursor-pointer ${className}`} onClick={onClick}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            {community.avatarUrl ? (
              <Avatar className="h-12 w-12">
                <AvatarImage src={community.avatarUrl} alt={community.name} />
                <AvatarFallback>{community.name.charAt(0)}</AvatarFallback>
              </Avatar>
            ) : (
              <div className={`w-12 h-12 rounded-full bg-gradient-to-r ${generateAvatarColor(community.name)} flex items-center justify-center text-white font-bold text-lg`}>
                {community.name.charAt(0)}
              </div>
            )}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-lg">{community.name}</h3>
                {community.isPrivate && (
                  <Badge variant="secondary" className="text-xs">
                    <Lock className="h-3 w-3 mr-1" />
                    Private
                  </Badge>
                )}
                <Badge variant="outline" className="text-xs">
                  {community.category}
                </Badge>
              </div>
              
              {showCompatibility && community.compatibilityScore && (
                <Badge variant="secondary" className="text-xs">
                  <Star className="h-3 w-3 mr-1" />
                  {community.compatibilityScore}% match
                </Badge>
              )}
            </div>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" onClick={(e) => e.stopPropagation()}>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <Eye className="h-4 w-4 mr-2" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem>
                Report Community
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <p className="text-muted-foreground mb-4 line-clamp-2">
          {community.description}
        </p>
        
        {/* Community Stats */}
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground">
              <Users className="h-4 w-4" />
              <span>{community.memberCount.toLocaleString()}</span>
            </div>
            <p className="text-xs text-muted-foreground">Members</p>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground">
              <MessageCircle className="h-4 w-4" />
              <span>{community.postCount.toLocaleString()}</span>
            </div>
            <p className="text-xs text-muted-foreground">Posts</p>
          </div>
          
          <div className="text-center">
            <div className={`flex items-center justify-center gap-1 text-sm ${getActivityLevelColor(community.activityLevel)}`}>
              <TrendingUp className="h-4 w-4" />
              <span>{getActivityLevelText(community.activityLevel)}</span>
            </div>
            <p className="text-xs text-muted-foreground">Activity</p>
          </div>
        </div>
        
        {/* Moderators */}
        {community.moderators && community.moderators.length > 0 && (
          <div className="mb-4">
            <p className="text-sm text-muted-foreground mb-2">Moderators</p>
            <div className="flex items-center space-x-2">
              {community.moderators.slice(0, 3).map((moderator) => (
                <div key={moderator.id} className="flex items-center gap-1">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={moderator.avatarUrl} alt={moderator.name} />
                    <AvatarFallback className="text-xs">{moderator.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <Shield className="h-3 w-3 text-blue-500" />
                </div>
              ))}
              {community.moderators.length > 3 && (
                <span className="text-xs text-muted-foreground">
                  +{community.moderators.length - 3} more
                </span>
              )}
            </div>
          </div>
        )}
        
        {/* Recent Activity */}
        {variant === 'detailed' && community.recentPosts && community.recentPosts.length > 0 && (
          <div className="mb-4">
            <p className="text-sm text-muted-foreground mb-2">Recent Posts</p>
            <div className="space-y-2">
              {community.recentPosts.slice(0, 2).map((post) => (
                <div key={post.id} className="text-sm">
                  <p className="line-clamp-1">{post.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(post.timestamp), { addSuffix: true })}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Last Activity */}
        <div className="flex items-center justify-between text-xs text-muted-foreground mb-4">
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span>Last activity {formatDistanceToNow(new Date(community.lastActivity), { addSuffix: true })}</span>
          </div>
        </div>
        
        {/* Action Buttons */}
        {showActions && (
          <div className="flex gap-2">
            {community.isJoined ? (
              <>
                <Button 
                  variant="default" 
                  className="flex-1"
                  onClick={(e) => {
                    e.stopPropagation();
                    // Navigate to community
                  }}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  View Community
                </Button>
                <Button
                  variant="outline"
                  onClick={handleLeave}
                  disabled={leaveMutation.isPending}
                >
                  <UserMinus className="h-4 w-4" />
                </Button>
              </>
            ) : (
              <Button
                className="flex-1"
                onClick={handleJoin}
                disabled={joinMutation.isPending}
              >
                {joinMutation.isPending ? (
                  'Joining...'
                ) : (
                  <>
                    <UserPlus className="h-4 w-4 mr-2" />
                    {community.isPrivate ? 'Request to Join' : 'Join Community'}
                  </>
                )}
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}