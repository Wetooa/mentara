"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useApi } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

import { MentaraApiError } from "@/lib/api/errorHandler";
import type { Post } from "@/types/api/posts";

export function usePostDetail(postId: string) {
  const api = useApi();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  // Fetch post data
  const {
    data: post,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["post", postId],
    queryFn: async () => {
      const result = await api.communities.getPost(postId);
      console.log("API returned:", result); // Check what API actually returns
      return result;
    },
    retry: (failureCount, error) => {
      // Don't retry on 404 or auth errors
      if (error instanceof MentaraApiError) {
        if (
          error.status === 404 ||
          error.status === 401 ||
          error.status === 403
        ) {
          return false;
        }
      }
      return failureCount < 3;
    },
  });

  // Heart post mutation
  const heartMutation = useMutation({
    mutationFn: (postId: string) =>
      post?.isHearted
        ? api.communities.unheartPost(postId)
        : api.communities.heartPost(postId),
    onMutate: async (postId) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["post", postId] });

      // Snapshot the previous value
      const previousPost = queryClient.getQueryData<Post>(["post", postId]);

      // Optimistically update the cache
      if (previousPost) {
        const newHeartCount = previousPost.isHearted
          ? previousPost.heartCount - 1
          : previousPost.heartCount + 1;

        queryClient.setQueryData<Post>(["post", postId], {
          ...previousPost,
          isHearted: !previousPost.isHearted,
          heartCount: newHeartCount,
        });
      }

      // Return context with the snapshotted value
      return { previousPost };
    },
    onError: (error, postId, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousPost) {
        queryClient.setQueryData(["post", postId], context.previousPost);
      }
      toast.error("Failed to update heart");
    },
    onSuccess: () => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      queryClient.invalidateQueries({ queryKey: ["community"] });
    },
  });

  // Update post mutation
  const updateMutation = useMutation({
    mutationFn: ({
      postId,
      data,
    }: {
      postId: string;
      data: { title?: string; content?: string };
    }) => api.communities.updatePost(postId, data),
    onSuccess: (updatedPost) => {
      // Update the cache with the new post data
      queryClient.setQueryData<Post>(["post", postId], updatedPost);

      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      queryClient.invalidateQueries({ queryKey: ["community"] });

      toast.success("Post updated successfully");
    },
    onError: (error) => {
      console.error("Error updating post:", error);
      if (error instanceof MentaraApiError) {
        toast.error(error.message || "Failed to update post");
      } else {
        toast.error("Failed to update post");
      }
    },
  });

  // Delete post mutation
  const deleteMutation = useMutation({
    mutationFn: (postId: string) => api.communities.deletePost(postId),
    onSuccess: () => {
      // Remove the post from cache
      queryClient.removeQueries({ queryKey: ["post", postId] });

      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      queryClient.invalidateQueries({ queryKey: ["community"] });

      toast.success("Post deleted successfully");
    },
    onError: (error) => {
      console.error("Error deleting post:", error);
      if (error instanceof MentaraApiError) {
        toast.error(error.message || "Failed to delete post");
      } else {
        toast.error("Failed to delete post");
      }
    },
  });

  // Helper functions
  const heartPost = () => {
    if (!post) return;
    heartMutation.mutate(post.id);
  };

  const updatePost = (data: { title?: string; content?: string }) => {
    if (!post) return;
    updateMutation.mutate({ postId: post.id, data });
  };

  const deletePost = () => {
    if (!post) return;
    deleteMutation.mutate(post.id);
  };

  const isOwner = user?.id === post?.author.id;

  return {
    // Data
    post,
    isLoading,
    isError,
    error,

    // Computed values
    isOwner,

    // Actions
    heartPost,
    updatePost,
    deletePost,
    refetch,

    // Mutation states
    isHearting: heartMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,

    // Mutation objects for advanced usage
    heartMutation,
    updateMutation,
    deleteMutation,
  };
}

export type UsePostDetailReturn = ReturnType<typeof usePostDetail>;
