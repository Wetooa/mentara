import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useApi } from "@/lib/api";
import { queryKeys } from "@/lib/queryKeys";
import { toast } from "sonner";

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
    queryFn: () => api.communities.getUserMemberships(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Get all available communities
  const {
    data: allCommunities,
    isLoading: isLoadingAllCommunities,
    error: allCommunitiesError,
  } = useQuery({
    queryKey: queryKeys.communities.all(),
    queryFn: () => api.communities.getAll(),
    staleTime: 1000 * 60 * 10, // 10 minutes
  });

  // Join community mutation
  const joinCommunityMutation = useMutation({
    mutationFn: (communityId: string) => api.communities.join(communityId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.communities.all });
      toast.success("Successfully joined community");
    },
    onError: (error: any) => {
      toast.error("Failed to join community");
    },
  });

  // Leave community mutation
  const leaveCommunityMutation = useMutation({
    mutationFn: (communityId: string) => api.communities.leave(communityId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.communities.all });
      toast.success("Successfully left community");
    },
    onError: (error: any) => {
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
      ? api.communities.getRoomPosts(roomId)
      : api.communities.getPosts(communityId || ''),
    enabled: !!(communityId || roomId),
    staleTime: 1000 * 60 * 2, // 2 minutes
  });

  // Create post mutation
  const createPostMutation = useMutation({
    mutationFn: ({ content, attachments }: { content: string; attachments?: any[] }) =>
      roomId 
        ? api.communities.createRoomPost(roomId, content, attachments)
        : api.communities.createPost(communityId || '', content, attachments),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.communities.all });
      toast.success("Post created successfully");
    },
    onError: (error: any) => {
      toast.error("Failed to create post");
    },
  });

  // React to post mutation
  const reactToPostMutation = useMutation({
    mutationFn: ({ postId, reaction }: { postId: string; reaction: string }) =>
      api.communities.reactToPost(postId, reaction),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.communities.all });
    },
    onError: (error: any) => {
      toast.error("Failed to react to post");
    },
  });

  // Add comment mutation
  const addCommentMutation = useMutation({
    mutationFn: ({ postId, content }: { postId: string; content: string }) =>
      api.communities.addComment(postId, content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.communities.all });
    },
    onError: (error: any) => {
      toast.error("Failed to add comment");
    },
  });

  return {
    posts: posts || [],
    isLoading,
    error,
    refetch,
    createPost: (content: string, attachments?: any[]) =>
      createPostMutation.mutate({ content, attachments }),
    reactToPost: (postId: string, reaction: string) =>
      reactToPostMutation.mutate({ postId, reaction }),
    addComment: (postId: string, content: string) =>
      addCommentMutation.mutate({ postId, content }),
    isCreatingPost: createPostMutation.isPending,
    isReacting: reactToPostMutation.isPending,
    isAddingComment: addCommentMutation.isPending,
  };
}