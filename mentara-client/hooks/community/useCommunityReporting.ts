"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useApi } from "@/lib/api";
import { toast } from "sonner";
import { MentaraApiError } from "@/lib/api/errorHandler";

export interface UseReportPostParams {
  postId: string;
  reason: string;
  content?: string;
}

export interface UseReportCommentParams {
  commentId: string;
  reason: string;
  content?: string;
}

/**
 * Hook for reporting community posts
 */
export function useReportPost() {
  const api = useApi();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ postId, reason, content }: UseReportPostParams) => {
      return api.communities.reportPost(postId, reason, content);
    },
    onSuccess: (data) => {
      toast.success("Post reported successfully. Our moderation team will review it shortly.");
      // Invalidate related queries - you might want to refresh post data or reports
      queryClient.invalidateQueries({ queryKey: ['communities', 'posts'] });
      queryClient.invalidateQueries({ queryKey: ['reports'] });
    },
    onError: (error) => {
      console.error("Report post error:", error);
      
      if (error instanceof MentaraApiError) {
        // Handle specific API errors
        switch (error.status) {
          case 404:
            toast.error("Post not found. It may have been deleted.");
            break;
          case 409:
            toast.error("You have already reported this post.");
            break;
          case 429:
            toast.error("Too many reports. Please wait before reporting again.");
            break;
          default:
            toast.error(error.message || "Failed to report post. Please try again.");
        }
      } else {
        toast.error("Failed to report post. Please try again.");
      }
    },
  });
}

/**
 * Hook for reporting community comments
 */
export function useReportComment() {
  const api = useApi();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ commentId, reason, content }: UseReportCommentParams) => {
      return api.communities.reportComment(commentId, reason, content);
    },
    onSuccess: (data) => {
      toast.success("Comment reported successfully. Our moderation team will review it shortly.");
      // Invalidate related queries - you might want to refresh comment data or reports
      queryClient.invalidateQueries({ queryKey: ['communities', 'comments'] });
      queryClient.invalidateQueries({ queryKey: ['reports'] });
    },
    onError: (error) => {
      console.error("Report comment error:", error);
      
      if (error instanceof MentaraApiError) {
        // Handle specific API errors
        switch (error.status) {
          case 404:
            toast.error("Comment not found. It may have been deleted.");
            break;
          case 409:
            toast.error("You have already reported this comment.");
            break;
          case 429:
            toast.error("Too many reports. Please wait before reporting again.");
            break;
          default:
            toast.error(error.message || "Failed to report comment. Please try again.");
        }
      } else {
        toast.error("Failed to report comment. Please try again.");
      }
    },
  });
}

/**
 * Combined hook that provides both post and comment reporting functionality
 */
export function useCommunityReporting() {
  const reportPost = useReportPost();
  const reportComment = useReportComment();

  return {
    // Post reporting
    reportPost: reportPost.mutate,
    reportPostAsync: reportPost.mutateAsync,
    isReportingPost: reportPost.isPending,
    reportPostError: reportPost.error,

    // Comment reporting
    reportComment: reportComment.mutate,
    reportCommentAsync: reportComment.mutateAsync,
    isReportingComment: reportComment.isPending,
    reportCommentError: reportComment.error,

    // Combined loading state
    isReporting: reportPost.isPending || reportComment.isPending,
  };
}