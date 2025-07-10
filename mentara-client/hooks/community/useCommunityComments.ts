import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useApi } from "@/lib/api";
import { queryKeys } from "@/lib/queryKeys";
import { toast } from "sonner";
import { MentaraApiError } from "@/lib/api/errorHandler";
import type { Comment, CreateCommentRequest, CreateReplyRequest } from "@/types/api/communities";

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
    queryKey: queryKeys.comments.byPost(postId),
    queryFn: () => api.communities.getCommentsByPost(postId),
    enabled: !!postId,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });

  // Create comment mutation
  const createCommentMutation = useMutation({
    mutationFn: (data: CreateCommentRequest) => api.communities.createComment(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.comments.byPost(postId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.posts.all });
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
      queryClient.invalidateQueries({ queryKey: queryKeys.comments.byPost(postId) });
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
      queryClient.invalidateQueries({ queryKey: queryKeys.comments.byPost(postId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.posts.all });
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
      queryClient.invalidateQueries({ queryKey: queryKeys.comments.byPost(postId) });
    },
    onError: (error: MentaraApiError) => {
      toast.error("Failed to heart comment");
    },
  });

  // Unheart comment mutation
  const unheartCommentMutation = useMutation({
    mutationFn: (commentId: string) => api.communities.unheartComment(commentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.comments.byPost(postId) });
    },
    onError: (error: MentaraApiError) => {
      toast.error("Failed to unheart comment");
    },
  });

  // Create reply mutation
  const createReplyMutation = useMutation({
    mutationFn: (data: CreateReplyRequest) => api.communities.createReply(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.comments.byPost(postId) });
      toast.success("Reply added successfully");
    },
    onError: (error: MentaraApiError) => {
      toast.error("Failed to add reply");
    },
  });

  // Update reply mutation
  const updateReplyMutation = useMutation({
    mutationFn: ({ replyId, content }: { replyId: string; content: string }) =>
      api.communities.updateReply(replyId, content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.comments.byPost(postId) });
      toast.success("Reply updated successfully");
    },
    onError: (error: MentaraApiError) => {
      toast.error("Failed to update reply");
    },
  });

  // Delete reply mutation
  const deleteReplyMutation = useMutation({
    mutationFn: (replyId: string) => api.communities.deleteReply(replyId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.comments.byPost(postId) });
      toast.success("Reply deleted successfully");
    },
    onError: (error: MentaraApiError) => {
      toast.error("Failed to delete reply");
    },
  });

  return {
    comments: comments || [],
    isLoading,
    error,
    refetch,
    
    // Comment operations
    createComment: (data: CreateCommentRequest) => createCommentMutation.mutate(data),
    updateComment: (commentId: string, content: string) =>
      updateCommentMutation.mutate({ commentId, content }),
    deleteComment: (commentId: string) => deleteCommentMutation.mutate(commentId),
    heartComment: (commentId: string) => heartCommentMutation.mutate(commentId),
    unheartComment: (commentId: string) => unheartCommentMutation.mutate(commentId),
    
    // Reply operations
    createReply: (data: CreateReplyRequest) => createReplyMutation.mutate(data),
    updateReply: (replyId: string, content: string) =>
      updateReplyMutation.mutate({ replyId, content }),
    deleteReply: (replyId: string) => deleteReplyMutation.mutate(replyId),
    
    // Loading states
    isCreatingComment: createCommentMutation.isPending,
    isUpdatingComment: updateCommentMutation.isPending,
    isDeletingComment: deleteCommentMutation.isPending,
    isHeartingComment: heartCommentMutation.isPending,
    isUnheartingComment: unheartCommentMutation.isPending,
    isCreatingReply: createReplyMutation.isPending,
    isUpdatingReply: updateReplyMutation.isPending,
    isDeletingReply: deleteReplyMutation.isPending,
  };
}