"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { useApi } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { Hash, Lock, Users, AlertCircle, Heart, MessageCircle, ChevronDown, ChevronRight } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import type { CommunityWithStructure, Room } from "@/lib/api/services/communities";

interface CommunitySidebarProps {
  selectedCommunityId?: string;
  selectedRoomId?: string;
  onCommunitySelect?: (communityId: string) => void;
  onRoomSelect?: (roomId: string, communityId: string) => void;
}

export default function CommunitySidebar({
  selectedCommunityId,
  selectedRoomId,
  onCommunitySelect,
  onRoomSelect,
}: CommunitySidebarProps) {
  const api = useApi();
  const { user } = useAuth();
  const [expandedCommunities, setExpandedCommunities] = useState<string[]>([]);
  const [collapsedRoomGroups, setCollapsedRoomGroups] = useState<string[]>([]); // Track collapsed room groups

  // Fetch user's communities with structure in one batch call (optimized for performance)
  const { 
    data: communitiesData, 
    isLoading: communitiesLoading, 
    error: communitiesError 
  } = useQuery({
    queryKey: ["communities", "my-with-structure"],
    queryFn: () => api.communities.getMyCommunitiesWithStructure(),
    enabled: !!user,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });

  // For backward compatibility with the getUserRole function, extract memberships info from communities
  const memberships = communitiesData?.map(community => ({
    id: `membership-${community.id}`,
    communityId: community.id,
    userId: user?.id || '',
    joinedAt: new Date(), // We don't have this in the batch response, but it's not critical
    community: {
      id: community.id,
      name: community.name,
      slug: community.slug,
      description: community.description,
      imageUrl: community.imageUrl,
    },
    role: 'member', // Default role - this could be enhanced in the API later
  }));

  const membershipsLoading = communitiesLoading;
  const membershipsError = communitiesError;

  const handleCommunityToggle = (communityId: string) => {
    setExpandedCommunities(prev => 
      prev.includes(communityId) 
        ? prev.filter(id => id !== communityId)
        : [...prev, communityId]
    );
  };

  const handleRoomGroupToggle = (roomGroupId: string) => {
    setCollapsedRoomGroups(prev => 
      prev.includes(roomGroupId)
        ? prev.filter(id => id !== roomGroupId)
        : [...prev, roomGroupId]
    );
  };

  const handleRoomClick = (room: Room, communityId: string) => {
    onRoomSelect?.(room.id, communityId);
  };

  const getRoomIcon = (room: Room) => {
    if (room.postingRole === "moderator" || room.postingRole === "admin") {
      return <Lock className="h-3 w-3 text-amber-500" />;
    }
    return <Hash className="h-3 w-3 text-neutral-500" />;
  };

  const getUserRole = (communityId: string): string => {
    const membership = memberships?.find(m => m.community.id === communityId);
    return membership?.role || "member";
  };

  const canPostInRoom = (room: Room, communityId: string): boolean => {
    const userRole = getUserRole(communityId);
    
    if (room.postingRole === "member") return true;
    if (room.postingRole === "moderator") return ["moderator", "admin"].includes(userRole);
    if (room.postingRole === "admin") return userRole === "admin";
    
    return false;
  };

  // Everyone can VIEW all rooms regardless of posting permissions
  const canViewRoom = (room: Room): boolean => {
    return true; // All users can see all rooms
  };

  // Loading state
  if (membershipsLoading || communitiesLoading) {
    return (
      <div className="w-full h-full p-4 bg-community-warm/20 border border-community-calm/30 backdrop-blur-sm min-w-0">
        <div className="space-y-4">
          {/* Header skeleton */}
          <div className="flex items-center justify-between">
            <Skeleton className="h-5 w-32 bg-community-calm/30" />
            <Skeleton className="h-4 w-6 rounded-full bg-community-accent/30" />
          </div>
          
          {/* Community skeletons */}
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="space-y-2 p-2 rounded-lg bg-white/50">
                {/* Community header */}
                <div className="flex items-center gap-2">
                  <Skeleton className="h-2 w-2 rounded-full bg-community-accent/40" />
                  <Skeleton className="h-4 w-24 bg-community-calm/40" />
                </div>
                
                {/* Room skeletons */}
                <div className="ml-4 space-y-1">
                  <Skeleton className="h-3 w-16 bg-community-soothing/30" />
                  {[1, 2].map(j => (
                    <div key={j} className="flex items-center gap-2 ml-2">
                      <Skeleton className="h-3 w-3 bg-community-calm/30" />
                      <Skeleton className="h-3 w-20 bg-community-warm/40" />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          
          {/* Helper text skeleton */}
          <div className="pt-3 border-t border-community-calm/20 space-y-1">
            <Skeleton className="h-3 w-24 bg-community-soothing/30" />
            <Skeleton className="h-3 w-28 bg-community-soothing/30" />
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (membershipsError || !communitiesData) {
    return (
      <div className="w-full h-full p-4 bg-community-warm/20 border border-community-calm/30 backdrop-blur-sm min-w-0">
        <div className="text-center space-y-4">
          <div className="flex flex-col items-center space-y-2">
            <div className="p-3 rounded-full bg-community-heart/20">
              <AlertCircle className="h-6 w-6 text-community-heart" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-community-heart-foreground">Connection Issue</h3>
              <p className="text-xs text-community-calm-foreground mt-1">
                We&apos;re having trouble loading your communities
              </p>
            </div>
          </div>
          
          <div className="p-3 rounded-lg bg-community-soothing/10 border border-community-soothing/20">
            <p className="text-xs text-community-soothing-foreground">
              Your mental health community is important to us. Please try refreshing the page or contact our support team if this continues.
            </p>
          </div>
          
          <button
            onClick={() => window.location.reload()}
            className="w-full px-3 py-2 text-xs bg-community-accent text-community-accent-foreground rounded-lg hover:bg-community-accent/90 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // No communities state
  if (!communitiesData || communitiesData.length === 0) {
    return (
      <div className="w-full h-full p-4 bg-community-warm/20 border border-community-calm/30 backdrop-blur-sm min-w-0">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-semibold text-sm text-community-calm-foreground">Your Communities</h2>
          <Badge variant="secondary" className="text-xs bg-community-calm/20 text-community-calm-foreground border-community-calm/30">
            0
          </Badge>
        </div>
        
        <div className="text-center space-y-4">
          <div className="flex flex-col items-center space-y-3">
            <div className="p-4 rounded-full bg-community-soothing/20 animate-gentle-glow">
              <Heart className="h-8 w-8 text-community-heart" />
            </div>
            <div>
              <h3 className="font-medium text-sm text-community-calm-foreground mb-1">
                Welcome to Your Community Space
              </h3>
              <p className="text-xs text-community-soothing-foreground">
                You&apos;re not in any communities yet
              </p>
            </div>
          </div>
          
          <div className="p-3 rounded-lg bg-community-calm/10 border border-community-calm/20">
            <p className="text-xs text-community-calm-foreground leading-relaxed">
              Complete your mental health assessment to discover supportive communities where you can connect with others who understand your journey.
            </p>
          </div>
          
          <div className="space-y-2 text-xs text-community-soothing-foreground">
            <div className="flex items-center gap-2">
              <Users className="h-3 w-3" />
              <span>Find peer support</span>
            </div>
            <div className="flex items-center gap-2">
              <MessageCircle className="h-3 w-3" />
              <span>Share experiences safely</span>
            </div>
            <div className="flex items-center gap-2">
              <Heart className="h-3 w-3" />
              <span>Build meaningful connections</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full p-4 bg-community-warm/20 border border-community-calm/30 backdrop-blur-sm overflow-y-auto shadow-lg shadow-community-calm/10 mentara-scrollbar min-w-0">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-semibold text-sm text-community-calm-foreground">Your Communities</h2>
        <Badge 
          variant="secondary" 
          className="text-xs bg-community-accent/20 text-community-accent-foreground border-community-accent/30 hover:bg-community-accent/30 transition-colors"
        >
          {communitiesData.length}
        </Badge>
      </div>

      <Accordion type="multiple" value={expandedCommunities} onValueChange={setExpandedCommunities}>
        {communitiesData.map((community: CommunityWithStructure) => (
          <AccordionItem key={community.id} value={community.id} className="border-none mb-2">
            <AccordionTrigger
              className={cn(
                "group font-medium bg-white/70 hover:bg-primary/10 rounded-xl px-4 py-3 text-sm no-underline transition-all duration-200 backdrop-blur-sm border border-border/40 no-underline-hover text-foreground",
                selectedCommunityId === community.id && 
                "bg-primary/15 hover:bg-primary/20 border-primary/40 shadow-lg shadow-primary/10"
              )}
              onClick={() => {
                onCommunitySelect?.(community.id);
                handleCommunityToggle(community.id);
              }}
            >
              <div className="flex items-center gap-3 text-left w-full min-w-0">
                <div className={cn(
                  "w-3 h-3 rounded-full shrink-0 transition-colors duration-200",
                  selectedCommunityId === community.id 
                    ? "bg-primary animate-pulse" 
                    : "bg-primary/60 group-hover:bg-primary"
                )} />
                <span className="truncate font-semibold min-w-0 flex-1">{community.name}</span>
                <div className="ml-auto text-xs text-muted-foreground opacity-60 group-hover:opacity-100 transition-opacity shrink-0">
                  {community.roomGroups?.reduce((total, group) => total + group.rooms.length, 0) || 0}
                </div>
              </div>
            </AccordionTrigger>

            <AccordionContent className="pb-3 pt-2">
              <div className="space-y-3 ml-3 mt-2">
                {community.roomGroups
                  .sort((a, b) => a.order - b.order)
                  .map(roomGroup => {
                    const isCollapsed = collapsedRoomGroups.includes(roomGroup.id);
                    return (
                      <div key={roomGroup.id} className="space-y-2">
                        <button
                          onClick={() => handleRoomGroupToggle(roomGroup.id)}
                          className="w-full text-left group flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 py-1.5 bg-muted/50 rounded-lg border border-border hover:bg-muted hover:text-foreground transition-colors duration-200 no-underline-hover min-w-0"
                        >
                          {isCollapsed ? (
                            <ChevronRight className="h-3 w-3 transition-colors shrink-0" />
                          ) : (
                            <ChevronDown className="h-3 w-3 transition-colors shrink-0" />
                          )}
                          <span className="truncate min-w-0 flex-1">{roomGroup.name}</span>
                          <span className="ml-auto text-xs opacity-60 shrink-0">
                            {roomGroup.rooms.length}
                          </span>
                        </button>
                        <div className={`room-group-content ${!isCollapsed ? 'room-group-content--open' : ''}`}>
                          <div className="space-y-1 ml-2 pl-3 border-l-2 border-primary/30 mt-2">
                        {roomGroup.rooms
                          .sort((a, b) => a.order - b.order)
                          .map(room => {
                            const canPost = canPostInRoom(room, community.id);
                            const canView = canViewRoom(room);
                            const isSelected = selectedRoomId === room.id;
                            
                            return (
                              <button
                                key={room.id}
                                onClick={() => handleRoomClick(room, community.id)}
                                className={cn(
                                  "group w-full flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-all duration-200 text-left no-underline-hover relative min-w-0",
                                  isSelected 
                                    ? "bg-primary/15 text-primary shadow-md shadow-primary/10 border border-primary/40 font-semibold" 
                                    : "hover:bg-muted/70 border border-transparent text-foreground font-medium",
                                  !canView && "hidden" // Hide room if can't view (though currently all are viewable)
                                )}
                                title={!canPost ? `${room.name} (View only - moderator/admin posting required)` : `Join ${room.name}`}
                                disabled={false} // Always allow viewing/entering rooms
                              >
                                <div className={cn(
                                  "shrink-0 transition-colors duration-200",
                                  !canPost
                                    ? "text-amber-600"
                                    : isSelected 
                                      ? "text-primary" 
                                      : "text-muted-foreground group-hover:text-primary"
                                )}>
                                  {canPost ? <Hash className="h-3 w-3" /> : <Lock className="h-3 w-3" />}
                                </div>
                                <span className="truncate min-w-0 flex-1">{room.name}</span>
                                {isSelected && (
                                  <div className="ml-auto w-2 h-2 bg-primary rounded-full animate-pulse shrink-0" />
                                )}
                              </button>
                            );
                          })}
                            </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>

      {/* Channel legend */}
      <div className="mt-6 pt-4 border-t border-border">
        <div className="space-y-3">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Channel Types
          </h3>
          <div className="space-y-2 text-xs">
            <div className="flex items-center gap-2 p-2 rounded-lg bg-primary/10 border border-primary/30">
              <Hash className="h-3 w-3 text-primary" />
              <span className="text-primary font-medium">Open to everyone</span>
            </div>
            <div className="flex items-center gap-2 p-2 rounded-lg bg-amber-50 border border-amber-300">
              <Lock className="h-3 w-3 text-amber-700" />
              <span className="text-amber-800 font-medium">Restricted access</span>
            </div>
          </div>
          
          <div className="mt-4 p-3 rounded-lg bg-secondary/10 border border-secondary/30">
            <div className="flex items-center gap-2 mb-2">
              <Heart className="h-3 w-3 text-destructive" />
              <span className="text-xs font-semibold text-foreground">Safe Space</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              All communities are moderated to ensure respectful, supportive conversations.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}