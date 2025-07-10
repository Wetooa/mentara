import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useApi } from "@/lib/api";
import { queryKeys } from "@/lib/queryKeys";
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
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Get all available communities
  const {
    data: allCommunities,
    isLoading: isLoadingAllCommunities,
    error: allCommunitiesError,
  } = useQuery({
    queryKey: queryKeys.communities.all(),
    queryFn: () => api.communities.getAllCommunities(),
    staleTime: 1000 * 60 * 10, // 10 minutes
  });

  // Join community mutation
  const joinCommunityMutation = useMutation({
    mutationFn: (communityId: string) => api.communities.joinCommunity(communityId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.communities.all });
      toast.success("Successfully joined community");
    },
    onError: (error: MentaraApiError) => {
      toast.error("Failed to join community");
    },
  });

  // Leave community mutation
  const leaveCommunityMutation = useMutation({
    mutationFn: (communityId: string) => api.communities.leaveCommunity(communityId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.communities.all });
      toast.success("Successfully left community");
    },
    onError: (error: MentaraApiError) => {
      toast.error("Failed to leave community");
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
  const {
    data: posts,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: roomId 
      ? queryKeys.communities.roomPosts(roomId)
      : queryKeys.communities.posts(communityId || ''),
    queryFn: () => roomId 
      ? api.communities.getPostsByRoom(roomId)
      : api.communities.getPostsByRoom(''), // Note: No direct community posts endpoint
    enabled: !!(communityId || roomId),
    staleTime: 1000 * 60 * 2, // 2 minutes
  });

  // Create post mutation
  const createPostMutation = useMutation({
    mutationFn: ({ content, attachments }: { content: string; attachments?: PostAttachment[] }) =>
      api.communities.createPost({ 
        roomId: roomId || '', 
        content, 
        attachments 
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.communities.all });
      toast.success("Post created successfully");
    },
    onError: (error: MentaraApiError) => {
      toast.error("Failed to create post");
    },
  });

  // Heart post mutation
  const heartPostMutation = useMutation({
    mutationFn: (postId: string) => api.communities.heartPost(postId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.communities.all });
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