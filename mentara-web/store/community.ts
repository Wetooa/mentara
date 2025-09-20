import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Community, Room, CommunityWithStructure } from "@/types/api/communities";
import type { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

export interface CommunityNavigationState {
  // Selected community and room state
  selectedCommunityId?: string;
  selectedRoomId?: string;
  selectedCommunity?: CommunityWithStructure;
  selectedRoom?: Room;
  
  // Actions for setting state
  setCommunity: (communityId: string, community?: CommunityWithStructure) => void;
  setRoom: (roomId: string, communityId: string, room?: Room) => void;
  
  // Navigation actions
  navigateToRoom: (
    roomId: string, 
    communityId: string, 
    router: AppRouterInstance,
    userRole?: string
  ) => void;
  navigateToCommunity: (
    communityId: string, 
    router: AppRouterInstance,
    userRole?: string
  ) => void;
  
  // Utility actions
  reset: () => void;
  getCurrentPath: (userRole?: string) => string;
}

export const useCommunityNavigationStore = create<CommunityNavigationState>()(
  persist(
    (set, get) => ({
      // Initial state
      selectedCommunityId: undefined,
      selectedRoomId: undefined,
      selectedCommunity: undefined,
      selectedRoom: undefined,
      
      // Set community (and optionally the community data)
      setCommunity: (communityId, community) => {
        set((state) => {
          const newState: Partial<CommunityNavigationState> = {
            selectedCommunityId: communityId,
          };
          
          // If community data is provided, store it
          if (community) {
            newState.selectedCommunity = community;
          }
          
          // If changing community, clear room selection unless it belongs to the new community
          if (state.selectedRoomId && community) {
            const roomExists = community.roomGroups
              .flatMap(group => group.rooms)
              .some(room => room.id === state.selectedRoomId);
            
            if (!roomExists) {
              newState.selectedRoomId = undefined;
              newState.selectedRoom = undefined;
            }
          } else if (state.selectedCommunityId !== communityId) {
            // Clear room if switching communities and no community data to verify
            newState.selectedRoomId = undefined;
            newState.selectedRoom = undefined;
          }
          
          return newState;
        });
      },
      
      // Set room (and optionally the room data)
      setRoom: (roomId, communityId, room) => {
        set((state) => {
          const newState: Partial<CommunityNavigationState> = {
            selectedRoomId: roomId,
            selectedCommunityId: communityId,
          };
          
          // If room data is provided, store it
          if (room) {
            newState.selectedRoom = room;
          }
          
          // If community changed, clear community data so it gets refetched
          if (state.selectedCommunityId !== communityId) {
            newState.selectedCommunity = undefined;
          }
          
          return newState;
        });
      },
      
      // Navigate to specific room with state setting
      navigateToRoom: (roomId, communityId, router, userRole = 'client') => {
        const { setRoom } = get();
        setRoom(roomId, communityId);
        router.push(`/${userRole}/community`);
      },
      
      // Navigate to community (clears room selection)
      navigateToCommunity: (communityId, router, userRole = 'client') => {
        const { setCommunity } = get();
        setCommunity(communityId);
        set({ selectedRoomId: undefined, selectedRoom: undefined });
        router.push(`/${userRole}/community`);
      },
      
      // Reset all state
      reset: () => {
        set({
          selectedCommunityId: undefined,
          selectedRoomId: undefined,
          selectedCommunity: undefined,
          selectedRoom: undefined,
        });
      },
      
      // Get current navigation path
      getCurrentPath: (userRole = 'client') => {
        const state = get();
        if (state.selectedRoomId && state.selectedCommunityId) {
          return `/${userRole}/community?room=${state.selectedRoomId}&community=${state.selectedCommunityId}`;
        } else if (state.selectedCommunityId) {
          return `/${userRole}/community?community=${state.selectedCommunityId}`;
        }
        return `/${userRole}/community`;
      },
    }),
    {
      name: "community-navigation-storage",
      partialize: (state) => ({
        selectedCommunityId: state.selectedCommunityId,
        selectedRoomId: state.selectedRoomId,
        // Don't persist the full objects to avoid stale data issues
        // selectedCommunity and selectedRoom will be refetched as needed
      }),
    }
  )
);

// Convenience hook for common community navigation patterns
export const useCommunityNavigation = () => {
  const store = useCommunityNavigationStore();
  
  return {
    // State
    selectedCommunityId: store.selectedCommunityId,
    selectedRoomId: store.selectedRoomId,
    selectedCommunity: store.selectedCommunity,
    selectedRoom: store.selectedRoom,
    
    // Actions
    setCommunity: store.setCommunity,
    setRoom: store.setRoom,
    navigateToRoom: store.navigateToRoom,
    navigateToCommunity: store.navigateToCommunity,
    reset: store.reset,
    getCurrentPath: store.getCurrentPath,
    
    // Computed values
    hasSelection: !!(store.selectedCommunityId || store.selectedRoomId),
    isRoomSelected: !!(store.selectedRoomId && store.selectedCommunityId),
    isCommunitySelected: !!(store.selectedCommunityId && !store.selectedRoomId),
  };
};