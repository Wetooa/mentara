import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useApi } from "@/lib/api";
import { toast } from "sonner";
import { MentaraApiError } from "@/lib/api/errorHandler";

/**
 * Hook for managing community assignments and recommendations
 */
export function useCommunityAssignment() {
  const api = useApi();
  const queryClient = useQueryClient();

  // Get recommended communities for current user
  const {
    data: recommendedCommunities,
    isLoading: isLoadingRecommendations,
    error: recommendationsError,
    refetch: refetchRecommendations,
  } = useQuery({
    queryKey: ['communities', 'assignment', 'recommendations'],
    queryFn: () => api.communities.getMyRecommendedCommunities(),
    staleTime: 1000 * 60 * 30, // 30 minutes
  });

  // Assign communities to current user
  const assignToMeMutation = useMutation({
    mutationFn: () => api.communities.assignCommunitiesToMe(),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['communities', 'memberships', 'my'] });
      queryClient.invalidateQueries({ queryKey: ['communities', 'assignment', 'recommendations'] });
      toast.success(`Assigned to ${data.assignedCommunities.length} communities`);
    },
    onError: (error: MentaraApiError) => {
      toast.error("Failed to assign communities");
    },
  });

  // Assign communities to specific user (admin feature)
  const assignToUserMutation = useMutation({
    mutationFn: (userId: string) => api.communities.assignCommunitiesToUser(userId),
    onSuccess: (data, userId) => {
      queryClient.invalidateQueries({ 
        queryKey: ['communities', 'memberships', 'byUser', userId] 
      });
      toast.success(`Assigned ${data.assignedCommunities.length} communities to user`);
    },
    onError: (error: MentaraApiError) => {
      toast.error("Failed to assign communities to user");
    },
  });

  // Bulk assign communities to multiple users (admin feature)
  const bulkAssignMutation = useMutation({
    mutationFn: (userIds: string[]) => api.communities.bulkAssignCommunities(userIds),
    onSuccess: (data) => {
      // Invalidate memberships for all affected users
      Object.keys(data.results).forEach(userId => {
        queryClient.invalidateQueries({ 
          queryKey: ['communities', 'memberships', 'byUser', userId] 
        });
      });
      const totalAssigned = Object.values(data.results).reduce(
        (sum, assignments) => sum + assignments.length, 0
      );
      toast.success(`Bulk assigned ${totalAssigned} communities to ${Object.keys(data.results).length} users`);
    },
    onError: (error: MentaraApiError) => {
      toast.error("Failed to bulk assign communities");
    },
  });

  return {
    recommendedCommunities: recommendedCommunities?.recommendedCommunities || [],
    isLoadingRecommendations,
    recommendationsError,
    refetchRecommendations,
    
    // Assignment operations
    assignToMe: () => assignToMeMutation.mutate(),
    assignToUser: (userId: string) => assignToUserMutation.mutate(userId),
    bulkAssign: (userIds: string[]) => bulkAssignMutation.mutate(userIds),
    
    // Loading states
    isAssigningToMe: assignToMeMutation.isPending,
    isAssigningToUser: assignToUserMutation.isPending,
    isBulkAssigning: bulkAssignMutation.isPending,
  };
}