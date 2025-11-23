import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useApi } from "@/lib/api";
import { queryKeys } from "@/lib/queryKeys";
import { STALE_TIME, GC_TIME } from "@/lib/constants/react-query";
import { toast } from "sonner";
import { MentaraApiError } from "@/lib/api/errorHandler";
import type { PostAttachment } from "@/types/api/communities";

/**
 * Hook for managing user's community memberships and interactions
 */
export function useCommunities() {
  const api = useApi();
  const queryClient = useQueryClient();

  // Get user's joined communities
  const {
    data: userCommunities,
    isLoading: isLoadingUserCommunities,
    error: userCommunitiesError,
    refetch: refetchUserCommunities,
  } = useQuery({
    queryKey: queryKeys.communities.userMemberships(),
    queryFn: () => api.communities.getMyMemberships(),
    staleTime: STALE_TIME.MEDIUM, // 5 minutes
    gcTime: GC_TIME.MEDIUM, // 10 minutes
  });

  // Get all available communities
  const {
    data: allCommunities,
    isLoading: isLoadingAllCommunities,
    error: allCommunitiesError,
  } = useQuery({
    queryKey: queryKeys.communities.all,
    queryFn: () => api.communities.getAllCommunities(),
    staleTime: STALE_TIME.LONG, // 10 minutes
    gcTime: GC_TIME.VERY_LONG, // 30 minutes
  });

  // Join community mutation
  const joinCommunityMutation = useMutation({
    mutationFn: (communityId: string) => api.communities.joinCommunity(communityId),
    onSuccess: () => {
      // Invalidate all relevant community-related queries
      queryClient.invalidateQueries({ queryKey: queryKeys.communities.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.communities.userMemberships() });
      queryClient.invalidateQueries({ queryKey: queryKeys.communities.stats() });
      toast.success("Successfully joined community");
    },
    onError: (error: MentaraApiError) => {
      // Provide specific error messages based on the error type
      if (error.status === 409) {
        toast.error("You're already a member of this community");
      } else if (error.status === 404) {
        toast.error("Community not found");
      } else if (error.status === 403) {
        toast.error("You don't have permission to join this community");
      } else {
        toast.error(error.message || "Failed to join community");
      }
    },
  });

  // Leave community mutation
  const leaveCommunityMutation = useMutation({
    mutationFn: (communityId: string) => api.communities.leaveCommunity(communityId),
    onSuccess: () => {
      // Invalidate all relevant community-related queries
      queryClient.invalidateQueries({ queryKey: queryKeys.communities.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.communities.userMemberships() });
      queryClient.invalidateQueries({ queryKey: queryKeys.communities.stats() });
      toast.success("Successfully left community");
    },
    onError: (error: MentaraApiError) => {
      // Provide specific error messages based on the error type
      if (error.status === 404) {
        toast.error("You're not a member of this community or community not found");
      } else if (error.status === 403) {
        toast.error("You don't have permission to leave this community");
      } else {
        toast.error(error.message || "Failed to leave community");
      }
    },
  });

  return {
    userCommunities: userCommunities || [],
    allCommunities: allCommunities || [],
    isLoading: isLoadingUserCommunities || isLoadingAllCommunities,
    error: userCommunitiesError || allCommunitiesError,
    refetchUserCommunities,
    joinCommunity: (id: string) => joinCommunityMutation.mutate(id),
    leaveCommunity: (id: string) => leaveCommunityMutation.mutate(id),
    isJoining: joinCommunityMutation.isPending,
    isLeaving: leaveCommunityMutation.isPending,
  };
}

/**
 * Hook for managing community posts and interactions
 */
export function useCommunityPosts(communityId?: string, roomId?: string) {
  const api = useApi();
  const queryClient = useQueryClient();

  // Get posts for a community or room
  // TODO: CONFUSING/BROKEN - This hook has unclear behavior when used for community-level posts
  // The fallback to getPostsByRoom('') with empty string suggests missing functionality
  // Consider implementing proper community-level post fetching or removing this dual-purpose hook
  const {
    data: posts,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: roomId 
      ? queryKeys.communities.roomPosts(roomId)
      : [...queryKeys.communities.all, 'posts', communityId || ''],
    queryFn: () => roomId 
      ? api.communities.getPostsByRoom(roomId)
      : api.communities.getPostsByRoom(''), // BROKEN: No direct community posts endpoint - this will likely fail
    enabled: !!(communityId || roomId),
    staleTime: STALE_TIME.SHORT, // 2 minutes
    gcTime: GC_TIME.SHORT, // 5 minutes
  });

  // Create post mutation
  // TODO: CONFUSING - This mutation uses roomId || '' which could pass empty string to API
  // This suggests the same broken pattern as the query above - needs proper room validation
  const createPostMutation = useMutation({
    mutationFn: ({ content, attachments }: { content: string; attachments?: PostAttachment[] }) =>
      api.communities.createPost({ 
        roomId: roomId || '', // CONFUSING: Empty string fallback could cause API errors
        content, 
        attachments 
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.communities.all });
      if (roomId) {
        queryClient.invalidateQueries({ queryKey: queryKeys.communities.roomPosts(roomId) });
      }
      toast.success("Post created successfully");
    },
    onError: (error: MentaraApiError) => {
      toast.error("Failed to create post"); // TODO: Could provide more specific error messages
    },
  });

  // Heart post mutation
  const heartPostMutation = useMutation({
    mutationFn: (postId: string) => api.communities.heartPost(postId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.communities.all });
      if (roomId) {
        queryClient.invalidateQueries({ queryKey: queryKeys.communities.roomPosts(roomId) });
      }
    },
    onError: (error: MentaraApiError) => {
      toast.error("Failed to heart post");
    },
  });

  // Unheart post mutation
  const unheartPostMutation = useMutation({
    mutationFn: (postId: string) => api.communities.unheartPost(postId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.communities.all });
      if (roomId) {
        queryClient.invalidateQueries({ queryKey: queryKeys.communities.roomPosts(roomId) });
      }
    },
    onError: (error: MentaraApiError) => {
      toast.error("Failed to unheart post");
    },
  });

  // Add comment mutation
  const addCommentMutation = useMutation({
    mutationFn: ({ postId, content }: { postId: string; content: string }) =>
      api.communities.createComment({ postId, content }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.communities.all });
      if (roomId) {
        queryClient.invalidateQueries({ queryKey: queryKeys.communities.roomPosts(roomId) });
      }
    },
    onError: (error: MentaraApiError) => {
      toast.error("Failed to add comment");
    },
  });

  return {
    posts: posts || [],
    isLoading,
    error,
    refetch,
    createPost: (content: string, attachments?: PostAttachment[]) =>
      createPostMutation.mutate({ content, attachments }),
    heartPost: (postId: string) => heartPostMutation.mutate(postId),
    unheartPost: (postId: string) => unheartPostMutation.mutate(postId),
    addComment: (postId: string, content: string) =>
      addCommentMutation.mutate({ postId, content }),
    isCreatingPost: createPostMutation.isPending,
    isHearting: heartPostMutation.isPending,
    isUnhearting: unheartPostMutation.isPending,
    isAddingComment: addCommentMutation.isPending,
  };
}