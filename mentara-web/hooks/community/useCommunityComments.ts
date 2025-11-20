import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useApi } from "@/lib/api";
import { queryKeys } from "@/lib/queryKeys";
import { STALE_TIME, GC_TIME } from "@/lib/constants/react-query";
import { toast } from "sonner";
import { MentaraApiError } from "@/lib/api/errorHandler";
import type { CreateCommentRequest } from "@/types/api/communities";
import type { Comment } from "@/types/api/comments";

/**
 * Hook for managing comments on a specific post
 */
export function useCommunityComments(postId: string) {
  const api = useApi();
  const queryClient = useQueryClient();

  // Get comments for a post
  const {
    data: comments,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: [...queryKeys.communities.all, 'comments', 'byPost', postId],
    queryFn: () => api.communities.getCommentsByPost(postId),
    enabled: !!postId,
    staleTime: STALE_TIME.SHORT, // 2 minutes
    gcTime: GC_TIME.MEDIUM, // 10 minutes
    refetchOnWindowFocus: false,
  });

  // Create comment mutation
  const createCommentMutation = useMutation({
    mutationFn: (data: CreateCommentRequest) => api.communities.createComment(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...queryKeys.communities.all, 'comments', 'byPost', postId] });
      queryClient.invalidateQueries({ queryKey: queryKeys.communities.roomPosts(postId) });
      toast.success("Comment added successfully");
    },
    onError: (error: MentaraApiError) => {
      toast.error("Failed to add comment");
    },
  });

  // Update comment mutation
  const updateCommentMutation = useMutation({
    mutationFn: ({ commentId, content }: { commentId: string; content: string }) =>
      api.communities.updateComment(commentId, content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', 'byPost', postId] });
      toast.success("Comment updated successfully");
    },
    onError: (error: MentaraApiError) => {
      toast.error("Failed to update comment");
    },
  });

  // Delete comment mutation
  const deleteCommentMutation = useMutation({
    mutationFn: (commentId: string) => api.communities.deleteComment(commentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...queryKeys.communities.all, 'comments', 'byPost', postId] });
      queryClient.invalidateQueries({ queryKey: queryKeys.communities.roomPosts(postId) });
      toast.success("Comment deleted successfully");
    },
    onError: (error: MentaraApiError) => {
      toast.error("Failed to delete comment");
    },
  });

  // Heart comment mutation
  const heartCommentMutation = useMutation({
    mutationFn: (commentId: string) => api.communities.heartComment(commentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', 'byPost', postId] });
    },
    onError: (error: MentaraApiError) => {
      toast.error("Failed to heart comment");
    },
  });

  // Unheart comment mutation
  const unheartCommentMutation = useMutation({
    mutationFn: (commentId: string) => api.communities.unheartComment(commentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', 'byPost', postId] });
    },
    onError: (error: MentaraApiError) => {
      toast.error("Failed to unheart comment");
    },
  });

  // Replies are now handled as nested comments using createComment with parentId

  return {
    comments: comments || [],
    isLoading,
    error,
    refetch,
    
    // Comment operations (now handles both top-level and nested comments via parentId)
    createComment: (data: CreateCommentRequest) => createCommentMutation.mutate(data),
    updateComment: (commentId: string, content: string) =>
      updateCommentMutation.mutate({ commentId, content }),
    deleteComment: (commentId: string) => deleteCommentMutation.mutate(commentId),
    heartComment: (commentId: string) => heartCommentMutation.mutate(commentId),
    unheartComment: (commentId: string) => unheartCommentMutation.mutate(commentId),
    
    // Loading states
    isCreatingComment: createCommentMutation.isPending,
    isUpdatingComment: updateCommentMutation.isPending,
    isDeletingComment: deleteCommentMutation.isPending,
    isHeartingComment: heartCommentMutation.isPending,
    isUnheartingComment: unheartCommentMutation.isPending,
  };
}