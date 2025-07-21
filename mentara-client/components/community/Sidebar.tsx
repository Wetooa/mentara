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
import { Hash, Lock, Users, AlertCircle, Heart, MessageCircle } from "lucide-react";
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
      <div className="w-60 lg:w-60 p-4 bg-community-warm/20 h-full border border-community-calm/30 backdrop-blur-sm">
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
      <div className="w-60 lg:w-60 p-4 bg-community-warm/20 h-full border border-community-calm/30 backdrop-blur-sm">
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
      <div className="w-60 lg:w-60 p-4 bg-community-warm/20 h-full border border-community-calm/30 backdrop-blur-sm">
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
    <div className="w-60 lg:w-60 p-4 bg-community-warm/20 h-full border border-community-calm/30 backdrop-blur-sm overflow-y-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-semibold text-sm text-community-calm-foreground">Your Communities</h2>
        <Badge 
          variant="secondary" 
          className="text-xs bg-community-accent/30 text-community-accent-foreground border-community-accent/40 hover:bg-community-accent/40 transition-colors"
        >
          {communitiesData.length}
        </Badge>
      </div>

      <Accordion type="multiple" value={expandedCommunities} onValueChange={setExpandedCommunities}>
        {communitiesData.map((community: CommunityWithStructure) => (
          <AccordionItem key={community.id} value={community.id} className="border-none mb-2">
            <AccordionTrigger
              className={cn(
                "group font-medium bg-white/70 hover:bg-community-calm/20 rounded-xl px-4 py-3 text-sm no-underline transition-all duration-200 backdrop-blur-sm border border-white/40",
                selectedCommunityId === community.id && 
                "bg-community-accent/20 text-community-accent-foreground hover:bg-community-accent/30 border-community-accent/40 shadow-lg shadow-community-accent/10"
              )}
              onClick={() => {
                onCommunitySelect?.(community.id);
                handleCommunityToggle(community.id);
              }}
            >
              <div className="flex items-center gap-3 text-left w-full">
                <div className={cn(
                  "w-3 h-3 rounded-full shrink-0 transition-colors duration-200",
                  selectedCommunityId === community.id 
                    ? "bg-community-accent animate-pulse" 
                    : "bg-community-heart group-hover:bg-community-accent"
                )} />
                <span className="truncate font-medium">{community.name}</span>
                <div className="ml-auto text-xs text-community-soothing-foreground opacity-60 group-hover:opacity-100 transition-opacity">
                  {community.roomGroups?.reduce((total, group) => total + group.rooms.length, 0) || 0}
                </div>
              </div>
            </AccordionTrigger>

            <AccordionContent className="pb-3">
              <div className="space-y-3 ml-3">
                {community.roomGroups
                  .sort((a, b) => a.order - b.order)
                  .map(roomGroup => (
                    <div key={roomGroup.id} className="space-y-2">
                      <h4 className="text-xs font-semibold text-community-soothing-foreground uppercase tracking-wider px-3 py-1 bg-community-soothing/10 rounded-lg border border-community-soothing/20">
                        {roomGroup.name}
                      </h4>
                      <div className="space-y-1">
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
                                  "group w-full flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-all duration-200 text-left backdrop-blur-sm",
                                  isSelected 
                                    ? "bg-community-accent/30 text-community-accent-foreground shadow-md shadow-community-accent/20 border border-community-accent/40" 
                                    : "hover:bg-community-warm/30 border border-transparent",
                                  !canView && "hidden" // Hide room if can't view (though currently all are viewable)
                                )}
                                title={!canPost ? `${room.name} (View only - moderator/admin posting required)` : `Join ${room.name}`}
                                disabled={false} // Always allow viewing/entering rooms
                              >
                                <div className={cn(
                                  "shrink-0 transition-colors duration-200",
                                  !canPost
                                    ? "text-amber-500"
                                    : isSelected 
                                      ? "text-community-accent-foreground" 
                                      : "text-community-calm-foreground group-hover:text-community-accent"
                                )}>
                                  {canPost ? <Hash className="h-3 w-3" /> : <Lock className="h-3 w-3" />}
                                </div>
                                <span className="truncate font-medium">{room.name}</span>
                                {isSelected && (
                                  <div className="ml-auto w-2 h-2 bg-community-accent rounded-full animate-pulse" />
                                )}
                              </button>
                            );
                          })}
                      </div>
                    </div>
                  ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>

      {/* Channel legend */}
      <div className="mt-6 pt-4 border-t border-community-calm/30">
        <div className="space-y-3">
          <h3 className="text-xs font-semibold text-community-calm-foreground uppercase tracking-wider">
            Channel Types
          </h3>
          <div className="space-y-2 text-xs">
            <div className="flex items-center gap-2 p-2 rounded-lg bg-community-calm/10 border border-community-calm/20">
              <Hash className="h-3 w-3 text-community-calm-foreground" />
              <span className="text-community-calm-foreground">Open to everyone</span>
            </div>
            <div className="flex items-center gap-2 p-2 rounded-lg bg-amber-50/50 border border-amber-200/50">
              <Lock className="h-3 w-3 text-amber-500" />
              <span className="text-amber-700">Restricted access</span>
            </div>
          </div>
          
          <div className="mt-4 p-3 rounded-lg bg-community-soothing/10 border border-community-soothing/20">
            <div className="flex items-center gap-2 mb-2">
              <Heart className="h-3 w-3 text-community-heart" />
              <span className="text-xs font-medium text-community-soothing-foreground">Safe Space</span>
            </div>
            <p className="text-xs text-community-soothing-foreground leading-relaxed">
              All communities are moderated to ensure respectful, supportive conversations.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}