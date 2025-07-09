"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useApi } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import type { Post } from "@/lib/api/services/communities";

export function useCommunityPage() {
  const api = useApi();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  const [selectedCommunityId, setSelectedCommunityId] = useState<string>();
  const [selectedRoomId, setSelectedRoomId] = useState<string>();
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);
  const [newPostTitle, setNewPostTitle] = useState("");
  const [newPostContent, setNewPostContent] = useState("");

  // Get selected community and room info
  const { data: selectedCommunity } = useQuery({
    queryKey: ["community-with-structure", selectedCommunityId],
    queryFn: () => selectedCommunityId ? api.communities.getCommunityWithStructure(selectedCommunityId) : null,
    enabled: !!selectedCommunityId,
  });

  const selectedRoom = selectedCommunity?.roomGroups
    .flatMap(group => group.rooms)
    .find(room => room.id === selectedRoomId);

  // Get posts for selected room
  const { 
    data: postsData, 
    isLoading: postsLoading, 
    error: postsError 
  } = useQuery({
    queryKey: ["room-posts", selectedRoomId],
    queryFn: () => selectedRoomId ? api.communities.getPostsByRoom(selectedRoomId) : null,
    enabled: !!selectedRoomId,
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Get community stats
  const { data: communityStats } = useQuery({
    queryKey: ["community-stats"],
    queryFn: () => api.communities.getCommunityStats(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Create post mutation
  const createPostMutation = useMutation({
    mutationFn: (data: { title: string; content: string; roomId: string }) =>
      api.communities.createPost(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["room-posts", selectedRoomId] });
      setNewPostTitle("");
      setNewPostContent("");
      setIsCreatePostOpen(false);
      toast.success("Post created successfully!");
    },
    onError: (error: unknown) => {
      const errorMessage = error && typeof error === 'object' && 'response' in error 
        ? (error.response as { data?: { message?: string } })?.data?.message 
        : 'Failed to create post';
      toast.error(errorMessage);
    },
  });

  // Heart post mutation
  const heartPostMutation = useMutation({
    mutationFn: ({ postId, isHearted }: { postId: string; isHearted: boolean }) =>
      isHearted ? api.communities.unheartPost(postId) : api.communities.heartPost(postId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["room-posts", selectedRoomId] });
    },
  });

  const handleCommunitySelect = (communityId: string) => {
    setSelectedCommunityId(communityId);
  };

  const handleRoomSelect = (roomId: string, communityId: string) => {
    setSelectedRoomId(roomId);
    setSelectedCommunityId(communityId);
  };

  const handleCreatePost = () => {
    if (!selectedRoomId || !newPostTitle.trim() || !newPostContent.trim()) {
      toast.error("Please fill in all fields");
      return;
    }

    createPostMutation.mutate({
      title: newPostTitle.trim(),
      content: newPostContent.trim(),
      roomId: selectedRoomId,
    });
  };

  const handleHeartPost = (post: Post) => {
    const isHearted = post.hearts.some(heart => heart.userId === user?.id);
    heartPostMutation.mutate({ postId: post.id, isHearted });
  };

  const getUserInitials = (firstName?: string, lastName?: string) => {
    if (!firstName && !lastName) return "U";
    return `${firstName?.[0] || ""}${lastName?.[0] || ""}`.toUpperCase();
  };

  const getRoomBreadcrumb = () => {
    if (!selectedCommunity || !selectedRoom) return null;

    const roomGroup = selectedCommunity.roomGroups.find(group => 
      group.rooms.some(room => room.id === selectedRoomId)
    );

    return {
      communityName: selectedCommunity.name,
      roomGroupName: roomGroup?.name,
      roomName: selectedRoom.name,
      roomPostingRole: selectedRoom.postingRole,
    };
  };

  const retryLoadPosts = () => {
    queryClient.invalidateQueries({ queryKey: ["room-posts", selectedRoomId] });
  };

  const isPostingAllowed = () => {
    return selectedRoom?.postingRole === "member" || user?.role !== "client";
  };

  const isPostHearted = (post: Post) => {
    return post.hearts.some(heart => heart.userId === user?.id);
  };

  return {
    // State
    selectedCommunityId,
    selectedRoomId,
    selectedCommunity,
    selectedRoom,
    isCreatePostOpen,
    newPostTitle,
    newPostContent,
    
    // Data
    postsData,
    postsLoading,
    postsError,
    communityStats,
    
    // Mutations
    createPostMutation,
    heartPostMutation,
    
    // Handlers
    handleCommunitySelect,
    handleRoomSelect,
    handleCreatePost,
    handleHeartPost,
    retryLoadPosts,
    
    // Setters
    setIsCreatePostOpen,
    setNewPostTitle,
    setNewPostContent,
    
    // Utilities
    getUserInitials,
    getRoomBreadcrumb,
    isPostingAllowed,
    isPostHearted,
  };
}