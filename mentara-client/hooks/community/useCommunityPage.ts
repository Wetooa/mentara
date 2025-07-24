"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useApi } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { useCommunityNavigation } from "@/store/community";
import { toast } from "sonner";

import { MentaraApiError } from "@/lib/api/errorHandler";
import type { Post } from "@/types/api/communities";

export function useCommunityPage() {
  const api = useApi();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  // Use global state instead of local state
  const {
    selectedCommunityId,
    selectedRoomId,
    selectedCommunity,
    selectedRoom,
    setCommunity,
    setRoom,
  } = useCommunityNavigation();
  
  // Keep local UI state
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);
  const [newPostTitle, setNewPostTitle] = useState("");
  const [newPostContent, setNewPostContent] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  
  // Edit post state
  const [isEditPostOpen, setIsEditPostOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [editPostTitle, setEditPostTitle] = useState("");
  const [editPostContent, setEditPostContent] = useState("");

  // Get selected community data if not already cached in store
  const { data: communityData } = useQuery({
    queryKey: ['communities', 'withStructure', selectedCommunityId!],
    queryFn: () => selectedCommunityId ? api.communities.getCommunityWithStructure(selectedCommunityId) : null,
    enabled: !!selectedCommunityId && !selectedCommunity,
    onSuccess: (data) => {
      // Update the store with fetched community data
      if (data && selectedCommunityId) {
        setCommunity(selectedCommunityId, data);
      }
    },
  });

  // Use community data from store or fallback to fresh query data
  const activeCommunity = selectedCommunity || communityData;
  const activeRoom = selectedRoom || activeCommunity?.roomGroups
    .flatMap(group => group.rooms)
    .find(room => room.id === selectedRoomId);

  // Get posts for selected room
  const { 
    data: postsData, 
    isLoading: postsLoading, 
    error: postsError 
  } = useQuery({
    queryKey: ['communities', 'roomPosts', selectedRoomId!],
    queryFn: () => selectedRoomId ? api.communities.getPostsByRoom(selectedRoomId) : null,
    enabled: !!selectedRoomId,
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Get community stats
  const { data: communityStats } = useQuery({
    queryKey: ['communities', 'stats', 'general'],
    queryFn: () => api.communities.getCommunityStats(),
    staleTime: 1000 * 60 * 15, // 15 minutes - stats don't change frequently
  });

  // Create post mutation
  const createPostMutation = useMutation({
    mutationFn: (data: { title: string; content: string; roomId: string; files?: File[] }) =>
      api.communities.createPost(data),
    onSuccess: () => {
      // Invalidate relevant queries to refresh the data
      queryClient.invalidateQueries({ queryKey: ['communities', 'roomPosts', selectedRoomId!] });
      queryClient.invalidateQueries({ queryKey: ['communities', 'stats', 'general'] });
      setNewPostTitle("");
      setNewPostContent("");
      setSelectedFiles([]);
      setIsCreatePostOpen(false);
      toast.success("Post created successfully!");
    },
    onError: (error: MentaraApiError) => {
      // Provide specific error messages based on the error type
      if (error.status === 403) {
        toast.error("You don't have permission to post in this room");
      } else if (error.status === 404) {
        toast.error("Room not found");
      } else if (error.status === 400) {
        toast.error("Please check your post content and try again");
      } else {
        toast.error(error.message || "Failed to create post");
      }
    },
  });

  // Heart post mutation
  const heartPostMutation = useMutation({
    mutationFn: ({ postId, isHearted }: { postId: string; isHearted: boolean }) =>
      isHearted ? api.communities.unheartPost(postId) : api.communities.heartPost(postId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['communities', 'roomPosts', selectedRoomId!] });
    },
  });

  // Edit post mutation
  const editPostMutation = useMutation({
    mutationFn: ({ postId, postData }: { postId: string; postData: { title?: string; content?: string } }) =>
      api.communities.updatePost(postId, postData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['communities', 'roomPosts', selectedRoomId!] });
      setIsEditPostOpen(false);
      setEditingPost(null);
      setEditPostTitle("");
      setEditPostContent("");
      toast.success("Post updated successfully!");
    },
    onError: (error: MentaraApiError) => {
      if (error.status === 403) {
        toast.error("You can only edit your own posts");
      } else if (error.status === 404) {
        toast.error("Post not found");
      } else {
        toast.error(error.message || "Failed to update post");
      }
    },
  });

  // Delete post mutation
  const deletePostMutation = useMutation({
    mutationFn: (postId: string) => api.communities.deletePost(postId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['communities', 'roomPosts', selectedRoomId!] });
      queryClient.invalidateQueries({ queryKey: ['communities', 'stats', 'general'] });
      toast.success("Post deleted successfully!");
    },
    onError: (error: MentaraApiError) => {
      if (error.status === 403) {
        toast.error("You can only delete your own posts");
      } else if (error.status === 404) {
        toast.error("Post not found");
      } else {
        toast.error(error.message || "Failed to delete post");
      }
    },
  });

  const handleCommunitySelect = (communityId: string) => {
    setCommunity(communityId);
  };

  const handleRoomSelect = (roomId: string, communityId: string) => {
    setRoom(roomId, communityId);
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
      files: selectedFiles.length > 0 ? selectedFiles : undefined,
    });
  };

  const handleFileSelect = (files: FileList) => {
    const newFiles = Array.from(files);
    const validFiles = newFiles.filter(file => {
      // Basic file validation
      const maxSize = 10 * 1024 * 1024; // 10MB
      const allowedTypes = ['image/', 'application/pdf', 'text/', 'video/', 'audio/'];
      
      if (file.size > maxSize) {
        toast.error(`File ${file.name} is too large. Max size is 10MB.`);
        return false;
      }
      
      if (!allowedTypes.some(type => file.type.startsWith(type))) {
        toast.error(`File ${file.name} has an unsupported format.`);
        return false;
      }
      
      return true;
    });

    setSelectedFiles(prev => [...prev, ...validFiles].slice(0, 5)); // Max 5 files
  };

  const handleFileRemove = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleHeartPost = (post: Post) => {
    const isHearted = post.hearts.some(heart => heart.userId === user?.id);
    heartPostMutation.mutate({ postId: post.id, isHearted });
  };

  const handleEditPost = (post: Post) => {
    setEditingPost(post);
    setEditPostTitle((post as any).title || "");
    setEditPostContent((post as any).content || "");
    setIsEditPostOpen(true);
  };

  const handleUpdatePost = () => {
    if (!editingPost || !editPostTitle.trim() || !editPostContent.trim()) {
      toast.error("Please fill in all fields");
      return;
    }

    editPostMutation.mutate({
      postId: editingPost.id,
      postData: {
        title: editPostTitle.trim(),
        content: editPostContent.trim(),
      },
    });
  };

  const handleDeletePost = (postId: string) => {
    if (window.confirm("Are you sure you want to delete this post? This action cannot be undone.")) {
      deletePostMutation.mutate(postId);
    }
  };

  const isPostOwner = (post: Post) => {
    return post.userId === user?.id;
  };

  const getUserInitials = (firstName?: string, lastName?: string) => {
    if (!firstName && !lastName) return "U";
    return `${firstName?.[0] || ""}${lastName?.[0] || ""}`.toUpperCase();
  };

  const getRoomBreadcrumb = () => {
    // TODO: CONFUSING - This function returns null when no room is selected, but components using it
    // may not handle null properly. Consider returning empty object or default values instead
    if (!activeCommunity || !activeRoom) return null;

    const roomGroup = activeCommunity.roomGroups.find(group => 
      group.rooms.some(room => room.id === selectedRoomId)
    );

    return {
      communityName: activeCommunity.name,
      roomGroupName: roomGroup?.name, // Could be undefined if room not found in any group
      roomName: activeRoom.name,
      roomPostingRole: activeRoom.postingRole,
    };
  };

  const retryLoadPosts = () => {
    queryClient.invalidateQueries({ queryKey: ['communities', 'roomPosts', selectedRoomId!] });
  };

  const isPostingAllowed = () => {
    if (!activeRoom || !user?.role) return false;
    
    // Define role hierarchy for posting permissions
    const roleHierarchy = {
      'client': 0,
      'therapist': 1,
      'moderator': 2,
      'admin': 3
    };
    
    const userRoleLevel = roleHierarchy[user.role as keyof typeof roleHierarchy];
    
    // Check what role is required to post in this room
    switch (activeRoom.postingRole) {
      case 'member':
        // Any authenticated user can post (all roles >= client)
        return userRoleLevel >= 0;
      case 'therapist':
        // Only therapists and above can post
        return userRoleLevel >= 1;
      case 'moderator':
        // Only moderators and above can post
        return userRoleLevel >= 2;
      case 'admin':
        // Only admins can post
        return userRoleLevel >= 3;
      default:
        // Default to requiring member role for unknown posting roles
        return userRoleLevel >= 0;
    }
  };

  const isPostHearted = (post: Post) => {
    return post.hearts.some(heart => heart.userId === user?.id);
  };

  return {
    // State (using active data that combines store and fresh queries)
    selectedCommunityId,
    selectedRoomId,
    selectedCommunity: activeCommunity,
    selectedRoom: activeRoom,
    isCreatePostOpen,
    newPostTitle,
    newPostContent,
    selectedFiles,
    
    // Edit state
    isEditPostOpen,
    editingPost,
    editPostTitle,
    editPostContent,
    
    // Data
    postsData,
    postsLoading,
    postsError,
    communityStats,
    
    // Mutations
    createPostMutation,
    heartPostMutation,
    editPostMutation,
    deletePostMutation,
    
    // Handlers
    handleCommunitySelect,
    handleRoomSelect,
    handleCreatePost,
    handleHeartPost,
    handleEditPost,
    handleUpdatePost,
    handleDeletePost,
    handleFileSelect,
    handleFileRemove,
    retryLoadPosts,
    
    // Setters
    setIsCreatePostOpen,
    setNewPostTitle,
    setNewPostContent,
    setIsEditPostOpen,
    setEditPostTitle,
    setEditPostContent,
    
    // Utilities
    getUserInitials,
    getRoomBreadcrumb,
    isPostingAllowed,
    isPostHearted,
    isPostOwner,
  };
}