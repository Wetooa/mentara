import { useState } from 'react';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { useApi } from '@/lib/api';
import { queryKeys } from '@/lib/queryKeys';
import { STALE_TIME, GC_TIME, REFETCH_INTERVAL } from '@/lib/constants/react-query';
import { toast } from 'sonner';

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
    avatar?: string;
  }>;
}

interface RecentActivity {
  id: string;
  type: 'post' | 'comment' | 'join' | 'like';
  user: {
    id: string;
    name: string;
    avatar?: string;
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

interface UseCommunityDashboardReturn {
  // State
  activeTab: 'overview' | 'discover' | 'activity';
  setActiveTab: (tab: 'overview' | 'discover' | 'activity') => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  
  // Data
  userCommunities: Community[] | undefined;
  recommendedCommunities: Community[] | undefined;
  recentActivity: RecentActivity[] | undefined;
  stats: CommunityStats | undefined;
  
  // Loading states
  isLoading: boolean;
  communitiesLoading: boolean;
  recommendedLoading: boolean;
  activityLoading: boolean;
  statsLoading: boolean;
  
  // Actions
  joinCommunity: (communityId: string) => Promise<void>;
  leaveCommunity: (communityId: string) => Promise<void>;
  
  // Mutations
  isJoining: boolean;
  isLeaving: boolean;
  
  // Utilities
  getActivityIcon: (type: string) => React.ReactNode;
  getActivityText: (activity: RecentActivity) => string;
}

export function useCommunityDashboard(): UseCommunityDashboardReturn {
  const api = useApi();
  const queryClient = useQueryClient();
  
  // Local state
  const [activeTab, setActiveTab] = useState<'overview' | 'discover' | 'activity'>('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Fetch user's communities
  const { data: userCommunities, isLoading: communitiesLoading } = useQuery({
    queryKey: queryKeys.communities.joined(),
    queryFn: () => api.communities.getJoined(),
    staleTime: STALE_TIME.MEDIUM, // 5 minutes
    gcTime: GC_TIME.MEDIUM, // 10 minutes
    refetchOnWindowFocus: false,
  });

  // Fetch recommended communities
  const { data: recommendedCommunities, isLoading: recommendedLoading } = useQuery({
    queryKey: queryKeys.communities.recommended(),
    queryFn: () => api.communities.getRecommended(),
    staleTime: STALE_TIME.LONG, // 10 minutes
    gcTime: GC_TIME.VERY_LONG, // 30 minutes
    refetchOnWindowFocus: false,
  });

  // Fetch recent activity
  const { data: recentActivity, isLoading: activityLoading } = useQuery({
    queryKey: queryKeys.communities.activity(),
    queryFn: () => api.communities.getRecentActivity(),
    refetchInterval: REFETCH_INTERVAL.FREQUENT, // Refresh every 1 minute (approximate)
    staleTime: STALE_TIME.VERY_SHORT, // 30 seconds
    gcTime: GC_TIME.SHORT, // 5 minutes
    refetchOnWindowFocus: true, // Refetch on focus for activity
  });

  // Fetch community stats
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: queryKeys.communities.stats(),
    queryFn: () => api.communities.getStats(),
    staleTime: STALE_TIME.MEDIUM, // 5 minutes
    gcTime: GC_TIME.MEDIUM, // 10 minutes
    refetchOnWindowFocus: false,
  });

  // Join community mutation
  const joinCommunityMutation = useMutation({
    mutationFn: (communityId: string) => api.communities.join(communityId),
    onSuccess: () => {
      toast.success('Successfully joined community!');
      queryClient.invalidateQueries({ queryKey: queryKeys.communities.all });
    },
    onError: () => {
      toast.error('Failed to join community. Please try again.');
    },
  });

  // Leave community mutation
  const leaveCommunityMutation = useMutation({
    mutationFn: (communityId: string) => api.communities.leave(communityId),
    onSuccess: () => {
      toast.success('Successfully left community');
      queryClient.invalidateQueries({ queryKey: queryKeys.communities.all });
    },
    onError: () => {
      toast.error('Failed to leave community. Please try again.');
    },
  });

  const joinCommunity = async (communityId: string): Promise<void> => {
    await joinCommunityMutation.mutateAsync(communityId);
  };

  const leaveCommunity = async (communityId: string): Promise<void> => {
    await leaveCommunityMutation.mutateAsync(communityId);
  };

  const getActivityIcon = (type: string): React.ReactNode => {
    // This will be imported in the component that uses the hook
    const iconMap = {
      post: 'MessageCircle',
      comment: 'MessageCircle', 
      join: 'UserPlus',
      like: 'Star',
      default: 'Activity'
    };
    return iconMap[type as keyof typeof iconMap] || iconMap.default;
  };

  const getActivityText = (activity: RecentActivity): string => {
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
        return `was active in ${activity.community.name}`;
    }
  };

  const isLoading = communitiesLoading || recommendedLoading || activityLoading || statsLoading;

  return {
    // State
    activeTab,
    setActiveTab,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    
    // Data
    userCommunities,
    recommendedCommunities,
    recentActivity,
    stats,
    
    // Loading states
    isLoading,
    communitiesLoading,
    recommendedLoading,
    activityLoading,
    statsLoading,
    
    // Actions
    joinCommunity,
    leaveCommunity,
    
    // Mutations
    isJoining: joinCommunityMutation.isPending,
    isLeaving: leaveCommunityMutation.isPending,
    
    // Utilities
    getActivityIcon,
    getActivityText,
  };
}