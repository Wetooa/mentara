import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useApi } from "@/lib/api";

import { toast } from "sonner";
import { MentaraApiError } from "@/lib/api/errorHandler";
import type { Room, RoomGroup } from "@/types/api/communities";

/**
 * Hook for managing community rooms and room groups
 */
export function useCommunityRooms(communityId?: string) {
  const api = useApi();
  const queryClient = useQueryClient();

  // Get community with structure (includes room groups and rooms)
  const {
    data: communityWithStructure,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: communityId ? ['communities', 'withStructure', communityId] : ['communities', 'withStructure'],
    queryFn: () => communityId 
      ? api.communities.getCommunityWithStructure(communityId)
      : api.communities.getCommunitiesWithStructure(),
    enabled: !!communityId,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });

  // Create room group mutation
  const createRoomGroupMutation = useMutation({
    mutationFn: ({ name, order }: { name: string; order: number }) =>
      api.communities.createRoomGroup(communityId!, name, order),
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: ['communities', 'withStructure', communityId!] 
      });
      toast.success("Room group created successfully");
    },
    onError: (error: MentaraApiError) => {
      toast.error("Failed to create room group");
    },
  });

  // Create room mutation
  const createRoomMutation = useMutation({
    mutationFn: ({ roomGroupId, name, order }: { roomGroupId: string; name: string; order: number }) =>
      api.communities.createRoom(roomGroupId, name, order),
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: ['communities', 'withStructure', communityId!] 
      });
      toast.success("Room created successfully");
    },
    onError: (error: MentaraApiError) => {
      toast.error("Failed to create room");
    },
  });

  return {
    communityWithStructure,
    roomGroups: communityWithStructure?.roomGroups || [],
    isLoading,
    error,
    refetch,
    createRoomGroup: (name: string, order: number) =>
      createRoomGroupMutation.mutate({ name, order }),
    createRoom: (roomGroupId: string, name: string, order: number) =>
      createRoomMutation.mutate({ roomGroupId, name, order }),
    isCreatingRoomGroup: createRoomGroupMutation.isPending,
    isCreatingRoom: createRoomMutation.isPending,
  };
}

/**
 * Hook for managing rooms within a specific room group
 */
export function useRoomsByGroup(roomGroupId: string) {
  const api = useApi();

  const {
    data: rooms,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['communities', 'rooms', 'byGroup', roomGroupId],
    queryFn: () => api.communities.getRoomsByGroup(roomGroupId),
    enabled: !!roomGroupId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  return {
    rooms: rooms || [],
    isLoading,
    error,
    refetch,
  };
}