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
import { useAuth } from "@/hooks/useAuth";
import { Hash, Lock, Users, AlertCircle } from "lucide-react";
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

  // Fetch user's community memberships
  const { data: memberships, isLoading: membershipsLoading, error: membershipsError } = useQuery({
    queryKey: ["user-community-memberships"],
    queryFn: () => api.communities.getMyMemberships(),
    enabled: !!user,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Fetch communities with structure for user's joined communities
  const communityIds = memberships?.map(m => m.community.id) || [];
  const { data: communitiesData, isLoading: communitiesLoading } = useQuery({
    queryKey: ["user-communities-with-structure", communityIds],
    queryFn: async () => {
      if (communityIds.length === 0) return [];
      const promises = communityIds.map(id => api.communities.getCommunityWithStructure(id));
      return Promise.all(promises);
    },
    enabled: communityIds.length > 0,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });

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

  // Loading state
  if (membershipsLoading || communitiesLoading) {
    return (
      <div className="w-60 p-4 bg-slate-50 h-full border border-slate-200">
        <div className="space-y-4">
          <Skeleton className="h-6 w-32" />
          <div className="space-y-2">
            {[1, 2, 3].map(i => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-8 w-full" />
                <div className="ml-4 space-y-1">
                  <Skeleton className="h-6 w-24" />
                  <Skeleton className="h-6 w-28" />
                  <Skeleton className="h-6 w-20" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (membershipsError || !communitiesData) {
    return (
      <div className="w-60 p-4 bg-slate-50 h-full border border-slate-200">
        <div className="flex items-center gap-2 text-red-600 mb-4">
          <AlertCircle className="h-4 w-4" />
          <span className="text-sm">Failed to load communities</span>
        </div>
        <p className="text-xs text-neutral-500">
          Please refresh the page or contact support if the issue persists.
        </p>
      </div>
    );
  }

  // No communities state
  if (!communitiesData || communitiesData.length === 0) {
    return (
      <div className="w-60 p-4 bg-slate-50 h-full border border-slate-200">
        <h2 className="font-semibold text-sm text-neutral-800 mb-4">Your Communities</h2>
        <div className="text-center text-neutral-500 text-sm">
          <Users className="h-8 w-8 mx-auto mb-2 text-neutral-400" />
          <p>No communities yet</p>
          <p className="text-xs mt-1">
            Complete your assessment to be assigned to relevant communities.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-60 p-4 bg-slate-50 h-full border border-slate-200 overflow-y-auto">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-sm text-neutral-800">Your Communities</h2>
        <Badge variant="secondary" className="text-xs">
          {communitiesData.length}
        </Badge>
      </div>

      <Accordion type="multiple" value={expandedCommunities} onValueChange={setExpandedCommunities}>
        {communitiesData.map((community: CommunityWithStructure) => (
          <AccordionItem key={community.id} value={community.id} className="border-none">
            <AccordionTrigger
              className={cn(
                "font-medium bg-white hover:bg-slate-100 rounded-lg px-3 py-2 text-sm no-underline transition-colors",
                selectedCommunityId === community.id && "bg-secondary text-white hover:bg-secondary/90"
              )}
              onClick={() => {
                onCommunitySelect?.(community.id);
                handleCommunityToggle(community.id);
              }}
            >
              <div className="flex items-center gap-2 text-left">
                <div className="w-2 h-2 bg-green-500 rounded-full shrink-0" />
                <span className="truncate">{community.name}</span>
              </div>
            </AccordionTrigger>

            <AccordionContent className="pb-2">
              <div className="space-y-1 ml-2">
                {community.roomGroups
                  .sort((a, b) => a.order - b.order)
                  .map(roomGroup => (
                    <div key={roomGroup.id} className="space-y-1">
                      <h4 className="text-xs font-medium text-neutral-600 uppercase tracking-wide px-2 py-1">
                        {roomGroup.name}
                      </h4>
                      {roomGroup.rooms
                        .sort((a, b) => a.order - b.order)
                        .map(room => {
                          const canPost = canPostInRoom(room, community.id);
                          const isSelected = selectedRoomId === room.id;
                          
                          return (
                            <button
                              key={room.id}
                              onClick={() => handleRoomClick(room, community.id)}
                              className={cn(
                                "w-full flex items-center gap-2 px-2 py-1 text-sm rounded hover:bg-slate-200 transition-colors text-left",
                                isSelected && "bg-secondary text-white hover:bg-secondary/90",
                                !canPost && "opacity-60"
                              )}
                              title={!canPost ? "You don't have permission to post in this room" : ""}
                            >
                              {getRoomIcon(room)}
                              <span className="truncate">{room.name}</span>
                              {!canPost && (
                                <Lock className="h-3 w-3 ml-auto text-amber-500" />
                              )}
                            </button>
                          );
                        })}
                    </div>
                  ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>

      {/* User role info */}
      <div className="mt-4 pt-4 border-t border-slate-200">
        <p className="text-xs text-neutral-500">
          <Hash className="h-3 w-3 inline mr-1" />
          Open channels
        </p>
        <p className="text-xs text-neutral-500">
          <Lock className="h-3 w-3 inline mr-1" />
          Restricted channels
        </p>
      </div>
    </div>
  );
}